# Module: Backend-Core

## Resumo
Este documento registra a configuração base do projeto Node.js (`backend`), preparando o terreno para o desenvolvimento orientado a testes (TDD).

## Componentes Criados
1. **`package.json`**: Configurado com Express, pg e cors. Dependências de desenvolvimento incluem Jest e Supertest.
2. **Setup de Testes (TDD)**: 
   - `src/app.js` exporta a instância do Express separada do `server.js` para permitir testes (injetando o `app` no Supertest sem conflito de portas).
   - Criado `tests/app.test.js` para garantir que a infraestrutura de testes está rodando. Rota inicial `/health` criada (seguindo o ciclo TDD) para validar a sanidade do servidor.

## Como rodar os testes
Localmente (fora do Docker):
```bash
cd backend
npm install
npm test
```
Ou testar via Docker Compose subindo o serviço de backend.
