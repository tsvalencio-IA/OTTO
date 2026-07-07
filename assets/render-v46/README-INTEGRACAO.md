# ATHOS V46 — Render Premium 10/10 Integrado

Arquivos da camada V46 integrados sem mexer em IDs, joystick, B Poder, Quiz/Falar, athos.glb, model-viewer, localStorage, manifest ou fluxo principal.

## Arquivos adicionados

- assets/render-v46/v46-render-premium.js
- assets/render-v46/v46-render-premium.css
- assets/render-v46/v46-render-config.json
- assets/render-v46/README-INTEGRACAO.md

## Integração feita

- CSS V46 importado depois do style.css.
- JS V46 importado antes do app.js.
- install(ctx) chamado após criação da scene Three.js.
- update(ctx, dt) chamado no loop do jogo.
- rebuildWorld(ctx, worldName) chamado a cada build/troca de mundo.
- Mundo real/AR mapeado para `real`, limpando a camada V46 sem usar câmera fake.

## Teste

Abra com `?v=46-render-premium-integrado` e rode `F12_TESTE_ATHOS_V46_RENDER_PREMIUM_INTEGRADO.js`.
