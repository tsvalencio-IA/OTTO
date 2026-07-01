(() => {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const app = $('#app');
  const themeBtn = $('#themeBtn');
  const shareBtn = $('#shareBtn');
  const statusText = $('#statusText');
  const modeBadge = $('#modeBadge');
  const screenTitle = $('#screenTitle');
  const viewerWrap = $('#viewerWrap');
  const cameraFeed = $('#cameraFeed');
  const placementLayer = $('#placementLayer');
  const athosViewer = $('#athosViewer');
  const athosLayer = $('#athosLayer');
  const progressBar = $('#progressBar');
  const toastEl = $('#toast');
  const gameHud = $('#gameHud');
  const missionTextEl = $('#missionText');
  const missionStepsEl = $('#missionSteps');
  const worldLabel = $('#worldLabel');
  const pointsValue = $('#pointsValue');
  const heartsValue = $('#heartsValue');
  const medalsValue = $('#medalsValue');
  const timerValue = $('#timerValue');
  const sidePointsValue = $('#sidePointsValue');
  const sideHeartsValue = $('#sideHeartsValue');
  const sideMedalsValue = $('#sideMedalsValue');
  const sideStreakValue = $('#sideStreakValue');

  const startMissionsBtn = $('#startMissionsBtn');
  const freePlayBtn = $('#freePlayBtn');
  const openArBtn = $('#openArBtn');
  const quizHomeBtn = $('#quizHomeBtn');
  const collectionBtn = $('#collectionBtn');
  const exitGameBtn = $('#exitGameBtn');
  const resetProgressBtn = $('#resetProgressBtn');

  const quizPanel = $('#quizPanel');
  const closeQuizBtn = $('#closeQuizBtn');
  const quizQuestion = $('#quizQuestion');
  const quizOptions = $('#quizOptions');
  const quizFeedback = $('#quizFeedback');

  const askPanel = $('#askPanel');
  const closeAskBtn = $('#closeAskBtn');
  const askInput = $('#askInput');
  const askSendBtn = $('#askSendBtn');
  const micBtn = $('#micBtn');
  const askAnswer = $('#askAnswer');

  const collectionPanel = $('#collectionPanel');
  const closeCollectionBtn = $('#closeCollectionBtn');
  const collectionGrid = $('#collectionGrid');

  const VERSION = 'athos-v6-guardiao-dos-portais';

  const backgrounds = {
    real: { label: 'Mundo Real', emoji: '📷', mission: 'Use a câmera e coloque o Athos perto de um brinquedo.' },
    fire: { label: 'Vulcão Pixel', emoji: '🔥', mission: 'O chão está quente. O Athos precisa pular a lava.' },
    space: { label: 'Espaço Cubo', emoji: '🚀', mission: 'O Athos procura estrelas e portais no espaço.' },
    forest: { label: 'Floresta dos Blocos', emoji: '🌳', mission: 'O Athos protege os amigos entre árvores gigantes.' },
    castle: { label: 'Castelo Vermelho', emoji: '🏰', mission: 'O Athos precisa passar pelos portões do castelo.' },
    city: { label: 'Cidade Cubo', emoji: '🏙️', mission: 'O Athos corre entre prédios e pistas secretas.' }
  };

  const difficultyConfig = {
    easy: { label: 'Fácil', time: 0, steps: 1, reward: 10, penalty: 0, hearts: 3 },
    medium: { label: 'Médio', time: 12, steps: 2, reward: 20, penalty: 1, hearts: 3 },
    hard: { label: 'Difícil', time: 7, steps: 3, reward: 35, penalty: 1, hearts: 3 }
  };

  const actionInfo = {
    jump: { label: 'Pular', emoji: '🦘', speak: 'Athos pulou o obstáculo!' },
    crouch: { label: 'Abaixar', emoji: '⬇️', speak: 'Athos abaixou e escapou!' },
    spin: { label: 'Girar', emoji: '🔄', speak: 'Athos girou e abriu energia pixel!' },
    speak: { label: 'Falar', emoji: '👋', speak: 'Oi Otto! Eu sou o Athos, guardião dos portais!' },
    mini: { label: 'Mini', emoji: '🤏', speak: 'Athos ficou mini para passar pelo caminho secreto.' },
    normal: { label: 'Normal', emoji: '🧍', speak: 'Athos voltou ao tamanho normal.' },
    giant: { label: 'Gigante', emoji: '🦾', speak: 'Athos ficou gigante para proteger o Otto!' },
    left: { label: 'Esquerda', emoji: '⬅️', speak: 'Athos foi para a esquerda.' },
    right: { label: 'Direita', emoji: '➡️', speak: 'Athos foi para a direita.' },
    quiz: { label: 'Quiz', emoji: '🧠', speak: 'Resposta certa no quiz!' },
    ask: { label: 'Perguntar', emoji: '💬', speak: 'Pergunta respondida pelo Athos!' }
  };

  const missionSeeds = [
    { bg: 'real', text: 'O portal abriu no quarto. Faça o Athos falar com o Otto.', seq: ['speak'] },
    { bg: 'real', text: 'Coloque o Athos perto de um brinquedo e faça ele girar.', seq: ['spin'] },
    { bg: 'fire', text: 'A lava está subindo. Faça o Athos pular.', seq: ['jump'] },
    { bg: 'fire', text: 'O vulcão tremeu. Faça: pular e girar.', seq: ['jump', 'spin'] },
    { bg: 'space', text: 'Uma estrela passou voando. Faça o Athos girar para capturar energia.', seq: ['spin'] },
    { bg: 'space', text: 'Portal espacial: mini, direita e falar.', seq: ['mini', 'right', 'speak'] },
    { bg: 'forest', text: 'Galho baixo na floresta. Faça o Athos abaixar.', seq: ['crouch'] },
    { bg: 'forest', text: 'Guardião da floresta: gigante e esquerda.', seq: ['giant', 'left'] },
    { bg: 'castle', text: 'Portão do castelo: abaixar e pular.', seq: ['crouch', 'jump'] },
    { bg: 'castle', text: 'Cristal vermelho: falar, girar e gigante.', seq: ['speak', 'spin', 'giant'] },
    { bg: 'city', text: 'A ponte da cidade abriu. Faça esquerda e direita.', seq: ['left', 'right'] },
    { bg: 'city', text: 'Desafio rápido da cidade: direita, pular e girar.', seq: ['right', 'jump', 'spin'] },
    { bg: 'real', text: 'Desafio de sabedoria: abra o quiz e acerte uma pergunta.', seq: ['quiz'] },
    { bg: 'real', text: 'Conversa secreta: faça uma pergunta para o Athos.', seq: ['ask'] }
  ];

  const quizQuestions = [
    { q: 'Qual é a cor principal do Athos?', options: ['Preto', 'Azul', 'Rosa'], answer: 0, explain: 'Isso! O Athos é preto, com olhos vermelhos e fogo pixelado.' },
    { q: 'Quais cores aparecem no fogo do Athos?', options: ['Amarelo, laranja e vermelho', 'Verde e azul', 'Roxo e rosa'], answer: 0, explain: 'Certo! O fogo dele tem amarelo, laranja e vermelho.' },
    { q: 'Quem é o jogador especial do Athos?', options: ['Otto', 'Um dragão', 'Um robô perdido'], answer: 0, explain: 'Muito bem! O jogo foi feito para o Otto brincar.' },
    { q: 'Qual botão deixa o Athos maior?', options: ['Gigante', 'Mini', 'Parar'], answer: 0, explain: 'Exato! Gigante deixa o Athos maior.' },
    { q: 'Qual mundo usa a câmera do celular?', options: ['Mundo Real', 'Castelo', 'Espaço'], answer: 0, explain: 'Isso! Mundo Real usa a câmera do celular.' },
    { q: 'No castelo, qual movimento ajuda a passar no portão baixo?', options: ['Abaixar', 'Ficar parado', 'Sumir'], answer: 0, explain: 'Perfeito! Abaixar ajuda o Athos a passar no portão.' },
    { q: 'No vulcão, qual ação ajuda a escapar da lava?', options: ['Pular', 'Dormir', 'Ficar pequeno para sempre'], answer: 0, explain: 'Boa! Pular ajuda o Athos a escapar da lava.' },
    { q: 'O que o Athos protege?', options: ['Portais e amigos', 'Sapatos perdidos', 'Chuva'], answer: 0, explain: 'Isso! O Athos protege portais, amigos e o Otto.' },
    { q: 'Qual botão faz o Athos conversar?', options: ['Falar', 'Direita', 'Mini'], answer: 0, explain: 'Certo! Falar faz o Athos responder.' },
    { q: 'Qual estilo combina com o Athos?', options: ['Boneco 3D blocado', 'Peixe realista', 'Carro de corrida'], answer: 0, explain: 'Muito bem! Ele é um boneco 3D blocado.' }
  ];

  const medalsCatalog = [
    { id: 'first-mission', emoji: '⭐', title: 'Primeira missão', desc: 'Complete uma missão.' },
    { id: 'fire-guardian', emoji: '🔥', title: 'Guardião do Fogo', desc: 'Complete missão no Vulcão Pixel.' },
    { id: 'space-hero', emoji: '🚀', title: 'Herói do Espaço', desc: 'Complete missão no Espaço Cubo.' },
    { id: 'castle-key', emoji: '🏰', title: 'Chave do Castelo', desc: 'Complete missão no Castelo Vermelho.' },
    { id: 'quiz-master', emoji: '🧠', title: 'Mestre do Quiz', desc: 'Acerte 3 perguntas.' },
    { id: 'giant-mode', emoji: '🦾', title: 'Athos Gigante', desc: 'Use o modo gigante.' },
    { id: 'talker', emoji: '💬', title: 'Amigo do Athos', desc: 'Faça uma pergunta.' },
    { id: 'combo-3', emoji: '⚡', title: 'Combo 3', desc: 'Acerte 3 missões seguidas.' }
  ];

  let cameraStream = null;
  let motionFrame = 0;
  let countdown = null;
  let timerLeft = 0;
  let difficulty = localStorage.getItem('athos-v6-difficulty') || 'easy';
  let currentBg = localStorage.getItem('athos-v6-bg') || 'real';
  let currentMission = null;
  let currentStep = 0;
  let currentQuiz = null;
  let quizLocked = false;
  let questionAskedThisRound = false;

  const state = {
    points: Number(localStorage.getItem('athos-v6-points') || 0),
    hearts: Number(localStorage.getItem('athos-v6-hearts') || 3),
    streak: Number(localStorage.getItem('athos-v6-streak') || 0),
    medals: loadMedals(),
    x: Number(localStorage.getItem('athos-v6-x') || 0),
    y: Number(localStorage.getItem('athos-v6-y') || 0),
    scale: Number(localStorage.getItem('athos-v6-scale') || 0.80),
    rotation: Number(localStorage.getItem('athos-v6-rotation') || 0),
    squash: 1,
    jump: 0
  };

  function loadMedals() {
    try {
      return JSON.parse(localStorage.getItem('athos-v6-medals') || '[]');
    } catch (_) {
      return [];
    }
  }

  function saveState() {
    localStorage.setItem('athos-v6-points', String(state.points));
    localStorage.setItem('athos-v6-hearts', String(state.hearts));
    localStorage.setItem('athos-v6-streak', String(state.streak));
    localStorage.setItem('athos-v6-medals', JSON.stringify(state.medals));
    localStorage.setItem('athos-v6-x', String(state.x));
    localStorage.setItem('athos-v6-y', String(state.y));
    localStorage.setItem('athos-v6-scale', String(state.scale));
    localStorage.setItem('athos-v6-rotation', String(state.rotation));
    localStorage.setItem('athos-v6-bg', currentBg);
    localStorage.setItem('athos-v6-difficulty', difficulty);
  }

  function updateScoreUI() {
    const medalsCount = state.medals.length;
    [[pointsValue, state.points], [sidePointsValue, state.points], [heartsValue, state.hearts], [sideHeartsValue, state.hearts], [medalsValue, medalsCount], [sideMedalsValue, medalsCount], [sideStreakValue, state.streak]].forEach(([el, value]) => {
      if (el) el.textContent = String(value);
    });
  }

  function toast(message, kind = 'info') {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.dataset.kind = kind;
    toastEl.classList.add('show');
    window.clearTimeout(toastEl._timer);
    toastEl._timer = window.setTimeout(() => toastEl.classList.remove('show'), 2300);
  }

  function setStatus(message, badge = '3D', kind = 'info') {
    if (statusText) statusText.textContent = message;
    if (modeBadge) {
      modeBadge.textContent = badge;
      modeBadge.classList.toggle('ok', kind === 'ok');
      modeBadge.classList.toggle('warn', kind === 'warn');
    }
  }

  function say(message, options = {}) {
    toast(message, options.kind || 'info');
    if (!('speechSynthesis' in window) || options.silent) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(String(message));
      utter.lang = 'pt-BR';
      utter.rate = options.rate || 0.96;
      utter.pitch = options.pitch || 1.06;
      window.speechSynthesis.speak(utter);
    } catch (_) {}
  }

  function normalize(text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function setTheme(theme) {
    const next = theme || (app.dataset.theme === 'dark' ? 'light' : 'dark');
    app.dataset.theme = next;
    themeBtn.textContent = next === 'dark' ? '🌙' : '☀️';
    localStorage.setItem('athos-v6-theme', next);
  }

  async function startCamera() {
    if (cameraStream || currentBg !== 'real') return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus('Câmera não disponível neste navegador.', 'CÂMERA', 'warn');
      return;
    }
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      cameraFeed.srcObject = cameraStream;
      await cameraFeed.play().catch(() => {});
      setStatus('Fundo real ativo. Toque na tela para posicionar o Athos.', 'REAL', 'ok');
    } catch (err) {
      setStatus('Permita a câmera para usar o fundo real.', 'CÂMERA', 'warn');
      toast('Não consegui abrir a câmera. Use um cenário do Athos ou permita a câmera.', 'warn');
    }
  }

  function stopCamera() {
    if (!cameraStream) return;
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
    cameraFeed.srcObject = null;
  }

  function setBackground(bg, announce = true) {
    currentBg = backgrounds[bg] ? bg : 'real';
    app.dataset.bg = currentBg;
    $$('.sceneChip, .worldList button').forEach((btn) => btn.classList.toggle('active', btn.dataset.bg === currentBg));
    if (worldLabel) worldLabel.textContent = `${backgrounds[currentBg].emoji} ${backgrounds[currentBg].label}`;
    if ((app.dataset.play === 'playing' || app.dataset.play === 'free') && currentBg === 'real') startCamera();
    if (currentBg !== 'real') stopCamera();
    saveState();
    if (announce) say(`${backgrounds[currentBg].label} ativado. ${backgrounds[currentBg].mission}`, { silent: false });
  }

  function applyTransform() {
    const jumpY = state.y + state.jump;
    const transform = `translate3d(${state.x}px, ${jumpY}px, 0) scale(${state.scale}) scaleY(${state.squash}) rotateZ(${state.rotation}deg)`;
    athosViewer.style.transform = transform;
    const modelScale = Math.max(0.25, Math.min(1.75, state.scale));
    athosViewer.setAttribute('scale', `${modelScale.toFixed(2)} ${modelScale.toFixed(2)} ${modelScale.toFixed(2)}`);
    app.dataset.size = state.scale < 0.65 ? 'mini' : state.scale > 1.05 ? 'giant' : 'normal';
  }

  function animateValue(from, to, duration, onUpdate, onDone) {
    cancelAnimationFrame(motionFrame);
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      onUpdate(from + (to - from) * eased);
      if (progress < 1) motionFrame = requestAnimationFrame(step);
      else if (onDone) onDone();
    };
    motionFrame = requestAnimationFrame(step);
  }

  function flashAthos() {
    athosViewer.classList.add('athosGlow');
    window.setTimeout(() => athosViewer.classList.remove('athosGlow'), 650);
  }

  function jumpAthos() {
    const startY = 0;
    cancelAnimationFrame(motionFrame);
    const start = performance.now();
    const duration = 720;
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      state.jump = -110 * Math.sin(Math.PI * p);
      applyTransform();
      if (p < 1) motionFrame = requestAnimationFrame(step);
      else { state.jump = 0; applyTransform(); }
    };
    motionFrame = requestAnimationFrame(step);
  }

  function crouchAthos() {
    state.squash = 0.62;
    applyTransform();
    window.setTimeout(() => {
      state.squash = 1;
      applyTransform();
    }, 520);
  }

  function spinAthos() {
    const from = state.rotation;
    const to = from + 360;
    animateValue(from, to, 680, (value) => {
      state.rotation = value;
      applyTransform();
    }, () => {
      state.rotation = state.rotation % 360;
      applyTransform();
      saveState();
    });
    try {
      athosViewer.cameraOrbit = `${(25 + Math.random() * 40).toFixed(0)}deg 68deg 3.6m`;
    } catch (_) {}
  }

  function setSize(sizeName) {
    const sizes = { mini: 0.48, normal: 0.80, giant: 1.35 };
    const target = sizes[sizeName] || sizes.normal;
    animateValue(state.scale, target, 260, (value) => {
      state.scale = value;
      applyTransform();
    }, () => {
      state.scale = target;
      applyTransform();
      saveState();
    });
    if (sizeName === 'giant') unlockMedal('giant-mode');
  }

  function speakAthos() {
    const phrases = [
      'Oi Otto! Eu sou o Athos, guardião dos portais!',
      'Vamos salvar o mundo dos blocos!',
      'Boa, Otto! Você é muito rápido!',
      'Meu fogo pixel está carregado!',
      'Escolha um portal e vamos para a próxima missão!'
    ];
    say(phrases[Math.floor(Math.random() * phrases.length)]);
    flashAthos();
  }

  function moveAthos(direction) {
    const step = 42;
    if (direction === 'left') state.x -= step;
    if (direction === 'right') state.x += step;
    if (direction === 'up') state.y -= step;
    if (direction === 'down') state.y += step;
    state.x = Math.max(-180, Math.min(180, state.x));
    state.y = Math.max(-120, Math.min(140, state.y));
    applyTransform();
    saveState();
  }

  function stopAthos() {
    cancelAnimationFrame(motionFrame);
    state.jump = 0;
    state.squash = 1;
    applyTransform();
    try { athosViewer.autoRotate = false; } catch (_) {}
    setStatus('Athos parado. Escolha a próxima ação.', 'PARADO', 'ok');
    toast('Athos parou.');
  }

  function doAction(action, fromButton) {
    if (fromButton) {
      fromButton.classList.remove('clicked');
      void fromButton.offsetWidth;
      fromButton.classList.add('clicked');
    }

    if (action === 'jump') jumpAthos();
    if (action === 'crouch') crouchAthos();
    if (action === 'spin') spinAthos();
    if (action === 'speak') speakAthos();
    if (action === 'mini' || action === 'normal' || action === 'giant') setSize(action);
    if (action === 'left' || action === 'right' || action === 'up' || action === 'down') moveAthos(action);
    if (action === 'stop') { stopAthos(); return; }

    if (actionInfo[action] && action !== 'speak') toast(actionInfo[action].speak);
    flashAthos();
    saveState();
    handleGameAction(action);
  }

  function chooseMission() {
    const cfg = difficultyConfig[difficulty] || difficultyConfig.easy;
    const available = missionSeeds.filter((mission) => mission.seq.length <= Math.max(1, cfg.steps));
    const pool = available.length ? available : missionSeeds;
    const base = pool[Math.floor(Math.random() * pool.length)];
    return JSON.parse(JSON.stringify(base));
  }

  function startMissions() {
    app.dataset.play = 'playing';
    screenTitle.textContent = 'Athos: Guardião dos Portais';
    setStatus('Jogo iniciado. Complete as missões do Athos.', 'JOGO', 'ok');
    if (state.hearts <= 0) state.hearts = difficultyConfig[difficulty].hearts;
    updateScoreUI();
    setBackground(currentBg, false);
    nextMission(true);
    say('Vamos jogar, Otto! Complete a missão do Athos.');
  }

  function startFreePlay() {
    app.dataset.play = 'free';
    screenTitle.textContent = 'Brincar Livre';
    currentMission = null;
    clearCountdown();
    timerValue.textContent = '--';
    missionTextEl.textContent = 'Brincadeira livre: escolha um fundo e use os botões do Athos.';
    missionStepsEl.innerHTML = '';
    setStatus('Brincadeira livre com câmera ou cenários.', 'LIVRE', 'ok');
    setBackground(currentBg, false);
    say('Brincadeira livre ativada. Escolha um cenário e controle o Athos.');
  }

  function exitGame() {
    app.dataset.play = 'home';
    currentMission = null;
    clearCountdown();
    closePanels();
    stopCamera();
    timerValue.textContent = '--';
    missionTextEl.textContent = 'Escolha Jogar Missões para começar.';
    missionStepsEl.innerHTML = '';
    setStatus('Pronto para brincar.', '3D');
  }

  function renderMission() {
    if (!currentMission) return;
    currentStep = 0;
    questionAskedThisRound = false;
    setBackground(currentMission.bg || currentBg, false);
    worldLabel.textContent = `${backgrounds[currentBg].emoji} ${backgrounds[currentBg].label}`;
    missionTextEl.textContent = currentMission.text;
    renderMissionSteps();
    startCountdown();
  }

  function renderMissionSteps() {
    missionStepsEl.innerHTML = '';
    if (!currentMission) return;
    currentMission.seq.forEach((action, index) => {
      const span = document.createElement('span');
      const info = actionInfo[action] || { emoji: '✅', label: action };
      span.textContent = `${info.emoji} ${info.label}`;
      span.className = index < currentStep ? 'done' : index === currentStep ? 'current' : '';
      missionStepsEl.appendChild(span);
    });
  }

  function nextMission(immediate = false) {
    if (app.dataset.play !== 'playing') return;
    currentMission = chooseMission();
    renderMission();
    if (!immediate) say('Nova missão: ' + currentMission.text);
  }

  function clearCountdown() {
    window.clearInterval(countdown);
    countdown = null;
  }

  function startCountdown() {
    clearCountdown();
    const cfg = difficultyConfig[difficulty] || difficultyConfig.easy;
    if (!cfg.time) {
      timerValue.textContent = '--';
      return;
    }
    timerLeft = cfg.time;
    timerValue.textContent = String(timerLeft);
    countdown = window.setInterval(() => {
      timerLeft -= 1;
      timerValue.textContent = String(Math.max(0, timerLeft));
      if (timerLeft <= 0) {
        clearCountdown();
        wrongMove('O tempo acabou!');
        window.setTimeout(() => nextMission(), 950);
      }
    }, 1000);
  }

  function handleGameAction(action) {
    if (app.dataset.play !== 'playing' || !currentMission) return;
    const expected = currentMission.seq[currentStep];
    if (action === expected) {
      currentStep += 1;
      renderMissionSteps();
      if (currentStep >= currentMission.seq.length) completeMission();
      else toast(`Certo! Agora: ${actionInfo[currentMission.seq[currentStep]].label}`, 'ok');
    } else if (['ask', 'quiz'].includes(expected) && action !== expected) {
      toast('Essa missão precisa do botão certo: ' + actionInfo[expected].label, 'warn');
    } else if (!['ask', 'quiz'].includes(action)) {
      wrongMove(`Ops! A missão pediu: ${actionInfo[expected].label}.`);
    }
  }

  function completeMission() {
    clearCountdown();
    const cfg = difficultyConfig[difficulty] || difficultyConfig.easy;
    const bonus = Math.min(15, state.streak * 3);
    state.points += cfg.reward + bonus;
    state.streak += 1;
    unlockMedal('first-mission', true);
    if (currentBg === 'fire') unlockMedal('fire-guardian', true);
    if (currentBg === 'space') unlockMedal('space-hero', true);
    if (currentBg === 'castle') unlockMedal('castle-key', true);
    if (state.streak >= 3) unlockMedal('combo-3', true);
    saveState();
    updateScoreUI();
    flashAthos();
    say(`Missão completa! Otto ganhou ${cfg.reward + bonus} pontos.`);
    window.setTimeout(() => nextMission(), 1400);
  }

  function wrongMove(message) {
    const cfg = difficultyConfig[difficulty] || difficultyConfig.easy;
    state.streak = 0;
    if (cfg.penalty > 0) state.hearts = Math.max(0, state.hearts - cfg.penalty);
    saveState();
    updateScoreUI();
    athosLayer.classList.add('athosShake');
    window.setTimeout(() => athosLayer.classList.remove('athosShake'), 380);
    if (state.hearts <= 0 && app.dataset.play === 'playing') {
      clearCountdown();
      say('Fim da rodada! O Athos perdeu os corações. Toque em Jogar Missões para tentar de novo.', { kind: 'warn' });
      missionTextEl.textContent = 'Rodada encerrada. Reinicie para tentar novamente.';
      missionStepsEl.innerHTML = '';
      return;
    }
    toast(message || 'Tente de novo!', 'warn');
  }

  function setDifficulty(next) {
    difficulty = difficultyConfig[next] ? next : 'easy';
    $$('.difficultyBtn').forEach((btn) => btn.classList.toggle('active', btn.dataset.difficulty === difficulty));
    state.hearts = difficultyConfig[difficulty].hearts;
    saveState();
    updateScoreUI();
    toast(`Dificuldade: ${difficultyConfig[difficulty].label}`);
    if (app.dataset.play === 'playing') nextMission(true);
  }

  function unlockMedal(id, quiet = false) {
    if (!id || state.medals.includes(id)) return;
    state.medals.push(id);
    saveState();
    updateScoreUI();
    const medal = medalsCatalog.find((m) => m.id === id);
    if (medal && !quiet) say(`Medalha desbloqueada: ${medal.title}!`);
  }

  function renderCollection() {
    collectionGrid.innerHTML = '';
    medalsCatalog.forEach((medal) => {
      const unlocked = state.medals.includes(medal.id);
      const item = document.createElement('div');
      item.className = 'badgeItem' + (unlocked ? '' : ' locked');
      item.innerHTML = `<b>${unlocked ? medal.emoji : '🔒'} ${medal.title}</b><span>${medal.desc}</span>`;
      collectionGrid.appendChild(item);
    });
  }

  function openCollection() {
    renderCollection();
    collectionPanel.hidden = false;
  }

  function pickQuizQuestion() {
    const question = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
    return JSON.parse(JSON.stringify(question));
  }

  function openQuiz() {
    closeAsk();
    currentQuiz = pickQuizQuestion();
    quizLocked = false;
    quizQuestion.textContent = currentQuiz.q;
    quizFeedback.textContent = '';
    quizOptions.innerHTML = '';
    currentQuiz.options.forEach((option, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = option;
      btn.addEventListener('click', () => answerQuiz(index, btn));
      quizOptions.appendChild(btn);
    });
    quizPanel.hidden = false;
    toast('Responda ao quiz do Athos!');
  }

  function answerQuiz(index, btn) {
    if (quizLocked || !currentQuiz) return;
    quizLocked = true;
    const correct = index === currentQuiz.answer;
    const optionButtons = Array.from(quizOptions.children);
    optionButtons.forEach((button, idx) => {
      button.disabled = true;
      if (idx === currentQuiz.answer) button.classList.add('correct');
      if (idx === index && !correct) button.classList.add('wrong');
    });
    if (correct) {
      state.points += 8;
      quizFeedback.textContent = currentQuiz.explain;
      say('Resposta certa! ' + currentQuiz.explain);
      const quizRightTotal = Number(localStorage.getItem('athos-v6-quiz-right') || 0) + 1;
      localStorage.setItem('athos-v6-quiz-right', String(quizRightTotal));
      if (quizRightTotal >= 3) unlockMedal('quiz-master', true);
      handleGameAction('quiz');
    } else {
      quizFeedback.textContent = 'Quase! ' + currentQuiz.explain;
      wrongMove('Resposta errada no quiz. Tente a próxima!');
    }
    saveState();
    updateScoreUI();
    window.setTimeout(() => {
      if (!quizPanel.hidden) openQuiz();
    }, 1800);
  }

  function closeQuiz() {
    quizPanel.hidden = true;
  }

  function openAsk() {
    closeQuiz();
    askPanel.hidden = false;
    askInput.focus({ preventScroll: true });
  }

  function closeAsk() {
    askPanel.hidden = true;
  }

  function closePanels() {
    closeQuiz();
    closeAsk();
    collectionPanel.hidden = true;
  }

  function answerQuestion(text) {
    const raw = String(text || '').trim();
    if (!raw) {
      askAnswer.textContent = 'Digite uma pergunta para o Athos responder.';
      return;
    }
    const q = normalize(raw);
    let response = 'Boa pergunta! No mundo do Athos, a imaginação do Otto abre portais. Escolha um cenário e complete uma missão.';
    if (q.includes('poder') || q.includes('forca')) response = 'Meu poder é o fogo pixelado. Ele me ajuda a pular, girar, proteger portais e defender o Otto.';
    else if (q.includes('fogo') || q.includes('chama') || q.includes('vulcao')) response = 'O fogo do Athos vem do Vulcão Pixel. Ele brilha em amarelo, laranja e vermelho.';
    else if (q.includes('portal') || q.includes('portais')) response = 'Os portais ligam o Mundo Real aos cenários do Athos: fogo, espaço, floresta, castelo e cidade.';
    else if (q.includes('otto')) response = 'O Otto é meu parceiro de aventura. Ele escolhe as ações e me ajuda a vencer as missões.';
    else if (q.includes('castelo')) response = 'No Castelo Vermelho existem portões baixos. Para vencer, eu preciso abaixar, pular e encontrar a chave pixel.';
    else if (q.includes('espaco') || q.includes('estrela') || q.includes('foguete')) response = 'No Espaço Cubo eu procuro estrelas para carregar minha energia e abrir novos portais.';
    else if (q.includes('floresta') || q.includes('arvore')) response = 'Na Floresta dos Blocos eu fico gigante para proteger os amigos escondidos entre as árvores.';
    else if (q.includes('cidade')) response = 'Na Cidade Cubo eu corro pelas pistas, desvio dos prédios e faço combos de esquerda e direita.';
    else if (q.includes('missao') || q.includes('jogar')) response = 'Para jogar, toque em Jogar Missões. Eu vou pedir ações como pular, abaixar, girar, falar, mini e gigante.';
    else if (q.includes('medalha') || q.includes('ponto')) response = 'Você ganha pontos completando missões e desbloqueia medalhas especiais na Coleção do Otto.';
    askAnswer.textContent = response;
    say(response);
    questionAskedThisRound = true;
    unlockMedal('talker', true);
    handleGameAction('ask');
    saveState();
    updateScoreUI();
  }

  function startMic() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast('Este navegador não liberou reconhecimento de voz. Digite a pergunta.', 'warn');
      return;
    }
    try {
      const rec = new SpeechRecognition();
      rec.lang = 'pt-BR';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onstart = () => toast('Pode falar com o Athos...');
      rec.onerror = () => toast('Não consegui ouvir. Tente digitar.', 'warn');
      rec.onresult = (ev) => {
        const said = ev.results?.[0]?.[0]?.transcript || '';
        askInput.value = said;
        answerQuestion(said);
      };
      rec.start();
    } catch (_) {
      toast('Microfone não disponível agora.', 'warn');
    }
  }

  function openArReal() {
    try {
      if (athosViewer && typeof athosViewer.activateAR === 'function') {
        athosViewer.activateAR();
        return;
      }
    } catch (_) {}
    toast('Se o AR real não abrir, use Jogar Missões com fundo real da câmera.', 'warn');
  }

  function resetProgress() {
    if (!confirm('Reiniciar pontos, corações, sequência e medalhas do Otto neste celular?')) return;
    state.points = 0;
    state.hearts = difficultyConfig[difficulty].hearts;
    state.streak = 0;
    state.medals = [];
    localStorage.setItem('athos-v6-quiz-right', '0');
    saveState();
    updateScoreUI();
    renderCollection();
    toast('Progresso reiniciado.');
  }

  function setupPlacement() {
    placementLayer.addEventListener('click', (ev) => {
      const rect = viewerWrap.getBoundingClientRect();
      state.x = Math.round(ev.clientX - rect.left - rect.width / 2);
      state.y = Math.round(ev.clientY - rect.top - rect.height / 2 + 90);
      state.x = Math.max(-180, Math.min(180, state.x));
      state.y = Math.max(-130, Math.min(150, state.y));
      applyTransform();
      saveState();
      toast('Athos reposicionado.');
    });
  }

  function wireEvents() {
    themeBtn.addEventListener('click', () => setTheme());
    shareBtn.addEventListener('click', async () => {
      const url = location.href;
      try {
        if (navigator.share) await navigator.share({ title: 'Athos AR', text: 'Jogo do Athos para o Otto', url });
        else {
          await navigator.clipboard.writeText(url);
          toast('Link copiado.');
        }
      } catch (_) {}
    });

    startMissionsBtn.addEventListener('click', startMissions);
    freePlayBtn.addEventListener('click', startFreePlay);
    openArBtn.addEventListener('click', openArReal);
    quizHomeBtn.addEventListener('click', openQuiz);
    collectionBtn.addEventListener('click', openCollection);
    exitGameBtn.addEventListener('click', exitGame);
    resetProgressBtn.addEventListener('click', resetProgress);

    $$('.actionBtn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const open = btn.dataset.open;
        if (open === 'quiz') { openQuiz(); return; }
        if (open === 'ask') { openAsk(); return; }
        doAction(action, btn);
      });
    });

    $$('.sceneChip, .worldList button').forEach((btn) => {
      btn.addEventListener('click', () => setBackground(btn.dataset.bg));
    });

    $$('.difficultyBtn').forEach((btn) => {
      btn.addEventListener('click', () => setDifficulty(btn.dataset.difficulty));
    });

    closeQuizBtn.addEventListener('click', closeQuiz);
    closeAskBtn.addEventListener('click', closeAsk);
    closeCollectionBtn.addEventListener('click', () => { collectionPanel.hidden = true; });
    askSendBtn.addEventListener('click', () => answerQuestion(askInput.value));
    askInput.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') answerQuestion(askInput.value);
    });
    micBtn.addEventListener('click', startMic);

    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') closePanels();
      if (ev.key === 'ArrowLeft') doAction('left');
      if (ev.key === 'ArrowRight') doAction('right');
      if (ev.key === 'ArrowUp') doAction('jump');
      if (ev.key === 'ArrowDown') doAction('crouch');
      if (ev.key.toLowerCase() === 'g') doAction('spin');
    });

    window.addEventListener('pagehide', () => {
      stopCamera();
      saveState();
    });

    setupPlacement();
  }

  function setupModelEvents() {
    athosViewer.addEventListener('load', () => {
      setStatus('Athos carregado. Escolha Jogar Missões.', 'OK', 'ok');
      applyTransform();
    });
    athosViewer.addEventListener('error', () => {
      setStatus('Não encontrei o arquivo athos.glb na raiz do projeto.', 'ERRO', 'warn');
      toast('Verifique se athos.glb está na mesma pasta do index.html.', 'warn');
    });
    athosViewer.addEventListener('progress', (event) => {
      const total = event.detail?.totalProgress || 0;
      if (progressBar) progressBar.style.width = `${Math.round(total * 100)}%`;
    });
  }

  function init() {
    const savedTheme = localStorage.getItem('athos-v6-theme') || 'dark';
    setTheme(savedTheme);
    app.dataset.play = 'home';
    setBackground(currentBg, false);
    setDifficulty(difficulty);
    applyTransform();
    updateScoreUI();
    renderCollection();
    setupModelEvents();
    wireEvents();
    setStatus('Pronto para brincar.', '3D');
  }

  init();
})();
