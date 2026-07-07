# Athos: Guardião dos Portais V40 — Render e Câmera

Esta versão parte da V39 estável e mexe somente na camada visual/câmera.

## Regra desta versão

Não foram alterados os controles, IDs, data-actions, data-move, data-world, AR, model-viewer, athos.glb, quiz/falar no lobby, dock mobile ou fluxo de entrada/saída.

## Melhorias aplicadas

- câmera mais cinematográfica, mais alta e com melhor visão da profundidade;
- suavização de câmera com rig interno;
- luz e exposição calibradas por mundo;
- horizonte visual para tirar aparência de vazio/debug;
- silhuetas e elementos de fundo por cenário;
- luzes discretas nas bordas da pista;
- runway visual antes do portal;
- spotlights suaves por fase;
- polimento de material do athos.glb sem alterar o arquivo;
- sombra de contato no personagem;
- mantido layout V39: Quiz/Falar somente no lobby.

## Como subir

Suba todos os arquivos deste ZIP na raiz do repositório `OTTO`, mantendo as pastas `icons/`, `assets/` e `moldes/`.

## Teste

Use `F12_TESTE_ATHOS_V40_RENDER_CAMERA.js` no Console do navegador após o deploy.

## O que NÃO foi mexido

- `athos.glb`;
- AR Nativo;
- Brincar Livre AR;
- Three.js/model-viewer;
- botões A/B/Y/X/N/R/I/Pausa/Sair;
- joystick e dock mobile;
- Quiz/Falar no lobby;
- lógica de fases, inimigos, poder e progresso.
