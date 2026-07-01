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

  const missions = [
    'Coloque o Athos perto de um brinquedo e faça ele girar.',
    'Faça o Athos ficar gigante perto da porta.',
    'Faça o Athos ficar mini em cima de uma mesa.',
    'Leve o Athos para a esquerda e depois para a direita.',
    'Coloque o Athos no mundo fogo e faça ele pular.',
    'Coloque o Athos no espaço e faça ele falar com o Otto.',
    'Coloque o Athos na floresta e deixe ele gigante.',
    'Coloque o Athos no castelo e faça ele abaixar.',
    'Use o fundo real e coloque o Athos perto de um desenho.',
    'Centralize o Athos e invente uma fala para ele.'
  ];

  const backgrounds = {
    real: 'Fundo real',
    fire: 'Mundo fogo',
    space: 'Espaço',
    forest: 'Floresta',
    castle: 'Castelo',
    city: 'Cidade'
  };

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
  }

  function newMission(btn) {
    clickPulse(btn);
    const mission = missions[Math.floor(Math.random() * missions.length)];
    missionBox.textContent = mission;
    missionBox.classList.remove('done');
    syncCameraMission();
    say('Nova missão: ' + mission);
  }

  function toggleMissionDone(btn) {
    clickPulse(btn);
    missionBox.classList.toggle('done');
    syncCameraMission();
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
    setHelp('Athos colocado aqui. Agora use os botões fixos no rodapé.');
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
      setHelp('Athos carregado. Como este GLB não tem dança real, removi Dançar. Agora mini, normal, gigante, girar, pular, abaixar e falar usam comandos visuais do sistema.');
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
  syncCameraMission();
  bootWarnings();
})();
