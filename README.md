# Athos Guardião dos Portais — V32 1000/10

Versão de correção e polimento em cima da V31.

## O que foi corrigido

- Botão **JOGAR FASES 3D** agora aparece também no topo do lobby como botão grande e explícito.
- Botão de AR Nativo externo adicionado abaixo do model-viewer, sem remover o AR interno.
- Modal de quiz/fala agora esconde os controles do jogo por baixo para evitar clique errado no botão **▼ Voltar**.
- Botão de fechar modal agora está como **X Fechar**.
- Alternativas do quiz agora recebem `data-test="quiz-option"` e `aria-label`, ficando mais fáceis de testar.
- `app.js` validado com `node --check`.
- Mantido `athos.glb`, `model-viewer`, Three.js, AR nativo, Brincar Livre por câmera, fases, inimigos, cristais, portais e controles.

## Arquivos principais

- `index.html`
- `style.css`
- `app.js`
- `athos.glb`
- `manifest.webmanifest`
- `sw.js`
- `.nojekyll`
- `icons/`
- `assets/moldes/`

## Como subir

Envie o conteúdo desta pasta para a raiz do GitHub Pages. Confirme que `index.html`, `style.css`, `app.js` e `athos.glb` estão juntos na raiz.

## Como testar

1. Abra no navegador pelo link HTTPS do GitHub Pages.
2. Clique em **JOGAR FASES 3D**.
3. Teste joystick, ▲ Fundo, ▼ Voltar, ◀ Esq, ▶ Dir, A Pular, B Poder, Y Abaixar, X Tamanho, N Normal.
4. Teste Quiz e Falar com Athos.
5. Teste Brincar Livre / AR por câmera no celular.
6. Teste AR Nativo pelo botão externo ou pelo botão do model-viewer.

## Observação

O AR Nativo depende do visualizador do celular. O jogo completo com botões fica no modo Three.js e Brincar Livre / AR por câmera.
