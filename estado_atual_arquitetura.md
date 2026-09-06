# Arquitetura Atual do Sistema
### Manual de Sobrevivência do Suporte — IT Support Knowledge Catalog
> **Documento gerado em:** 06/09/2026 · **Tipo:** Análise As-Is · **Escopo:** Backend + Frontend + Infra

---

## 1. Estrutura de Camadas e Padrões (Clean Architecture / SOLID)

### 1.1. Visão Geral da Organização

O backend segue uma **separação em camadas inspirada em Clean Architecture**, porém aplicada de forma **parcial e pragmática** — nem todas as fatias do sistema passam por todas as camadas. A estrutura física está organizada da seguinte forma:

```
backend/src/
├── domain/              ← Camada mais interna: Entidades e Erros de Domínio
│   ├── entities/        (Pergunta, Solucao, Comentario)
│   └── errors/          (DomainError, ValidationError, ForbiddenError, etc.)
├── application/         ← Casos de Uso (orquestram regras de negócio)
│   └── use-cases/       (CriarPergunta, AceitarSolucao, PublicarSolucao, etc.)
├── infrastructure/      ← Implementação concreta de acesso a dados
│   └── database/        (PerguntaRepository, SolucaoRepository)
├── controllers/         ← Adaptadores HTTP (traduzem req/res para use cases)
├── middlewares/          ← Interceptadores de requisição (auth, admin)
├── routes/              ← Declaração de rotas Express (mapeamento HTTP)
├── services/            ← Serviços de infraestrutura (emailService)
├── config/              ← Configuração técnica (conexão com banco)
├── app.js               ← Bootstrap do Express (middlewares globais + rotas)
└── server.js            ← Entrypoint de execução (listen na porta)
```

### 1.2. Como o Fluxo de Dados Funciona (Camada a Camada)

O sistema opera com **dois caminhos de fluxo distintos**, e essa dualidade é intencional:

#### Caminho A — Fluxo DDD Completo (módulo `problems`)
```
Route → Controller → Use Case → Entity (validação/comportamento) → Repository → DB
```
Os controllers de `problemsController.js` instanciam Use Cases que operam sobre Entidades de Domínio ricas. O repositório (`PerguntaRepository`, `SolucaoRepository`) faz o mapeamento entre o modelo de domínio (em português, com nomes como `titulo`, `descricaoPassoAPasso`) e o schema do banco (em inglês, com `title`, `content`). Esse mapeamento é **manual e explícito** dentro dos repositórios.

#### Caminho B — Fluxo Transacional Direto (módulos `auth` e `admin`)
```
Route → Controller → DB (queries diretas via `db.query`)
```
Os controladores de autenticação (`authController.js`) e administração (`adminController.js`) **não utilizam entidades de domínio nem use cases**. As regras ficam embutidas diretamente no controller, e as queries SQL são escritas inline. Essa escolha é pragmática: o cadastro/login foi construído primeiro como MVP, antes da adoção da camada DDD.

### 1.3. DTOs e Presenters

- **Não existem DTOs formais** (classes ou schemas de transferência). Os controllers recebem `req.body` diretamente e montam objetos planos para os use cases.
- **Não existem Presenters dedicados**. O mapeamento de saída é feito manualmente dentro de cada controller (ex: `{ id: parseInt(result.id) }`), o que gera acoplamento entre formato de resposta HTTP e lógica de orquestração.
- O `securityContext` funciona como um **DTO implícito de segurança**, criado pelo `authMiddleware` e passado para os use cases. Ele carrega `userId`, `roles[]` e `isVerified`.

### 1.4. Inversão de Dependência (Dependency Inversion)

Os Use Cases recebem repositórios e publishers via **constructor injection**:
```js
class CriarPerguntaUseCase {
  constructor({ perguntaRepository, eventPublisher }) { ... }
}
```
Porém, os repositórios são importados como **singletons concretos** no controller (`require('../infrastructure/database/PerguntaRepository')`), e não via um container de IoC. A inversão é estrutural (a entidade não conhece o banco), mas não é dinâmica (não há interface formal nem troca em runtime).

> **Porquê:** JavaScript não possui interfaces nativas. A decisão foi usar duck-typing e confiar no contrato implícito dos métodos `save()`, `findById()`, `update()`. Nos testes, o Jest substitui via `jest.mock()`.

---

## 2. Modelagem de Domínio (DDD)

### 2.1. Entidades Implementadas

O domínio possui **três entidades**, todas no namespace em português:

| Entidade | Arquivo | Responsabilidade |
|---|---|---|
| `Pergunta` | [Pergunta.js](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/backend/src/domain/entities/Pergunta.js) | Representa um chamado/problema aberto. Possui ciclo de vida completo (criar → resolver → encerrar → reabrir). |
| `Solucao` | [Solucao.js](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/backend/src/domain/entities/Solucao.js) | Resposta técnica a uma pergunta. Possui validação de conteúdo mínimo e atualização com timestamp. |
| `Comentario` | [Comentario.js](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/backend/src/domain/entities/Comentario.js) | Comentário polimórfico (pode pertencer a uma Pergunta ou Solução). |

### 2.2. Riqueza vs. Anemia

As entidades **possuem comportamento próprio**, o que as classifica como **Rich Domain Entities** (não anêmicas):

- **`Pergunta`**: Implementa `marcarSolucaoAceita()`, `desmarcarSolucaoAceita()`, `reabrir()`, `encerrarAdministrativamente()`, `isFechada()`. Cada método altera o estado interno da entidade de forma coerente (ex: encerrar altera `status`, `closingReason`, `closedAt` simultaneamente).
- **`Solucao`**: Implementa `atualizarConteudo()` com validação embutida (mínimo de 20 caracteres).
- **`Comentario`**: Mais simples, validação apenas no factory method `criar()`.

Todas usam o padrão **Named Constructor** (`Classe.criar(payload)`) como factory method que executa validações antes de instanciar.

### 2.3. Value Objects

> ⚠️ **Não existem Value Objects implementados.** Campos como `email`, `password`, `role` são tratados como strings primitivas em todo o sistema.

A ausência de VOs significa que:
- A validação de formato de e-mail **não existe** no backend (nem regex simples).
- Não há política de senha forte (tamanho mínimo, complexidade) no backend.
- As regras de role (`ADMIN`, `MEMBER`, `MODERATOR`, `ROLE_ADMIN`, `ROLE_TECNICO`) estão espalhadas como strings mágicas em múltiplos arquivos.

### 2.4. A Entidade "Usuário" — Ausente no Domínio

> ❗ **Não existe uma entidade `Usuario` na camada de domínio.** O conceito de "usuário" é tratado exclusivamente como um **registro de banco de dados** acessado via `db.query()` nos controllers de auth e admin.

O modelo conceitual do usuário está definido apenas no schema SQL:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'MEMBER',
    job_title VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.5. Hierarquia de Erros de Domínio

O sistema possui uma hierarquia de erros tipados em [DomainErrors.js](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/backend/src/domain/errors/DomainErrors.js):

```
DomainError (base)
├── ValidationError   (400)
├── UnauthorizedError (401)
├── ForbiddenError    (403)
└── NotFoundError     (404)
```

Cada erro carrega um `statusCode` que é usado pelo helper `handleError()` no `problemsController` para mapear automaticamente para o HTTP status correto.

### 2.6. Event Publisher (Preparação para Event-Driven)

Os Use Cases aceitam um `eventPublisher` opcional via constructor injection e publicam eventos semânticos como:
- `PerguntaCriadaEvent`
- `SolucaoAceitaEvent`
- `PerguntaEncerradaAdministrativamenteEvent`
- `SolucaoPublicadaEvent`, `SolucaoEditadaEvent`, `ComentarioIncluidoEvent`

> **Porquê:** Os publishers **não possuem implementação concreta ainda**. São chamados com `if (this.eventPublisher)`, o que torna a feature opt-in. A estrutura está preparada para integração futura com um barramento de eventos (ex: Redis Pub/Sub, EventEmitter local, ou message queue).

---

## 3. Segurança e Gestão de Identidade (IAM)

### 3.1. Criptografia de Senhas

| Aspecto | Implementação |
|---|---|
| **Algoritmo** | `bcryptjs` (versão JS pura do bcrypt) |
| **Cost Factor** | `10` rounds (via `bcrypt.genSalt(10)`) |
| **Onde ocorre** | [authController.register()](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/backend/src/controllers/authController.js#L23-L25) |

O `cost factor 10` é adequado para MVP, mas abaixo do recomendado para produção (12-14 é o consenso atual do OWASP para bcrypt). A escolha do `bcryptjs` (JS puro) vs `bcrypt` (nativo com C++) implica performance inferior sob carga, mas portabilidade total em Docker.

### 3.2. Estratégia de Autenticação

O sistema implementa um **modelo híbrido JWT + HttpOnly Cookie**:

```
[Login] → Servidor gera JWT → Seta cookie HttpOnly com o token → Cliente envia cookie automaticamente
```

**Detalhes do JWT:**
| Propriedade | Valor |
|---|---|
| **Payload** | `{ userId, name, email, role, isVerified }` |
| **Expiração** | `1 dia` (`expiresIn: '1d'`) |
| **Secret** | `process.env.JWT_SECRET` ou fallback `'secret-key-for-dev'` |
| **Algoritmo** | HS256 (padrão do `jsonwebtoken`) |

**Detalhes do Cookie:**
| Propriedade | Valor |
|---|---|
| `httpOnly` | `true` — impede acesso via `document.cookie` (proteção XSS) |
| `secure` | `true` apenas em produção (`NODE_ENV === 'production'`) |
| `sameSite` | `'lax'` — proteção básica contra CSRF |
| `maxAge` | `86.400.000ms` (24h, sincronizado com o JWT) |

> **Porquê:** Essa combinação foi escolhida para evitar armazenar tokens no `localStorage` (vulnerável a XSS) enquanto mantém a statelessness do JWT. O cookie é "portador automático" — o browser envia em toda requisição, eliminando necessidade de header `Authorization`.

**Verificação de E-mail:**
- Na criação de conta, um JWT assinado com `type: 'EMAIL_VERIFY'` e expiração de 24h é gerado e enviado por e-mail.
- O fluxo de verificação aceita tanto JWTs válidos quanto tokens legados (fallback via busca no banco).

### 3.3. Validação de Dados de Entrada

| Camada | Tipo de Validação | Implementação |
|---|---|---|
| **Controller (Auth)** | Presença de campos obrigatórios | `if (!email \|\| !password)` — verificação manual |
| **Controller (Admin)** | Whitelist de roles válidas | Array `validRoles` verificado via `.includes()` |
| **Entidades de Domínio** | Regras de negócio (tamanho, formato) | Factory methods `Classe.criar()` com `throw ValidationError` |
| **Use Cases** | Pré-condições de segurança | `if (!securityContext.isVerified)` |
| **Banco de Dados** | Constraints (unique, not null) | Schema SQL |

> 🔴 **Não existe validação formal de schema** (nenhum uso de Joi, Yup, Zod ou express-validator). A sanitização contra XSS e SQL Injection depende inteiramente de:
> - **SQL Injection**: Mitigado pelo uso consistente de **queries parametrizadas** (`$1`, `$2`) em todas as queries. Nenhuma concatenação de string SQL detectada.
> - **XSS**: **Não há sanitização de saída no backend.** O sistema confia que o React (frontend) faz escape automático de JSX. Dados armazenados no banco podem conter HTML/JS malicioso que seria seguro em JSX mas perigoso se consumido por outro cliente.

### 3.4. Proteção de Rotas e Controle de Acesso

O sistema implementa um modelo **RBAC + ABAC** em duas camadas:

**RBAC (Role-Based) via Middlewares:**
```
authMiddleware.js → Valida JWT, injeta req.user + req.securityContext
adminMiddleware.js → Verifica se role inclui ADMIN
```

**ABAC (Attribute-Based) via Use Cases:**
```
AceitarSolucaoUseCase → isAuthor || isAdmin  (ownership check)
EditarSolucaoUseCase → isAuthor only (self-service)
EncerrarPerguntaUseCase → ROLE_TECNICO || ROLE_ADMIN (privilege check)
```

**Roles Reconhecidas pelo Sistema:**
`ADMIN`, `ROLE_ADMIN`, `MODERATOR`, `ROLE_TECNICO`, `MEMBER`, `ROLE_USUARIO`

> ⚠️ A nomenclatura de roles é **inconsistente** entre camadas. O `authMiddleware` normaliza adicionando prefixo `ROLE_`, mas o `adminMiddleware` aceita ambas (`ADMIN` e `ROLE_ADMIN`). Isso funciona, mas é frágil.

### 3.5. Tratamento de Falhas de Login

| Cenário | Resposta | Status |
|---|---|---|
| E-mail não encontrado | `"Credenciais inválidas"` | 401 |
| Senha incorreta | `"Credenciais inválidas"` | 401 |
| Conta não verificada | `"Conta não verificada..."` | 401 |
| Conta bloqueada | `"Sua conta foi suspensa..."` | 403 |
| Campos ausentes | `"E-mail e senha são obrigatórios."` | 400 |

> **Decisão de segurança positiva:** Para e-mail inexistente e senha incorreta, a mensagem é **idêntica e genérica** (`"Credenciais inválidas"`), evitando enumeração de usuários. Porém, a verificação de bloqueio (`403`) e conta não verificada (`401`) com mensagens específicas **revelam a existência da conta** — isso é um trade-off UX vs segurança aceito.

### 3.6. Rate Limiting e Proteção contra Brute Force

> 🔴 **Não existe rate limiting implementado.** Nenhum middleware de throttling (express-rate-limit, etc.) está configurado. As rotas `/login` e `/register` estão completamente abertas a ataques de força bruta.

### 3.7. CORS

O CORS está configurado de forma restritiva no [app.js](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/backend/src/app.js#L12-L15):
```js
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
```
Apenas a origin do frontend é permitida, e `credentials: true` habilita o envio de cookies cross-origin.

---

## 4. Persistência de Dados

### 4.1. Stack de Banco de Dados

| Componente | Tecnologia |
|---|---|
| **Banco de Dados** | PostgreSQL 15 (via Docker) |
| **Driver Node.js** | `pg` (node-postgres) v8.11.3 |
| **ORM / Query Builder** | **Nenhum** — SQL manual com queries parametrizadas |
| **Pooling** | `pg.Pool` com configuração padrão (10 conexões max) |

> **Porquê não usar ORM:** A decisão de usar SQL puro + repositórios manuais permite controle total sobre as queries (especialmente Full-Text Search com `to_tsvector`) e evita a abstração "leaky" de ORMs em operações complexas como busca textual com ranking.

### 4.2. Schema e Constraints

**Tabela `users`:**
| Constraint | Tipo | Finalidade |
|---|---|---|
| `email UNIQUE NOT NULL` | Unicidade + Obrigatório | Impede duplicatas e garante chave de identificação |
| `idx_users_email` | Índice B-tree | Performance em lookups por email (login) |
| `password_hash NOT NULL` | Obrigatório | Nunca armazena senha em texto claro |

**Tabela `problems`:**
| Constraint | Tipo | Finalidade |
|---|---|---|
| `author_id REFERENCES users(id) ON DELETE SET NULL` | FK com soft-delete | Mantém a publicação se o autor for removido |
| `idx_problems_author`, `idx_problems_category` | Índices B-tree | Performance em filtros |
| `idx_problems_fts` | Índice GIN (Full-Text) | Busca textual em português (`portuguese` dictionary) |
| `accepted_solution_id REFERENCES solutions(id) ON DELETE SET NULL` | FK | Liga pergunta à solução aceita |

**Tabela `solutions`:**
| Constraint | Tipo | Finalidade |
|---|---|---|
| `problem_id REFERENCES problems(id) ON DELETE CASCADE` | FK com cascade | Remove soluções se a pergunta for excluída |
| `steps JSONB` | Tipo JSON binário | Armazena passos estruturados da solução |
| `media_urls TEXT[]` | Array nativo PostgreSQL | URLs de anexos sem tabela auxiliar |

### 4.3. Evolução do Schema

O `init.sql` usa uma estratégia de **schema evolutivo idempotente**:
```sql
CREATE TABLE IF NOT EXISTS ...
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;
ALTER TABLE problems ADD COLUMN IF NOT EXISTS accepted_solution_id INTEGER ...;
```
Isso permite re-executar o script sem falhas, mas **não há sistema de migrations formal** (Knex, Flyway, etc.).

---

## 5. Resiliência, Tratamento de Erros e Logs

### 5.1. Error Handling

**Não existe um Exception Handler global (middleware de erro do Express).** O tratamento ocorre de duas formas:

1. **No `problemsController`** — um helper centralizado [handleError()](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/backend/src/controllers/problemsController.js#L24-L30) que detecta `DomainError` e mapeia para HTTP status:
   ```js
   const handleError = (res, error, defaultMsg) => {
       if (error instanceof DomainError) {
           return res.status(error.statusCode || 400).json({ error: error.message });
       }
       console.error(`${defaultMsg}:`, error);
       return res.status(500).json({ error: defaultMsg });
   };
   ```

2. **Nos controllers de auth/admin** — cada handler tem seu próprio `try/catch` com `console.error` e resposta 500 genérica. Código de tratamento duplicado.

### 5.2. Logging

| Aspecto | Estado Atual |
|---|---|
| **Mecanismo** | `console.log`, `console.error`, `console.warn` nativos |
| **Formato** | Texto livre, não-estruturado |
| **Correlação** | Nenhum ID de correlação (request-id, trace-id) |
| **Níveis** | Sem distinção formal (tudo é `console.*`) |
| **Persistência** | Apenas stdout/stderr do container Docker |

### 5.3. Auditoria

O Use Case [EncerrarPerguntaAdministrativamenteUseCase](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/backend/src/application/use-cases/EncerrarPerguntaAdministrativamenteUseCase.js#L33-L41) aceita um `auditLogGateway` via injection:
```js
if (this.auditLogGateway) {
    await this.auditLogGateway.log({
        action: 'ENCERRAMENTO_ADMINISTRATIVO',
        perguntaId, executedBy: securityContext.userId,
        motivo, justificativaTecnica
    });
}
```
> **Porém:** O gateway **nunca é injetado** na prática (o controller não passa nenhum `auditLogGateway`). É código preparatório sem implementação concreta.

### 5.4. Resiliência do Frontend (Offline-First)

O frontend possui um mecanismo de **fallback offline** via IndexedDB:
- [offlineStore.js](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/frontend/src/utils/offlineStore.js) salva problemas retornados pela API localmente.
- O [api.js](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/frontend/src/services/api.js) tenta fetch online primeiro e, em caso de falha de rede, busca do cache IndexedDB.
- A aplicação é configurada como **PWA** (Progressive Web App) via `vite-plugin-pwa` com `registerType: 'autoUpdate'`.

### 5.5. Teste Automatizado

Os testes existem em `backend/tests/` usando **Jest + Supertest**:
- `auth.test.js` — 5 cenários de registro e login
- `admin.test.js`, `problems.test.js`, `search.test.js` — testes de integração HTTP
- `application/` e `domain/` — testes unitários de use cases e entidades

Os testes mockam `db`, `bcryptjs`, `jsonwebtoken` e `emailService`, rodando sem dependência de banco real.

---

## 6. Diagnóstico Prévio — Riscos e Débitos Técnicos

### 🔴 Risco Alto

| # | Problema | Impacto | Recomendação |
|---|---|---|---|
| 1 | **Ausência de Rate Limiting** | Login vulnerável a brute force; `/register` pode ser abusado para spam de e-mails | Implementar `express-rate-limit` com janelas de 15min, diferenciadas por rota |
| 2 | **JWT Secret hardcoded como fallback** | `'secret-key-for-dev'` pode vazar para produção se `JWT_SECRET` não for definida | Remover fallback; falhar ruidosamente se env var ausente |
| 3 | **Sem validação de formato de e-mail e política de senha** | Usuários podem cadastrar senhas triviais (`"1"`) ou e-mails malformados | Criar Value Objects `Email` e `SenhaForte` no domínio |
| 4 | **`reset_admin.js` com senha `'123'` hardcoded** | Script utilitário que expõe a conta admin com senha trivial se executado em produção | Remover do repositório ou exigir senha como argumento |

### 🟡 Risco Médio

| # | Problema | Impacto | Recomendação |
|---|---|---|---|
| 5 | **Entidade `Usuario` ausente no domínio** | Toda a lógica de identidade (registro, bloqueio, roles) está procedural nos controllers | Modelar `Usuario` como Aggregate Root com VOs para Email, Senha, Role |
| 6 | **Sem middleware de erro global** | Exceções não capturadas podem vazar stack traces ao cliente | Adicionar error handler Express no final do pipeline |
| 7 | **Strings mágicas de roles espalhadas** | `'ADMIN'`, `'ROLE_ADMIN'`, `'MODERATOR'` hardcoded em ~8 arquivos diferentes | Centralizar em um enum/constante `Roles` no domínio |
| 8 | **Sem sistema de migrations** | Schema evolui via `IF NOT EXISTS`, sem histórico versionado | Adotar Knex Migrations ou db-migrate |
| 9 | **Logs não-estruturados** | Impossível filtrar, agregar ou correlacionar em produção | Adotar Winston/Pino com formato JSON + request-id |
| 10 | **Auditoria preparada mas não implementada** | Ações administrativas sensíveis sem rastro persistente | Criar tabela `audit_logs` e implementar o gateway |

### 🟢 Pontos Positivos

| # | Aspecto | Nota |
|---|---|---|
| ✅ | Queries SQL 100% parametrizadas | Excelente proteção contra SQL Injection |
| ✅ | JWT em HttpOnly Cookie com `sameSite: 'lax'` | Boa proteção contra XSS e CSRF básico |
| ✅ | Mensagem genérica em falha de login | Impede enumeração de usuários |
| ✅ | Entidades de domínio ricas (não anêmicas) | Base sólida para evolução DDD |
| ✅ | Injection de dependências nos Use Cases | Testabilidade garantida |
| ✅ | Full-Text Search nativo com índice GIN | Performance de busca sem dependência externa |
| ✅ | Event Publisher como porta preparada | Arquitetura pronta para event-driven sem refactoring |
| ✅ | Frontend offline-first com PWA | Resiliência para técnicos em campo |
| ✅ | Verificação de e-mail por JWT assinado | Mais seguro que tokens aleatórios sem assinatura |
| ✅ | Docker Compose com stack completa | Ambiente reproduzível (DB + Backend + Frontend) |

---

## Apêndice: Mapa de Arquivos Relevantes

```
Segurança / Auth
├── backend/src/controllers/authController.js      → Login, Register, Verify, Me, Logout
├── backend/src/middlewares/authMiddleware.js       → JWT validation + securityContext
├── backend/src/middlewares/adminMiddleware.js      → RBAC admin gate
├── backend/src/routes/auth.js                     → Rotas públicas e protegidas de auth
├── backend/src/routes/admin.js                    → Rotas admin (auth + admin middleware)
└── backend/src/services/emailService.js           → Envio de e-mail (Mailtrap/Ethereal)

Domínio / DDD
├── backend/src/domain/entities/Pergunta.js        → Aggregate Root de perguntas
├── backend/src/domain/entities/Solucao.js         → Entidade de solução
├── backend/src/domain/entities/Comentario.js      → Entidade de comentário
├── backend/src/domain/errors/DomainErrors.js      → Hierarquia de erros tipados
├── backend/src/application/use-cases/*.js         → 6 casos de uso implementados
├── backend/src/infrastructure/database/*.js       → Repositórios (SQL → Domain mapping)
└── backend/src/controllers/problemsController.js  → Adaptador HTTP para use cases

Infraestrutura
├── backend/src/config/db.js                       → Pool de conexão PostgreSQL
├── database/init.sql                              → Schema DDL idempotente
├── docker-compose.yml                             → Orquestração de containers
└── .env.example                                   → Template de variáveis de ambiente

Frontend (Auth-Related)
├── frontend/src/context/AuthContext.jsx           → Estado global de autenticação
├── frontend/src/components/AdminRoute.jsx         → Guard de rota para admin
├── frontend/src/services/api.js                   → Cliente HTTP com fallback offline
└── frontend/vite.config.js                        → Proxy + PWA config
```
