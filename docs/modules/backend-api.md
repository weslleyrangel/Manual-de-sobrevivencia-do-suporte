# Module: Backend-API

## Resumo
Este documento registra a implementação das rotas principais da API do Catálogo de Suporte TI (Autenticação, Problemas e Soluções), todas desenvolvidas seguindo a metodologia **TDD (Test-Driven Development)** e o contrato de API pré-estabelecido.

## Componentes Criados
1. **Middlewares**:
   - `authMiddleware.js`: Intercepta rotas protegidas e valida o token JWT do usuário, garantindo segurança na criação de problemas e soluções.

2. **Rotas e Controladores (Auth)**:
   - `POST /api/v1/auth/register`: Cadastro de técnicos (criptografia de senha via bcrypt).
   - `POST /api/v1/auth/login`: Autenticação e geração de JWT.

3. **Rotas e Controladores (Problemas e Soluções)**:
   - `GET /api/v1/problems`: Retorna o catálogo de problemas mais recentes.
   - `POST /api/v1/problems`: Permite a criação de um problema (requer JWT).
   - `GET /api/v1/problems/:id`: Busca os detalhes de um problema específico em conjunto com suas **Soluções Alternativas**.
   - `POST /api/v1/problems/:id/solutions`: Permite o envio de soluções em texto e mídias (requer JWT).

## Cobertura de Testes (TDD)
- **9 testes unitários implementados e aprovados** via Jest e Supertest (Mockando o banco de dados para velocidade de teste).
- A aplicação backend encontra-se estável e pronta para ser consumida pela interface do usuário (Frontend).
