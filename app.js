(() => {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const app = $('#app');
  const viewer = $('#athosViewer');
  const statusText = $('#statusText');
  const arBadge = $('#arBadge');
  const helpBox = $('#helpBox');
  const progressBar = $('#progressBar');
  const scaleRange = $('#scaleRange');
  const scaleValue = $('#scaleValue');
  const openArBtn = $('#openArBtn');
  const centerBtn = $('#centerBtn');
  const themeBtn = $('#themeBtn');
  const shareBtn = $('#shareBtn');
  const modelFile = $('#modelFile');
  const missionBox = $('#missionBox');
  const newMissionBtn = $('#newMissionBtn');
  const doneMissionBtn = $('#doneMissionBtn');

  const missions = [
    'Coloque o Athos em cima da mesa e dê uma volta nele.',
    'Faça o Athos mini aparecer perto de um brinquedo.',
    'Coloque o Athos gigante no chão e tire uma foto.',
    'Mude o palco para fogo e faça o Athos girar.',
    'Coloque o Athos no quarto e invente uma história.',
    'Faça o Athos falar e depois centralize ele na tela.',
    'Coloque o Athos perto de uma caixa e diga que é a base secreta.',
    'Deixe o Athos parado por 5 segundos como uma estátua.'
  ];

  let objectUrl = null;
  let danceRaf = null;
  let currentScale = Number(localStorage.getItem('athos-scale') || 0.70);

  function setStatus(text, kind = 'info') {
    statusText.textContent = text;
    arBadge.classList.remove('ok', 'warn');
    if (kind === 'ok') arBadge.classList.add('ok');
    if (kind === 'warn') arBadge.classList.add('warn');
    arBadge.textContent = kind === 'ok' ? 'OK' : kind === 'warn' ? 'AVISO' : '3D';
  }

  function setHelp(text) {
    helpBox.textContent = text;
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) {
      setHelp(text);
      return;
    }
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'pt-BR';
    msg.rate = 0.95;
    msg.pitch = 1.08;
    window.speechSynthesis.speak(msg);
  }

  function setScale(value) {
    currentScale = Math.max(0.25, Math.min(1.8, Number(value) || 0.70));
    const s = currentScale.toFixed(2);
    viewer.setAttribute('scale', `${s} ${s} ${s}`);
    scaleRange.value = Math.round(currentScale * 100);
    scaleValue.textContent = `${scaleRange.value}%`;
    localStorage.setItem('athos-scale', String(currentScale));
  }

  function centerCamera() {
    stopDance(false);
    viewer.autoRotate = false;
    viewer.cameraOrbit = '25deg 68deg 3.6m';
    viewer.fieldOfView = '30deg';
    viewer.removeAttribute('orientation');
    if (typeof viewer.jumpCameraToGoal === 'function') viewer.jumpCameraToGoal();
    setHelp('Athos centralizado. Agora arraste com o dedo para olhar de todos os lados.');
  }

  function stopDance(say = true) {
    if (danceRaf) cancelAnimationFrame(danceRaf);
    danceRaf = null;
    viewer.autoRotate = false;
    if (typeof viewer.pause === 'function') viewer.pause();
    viewer.removeAttribute('orientation');
    if (say) speak('Parei!');
  }

  function fakeDance() {
    stopDance(false);
    const start = performance.now();
    const step = (now) => {
      const t = (now - start) / 1000;
      const y = Math.round(Math.sin(t * 4) * 18);
      const z = Math.round(Math.sin(t * 7) * 4);
      viewer.setAttribute('orientation', `0deg ${y}deg ${z}deg`);
      danceRaf = requestAnimationFrame(step);
    };
    danceRaf = requestAnimationFrame(step);
  }

  function dance() {
    const animations = viewer.availableAnimations || [];
    if (animations.length) {
      viewer.animationName = animations[0];
      if (typeof viewer.play === 'function') viewer.play({ repetitions: 1 });
      speak('Olha minha animação!');
      return;
    }
    fakeDance();
    speak('Meu arquivo não tem animação pronta, então vou dançar balançando!');
  }

  function action(name) {
    switch (name) {
      case 'mini':
        setScale(0.45);
        speak('Athos mini ativado!');
        break;
      case 'normal':
        setScale(0.70);
        speak('Voltei ao tamanho normal!');
        break;
      case 'giant':
        setScale(1.15);
        speak('Athos gigante ativado!');
        break;
      case 'spin':
        stopDance(false);
        viewer.autoRotate = !viewer.autoRotate;
        speak(viewer.autoRotate ? 'Agora vou girar!' : 'Parei de girar!');
        break;
      case 'dance':
        dance();
        break;
      case 'stop':
        stopDance(true);
        break;
      case 'hello':
        speak('Oi Otto! Eu sou o Athos. Vamos brincar em realidade aumentada!');
        break;
      case 'photoTip':
        speak('Para tirar foto, abra em realidade aumentada e use o print ou a câmera do celular.');
        setHelp('Dica: abra em AR, posicione o Athos e use a captura de tela do celular para guardar a aventura.');
        break;
    }
  }

  async function openAR() {
    try {
      if (typeof viewer.activateAR === 'function') {
        await viewer.activateAR();
      } else {
        setHelp('Use o botão “Colocar o Athos no mundo real” dentro do visualizador.');
      }
    } catch (err) {
      setHelp('Não consegui abrir o AR neste aparelho. Tente no Chrome do Android pelo link HTTPS do GitHub Pages. No iPhone, pode ser necessário também um arquivo athos.usdz.');
      setStatus('AR não abriu neste aparelho', 'warn');
    }
  }

  function applyTheme(theme) {
    app.dataset.theme = theme;
    themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('athos-theme', theme);
  }

  function applyStage(stage) {
    app.dataset.stage = stage;
    localStorage.setItem('athos-stage', stage);
    $$('#stageButtons .chip').forEach((btn) => btn.classList.toggle('active', btn.dataset.stage === stage));
  }

  function newMission() {
    const mission = missions[Math.floor(Math.random() * missions.length)];
    missionBox.textContent = mission;
    missionBox.classList.remove('done');
    speak('Nova missão: ' + mission);
  }

  $$('.playBtn[data-action]').forEach((btn) => btn.addEventListener('click', () => action(btn.dataset.action)));
  $$('#stageButtons .chip').forEach((btn) => btn.addEventListener('click', () => applyStage(btn.dataset.stage)));

  scaleRange.addEventListener('input', () => setScale(Number(scaleRange.value) / 100));
  centerBtn.addEventListener('click', centerCamera);
  openArBtn.addEventListener('click', openAR);
  newMissionBtn.addEventListener('click', newMission);
  doneMissionBtn.addEventListener('click', () => {
    missionBox.classList.toggle('done');
    speak(missionBox.classList.contains('done') ? 'Missão concluída!' : 'Missão reaberta!');
  });

  themeBtn.addEventListener('click', () => {
    applyTheme(app.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  shareBtn.addEventListener('click', async () => {
    const data = { title: 'Athos AR', text: 'Brincar com o Athos em 3D e AR', url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(location.href);
        shareBtn.textContent = '✅ Copiado';
        setTimeout(() => (shareBtn.textContent = '🔗 Link'), 1300);
      }
    } catch (_) {}
  });

  modelFile.addEventListener('change', () => {
    const file = modelFile.files && modelFile.files[0];
    if (!file) return;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    viewer.src = objectUrl;
    setStatus('Testando modelo local', 'info');
    setHelp(`Modelo temporário carregado: ${file.name}. Para publicar de verdade, substitua o athos.glb no GitHub.`);
  });

  viewer.addEventListener('progress', (ev) => {
    const progress = Math.round((ev.detail.totalProgress || 0) * 100);
    progressBar.style.width = `${progress}%`;
  });

  viewer.addEventListener('load', () => {
    progressBar.style.width = '100%';
    setScale(currentScale);
    setStatus('Athos carregado', 'ok');
    const animations = viewer.availableAnimations || [];
    if (animations.length) {
      setHelp(`Athos carregado com ${animations.length} animação(ões). Use “Dançar” para testar.`);
    } else {
      setHelp('Athos carregado. Use Mini, Normal, Gigante, Girar, Dançar e Abrir em AR.');
    }
  });

  viewer.addEventListener('error', () => {
    setStatus('Erro no athos.glb', 'warn');
    setHelp('O arquivo athos.glb está na pasta, mas o navegador não conseguiu abrir. Gere/exporte novamente como GLB 2.0 e substitua o arquivo no GitHub.');
  });

  viewer.addEventListener('ar-status', (event) => {
    const status = event.detail.status;
    if (status === 'session-started') {
      setStatus('AR aberto', 'ok');
      setHelp('Mova o celular devagar até o Athos aparecer no chão ou na mesa.');
    } else if (status === 'object-placed') {
      speak('Athos colocado no mundo real!');
      setHelp('Pronto! Agora ande ao redor com cuidado e veja o Athos de todos os lados.');
    } else if (status === 'failed') {
      setStatus('AR falhou', 'warn');
      setHelp('O AR pode exigir Chrome atualizado, internet HTTPS e suporte de ARCore no Android. No iPhone, adicione também um arquivo athos.usdz.');
    }
  });

  window.addEventListener('beforeunload', () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  });

  const savedTheme = localStorage.getItem('athos-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
  applyStage(localStorage.getItem('athos-stage') || 'fire');
  setScale(currentScale);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
})();
