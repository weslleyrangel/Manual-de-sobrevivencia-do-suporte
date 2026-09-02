# Documentação: Design System, Telas e Roteamento

Este documento detalha a implementação das telas, arquitetura de componentes, Design System e estratégias de responsividade (Mobile e Desktop) criadas com base no arquivo [Design.pen](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/Design.pen).

---

## 📌 1. Visão Geral da Arquitetura

O frontend da aplicação **Manual de Sobrevivência do Suporte** foi totalmente reestruturado em uma arquitetura modular React (Vite + React Router Dom v7), adotando um padrão **Mobile-First com Adaptação Desktop Fluida**.

### Estrutura de Diretórios
```text
frontend/src/
├── components/
│   ├── common/
│   │   └── Icons.jsx             # Utilitário com ícones SVG vetoriais nítidos
│   └── layout/
│       ├── AppLayout.jsx         # Layout responsivo (Mobile container + Desktop Header/Sidebar)
│       ├── AppLayout.css
│       ├── BottomNav.jsx         # Barra de navegação inferior fixa para dispositivos móveis
│       └── BottomNav.css
├── pages/
│   ├── Login.jsx & Login.css
│   ├── Register.jsx & Register.css
│   ├── ProfessionalSetup.jsx & ProfessionalSetup.css
│   ├── Home.jsx & Home.css
│   ├── Search.jsx & Search.css
│   ├── Profile.jsx & Profile.css
│   ├── MyPublications.jsx & MyPublications.css
│   ├── NewPublication.jsx & NewPublication.css
│   ├── PublicationDetail.jsx & PublicationDetail.css
│   └── Menu.jsx & Menu.css
├── styles/
│   ├── tokens.css                # Variáveis de cores, tipografia, bordas e sombras
│   └── global.css                # Reset, fontes, container responsivo e animações
├── context/
│   └── AuthContext.jsx           # Gerenciamento de sessão de usuário
├── App.jsx                       # Configuração de todas as rotas com code-splitting
└── main.jsx                      # Ponto de entrada React com tema e providers
```

---

## 🎨 2. Design System & Tokens Visuais

Baseado nas diretrizes extraídas de [Design.pen](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/Design.pen):

### Tipografia
* **Títulos e Destaques:** `Funnel Sans` (Bold, 700 / 600) — Tipografia humanista com alta legibilidade.
* **Textos e Formulários:** `Inter` (Regular, Medium, Semi-bold) — Padrão de precisão para interfaces de suporte.

### Paleta de Cores
| Token | Cor | Uso Principal |
| :--- | :--- | :--- |
| `--green-leaf` / `--accent-primary` | `#247A3D` | Botões primários, ícones ativos, links de destaque |
| `--green-deep` | `#14532D` | Cartões de destaque, avatares, cabeçalhos escuros |
| `--green-mint` | `#DFF3E4` | Tags de boas práticas, badges de status resolvido, fundos ativos |
| `--yellow-signal` | `#F4C542` | Ícones de lâmpada/dica, destaque de avatares, indicadores |
| `--yellow-pale` | `#FFF3B8` | Badges de etapas (Etapa 1 e 2), botões de ajuda e atalhos rápidos |
| `--cream` | `#FBFAF3` | Fundo principal da aplicação |
| `--ink` | `#111111` | Textos principais, títulos e ícones escuros |
| `--surface-primary` | `#FFFFFF` | Superfície de cartões, modais e inputs |

### Suporte a Dark Mode
A aplicação conta com alternância de tema no [Menu](file:///c:/Users/weslley/Downloads/Manual%20de%20suporte/frontend/src/pages/Menu.jsx) via `data-theme="dark"`, com inversão automática de contrastes (`#121611`, `#1C221A`, `#75D18C`, `#FFD866`).

---

## 🚀 3. Telas e Rotas Implementadas

### 1. `/login` — Login Mobile
* **Elementos:** Identidade visual, botão de Ajuda superior, formulário com e-mail corporativo, senha com toggle de visibilidade (`eye`/`eye-off`), checkbox "Lembrar de mim", link "Esqueceu a senha", botão "Entrar no manual" e rodapé de cadastro.

### 2. `/register` — Cadastro Mobile (Etapa 1)
* **Elementos:** Badge "ETAPA 1 DE 2", campos de Nome Completo, E-mail, Senha e checkbox de consentimento aos Termos e Política de Privacidade.

### 3. `/register/professional` — Cadastro Profissional (Etapa 2)
* **Elementos:** Badge "ETAPA 2 DE 2", seleção de Área (`briefcase-business`), Função (`badge-check`) e Nível de experiência (`sprout`) para personalização dos atalhos de suporte.

### 4. `/` — Início (Home Feed)
* **Elementos:** Saudação adaptada ao horário do turno (*Bom dia / Boa tarde / Boa noite*), barra de pesquisa instantânea, card em destaque **Dica de Sobrevivência** (`lightbulb`), grid de **Acesso Rápido** (*Primeiros passos* e *Scripts prontos*) e card **Continue de onde parou** (*Última leitura*).

### 5. `/search` — Pesquisa Avançada
* **Elementos:** Campo de busca em tempo real, lista de buscas recentes com botão de limpeza (`history`), filtros de exploração por tema (*Atendimento*, *Processos*, *Ferramentas*) e card de sugestão de leitura.

### 6. `/profile` — Meu Perfil
* **Elementos:** Avatar circular com iniciais e cargo de analista, painel de indicadores (12 publicações, 38 curtidas, 4 salvos) e atalhos para *Minhas publicações*, *Criar publicação* e *Configurar área*.

### 7. `/my-publications` — Minhas Publicações
* **Elementos:** Filtros em abas (*Todas*, *Rascunhos*, *Publicadas*), lista de artigos com tags coloridas (*Boas práticas*, *Rotinas*, *Rascunho*), métricas de curtidas/comentários e botão flutuante de criação.

### 8. `/new-publication` — Nova Publicação
* **Elementos:** Formulário com título, seletor de categorias, caixa de texto com contador dinâmico (até 1.200 caracteres), gerenciador dinâmico de **Passos e Imagens** (upload de prints, descrições por etapa, adição e remoção) e botões para salvar rascunho ou publicar.

### 9. `/publication/:id` — Detalhes da Publicação
* **Elementos:** Informações do autor, horário, badge de status **RESOLVIDO**, banner de imagem anexada, card estruturado **COMO FOI SOLUCIONADO** com passos numerados, botões de ação (*Útil*, *Salvar*, *Compartilhar*) e seção interativa de comentários em tempo real.

### 10. `/menu` — Menu & Configurações
* **Elementos:** Card de resumo do perfil, links de configurações, alternador interativo de **Modo Escuro (Dark Mode)**, central de ajuda interna e botão de logout.

---

## 🖥️ 4. Responsividade e Adaptação Desktop

Para garantir uma experiência de excelência tanto em smartphones quanto em telas grandes:
1. **Em Dispositivos Móveis (<1024px):** A tela assume dimensões fluidas de 390px-480px com a barra de navegação inferior `BottomNav` fixa.
2. **Em Telas Desktop (≥1024px):** O `AppLayout` exibe um cabeçalho superior (`desktop-navbar`) com navegação rápida, atalho para Nova Publicação e botão de perfil, com conteúdo centralizado e cartões em largura expandida.
