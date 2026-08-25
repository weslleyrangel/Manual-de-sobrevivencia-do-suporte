# Auditoria, Revisão de Testes e PRD: Fase 3 (Gerenciamento de Conteúdo)

A pedido, realizei uma auditoria completa de tudo que foi construído até o momento, analisei nossa cobertura de testes e elaborei o rascunho de como as novas funcionalidades (Criar, Meus Posts, Editar, Apagar) vão se encaixar na aplicação.

## 1. Auditoria e Revisão do Estado Atual (Fase 1 e 2)

**Backend e Banco de Dados:**
- **Autenticação:** Sistema JWT seguro utilizando HttpOnly cookies. Fluxo de registro agora inclui confirmação de E-mail real (via Ethereal/Nodemailer).
- **Busca Inteligente:** Motor de busca full-text nativo (`tsvector`) configurado perfeitamente no PostgreSQL, que é incrivelmente rápido para bases offline-first.

**Testes Atuais (Unitários e Específicos):**
- O backend possui **16 testes passando** focados em endpoints individuais (ex: tentar logar sem senha, tentar buscar sem query, tentar acessar rota protegida sem token).
- Os testes estão em `tests/auth.test.js`, `problems.test.js` e `search.test.js`. Eles usam *mocks* de banco de dados (`jest.mock`), o que significa que são muito rápidos, mas não testam integrações reais.

**Frontend (PWA Glassmorphism):**
- Layout mobile finalizado e sem scroll.
- Telas prontas: `Login`, `Register`, `VerifyEmail`, e `SearchHome`.
- PWA configurado (Manifest e Service Worker).

---

## 2. Testes de Integração (Múltiplos Casos)

Atualmente usamos Mocks. Para testes de integração de fluxo completo (E2E), proponho criarmos uma suíte usando **Supertest + Banco de Testes em Memória** (ou um schema temporário no PostgreSQL) onde não zombaremos (mock) as requisições. 

O fluxo de um **Teste de Integração Master** cobriria:
1. `POST /register` -> Cria o usuário.
2. Acessa o banco -> Força `is_verified = true` direto no DB.
3. `POST /login` -> Salva o Cookie JWT recebido.
4. `POST /problems` -> Cria 5 posts diferentes.
5. `GET /search` -> Realiza uma busca e verifica se retornou os resultados esperados.

Isso nos dará 100% de confiança de que o banco de dados e os controllers estão conversando corretamente.

---

## 3. Atualização do PRD (Onde ficam as novas telas?)

Para acomodar as funcionalidades de **Posts (Problemas e Soluções)** de forma orgânica e profissional no sistema, atualizo o design e fluxo do PRD (Product Requirements Document):

### Onde fica a tela de "Cadastrar Novo Post"?
> **Na Tela de Busca (SearchHome):** Quando o usuário faz uma pesquisa e não encontra o que quer (ex: `"Nenhum problema encontrado"`), ou num **Botão Flutuante (FAB) "+"** constante no canto inferior direito da tela. Clicar ali abrirá um Modal Glassmorphism ou irá para uma nova rota `/create-post` com um formulário de Título, Descrição e Tags.

### Onde posso ver os "Meus Posts"?
> **No Menu de Usuário:** Lembra do botão "Sair" que colocamos na barra superior? Vamos substituí-lo por um **Dropdown (Avatar/Menu)**. Ao clicar, haverá a opção **"Meus Artigos / Minhas Publicações"**. Isso levará para a rota `/my-posts`, exibindo uma lista de cards apenas com conteúdos do próprio usuário.

### Como apagar ou editar meu post?
> **Na Rota `/my-posts` e na Página do Post (`/problem/:id`):**
> - O Backend precisará de duas novas rotas: `PUT /api/v1/problems/:id` e `DELETE /api/v1/problems/:id`. 
> - Adicionaremos uma regra de segurança (`middleware`): Só quem pode Editar ou Deletar um post é o usuário cujo `author_id` bata com o id do Token JWT logado.
> - No Frontend, em cada "card" da tela Meus Posts, haverá ícones de Lápis (Editar) e Lixeira (Apagar).

---

## Open Questions

> [!WARNING] Decisões de Design (Responda para podermos seguir)
> 1. **Testes:** Quer que eu crie esse ambiente de "Testes de Integração com Banco Real" no backend antes de construir o CRUD?
> 2. **Botão de Criar:** Prefere um botão flutuante **"+"** na tela de busca ou prefere que a opção de criar apareça APENAS quando a pessoa pesquisa por algo e não encontra resultado?
> 3. **Imagens/Arquivos:** Na hora de criar/editar um post, os técnicos poderão enviar imagens da solução (upload) ou apenas texto por enquanto?
