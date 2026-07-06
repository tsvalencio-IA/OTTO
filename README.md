# Athos: Guardião dos Portais — V30

Versão completa para GitHub Pages.

## Arquivos principais

- `index.html` — estrutura do jogo, lobby, HUD, controles e modais.
- `style.css` — visual voxel, layout mobile, paisagem e controles.
- `app.js` — motor do jogo com Three.js, fases, colisão, inimigos, cristais, portais, quiz e fala.
- `athos.glb` — personagem 3D real do Athos.
- `manifest.webmanifest` — instalação como app.
- `sw.js` — service worker leve sem cache agressivo.
- `icons/` — ícones do app.
- `assets/moldes/` — moldes/imagens para impressão.

## Como subir

1. Extraia este ZIP.
2. Envie o conteúdo da pasta `athos-guardiao-v30-comercial` para a raiz do repositório.
3. Confirme que `index.html`, `app.js`, `style.css` e `athos.glb` estão na raiz.
4. Ative o GitHub Pages.
5. Abra no celular pelo link HTTPS.

## Como testar

1. Abra o jogo no celular.
2. Toque em **Jogar Fases 3D**.
3. Use o joystick da esquerda para ir para o fundo, voltar e mudar de lado.
4. Use **A** para pular, **B** para poder, **Y** para abaixar e **X** para tamanho.
5. Pule em cima de caixas e plataformas.
6. Colete cristais, derrote inimigos e entre no portal.
7. Teste também **Brincar Livre / AR por câmera** e **AR Nativo** no lobby.

## O que entrou na V30

- Controle por joystick virtual.
- Pulo com buffer e coyote time.
- Câmera suave seguindo Athos em profundidade.
- Caixas e plataformas sólidas.
- Fases longas com profundidade.
- Inimigos com tipos diferentes.
- Poder de fogo com projéteis.
- Cristais, portais, checkpoints, túneis e portões.
- Quiz integrado.
- Fala local com respostas por palavra-chave.
- Modo hub, fases, brincar livre e AR nativo.
- Progresso local com XP, fases e medalhas.

## Limitações honestas

- O AR Nativo depende do navegador e do celular. Em alguns aparelhos, o visualizador AR nativo não aceita controles dentro dele.
- O jogo principal com controles roda no modo Three.js dentro da página.
- A rotação de tela depende da configuração do celular; o navegador tenta adaptar e solicitar paisagem, mas não consegue forçar se o sistema bloquear.
