# PRD: IT Support Knowledge Catalog (Catálogo de Suporte TI)

## 1. Objective
Construir um sistema de suporte (base de conhecimento/catálogo) voltado para equipes de TI (focado inicialmente em níveis N1 e N2, com expansão futura para N3). O sistema servirá como um repositório centralizado de problemas e suas respectivas soluções (passo a passo), permitindo colaboração onde diferentes usuários podem sugerir métodos e soluções alternativas para o mesmo problema. A plataforma deve ter um foco **mobile-first**, permitindo que os usuários acessem as soluções e tutoriais mesmo **offline**, e deve possuir um design premium, limpo e agradável. Toda a aplicação rodará em contêineres **Docker**.

## 2. Core Features (MVP - Phase 2)
- **Busca Inteligente (Full Text Search):** A tela principal abandona a listagem passiva e adota uma interface de busca centralizada (estilo Google) usando recursos nativos do PostgreSQL para encontrar problemas e soluções por relevância.
- **Registro Público e Verificação:** Qualquer usuário pode criar uma conta, porém o login só é liberado após a confirmação do link enviado para o e-mail cadastrado (via serviço transacional).
- **Soluções e Passo a Passo:** Cada problema terá uma ou mais resoluções detalhadas com suporte a texto, múltiplas imagens e vídeos.
- **Colaboração (Soluções Alternativas):** Qualquer usuário verificado pode adicionar métodos diferentes para resolver um problema já cadastrado.
- **Mobile-First & Offline-First:** O sistema deve funcionar perfeitamente em telas de celular e possuir a capacidade de salvar conteúdos em cache (IndexedDB e Service Workers).

## 3. Tech Stack (Proposta)
- **Infraestrutura:** Docker e Docker Compose (Backend, Frontend e Banco de Dados rodando em contêineres).
- **Frontend:** React com Vite, configurado como PWA (Progressive Web App).
- **Estilização:** Vanilla CSS (com forte apelo visual, tipografia moderna, efeitos suaves e animações para uma sensação premium).
- **Armazenamento Offline (Frontend):** IndexedDB para dados estruturados (textos) e Cache API (via Service Workers) para imagens e vídeos.
- **Backend / Database:** API em Node.js (Express ou NestJS) conectada a um banco de dados PostgreSQL. Tudo isolado via Docker.

## 4. Commands
```bash
# Inicialização via Docker Compose
docker-compose up --build       # Sobe todos os serviços (Frontend, Backend, DB)
docker-compose down             # Derruba os contêineres

# Comandos de Qualidade (Executados dentro do contêiner ou via script)
npm run test:watch              # Inicia os testes em modo watch (TDD)
npm run lint                    # Verificação de código
```

## 5. Project Structure
```text
/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── components/ 
│   │   ├── pages/      
│   │   ├── services/   
│   │   └── App.jsx     
│   └── public/ (manifest e service workers)
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── routes/
│   └── tests/
└── database/
    └── init.sql (Scripts de inicialização do Postgres)
```

## 6. Code Style
- Componentes funcionais e hooks em React.
- Separação clara de responsabilidades: lógica de rede/offline estritamente separada da UI.
- Nomes de classes CSS semânticos.

## 7. Testing Strategy (TDD - Test-Driven Development)
- **Metodologia Principal:** Todo o desenvolvimento seguirá a prática de **TDD**. Os testes (falhos) devem ser escritos *antes* da implementação da lógica de produção, servindo como especificação viva do sistema.
- **Testes Unitários e de Integração:** Vitest (Frontend) e Jest/Supertest (Backend) para validar rotas, lógicas de negócio e Service Workers.
- **Testes de Componente:** React Testing Library focado no comportamento do usuário (ex: clicar no botão de salvar para uso offline).

## 8. Boundaries
- **Always do:** Escrever o teste antes do código (TDD); rodar a suíte de testes antes de cada commit.
- **Ask first:** Adicionar bibliotecas frontend pesadas; fazer mudanças estruturais no `docker-compose.yml`.
- **Never do:** Fazer bypass (pular) testes para entregar mais rápido. Se o teste não passou, o código não está pronto.

## 9. Success Criteria
- **Performance:** Carregamento visual inicial rápido (ex: LCP < 2s no mobile).
- **Offline:** O técnico pode abrir o app no modo avião e visualizar os problemas salvos no cache.
- **TDD:** 100% das novas funcionalidades são acompanhadas de testes descritivos, que foram criados antes da implementação real.

## 10. Business Decisions (Decisões Firmadas)

> [!NOTE]
> **Definições finais para o MVP:**
> 1. **Infraestrutura:** Setup próprio via Docker (Node.js + PostgreSQL + React).
> 2. **Metodologia:** Test-Driven Development (TDD) será estritamente seguido em todos os módulos.
> 3. **Autenticação:** O login será feito através de um cadastro próprio (e-mail e senha) armazenado no banco de dados.
> 4. **Fluxo de Aprovação:** Soluções publicadas por técnicos N1 e N2 ficam disponíveis imediatamente no catálogo, sem necessidade de aprovação de N3.
