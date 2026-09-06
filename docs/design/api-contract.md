# Design Doc: API Contract

## 1. Visão Geral
Este documento define o contrato de comunicação entre o Frontend (React PWA) e o Backend (Node.js). A API será puramente RESTful, utilizando JSON para as cargas úteis (payloads) e tokens JWT para autenticação.

**Base URL:** `/api/v1`

---

## 2. Autenticação (JWT via HttpOnly Cookie & Rate Limited)

A autenticação é gerenciada através de cookies seguros `HttpOnly` (`jwt`).

### 2.1. Registro de Usuário
- **Endpoint:** `POST /api/v1/auth/register`
- **Descrição:** Cria uma nova conta com papel estrito `MEMBER` e despacha e-mail de ativação via Mailtrap.
- **Request Body:**
  ```json
  {
    "name": "Carlos Silva",
    "email": "carlos@suporte.com",
    "password": "senha-segura",
    "job_title": "Analista de Suporte · Nível 2"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "Cadastro realizado! Enviamos um link de confirmação para o seu e-mail.",
    "email": "carlos@suporte.com"
  }
  ```

### 2.2. Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Descrição:** Autentica o usuário verificado e define o cookie seguro `jwt`.
- **Request Body:**
  ```json
  {
    "email": "carlos@suporte.com",
    "password": "senha-segura"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Login realizado com sucesso",
    "user": {
      "id": 1,
      "name": "Carlos Silva",
      "email": "carlos@suporte.com",
      "role": "MEMBER",
      "is_verified": true
    }
  }
  ```

### 2.3. Confirmação de E-mail
- **Endpoint:** `GET /api/v1/auth/verify/:token`
- **Descrição:** Ativa a conta a partir do link recebido por e-mail.

### 2.4. Reenvio de Link de Ativação
- **Endpoint:** `POST /api/v1/auth/resend-verification`
- **Request Body:**
  ```json
  {
    "email": "carlos@suporte.com"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Link de verificação reenviado com sucesso."
  }
  ```

### 2.5. Solicitação de Recuperação de Senha ("Esqueceu a Senha?")
- **Endpoint:** `POST /api/v1/auth/forgot-password`
- **Request Body:**
  ```json
  {
    "email": "carlos@suporte.com"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Se o e-mail estiver cadastrado, enviamos as instruções de redefinição."
  }
  ```

### 2.6. Redefinição de Senha
- **Endpoint:** `POST /api/v1/auth/reset-password`
- **Request Body:**
  ```json
  {
    "token": "reset_token_hex_or_jwt",
    "password": "nova-senha-segura"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Senha redefinida com sucesso. Você já pode fazer login."
  }
  ```

### 2.7. Sessão Atual (Me) & Logout
- **Endpoint:** `GET /api/v1/auth/me` (Retorna dados do usuário autenticado).
- **Endpoint:** `POST /api/v1/auth/logout` (Limpa o cookie `jwt`).

---

## 3. Catálogo de Problemas

### 3.1. Listar Problemas
- **Endpoint:** `GET /problems`
- **Descrição:** Retorna a lista de problemas (útil para a tela inicial e para cache offline).
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "title": "Impressora não conecta na rede WiFi",
      "description": "Ao tentar parear a impressora X, o IP não é atribuído.",
      "author_id": 2,
      "created_at": "2026-08-24T10:00:00Z"
    }
  ]
  ```

### 3.2. Criar um Problema
- **Endpoint:** `POST /problems`
- **Cabeçalhos:** Requer Autenticação (JWT).
- **Request Body:**
  ```json
  {
    "title": "VPN caindo após 5 minutos",
    "description": "Usuários do Windows 11 reportam que a VPN desconecta."
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": 2,
    "message": "Problema registrado"
  }
  ```

---

## 4. Soluções Alternativas

### 4.1. Ver Detalhes de um Problema (com Soluções)
- **Endpoint:** `GET /problems/:id`
- **Descrição:** Retorna o problema e todas as soluções já cadastradas para ele (necessário para a visualização completa).
- **Response (200 OK):**
  ```json
  {
    "id": 1,
    "title": "Impressora não conecta...",
    "description": "Ao tentar parear...",
    "solutions": [
      {
        "id": 10,
        "content": "Reinicie o spooler de impressão e conecte via IP fixo.",
        "media_urls": ["/uploads/img1.png"],
        "author_id": 3
      }
    ]
  }
  ```

### 4.2. Adicionar Nova Solução
- **Endpoint:** `POST /problems/:id/solutions`
- **Cabeçalhos:** Requer Autenticação (JWT).
- **Request Body:**
  ```json
  {
    "content": "Também é possível resolver resetando as configurações de rede do Windows.",
    "media_urls": ["/uploads/video_tutorial.mp4"]
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "solution_id": 11,
    "message": "Solução alternativa adicionada"
  }
  ```
