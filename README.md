# Athos: Guardião dos Portais — V34 FINAL

**Powered by thIAguinho Soluções Digitais**

Esta versão foi consolidada a partir de três bases: **OTTO-main**, **V32 validada por F12** e **V33 Codex**. O objetivo foi entregar uma versão completa e saneada para subir definitivamente no GitHub Pages, sem remover AR, sem remover 3D e sem trocar o Athos por imagem 2D.

## O que foi mantido

- `athos.glb` na raiz.
- `model-viewer` para visualização 3D e AR Nativo.
- Three.js + GLTFLoader para o jogo 3D.
- Brincar Livre / AR por câmera.
- Joystick virtual.
- Botões de profundidade: ▲ Fundo, ▼ Voltar, ◀ Esq, ▶ Dir.
- Botões de ação: A Pular, B Poder, Y Abaixar, X Tamanho, N Normal, R Girar, I Interagir, Quiz, Falar, Pausa e Sair.
- Quiz expandido com mais de 80 perguntas.
- Falar com Athos local, sem API paga.
- Fases, cristais, inimigos, portais, medalhas, XP e progresso localStorage.
- Moldes/imagens e ícones em pastas reais para GitHub Pages.

## Correções importantes

- Botão **B Poder** ficou inequívoco: `id="powerBtn"` e `data-action="power"`.
- Botões de cenário usam `data-world`, sem conflitar com ações.
- Canvas do Three.js tem fallback contra 1x1 e redimensiona em `resize/orientationchange`.
- Manifest atualizado para V34 FINAL.
- Service Worker leve, sem cache agressivo de `index.html`, `app.js` e `style.css`.
- ZIP gerado com pastas reais `icons/`, `assets/moldes/` e `moldes/`, sem barras invertidas no nome.
- Script F12 forte incluído em `F12_TESTE_ATHOS_V34_FINAL.js`.

## Como subir no GitHub Pages

1. Extraia o ZIP.
2. Entre na pasta `athos-guardiao-v34-final`.
3. Envie **o conteúdo dessa pasta** para a raiz do repositório.
4. Confirme que `index.html`, `app.js`, `style.css` e `athos.glb` estão na raiz.
5. Aguarde o deploy do GitHub Pages.
6. Abra a página no celular.

## Como testar

No PC, abra a página publicada, aperte **F12 > Console**, cole o conteúdo de:

`F12_TESTE_ATHOS_V34_FINAL.js`

O teste verifica arquivos, AR, 3D, canvas, botões, B Poder, joystick, quiz, fala, localStorage e ausência de erros JS.

## Observação honesta

Esta é uma versão completa e muito superior às anteriores, mas jogo comercial de verdade sempre exige teste físico no celular, ajuste fino de câmera/física e balanceamento. Esta entrega está pronta para subir, testar e evoluir de forma controlada.
