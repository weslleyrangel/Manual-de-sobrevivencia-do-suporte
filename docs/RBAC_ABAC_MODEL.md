# Modelo de Autorização: RBAC & ABAC (Modelo Colaborativo / Stack Overflow)

Este documento especifica a arquitetura de controle de acesso para o **Manual de Sobrevivência do Suporte (IT Support Knowledge Catalog)**, combinando **RBAC (Role-Based Access Control)** e **ABAC (Attribute-Based Access Control)** sob uma filosofia **colaborativa (estilo Stack Overflow)**.

> [!IMPORTANT]
> **Definição de Modelo:** Os níveis **N1, N2, N3** são **apenas cargos informativos (badging de perfil)** declarados pelo usuário no cadastro, e **NÃO constituem uma hierarquia de segurança ou controle de acesso**. Todos os membros verificados possuem o mesmo nível de permissão de leitura, criação e publicação de soluções.

> [!TIP]
> Para visualizar o detalhamento dos 9 casos de uso funcionais (UC-01 a UC-09), consulte a [Especificação de Casos de Uso de Autorização](file:///c:/Users/Admin_2/Desktop/Manual%20do%20Suporte/Manual-de-sobrevivencia-do-suporte/docs/RBAC_ABAC_USE_CASES.md).

---

## 1. Decisão de Arquitetura: Modelo Híbrido

Para um sistema colaborativo de Base de Conhecimento de TI com suporte **PWA Mobile/Offline-First**, adotamos o **Modelo Híbrido**:

1. **No Banco de Dados:**
   - Armazenamos o **Papel de Sistema do Usuário** (`user.role`: `MEMBER`, `MODERATOR`, `ADMIN`).
   - Armazenamos o **Cargo Informativo / Perfil** (`user.job_title`: `N1`, `N2`, `N3`, `Coordenador`, `Especialista`).
   - Armazenamos os **Atributos do Usuário** (`user.department`, `user.is_verified`).
   - Armazenamos os **Atributos dos Recursos** (`problem.author_id`, `problem.is_draft`, `problem.visibility`, `solution.accepted_by_author`).
2. **No Backend e Frontend (Estático/Regras em Código):**
   - As regras de autorização são avaliadas em memória (usando os claims do **JWT**), garantindo zero JOINs adicionais por requisição e alta performance no PWA offline.

---

## 2. Especificação do RBAC (Role-Based Access Control)

### 2.1. Papéis do Sistema (System Roles)

1. `MEMBER` (**Membro da Comunidade / Técnico de TI**):
   - Papel padrão atribuído a todos os usuários cadastrados.
   - Pode buscar, ler, publicar problemas, adicionar soluções alternativas e editar os próprios posts.
2. `MODERATOR` (**Moderador / Curador da Base**):
   - Membro com privilégios de curadoria. Pode editar tags, organizar categorias, sinalizar duplicadas e moderar conteúdos inadequados.
3. `ADMIN` (**Administrador do Sistema**):
   - Gestão global da plataforma, alteração de privilégios de usuários e configurações do sistema.

---

### 2.2. Matriz de Permissões RBAC

| Ação / Operação | Visitante (Não Verificado) | MEMBER (Verificado) | MODERATOR | ADMIN |
| :--- | :---: | :---: | :---: | :---: |
| **Buscar e Ler Conteúdos Públicos** | ✅ | ✅ | ✅ | ✅ |
| **Criar Problema / Propor Solução** | ❌ | ✅ | ✅ | ✅ |
| **Editar / Excluir Próprio Conteúdo** | ❌ | ✅ | ✅ | ✅ |
| **Marcar Resolução Aceita (em próprio problema)** | ❌ | ✅ | ✅ | ✅ |
| **Editar Conteúdo de Terceiros (Curadoria)** | ❌ | ❌ | ✅ | ✅ |
| **Excluir Conteúdo de Terceiros / Moderar** | ❌ | ❌ | ✅ | ✅ |
| **Gerenciar Usuários e Atribuir Moderadores** | ❌ | ❌ | ❌ | ✅ |

---

## 3. Especificação do ABAC (Attribute-Based Access Control)

Enquanto o RBAC valida a função do usuário (`MEMBER`, `MODERATOR`, `ADMIN`), o ABAC valida as propriedades do **Subject (Usuário)**, **Resource (Problema/Solução)** e **Environment (Ambiente/PWA)**.

### 3.1. Dicionário de Atributos

#### **Subject (Usuário)**
- `subject.id`: ID único do usuário.
- `subject.role`: `MEMBER`, `MODERATOR`, `ADMIN`.
- `subject.job_title`: `N1`, `N2`, `N3` (Atributo apenas informativo/exibição no card do autor).
- `subject.department`: Departamento (ex: `Suporte`, `Redes`, `Sistemas`).
- `subject.is_verified`: Booleano (Validação de e-mail corporativo).

#### **Resource (Problema / Solução / Resposta)**
- `resource.author_id`: ID do autor que criou o post/resposta.
- `resource.problem_id`: ID do problema associado (no caso de uma solução).
- `resource.is_draft`: Booleano indicando rascunho.
- `resource.visibility`: `PUBLICO`, `INTERNO_EQUIPE`.
- `resource.accepted_solution`: Booleano indicando se foi marcada como melhor solução pelo autor do problema.

#### **Environment (Ambiente)**
- `environment.is_offline`: Booleano (Indica se a requisição está sendo processada localmente pelo PWA).

---

### 3.2. Regras e Políticas ABAC

#### **Regra 1: Propriedade e Edição do Próprio Conteúdo (Ownership)**
> **Regra:** Qualquer membro pode editar ou excluir o problema/solução se for o autor original (`subject.id == resource.author_id`).

#### **Regra 2: Aceite de Melhor Solução (Estilo Stack Overflow)**
> **Regra:** O autor de um problema pode marcar/desmarcar uma resposta de terceiro como a "Solução Aceita" para o seu problema (`subject.id == problem.author_id`).

#### **Regra 3: Trava de Conta Não Verificada (Unverified Account Limit)**
> **Regra:** Se `subject.is_verified == false`, o usuário só tem permissão de leitura (`READ`). Ações de escrita (`CREATE`, `UPDATE`, `DELETE`) são bloqueadas até a verificação do e-mail.

#### **Regra 4: Operação Offline PWA (PWA Offline Policy)**
> **Regra:** No modo offline (`environment.is_offline == true`), o usuário pode ler itens do cache local e criar/editar **rascunhos próprios**. Moderação de terceiros exige conexão online.

---

## 4. Modelagem de Dados no PostgreSQL

```sql
-- Atualização na tabela de Usuários
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'MEMBER',
ADD COLUMN IF NOT EXISTS job_title VARCHAR(100) DEFAULT 'N1', -- Informativo (N1, N2, N3)
ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT 'Suporte Geral';

-- Atualização na tabela de Problemas
ALTER TABLE problems 
ADD COLUMN IF NOT EXISTS author_id INT REFERENCES users(id),
ADD COLUMN IF NOT EXISTS visibility VARCHAR(50) DEFAULT 'PUBLICO',
ADD COLUMN IF NOT EXISTS accepted_solution_id INT;
```

---

## 5. Resumo Executivo

- **Modelo:** Colaborativo (Stack Overflow de TI).
- **Papéis Reais:** `MEMBER`, `MODERATOR`, `ADMIN`.
- **Cargo (N1, N2, N3):** Badge visual / campo informativo no cadastro do usuário, **sem impacto de bloqueio de segurança**.
- **Equidade:** Qualquer técnico verificado pode postar dúvidas, propor soluções alternativas para qualquer problema e gerenciar seus próprios conteúdos.
