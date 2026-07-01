(() => {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const app = $('#app');
  const viewer = $('#athosViewer');
  const viewerWrap = $('#viewerWrap');
  const cameraFeed = $('#cameraFeed');
  const placementLayer = $('#placementLayer');
  const statusText = $('#statusText');
  const modeBadge = $('#modeBadge');
  const helpBox = $('#helpBox');
  const progressBar = $('#progressBar');
  const scaleRange = $('#scaleRange');
  const scaleValue = $('#scaleValue');
  const openArBtn = $('#openArBtn');
  const cameraModeBtn = $('#cameraModeBtn');
  const normalModeBtn = $('#normalModeBtn');
  const centerBtn = $('#centerBtn');
  const themeBtn = $('#themeBtn');
  const shareBtn = $('#shareBtn');
  const modelFile = $('#modelFile');
  const missionBox = $('#missionBox');
  const newMissionBtn = $('#newMissionBtn');
  const doneMissionBtn = $('#doneMissionBtn');
  const cameraMissionHud = $('#cameraMissionHud');
  const cameraMissionText = $('#cameraMissionText');
  const cameraNewMissionBtn = $('#cameraNewMissionBtn');
  const cameraDoneMissionBtn = $('#cameraDoneMissionBtn');
  const gameScoreHud = $('#gameScoreHud');
  const pointsValue = $('#pointsValue');
  const pointsValueSide = $('#pointsValueSide');
  const quizRightValue = $('#quizRightValue');
  const quizAnsweredValue = $('#quizAnsweredValue');
  const smartPanel = $('#smartPanel');
  const smartTitle = $('#smartTitle');
  const smartCloseBtn = $('#smartCloseBtn');
  const askInput = $('#askInput');
  const askSendBtn = $('#askSendBtn');
  const askVoiceBtn = $('#askVoiceBtn');
  const askAnswer = $('#askAnswer');
  const quizQuestion = $('#quizQuestion');
  const quizOptions = $('#quizOptions');
  const quizFeedback = $('#quizFeedback');
  const quizStartBtn = $('#quizStartBtn');
  const quizNextBtn = $('#quizNextBtn');
  const quizResetBtn = $('#quizResetBtn');
  const quizPointsValue = $('#quizPointsValue');
  const quizRightPanelValue = $('#quizRightPanelValue');
  const quizAnsweredPanelValue = $('#quizAnsweredPanelValue');
  const worldStory = $('#worldStory');

  const missions = [
    { text: 'Coloque o Athos perto de um brinquedo e faça ele girar.', action: 'spin', reward: 'Giro perfeito! O Athos acendeu o fogo pixel.' },
    { text: 'Faça o Athos ficar gigante perto da porta.', action: 'giant', reward: 'Gigante ativado! O Athos virou guardião do quarto.' },
    { text: 'Faça o Athos ficar mini em cima de uma mesa.', action: 'mini', reward: 'Modo mini liberado! O Athos cabe em qualquer aventura.' },
    { text: 'Leve o Athos para a esquerda e depois para a direita.', action: 'leftright', reward: 'Movimento completo! O Athos atravessou o portal.' },
    { text: 'Coloque o Athos no mundo fogo e faça ele pular.', action: 'jump', bg: 'fire', reward: 'Pulo de lava concluído!' },
    { text: 'Coloque o Athos no espaço e faça ele falar com o Otto.', action: 'hello', bg: 'space', reward: 'Mensagem espacial enviada para o Otto!' },
    { text: 'Coloque o Athos na floresta e deixe ele gigante.', action: 'giant', bg: 'forest', reward: 'O guardião da floresta apareceu!' },
    { text: 'Coloque o Athos no castelo e faça ele abaixar.', action: 'crouch', bg: 'castle', reward: 'Athos escapou do portão do castelo!' },
    { text: 'Use o fundo real e coloque o Athos perto de um desenho.', action: 'place', bg: 'real', reward: 'Athos entrou no mundo real!' },
    { text: 'Centralize o Athos e invente uma fala para ele.', action: 'center', reward: 'Athos está pronto para conversar!' },
    { text: 'Abra o quiz e acerte uma pergunta sobre o Athos.', action: 'quiz', reward: 'Otto ganhou energia de sabedoria!' },
    { text: 'Pergunte alguma coisa para o Athos responder.', action: 'ask', reward: 'Conversa iniciada com o Athos!' }
  ];

  const backgrounds = {
    real: 'Fundo real',
    fire: 'Mundo fogo',
    space: 'Espaço',
    forest: 'Floresta',
    castle: 'Castelo',
    city: 'Cidade'
  };


  const worldStories = {
    real: 'Mundo Real: o Athos aparece no quarto, na sala ou perto dos brinquedos do Otto. Aqui a missão é misturar imaginação com a câmera do celular.',
    fire: 'Vulcão Pixel: é o mundo de origem do Athos. As chamas dos braços e pernas dão energia para ele pular e girar.',
    space: 'Estação Estelar: o Athos viaja entre planetas quadrados e procura estrelas vermelhas para proteger o Otto.',
    forest: 'Floresta dos Blocos: árvores gigantes escondem portais secretos. O Athos fica gigante para proteger os amigos.',
    castle: 'Castelo Vermelho: o Athos precisa abaixar e passar pelos portões para encontrar o cristal de fogo.',
    city: 'Cidade Cubo: ruas, prédios e pontes viram pistas para o Athos andar para esquerda, direita e cumprir missões.'
  };

  const quizQuestions = [
    { q: 'Qual é a cor principal do Athos?', options: ['Preto', 'Azul', 'Verde'], answer: 0, explain: 'Isso! O Athos é preto, com olhos vermelhos e detalhes de fogo.' },
    { q: 'Quais cores aparecem no fogo do Athos?', options: ['Amarelo, laranja e vermelho', 'Roxo e rosa', 'Azul e cinza'], answer: 0, explain: 'Certo! O fogo pixelado dele tem amarelo, laranja e vermelho.' },
    { q: 'Quem brinca com o Athos neste sistema?', options: ['Otto', 'Um robô desconhecido', 'Um dragão'], answer: 0, explain: 'Muito bem! O sistema foi feito para o Otto brincar.' },
    { q: 'Qual botão deixa o Athos maior?', options: ['Gigante', 'Mini', 'Parar'], answer: 0, explain: 'Exato! O botão Gigante aumenta o Athos.' },
    { q: 'Qual fundo usa a câmera do celular?', options: ['Fundo real', 'Castelo', 'Espaço'], answer: 0, explain: 'Isso! Fundo real usa a câmera, como uma realidade aumentada dentro da página.' },
    { q: 'Onde o Athos encontra estrelas?', options: ['No espaço', 'Dentro da água', 'No armário'], answer: 0, explain: 'Certo! No Espaço ele procura estrelas e planetas quadrados.' },
    { q: 'No Castelo Vermelho, qual movimento ajuda o Athos a passar pelo portão?', options: ['Abaixar', 'Dormir', 'Sumir'], answer: 0, explain: 'Perfeito! Abaixar ajuda o Athos a passar pelo portão.' },
    { q: 'Qual botão faz o Athos responder com voz?', options: ['Falar', 'Mini', 'Direita'], answer: 0, explain: 'Isso! Falar faz o Athos conversar com o Otto.' },
    { q: 'O Athos é mais parecido com qual estilo?', options: ['Boneco blocado 3D', 'Carro realista', 'Peixe'], answer: 0, explain: 'Boa! O Athos é um personagem blocado em 3D.' },
    { q: 'Qual mundo combina mais com as chamas do Athos?', options: ['Mundo fogo', 'Gelo', 'Chuva'], answer: 0, explain: 'Isso! O Mundo fogo combina com as chamas pixeladas do Athos.' }
  ];

  let objectUrl = null;
  let motionRaf = null;
  let cameraStream = null;
  let loaded = false;
  let currentScale = Number(localStorage.getItem('athos-scale') || 0.80);
  let offsetX = Number(localStorage.getItem('athos-x') || 0);
  let offsetY = Number(localStorage.getItem('athos-y') || 0);
  let currentRotation = Number(localStorage.getItem('athos-rot') || 0);
  let currentTilt = 0;
  let currentBg = localStorage.getItem('athos-bg') || 'real';
  let currentMission = missions[0];
  let missionProgress = {};
  let points = Number(localStorage.getItem('athos-points') || 0);
  let quizRight = Number(localStorage.getItem('athos-quiz-right') || 0);
  let quizAnswered = Number(localStorage.getItem('athos-quiz-answered') || 0);
  let quizOrder = [];
  let currentQuiz = null;
  let quizLocked = false;

  function clickPulse(btn) {
    if (!btn) return;
    btn.classList.remove('clicked');
    void btn.offsetWidth;
    btn.classList.add('clicked');
  }

  function setStatus(text, kind = 'info') {
    statusText.textContent = text;
    modeBadge.classList.remove('ok', 'warn');
    if (kind === 'ok') modeBadge.classList.add('ok');
    if (kind === 'warn') modeBadge.classList.add('warn');

    if (app.dataset.mode === 'camera') modeBadge.textContent = currentBg === 'real' ? 'FUNDO REAL' : 'CENÁRIO';
    else if (kind === 'ok') modeBadge.textContent = 'OK';
    else if (kind === 'warn') modeBadge.textContent = 'AVISO';
    else modeBadge.textContent = '3D';
  }

  function setHelp(text) {
    helpBox.innerHTML = String(text || '').replace(/\n/g, '<br>');
  }

  function say(text) {
    setHelp(text);
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(String(text).replace(/<[^>]+>/g, ''));
      msg.lang = 'pt-BR';
      msg.rate = 0.95;
      msg.pitch = 1.08;
      window.speechSynthesis.speak(msg);
    } catch (_) {}
  }


  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function updateScoreUI() {
    const pairs = [
      [pointsValue, points],
      [pointsValueSide, points],
      [quizPointsValue, points],
      [quizRightValue, quizRight],
      [quizAnsweredValue, quizAnswered],
      [quizRightPanelValue, quizRight],
      [quizAnsweredPanelValue, quizAnswered]
    ];
    pairs.forEach(([el, value]) => { if (el) el.textContent = String(value); });
  }

  function saveScore() {
    localStorage.setItem('athos-points', String(points));
    localStorage.setItem('athos-quiz-right', String(quizRight));
    localStorage.setItem('athos-quiz-answered', String(quizAnswered));
    updateScoreUI();
  }

  function addPoints(amount, reason = '') {
    points = Math.max(0, points + amount);
    saveScore();
    if (reason) setHelp(`${reason}\n⭐ Pontos do Otto: ${points}`);
  }

  function missionText(mission = currentMission) {
    return typeof mission === 'string' ? mission : (mission && mission.text) || '';
  }

  function setMission(mission, announce = true) {
    currentMission = mission || missions[0];
    missionProgress = {};
    missionBox.textContent = missionText(currentMission);
    missionBox.classList.remove('done');
    syncCameraMission();
    if (announce) say('Nova missão: ' + missionText(currentMission));
  }

  function completeMissionAuto() {
    if (!currentMission || missionBox.classList.contains('done')) return;
    missionBox.classList.add('done');
    syncCameraMission();
    addPoints(15, 'Missão concluída!');
    say('Missão concluída! ' + (currentMission.reward || 'O Otto ganhou pontos.'));
  }

  function missionActionDone(actionName) {
    if (!currentMission) return false;
    if (currentMission.action === actionName) return true;
    if (currentMission.action === 'leftright') return !!(missionProgress.left && missionProgress.right);
    if (currentMission.action === 'place') return !!missionProgress.place;
    return false;
  }

  function checkMissionProgress() {
    if (!currentMission || missionBox.classList.contains('done')) return;
    const bgOk = !currentMission.bg || currentBg === currentMission.bg;
    const actionOk = missionActionDone(currentMission.action);
    if (actionOk && bgOk) {
      completeMissionAuto();
    } else if (actionOk && currentMission.bg && !bgOk) {
      setHelp(`Boa! Agora escolha o fundo “${backgrounds[currentMission.bg]}” para completar a missão.`);
    }
  }

  function registerAction(actionName) {
    if (!actionName || actionName === 'stop') return;
    missionProgress[actionName] = true;
    checkMissionProgress();
  }

  function smartTitles(tab) {
    return {
      ask: 'Perguntar ao Athos',
      quiz: 'Quiz do mundo do Athos',
      world: 'Mundos do Athos'
    }[tab] || 'Athos inteligente';
  }

  function setSmartTab(tab) {
    const safeTab = ['ask', 'quiz', 'world'].includes(tab) ? tab : 'ask';
    if (smartTitle) smartTitle.textContent = smartTitles(safeTab);
    $$('.smartTab').forEach((btn) => btn.classList.toggle('active', btn.dataset.smartTab === safeTab));
    $$('.smartPane').forEach((pane) => pane.classList.toggle('active', pane.id === `${safeTab}Pane`));
    if (safeTab === 'quiz' && !currentQuiz) renderQuizStart();
  }

  function openSmart(tab = 'ask') {
    if (!smartPanel) return;
    smartPanel.hidden = false;
    smartPanel.setAttribute('aria-hidden', 'false');
    setSmartTab(tab);
    if (tab === 'ask') window.setTimeout(() => askInput && askInput.focus(), 80);
  }

  function closeSmart() {
    if (!smartPanel) return;
    smartPanel.hidden = true;
    smartPanel.setAttribute('aria-hidden', 'true');
  }

  function athosAnswer(rawQuestion) {
    const q = normalizeText(rawQuestion);
    let answer = '';

    if (!q) answer = 'Pergunte alguma coisa sobre mim, meus poderes, meus mundos ou minhas missões.';
    else if (q.includes('quem') || q.includes('athos') || q.includes('atos')) answer = 'Eu sou o Athos, um personagem 3D blocado, preto, com olhos vermelhos e fogo pixelado. Eu fui criado para brincar com o Otto no celular.';
    else if (q.includes('poder') || q.includes('forca') || q.includes('magia')) answer = 'Meu poder é a chama pixelada. Com ela eu posso pular, girar, ficar mini, ficar gigante e abrir portais entre mundos.';
    else if (q.includes('otto')) answer = 'O Otto é meu parceiro de aventura. Ele escolhe o cenário, cumpre missões e ganha pontos comigo.';
    else if (q.includes('missao') || q.includes('fazer agora')) answer = 'A missão atual é: ' + missionText(currentMission);
    else if (q.includes('historia') || q.includes('conte')) answer = 'Um dia, no Vulcão Pixel, minhas chamas começaram a brilhar. Então encontrei um portal para o mundo real e chamei o Otto para explorar comigo.';
    else if (q.includes('fogo') || q.includes('chama') || q.includes('vulcao')) answer = worldStories.fire;
    else if (q.includes('espaco') || q.includes('estrela') || q.includes('planeta')) answer = worldStories.space;
    else if (q.includes('floresta') || q.includes('arvore')) answer = worldStories.forest;
    else if (q.includes('castelo')) answer = worldStories.castle;
    else if (q.includes('cidade')) answer = worldStories.city;
    else if (q.includes('realidade') || q.includes('camera') || q.includes('real')) answer = 'No fundo real, eu apareço por cima da câmera do celular. É o modo mais fácil para brincar como se fosse realidade aumentada.';
    else if (q.includes('cor') || q.includes('cores')) answer = 'Minhas cores são preto, vermelho, branco, amarelo e laranja. O fogo fica nas pernas e nos braços.';
    else if (q.includes('mini')) answer = 'O modo mini me deixa pequeno para subir em mesas, brinquedos e desenhos.';
    else if (q.includes('gigante')) answer = 'O modo gigante me transforma em guardião do quarto, da cidade ou da floresta.';
    else if (q.includes('quiz')) answer = 'No quiz, você responde perguntas sobre meu mundo. Cada acerto dá pontos para o Otto.';
    else answer = 'Boa pergunta! No mundo do Athos, a gente transforma qualquer lugar em aventura. Tente perguntar sobre fogo, espaço, floresta, castelo, poderes ou missões.';

    if (askAnswer) askAnswer.textContent = answer;
    registerAction('ask');
    say(answer);
    return answer;
  }

  function askFromInput() {
    const value = askInput ? askInput.value : '';
    athosAnswer(value);
    if (askInput) askInput.value = '';
  }

  function startVoiceQuestion(btn) {
    clickPulse(btn);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      athosAnswer('Meu celular não aceitou pergunta por voz. Posso responder pelo texto.');
      return;
    }
    try {
      const rec = new SpeechRecognition();
      rec.lang = 'pt-BR';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      if (askAnswer) askAnswer.textContent = 'Estou ouvindo... fale com o Athos.';
      rec.onresult = (event) => {
        const text = event.results && event.results[0] && event.results[0][0] ? event.results[0][0].transcript : '';
        if (askInput) askInput.value = text;
        athosAnswer(text);
      };
      rec.onerror = () => { if (askAnswer) askAnswer.textContent = 'Não consegui ouvir agora. Digite a pergunta para o Athos.'; };
      rec.start();
    } catch (_) {
      if (askAnswer) askAnswer.textContent = 'A pergunta por voz não abriu neste navegador. Use o teclado.';
    }
  }

  function shuffledIndexes(length) {
    return Array.from({ length }, (_, i) => i).sort(() => Math.random() - 0.5);
  }

  function renderQuizStart() {
    if (quizQuestion) quizQuestion.textContent = 'Toque em Começar para jogar o Quiz do Athos.';
    if (quizOptions) quizOptions.innerHTML = '';
    if (quizFeedback) quizFeedback.textContent = 'Acerte perguntas para ganhar pontos e completar missões.';
    updateScoreUI();
  }

  function nextQuizQuestion(btn = null) {
    clickPulse(btn);
    if (!quizOrder.length) quizOrder = shuffledIndexes(quizQuestions.length);
    const index = quizOrder.shift();
    currentQuiz = quizQuestions[index];
    quizLocked = false;
    if (quizQuestion) quizQuestion.textContent = currentQuiz.q;
    if (quizFeedback) quizFeedback.textContent = 'Escolha uma resposta.';
    if (quizOptions) {
      quizOptions.innerHTML = '';
      currentQuiz.options.forEach((option, optIndex) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = option;
        b.addEventListener('click', () => answerQuiz(optIndex, b));
        quizOptions.appendChild(b);
      });
    }
  }

  function answerQuiz(optIndex, btn) {
    if (!currentQuiz || quizLocked) return;
    quizLocked = true;
    quizAnswered += 1;
    const correct = optIndex === currentQuiz.answer;
    if (correct) {
      quizRight += 1;
      addPoints(10, 'Resposta certa!');
      registerAction('quiz');
      if (btn) btn.classList.add('correct');
      if (quizFeedback) quizFeedback.textContent = currentQuiz.explain + ' +10 pontos.';
      say('Resposta certa! ' + currentQuiz.explain);
    } else {
      if (btn) btn.classList.add('wrong');
      const correctBtn = quizOptions ? quizOptions.children[currentQuiz.answer] : null;
      if (correctBtn) correctBtn.classList.add('correct');
      if (quizFeedback) quizFeedback.textContent = 'Quase! ' + currentQuiz.explain;
      say('Quase! ' + currentQuiz.explain);
    }
    saveScore();
  }

  function resetQuiz(btn = null) {
    clickPulse(btn);
    quizRight = 0;
    quizAnswered = 0;
    quizOrder = [];
    currentQuiz = null;
    quizLocked = false;
    saveScore();
    renderQuizStart();
    say('Quiz zerado. Vamos começar de novo!');
  }

  async function activateWorld(world, btn = null) {
    clickPulse(btn);
    const bg = backgrounds[world] ? world : 'fire';
    await setPlayBackground(bg, btn, true);
    const story = worldStories[bg] || 'O Athos abriu um novo portal de aventura.';
    if (worldStory) worldStory.textContent = story;
    if (app.dataset.mode !== 'camera') app.dataset.bg = bg;
    say(story);
    checkMissionProgress();
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, Number(n) || 0));
  }

  function applyVisualState() {
    currentScale = clamp(currentScale, 0.25, 2.20);
    offsetX = clamp(offsetX, -260, 260);
    offsetY = clamp(offsetY, -230, 230);

    const s = currentScale.toFixed(2);
    const rot = Math.round(currentRotation % 360);

    app.style.setProperty('--athos-x', `${Math.round(offsetX)}px`);
    app.style.setProperty('--athos-y', `${Math.round(offsetY)}px`);
    app.style.setProperty('--athos-scale', s);
    app.style.setProperty('--athos-screen-rot', `${rot}deg`);

    viewer.setAttribute('scale', `${s} ${s} ${s}`);
    viewer.setAttribute('orientation', `${Math.round(currentTilt)}deg ${rot}deg 0deg`);

    scaleRange.value = String(Math.round(currentScale * 100));
    scaleValue.textContent = `${scaleRange.value}%`;

    localStorage.setItem('athos-scale', String(currentScale));
    localStorage.setItem('athos-x', String(Math.round(offsetX)));
    localStorage.setItem('athos-y', String(Math.round(offsetY)));
    localStorage.setItem('athos-rot', String(Math.round(rot)));
  }

  function clearMotion(keepPose = true) {
    if (motionRaf) cancelAnimationFrame(motionRaf);
    motionRaf = null;
    viewer.classList.remove('is-jumping', 'is-crouching', 'is-talking');
    viewer.autoRotate = false;
    if (keepPose) applyVisualState();
  }

  function setScale(value, speakText = '') {
    currentScale = clamp(value, 0.25, 2.20);
    applyVisualState();

    if (app.dataset.mode !== 'camera') {
      const distance = currentScale >= 1.30 ? 2.55 : currentScale <= 0.55 ? 5.15 : 3.60;
      viewer.cameraOrbit = `25deg 68deg ${distance}m`;
      if (typeof viewer.jumpCameraToGoal === 'function') viewer.jumpCameraToGoal();
    }

    if (speakText) say(speakText);
  }

  function setOffset(x, y) {
    offsetX = clamp(x, -260, 260);
    offsetY = clamp(y, -230, 230);
    applyVisualState();
  }

  function setRotation(value) {
    currentRotation = Number(value) || 0;
    applyVisualState();
  }

  function centerAthos(btn) {
    clickPulse(btn);
    clearMotion(false);
    offsetX = 0;
    offsetY = 0;
    currentRotation = 0;
    currentTilt = 0;
    applyVisualState();
    viewer.cameraOrbit = '25deg 68deg 3.6m';
    viewer.fieldOfView = '30deg';
    if (typeof viewer.jumpCameraToGoal === 'function') viewer.jumpCameraToGoal();
    say('Athos centralizado. Agora ele está no meio da tela.');
  }

  function startSpin(btn) {
    clickPulse(btn);
    clearMotion(false);
    const start = performance.now();
    const base = currentRotation;
    const speed = app.dataset.mode === 'camera' ? 210 : 140;

    const step = (now) => {
      const t = (now - start) / 1000;
      currentRotation = base + (t * speed);
      applyVisualState();
      motionRaf = requestAnimationFrame(step);
    };

    motionRaf = requestAnimationFrame(step);
    say('Athos girando. Toque em Parar quando quiser.');
  }

  function jump(btn) {
    clickPulse(btn);
    clearMotion(false);
    viewer.classList.remove('is-jumping');
    void viewer.offsetWidth;
    viewer.classList.add('is-jumping');
    window.setTimeout(() => viewer.classList.remove('is-jumping'), 620);
    say('Athos pulou!');
  }

  function crouch(btn) {
    clickPulse(btn);
    clearMotion(false);
    viewer.classList.remove('is-crouching');
    void viewer.offsetWidth;
    viewer.classList.add('is-crouching');
    window.setTimeout(() => viewer.classList.remove('is-crouching'), 720);
    say('Athos abaixou!');
  }

  function talk(btn) {
    clickPulse(btn);
    clearMotion(false);
    viewer.classList.remove('is-talking');
    void viewer.offsetWidth;
    viewer.classList.add('is-talking');
    window.setTimeout(() => viewer.classList.remove('is-talking'), 850);
    say('Oi Otto! Eu sou o Athos. Escolha um fundo e vamos brincar!');
  }

  function stopAll(btn) {
    clickPulse(btn);
    clearMotion(true);
    if (typeof viewer.pause === 'function') viewer.pause();
    say('Parei.');
  }

  function nudge(dx, dy, btn) {
    clickPulse(btn);
    setOffset(offsetX + dx, offsetY + dy);
    setHelp('Athos movido. Você também pode tocar na tela para colocar ele em outro lugar.');
  }

  function action(name, btn) {
    switch (name) {
      case 'mini':
        clickPulse(btn);
        clearMotion(false);
        setScale(0.45, 'Athos mini ativado.');
        break;
      case 'normal':
        clickPulse(btn);
        clearMotion(false);
        setScale(0.80, 'Athos voltou ao tamanho normal.');
        break;
      case 'giant':
        clickPulse(btn);
        clearMotion(false);
        setScale(1.55, 'Athos gigante ativado.');
        break;
      case 'spin':
        startSpin(btn);
        break;
      case 'jump':
        jump(btn);
        break;
      case 'crouch':
        crouch(btn);
        break;
      case 'left':
        nudge(-38, 0, btn);
        break;
      case 'right':
        nudge(38, 0, btn);
        break;
      case 'up':
        nudge(0, -34, btn);
        break;
      case 'down':
        nudge(0, 34, btn);
        break;
      case 'center':
        centerAthos(btn);
        break;
      case 'hello':
        talk(btn);
        break;
      case 'stop':
        stopAll(btn);
        break;
    }
    registerAction(name);
  }

  async function startCameraStream() {
    if (cameraStream) return true;
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      throw new Error('A câmera precisa de HTTPS.');
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Câmera indisponível neste navegador.');
    }

    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });
    cameraFeed.srcObject = cameraStream;
    await cameraFeed.play().catch(() => {});
    return true;
  }

  function stopCameraStream() {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      cameraStream = null;
    }
    cameraFeed.srcObject = null;
  }

  function updateBgButtons() {
    $$('.bgChip[data-bg]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.bg === currentBg);
    });
  }

  async function setPlayBackground(bg, btn = null, fromUser = false) {
    clickPulse(btn);
    currentBg = backgrounds[bg] ? bg : 'real';
    app.dataset.bg = currentBg;
    localStorage.setItem('athos-bg', currentBg);
    updateBgButtons();

    if (app.dataset.mode !== 'camera') {
      setHelp(`Fundo escolhido: ${backgrounds[currentBg]}. Toque em “Brincar com celular” para usar.`);
      return;
    }

    if (currentBg === 'real') {
      try {
        await startCameraStream();
        setStatus('Fundo real ativo', 'ok');
        setHelp('Fundo real ligado. Toque na tela para posicionar o Athos e use os botões do rodapé.');
      } catch (err) {
        currentBg = 'fire';
        app.dataset.bg = 'fire';
        localStorage.setItem('athos-bg', 'fire');
        updateBgButtons();
        stopCameraStream();
        setStatus('Câmera bloqueada', 'warn');
        setHelp('A câmera não abriu. Troquei para o cenário do Athos. Para usar fundo real, abra pelo link HTTPS do GitHub Pages e permita a câmera.');
      }
    } else {
      stopCameraStream();
      setStatus(`Cenário: ${backgrounds[currentBg]}`, 'ok');
      if (fromUser) say(`Cenário ${backgrounds[currentBg]} ativado.`);
      else setHelp(`Cenário ${backgrounds[currentBg]} ativado. Os botões continuam funcionando.`);
    }
    checkMissionProgress();
  }

  async function startPlayMode(btn) {
    clickPulse(btn);
    clearMotion(false);
    app.dataset.mode = 'camera';
    modeBadge.textContent = 'BRINCAR';
    setOffset(offsetX, offsetY);
    setScale(currentScale);
    syncCameraMission();
    await setPlayBackground(currentBg, null, false);
    setStatus(currentBg === 'real' ? 'Brincar com fundo real' : `Brincar: ${backgrounds[currentBg]}`, 'ok');
  }

  function stopPlayMode(btn) {
    clickPulse(btn);
    clearMotion(true);
    stopCameraStream();
    app.dataset.mode = 'normal';
    setStatus(loaded ? 'Athos carregado' : 'Modo 3D', loaded ? 'ok' : 'info');
    setHelp('Modo 3D normal. Para brincar com missões e botões fixos, toque em “Brincar com celular”.');
  }

  function openNativeAR(btn) {
    clickPulse(btn);
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      setStatus('AR bloqueado', 'warn');
      setHelp('O AR real precisa de link HTTPS. Suba no GitHub Pages e abra pelo Chrome do Android.');
      return;
    }
    if (!loaded) {
      setStatus('Aguardando modelo', 'warn');
      setHelp('Espere o Athos carregar primeiro. Depois toque em “Athos em AR real” novamente.');
      return;
    }
    if (typeof viewer.activateAR !== 'function') {
      setStatus('AR indisponível', 'warn');
      setHelp('O componente AR ainda não carregou no navegador. Use “Brincar com celular”, que funciona dentro da página.');
      return;
    }
    try {
      const ret = viewer.activateAR();
      if (ret && typeof ret.catch === 'function') {
        ret.catch(() => {
          setStatus('AR não abriu', 'warn');
          setHelp('O AR real não abriu neste navegador. Use “Brincar com celular” para brincar com botões funcionando.');
        });
      }
      setHelp('Abrindo o AR real do celular. Esse modo depende do visualizador nativo do aparelho.');
    } catch (err) {
      setStatus('AR não abriu', 'warn');
      setHelp('O AR real não abriu neste aparelho. Use “Brincar com celular”, com fundo real ou cenários.');
    }
  }

  function applyTheme(theme) {
    app.dataset.theme = theme;
    themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('athos-theme', theme);
  }

  function applyStage(stage, btn) {
    clickPulse(btn);
    app.dataset.stage = stage;
    localStorage.setItem('athos-stage', stage);
    $$('#stageButtons .chip').forEach((el) => el.classList.toggle('active', el.dataset.stage === stage));
  }

  function syncCameraMission() {
    if (cameraMissionText && missionBox) cameraMissionText.textContent = missionBox.textContent;
    if (cameraMissionHud && missionBox) cameraMissionHud.classList.toggle('done', missionBox.classList.contains('done'));
    if (gameScoreHud) gameScoreHud.classList.toggle('hot', missionBox && missionBox.classList.contains('done'));
    updateScoreUI();
  }

  function newMission(btn) {
    clickPulse(btn);
    const mission = missions[Math.floor(Math.random() * missions.length)];
    setMission(mission, true);
  }

  function toggleMissionDone(btn) {
    clickPulse(btn);
    const wasDone = missionBox.classList.contains('done');
    missionBox.classList.toggle('done');
    syncCameraMission();
    if (!wasDone && missionBox.classList.contains('done')) addPoints(10, 'Missão marcada como concluída!');
    say(missionBox.classList.contains('done') ? 'Missão concluída!' : 'Missão reaberta!');
  }

  function clearOldServiceWorkerCache() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then((regs) => regs.forEach((reg) => reg.unregister().catch(() => {})))
        .catch(() => {});
    }
    if ('caches' in window) {
      caches.keys()
        .then((keys) => keys.forEach((key) => caches.delete(key).catch(() => {})))
        .catch(() => {});
    }
  }

  function bootWarnings() {
    if (location.protocol === 'file:') {
      setStatus('Aberto como arquivo', 'warn');
      setHelp('Não abra pelo arquivo solto. Para câmera e AR funcionarem, suba no GitHub Pages e abra pelo link HTTPS.');
    }
    if (!navigator.onLine) {
      setHelp('Sem internet: o componente 3D pode não carregar. Abra com internet pelo GitHub Pages.');
    }
  }

  $$('.playBtn[data-action]').forEach((btn) => btn.addEventListener('click', () => action(btn.dataset.action, btn)));
  $$('.arCtrlBtn[data-action]').forEach((btn) => btn.addEventListener('click', () => action(btn.dataset.action, btn)));
  $$('#stageButtons .chip').forEach((btn) => btn.addEventListener('click', () => applyStage(btn.dataset.stage, btn)));
  $$('.bgChip[data-bg]').forEach((btn) => btn.addEventListener('click', () => setPlayBackground(btn.dataset.bg, btn, true)));
  $$('[data-smart-open]').forEach((btn) => btn.addEventListener('click', () => openSmart(btn.dataset.smartOpen || 'ask')));
  $$('.smartTab[data-smart-tab]').forEach((btn) => btn.addEventListener('click', () => setSmartTab(btn.dataset.smartTab)));
  $$('.quickQuestions [data-question]').forEach((btn) => btn.addEventListener('click', () => { askInput.value = btn.dataset.question; athosAnswer(btn.dataset.question); }));
  $$('.worldGrid [data-world]').forEach((btn) => btn.addEventListener('click', () => activateWorld(btn.dataset.world, btn)));
  if (smartCloseBtn) smartCloseBtn.addEventListener('click', closeSmart);
  if (smartPanel) smartPanel.addEventListener('click', (event) => { if (event.target === smartPanel) closeSmart(); });
  if (askSendBtn) askSendBtn.addEventListener('click', askFromInput);
  if (askInput) askInput.addEventListener('keydown', (event) => { if (event.key === 'Enter') askFromInput(); });
  if (askVoiceBtn) askVoiceBtn.addEventListener('click', () => startVoiceQuestion(askVoiceBtn));
  if (quizStartBtn) quizStartBtn.addEventListener('click', () => nextQuizQuestion(quizStartBtn));
  if (quizNextBtn) quizNextBtn.addEventListener('click', () => nextQuizQuestion(quizNextBtn));
  if (quizResetBtn) quizResetBtn.addEventListener('click', () => resetQuiz(quizResetBtn));

  scaleRange.addEventListener('input', () => setScale(Number(scaleRange.value) / 100));
  centerBtn.addEventListener('click', () => centerAthos(centerBtn));
  openArBtn.addEventListener('click', () => openNativeAR(openArBtn));
  cameraModeBtn.addEventListener('click', () => startPlayMode(cameraModeBtn));
  normalModeBtn.addEventListener('click', () => stopPlayMode(normalModeBtn));
  newMissionBtn.addEventListener('click', () => newMission(newMissionBtn));
  doneMissionBtn.addEventListener('click', () => toggleMissionDone(doneMissionBtn));
  if (cameraNewMissionBtn) cameraNewMissionBtn.addEventListener('click', () => newMission(cameraNewMissionBtn));
  if (cameraDoneMissionBtn) cameraDoneMissionBtn.addEventListener('click', () => toggleMissionDone(cameraDoneMissionBtn));

  placementLayer.addEventListener('click', (event) => {
    if (app.dataset.mode !== 'camera') return;
    const rect = viewerWrap.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    setOffset(x, y);
    missionProgress.place = true;
    setHelp('Athos colocado aqui. Agora use os botões fixos no rodapé.');
    checkMissionProgress();
  });

  themeBtn.addEventListener('click', () => {
    clickPulse(themeBtn);
    applyTheme(app.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  shareBtn.addEventListener('click', async () => {
    clickPulse(shareBtn);
    const data = { title: 'Athos AR', text: 'Brincar com o Athos em 3D, AR e missões', url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(location.href);
        shareBtn.textContent = '✅ Copiado';
        window.setTimeout(() => (shareBtn.textContent = '🔗 Link'), 1300);
      }
    } catch (_) {}
  });

  modelFile.addEventListener('change', () => {
    const file = modelFile.files && modelFile.files[0];
    if (!file) return;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    viewer.src = objectUrl;
    loaded = false;
    setStatus('Testando modelo local', 'info');
    setHelp(`Modelo temporário carregado: ${file.name}. Para publicar de verdade, substitua o athos.glb no GitHub.`);
  });

  viewer.addEventListener('progress', (ev) => {
    const progress = Math.round((ev.detail.totalProgress || 0) * 100);
    progressBar.style.width = `${progress}%`;
  });

  viewer.addEventListener('load', () => {
    loaded = true;
    progressBar.style.width = '100%';
    applyVisualState();
    const animations = viewer.availableAnimations || [];
    setStatus('Athos carregado', 'ok');
    if (animations.length) {
      setHelp(`Athos carregado com ${animations.length} animação(ões) internas. Os comandos principais funcionam pelo sistema; o botão Dançar continua removido.`);
    } else {
      setHelp('Athos carregado. Como este GLB não tem dança real, removi Dançar. Agora mini, normal, gigante, girar, pular, abaixar, falar, perguntas e quiz usam comandos do sistema.');
    }
  });

  viewer.addEventListener('error', () => {
    loaded = false;
    setStatus('Erro no athos.glb', 'warn');
    setHelp('O arquivo athos.glb não abriu neste navegador. Confirme se ele está na raiz do repositório e se o GitHub Pages terminou de publicar.');
  });

  viewer.addEventListener('ar-status', (event) => {
    const status = event.detail.status;
    if (status === 'session-started') {
      setStatus('AR real aberto', 'ok');
      setHelp('AR real aberto. Mova o celular devagar até o Athos aparecer no chão ou na mesa.');
    } else if (status === 'object-placed') {
      say('Athos colocado no mundo real!');
    } else if (status === 'failed') {
      setStatus('AR real falhou', 'warn');
      setHelp('O AR real falhou neste aparelho/navegador. Toque em “Brincar com celular”, que tem fundo real ou cenários e mantém os botões funcionando.');
    }
  });

  window.addEventListener('beforeunload', () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    stopCameraStream();
  });

  clearOldServiceWorkerCache();
  const savedTheme = localStorage.getItem('athos-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
  applyStage(localStorage.getItem('athos-stage') || 'fire');
  app.dataset.bg = currentBg;
  updateBgButtons();
  applyVisualState();
  updateScoreUI();
  setMission(currentMission, false);
  renderQuizStart();
  syncCameraMission();
  bootWarnings();
})();
