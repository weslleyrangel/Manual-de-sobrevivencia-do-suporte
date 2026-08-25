# Module: Frontend-Core

## Resumo
Este documento registra a configuração base do frontend utilizando React, Vite e Vitest, com foco em prover uma interface moderna (Glassmorphism), rápida e futuramente apta para Offline-Sync (PWA).

## Configurações e Decisões Arquiteturais
1. **React + Vite**: 
   - A escolha do Vite no lugar do Create React App (CRA) garante um ambiente de desenvolvimento muito mais rápido devido à sua natureza baseada em ESM.

2. **Testes (TDD)**:
   - Instalamos e configuramos o `vitest` e a `@testing-library/react`.
   - Ambiente `jsdom` ativado no `vite.config.js` para permitir testes de renderização na memória (simulando um navegador).

3. **Design e Estilização (Vanilla CSS & CSS Modules)**:
   - Criamos o `tokens.css` contendo variáveis globais com a paleta de cores (Dark Theme Premium) e tipografia (Inter).
   - O `global.css` define o comportamento "Glassmorphism" no `.glass-panel` usando propriedades como `backdrop-filter: blur(12px)` e sombras suaves, entregando um visual corporativo de alto nível e estética premium, atendendo perfeitamente ao requisito de design estipulado no PRD.

4. **Containerização**:
   - O `Dockerfile` do Frontend foi configurado para executar `npm install` e subir via `npm run dev -- --host`, o que permite expor o Vite na porta 5173 para uso do ambiente do desenvolvedor no Windows Host.
