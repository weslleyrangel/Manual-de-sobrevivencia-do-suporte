# ADP-003: Refinamentos Full-Stack, Performance e Desacoplamento de Queries (Clean Architecture)

## Status
Aceito

## Data
2026-09-04

## Contexto
Após o Code Review completo do ciclo de vida de Perguntas e Soluções (do banco ao front-end), identificamos oportunidades críticas de melhoria arquitetural e de performance:

1. **Acoplamento nos Controllers:** Métodos como `listProblems` e `getProblem` executavam comandos SQL `SELECT` diretamente nos controllers do Express em vez de delegar para repositórios ou serviços de leitura.
2. **Endpoints Faltantes nas Rotas:** Os Casos de Uso de *Aceitar Solução*, *Editar Solução* e *Encerramento Administrativo* foram criados e testados no domínio, mas necessitam de roteamento formal em `routes/problems.js`.
3. **Persistência de Metadados de Encerramento:** A tabela `problems` e a entidade `Pergunta` precisam armazenar e persistir formalmente `closing_reason` (justificativa técnica) e `closed_at` (data de encerramento).
4. **Gargalo de Busca Full-Text:** A busca textual calculava `to_tsvector` dinamicamente a cada requisição sem um índice invertido (GIN), gerando *Sequential Scans* no PostgreSQL.
5. **Tratamento Robusto de Erros:** Substituição de validações de erro baseadas em `error.message.includes(...)` por classes de erro de domínio tipadas (`DomainError`, `UnauthorizedError`, `NotFoundError`, `ValidationError`).

---

## Decisão

Decidimos implementar as seguintes diretrizes arquiteturais:

### 1. Desacoplamento de Queries e Padrão Repository de Leitura (CQRS Leve)
- **Regra:** Nenhum controller do Express deve conter código SQL bruto (`SELECT * FROM ...`).
- **Implementação:**
  - Operações de leitura complexas ou listagens são encapsuladas em métodos semânticos no `PerguntaRepository` (ex: `listWithAuthors({ page, limit })`, `getWithSolutions(id)`).
  - Os Controllers atuam estritamente como adaptadores HTTP: recebem a requisição, chamam o Caso de Uso ou Repositório, e retornam o DTO com o status code correto.

### 2. Mapeamento Completo de Rotas REST
- Registrar os endpoints em `routes/problems.js` com seus respectivos middlewares de autenticação:
  - `PUT /api/v1/problems/:id/solutions/:solutionId/accept` -> `AceitarSolucaoUseCase`
  - `PUT /api/v1/problems/:id/solutions/:solutionId` -> `EditarSolucaoUseCase`
  - `POST /api/v1/problems/:id/close-admin` -> `EncerrarPerguntaAdministrativamenteUseCase`

### 3. Migração do Esquema de Dados (Database)
- Adicionar colunas na tabela `problems`:
  ```sql
  ALTER TABLE problems ADD COLUMN IF NOT EXISTS closing_reason TEXT;
  ALTER TABLE problems ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP;
  ```
- Atualizar a entidade `Pergunta` e o `PerguntaRepository.update()` para persistir e mapear esses campos.

### 4. Otimização de Performance com Índice GIN (PostgreSQL)
- Adicionar índice GIN para busca full-text no idioma português:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_problems_fts ON problems 
  USING gin(to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category, '')));
  ```

### 5. Hierarquia de Erros de Domínio
- Criar classes de erro sob `domain/errors/`:
  - `DomainError` (base)
  - `ValidationError` -> Mapeia para HTTP 400
  - `UnauthorizedError` -> Mapeia para HTTP 401
  - `ForbiddenError` -> Mapeia para HTTP 403
  - `NotFoundError` -> Mapeia para HTTP 404

---

## Alternativas Consideradas

### 1. Manter SQL nos Controllers para "Leituras Rápidas"
- **Rejeitado:** Gera duplicidade de código, dificulta testes unitários e viola a separação de responsabilidades da Clean Architecture.

### 2. Adicionar um ORM Pesado (ex: TypeORM ou Sequelize)
- **Rejeitado:** Adiciona dependências pesadas, overhead no bundle/runtime e overhead de inicialização em containers leves, quando Repositórios puros com `pg` atendem perfeitamente.

---

## Consequências

- **Alta Testabilidade:** Controllers e Repositórios passam a ser testáveis de forma isolada com mocks limpos.
- **Performance Escalável:** O índice GIN reduz o tempo de busca em ordens de grandeza para bases em crescimento.
- **Código Limpo e Manutenível:** Erros tipados eliminam checagens frágeis de texto e evitam respostas HTTP inconsistentes.
