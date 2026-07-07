# Athos Adventure 3D+ — V47.1 Render Fix + Gameplay

Pacote completo limpo para GitHub Pages.

## Como usar

Suba todos os arquivos da raiz deste ZIP no repositório GitHub Pages.

Abra com:

```text
?v=471-render-fix-gameplay
```

## Testes incluídos

1. `F12_TESTE_ATHOS_V47_FINAL_RENDER_GAMEPLAY.js`
2. `F12_TESTE_ATHOS_GAMEPLAY_ENGINE_10.js`

## Correção principal V47.1

A V47 anterior carregava, mas o render premium falhava durante `rebuildWorld` porque a camada Gemini esperava inimigos como `Object3D`, enquanto o motor do jogo usa inimigos como objetos `{ mesh, type, hp... }`.

Nesta V47.1:

- `v47-render-premium.js` aceita inimigos do motor real;
- `app.js` passa `platforms`, `enemies`, `portalMesh` e `crystals` reais para o contexto V47;
- o render premium cria cenário rico mesmo se algum item do motor não puder ser reskinado;
- mundo Real não cria cenário/câmera fake;
- joystick, B Poder, Quiz/Falar, AR Nativo e model-viewer foram preservados.
