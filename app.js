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

  const missions = [
    'Coloque o Athos perto de um brinquedo e faça ele girar.',
    'Coloque o Athos em cima da mesa e dê uma volta nele.',
    'Faça o Athos mini aparecer ao lado de um carrinho.',
    'Coloque o Athos gigante no chão e tire um print.',
    'Faça o Athos pular 3 vezes.',
    'Coloque o Athos no quarto e invente uma história.',
    'Leve o Athos para proteger uma base secreta.',
    'Deixe o Athos parado como uma estátua por 5 segundos.'
  ];

  let objectUrl = null;
  let motionRaf = null;
  let cameraStream = null;
  let currentScale = Number(localStorage.getItem('athos-scale') || 0.70);
  let currentRotation = 0;
  let currentTilt = 0;
  let offsetX = Number(localStorage.getItem('athos-x') || 0);
  let offsetY = Number(localStorage.getItem('athos-y') || 0);
  let loaded = false;

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
    if (app.dataset.mode === 'camera') modeBadge.textContent = 'CÂMERA';
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
      const msg = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, ''));
      msg.lang = 'pt-BR';
      msg.rate = 0.95;
      msg.pitch = 1.08;
      window.speechSynthesis.speak(msg);
    } catch (_) {}
  }

  function setScale(value) {
    currentScale = Math.max(0.25, Math.min(1.9, Number(value) || 0.70));
    const s = currentScale.toFixed(2);
    viewer.setAttribute('scale', `${s} ${s} ${s}`);
    scaleRange.value = String(Math.round(currentScale * 100));
    scaleValue.textContent = `${scaleRange.value}%`;
    localStorage.setItem('athos-scale', String(currentScale));
  }

  function setOffset(x, y) {
    offsetX = Math.max(-220, Math.min(220, Math.round(x)));
    offsetY = Math.max(-180, Math.min(180, Math.round(y)));
    app.style.setProperty('--athos-x', `${offsetX}px`);
    app.style.setProperty('--athos-y', `${offsetY}px`);
    localStorage.setItem('athos-x', String(offsetX));
    localStorage.setItem('athos-y', String(offsetY));
  }

  function applyOrientation(rot = currentRotation, tilt = currentTilt) {
    currentRotation = rot;
    currentTilt = tilt;
    viewer.setAttribute('orientation', `0deg ${Math.round(currentRotation)}deg ${Math.round(currentTilt)}deg`);
  }

  function clearMotion() {
    if (motionRaf) cancelAnimationFrame(motionRaf);
    motionRaf = null;
    viewer.classList.remove('is-jumping', 'is-crouching');
    viewer.autoRotate = false;
  }

  function centerAthos() {
    clearMotion();
    setOffset(0, 0);
    currentRotation = 0;
    currentTilt = 0;
    viewer.removeAttribute('orientation');
    viewer.cameraOrbit = '25deg 68deg 3.6m';
    viewer.fieldOfView = '30deg';
    if (typeof viewer.jumpCameraToGoal === 'function') viewer.jumpCameraToGoal();
    say('Athos centralizado. No modo câmera, toque na tela para colocar ele onde quiser.');
  }

  function startSpin() {
    clearMotion();
    const start = performance.now();
    const base = currentRotation;
    const step = (now) => {
      const t = (now - start) / 1000;
      applyOrientation(base + (t * 110), 0);
      motionRaf = requestAnimationFrame(step);
    };
    motionRaf = requestAnimationFrame(step);
    say('Agora o Athos está girando.');
  }

  function jump() {
    clearMotion();
    viewer.classList.add('is-jumping');
    window.setTimeout(() => viewer.classList.remove('is-jumping'), 540);
    say('Athos pulou!');
  }

  function crouch() {
    clearMotion();
    viewer.classList.add('is-crouching');
    window.setTimeout(() => viewer.classList.remove('is-crouching'), 620);
    say('Athos abaixou!');
  }

  function stopAll() {
    clearMotion();
    if (typeof viewer.pause === 'function') viewer.pause();
    applyOrientation(currentRotation, 0);
    say('Parei.');
  }

  function nudge(dx, dy) {
    setOffset(offsetX + dx, offsetY + dy);
    say('Posição ajustada.');
  }

  function action(name, btn) {
    clickPulse(btn);
    switch (name) {
      case 'mini':
        setScale(0.45);
        say('Athos mini ativado.');
        break;
      case 'normal':
        setScale(0.70);
        say('Athos voltou ao tamanho normal.');
        break;
      case 'giant':
        setScale(1.20);
        say('Athos gigante ativado.');
        break;
      case 'spin':
        startSpin();
        break;
      case 'crouch':
        crouch();
        break;
      case 'center':
        centerAthos();
        break;
      case 'jump':
        jump();
        break;
      case 'left':
        nudge(-28, 0);
        break;
      case 'right':
        nudge(28, 0);
        break;
      case 'up':
        nudge(0, -24);
        break;
      case 'down':
        nudge(0, 24);
        break;
      case 'hello':
        say('Oi Otto! Eu sou o Athos. Vamos brincar em 3D e câmera!');
        break;
      case 'stop':
        stopAll();
        break;
    }
  }

  async function startCameraMode(btn) {
    clickPulse(btn);
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      setStatus('Câmera bloqueada', 'warn');
      setHelp('A câmera só abre em link HTTPS. Suba no GitHub Pages e abra pelo link https://...');
      return;
    }
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia indisponível');
      }
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      cameraFeed.srcObject = cameraStream;
      app.dataset.mode = 'camera';
      modeBadge.textContent = 'CÂMERA';
      setStatus('Modo câmera ativo', 'ok');
      setHelp('Modo câmera ligado em tela cheia. Os botões ficam fixos no rodapé: pular, abaixar, girar, falar, mini, gigante e mover. Toque na câmera para posicionar o Athos.');
      setOffset(offsetX, offsetY);
      setScale(currentScale);
    } catch (err) {
      app.dataset.mode = 'normal';
      setStatus('Câmera não abriu', 'warn');
      setHelp('Não consegui abrir a câmera. Confira permissão do navegador. Precisa abrir pelo link HTTPS do GitHub Pages, não pelo arquivo solto do celular.');
    }
  }

  function stopCameraMode(btn) {
    clickPulse(btn);
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      cameraStream = null;
    }
    cameraFeed.srcObject = null;
    app.dataset.mode = 'normal';
    setStatus(loaded ? 'Athos carregado' : 'Modo 3D', loaded ? 'ok' : 'info');
    setHelp('Modo 3D normal. Aqui você pode girar com o dedo e usar os controles.');
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
      setHelp('Espere o Athos carregar primeiro. Depois toque em AR real novamente.');
      return;
    }
    if (typeof viewer.activateAR !== 'function') {
      setStatus('AR indisponível', 'warn');
      setHelp('O componente AR ainda não carregou no navegador. Use o botão “Brincar com câmera”, que funciona dentro da página.');
      return;
    }
    try {
      const ret = viewer.activateAR();
      if (ret && typeof ret.catch === 'function') {
        ret.catch(() => {
          setStatus('AR não abriu', 'warn');
          setHelp('O AR real não abriu neste navegador. Use “Brincar com câmera” para o Otto conseguir brincar com os botões funcionando.');
        });
      }
      setHelp('Se o celular aceitar AR real, ele vai abrir o visualizador nativo. Nesse modo os botões da página podem não aparecer.');
    } catch (err) {
      setStatus('AR não abriu', 'warn');
      setHelp('O AR real não abriu neste aparelho. Use “Brincar com câmera”, que mantém os controles funcionando.');
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

  function newMission(btn) {
    clickPulse(btn);
    const mission = missions[Math.floor(Math.random() * missions.length)];
    missionBox.textContent = mission;
    missionBox.classList.remove('done');
    say('Nova missão: ' + mission);
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

  scaleRange.addEventListener('input', () => setScale(Number(scaleRange.value) / 100));
  centerBtn.addEventListener('click', () => { clickPulse(centerBtn); centerAthos(); });
  openArBtn.addEventListener('click', () => openNativeAR(openArBtn));
  cameraModeBtn.addEventListener('click', () => startCameraMode(cameraModeBtn));
  normalModeBtn.addEventListener('click', () => stopCameraMode(normalModeBtn));
  newMissionBtn.addEventListener('click', () => newMission(newMissionBtn));
  doneMissionBtn.addEventListener('click', () => {
    clickPulse(doneMissionBtn);
    missionBox.classList.toggle('done');
    say(missionBox.classList.contains('done') ? 'Missão concluída!' : 'Missão reaberta!');
  });

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
    const data = { title: 'Athos AR', text: 'Brincar com o Athos em 3D e câmera', url: location.href };
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
    setScale(currentScale);
    setOffset(offsetX, offsetY);
    const animations = viewer.availableAnimations || [];
    setStatus('Athos carregado', 'ok');
    if (animations.length) {
      setHelp(`Athos carregado com ${animations.length} animação(ões) internas. Nesta versão, o botão Dançar foi removido e os comandos principais ficam no rodapé do modo câmera.`);
    } else {
      setHelp('Athos carregado. Como este GLB não tem dança real, removi Dançar. Pular, abaixar, girar, falar e tamanho funcionam pelo sistema.');
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
      setHelp('O AR real falhou neste aparelho/navegador. Toque em “Brincar com câmera”, que mantém os botões funcionando.');
    }
  });

  window.addEventListener('beforeunload', () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    if (cameraStream) cameraStream.getTracks().forEach((track) => track.stop());
  });

  clearOldServiceWorkerCache();
  const savedTheme = localStorage.getItem('athos-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
  applyStage(localStorage.getItem('athos-stage') || 'fire');
  setScale(currentScale);
  setOffset(offsetX, offsetY);
  bootWarnings();
})();
