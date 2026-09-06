# Diretriz: Execução de Comandos em Docker

Sempre que precisar executar scripts, comandos de build, testes ou consultas ao banco de dados:

1. **Não execute ferramentas de runtime diretamente no host** (`npm`, `node`, `npx`, `psql`).
2. **Utilize o Docker Compose**:
   - Backend: `docker compose exec backend <comando>`
   - Frontend: `docker compose exec frontend <comando>`
   - PostgreSQL: `docker compose exec db psql -U postgres -d itsupport`
3. Se os contêineres não estiverem em execução, verifique com `docker compose ps` ou inicie com `docker compose up -d`.
