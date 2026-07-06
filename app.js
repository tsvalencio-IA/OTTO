(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const now = () => performance.now();

  const els = {
    lobby: $('#lobby'), game: $('#game'), stage: $('#threeStage'), cameraFeed: $('#cameraFeed'), flash: $('#screenFlash'),
    nativeViewer: $('#nativeViewer'), modelStatus: $('#modelStatus'), difficultySelect: $('#difficultySelect'),
    playBtn: $('#playBtn'), hubBtn: $('#hubBtn'), freeBtn: $('#freeBtn'), quizBtn: $('#quizBtn'), askBtn: $('#askBtn'), collectionBtn: $('#collectionBtn'), resetBtn: $('#resetBtn'),
    statXP: $('#statXP'), statLevel: $('#statLevel'), statMedals: $('#statMedals'), statBest: $('#statBest'),
    hudHearts: $('#hudHearts'), hudXP: $('#hudXP'), hudCrystals: $('#hudCrystals'), hudEnemies: $('#hudEnemies'), hudTime: $('#hudTime'),
    worldName: $('#worldName'), objectiveText: $('#objectiveText'), objectiveProgress: $('#objectiveProgress'), toast: $('#toast'),
    tutorialBox: $('#tutorialBox'), tutorialTitle: $('#tutorialTitle'), tutorialText: $('#tutorialText'), miniPlayer: $('#miniPlayer'), miniPortal: $('#miniPortal'),
    joystick: $('#joystick'), joyKnob: $('#joyKnob'), pauseBtn: $('#pauseBtn'), exitBtn: $('#exitBtn'),
    modal: $('#modal'), modalTitle: $('#modalTitle'), modalBody: $('#modalBody'), modalClose: $('#modalClose')
  };

  const STORAGE_KEY = 'athos_guardiao_v31_progress';
  const LEGACY_STORAGE_KEYS = ['athos_guardiao_v30_progress','athos_guardiao_v25_progress'];
  const WORLD = {
    hub: { name:'Hub dos Portais', sky:0x101827, fog:0x172033, ground:0x334155, grid:0x38bdf8, accent:0xfacc15, light:0xffffff },
    field: { name:'Campo dos Blocos', sky:0x88c7ff, fog:0x8fd0ff, ground:0x3a8f34, grid:0x2e6f24, accent:0xfacc15, light:0xfff3c4 },
    fire: { name:'Vulcão Pixel', sky:0x260607, fog:0x3b0808, ground:0x451010, grid:0xff5a1e, accent:0xffd000, light:0xffc29b },
    forest: { name:'Floresta Voxel', sky:0x7fc9ff, fog:0x93c47d, ground:0x1f6d35, grid:0x79b044, accent:0x22c55e, light:0xffffdd },
    castle: { name:'Castelo de Pedra', sky:0x151827, fog:0x212438, ground:0x5b6066, grid:0x9299a1, accent:0xf59e0b, light:0xffe1a8 },
    space: { name:'Espaço Cubo', sky:0x050517, fog:0x08081e, ground:0x20124d, grid:0x8b5cf6, accent:0x38bdf8, light:0xffffff },
    arena: { name:'Arena dos Portais', sky:0x111827, fog:0x111827, ground:0x2f2f46, grid:0x00e5ff, accent:0xff2e63, light:0xfff8db },
    real: { name:'Mundo Real AR', sky:null, fog:null, ground:0x0f172a, grid:0x38bdf8, accent:0xfacc15, light:0xffffff }
  };

  const DIFFICULTY = {
    easy: { name:'Fácil', hearts:6, speed:8.3, jump:12.8, gravity:22, timer:0, damage:1, bonus:1, forgiveness:1.35 },
    medium: { name:'Médio', hearts:5, speed:9.0, jump:12.2, gravity:24, timer:210, damage:1, bonus:1.25, forgiveness:1.0 },
    hard: { name:'Difícil', hearts:4, speed:9.7, jump:11.8, gravity:26, timer:165, damage:1, bonus:1.55, forgiveness:.78 }
  };

  const LEVELS = [
    {
      id:'training', world:'field', title:'Fase 1 — Treinamento dos Portais', length:210, crystals:5, enemies:3, medal:'Primeiro Pulo',
      objective:'Aprenda a usar profundidade: suba nas caixas, colete 5 cristais, vença 3 inimigos e entre no portal.',
      tutorial:['Use o joystick para ir para o fundo da tela.','Aperte A para pular em cima das caixas.','B lança poder nos blocos escuros e inimigos.']
    },
    {
      id:'volcano', world:'fire', title:'Fase 2 — Vulcão Pixel', length:265, crystals:6, enemies:5, medal:'Guardião do Fogo',
      objective:'Desvie da lava, pule os buracos, use B nos espinhos e libere o portal do vulcão.',
      tutorial:['Lava e buracos tiram vida.','Pule segurando o joystick para dar impulso.','Espinhos não podem ser pisados: use poder.']
    },
    {
      id:'forest', world:'forest', title:'Fase 3 — Floresta Voxel', length:295, crystals:7, enemies:6, medal:'Explorador dos Mundos',
      objective:'Passe por túneis baixos com Y, suba plataformas e colete o cristal escondido.',
      tutorial:['Segure Y para abaixar.','X alterna mini, normal e gigante.','Mini passa melhor por túneis.']
    },
    {
      id:'castle', world:'castle', title:'Fase 4 — Castelo de Pedra', length:325, crystals:7, enemies:7, medal:'Mestre dos Portais',
      objective:'Abra portões, derrote o golem e encontre o portal no fim do castelo.',
      tutorial:['Use X para virar gigante nos portões.','Golems têm mais vida.','Checkpoints salvam seu retorno.']
    },
    {
      id:'space', world:'space', title:'Fase 5 — Espaço Cubo', length:350, crystals:8, enemies:7, medal:'Campeão do Quiz', quizGate:true,
      objective:'Pule em plataformas espaciais, acerte o quiz do portal e derrote os voadores.',
      tutorial:['Plataformas flutuantes exigem pulo com direção.','O quiz libera a energia do portal.','Observe o minimapa para saber a distância.']
    },
    {
      id:'arena', world:'arena', title:'Fase Final — Arena dos Portais', length:390, crystals:10, enemies:9, medal:'Sequência Perfeita', boss:true, quizGate:true,
      objective:'Use tudo: profundidade, caixas, pulo, poder, tamanho e estratégia para fechar o portal final.',
      tutorial:['A arena mistura todos os desafios.','O Guardião do Portal precisa de vários poderes.','Completar a arena libera medalha final.']
    }
  ];

  const quizData = [
    { q:'Para onde o joystick para cima leva o Athos?', opts:['Para o fundo da fase', 'Para o menu', 'Para desligar o jogo'], ans:0 },
    { q:'Como derrotar inimigo espinhoso?', opts:['Usar poder B', 'Pular em cima', 'Ficar parado'], ans:0 },
    { q:'Qual botão faz o Athos pular?', opts:['A', 'Y', 'Sair'], ans:0 },
    { q:'Como passar por túnel baixo?', opts:['Segurar Y ou ficar mini', 'Ficar gigante', 'Fechar o portal'], ans:0 },
    { q:'O que abre o portal?', opts:['Cumprir objetivos', 'Só andar sem coletar nada', 'Perder toda vida'], ans:0 },
    { q:'Qual botão muda mini, normal e gigante?', opts:['X', 'B', 'Pausa'], ans:0 },
    { q:'Quem é o parceiro do Athos?', opts:['Otto', 'Um zumbi', 'Um carro'], ans:0 },
    { q:'Qual poder o Athos usa?', opts:['Fogo pixelado', 'Água invisível', 'Gelo de chocolate'], ans:0 },
    { q:'O que o botão B faz?', opts:['Lança poder de fogo', 'Abre o navegador', 'Apaga o jogo'], ans:0 },
    { q:'Para onde o botão ▼ Voltar leva?', opts:['Para o começo da pista', 'Para o céu', 'Para o quiz'], ans:0 },
    { q:'Qual inimigo não deve ser pisado?', opts:['Espinhoso', 'Cubo comum', 'Cristal'], ans:0 },
    { q:'O que acontece quando pega cristal?', opts:['Ganha XP e avança objetivo', 'Perde vida', 'Fecha a fase'], ans:0 },
    { q:'O que o checkpoint faz?', opts:['Ajuda a voltar mais perto depois de cair', 'Zera os pontos', 'Remove o Athos'], ans:0 },
    { q:'Qual mundo tem lava?', opts:['Vulcão Pixel', 'Floresta Voxel', 'Campo dos Blocos'], ans:0 },
    { q:'Qual mundo tem portais finais?', opts:['Arena dos Portais', 'Caixa de Entrada', 'Tela de login'], ans:0 },
    { q:'Qual mundo combina com árvores?', opts:['Floresta Voxel', 'Espaço Cubo', 'Vulcão Pixel'], ans:0 },
    { q:'Qual mundo combina com estrelas?', opts:['Espaço Cubo', 'Castelo de Pedra', 'Mundo Real'], ans:0 },
    { q:'Qual ação ajuda a abrir portão pesado?', opts:['Ficar gigante', 'Ficar invisível', 'Fechar o celular'], ans:0 },
    { q:'Qual ação ajuda em caminho apertado?', opts:['Ficar mini', 'Ficar gigante', 'Parar'], ans:0 },
    { q:'Para cair em cima de uma caixa, o que ajuda?', opts:['Pular com direção', 'Apertar reset', 'Abrir AR nativo'], ans:0 },
    { q:'O que o AR Nativo faz?', opts:['Abre o visualizador do celular', 'Substitui o jogo', 'Remove o 3D'], ans:0 },
    { q:'O jogo principal com controles roda em quê?', opts:['Three.js', 'Bloco de notas', 'Calculadora'], ans:0 },
    { q:'O Athos 3D vem de qual arquivo?', opts:['athos.glb', 'foto.jpg', 'musica.mp3'], ans:0 },
    { q:'Qual botão fala com Athos?', opts:['💬 Falar', '⏹ Sair', 'Reset'], ans:0 },
    { q:'Qual botão abre desafio de pergunta?', opts:['Quiz', 'Poder', 'Voltar'], ans:0 },
    { q:'Quando o portal está bloqueado, o que falta?', opts:['Objetivos da fase', 'Aumentar volume', 'Trocar aba'], ans:0 },
    { q:'Qual é a cor principal do Athos?', opts:['Preto', 'Azul claro', 'Rosa'], ans:0 },
    { q:'Quais cores aparecem no fogo do Athos?', opts:['Amarelo, laranja e vermelho', 'Verde, azul e roxo', 'Branco e cinza'], ans:0 },
    { q:'O que o Otto precisa fazer para ganhar medalhas?', opts:['Completar mundos', 'Fechar o jogo', 'Não jogar'], ans:0 },
    { q:'Qual dificuldade é mais tranquila?', opts:['Fácil', 'Difícil', 'Chefe final'], ans:0 },
    { q:'Qual dificuldade dá mais bônus de XP?', opts:['Difícil', 'Fácil', 'Nenhuma'], ans:0 },
    { q:'O que faz a vida diminuir?', opts:['Lava, buraco ou inimigo', 'Pegar cristal', 'Entrar no portal liberado'], ans:0 },
    { q:'Como derrotar inimigo comum sem poder?', opts:['Pular em cima', 'Ficar parado', 'Abrir menu'], ans:0 },
    { q:'Como atacar inimigo voador?', opts:['Usar poder B', 'Agachar no chão', 'Resetar'], ans:0 },
    { q:'Qual adversário tem mais vida?', opts:['Mini-boss/Guardião', 'Cristal', 'Árvore'], ans:0 },
    { q:'O que o botão R faz?', opts:['Girar', 'Pausar', 'Apagar'], ans:0 },
    { q:'O que o botão I faz?', opts:['Interagir', 'Invadir sistema', 'Ir para fora do site'], ans:0 },
    { q:'No Hub dos Portais, o que você encontra?', opts:['Portais para mundos', 'Loja de carros', 'Lista de emails'], ans:0 },
    { q:'Qual é o objetivo dos cristais?', opts:['Liberar progresso e dar XP', 'Virar obstáculo', 'Travar o jogo'], ans:0 },
    { q:'Quando aparece altar roxo, o que pode liberar?', opts:['Quiz do portal', 'Câmera traseira', 'Volume'], ans:0 },
    { q:'O que o modo Brincar Livre permite?', opts:['Testar controles e câmera sem pressão', 'Apagar fases', 'Remover AR'], ans:0 },
    { q:'Qual controle é melhor para andar em diagonal?', opts:['Joystick', 'Botão Sair', 'Botão Reset'], ans:0 },
    { q:'O que a seta ▲ Fundo representa?', opts:['Profundidade da tela', 'Volume do som', 'Zoom do navegador'], ans:0 },
    { q:'O que a seta ◀ representa?', opts:['Mover para a esquerda da pista', 'Pular', 'Falar'], ans:0 },
    { q:'O que a seta ▶ representa?', opts:['Mover para a direita da pista', 'Abaixar', 'Sair'], ans:0 },
    { q:'Qual mundo tem castelo e golem?', opts:['Castelo de Pedra', 'Campo dos Blocos', 'Mundo Real'], ans:0 },
    { q:'Qual mundo é melhor para testar câmera?', opts:['Mundo Real AR', 'Espaço Cubo', 'Arena Final'], ans:0 },
    { q:'Qual frase combina com Athos?', opts:['Guardião dos Portais', 'Rei dos Sorvetes', 'Piloto de avião'], ans:0 },
    { q:'Por que o portal fica verde?', opts:['Porque foi liberado', 'Porque perdeu tudo', 'Porque o celular travou'], ans:0 },
    { q:'O que acontece ao vencer a fase?', opts:['Ganha XP, medalha e próxima fase', 'Perde todos os arquivos', 'Fecha o site'], ans:0 },
    { q:'Qual botão pausa o jogo?', opts:['⏸ Pausa', 'A Pular', 'B Poder'], ans:0 },
    { q:'Se a câmera não abrir, o que acontece?', opts:['O jogo usa cenário 3D', 'O jogo apaga o Athos', 'O celular quebra'], ans:0 },
    { q:'O que significa XP?', opts:['Pontos de experiência', 'Erro fatal', 'Arquivo de imagem'], ans:0 },
    { q:'Qual é o melhor jeito de atravessar buraco?', opts:['Pular com direção', 'Abaixar dentro dele', 'Ficar parado'], ans:0 },
    { q:'O que o Athos usa para quebrar bloco escuro?', opts:['Poder de fogo', 'Pergunta de texto', 'Botão de sair'], ans:0 },
    { q:'Qual modo é só para ver o boneco no mundo real do aparelho?', opts:['AR Nativo', 'Resetar progresso', 'Coleção'], ans:0 },
    { q:'Qual modo é para jogar fases completas?', opts:['Jogar Fases 3D', 'Falar com Athos', 'Abrir moldes'], ans:0 },
    { q:'Qual item mostra conquistas?', opts:['Coleção do Otto', 'Câmera Feed', 'Service Worker'], ans:0 },
    { q:'O que o mini ajuda a fazer?', opts:['Passar por lugar baixo', 'Ficar preso no portal', 'Perder cristal'], ans:0 },
    { q:'O que o gigante ajuda a fazer?', opts:['Enfrentar portões e desafios grandes', 'Entrar em buraco pequeno', 'Sumir'], ans:0 },
    { q:'Qual é a missão do Athos?', opts:['Proteger portais com o Otto', 'Fugir do jogo', 'Trocar o navegador'], ans:0 }
  ];

  const answerRows = [
    { keys:['quem','athos','atos'], ans:'Eu sou o Athos, guardião dos portais. Meu corpo é 3D, meu estilo é blocado e meu poder é fogo pixelado.' },
    { keys:['otto'], ans:'O Otto é meu parceiro de aventura. Ele controla meus pulos, poderes e caminhos pelos mundos.' },
    { keys:['como jogar','ajuda'], ans:'Use o joystick para andar em profundidade. A pula, B lança poder, Y abaixa e X muda tamanho.' },
    { keys:['fogo','poder'], ans:'Meu poder é o fogo pixelado. Ele quebra blocos escuros e derrota inimigos perigosos.' },
    { keys:['portal','missao'], ans:'Os portais abrem quando você coleta cristais, derrota adversários e completa o desafio do mundo.' },
    { keys:['mini','pequeno'], ans:'Modo mini ajuda a passar em túneis e caminhos apertados.' },
    { keys:['gigante','grande'], ans:'Modo gigante ajuda a abrir portões e enfrentar desafios maiores.' },
    { keys:['medo','dificil'], ans:'Não precisa ter medo. Todo guardião cai, tenta de novo e fica melhor.' },
    { keys:['arena','final'], ans:'A Arena dos Portais é o desafio final: misture pulo, poder, tamanho, cristais e estratégia para liberar o portal.' },
    { keys:['castelo','golem'], ans:'No Castelo de Pedra existem portões e golems. Use tamanho gigante e poder de fogo para vencer.' },
    { keys:['floresta','arvore'], ans:'A Floresta Voxel tem plataformas, túneis e caminhos escondidos. O modo mini ajuda muito.' },
    { keys:['vulcao','lava'], ans:'No Vulcão Pixel, a lava tira vida. Pule com direção e use o poder para derrotar espinhos.' },
    { keys:['espaco','estrela'], ans:'No Espaço Cubo, as plataformas flutuam e o quiz do portal libera energia para avançar.' },
    { keys:['cristal','xp','ponto'], ans:'Cristais dão XP e contam para liberar o portal. Pegue todos para ganhar mais recompensa.' },
    { keys:['inimigo','adversario','monstro'], ans:'Cada inimigo tem uma fraqueza. Comum pode ser pisado, voador pede poder, espinhoso não deve ser pisado.' },
    { keys:['checkpoint','salvar'], ans:'Checkpoint ajuda o Athos a voltar mais perto quando cai em lava, buraco ou inimigo.' },
    { keys:['ar','realidade aumentada','camera'], ans:'O AR Nativo abre o visualizador do aparelho. O modo Brincar Livre usa câmera com controles dentro da página.' },
  ];

  const progress = loadProgress();
  let scene, camera, renderer, clock, root, levelGroup, player, playerModel, mixer, ambientLight, sunLight, portalMesh;
  let initialized = false, animReq = 0, playing = false, paused = false, mode = 'lobby', currentLevelIndex = 0, currentLevel = null;
  let runtime = null, realBg = false, cameraStream = null;
  let platforms = [], hazards = [], crystals = [], enemies = [], fireballs = [], particles = [], solids = [], gates = [], checkpoints = [];
  let input = { x:0, z:0, crouch:false };
  let keyboard = { left:false, right:false, forward:false, back:false };
  let moveHold = { left:false, right:false, forward:false, back:false };
  let joy = { active:false, pointerId:null, cx:0, cy:0, max:42, x:0, z:0 };
  let p = defaultPlayer();
  let lastDamageAt = 0, jumpBufferedUntil = 0, lastGroundedAt = 0;

  function defaultPlayer(){
    return { x:0, y:0, z:4, vx:0, vy:0, vz:0, grounded:true, scaleMode:'normal', scale:1, targetScale:1, height:2.4, radius:.55, spinUntil:0, invUntil:0, combo:0, facing:Math.PI };
  }

  function loadProgress(){
    const base = { xp:0, best:0, medals:{}, level:0, difficulty:'easy', unlocked:['field','real'], tests:[], quizRight:0, quizAnswered:0, perfectRuns:0 };
    try {
      const current = localStorage.getItem(STORAGE_KEY);
      if (current) return { ...base, ...JSON.parse(current) };
      for (const key of LEGACY_STORAGE_KEYS) {
        const old = localStorage.getItem(key);
        if (old) return { ...base, ...JSON.parse(old), migratedFrom:key };
      }
      return base;
    } catch { return base; }
  }
  function saveProgress(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); updateLobbyStats(); }
  function addXP(amount){ progress.xp = Math.max(0, progress.xp + Math.round(amount * DIFFICULTY[progress.difficulty].bonus)); progress.best = Math.max(progress.best || 0, progress.xp); saveProgress(); updateHud(); }
  function medalCount(){ return Object.keys(progress.medals || {}).length; }
  function addMedal(name){ if (!name || progress.medals[name]) return; progress.medals[name] = new Date().toISOString(); saveProgress(); toast(`🏅 Medalha: ${name}`, 'good'); speak(`Medalha desbloqueada: ${name}`); }
  function unlockWorld(world){ if (!progress.unlocked.includes(world)) { progress.unlocked.push(world); saveProgress(); } }

  function updateLobbyStats(){
    els.statXP.textContent = progress.xp || 0;
    els.statBest.textContent = progress.best || 0;
    els.statLevel.textContent = Math.min((progress.level || 0) + 1, LEVELS.length);
    els.statMedals.textContent = medalCount();
    els.difficultySelect.value = progress.difficulty || 'easy';
  }

  function updateHud(){
    if (!runtime || !currentLevel) return;
    els.hudHearts.textContent = runtime.hearts;
    els.hudXP.textContent = progress.xp || 0;
    els.hudCrystals.textContent = `${runtime.crystals}/${runtime.requiredCrystals}`;
    els.hudEnemies.textContent = `${runtime.defeated}/${runtime.requiredEnemies}`;
    els.hudTime.textContent = runtime.timer ? Math.max(0, Math.ceil(runtime.timer)) : '∞';
    els.worldName.textContent = `${WORLD[currentLevel.world]?.name || 'Mundo'} • ${DIFFICULTY[progress.difficulty].name}`;
    els.objectiveText.textContent = objectivesDone() ? 'Portal liberado! Vá até o brilho verde no fim da fase.' : currentLevel.objective;
    const done = runtime.requiredCrystals + runtime.requiredEnemies + (currentLevel.quizGate ? 1 : 0);
    const got = runtime.crystals + runtime.defeated + (runtime.quizSolved ? (currentLevel.quizGate ? 1 : 0) : 0);
    els.objectiveProgress.style.width = `${clamp(done ? (got / done) * 100 : 100, 0, 100)}%`;
    if (currentLevel.length) {
      const pct = clamp((4 - p.z) / (currentLevel.length + 12), 0, 1);
      els.miniPlayer.style.bottom = `${pct * 154 + 4}px`;
    }
  }

  function showScreen(name){
    els.lobby.classList.toggle('active', name === 'lobby');
    els.game.classList.toggle('active', name === 'game');
  }

  function toast(msg, type='good'){
    els.toast.textContent = msg;
    els.toast.className = `toast show ${type}`;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => els.toast.classList.remove('show'), 1800);
  }
  function flash(){ els.flash.classList.remove('on'); void els.flash.offsetWidth; els.flash.classList.add('on'); }
  function vibrate(ms=45){ if (navigator.vibrate) navigator.vibrate(ms); }
  function speak(text){
    if (!('speechSynthesis' in window)) return;
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(String(text).replace(/[<>]/g,'')); u.lang='pt-BR'; u.rate=.98; u.pitch=1.08; speechSynthesis.speak(u); } catch {}
  }
  function beep(freq=440, ms=90, type='square'){
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = beep.ctx || (beep.ctx = new AudioContext());
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = type; osc.frequency.value = freq; gain.gain.value = .035;
      osc.connect(gain); gain.connect(ctx.destination); osc.start(); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + ms/1000); osc.stop(ctx.currentTime + ms/1000);
    } catch {}
  }

  function initThree(){
    if (initialized) return true;
    if (!window.THREE || !THREE.GLTFLoader) { toast('Biblioteca 3D não carregou. Confira internet no primeiro acesso.', 'bad'); return false; }
    initialized = true;
    scene = new THREE.Scene(); clock = new THREE.Clock();
    const rect = els.stage.getBoundingClientRect();
    camera = new THREE.PerspectiveCamera(62, Math.max(1, rect.width) / Math.max(1, rect.height), .1, 900);
    renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true, powerPreference:'high-performance' });
    renderer.domElement.id = 'three-canvas';
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.physicallyCorrectLights = true;
    els.stage.innerHTML = ''; els.stage.appendChild(renderer.domElement);
    ambientLight = new THREE.AmbientLight(0xffffff, .55); scene.add(ambientLight);
    scene.add(new THREE.HemisphereLight(0xdbeafe,0x221000,.62));
    sunLight = new THREE.DirectionalLight(0xffffff, 1.0); sunLight.position.set(8,18,10); sunLight.castShadow = true; sunLight.shadow.mapSize.set(1024,1024); scene.add(sunLight);
    root = new THREE.Group(); scene.add(root);
    levelGroup = new THREE.Group(); root.add(levelGroup);
    player = new THREE.Group(); root.add(player);
    buildFallbackAthos(); loadAthosGLB();
    window.addEventListener('resize', resize, { passive:true });
    animate();
    return true;
  }

  function resize(){
    if (!renderer || !camera) return;
    const rect = els.stage.getBoundingClientRect();
    camera.aspect = Math.max(1, rect.width) / Math.max(1, rect.height);
    camera.updateProjectionMatrix();
    renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height));
  }

  function buildFallbackAthos(){
    if (playerModel) player.remove(playerModel);
    const g = new THREE.Group();
    const black = mat(0x050505), red = mat(0xff1717), orange = mat(0xff8a00), yellow = mat(0xffd400);
    addPart(g,1.1,1.1,1.1,0,2.75,0,black); addPart(g,.24,.15,.08,-.28,2.86,.58,red); addPart(g,.24,.15,.08,.28,2.86,.58,red);
    addPart(g,1.05,1.25,.72,0,1.55,0,black); addPart(g,.38,1.25,.38,-.82,1.55,0,orange); addPart(g,.38,.38,.42,-.82,.84,0,yellow);
    addPart(g,.38,1.25,.38,.82,1.55,0,orange); addPart(g,.38,.38,.42,.82,.84,0,yellow);
    addPart(g,.42,1.25,.42,-.28,.28,0,black); addPart(g,.42,.38,.44,-.28,-.42,0,orange); addPart(g,.42,1.25,.42,.28,.28,0,black); addPart(g,.42,.38,.44,.28,-.42,0,orange);
    playerModel = g; player.add(playerModel);
  }
  function addPart(group,w,h,d,x,y,z,material){ const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material); m.position.set(x,y,z); m.castShadow = true; m.receiveShadow = true; group.add(m); return m; }
  function loadAthosGLB(){
    const loader = new THREE.GLTFLoader();
    loader.load('./athos.glb', (gltf) => {
      if (playerModel) player.remove(playerModel);
      playerModel = gltf.scene;
      playerModel.traverse((o) => { if (o.isMesh) { o.castShadow=true; o.receiveShadow=true; } });
      const box = new THREE.Box3().setFromObject(playerModel); const size = new THREE.Vector3(); box.getSize(size);
      const s = size.y > 0 ? 2.65 / size.y : 1; playerModel.scale.setScalar(s);
      const b2 = new THREE.Box3().setFromObject(playerModel); playerModel.position.y -= b2.min.y;
      player.add(playerModel);
      if (gltf.animations && gltf.animations.length) { mixer = new THREE.AnimationMixer(playerModel); mixer.clipAction(gltf.animations[0]).play(); }
      els.modelStatus.textContent = 'athos.glb carregado.';
    }, undefined, () => { els.modelStatus.textContent = 'Fallback voxel ativo; athos.glb não carregou.'; });
  }

  function mat(color, emissive=0x000000){ return new THREE.MeshStandardMaterial({ color, emissive, roughness:.78, metalness:.05 }); }
  function box(w,h,d,color){ const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat(color)); m.castShadow=true; m.receiveShadow=true; return m; }

  function start(modeName){
    mode = modeName; paused = false; playing = true;
    if (mode === 'hub') currentLevel = { id:'hub', title:'Hub dos Portais', world:'hub', length:190, crystals:0, enemies:0, objective:'Explore o hub, veja os portais e escolha uma fase pelo menu de mundos.' };
    else if (mode === 'free') currentLevel = { ...LEVELS[0], id:'free', title:'Brincar Livre / AR por câmera', world:'real', length:300, crystals:10, enemies:7, objective:'Brinque livremente: use câmera real, pule nas caixas, derrote inimigos e teste poderes.' };
    else { currentLevelIndex = Math.min(progress.level || 0, LEVELS.length - 1); currentLevel = LEVELS[currentLevelIndex]; }
    showScreen('game');
    if (!initThree()) { showScreen('lobby'); playing = false; return; }
    resize();
    window.setTimeout(resize, 80);
    buildLevel(currentLevel);
    requestFullscreenLandscape();
    toast(currentLevel.title, 'good');
    speak(currentLevel.objective);
  }

  function exitGame(){
    playing = false; paused = false; stopCamera(); showScreen('lobby'); updateLobbyStats();
  }

  function newRuntime(){
    const diff = DIFFICULTY[progress.difficulty];
    return { hearts:diff.hearts, crystals:0, defeated:0, requiredCrystals:currentLevel.crystals||0, requiredEnemies:currentLevel.enemies||0, timer:(mode==='missions'?diff.timer:0), checkpoint:4, quizSolved:!currentLevel.quizGate, completed:false, tutorialStep:0, startedAt:now() };
  }

  function resetPlayer(){ p = defaultPlayer(); p.z = (runtime && runtime.checkpoint) || 4; player.position.set(p.x,p.y,p.z); }
  function clearLevel(){
    if (!levelGroup) return;
    while(levelGroup.children.length) levelGroup.remove(levelGroup.children[0]);
    platforms=[]; hazards=[]; crystals=[]; enemies=[]; fireballs=[]; particles=[]; solids=[]; gates=[]; checkpoints=[]; portalMesh=null;
  }

  function buildLevel(level, worldOverride){
    currentLevel = { ...level, world:worldOverride || level.world };
    clearLevel(); runtime = newRuntime(); resetPlayer(); configureWorld(currentLevel.world);
    createTrack(currentLevel.length || 220);
    createDecor(currentLevel.world, currentLevel.length || 220);
    if (currentLevel.id === 'hub') createHub(); else createGameplay(currentLevel);
    createPortal(currentLevel.length || 220);
    updateWorldButtons(currentLevel.world); updateHud(); showTutorial();
  }

  function configureWorld(world){
    const cfg = WORLD[world] || WORLD.field;
    realBg = world === 'real'; els.game.classList.toggle('real-bg', realBg);
    scene.background = realBg ? null : new THREE.Color(cfg.sky);
    scene.fog = realBg ? null : new THREE.Fog(cfg.fog || cfg.sky, 70, 330);
    ambientLight.color.setHex(cfg.light); ambientLight.intensity = realBg ? .95 : .65;
    sunLight.color.setHex(cfg.light); sunLight.intensity = realBg ? 1.25 : 1.0;
    if (realBg) startCamera(); else stopCamera();
  }

  function createTrack(length){
    const cfg = WORLD[currentLevel.world] || WORLD.field;
    const base = box(18,.45,length+44,cfg.ground); base.position.set(0,-.25,-length/2+4); levelGroup.add(base);
    const grid = new THREE.GridHelper(Math.max(110,length+44), Math.max(24, Math.round((length+44)/4)), cfg.grid, cfg.grid); grid.position.set(0,.035,-length/2+4); grid.material.transparent=true; grid.material.opacity=.46; levelGroup.add(grid);
    for (let z=8; z>-length-12; z-=8) {
      const stripe = box(.08,.08,1.25,cfg.grid); stripe.position.set(0,.09,z); levelGroup.add(stripe);
      if (Math.abs(z)%32===0) { const mark=box(1.3,.09,.18,cfg.accent); mark.position.set(-6.8,.12,z); levelGroup.add(mark); const mark2=box(1.3,.09,.18,cfg.accent); mark2.position.set(6.8,.12,z); levelGroup.add(mark2); }
    }
    for (let z=4; z>-length; z-=12) {
      const l = box(.5,.65,3.2,cfg.grid); l.position.set(-8.7,.32,z); levelGroup.add(l);
      const r = box(.5,.65,3.2,cfg.grid); r.position.set(8.7,.32,z); levelGroup.add(r);
    }
    for (let z=-20; z>-length; z-=36) {
      const railL=box(.22,.28,12,cfg.accent); railL.position.set(-8.9,.55,z); levelGroup.add(railL);
      const railR=box(.22,.28,12,cfg.accent); railR.position.set(8.9,.55,z); levelGroup.add(railR);
    }
  }

  function createDecor(world,length){
    const cfg = WORLD[world] || WORLD.field;
    // Camadas laterais e fundo para sensação de mundo vivo sem assets externos.
    for (let z=-8; z>-length; z-=14) {
      const side = (Math.floor(Math.abs(z)/14) % 2) ? -1 : 1;
      if (world === 'forest' || world === 'field' || world === 'real') {
        const trunk = box(.9,2.6,.9,0x7c3f1d); trunk.position.set(side*(10.5+Math.random()*1.2),1.3,z); levelGroup.add(trunk);
        const leaf = box(3.2,2.5,3.2,world==='forest'?0x14532d:0x22c55e); leaf.position.set(trunk.position.x,3.25,z); levelGroup.add(leaf);
        if (Math.abs(z)%42===0) { const cloud=box(4,.5,1.6,0xe0f2fe); cloud.position.set(-side*7,9+Math.random()*3,z-8); levelGroup.add(cloud); }
      } else if (world === 'fire') {
        const rock = box(2,1.2+Math.random()*1.9,2,0x160909); rock.position.set(side*11,rock.geometry.parameters.height/2,z); levelGroup.add(rock);
        const lava = box(2.6,.22,2.6,0xff5a1e); lava.position.set(side*12,.12,z-5); levelGroup.add(lava);
        const ember = box(.35,.35,.35,0xffd000); ember.position.set(-side*(6+Math.random()*4),2+Math.random()*4,z-2); levelGroup.add(ember);
      } else if (world === 'castle') {
        const pilar = box(2.2,5.2,2.2,0x6b7280); pilar.position.set(side*11,2.6,z); levelGroup.add(pilar);
        const cap=box(2.8,.6,2.8,0x94a3b8); cap.position.set(side*11,5.45,z); levelGroup.add(cap);
        const fire = box(.55,.55,.55,0xf97316); fire.position.set(side*11,6.05,z); levelGroup.add(fire);
      } else if (world === 'space') {
        const star = box(.35,.35,.35,Math.random()>.5?0xffffff:cfg.accent); star.position.set((Math.random()-.5)*42,6+Math.random()*18,z); levelGroup.add(star);
        if (Math.abs(z)%56===0) { const planet=box(2.2,2.2,2.2,0x8b5cf6); planet.position.set(side*13,8,z-10); planet.rotation.set(.5,.7,.2); levelGroup.add(planet); }
      } else if (world === 'arena' || world === 'hub') {
        const ob = box(1.8,1.8,1.8,cfg.accent); ob.position.set(side*11,1,z); ob.rotation.set(.3,.5,.1); levelGroup.add(ob);
        if (Math.abs(z)%42===0) { const beam=box(.35,7,.35,cfg.accent); beam.position.set(-side*12,3.5,z-7); levelGroup.add(beam); }
      }
    }
  }

  function createHub(){
    const names = [['field',-5,-24],['fire',0,-34],['forest',5,-24],['castle',-4,-52],['space',4,-52],['arena',0,-72]];
    names.forEach(([w,x,z]) => {
      addPortalObject(x,z,WORLD[w].accent,w);
      addCrystal(x,2.2,z+3);
    });
    addPlatform(0,1.0,-12,4,1,4,0x64748b);
    addEnemy('walker',-3,-42); addEnemy('jumper',3,-62);
  }

  function createGameplay(level){
    const len = level.length || 220; const lanes = [-5,0,5];
    addCheckpoint(3);
    // Cristais desenhados em caminhos alternativos
    for (let i=0;i<(level.crystals||5);i++) {
      const z = -22 - i * ((len-60) / Math.max(1, (level.crystals||5)-1));
      const lane = lanes[(i*2 + (level.world==='fire'?1:0)) % lanes.length];
      addCrystal(lane, 1.35 + (i%3===1?1.2:0), z);
    }
    // Plataformas e caixas sólidas em sequência jogável
    const blocks = [
      [-5,1.0,-18,3.2,1.0,3.2], [0,1.4,-30,3.2,1.0,3.2], [5,1.0,-44,3.2,1.0,3.2],
      [-5,1.5,-66,3.6,1.0,3.6], [0,2.0,-82,3.4,1.0,3.4], [5,1.6,-98,3.4,1.0,3.4],
      [0,1.3,-128,4.2,1.0,4.2], [-5,1.7,-152,3.4,1.0,3.4], [5,2.2,-172,3.4,1.0,3.4],
      [0,1.8,-205,4.4,1.0,4.4], [-5,1.6,-238,3.2,1.0,3.2], [5,2.0,-266,3.4,1.0,3.4],
      [0,2.2,-302,4.2,1.0,4.2], [-5,1.8,-335,3.4,1.0,3.4]
    ];
    blocks.filter(b => Math.abs(b[2]) < len-16).forEach((b,i)=> addPlatform(...b, i%2?0x8b5a2b:0x94a3b8));
    // Caixas quebráveis / atalhos
    [-56,-116,-188,-248,-318].filter(z => Math.abs(z)<len-20).forEach((z,i)=> addBreakable(lanes[i%3], z));
    // Lava e buracos com desvio lateral
    [-38,-74,-112,-162,-216,-278,-340].filter(z => Math.abs(z)<len-22).forEach((z,i)=> addHazard(i%2?'pit':'lava', lanes[(i+1)%3], z, 3.7, 5.3));
    // Túneis baixos
    [-92,-194,-290].filter(z => Math.abs(z)<len-25).forEach((z,i)=> addTunnel(lanes[i%3], z));
    // Portões
    addGate(0, -Math.min(len-42, 138), level.boss ? 'giant' : 'power');
    addCheckpoint(-Math.min(len-30, Math.floor(len*.52)));
    // Inimigos com comportamento variado
    const enemyTypes = level.boss ? ['walker','jumper','flyer','spiky','golem','walker','flyer','spiky','boss'] : ['walker','jumper','flyer','spiky','golem','walker','jumper'];
    for (let i=0;i<(level.enemies||4);i++) {
      const z = -34 - i * ((len-70) / Math.max(1,(level.enemies||4)-1));
      addEnemy(enemyTypes[i % enemyTypes.length], lanes[(i+2)%3], z);
    }
    // Plataformas bônus e cristais secretos para deixar a fase menos beta/demo
    [-42,-132,-222,-312].filter(z => Math.abs(z)<len-24).forEach((z,i)=>{ addPlatform(i%2?-7:7,2.6,z-6,2.4,.8,2.4,0x0ea5e9); addCrystal(i%2?-7:7,3.7,z-6); });
    [-88,-178,-268].filter(z => Math.abs(z)<len-34).forEach((z,i)=> addEnemy(i%2?'flyer':'walker', i%2?7:-7, z));
    if (level.quizGate) addQuizAltar(0, -Math.min(len-56, 210));
  }

  function addPlatform(x,y,z,w,h,d,color){ const m=box(w,h,d,color); m.position.set(x,y,z); levelGroup.add(m); platforms.push({mesh:m,x,y,z,w,h,d,top:y+h/2,type:'platform'}); solids.push(platforms[platforms.length-1]); return m; }
  function addBreakable(x,z){ const m=box(2.2,2.0,2.2,0x111827); m.position.set(x,1,z); levelGroup.add(m); platforms.push({mesh:m,x,z,w:2.2,h:2,d:2.2,top:2,breakable:true,hp:2,type:'box'}); solids.push(platforms[platforms.length-1]); }
  function addHazard(type,x,z,w,d){ const c=type==='pit'?0x020203:0xff2d00; const h=type==='pit'?.06:.14; const m=box(w,h,d,c); m.position.set(x,.07,z); levelGroup.add(m); hazards.push({type,mesh:m,x,z,w,d}); }
  function addCrystal(x,y,z){ const g=new THREE.OctahedronGeometry(.45,0); const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0x22d3ee,emissive:0x0e7490})); m.position.set(x,y,z); m.castShadow=true; levelGroup.add(m); crystals.push({mesh:m,x,y,z,got:false,r:.85}); }
  function addCheckpoint(z){ const m=box(.9,2.2,.45,0xfacc15); m.position.set(-7.2,1.1,z); levelGroup.add(m); checkpoints.push({z,mesh:m}); }
  function addTunnel(x,z){ const top=box(4.2,.7,2.0,0x475569); top.position.set(x,2.0,z); const l=box(.55,2.0,2.0,0x334155); l.position.set(x-2.1,1,z); const r=box(.55,2.0,2.0,0x334155); r.position.set(x+2.1,1,z); levelGroup.add(top,l,r); gates.push({x,z,w:4.1,d:2.2,need:'crouch',open:false,parts:[top,l,r],tunnel:true}); }
  function addGate(x,z,need){ const l=box(.75,4,1.0,0x7f1d1d); const r=box(.75,4,1.0,0x7f1d1d); const top=box(5.4,.7,1.0,0x991b1b); l.position.set(x-2.8,2,z); r.position.set(x+2.8,2,z); top.position.set(x,4.2,z); levelGroup.add(l,r,top); gates.push({x,z,w:5.6,d:1.6,need,open:false,parts:[l,r,top]}); }
  function addQuizAltar(x,z){ const base=box(3,1,3,0x4c1d95); base.position.set(x,.5,z); const top=box(1.4,1.4,1.4,0x8b5cf6); top.position.set(x,1.7,z); levelGroup.add(base,top); gates.push({x,z,w:4,d:4,need:'quiz',open:false,parts:[base,top],altar:true}); }
  function addEnemy(type,x,z){
    const color = { walker:0x84cc16, jumper:0xf97316, flyer:0xa855f7, spiky:0xef4444, golem:0x64748b, boss:0x111827 }[type] || 0x84cc16;
    const size = type==='boss'?2.05:type==='golem'?1.55:1.08; const m=box(size,size,size,color); m.position.set(x,size/2,z); levelGroup.add(m);
    if (type==='spiky') { const spike=box(size*.72,size*.72,size*.72,0xffffff); spike.rotation.set(.7,.8,.2); spike.position.set(x,size+0.25,z); levelGroup.add(spike); }
    enemies.push({mesh:m,type,x,z,baseX:x,baseZ:z,y:size/2,hp:type==='boss'?7:type==='golem'?3:type==='spiky'?2:1,dead:false,t:Math.random()*9,size});
  }
  function addPortalObject(x,z,color,world){ const g=new THREE.Group(); const a=mat(color, color); const l=new THREE.Mesh(new THREE.BoxGeometry(.7,4,1),a); const r=l.clone(); const top=new THREE.Mesh(new THREE.BoxGeometry(4,.7,1),a); l.position.set(-1.7,2,0); r.position.set(1.7,2,0); top.position.set(0,4,0); g.add(l,r,top); g.position.set(x,0,z); g.userData.world = world; levelGroup.add(g); return g; }
  function createPortal(length){
    const z = -length - 10; const g=new THREE.Group();
    const open = mat(0x22c55e,0x0f5132), locked = mat(0x475569,0x111827), coreMat = new THREE.MeshLambertMaterial({color:0x38bdf8, emissive:0x0e7490, transparent:true, opacity:.82});
    const l=new THREE.Mesh(new THREE.BoxGeometry(.75,5.2,1), locked); const r=l.clone(); const top=new THREE.Mesh(new THREE.BoxGeometry(4.6,.75,1), locked); const core=new THREE.Mesh(new THREE.TorusGeometry(1.45,.15,10,36), coreMat);
    l.position.set(-1.9,2.6,0); r.position.set(1.9,2.6,0); top.position.set(0,5.15,0); core.position.set(0,2.65,.1); core.rotation.x=Math.PI/2; g.add(l,r,top,core); g.position.set(0,0,z); g.userData={locked,open,core}; levelGroup.add(g); portalMesh=g;
  }

  function animate(){
    animReq = requestAnimationFrame(animate);
    const dt = Math.min(.045, clock.getDelta());
    if (mixer) mixer.update(dt);
    if (playing && !paused) update(dt);
    if (renderer && scene && camera) renderer.render(scene,camera);
  }

  function update(dt){
    updateInput(); updateTimer(dt); updatePlayer(dt); updateEnemies(dt); updateFireballs(dt); updateParticles(dt); checkCrystals(); checkHazards(); checkCheckpoints(); checkGates(); checkPortal(); updateCamera(dt); updateHud();
  }
  function updateTimer(dt){ if (runtime && runtime.timer) { runtime.timer -= dt; if (runtime.timer <= 0) damagePlayer(999,'Tempo esgotado!'); } }
  function updateInput(){
    const kx = (keyboard.right?1:0) - (keyboard.left?1:0) + (moveHold.right?1:0) - (moveHold.left?1:0);
    const kz = (keyboard.forward?1:0) - (keyboard.back?1:0) + (moveHold.forward?1:0) - (moveHold.back?1:0);
    input.x = clamp(joy.x + kx, -1, 1);
    input.z = clamp(joy.z + kz, -1, 1);
  }

  function updatePlayer(dt){
    const diff = DIFFICULTY[progress.difficulty];
    const mag = Math.hypot(input.x, input.z);
    const nx = mag > 1 ? input.x / mag : input.x; const nz = mag > 1 ? input.z / mag : input.z;
    const speed = diff.speed * (input.crouch ? .48 : 1) * (p.scaleMode==='giant' ? .86 : p.scaleMode==='mini' ? 1.08 : 1);
    const targetVx = nx * speed; const targetVz = -nz * speed;
    p.vx += (targetVx - p.vx) * Math.min(1, dt*12);
    p.vz += (targetVz - p.vz) * Math.min(1, dt*12);
    p.x += p.vx * dt; p.z += p.vz * dt;
    p.x = clamp(p.x, -6.4, 6.4); p.z = clamp(p.z, -currentLevel.length - 14, 8);
    if (!p.grounded) p.vy -= diff.gravity * dt;
    p.y += p.vy * dt;
    const ground = findGround(p.x,p.z);
    if (p.y <= ground.height && p.vy <= 0) { p.y = ground.height; p.vy = 0; p.grounded = true; lastGroundedAt = now(); if (ground.platform && ground.platform.breakable && ground.platform.hp <= 0) p.grounded = false; }
    else if (p.y > ground.height + .02) p.grounded = false;
    if (jumpBufferedUntil > now() && canJump()) { doJump(); jumpBufferedUntil = 0; }
    p.height = input.crouch ? 1.25 : 2.4;
    p.targetScale = p.scaleMode==='mini' ? .55 : p.scaleMode==='giant' ? 1.65 : 1;
    p.scale += (p.targetScale - p.scale) * Math.min(1, dt*8);
    const squash = input.crouch ? .62 : 1;
    player.position.set(p.x,p.y,p.z); player.scale.set(p.scale, p.scale*squash, p.scale);
    if (Math.hypot(p.vx,p.vz) > .1) { const rot = Math.atan2(p.vx,p.vz); p.facing = rot; player.rotation.y += angleDelta(player.rotation.y, rot) * Math.min(1, dt*10); }
    if (now() < p.spinUntil) player.rotation.y += dt*14;
    if (playerModel) playerModel.visible = !(now() < p.invUntil && Math.floor(now()/90)%2===0);
    if (p.y < -10) damagePlayer(1,'Caiu no buraco!');
  }
  function canJump(){ return p.grounded || (now() - lastGroundedAt < 160 * DIFFICULTY[progress.difficulty].forgiveness); }
  function doJump(){ p.vy = DIFFICULTY[progress.difficulty].jump + (input.z > .35 ? 1.15 : 0); p.grounded=false; p.z += input.z > .25 ? -0.75 : 0; p.x += input.x * .40; toast(input.z > .25 ? 'Pulo para o fundo!' : 'Pulo!', 'good'); beep(520,70,'square'); }
  function jump(){ if (!playing || paused) return; jumpBufferedUntil = now() + 170; if (canJump()) { doJump(); jumpBufferedUntil = 0; } }

  function findGround(x,z){
    let best = { height:0, platform:null };
    for (const pl of platforms) {
      if (pl.breakable && pl.hp <= 0) continue;
      if (Math.abs(x-pl.x) <= pl.w/2 + .45 && Math.abs(z-pl.z) <= pl.d/2 + .45) {
        if (pl.top > best.height && p.y >= pl.top - .45) best = { height:pl.top, platform:pl };
      }
    }
    return best;
  }

  function updateEnemies(dt){
    for (const e of enemies) {
      if (e.dead) continue; e.t += dt;
      if (e.type==='walker') e.x = e.baseX + Math.sin(e.t*1.5)*2.3;
      if (e.type==='jumper') { e.x = e.baseX + Math.sin(e.t*1.15)*1.7; e.y = e.size/2 + Math.abs(Math.sin(e.t*3.1))*1.35; }
      if (e.type==='flyer') { e.x = e.baseX + Math.sin(e.t*2.0)*2.8; e.y = 2.7 + Math.sin(e.t*2.3)*.75; }
      if (e.type==='spiky') e.x = e.baseX + Math.sin(e.t*1.2)*1.8;
      if (e.type==='golem') e.x = e.baseX + Math.sin(e.t*.75)*1.2;
      if (e.type==='boss') { e.x = Math.sin(e.t*.9)*3.8; e.y = e.size/2 + Math.abs(Math.sin(e.t*1.8))*.4; }
      e.mesh.position.set(e.x,e.y,e.z); e.mesh.rotation.y += dt*(e.type==='boss'?2.0:1.1);
      if (touchEnemy(e)) resolveEnemy(e);
    }
  }
  function touchEnemy(e){ const r = p.radius*p.scale + e.size*.58; return Math.abs(p.x-e.x)<r && Math.abs(p.z-e.z)<r && p.y < e.y+e.size*1.05 && p.y+p.height*p.scale > e.y-e.size*.55; }
  function resolveEnemy(e){ const stomp = p.vy < -1 && p.y > e.y + e.size*.18 && e.type !== 'spiky' && e.type !== 'flyer'; if (stomp) { damageEnemy(e, e.type==='boss'?1:99); p.vy=8.5; toast('Pisou no inimigo!', 'good'); beep(640,80); } else damagePlayer(DIFFICULTY[progress.difficulty].damage, e.type==='spiky'?'Espinho! Use B Poder.':'Inimigo acertou!'); }
  function damageEnemy(e,dmg){ e.hp -= dmg; addParticles(e.x,e.y,e.z,0xff8a00,16); if (e.hp<=0) { e.dead=true; e.mesh.visible=false; runtime.defeated++; p.combo=(p.combo||0)+1; addXP((e.type==='boss'?55:e.type==='golem'?22:14) + Math.min(20,p.combo*2)); toast(e.type==='boss'?`Guardião derrotado! Combo x${p.combo}`:`Inimigo derrotado! Combo x${p.combo}`, 'good'); beep(760,100); if(p.combo>=5)addMedal('Sequência Perfeita'); } }

  function power(){
    if (!playing || paused) return;
    const m=box(.38,.38,.38,0xff7a00); m.position.set(p.x,p.y+1.25,p.z-.9); levelGroup.add(m);
    const dir = new THREE.Vector3(input.x*.25,0,-1).normalize();
    fireballs.push({mesh:m,x:m.position.x,y:m.position.y,z:m.position.z,vx:dir.x*6 + p.vx*.1,vz:dir.z*22,life:1.5});
    addParticles(p.x,p.y+1.3,p.z,0xffa000,12); beep(210,100,'sawtooth');
  }
  function updateFireballs(dt){
    for (let i=fireballs.length-1;i>=0;i--) {
      const f=fireballs[i]; f.life-=dt; f.x+=f.vx*dt; f.z+=f.vz*dt; f.mesh.position.set(f.x,f.y,f.z); let hit=false;
      for (const e of enemies) if (!e.dead && dist2(f.x,f.z,e.x,e.z) < 2.3) { damageEnemy(e,1); hit=true; break; }
      for (const s of platforms) if (s.breakable && s.hp>0 && Math.abs(f.x-s.x)<s.w/2+1 && Math.abs(f.z-s.z)<s.d/2+1) { s.hp--; s.mesh.material.color.setHex(s.hp<=0?0x333333:0x6b7280); if(s.hp<=0)s.mesh.visible=false; addXP(5); hit=true; break; }
      if (f.life<=0 || hit) { levelGroup.remove(f.mesh); fireballs.splice(i,1); }
    }
  }

  function checkCrystals(){
    for (const c of crystals) if (!c.got && dist3(p.x,p.y+1,p.z,c.x,c.y,c.z) < 1.2 + p.scale*.25) { c.got=true; c.mesh.visible=false; runtime.crystals++; addXP(9); addParticles(c.x,c.y,c.z,0x22d3ee,16); toast('Cristal!', 'good'); beep(880,80); }
    for (const c of crystals) if (!c.got) c.mesh.rotation.y += .035;
  }
  function checkHazards(){ if (p.y>.55) return; for (const h of hazards) if (Math.abs(p.x-h.x)<=h.w/2 && Math.abs(p.z-h.z)<=h.d/2) damagePlayer(1,h.type==='pit'?'Buraco! Pule ou desvie.':'Lava!'); }
  function checkCheckpoints(){ for (const cp of checkpoints) if (!cp.done && p.z < cp.z) { cp.done=true; runtime.checkpoint = cp.z + 4; toast('Checkpoint!', 'warn'); addParticles(-7.2,1.2,cp.z,0xfacc15,10); } }
  function checkGates(){
    for (const g of gates) {
      if (g.open) continue;
      const near = Math.abs(p.z-g.z)<3.6 && Math.abs(p.x-g.x)<g.w/2+.6;
      if (!near) continue;
      let ok = false, msg = '';
      if (g.need === 'crouch') { ok = input.crouch || p.scaleMode==='mini'; msg='Segure Y ou use X para ficar mini!'; }
      else if (g.need === 'giant') { ok = p.scaleMode==='giant'; msg='Use X até ficar gigante!'; }
      else if (g.need === 'power') { ok = runtime.defeated >= 1; msg='Derrote um inimigo ou use B Poder!'; }
      else if (g.need === 'quiz') { ok = runtime.quizSolved; msg='Responda o Quiz para liberar.'; }
      if (ok) { g.open=true; g.parts.forEach((part,i)=>{ part.position.y += i===0?4:3; }); toast(g.tunnel?'Passou pelo túnel!':'Passagem liberada!', 'good'); addXP(10); }
      else { toast(msg, 'warn'); if (!g.tunnel && g.need !== 'quiz') p.z += 1.2; }
    }
  }
  function objectivesDone(){ return mode !== 'free' && mode !== 'hub' && runtime && runtime.crystals>=runtime.requiredCrystals && runtime.defeated>=runtime.requiredEnemies && runtime.quizSolved; }
  function checkPortal(){
    if (!portalMesh || (runtime && runtime.completed)) return;
    portalMesh.rotation.y += .015;
    const unlocked = objectivesDone() || mode === 'free' || mode === 'hub';
    portalMesh.children.forEach((ch,i)=>{ if(ch.material && i<3) ch.material.color.setHex(unlocked?0x22c55e:0x475569); });
    if (Math.abs(p.z-portalMesh.position.z)<4.2 && Math.abs(p.x)<3.2) {
      if (mode==='hub') { toast('Escolha uma fase pelo menu.', 'warn'); p.z += 2; return; }
      if (mode==='free') { toast('Portal de brincadeira alcançado!', 'good'); addXP(15); p.z = runtime.checkpoint; return; }
      if (!unlocked) { toast('Portal bloqueado: complete os objetivos.', 'warn'); p.z += 2.5; return; }
      completeLevel();
    }
  }
  function completeLevel(){
    runtime.completed = true; addXP(75); addMedal(currentLevel.medal); unlockWorld(currentLevel.world);
    progress.level = Math.min(LEVELS.length - 1, currentLevelIndex + 1); saveProgress();
    toast('Portal concluído!', 'good'); speak('Portal concluído! Próxima fase liberada.');
    setTimeout(() => { currentLevelIndex = progress.level; currentLevel = LEVELS[currentLevelIndex]; buildLevel(currentLevel); speak(currentLevel.objective); }, 1800);
  }
  function damagePlayer(amount,msg){
    p.combo = 0;
    const t=now(); if (t < p.invUntil && amount < 999) return; p.invUntil = t + 1250;
    runtime.hearts -= amount; toast(msg,'bad'); flash(); vibrate(70); beep(110,120,'sawtooth');
    if (runtime.hearts <= 0) { runtime.hearts = DIFFICULTY[progress.difficulty].hearts; progress.xp = Math.max(0, progress.xp-20); saveProgress(); resetPlayer(); speak('Tente de novo, Otto. Você voltou ao checkpoint.'); }
    else { p.z = runtime.checkpoint || Math.min(4,p.z+6); p.y=0; p.vy=0; }
  }
  function addParticles(x,y,z,color,count){ for(let i=0;i<count;i++){ const m=box(.18,.18,.18,color); m.position.set(x,y,z); levelGroup.add(m); particles.push({mesh:m, vel:new THREE.Vector3((Math.random()-.5)*5,Math.random()*5,(Math.random()-.5)*5), life:.45+Math.random()*.65}); } }
  function updateParticles(dt){ for(let i=particles.length-1;i>=0;i--){ const q=particles[i]; q.life-=dt; q.vel.y-=7*dt; q.mesh.position.addScaledVector(q.vel,dt); if(q.life<=0){ levelGroup.remove(q.mesh); particles.splice(i,1); } } }

  function updateCamera(dt){
    const landscape = innerWidth > innerHeight && innerHeight < 720;
    const target = new THREE.Vector3(p.x*.58 + (landscape?1.9:0), p.y+3.7, p.z + (landscape?10.5:12.5));
    const look = new THREE.Vector3(p.x, p.y+1.25, p.z - 10.5);
    camera.position.lerp(target, Math.min(1,dt*5.2)); camera.lookAt(look); sunLight.position.set(p.x+8,18,p.z+8);
  }

  function spin(){ p.spinUntil = now()+850; addXP(1); toast('Giro!', 'good'); }
  function cycleSize(){ p.scaleMode = p.scaleMode==='normal' ? 'mini' : p.scaleMode==='mini' ? 'giant' : 'normal'; toast(p.scaleMode==='mini'?'Mini!':p.scaleMode==='giant'?'Gigante!':'Normal!', 'good'); if(p.scaleMode==='giant') checkGates(); }
  function interact(){
    for (const g of gates) if (g.altar && Math.abs(p.z-g.z)<5 && Math.abs(p.x-g.x)<4) { openQuiz(true); return; }
    if (mode==='hub') { const nearest = LEVELS.find(l => Math.abs(p.z + (40 + LEVELS.indexOf(l)*12)) < 8); if (nearest) { currentLevelIndex = LEVELS.indexOf(nearest); buildLevel(nearest); } }
    else toast('Nada para interagir aqui.', 'warn');
  }
  function togglePause(){ paused=!paused; els.pauseBtn.innerHTML = paused ? '▶<span>Voltar</span>' : '⏸<span>Pausa</span>'; toast(paused?'Pausado':'Voltando', 'warn'); }
  function toggleCrouch(v){ input.crouch = v; }

  function showTutorial(){
    const list = currentLevel.tutorial || ['Use o joystick para andar em profundidade.','A pule nas caixas; B lança poder.'];
    let step = 0; els.tutorialBox.hidden = false;
    const render = () => { els.tutorialTitle.textContent = currentLevel.title || 'Tutorial'; els.tutorialText.textContent = list[step] || ''; };
    render(); clearInterval(showTutorial.timer); showTutorial.timer = setInterval(() => { step++; if (step >= list.length) { els.tutorialBox.hidden = true; clearInterval(showTutorial.timer); } else render(); }, 4200);
  }

  function openQuiz(fromGame=false){
    const q = quizData[Math.floor(Math.random()*quizData.length)];
    els.modalTitle.textContent = 'Quiz dos Portais';
    els.modalBody.innerHTML = `<div class="answer"><b>${escapeHtml(q.q)}</b></div><div class="modal-list"></div>`;
    const list = els.modalBody.querySelector('.modal-list');
    q.opts.forEach((opt,i)=>{ const b=document.createElement('button'); b.className='pixel-btn choice'; b.type='button'; b.textContent=opt; b.onclick=()=>{ if(i===q.ans){ b.classList.add('correct'); addXP(12); if(runtime) runtime.quizSolved=true; toast('Resposta certa!', 'good'); speak('Resposta certa!'); setTimeout(closeModal,650); } else { b.classList.add('wrong'); toast('Quase! Tente outra.', 'bad'); } updateHud(); }; list.appendChild(b); });
    showModal();
  }
  function openAsk(){
    els.modalTitle.textContent = 'Falar com Athos';
    els.modalBody.innerHTML = `<div class="ask-row"><input id="askInput" type="text" placeholder="Pergunte sobre fogo, portal, Otto..." maxlength="130"><button id="askSend" class="pixel-btn primary" type="button">Enviar</button><button id="askVoice" class="pixel-btn" type="button">🎙️</button></div><div id="askAnswer" class="answer">Oi Otto! Pergunte sobre meus mundos, poderes ou missões.</div>`;
    showModal();
    const inp=$('#askInput'), ans=$('#askAnswer');
    const ask=()=>{ const reply=answerFor(inp.value); ans.textContent=reply; speak(reply); inp.value=''; };
    $('#askSend').onclick=ask; inp.onkeydown=(e)=>{ if(e.key==='Enter') ask(); };
    $('#askVoice').onclick=()=>{ const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR){ ans.textContent='Voz não suportada neste navegador. Digite a pergunta.'; return; } const rec=new SR(); rec.lang='pt-BR'; rec.onresult=(e)=>{ inp.value=e.results[0][0].transcript; ask(); }; rec.start(); };
    setTimeout(()=>inp.focus(),80);
  }
  function answerFor(raw){ const q=normalize(raw); if(!q) return 'Pergunte sobre fogo, portal, Otto, mini, gigante ou como jogar.'; for(const row of answerRows) if(row.keys.some(k=>q.includes(k))) return row.ans; return 'No mundo dos portais, a resposta aparece explorando, coletando cristais e tentando de novo.'; }
  function openCollection(){
    const medals = ['Primeiro Pulo','Guardião do Fogo','Explorador dos Mundos','Mestre dos Portais','Campeão do Quiz','Sequência Perfeita'];
    els.modalTitle.textContent = 'Coleção do Otto';
    els.modalBody.innerHTML = `<div class="collection-grid">${medals.map(m=>`<div class="medal ${progress.medals[m]?'unlocked':''}"><b>${progress.medals[m]?'🏅':'🔒'} ${m}</b><span>${progress.medals[m]?'Desbloqueada':'Bloqueada'}</span></div>`).join('')}</div><div class="answer">XP: ${progress.xp} • Recorde: ${progress.best}</div>`;
    showModal();
  }
  function showModal(){ els.modal.hidden = false; }
  function closeModal(){ els.modal.hidden = true; }

  async function startCamera(){ if(cameraStream || !navigator.mediaDevices) return; try{ cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false}); els.cameraFeed.srcObject=cameraStream; await els.cameraFeed.play().catch(()=>{}); } catch { toast('Câmera bloqueada. Usando cenário 3D.', 'warn'); } }
  function stopCamera(){ if(cameraStream){ cameraStream.getTracks().forEach(t=>t.stop()); cameraStream=null; } els.cameraFeed.srcObject=null; }
  function requestFullscreenLandscape(){ const el=document.documentElement; if(el.requestFullscreen) el.requestFullscreen().catch(()=>{}); if(screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(()=>{}); }

  function updateWorldButtons(world){ $$('.world-chip').forEach(b=>b.classList.toggle('active', b.dataset.world===world)); }
  function setupJoystick(){
    const ring = els.joystick.querySelector('.joy-ring');
    const end = () => { joy.active=false; joy.pointerId=null; joy.x=0; joy.z=0; els.joyKnob.style.transform='translate(0px,0px)'; };
    const move = (e) => { if(!joy.active || e.pointerId !== joy.pointerId) return; e.preventDefault(); const dx=e.clientX-joy.cx, dy=e.clientY-joy.cy; const len=Math.hypot(dx,dy); const max=joy.max; const sx=len>max?dx/len*max:dx, sy=len>max?dy/len*max:dy; els.joyKnob.style.transform=`translate(${sx}px,${sy}px)`; joy.x=clamp(dx/max,-1,1); joy.z=clamp(-dy/max,-1,1); };
    ring.addEventListener('pointerdown',(e)=>{ e.preventDefault(); joy.active=true; joy.pointerId=e.pointerId; const r=ring.getBoundingClientRect(); joy.cx=r.left+r.width/2; joy.cy=r.top+r.height/2; ring.setPointerCapture && ring.setPointerCapture(e.pointerId); move(e); });
    ['pointermove'].forEach(ev=>ring.addEventListener(ev,move));
    ['pointerup','pointercancel','pointerleave'].forEach(ev=>ring.addEventListener(ev,(e)=>{ if(e.pointerId===joy.pointerId) end(); }));
  }
  function setupInputs(){
    setupJoystick();
    $$('[data-move]').forEach(btn=>{ const key=btn.dataset.move; const on=(e)=>{ e.preventDefault(); btn.classList.add('holding'); if(key in moveHold) moveHold[key]=true; }; const off=(e)=>{ e.preventDefault(); btn.classList.remove('holding'); if(key in moveHold) moveHold[key]=false; }; btn.addEventListener('pointerdown',on); ['pointerup','pointercancel','pointerleave'].forEach(ev=>btn.addEventListener(ev,off)); });
    $$('[data-hold]').forEach(btn=>{ const key=btn.dataset.hold; btn.addEventListener('pointerdown',(e)=>{ e.preventDefault(); btn.classList.add('holding'); if(key==='crouch') toggleCrouch(true); }); ['pointerup','pointercancel','pointerleave'].forEach(ev=>btn.addEventListener(ev,(e)=>{ e.preventDefault(); btn.classList.remove('holding'); if(key==='crouch') toggleCrouch(false); })); });
    $$('[data-action]').forEach(btn=>btn.addEventListener('pointerdown',(e)=>{ e.preventDefault(); handleAction(btn.dataset.action); }));
    $$('.world-chip').forEach(btn=>btn.addEventListener('click',()=>{ if(!currentLevel) currentLevel=LEVELS[0]; buildLevel(currentLevel,btn.dataset.world); }));
    window.addEventListener('keydown',(e)=>{ if(e.repeat) return; if(['ArrowLeft','a','A'].includes(e.key)) keyboard.left=true; if(['ArrowRight','d','D'].includes(e.key)) keyboard.right=true; if(['ArrowUp','w','W'].includes(e.key)) keyboard.forward=true; if(['ArrowDown','s','S'].includes(e.key)) keyboard.back=true; if(e.key===' ') jump(); if(['b','B'].includes(e.key)) power(); if(['y','Y'].includes(e.key)) input.crouch=true; });
    window.addEventListener('keyup',(e)=>{ if(['ArrowLeft','a','A'].includes(e.key)) keyboard.left=false; if(['ArrowRight','d','D'].includes(e.key)) keyboard.right=false; if(['ArrowUp','w','W'].includes(e.key)) keyboard.forward=false; if(['ArrowDown','s','S'].includes(e.key)) keyboard.back=false; if(['y','Y'].includes(e.key)) input.crouch=false; });
  }
  function handleAction(a){ if(a==='jump') jump(); else if(a==='power') power(); else if(a==='spin') spin(); else if(a==='size') cycleSize(); else if(a==='normal') { p.scaleMode='normal'; toast('Normal!', 'good'); } else if(a==='interact') interact(); else if(a==='quiz') openQuiz(true); else if(a==='ask') openAsk(); else if(a==='pause') togglePause(); }
  function setupUI(){
    els.playBtn.onclick=()=>start('missions'); els.hubBtn.onclick=()=>start('hub'); els.freeBtn.onclick=()=>start('free'); els.quizBtn.onclick=()=>openQuiz(false); els.askBtn.onclick=openAsk; els.collectionBtn.onclick=openCollection;
    els.resetBtn.onclick=()=>{ if(confirm('Resetar XP, fases e medalhas?')){ localStorage.removeItem(STORAGE_KEY); location.reload(); } };
    els.exitBtn.onclick=exitGame; els.modalClose.onclick=closeModal; els.modal.addEventListener('click',(e)=>{ if(e.target===els.modal) closeModal(); });
    els.difficultySelect.onchange=()=>{ progress.difficulty=els.difficultySelect.value; saveProgress(); toast(`Dificuldade: ${DIFFICULTY[progress.difficulty].name}`,'good'); };
    if(els.nativeViewer){ els.nativeViewer.addEventListener('load',()=>els.modelStatus.textContent='athos.glb carregado.'); els.nativeViewer.addEventListener('error',()=>els.modelStatus.textContent='Erro: athos.glb não encontrado.'); }
  }
  function clearLegacyCaches(){ if('serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then(regs=>regs.forEach(r=>r.unregister().catch(()=>{}))).catch(()=>{}); if('caches' in window) caches.keys().then(keys=>keys.forEach(k=>caches.delete(k).catch(()=>{}))).catch(()=>{}); }

  function clamp(n,min,max){ return Math.max(min,Math.min(max,Number(n)||0)); }
  function dist2(x1,z1,x2,z2){ return (x1-x2)*(x1-x2)+(z1-z2)*(z1-z2); }
  function dist3(x1,y1,z1,x2,y2,z2){ return Math.hypot(x1-x2,y1-y2,z1-z2); }
  function angleDelta(a,b){ return Math.atan2(Math.sin(b-a),Math.cos(b-a)); }
  function normalize(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim(); }
  function escapeHtml(s){ return String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  setupInputs(); setupUI(); updateLobbyStats(); clearLegacyCaches();
})();
