# ADP-004: Blindagem de Segurança em Autenticação, Proteção contra Vazamento no Client-Side e Resiliência de Acesso

## Status
Aceito

## Data
2026-09-06

## Contexto
Durante a auditoria arquitetural dos fluxos de registro, login e gerenciamento de identidade, identificamos pontos fundamentais de segurança e usabilidade necessários para produção:

1. **Prevenção de Mass Assignment (Escalonamento de Privilégios):** A rota de registro público aceitava o campo `role` vindo do payload HTTP sem sanitização adequada, permitindo potencial escalonamento não autorizado para `ADMIN` ou `MODERATOR`.
2. **Validação Estrita no Servidor:** O backend dependia de validações superficiais, permitindo criação de contas com senhas fracas ou e-mails em formato inválido caso a requisição contornasse a interface do usuário.
3. **Prevenção de Ataques de Força Bruta e Spam:** Endpoints de autenticação e disparo de e-mails (`/login`, `/register`, `/forgot-password`, `/resend-verification`) necessitam de controle de taxa de requisições (*Rate Limiting*) para proteger recursos e cotas de SMTP.
4. **Proteção contra Vazamento de Dados no DevTools / Client-Side:** Eliminar persistência de senhas em texto puro no `sessionStorage` do navegador e garantir que hashes, tokens internos e stack traces jamais sejam expostos nas respostas de API ou console.
5. **Recuperação e Resiliência de Acesso:** Implementar fluxos completos de reenvio de link de confirmação de e-mail e recuperação segura de senha via Mailtrap.

---

## Decisão

### 1. Forçamento Incondicional de Papéis no Registro Público
- **Regra:** Todo cadastro público pela rota `POST /api/v1/auth/register` terá obrigatoriamente `role = 'MEMBER'`.
- Atribuições de papéis administrativos (`ADMIN`, `MODERATOR`) devem ocorrer exclusivamente via banco de dados ou processos administrativos autorizados.

### 2. Validações Fortes de Entrada (Backend)
- Formato de e-mail validado por expressão regular padronizada RFC 5322 simplificada.
- Comprimento mínimo de senha de **6 caracteres** exigido tanto no backend quanto no frontend.
- Sanitização de strings (`email.trim().toLowerCase()`, `name.trim()`).

### 3. Rate Limiting por IP e Rota
- Implementação de middleware de proteção de taxa para mitigar força bruta:
  - Rotas de login e registro: limite de 10 requisições por minuto por IP.
  - Rotas de disparo de e-mails (`/forgot-password`, `/resend-verification`): limite de 5 requisições por minuto por IP.

### 4. Proteção contra Vazamento no Client-Side / DevTools
- Remoção de qualquer armazenamento de senhas em texto plano no `sessionStorage` ou `localStorage`.
- DTOs de resposta de autenticação (em `/me`, `/login`, `/register`) retornam estritamente `{ id, name, email, role, job_title, is_verified }`.
- Cookies de autenticação mantêm `httpOnly: true`, `sameSite: 'lax'` e `secure` em produção para proteção contra ataques XSS e inspeção indevida via console do browser.

### 5. Ciclo de Vida de Tokens e Recuperação de Senha
- **Ativação de Conta (`/resend-verification`):** Permite a reemissão de tokens de verificação com validade de 24 horas via Mailtrap.
- **Recuperação de Senha (`/forgot-password` e `/reset-password`):**
  - Geração de token criptográfico seguro com expiração de 1 hora (`reset_password_expires_at`).
  - Template de e-mail responsivo e link direto para a tela `/reset-password?token=...`.
  - Invalidação imediata do token após redefinição da senha.

---

## Consequências

- **Segurança Robusta:** Elimina vulnerabilidades de Mass Assignment e força bruta.
- **Privacidade & Conformidade:** Credenciais e tokens não ficam expostos no armazenamento do navegador nem no DevTools.
- **Experiência do Usuário (UX):** Usuários com e-mails não recebidos ou senhas esquecidas possuem fluxos de autoatendimento sem necessidade de intervenção manual no banco de dados.
