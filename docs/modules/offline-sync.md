# Module: Offline-Sync

## Resumo
Este documento registra a implementação da resiliência de rede do Frontend (capacidade Offline-First). Essencial para técnicos de TI que precisam acessar o catálogo em locais sem sinal (ex: datacenters, subsolos).

## Componentes Criados
1. **Armazenamento Local (IndexedDB)**:
   - Arquivo utilitário `offlineStore.js` gerencia as transações nativas com o banco de dados do navegador.
   - Operações: `saveProblemsOffline()` (Sobrescreve o cache com os dados mais recentes) e `getOfflineProblems()` (Recupera os dados em caso de queda).

2. **Lógica de Fallback**:
   - Injetada no componente `ProblemList.jsx`. 
   - Fluxo de Sucesso: `Fetch API -> Exibe os dados -> Salva no IndexedDB silenciosamente`.
   - Fluxo de Erro (Offline): `Fetch falha -> Tenta resgatar do IndexedDB -> Exibe dados cacheados + Banner de Aviso`.

## Cobertura de Testes (TDD)
- **Vitest + Mocking**:
  - Simulamos uma falha de rede (`TypeError: Failed to fetch`) para testar o comportamento do componente.
  - Simulamos que o IndexedDB possuía dados salvos anteriormente através de *mocks* no Vitest.
  - O teste valida se o banner "Você está visualizando o modo Offline" aparece na tela e se o conteúdo do cache é de fato renderizado.
- Teste concluído com sucesso. O sistema PWA Offline-First está funcional no contexto de visualização do catálogo.
