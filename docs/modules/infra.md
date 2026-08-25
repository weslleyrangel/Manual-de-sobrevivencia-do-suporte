# Module: Infra (Infrastructure)

## Resumo
Este documento registra a criação da infraestrutura base do sistema de Catálogo de Suporte TI, utilizando **Docker e Docker Compose**. O módulo foi finalizado e os arquivos de configuração foram estabelecidos para preparar o ambiente de TDD.

## Componentes Criados

1. **Banco de Dados (PostgreSQL 15)**: 
   - Contêiner `itsupport_db` expondo a porta `5432`.
   - Inicializado com o script `database/init.sql` que contém a modelagem inicial de Usuários, Problemas e Soluções (utilizando Arrays para mídias).
   - Utiliza volume persistente (`postgres_data`).

2. **Backend (Node.js)**: 
   - Contêiner `itsupport_backend` expondo a porta `3000`.
   - Baseado em `node:20-alpine`, preparado para ambiente de desenvolvimento (executando `npm run dev`) e mapeado via volumes.

3. **Frontend (React/Vite)**: 
   - Contêiner `itsupport_frontend` expondo a porta `5173`.
   - Baseado em `node:20-alpine` e configurado para rodar o Vite escutando externamente (`--host`).

## Status e Verificação
- Os manifestos do Docker foram criados. O próximo passo lógico é definir os projetos reais (`package.json`) no módulo `backend-core` e `frontend-core` antes de subirmos tudo via `docker-compose up`.
