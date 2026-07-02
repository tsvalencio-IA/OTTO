# Relatório técnico — Athos: Guardião dos Portais (v8, Claude)

## 1. Arquivos entregues / alterados

Reescrevi por completo `index.html`, `style.css` e `app.js`, usando
`01_BASE_PRINCIPAL_EXTRAIDA/OTTO-main/` como ponto de partida conceitual
(conteúdo do quiz, respostas do Athos, padrão de câmera/AR) mas com uma
arquitetura nova, porque o pedido central era sair do "model-viewer + CSS de
fundo" e entrar em **Three.js real**, com mundo 3D, missões e colisão.

- `index.html` — nova tela de Lobby (model-viewer) + nova tela de jogo
  fullscreen (canvas Three.js) + hotbar fixa + 4 modais (Quiz, Falar, Coleção,
  Dificuldade) + overlays de Pausa e Fim de jogo.
- `style.css` — visual voxel escuro com tokens em `:root` (cores, raios,
  sombras) para facilitar o retheming pela IA visual depois.
- `app.js` — engine completa (~62 KB), dividida internamente nos módulos
  abaixo.
- `athos.glb` — mantido sem nenhuma alteração.
- `manifest.webmanifest` — atualizado (nome/ícone do novo jogo).
- `.nojekyll`, `404.html`, `icons/`, `moldes/` — mantidos/reaproveitados.

## 2. Arquitetura da engine (dentro de `app.js`)

- **StorageManager** — único ponto de leitura/escrita do `localStorage`
  (`athosGP-state-v1`). Guarda `points`, `hearts`, `medals[]`,
  `currentMissionIndex`, `difficulty`, `unlockedWorlds[]`, `bestScore`,
  `quizStats{right,answered}`, `counters{...}` (usados para medalhas) e
  `phase`. `resetState()` implementa o botão "Resetar progresso".
- **AthosBrain** — respostas locais por palavra-chave (sem API paga), cobrindo
  os temas pedidos (quem é, poderes, fogo, Otto, portal, missão, medo, amigo,
  mundo, castelo, floresta, espaço, gigante, mini, quiz) + `speechSynthesis`
  para o Athos falar, e `SpeechRecognition` com verificação segura de suporte
  (não quebra em navegadores sem voz).
- **QuizManager** — 12 perguntas infantis sobre o universo do Athos, com
  embaralhamento, pontuação e integração com missão de quiz.
- **WorldBuilder** — constrói cada mundo 3D: chão sólido (`MeshLambertMaterial`,
  nunca `ShadowMaterial` como chão colorido), blocos decorativos via
  `InstancedMesh` (performance), iluminação própria por mundo
  (`AmbientLight` + `DirectionalLight` com sombra + `PointLight` de destaque),
  e os 8 objetos interativos das missões, sempre nas mesmas posições
  ("lanes"): cristal esquerdo, túnel (agachar), obstáculo (pular), bloco
  escuro (poder), portal (girar), portão (gigante), mini-túnel e cristal
  direito.
- **MissionManager** — decide os passos da missão atual a partir da
  dificuldade: Fácil = 1 passo, sem tempo; Médio = 2 passos em sequência, 30 s;
  Difícil = 3 passos em sequência, 18 s, com bônus por sequência perfeita. A
  cada 5 rodadas, a missão vira um desafio de quiz. O `MissionManager` não
  sabe nada sobre Three.js: só recebe eventos (`stepComplete`,
  `missionComplete`, `stepFail`, `timeout`) que o `GameEngine` interpreta.
- **GameEngine** — o Three.js propriamente dito: cria `Scene`, `PerspectiveCamera`,
  `WebGLRenderer` (com `renderer.domElement.id = 'three-canvas'`), carrega o
  `athos.glb` via `GLTFLoader`, controla física simples (gravidade/pulo,
  agachar por tempo, girar por animação, escala mini/normal/gigante),
  colisão por proximidade (zonas), câmera em terceira pessoa que segue o
  jogador, partículas do poder de fogo, HUD, hotbar, pausa e fim de jogo.
- **LobbyEngine** — liga o `model-viewer` do Lobby, os stats (pontos,
  corações, medalhas, fase, dificuldade), o botão de AR Nativo e os botões
  principais.

## 3. Como o Athos GLB é carregado

`GameEngine.loadPlayer()` usa `GLTFLoader` para carregar `./athos.glb`. Ao
carregar com sucesso, eu normalizo a escala (altura alvo ~1,9 unidades) e
alinho os pés ao chão via bounding box, guardando o modelo dentro de um
`playerRig` (um `THREE.Group`) — assim todas as ações (mover, pular, agachar,
girar, crescer/diminuir) só mexem no `Group`, sem tocar na malha original.

Se o `athos.glb` falhar ao carregar (erro de rede, arquivo corrompido etc.), o
`GameEngine` cria um **Athos alternativo procedural** (boxes pretos, olhos
vermelhos, "chamas" laranja nos braços e pés) só para o jogo continuar
jogável — exatamente como pedido no requisito 10 dos bugs críticos: o
fallback só entra em cena se o GLB não carregar; o fluxo principal sempre
tenta o `athos.glb` primeiro.

## 4. Como funcionam as missões (condição real, não só o botão)

Cada tipo de passo tem uma zona (posição X do objeto no mundo) e uma condição
real, verificada a cada frame:

- **Pular**: sucesso se o jogador estiver dentro da zona do obstáculo E em
  estado de pulo (`isJumping`); erro (perde coração fora do Fácil) se ficar
  parado dentro da zona sem pular por mais de 0,7 s.
- **Agachar**: mesma lógica, comparando `isCrouching` dentro da zona do
  túnel baixo.
- **Coletar cristal (esquerda/direita)**: sucesso ao entrar na zona do
  cristal; o cristal some com partículas e pontos.
- **Ficar gigante / mini**: sucesso se o jogador estiver com a escala certa
  (`sizeState`) dentro da zona do portão/mini-túnel; o portão de "gigante"
  anima abrindo as duas portas.
- **Poder** e **Girar**: são ações pontuais — verificadas no momento em que o
  botão é apertado, checando a proximidade do jogador com o bloco escuro ou
  o portal naquele instante.
- **Quiz**: a cada 5ª rodada, a missão vira "vá até o portal e responda o
  quiz"; a resposta certa conclui a missão.

Em todos os casos existe: objetivo claro (texto no HUD), ação esperada,
condição de vitória e de erro, pontos, possível perda de coração, feedback
visual (toast) e avanço automático para a próxima missão.

## 5. Como funcionam as colisões

Não uso um motor de física completo (não é necessário para este jogo). Uso
checagem de proximidade em 1D (`Math.abs(player.x - objeto.x) < 1.9`), que é
suficiente porque os objetos ficam sempre alinhados na mesma profundidade
(Z). Isso mantém o código simples, previsível em celulares fracos e fácil de
uma outra IA ajustar depois. Erros de colisão (bater no obstáculo sem pular,
esbarrar no túnel sem agachar) usam um pequeno acumulador de tempo
(`zoneCollisionTick`) para não punir um toque acidental de um frame só.

## 6. Como funcionam os mundos

`WorldBuilder.build(scene, worldId)` limpa completamente o grupo do mundo
anterior (`scene.remove` + `dispose()` de geometria/material, para não
vazar memória) e monta o novo: chão, decoração, luzes e os 8 objetos de
missão. Os 6 mundos (Campo dos Blocos, Vulcão Pixel, Floresta Voxel, Castelo
de Pedra, Espaço Cubo, Arena dos Portais) têm paletas de cor, luz e neblina
próprias. Existe ainda um 7º "mundo" especial, **Mundo Real**, disponível só
no Brincar Livre, que desliga o fundo 3D (`scene.background = null`,
`renderer.setClearColor(0,0)`) e liga a câmera do celular atrás do canvas
transparente — seguindo à risca os patches do documento de bugs (iniciar
`startCamera()`/`stopCamera()` corretamente, canvas transparente, sem travar
se a câmera for negada).

Progressão: a cada 3 fases completadas em modo Missões, o próximo mundo da
lista é desbloqueado (`unlockedWorlds`) e um aviso aparece na tela.

## 7. Como funciona o Quiz

Fica em `QuizManager`, com 12 perguntas fixas (baseadas no universo do
Athos, sem precisar de API externa). Pode ser aberto de duas formas: pelo
Lobby (livre, sem afetar missão) ou pelo botão "Quiz" da hotbar durante o
jogo — nesse caso, se a missão atual for do tipo quiz, acertar a pergunta
conclui a missão automaticamente.

## 8. Como funciona a fala local (Athos Brain)

`AthosBrain.answer(texto)` normaliza o texto (minúsculas, sem acento) e
compara com palavras-chave para escolher uma resposta pronta, sempre lida em
voz alta via `speechSynthesis` (pt-BR) quando o navegador suporta. A entrada
por voz usa `SpeechRecognition`/`webkitSpeechRecognition` com checagem de
suporte antes de instanciar (patch do documento de bugs), evitando erro em
navegadores sem essa API.

## 9. Como funciona o localStorage

Tudo passa por `StorageManager`, que carrega o estado uma vez, guarda em
memória e salva a cada mudança relevante (pontos, corações, medalhas,
missão atual, dificuldade, mundos desbloqueados, recorde, estatísticas de
quiz, contadores usados para medalhas, fase). O botão "Resetar progresso"
chama `StorageManager.reset()`, que grava o estado padrão de novo.

## 10. Patches do documento de bugs aplicados

1. `$`/`$$` definidos no topo do arquivo.
2. Nunca zero a `className` da tela do jogo; troco só a visibilidade via
   `hidden` e a marcação de tela ativa via `data-screen` no `#app`.
3. `renderer.domElement.id = 'three-canvas'` logo após criar o renderer.
4. Chão usa `MeshLambertMaterial`/`MeshStandardMaterial`, nunca
   `ShadowMaterial` como piso colorido.
5. `startCamera()`/`stopCamera()` chamados corretamente ao entrar/sair do
   Mundo Real.
6. No Mundo Real, `scene.background = null` e
   `renderer.setClearColor(0x000000, 0)`.
7. `SpeechRecognition` só é instanciado depois de checar se existe.
8. Sem loop duplicado: `GameEngine.start()` só inicia um novo
   `requestAnimationFrame` se `running` for falso; `stop()` cancela o frame
   pendente.
9. Um único listener de `resize`, guardado por uma flag (`resizeAttached`).
10. Hotbar fixa, com `grid` de 6 colunas e `padding-bottom` somando a área
    segura do celular (`env(safe-area-inset-bottom)`), sem scroll.
11. O fluxo principal sempre tenta `athos.glb`; o fallback procedural só
    aparece se o carregamento falhar.

## 11. Limitações conhecidas

- A "colisão" é por proximidade em 1D, não física real de corpos rígidos —
  suficiente para o estilo do jogo, mas um obstáculo não empurra fisicamente
  o personagem.
- O AR Nativo depende 100% do navegador/aparelho (Scene Viewer no Android,
  Quick Look no iPhone); em desktop ou navegadores sem suporte, o botão
  mostra um aviso e sugere usar "Jogar Missões" ou "Brincar Livre".
- A troca de mundo durante o jogo é feita pelo menu de pausa (não há um
  botão dedicado na hotbar, para não lotar o rodapé); o requisito de trocar
  cenário fica plenamente atendido, só que dentro do menu de pausa em vez de
  um botão solto.
- O reconhecimento de voz (pergunta falada) depende do navegador suportar
  `SpeechRecognition` (funciona bem no Chrome Android; pode não existir no
  Firefox, por exemplo) — quando não suporta, o Athos avisa e sugere digitar.
- Não incluí `sw.js` nesta entrega (ver justificativa no `README.md`) para
  evitar o problema de cache antigo relatado no histórico do projeto.
- O visual é funcional, mas deliberadamente "cru" nos detalhes finos de
  iluminação/textura — como o próprio pacote de handoff pede, o acabamento
  visual fica para a próxima etapa (Gemini Canvas).

## 12. Próximos pontos sugeridos para o Gemini Canvas

- Substituir os blocos/geometrias simples (BoxGeometry, TorusGeometry,
  OctahedronGeometry) por modelos/texturas voxel mais ricos, mantendo os
  mesmos nomes de objeto (`objects.jump`, `objects.crouch`,
  `objects.collectLeft`, etc.) e as mesmas posições (`WorldBuilder.LANE_X`)
  para não quebrar a lógica de missão.
- Melhorar luz/sombra/pós-processamento (bloom leve no fogo e nos cristais,
  por exemplo).
- Ajustar paletas de cor por mundo em `WORLDS` (topo do `app.js`) — já estão
  isoladas em um único array de configuração, fácil de re-tema.
- Melhorar a animação do personagem (o `athos.glb` atual não tem animações
  internas úteis; se um novo GLB com animações for enviado, dá para tocar
  clipes via `AnimationMixer` nos momentos de pular/girar/andar).
- Refinar o HUD e os modais (tipografia, ícones customizados no lugar dos
  emojis) sem mexer nos `id`/`data-action` usados pelo `app.js`.
