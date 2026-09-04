# ADP-002: Modelo Híbrido de Autorização (RBAC + ABAC) e Ciclo Colaborativo

## Status
Aceito

## Data
2026-09-04

## Contexto
O sistema de Base de Conhecimento e Suporte Técnico (Manual de Sobrevivência do Suporte) evoluiu para um modelo comunitário/colaborativo interno (estilo Stack Overflow).

Precisamos de uma arquitetura de controle de acesso que atenda a três requisitos fundamentais:
1. **Modelagem Colaborativa:** Permitir que todos os membros verificados contribuam com perguntas e resoluções alternativas sem que níveis de cargo (N1, N2, N3) atuem como bloqueios rígidos de segurança.
2. **Suporte PWA Offline-First:** Avaliar permissões no aplicativo móvel em milissegundos sem realizar requisições de rede ou JOINs complexos no banco de dados a cada interação do usuário.
3. **Segurança e Rastreabilidade (Ownership & Encerramento):** Garantir que apenas o autor possa alterar seu próprio post ou indicar a melhor resposta, enquanto encerramentos administrativos são restritos à equipe de suporte (`ROLE_TECNICO`/`ROLE_ADMIN`) mediante justificativa técnica obrigatória e auditoria.

## Decisão
Decidimos adotar um **Modelo Híbrido de Autorização (RBAC + ABAC em Memória)**:

1. **RBAC (Role-Based Access Control):**
   - Papéis de sistema armazenados na coluna `users.role` no banco de dados: `MEMBER` (`ROLE_USUARIO`), `MODERATOR` (`ROLE_TECNICO`) e `ADMIN` (`ROLE_ADMIN`).
   - Nomenclaturas N1, N2 e N3 são armazenadas na coluna informativa `users.job_title` e servem exclusivamente como badges visuais no perfil do usuário, sem restringir a leitura ou publicação no catálogo.
2. **ABAC (Attribute-Based Access Control):**
   - Atributos essenciais do usuário (`subject.userId`, `subject.isVerified`, `subject.roles`) são embarcados nos claims do JWT no momento da autenticação.
   - As regras de validação contextual (propriedade de post `authorId`, trava de e-mail não verificado `isVerified` e regras de rascunho offline `is_offline`) são avaliadas diretamente em memória na camada de Aplicação (`application/use-cases`) e nos middlewares do backend.

## Alternativas Consideradas

### 1. Sistema de Permissões 100% Dinâmico no Banco de Dados (Tabelas de Roles/Permissions/Policies)
- **Prós:** Permite criar novas permissões e associá-las a roles em tempo de execução via painel administrativo.
- **Contras:** Exige múltiplos JOINs no PostgreSQL a cada requisição HTTP ou um sistema complexo de cache distribuído; inviável para sincronização offline em dispositivos móveis (PWA).
- **Motivo da Rejeição:** Alta latência e complexidade desnecessária para um sistema colaborativo interno.

### 2. Controle de Acesso por Níveis Hierárquicos (N1 < N2 < N3)
- **Prós:** Controle rígido de quem visualiza ou altera determinados tipos de artigos.
- **Contras:** Cria gargalo de aprovação, inibe a colaboração comunitária estilo Q&A e gera frustração em analistas N1/N2 que conhecem a solução para problemas complexos.
- **Motivo da Rejeição:** Contraria a visão do produto estilo Stack Overflow onde o conhecimento deve ser livremente compartilhado entre pares verificados.

## Consequências

- **Performance:** Avaliação de autorização em memória com latência próxima de zero.
- **PWA Offline-First:** O PWA / Service Worker valida permissões do JWT localmente quando o técnico estiver em modo avião sem rede.
- **Clean Architecture & TDD:** Regras de permissão puras na camada de aplicação, facilitando a escrita de testes unitários e de integração com Jest/Supertest.
- **Auditoria Integrada:** Ações administrativas (como encerramentos por inatividade ou moderação de terceiros) registram logs de auditoria detalhados.
