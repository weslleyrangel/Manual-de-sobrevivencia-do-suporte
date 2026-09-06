# 📚 Manual de Sobrevivência do Suporte - Índice da Documentação

Guia mestre de navegação para a documentação técnica, arquitetural e de produto do projeto **Manual de Sobrevivência do Suporte**.

---

## 🏛️ Decisões de Arquitetura (ADPs)

Decisões fundamentais que guiam a engenharia do software e sua evolução:

| Documento | Descrição |
| :--- | :--- |
| [**ADP-001: Busca Inteligente Full-Text**](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/docs/ADP-001-Smart-Search.md) | Arquitetura do motor de busca textual nativo com PostgreSQL (`to_tsvector` e ranking de relevância). |
| [**ADP-002: Modelo Híbrido de Autorização RBAC / ABAC**](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/docs/ADP-002-Hybrid-RBAC-ABAC-Authorization.md) | Estrutura de papéis (`MEMBER`, `MODERATOR`, `ADMIN`) e regras contextuais baseadas em posse (`author_id`). |
| [**ADP-003: Refinamentos Full-Stack e Clean Architecture**](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/docs/ADP-003-FullStack-Refinements-Performance-Architecture.md) | Desacoplamento de queries, repositórios de leitura, índices GIN e hierarquia de erros de domínio. |
| [**ADP-004: Blindagem de Segurança e Autenticação**](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/docs/ADP-004-Auth-Security-Hardening-And-Resilience.md) | Correção de Mass Assignment, Rate Limiting, prevenção de vazamentos no client-side e recuperação de senha. |

---

## 📋 Especificações de Domínio e Produto

| Documento | Descrição |
| :--- | :--- |
| [**PRD (Product Requirements Document)**](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/docs/PRD.md) | Visão geral do produto, personas, requisitos funcionais e não-funcionais. |
| [**Casos de Uso DDD**](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/docs/USE_CASES_DDD.md) | Mapeamento dos casos de uso de criação, edição, aceitação de soluções e moderação seguindo Domain-Driven Design. |
| [**Modelo Conceitual RBAC / ABAC**](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/docs/RBAC_ABAC_MODEL.md) | Matriz de permissões, políticas de acesso e estrutura de dados de controle. |
| [**Casos de Uso de Segurança e Permissões**](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/docs/RBAC_ABAC_USE_CASES.md) | Regras de validação contextual de posse, moderação administrativa e curadoria. |
| [**Catálogo de Usuários e Permissões**](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/docs/USUARIOS_E_PERMISSOES.md) | Perfis de acesso e dados dos usuários seed do sistema. |

---

## 🎨 Design System e Contratos de API

| Documento | Descrição |
| :--- | :--- |
| [**Design System e Telas**](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/docs/DESIGN_SYSTEM_AND_SCREENS.md) | Guia visual, paleta de cores (Warm Editorial / Nature), tipografia e componentes UI. |
| [**Contrato REST de API**](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/docs/design/api-contract.md) | Endpoints, payloads, headers e respostas das APIs de autenticação, problemas e busca. |

---

## 🗄️ Módulos e Infraestrutura

- [**Módulo Backend API**](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/docs/modules/backend-api.md)
- [**Módulo Backend Core (Domínio & Repositórios)**](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/docs/modules/backend-core.md)
- [**Módulo Frontend UI (React & Estilos)**](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/docs/modules/frontend-ui.md)
- [**Módulo Frontend Core (Estado & Contextos)**](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/docs/modules/frontend-core.md)
- [**Módulo Offline Sync (PWA & IndexedDB)**](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/docs/modules/offline-sync.md)
- [**Módulo Infraestrutura & Docker**](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/docs/modules/infra.md)
- [**Seed do Banco e Integrações**](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/docs/DATABASE_SEED_AND_INTEGRATIONS.md)
