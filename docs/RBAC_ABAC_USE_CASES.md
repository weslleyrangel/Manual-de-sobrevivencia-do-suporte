# Casos de Uso de Autorização: RBAC & ABAC (Modelo Colaborativo / Stack Overflow)

Este documento detalha os **Casos de Uso de Controle de Acesso** para o **Manual de Sobrevivência do Suporte (IT Support Knowledge Catalog)** sob o modelo de **base de conhecimento comunitária/colaborativa (estilo Stack Overflow)**.

> [!IMPORTANT]
> **Modelo de Papéis vs. Cargo:**
> * Os papéis de controle de acesso do sistema são: **`MEMBER`** (Técnico / Usuário), **`MODERATOR`** (Curador de conteúdo) e **`ADMIN`** (Administrador).
> [!TIP]
> Para visualizar a especificação técnica de cada Use Case na camada de aplicação (`application.usecase`) com contratos de DTOs, assinaturas Java/Clean Architecture e Eventos de Domínio, consulte o [Guia de Casos de Uso DDD](file:///c:/Users/Admin_2/Desktop/Manual%20do%20Suporte/Manual-de-sobrevivencia-do-suporte/docs/USE_CASES_DDD.md).

---

## 1. Atores e Atributos

### 1.1. Papéis de Sistema (Roles)
* **`MEMBER` (Membro Verificado):** Pode consultar, publicar problemas, sugerir soluções alternativas para qualquer post e gerenciar seus próprios conteúdos.
* **`MODERATOR` (Moderador / Curador):** Pode editar tags, organizar categorias, sinalizar duplicatas e organizar o catálogo.
* **`ADMIN` (Administrador):** Controle total de usuários, permissões de moderação e configurações.

### 1.2. Atributos Relevantes (ABAC)
* **Subject (Usuário):** `subject.id`, `subject.role` (`MEMBER`, `MODERATOR`, `ADMIN`), `subject.job_title` (`N1`, `N2`, `N3` - apenas badge), `subject.is_verified`.
* **Resource (Problema/Solução):** `resource.id`, `resource.author_id`, `resource.problem_id`, `resource.is_draft`, `resource.visibility`.
* **Environment (Ambiente):** `environment.is_offline` (booleano).

---

## 2. Especificação dos Casos de Uso

### UC-01: Busca e Consulta Aberta de Conhecimento

* **Objetivo:** Permitir que qualquer usuário (inclusive novos técnicos ou visitantes) busque e consulte problemas e soluções catalogadas.
* **Ator Principal:** Qualquer usuário (`MEMBER`, `MODERATOR`, `ADMIN` ou visitante).
* **Recurso:** `Problem` / `Solution`.
* **Validação RBAC/ABAC:**
  ```text
  PERMITIR SE (resource.visibility == 'PUBLICO')
  ```
* **Resultado Esperado:** Acesso liberado para leitura e busca via Full Text Search no PostgreSQL.

---

### UC-02: Publicação de Novo Problema ou Solução Alternativa (Estilo Q&A)

* **Objetivo:** Permitir que qualquer técnico verificado registre uma dúvida/problema ou contribua com um novo método de solução para um problema já existente.
* **Ator Principal:** `MEMBER`, `MODERATOR`, `ADMIN`.
* **Recurso:** `Problem` / `Solution`.
* **Pré-condições:** Usuário com conta verificada (`subject.is_verified == true`).
* **Validação ABAC:**
  ```text
  PERMITIR SE (subject.is_verified == true)
  SENÃO NEGAR (HTTP 403 Forbidden: "Confirme seu e-mail para participar da comunidade.")
  ```
* **Resultado Esperado:** O post ou solução é publicado imediatamente. Não há necessidade de aprovação prévia, promovendo agilidade e colaboração comunitária.

---

### UC-03: Edição e Exclusão do Próprio Conteúdo (Ownership Policy)

* **Objetivo:** Permitir que o autor de um problema ou resposta altere o texto, corrija passos ou remova sua própria publicação.
* **Ator Principal:** Autor do recurso.
* **Recurso:** `Problem` / `Solution`.
* **Validação ABAC (Checagem de Autoria):**
  ```text
  PERMITIR SE (subject.id == resource.author_id E subject.is_verified == true)
  ```
* **Resultado Esperado:** O autor possui controle total sobre suas contribuições (seja ele cadastrado como cargo N1, N2 ou N3).

---

### UC-04: Marcação de "Solução Aceita" pelo Autor do Problema (Stack Overflow Feature)

* **Objetivo:** Permitir que o criador do problema marque uma das soluções enviadas pela comunidade como a solução oficial/aceita para o seu caso.
* **Ator Principal:** Autor do problema original (`subject.id == problem.author_id`).
* **Recurso:** `Problem.accepted_solution_id`.
* **Validação ABAC:**
  ```text
  PERMITIR SE (subject.id == problem.author_id E subject.is_verified == true)
  ```
* **Resultado Esperado:** A solução selecionada ganha um indicador visual de "Solução Aceita pelo Autor" (badge verde/destaque) no catálogo.

---

### UC-05: Curadoria e Moderação de Conteúdo por Moderadores (Community Moderation)

* **Objetivo:** Permitir que moderadores e admins editem tags, corrijam erros de formatação ou organizem publicações de terceiros.
* **Ator Principal:** `MODERATOR`, `ADMIN`.
* **Recurso:** `Problem` / `Solution` de terceiros (`subject.id != resource.author_id`).
* **Validação RBAC:**
  ```text
  PERMITIR SE (subject.role IN ['MODERATOR', 'ADMIN'] E subject.is_verified == true)
  ```
* **Resultado Esperado:** Moderadores mantêm a qualidade da base de conhecimento sem limitar o fluxo de postagens dos técnicos.

---

### UC-06: Operação Offline PWA (Cache Local e Rascunhos)

* **Objetivo:** Permitir que o técnico consulte conteúdos salvos no aplicativo móvel e prepare novas soluções em formato rascunho enquanto estiver sem conexão de internet.
* **Ator Principal:** Qualquer `MEMBER` autenticado.
* **Recurso:** Cache local IndexedDB / Rascunhos.
* **Validação ABAC de Ambiente (`environment.is_offline`):**
  ```text
  SE (environment.is_offline == true):
    - LEITURA: Permitida para todo o conteúdo sincronizado localmente.
    - ESCRITA: Permitida apenas para criação/edição de RASCUNHOS PRÓPRIOS (resource.is_draft = true).
    - MODERAÇÃO/RESPOSTAS PÚBLICAS: Bloqueadas até o reestabelecimento da conexão online.
  ```
* **Resultado Esperado:** Garantia de funcionamento PWA offline sem gerar conflitos de sincronização.

---

### UC-07: Bloqueio de Ações de Escrita para Contas Pendentes (Unverified Account Limit)

* **Objetivo:** Proteger a comunidade contra spammers e contas fakes.
* **Ator Principal:** Usuário cadastrado sem e-mail verificado (`subject.is_verified == false`).
* **Validação ABAC:**
  ```text
  SE (subject.is_verified == false):
    - LEITURA (READ): Permitida.
    - ESCRITA/INTERAÇÃO (CREATE, UPDATE, DELETE): Bloqueada com HTTP 403.
  ```
* **Resultado Esperado:** Mensagem na interface solicitando a confirmação do link enviado por e-mail.

---

### UC-08: Gestão de Permissões de Moderadores (Administração)

* **Objetivo:** Permitir que administradores promovam membros ativos da comunidade para o papel de `MODERATOR`.
* **Ator Principal:** `ADMIN`.
* **Recurso:** `User.role`.
* **Validação RBAC:**
  ```text
  PERMITIR SE (subject.role == 'ADMIN')
  ```
* **Resultado Esperado:** Apenas o `ADMIN` pode alterar a role do usuário no banco de dados.

---

## 3. Matriz Resumo de Autorização (Stack Overflow Model)

| Caso de Uso | Operação | Role Mínima do Sistema | Exige Autoria? | O Cargo (N1/N2/N3) Impacta? |
| :--- | :--- | :--- | :---: | :---: |
| **UC-01 (Buscar/Ler)** | `READ` | Visitante / `MEMBER` | ❌ | ❌ (Apenas exibido no card) |
| **UC-02 (Postar Problema/Solução)** | `CREATE` | `MEMBER` (Verificado) | ❌ | ❌ (Todos podem publicar) |
| **UC-03 (Editar Próprio)** | `UPDATE` | `MEMBER` (Verificado) | ✅ (`author_id`) | ❌ |
| **UC-04 (Marcar Solução Aceita)**| `UPDATE` | `MEMBER` (Verificado) | ✅ (Autor do Problema) | ❌ |
| **UC-05 (Moderação/Curadoria)** | `UPDATE/DELETE`| `MODERATOR` | ❌ | ❌ |
| **UC-06 (Modo Offline PWA)** | `READ/WRITE` | `MEMBER` | ✅ (Para rascunhos) | ❌ |
| **UC-07 (Não Verificado)** | Leitura Apenas | Visitante / Pendente | N/A | ❌ |
| **UC-08 (Gestão de Roles)** | `ADMIN_WRITE` | `ADMIN` | N/A | ❌ |

---

## 4. Conclusão da Filosofia de Design

A arquitetura adota um modelo de **empoderamento colaborativo**:
* **Equidade:** N1, N2 e N3 trabalham no mesmo nível de permissão no catálogo. O cargo serve para dar contexto profissional e credibilidade às respostas.
* **Curadoria Estilo Q&A:** O foco da segurança está na verificação de identidade (`is_verified`), proteção da propriedade dos posts (`author_id`) e papéis funcionais claros (`MEMBER`, `MODERATOR`, `ADMIN`).
