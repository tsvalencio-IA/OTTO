# Athos: Guardião dos Portais V39 — Controles Limpos

Correção cirúrgica em cima da V38.

## O que mudou

- `Quiz` e `Falar` foram removidos do controle durante o jogo.
- `Quiz` e `Falar` continuam existindo na tela inicial/lobby.
- A grade do controle durante o jogo agora fica com 9 botões:
  - A Pular
  - B Poder
  - Y Abaixar
  - X Tamanho
  - N Normal
  - R Girar
  - I Ação
  - Pausa
  - Sair
- Foi adicionada regra CSS de segurança para esconder qualquer botão antigo `data-action="quiz"` ou `data-action="ask"` dentro do controle do jogo, caso o navegador ainda esteja com algum HTML velho em cache.
- O `handleAction()` também não abre mais Quiz/Falar por ação de controle durante o jogo.

## O que NÃO foi removido

- `athos.glb`
- AR Nativo
- Brincar Livre AR
- Three.js
- Render premium
- Fases
- Inimigos
- Cristais
- Portais
- Quiz no lobby
- Falar com Athos no lobby
- Medalhas/progresso

## Como subir

Suba todo o conteúdo deste ZIP na raiz do repositório OTTO, mantendo as pastas `icons/`, `assets/` e `moldes/`.

## Teste F12

Após o deploy, abra o jogo, pressione F12 > Console e cole o conteúdo de:

`F12_TESTE_ATHOS_V39_CONTROLES_LIMPOS.js`

O teste confirma que Quiz/Falar aparecem no lobby, mas não aparecem no controle durante o jogo.
