# Module: Frontend-UI

## Resumo
Este documento registra a implementação e os testes dos componentes visuais (UI Components) do Catálogo de Suporte TI, conectando o layout estático ao Backend.

## Componentes Criados
1. **`ProblemList`**:
   - Componente React primário encarregado de exibir a listagem de problemas recebidos da API.
   - Utiliza a estética **Glassmorphism Premium** definida anteriormente (translucidez, hover com leve flutuação dos cards).
   - Gerencia estados de UI avançados: `loading` (enquanto busca na API), `error` (em caso de falha de conexão) e `sucesso` (renderização dos cartões interativos).

## Integração
- O frontend agora consome com sucesso a rota `GET /api/v1/problems` do Backend configurado previamente, respeitando o modelo C/S (Client-Server) do projeto.

## Cobertura de Testes (TDD)
- **Vitest + React Testing Library**:
  - Teste 1: Simula o carregamento dos problemas pela API (via fetch mockado) e verifica se os estados transitam corretamente (Loading -> Rendering items).
  - Teste 2: Garante que erros de API (como uma quebra de conexão) não congelem a tela, exibindo um componente "Erro ao carregar o catálogo."
- Todos os testes de integração visual foram finalizados com **100% de sucesso (PASS)**.
