# ADP-001: Busca Inteligente e Abandono de IA Externa (MVP)

## Status
Aceito

## Contexto
O requisito da Fase 2 solicitou a transformação da página principal (uma listagem passiva de problemas) para uma interface de busca ativa, estilo Google. Inicialmente, cogitou-se utilizar IA Generativa (Google Gemini) para processar as buscas e formular respostas baseadas nos problemas cadastrados (Arquitetura RAG).

No entanto, há uma restrição de infraestrutura e custos operacionais neste estágio: não possuímos chaves de API comerciais (como a `GEMINI_API_KEY`) para injetar no ambiente.

## Decisão
Decidimos **não utilizar IA externa (APIs de LLM)** neste momento. Em vez disso, a "busca inteligente" será construída em cima do motor de **Full Text Search (FTS)** nativo do PostgreSQL. 

- O Postgres suporta busca léxica avançada (com *tsvector* e *tsquery*), permitindo matching semântico parcial, indexação rápida de textos e pontuação de relevância (ranking).
- A interface de usuário manterá o visual "Google-like", dando a ilusão de uma pesquisa extremamente inteligente sem a latência e os custos de uma chamada externa via rede.

## Consequências (Trade-offs)
- **Positivos:** Custo zero de API, arquitetura simplificada (sem dependência externa no backend), tempo de resposta extremamente rápido (latência de banco de dados local).
- **Negativos:** O motor não entende sinônimos complexos ou linguagem natural abstrata da mesma forma que um LLM entenderia (ex: "tela azul" vs "BSOD" precisam estar documentados textualmente no banco para que o FTS encontre a menos que criemos dicionários customizados no Postgres).
