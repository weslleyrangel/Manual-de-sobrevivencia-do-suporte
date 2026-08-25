# Design Doc: API Contract

## 1. Visão Geral
Este documento define o contrato de comunicação entre o Frontend (React PWA) e o Backend (Node.js). A API será puramente RESTful, utilizando JSON para as cargas úteis (payloads) e tokens JWT para autenticação.

**Base URL:** `/api/v1`

---

## 2. Autenticação (JWT)

A maioria das rotas exigirá um cabeçalho HTTP de autorização:
`Authorization: Bearer <token_jwt>`

### 2.1. Registro de Usuário
- **Endpoint:** `POST /auth/register`
- **Descrição:** Cria uma nova conta para o técnico de suporte.
- **Request Body:**
  ```json
  {
    "email": "tecnico@suporte.com",
    "password": "senha-segura"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "Usuário criado com sucesso",
    "user_id": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
  ```

### 2.2. Login
- **Endpoint:** `POST /auth/login`
- **Descrição:** Autentica um usuário existente.
- **Request Body:**
  ```json
  {
    "email": "tecnico@suporte.com",
    "password": "senha-segura"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
  ```

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
