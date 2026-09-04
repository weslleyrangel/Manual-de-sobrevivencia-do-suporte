# Catálogo de Usuários, Credenciais e Matriz de Acessos

Este documento lista todos os usuários cadastrados e pré-populados (*seeded*) na base de conhecimento do **Manual de Sobrevivência do Suporte**, detalhando suas credenciais de acesso para desenvolvimento, seus papéis de sistema (RBAC), títulos de cargo informativos e permissões efetivas (ABAC).

---

## 1. Usuários Cadastrados no Sistema

| ID | Nome Completo | E-mail de Login | Senha Dev | Papel no Sistema (RBAC) | Cargo Informativo (`job_title`) | Conta Verificada (`is_verified`) | Publicações Autorais |
| :---: | :--- | :--- | :---: | :---: | :--- | :---: | :---: |
| **1** | **Weslley Rangel** | `admin@suporte.com` | `123` | `ADMIN` (`ROLE_ADMIN`) | *Especialista em Suporte N2* | ✅ Sim | 20 Artigos (IDs 1 ao 20) |
| **2** | **Ana Martins** | `ana.martins@suporte.com` | `123` | `MODERATOR` (`ROLE_TECNICO`) | *Analista de Suporte N2* | ✅ Sim | 5 Artigos (IDs 21 ao 25) |
| **3** | **Rafael Costa** | `rafael.costa@suporte.com` | `123` | `MEMBER` (`ROLE_USUARIO`) | *Analista de Suporte N1* | ✅ Sim | 4 Artigos (IDs 26 ao 29) |
| **4** | **Mariana Silva** | `mariana.silva@suporte.com` | `123` | `MEMBER` (`ROLE_USUARIO`) | *Especialista em Redes e Infra N2* | ✅ Sim | 4 Artigos (IDs 30 ao 33) |

> [!NOTE]
> Todos os usuários pré-cadastrados compartilham a senha padrão `123` para agilizar testes locais e auditoria de funcionalidades no ambiente de desenvolvimento.

---

## 2. Detalhamento de Perfis e Casos de Uso de Teste

### 👤 1. Weslley Rangel (Administrador Geral)
- **E-mail:** `admin@suporte.com`
- **Responsabilidade Principal:** Administração de toda a plataforma, moderação global e publicação de artigos corporativos essenciais.
- **Ações permitidas:**
  - Publicar novas perguntas e soluções.
  - Aceitar soluções oficiais em suas 20 publicações.
  - Editar suas próprias publicações e respostas.
  - Encerrar qualquer publicação administrativamente com justificativa técnica formal.

---

### 🛡️ 2. Ana Martins (Suporte Moderador / Técnico)
- **E-mail:** `ana.martins@suporte.com`
- **Responsabilidade Principal:** Moderação técnica da comunidade, validação de procedimentos e suporte avançado.
- **Ações permitidas:**
  - Publicar novas perguntas e soluções.
  - Aceitar soluções em suas próprias publicações (IDs 21 a 25).
  - Encerrar administrativamente perguntas de outros analistas em caso de inatividade, duplicidade ou solução validada em chamado.

---

### 👨‍💻 3. Rafael Costa (Analista Colaborador N1)
- **E-mail:** `rafael.costa@suporte.com`
- **Responsabilidade Principal:** Compartilhamento de procedimentos práticos de atendimento N1 (ex: reset de PIN, limpeza de DNS, capturas de tela).
- **Ações permitidas:**
  - Publicar novas perguntas e soluções alternativas.
  - Aceitar a melhor resposta em suas publicações (IDs 26 a 29).
  - Editar suas próprias soluções.
  - *Bloqueio:* Não pode encerrar perguntas administrativamente (apenas o autor aceita a solução ou um técnico encerra).

---

### 👩‍💻 4. Mariana Silva (Especialista em Redes N2)
- **E-mail:** `mariana.silva@suporte.com`
- **Responsabilidade Principal:** Criação de conteúdos técnicos avançados de infraestrutura, roteamento, VLANs e conectividade.
- **Ações permitidas:**
  - Publicar artigos técnicos e propor métodos alternativos em publicações existentes.
  - Aceitar soluções em suas publicações (IDs 30 a 33).
  - Editar suas próprias respostas.
  - *Bloqueio:* Sem permissão para encerramento de tópicos de terceiros.

---

## 3. Matriz de Autorização por Papel e Contexto

| Ação no Sistema | Tipo de Regra | `MEMBER` (Rafael / Mariana) | `MODERATOR` (Ana Martins) | `ADMIN` (Weslley Rangel) | Usuário Não Verificado |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Visualizar Publicações e Buscar** | Leitura Pública | ✅ Permitido | ✅ Permitido | ✅ Permitido | ✅ Permitido |
| **Criar Nova Pergunta / Artigo** | Verificação | ✅ Permitido | ✅ Permitido | ✅ Permitido | ❌ Bloqueado |
| **Responder com Nova Solução** | Verificação | ✅ Permitido | ✅ Permitido | ✅ Permitido | ❌ Bloqueado |
| **Aceitar Solução Oficial** | **ABAC** | ✅ *Apenas se for o Autor* | ✅ *Apenas se for o Autor* | ✅ *Apenas se for o Autor* | ❌ Bloqueado |
| **Editar Solução Própria** | **ABAC** | ✅ *Apenas a Própria* | ✅ *Apenas a Própria* | ✅ *Apenas a Própria* | ❌ Bloqueado |
| **Encerrar Pergunta (Admin/Técnico)** | **RBAC** | ❌ Não Autorizado | ✅ Permitido (Justificativa > 15 chars) | ✅ Permitido (Justificativa > 15 chars) | ❌ Bloqueado |

---

## 4. Como Testar a Alternância de Contas

Para alternar entre os usuários e validar os fluxos de permissão:
1. Acesse `/login` ou clique no menu do perfil e selecione **"Sair"**.
2. Digite o e-mail de um dos usuários acima com a senha `123`.
3. Navegue até uma publicação criada por outro analista (ex: faça login como `Rafael Costa` e abra a publicação ID 1 de `Weslley Rangel`):
   - O botão *"Marcar como Solução Aceita"* **não** será exibido.
   - O botão *"Encerrar Pergunta (Técnico)"* **não** será exibido.
4. Faça login como `Ana Martins` (`ana.martins@suporte.com`):
   - O botão *"Encerrar Pergunta (Técnico)"* **será exibido**.
