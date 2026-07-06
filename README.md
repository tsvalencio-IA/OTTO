# Athos: Guardião dos Portais — V31 1000/10

Versão completa para GitHub Pages, mantendo AR, Athos 3D real (`athos.glb`) e todos os modos principais.

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

## O que foi corrigido da V30

- O jogo agora inicializa o Three.js **depois** de abrir a tela de jogo, evitando canvas 1x1.
- Mantém o `athos.glb` real; não troca o personagem por imagem 2D.
- Mantém o `model-viewer` e o botão de AR Nativo.
- Mantém o modo Brincar Livre / AR por câmera.
- Adiciona botões visíveis de profundidade: `▲ Fundo`, `▼ Voltar`, `◀ Esq`, `▶ Dir`.
- Mantém joystick virtual para movimento diagonal fluido.
- Adiciona botão `N Normal` para voltar de mini/gigante.
- Pulo com direção ficou mais forte para atravessar buraco e cair em caixa/plataforma.
- Combo ao derrotar inimigos aumenta XP e desbloqueia medalha.
- Cenários ganharam mais camadas visuais, laterais, portais, árvores, pilares, estrelas, lava, beams e textura de pista.
- Materiais 3D migrados para `MeshStandardMaterial` com iluminação mais rica.
- Quiz expandido com 60+ perguntas locais.
- Athos responde mais assuntos por palavra-chave.

## Como testar

1. Suba o conteúdo desta pasta na raiz do GitHub Pages.
2. Abra no PC ou celular.
3. Toque em `Jogar Fases 3D`.
4. Use joystick ou botões:
   - `▲ Fundo`: ir para o fundo da fase.
   - `▼ Voltar`: voltar para o começo.
   - `◀/▶`: lateral.
   - `A`: pular.
   - `B`: poder.
   - `Y`: abaixar.
   - `X`: mini/normal/gigante.
   - `N`: normal direto.
5. Rode o script F12 se quiser validar botões e canvas.

## Observação

O aviso “Multiple instances of Three.js” pode aparecer por causa do `model-viewer` + Three.js na mesma página. Ele é aviso de biblioteca, não erro fatal do jogo.
