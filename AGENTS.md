# Regras do Projeto (Workspace Rules)

## Execução de Comandos e Ambiente Docker

1. **Ambiente Baseado em Docker**:
   - As dependências e runtimes do projeto (Node.js, npm, Jest, PostgreSQL, Vite) rodam exclusivamente através de contêineres Docker (`docker-compose.yml`).
   - O sistema host (Windows) não possui `node` ou `npm` no PATH global.

2. **Regra Obrigatória para Execução de Comandos**:
   - **NUNCA** execute comandos diretos como `npm test`, `npm run dev`, `npx`, `node`, `psql` diretamente no CMD/PowerShell local da máquina host.
   - **SEMPRE** execute os comandos direcionados aos contêineres Docker usando `docker compose exec` ou `docker exec`.

3. **Mapeamento de Serviços e Comandos**:
   - **Backend** (Node.js / Express / Jest / Migrations):
     - Testes: `docker compose exec backend npm test` ou `docker exec itsupport_backend npm test`
     - Instalação de pacotes: `docker compose exec backend npm install <pacote>`
     - Scripts: `docker compose exec backend npm run <script>`
   - **Frontend** (React / Vite):
     - Build/Scripts: `docker compose exec frontend npm run build`
     - Instalação de pacotes: `docker compose exec frontend npm install <pacote>`
   - **Banco de Dados** (PostgreSQL):
     - Acesso SQL / psql: `docker compose exec db psql -U postgres -d itsupport`
   - **Status e Gerenciamento de Contêineres**:
     - Verificar contêineres ativos: `docker compose ps` ou `docker ps`
     - Logs: `docker compose logs -f [serviço]`
     - Reiniciar serviço: `docker compose restart [serviço]`
