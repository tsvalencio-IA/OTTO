// =========================================================================
// ATHOS: GUARDIÃO DOS PORTAIS — app.js
// Engine completa: Lobby (model-viewer) + Jogo 3D real (Three.js).
// Sem build, sem npm — roda direto no GitHub Pages via ES Modules / CDN.
//
// Módulos:
//   StorageManager  -> localStorage (pontos, corações, medalhas, progresso)
//   AthosBrain      -> respostas locais por palavra-chave + voz
//   QuizManager     -> perguntas, modal de quiz
//   WorldBuilder    -> constrói os mundos 3D voxel (chão, obstáculos, portal...)
//   MissionManager  -> define/valida missões reais (posição + estado, não só botão)
//   GameEngine      -> Three.js: cena, câmera, player, física simples, loop
//   LobbyEngine     -> tela inicial (model-viewer + stats + botões)
// =========================================================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const appEl = $('#app');

// -------------------------------------------------------------------------
// StorageManager
// -------------------------------------------------------------------------
const StorageManager = (() => {
  const KEY = 'athosGP-state-v1';

  const DEFAULT_STATE = {
    points: 0,
    hearts: 3,
    medals: [],
    currentMissionIndex: 0,
    difficulty: 'facil',
    unlockedWorlds: ['campo'],
    bestScore: 0,
    quizStats: { right: 0, answered: 0 },
    counters: { jump: 0, crouch: 0, power: 0, spin: 0, giant: 0, mini: 0, collect: 0 },
    phase: 1,
    collection: []
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return structuredCloneSafe(DEFAULT_STATE);
      const parsed = JSON.parse(raw);
      return Object.assign(structuredCloneSafe(DEFAULT_STATE), parsed, {
        quizStats: Object.assign({ right: 0, answered: 0 }, parsed.quizStats || {}),
        counters: Object.assign({ jump: 0, crouch: 0, power: 0, spin: 0, giant: 0, mini: 0, collect: 0 }, parsed.counters || {}),
        medals: Array.isArray(parsed.medals) ? parsed.medals : [],
        unlockedWorlds: Array.isArray(parsed.unlockedWorlds) && parsed.unlockedWorlds.length ? parsed.unlockedWorlds : ['campo']
      });
    } catch (_) {
      return structuredCloneSafe(DEFAULT_STATE);
    }
  }

  function structuredCloneSafe(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  let state = loadState();

  function saveState() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { /* silencioso: pode ser modo privado */ }
  }

  function resetState() {
    state = structuredCloneSafe(DEFAULT_STATE);
    saveState();
    return state;
  }

  return {
    get: () => state,
    save: saveState,
    reset: resetState,
    set(patch) { Object.assign(state, patch); saveState(); },
    addPoints(n) { state.points = Math.max(0, state.points + n); if (state.points > state.bestScore) state.bestScore = state.points; saveState(); },
    loseHeart() { state.hearts = Math.max(0, state.hearts - 1); saveState(); return state.hearts; },
    resetHearts(n) { state.hearts = n; saveState(); },
    incCounter(key) { state.counters[key] = (state.counters[key] || 0) + 1; saveState(); return state.counters[key]; },
    unlockWorld(id) { if (!state.unlockedWorlds.includes(id)) { state.unlockedWorlds.push(id); saveState(); return true; } return false; },
    unlockMedal(id) { if (!state.medals.includes(id)) { state.medals.push(id); saveState(); return true; } return false; }
  };
})();

// -------------------------------------------------------------------------
// Dados de conteúdo: mundos, medalhas, missões, quiz, respostas
// -------------------------------------------------------------------------

const WORLDS = [
  { id: 'campo', name: 'Campo dos Blocos', ground: 0x4caf50, ground2: 0x3d8b40, sky: 0x9fe0ff, fog: 0x9fe0ff, light: 0xfff2cf, accent: 0x2e7d32, deco: 'grass' },
  { id: 'vulcao', name: 'Vulcão Pixel', ground: 0x5b2a1e, ground2: 0x3a1810, sky: 0x2a0f0a, fog: 0x2a0f0a, light: 0xff8a3d, accent: 0xff5722, deco: 'lava' },
  { id: 'floresta', name: 'Floresta Voxel', ground: 0x2e5d33, ground2: 0x224526, sky: 0x123322, fog: 0x123322, light: 0xbfffb0, accent: 0x1b5e20, deco: 'trees' },
  { id: 'castelo', name: 'Castelo de Pedra', ground: 0x777c85, ground2: 0x5b5f66, sky: 0x1c2230, fog: 0x1c2230, light: 0xd8c9a3, accent: 0x8d6e63, deco: 'stone' },
  { id: 'espaco', name: 'Espaço Cubo', ground: 0x2b2560, ground2: 0x1c1840, sky: 0x05040f, fog: 0x05040f, light: 0x9fd6ff, accent: 0x7c5cff, deco: 'stars' },
  { id: 'arena', name: 'Arena dos Portais', ground: 0x3a3a4a, ground2: 0x27273a, sky: 0x120f22, fog: 0x120f22, light: 0xffd166, accent: 0xff4d6d, deco: 'portals' }
];
// "Mundo Real" é um extra apenas do modo Brincar Livre (usa câmera do celular).
const REAL_WORLD = { id: 'real', name: 'Mundo Real (câmera)', ground: 0x000000, sky: 0x000000, fog: 0x000000, light: 0xffffff, accent: 0x3dd6ff, deco: 'none' };

function worldById(id) {
  return WORLDS.find((w) => w.id === id) || (id === 'real' ? REAL_WORLD : WORLDS[0]);
}

const MEDALS = [
  { id: 'primeiro_pulo', icon: '🦘', name: 'Primeiro Pulo' },
  { id: 'guardiao_fogo', icon: '🔥', name: 'Guardião do Fogo' },
  { id: 'mestre_portais', icon: '🌀', name: 'Mestre dos Portais' },
  { id: 'athos_gigante', icon: '🦾', name: 'Athos Gigante' },
  { id: 'campeao_quiz', icon: '🧠', name: 'Campeão do Quiz' },
  { id: 'explorador_mundos', icon: '🗺️', name: 'Explorador dos Mundos' },
  { id: 'sequencia_perfeita', icon: '⭐', name: 'Sequência Perfeita' }
];

const MISSION_STEP_LABEL = {
  jump: 'Pule sobre o bloco de obstáculo.',
  crouch: 'Abaixe para passar por baixo do portal.',
  collectLeft: 'Colete o cristal à esquerda.',
  collectRight: 'Colete o cristal à direita.',
  giant: 'Fique gigante para abrir o portão.',
  mini: 'Fique mini para passar pelo túnel.',
  power: 'Use o poder de fogo para acender o bloco escuro.',
  spin: 'Gire perto do portal para ativá-lo.'
};
const MISSION_STEP_POOL = Object.keys(MISSION_STEP_LABEL);

const QUIZ_QUESTIONS = [
  { q: 'Qual é a cor principal do Athos?', options: ['Preto', 'Azul', 'Verde'], answer: 0, explain: 'O Athos é preto, com olhos vermelhos e detalhes de fogo.' },
  { q: 'Quais cores aparecem no fogo do Athos?', options: ['Amarelo, laranja e vermelho', 'Roxo e rosa', 'Azul e cinza'], answer: 0, explain: 'O fogo pixelado dele tem amarelo, laranja e vermelho.' },
  { q: 'Quem brinca com o Athos neste jogo?', options: ['Otto', 'Um robô desconhecido', 'Um dragão'], answer: 0, explain: 'O jogo foi feito para o Otto brincar com o Athos.' },
  { q: 'Qual botão deixa o Athos maior?', options: ['Crescer', 'Mini', 'Pausar'], answer: 0, explain: 'O botão Crescer deixa o Athos gigante.' },
  { q: 'O que o Athos precisa fazer para passar num túnel baixo?', options: ['Abaixar', 'Girar', 'Ficar gigante'], answer: 0, explain: 'Abaixar deixa o Athos baixinho para passar por baixo.' },
  { q: 'Como o Athos ativa um portal?', options: ['Girando perto dele', 'Dormindo', 'Ficando parado longe'], answer: 0, explain: 'Girar perto do portal ativa a energia dele.' },
  { q: 'Qual mundo tem lava e fogo?', options: ['Vulcão Pixel', 'Espaço Cubo', 'Floresta Voxel'], answer: 0, explain: 'O Vulcão Pixel é o mundo de fogo do Athos.' },
  { q: 'Qual botão faz o Athos responder com voz?', options: ['Falar', 'Mini', 'Direita'], answer: 0, explain: 'Falar faz o Athos conversar com o Otto.' },
  { q: 'O Athos é mais parecido com qual estilo?', options: ['Boneco blocado voxel', 'Carro realista', 'Peixe'], answer: 0, explain: 'O Athos é um personagem blocado, estilo voxel.' },
  { q: 'O que dá pontos extras para o Otto?', options: ['Completar missões e o quiz', 'Ficar parado', 'Fechar o jogo'], answer: 0, explain: 'Missões e o quiz dão pontos e medalhas para o Otto.' },
  { q: 'Qual botão diminui o Athos?', options: ['Mini', 'Gigante', 'Girar'], answer: 0, explain: 'O botão Mini deixa o Athos pequeno.' },
  { q: 'Para onde o cristal desaparece quando o Athos coleta?', options: ['Vira pontos e brilho', 'Vira uma pedra', 'Nada acontece'], answer: 0, explain: 'Ao coletar, o cristal vira pontos e um brilho de energia.' }
];

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// -------------------------------------------------------------------------
// AthosBrain — respostas locais por palavra-chave + voz (sem API externa)
// -------------------------------------------------------------------------
const AthosBrain = (() => {
  function say(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(String(text).replace(/<[^>]+>/g, ''));
      msg.lang = 'pt-BR';
      msg.rate = 0.96;
      msg.pitch = 1.06;
      window.speechSynthesis.speak(msg);
    } catch (_) { /* voz indisponível, seguimos só com texto */ }
  }

  function answer(rawQuestion, missionTextNow) {
    const q = normalizeText(rawQuestion);
    let a = '';
    if (!q) a = 'Pergunte alguma coisa sobre mim: meus poderes, meus mundos ou minhas missões.';
    else if (q.includes('quem') || q.includes('athos') || q.includes('atos')) a = 'Eu sou o Athos, guardião dos portais! Um personagem 3D blocado, preto, com olhos vermelhos e fogo pixelado nos braços e pernas.';
    else if (q.includes('medo')) a = 'Às vezes fico com medo do escuro dos portais, mas com o Otto do meu lado eu fico corajoso!';
    else if (q.includes('amigo')) a = 'Meu maior amigo é o Otto. A gente enfrenta os portais e os mundos juntos.';
    else if (q.includes('poder') || q.includes('forca') || q.includes('magia')) a = 'Meu poder é a chama pixelada! Com ela eu acendo blocos escuros, pulo mais alto e abro portais.';
    else if (q.includes('otto')) a = 'O Otto é meu parceiro de aventura. Ele escolhe o mundo, cumpre as missões e ganha pontos comigo.';
    else if (q.includes('missao') || q.includes('fazer agora')) a = 'A missão atual é: ' + (missionTextNow || 'explorar o mundo e procurar o próximo desafio.');
    else if (q.includes('historia') || q.includes('conte')) a = 'Um dia, no Vulcão Pixel, minhas chamas brilharam tanto que abriram um portal para outros mundos. Desde então eu protejo cada portal com o Otto.';
    else if (q.includes('fogo') || q.includes('chama') || q.includes('vulcao')) a = 'O Vulcão Pixel é o mundo onde nasci. As chamas dos meus braços e pernas vêm de lá.';
    else if (q.includes('espaco') || q.includes('estrela') || q.includes('planeta')) a = 'No Espaço Cubo eu viajo entre planetas quadrados e procuro estrelas para guiar o Otto.';
    else if (q.includes('floresta') || q.includes('arvore')) a = 'A Floresta Voxel tem árvores gigantes escondendo portais secretos.';
    else if (q.includes('castelo')) a = 'No Castelo de Pedra eu preciso abaixar e passar pelos portões para achar o cristal de fogo.';
    else if (q.includes('mundo')) a = 'Tenho seis mundos: Campo dos Blocos, Vulcão Pixel, Floresta Voxel, Castelo de Pedra, Espaço Cubo e a Arena dos Portais.';
    else if (q.includes('gigante')) a = 'Quando fico gigante, consigo abrir portões pesados e proteger o Otto.';
    else if (q.includes('mini')) a = 'Quando fico mini, passo por túneis pequenos e cantos escondidos.';
    else if (q.includes('quiz')) a = 'No quiz, você responde perguntas sobre o meu mundo. Cada acerto dá pontos e ajuda a destravar missões.';
    else if (q.includes('portal')) a = 'Os portais só se abrem quando eu giro perto deles com energia total!';
    else a = 'Boa pergunta! Tente perguntar sobre fogo, espaço, floresta, castelo, poderes, mundo, medo, amigo ou missões.';
    say(a);
    return a;
  }

  function startVoiceQuestion(onResult, onError) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError && onError('Meu celular não aceitou pergunta por voz aqui. Pode digitar a pergunta.');
      return;
    }
    try {
      const rec = new SpeechRecognition();
      rec.lang = 'pt-BR';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (event) => {
        const text = event.results && event.results[0] && event.results[0][0] ? event.results[0][0].transcript : '';
        onResult && onResult(text);
      };
      rec.onerror = () => onError && onError('Não consegui ouvir agora. Digite a pergunta para o Athos.');
      rec.start();
    } catch (_) {
      onError && onError('A pergunta por voz não abriu neste navegador. Use o teclado.');
    }
  }

  return { answer, say, startVoiceQuestion };
})();

// -------------------------------------------------------------------------
// QuizManager
// -------------------------------------------------------------------------
const QuizManager = (() => {
  let order = [];
  let current = null;
  let locked = false;
  let onCorrectCallback = null;

  const els = {};
  function bindEls() {
    els.points = $('#quizPoints');
    els.right = $('#quizRight');
    els.answered = $('#quizAnswered');
    els.question = $('#quizQuestion');
    els.options = $('#quizOptions');
    els.feedback = $('#quizFeedback');
    els.startBtn = $('#quizStartBtn');
    els.nextBtn = $('#quizNextBtn');
  }

  function shuffledIndexes(len) {
    return Array.from({ length: len }, (_, i) => i).sort(() => Math.random() - 0.5);
  }

  function updateScoreUI() {
    const s = StorageManager.get();
    if (els.points) els.points.textContent = String(s.points);
    if (els.right) els.right.textContent = String(s.quizStats.right);
    if (els.answered) els.answered.textContent = String(s.quizStats.answered);
  }

  function renderStart() {
    if (els.question) els.question.textContent = 'Toque em Começar para jogar o Quiz do Athos.';
    if (els.options) els.options.innerHTML = '';
    if (els.feedback) els.feedback.textContent = 'Acerte perguntas para ganhar pontos e medalhas.';
    updateScoreUI();
  }

  function next() {
    if (!order.length) order = shuffledIndexes(QUIZ_QUESTIONS.length);
    const idx = order.shift();
    current = QUIZ_QUESTIONS[idx];
    locked = false;
    if (els.question) els.question.textContent = current.q;
    if (els.feedback) els.feedback.textContent = 'Escolha uma resposta.';
    if (els.options) {
      els.options.innerHTML = '';
      current.options.forEach((opt, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = opt;
        b.addEventListener('click', () => answerQuiz(i, b));
        els.options.appendChild(b);
      });
    }
  }

  function answerQuiz(i, btn) {
    if (!current || locked) return;
    locked = true;
    const s = StorageManager.get();
    s.quizStats.answered += 1;
    const correct = i === current.answer;
    if (correct) {
      s.quizStats.right += 1;
      StorageManager.addPoints(10);
      if (btn) btn.classList.add('correct');
      if (els.feedback) els.feedback.textContent = current.explain + ' +10 pontos.';
      AthosBrain.say('Resposta certa! ' + current.explain);
      if (s.quizStats.right >= 8) {
        if (StorageManager.unlockMedal('campeao_quiz')) Toast.medal('🧠 Medalha: Campeão do Quiz!');
      }
      if (typeof onCorrectCallback === 'function') { const cb = onCorrectCallback; onCorrectCallback = null; cb(); }
    } else {
      if (btn) btn.classList.add('wrong');
      const correctBtn = els.options ? els.options.children[current.answer] : null;
      if (correctBtn) correctBtn.classList.add('correct');
      if (els.feedback) els.feedback.textContent = 'Quase! ' + current.explain;
      AthosBrain.say('Quase! ' + current.explain);
    }
    StorageManager.save();
    updateScoreUI();
  }

  function open(onCorrect) {
    bindEls();
    onCorrectCallback = onCorrect || null;
    ModalManager.open('quizModal');
    renderStart();
  }

  function init() {
    bindEls();
    if (els.startBtn) els.startBtn.addEventListener('click', next);
    if (els.nextBtn) els.nextBtn.addEventListener('click', next);
    renderStart();
  }

  return { init, open, renderStart, updateScoreUI };
})();

// -------------------------------------------------------------------------
// ModalManager — genérico para quiz / talk / coleção / dificuldade / mundo
// -------------------------------------------------------------------------
const ModalManager = (() => {
  function open(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.hidden = false;
    el.setAttribute('aria-hidden', 'false');
  }
  function close(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.hidden = true;
    el.setAttribute('aria-hidden', 'true');
  }
  function init() {
    $$('.modalCloseBtn[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => close(btn.dataset.closeModal));
    });
    $$('.modal').forEach((modal) => {
      modal.addEventListener('click', (ev) => { if (ev.target === modal) close(modal.id); });
    });
  }
  return { open, close, init };
})();

// -------------------------------------------------------------------------
// Toast — feedback visual rápido dentro do jogo
// -------------------------------------------------------------------------
const Toast = (() => {
  let el = null;
  let hideTimer = null;
  function ensure() { if (!el) el = $('#toast'); return el; }
  function show(text, kind = '') {
    ensure();
    if (!el) return;
    el.textContent = text;
    el.className = 'toast' + (kind ? ' ' + kind : '');
    el.hidden = false;
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => { el.hidden = true; }, 2200);
  }
  const success = (t) => show(t, 'success');
  const error = (t) => show(t, 'error');
  const medal = (t) => show(t, 'success');
  return { show, success, error, medal };
})();

// -------------------------------------------------------------------------
// WorldBuilder — constrói cada mundo 3D voxel (chão, decoração, objetos)
// -------------------------------------------------------------------------
const WorldBuilder = (() => {
  // Posições (lanes) para os objetos interativos das missões.
  const LANE_X = { collectLeft: -10, crouch: -7.2, jump: -4.3, power: -1.4, spin: 1.4, giant: 4.3, mini: 7.2, collectRight: 10 };
  const OBJECT_Z = -9;

  let currentGroup = null;
  const disposables = [];

  function disposeGroup(group) {
    if (!group) return;
    group.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    });
  }

  function makeGround(worldDef) {
    const group = new THREE.Group();
    const size = 26;
    const half = size / 2;
    // Chão sólido (colisão / base visual) — MeshLambertMaterial, nunca ShadowMaterial como chão colorido.
    const baseGeo = new THREE.BoxGeometry(size, 1, 20);
    const baseMat = new THREE.MeshLambertMaterial({ color: worldDef.ground });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(0, -0.5, -4);
    base.receiveShadow = true;
    group.add(base);

    // Blocos voxel decorativos no chão (InstancedMesh por performance).
    const blockGeo = new THREE.BoxGeometry(0.98, 0.3, 0.98);
    const blockMat = new THREE.MeshLambertMaterial({ color: worldDef.ground2 });
    const cols = 20, rows = 16;
    const inst = new THREE.InstancedMesh(blockGeo, blockMat, cols * rows);
    const dummy = new THREE.Object3D();
    let i = 0;
    for (let cx = 0; cx < cols; cx++) {
      for (let cz = 0; cz < rows; cz++) {
        if (Math.random() > 0.16) continue;
        const x = -half + cx + (Math.random() * 0.4 - 0.2);
        const z = -14 + cz + (Math.random() * 0.4 - 0.2);
        dummy.position.set(x, 0.15, z);
        dummy.rotation.y = Math.random() * Math.PI;
        dummy.updateMatrix();
        inst.setMatrixAt(i++, dummy.matrix);
      }
    }
    inst.count = i;
    group.add(inst);
    return group;
  }

  function makeObstacleJump() {
    const g = new THREE.Group();
    const geo = new THREE.BoxGeometry(1.6, 1.1, 1.6);
    const mat = new THREE.MeshStandardMaterial({ color: 0xff5252, emissive: 0x4a0e0e, roughness: 0.5 });
    const box = new THREE.Mesh(geo, mat);
    box.position.y = 0.55;
    box.castShadow = true;
    g.add(box);
    g.userData.baseY = 0.55;
    return g;
  }

  function makeTunnelCrouch() {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.8 });
    const beamGeo = new THREE.BoxGeometry(2.4, 0.5, 1.2);
    const beam = new THREE.Mesh(beamGeo, mat);
    beam.position.y = 1.55;
    g.add(beam);
    const postGeo = new THREE.BoxGeometry(0.4, 1.8, 1.2);
    [-1.2, 1.2].forEach((x) => {
      const p = new THREE.Mesh(postGeo, mat);
      p.position.set(x, 0.9, 0);
      g.add(p);
    });
    return g;
  }

  function makeMiniTunnel() {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x64b5f6, emissive: 0x0a2a4a, roughness: 0.6 });
    const beamGeo = new THREE.BoxGeometry(1.5, 0.3, 1);
    const beam = new THREE.Mesh(beamGeo, mat);
    beam.position.y = 0.75;
    g.add(beam);
    const postGeo = new THREE.BoxGeometry(0.25, 0.75, 1);
    [-0.7, 0.7].forEach((x) => {
      const p = new THREE.Mesh(postGeo, mat);
      p.position.set(x, 0.375, 0);
      g.add(p);
    });
    return g;
  }

  function makeGate() {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0xffb74d, emissive: 0x4a2a05, roughness: 0.4, metalness: 0.2 });
    const doorGeo = new THREE.BoxGeometry(1.1, 2.6, 0.25);
    const left = new THREE.Mesh(doorGeo, mat);
    left.position.set(-0.6, 1.3, 0);
    left.name = 'doorLeft';
    const right = new THREE.Mesh(doorGeo, mat.clone());
    right.position.set(0.6, 1.3, 0);
    right.name = 'doorRight';
    g.add(left, right);
    g.userData.left = left;
    g.userData.right = right;
    g.userData.open = false;
    return g;
  }

  function makeDarkBlock() {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x1a1a24, emissive: 0x000000, roughness: 0.7 });
    const geo = new THREE.BoxGeometry(1.3, 1.3, 1.3);
    const box = new THREE.Mesh(geo, mat);
    box.position.y = 0.65;
    g.add(box);
    g.userData.mesh = box;
    g.userData.lit = false;
    return g;
  }

  function makePortal() {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x7c5cff, emissive: 0x3d2a8f, roughness: 0.3, metalness: 0.4 });
    const geo = new THREE.TorusGeometry(1.1, 0.18, 12, 24);
    const torus = new THREE.Mesh(geo, mat);
    torus.position.y = 1.3;
    g.add(torus);
    g.userData.torus = torus;
    return g;
  }

  function makeCrystal(color) {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6, roughness: 0.25 });
    const geo = new THREE.OctahedronGeometry(0.55, 0);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 1.0;
    g.add(mesh);
    g.userData.mesh = mesh;
    g.userData.collected = false;
    return g;
  }

  function addDecor(group, worldDef) {
    const deco = new THREE.Group();
    const colors = [worldDef.ground2, worldDef.accent];
    for (let i = 0; i < 22; i++) {
      const s = 0.5 + Math.random() * 1.1;
      const geo = new THREE.BoxGeometry(s, s, s);
      const mat = new THREE.MeshLambertMaterial({ color: colors[i % colors.length] });
      const mesh = new THREE.Mesh(geo, mat);
      const side = Math.random() < 0.5 ? -1 : 1;
      mesh.position.set(side * (12 + Math.random() * 6), s / 2, -2 - Math.random() * 16);
      mesh.rotation.y = Math.random() * Math.PI;
      deco.add(mesh);
    }
    group.add(deco);
  }

  function setupLights(scene, worldDef) {
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    const dir = new THREE.DirectionalLight(worldDef.light, 0.9);
    dir.position.set(6, 12, 8);
    dir.castShadow = true;
    dir.shadow.mapSize.set(1024, 1024);
    const rim = new THREE.PointLight(worldDef.accent, 0.6, 30);
    rim.position.set(0, 4, -8);
    const lightGroup = new THREE.Group();
    lightGroup.add(ambient, dir, rim);
    scene.add(lightGroup);
    return lightGroup;
  }

  function build(scene, worldId, isRealCamera) {
    if (currentGroup) {
      scene.remove(currentGroup);
      disposeGroup(currentGroup);
      currentGroup = null;
    }
    const worldDef = worldById(worldId);
    const group = new THREE.Group();
    group.name = 'world-' + worldId;

    if (!isRealCamera) {
      scene.background = new THREE.Color(worldDef.sky);
      scene.fog = new THREE.Fog(worldDef.fog, 14, 42);
      group.add(makeGround(worldDef));
      addDecor(group, worldDef);
    } else {
      scene.background = null;
      scene.fog = null;
    }

    const objects = {};
    objects.jump = makeObstacleJump(); objects.jump.position.set(LANE_X.jump, 0, OBJECT_Z);
    objects.crouch = makeTunnelCrouch(); objects.crouch.position.set(LANE_X.crouch, 0, OBJECT_Z);
    objects.collectLeft = makeCrystal(0x3dd6ff); objects.collectLeft.position.set(LANE_X.collectLeft, 0, OBJECT_Z);
    objects.collectRight = makeCrystal(0xffd166); objects.collectRight.position.set(LANE_X.collectRight, 0, OBJECT_Z);
    objects.giant = makeGate(); objects.giant.position.set(LANE_X.giant, 0, OBJECT_Z);
    objects.mini = makeMiniTunnel(); objects.mini.position.set(LANE_X.mini, 0, OBJECT_Z);
    objects.power = makeDarkBlock(); objects.power.position.set(LANE_X.power, 0, OBJECT_Z);
    objects.spin = makePortal(); objects.spin.position.set(LANE_X.spin, 0, OBJECT_Z);

    Object.values(objects).forEach((o) => group.add(o));

    const lightGroup = setupLights(scene, worldDef);
    group.add(lightGroup);

    scene.add(group);
    currentGroup = group;
    return { group, objects, laneX: LANE_X, worldDef };
  }

  return { build, LANE_X, OBJECT_Z };
})();

// -------------------------------------------------------------------------
// MissionManager — define/valida missões com condição real (posição+estado)
// -------------------------------------------------------------------------
const MissionManager = (() => {
  const DIFFICULTY_CFG = {
    facil: { hearts: 3, steps: 1, timeLimit: 0, punishHeart: false, label: 'Fácil' },
    medio: { hearts: 3, steps: 2, timeLimit: 30, punishHeart: true, label: 'Médio' },
    dificil: { hearts: 3, steps: 3, timeLimit: 18, punishHeart: true, label: 'Difícil' }
  };

  let mission = null; // { steps:[{type,done}], stepIndex, timeLeft, timeLimit, isQuiz, perfect, worldId }
  let listeners = {};
  let zoneCollisionTimers = {};

  function label(difficulty) { return (DIFFICULTY_CFG[difficulty] || DIFFICULTY_CFG.facil).label; }
  function cfg(difficulty) { return DIFFICULTY_CFG[difficulty] || DIFFICULTY_CFG.facil; }

  function pickSteps(n) {
    const pool = MISSION_STEP_POOL.slice();
    const steps = [];
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      steps.push(pool.splice(idx, 1)[0]);
      if (!pool.length) pool.push(...MISSION_STEP_POOL);
    }
    return steps;
  }

  function build(worldId, difficulty, roundIndex) {
    const c = cfg(difficulty);
    const isQuizRound = roundIndex > 0 && roundIndex % 5 === 4;
    zoneCollisionTimers = {};
    if (isQuizRound) {
      mission = { worldId, steps: ['quiz'], stepIndex: 0, timeLeft: 0, timeLimit: 0, isQuiz: true, perfect: true, difficulty };
    } else {
      const steps = pickSteps(c.steps);
      mission = { worldId, steps, stepIndex: 0, timeLeft: c.timeLimit, timeLimit: c.timeLimit, isQuiz: false, perfect: true, difficulty };
    }
    return mission;
  }

  function current() { return mission; }
  function currentStepType() { return mission ? mission.steps[mission.stepIndex] : null; }

  function textFor(mission) {
    if (!mission) return '';
    if (mission.isQuiz) return 'Vá até o portal roxo e responda o Quiz do Athos para destravar a fase.';
    const stepTxt = MISSION_STEP_LABEL[mission.steps[mission.stepIndex]] || '';
    const stepCount = mission.steps.length;
    const prefix = stepCount > 1 ? `Passo ${mission.stepIndex + 1}/${stepCount}: ` : '';
    return prefix + stepTxt;
  }

  function on(event, fn) { listeners[event] = fn; }
  function emit(event, payload) { if (listeners[event]) listeners[event](payload); }

  function tick(dt) {
    if (!mission || mission.isQuiz) return;
    if (mission.timeLimit > 0) {
      mission.timeLeft -= dt;
      if (mission.timeLeft <= 0) {
        mission.perfect = false;
        emit('timeout', mission);
      }
    }
  }

  function completeStep() {
    if (!mission) return;
    mission.stepIndex += 1;
    if (mission.stepIndex >= mission.steps.length) {
      emit('missionComplete', mission);
    } else {
      emit('stepComplete', mission);
    }
  }

  function failStep(kind) {
    if (!mission) return;
    mission.perfect = false;
    emit('stepFail', { mission, kind });
  }

  function zoneCollisionTick(key, active, dt, threshold, onFail) {
    if (!active) { zoneCollisionTimers[key] = 0; return; }
    zoneCollisionTimers[key] = (zoneCollisionTimers[key] || 0) + dt;
    if (zoneCollisionTimers[key] >= threshold) {
      zoneCollisionTimers[key] = 0;
      onFail();
    }
  }

  return { DIFFICULTY_CFG, label, cfg, build, current, currentStepType, textFor, on, tick, completeStep, failStep, zoneCollisionTick };
})();

// -------------------------------------------------------------------------
// GameEngine — Three.js: cena, câmera, player, física simples, input, loop
// -------------------------------------------------------------------------
const GameEngine = (() => {
  let renderer = null, scene = null, camera = null;
  let host = null;
  let rafId = null;
  let running = false;
  let clock = null;
  let resizeAttached = false;

  let playerRig = null;
  let playerLoaded = false;
  let worldData = null;

  const player = {
    x: 0, y: 0, z: 4, vy: 0,
    isJumping: false, isCrouching: false, crouchTimer: 0,
    sizeState: 'normal', baseScale: 1,
    rotY: 0, spinning: false, spinT: 0,
    powerT: 0
  };

  let mode = 'missions'; // 'missions' | 'free'
  let worldId = 'campo';
  let paused = false;
  let cameraStreamActive = false;
  let cameraStream = null;
  let particles = [];
  let stepCooldown = 0; // evita concluir o mesmo passo duas vezes seguidas

  const GRAVITY = -20;
  const JUMP_VY = 7.2;
  const GROUND_Y = 0;
  const ZONE_RADIUS = 1.9;

  function els() {
    return {
      screenGame: $('#screen-game'),
      screenLobby: $('#screen-lobby'),
      canvasHost: $('#gameCanvasHost'),
      cameraFeed: $('#cameraFeed'),
      hudPoints: $('#hudPoints'),
      hudHearts: $('#hudHearts'),
      hudHeartsWrap: $('#hudHeartsWrap'),
      hudPhase: $('#hudPhase'),
      hudDifficulty: $('#hudDifficulty'),
      missionMode: $('#missionMode'),
      missionText: $('#missionText'),
      missionTimerWrap: $('#missionTimerWrap'),
      missionTimerBar: $('#missionTimerBar'),
      pauseOverlay: $('#pauseOverlay'),
      pauseSummary: $('#pauseSummary'),
      gameOverOverlay: $('#gameOverOverlay'),
      worldSwitchGrid: $('#worldSwitchGrid')
    };
  }

  function initThree() {
    host = els().canvasHost;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55, host.clientWidth / Math.max(1, host.clientHeight), 0.1, 200);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.domElement.id = 'three-canvas'; // patch obrigatório: canvas precisa de id próprio
    host.appendChild(renderer.domElement);
    clock = new THREE.Clock();

    if (!resizeAttached) {
      window.addEventListener('resize', onResize);
      resizeAttached = true; // evita listeners de resize duplicados
    }
    onResize();
  }

  function onResize() {
    if (!renderer || !camera || !host) return;
    const w = host.clientWidth || window.innerWidth;
    const h = host.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  }

  function proceduralAthos() {
    const g = new THREE.Group();
    const black = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.6 });
    const red = new THREE.MeshStandardMaterial({ color: 0xff2b2b, emissive: 0x7a0000, emissiveIntensity: 0.8 });
    const flame = new THREE.MeshStandardMaterial({ color: 0xff8a3d, emissive: 0xcc4400, emissiveIntensity: 0.7 });

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), black);
    head.position.y = 1.55;
    const eyeGeo = new THREE.BoxGeometry(0.08, 0.08, 0.05);
    const eyeL = new THREE.Mesh(eyeGeo, red); eyeL.position.set(-0.12, 1.58, 0.26);
    const eyeR = new THREE.Mesh(eyeGeo, red); eyeR.position.set(0.12, 1.58, 0.26);
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.75, 0.36), black);
    torso.position.y = 0.95;
    const armGeo = new THREE.BoxGeometry(0.22, 0.68, 0.22);
    const armL = new THREE.Mesh(armGeo, black); armL.position.set(-0.44, 0.92, 0);
    const armR = new THREE.Mesh(armGeo, black); armR.position.set(0.44, 0.92, 0);
    const flameL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.24), flame); flameL.position.set(-0.44, 0.55, 0);
    const flameR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.24), flame); flameR.position.set(0.44, 0.55, 0);
    const legGeo = new THREE.BoxGeometry(0.26, 0.72, 0.26);
    const legL = new THREE.Mesh(legGeo, black); legL.position.set(-0.17, 0.2, 0);
    const legR = new THREE.Mesh(legGeo, black); legR.position.set(0.17, 0.2, 0);
    const footFlameGeo = new THREE.BoxGeometry(0.28, 0.12, 0.28);
    const footL = new THREE.Mesh(footFlameGeo, flame); footL.position.set(-0.17, -0.18, 0);
    const footR = new THREE.Mesh(footFlameGeo, flame); footR.position.set(0.17, -0.18, 0);

    g.add(head, eyeL, eyeR, torso, armL, armR, flameL, flameR, legL, legR, footL, footR);
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    g.userData.isFallback = true;
    return g;
  }

  function loadPlayer(onReady) {
    const loader = new GLTFLoader();
    loader.load(
      './athos.glb',
      (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const targetHeight = 1.9;
        const scale = size.y > 0 ? targetHeight / size.y : 1;
        model.scale.setScalar(scale);
        const box2 = new THREE.Box3().setFromObject(model);
        model.position.y -= box2.min.y;
        model.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        playerRig = new THREE.Group();
        playerRig.add(model);
        playerLoaded = true;
        scene.add(playerRig);
        onReady && onReady(true);
      },
      undefined,
      (err) => {
        console.warn('athos.glb não carregou, usando Athos alternativo (fallback procedural).', err);
        playerRig = new THREE.Group();
        playerRig.add(proceduralAthos());
        playerLoaded = false;
        scene.add(playerRig);
        Toast.show('Athos alternativo carregado (modelo 3D não abriu agora).');
        onReady && onReady(false);
      }
    );
  }

  // ---------------- Câmera real (fundo) ----------------
  async function startCamera() {
    if (cameraStreamActive) return true;
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      Toast.error('Câmera precisa de HTTPS (abra pelo link do GitHub Pages).');
      return false;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      Toast.error('Câmera indisponível neste navegador.');
      return false;
    }
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      const video = els().cameraFeed;
      video.srcObject = cameraStream;
      await video.play().catch(() => {});
      cameraStreamActive = true;
      appEl.dataset.cameraOn = '1';
      scene.background = null;
      renderer.setClearColor(0x000000, 0); // canvas transparente sobre o vídeo
      scene.fog = null;
      return true;
    } catch (err) {
      console.warn('Câmera negada ou indisponível.', err);
      Toast.error('Câmera não liberada. O jogo continua sem o fundo real.');
      return false;
    }
  }

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      cameraStream = null;
    }
    cameraStreamActive = false;
    appEl.dataset.cameraOn = '0';
    const video = els().cameraFeed;
    if (video) video.srcObject = null;
  }

  // ---------------- Mundo ----------------
  function buildWorld(id) {
    worldId = id;
    const isReal = id === 'real';
    worldData = WorldBuilder.build(scene, id, isReal);
    if (isReal) startCamera(); else stopCamera();
    resetPlayerPosition();
  }

  function resetPlayerPosition() {
    player.x = 0; player.y = GROUND_Y; player.z = 4; player.vy = 0;
    player.isJumping = false; player.isCrouching = false; player.crouchTimer = 0;
    player.rotY = 0; player.spinning = false; player.spinT = 0;
    syncPlayerTransform();
  }

  function syncPlayerTransform() {
    if (!playerRig) return;
    playerRig.position.set(player.x, player.y, player.z);
    playerRig.rotation.y = player.rotY;
    const crouchScaleY = player.isCrouching ? 0.55 : 1;
    let sizeScale = 1;
    if (player.sizeState === 'giant') sizeScale = 1.7;
    else if (player.sizeState === 'mini') sizeScale = 0.5;
    playerRig.scale.set(sizeScale, sizeScale * crouchScaleY, sizeScale);
  }

  // ---------------- Ações (hotbar) ----------------
  function handleAction(name) {
    if (paused || !running) return;
    switch (name) {
      case 'left': player.x = clamp(player.x - 1.8, -11.5, 11.5); onMoved(); break;
      case 'right': player.x = clamp(player.x + 1.8, -11.5, 11.5); onMoved(); break;
      case 'jump': doJump(); break;
      case 'crouch': doCrouch(); break;
      case 'spin': doSpin(); break;
      case 'giant': setSize('giant'); break;
      case 'mini': setSize('mini'); break;
      case 'normal': setSize('normal'); break;
      case 'power': doPower(); break;
      case 'talk': openTalk(); break;
      case 'quiz': openQuizFromHotbar(); break;
      case 'center': doCenter(); break;
      case 'exit': openPause(); break;
      default: break;
    }
  }

  function onMoved() { syncPlayerTransform(); }

  function doJump() {
    if (player.isJumping) return;
    player.isJumping = true;
    player.vy = JUMP_VY;
  }

  function doCrouch() {
    player.isCrouching = true;
    player.crouchTimer = 0.9;
    syncPlayerTransform();
    if (mode === 'missions') StorageManager.incCounter('crouch');
  }

  function doSpin() {
    player.spinning = true;
    player.spinT = 0;
    if (mode === 'missions') {
      const n = StorageManager.incCounter('spin');
      if (n >= 5 && StorageManager.unlockMedal('mestre_portais')) Toast.medal('🌀 Medalha: Mestre dos Portais!');
      evaluateActionMission('spin');
    }
    if (worldData && worldData.objects.spin) {
      const near = Math.abs(player.x - WorldBuilder.LANE_X.spin) < ZONE_RADIUS;
      if (near) pulseObject(worldData.objects.spin.userData.torus, 0xffffff, 300);
    }
  }

  function doPower() {
    player.powerT = 0.001; // dispara animação de partículas
    spawnPowerParticles();
    if (mode === 'missions') {
      StorageManager.incCounter('power');
      const inFire = worldId === 'vulcao';
      if (inFire && StorageManager.unlockMedal('guardiao_fogo')) Toast.medal('🔥 Medalha: Guardião do Fogo!');
      evaluateActionMission('power');
    }
  }

  function setSize(state) {
    player.sizeState = state;
    syncPlayerTransform();
    if (mode === 'missions') {
      if (state === 'giant') {
        const n = StorageManager.incCounter('giant');
        if (n >= 1 && StorageManager.unlockMedal('athos_gigante')) Toast.medal('🦾 Medalha: Athos Gigante!');
      }
      if (state === 'mini') StorageManager.incCounter('mini');
    }
  }

  function doCenter() {
    player.x = 0;
    syncPlayerTransform();
    Toast.show('Athos centralizado.');
  }

  function spawnPowerParticles() {
    if (!scene || !playerRig) return;
    const group = new THREE.Group();
    const mat = new THREE.SpriteMaterial({ color: 0xffb347 });
    for (let i = 0; i < 14; i++) {
      const spr = new THREE.Sprite(mat.clone());
      spr.scale.set(0.18, 0.18, 0.18);
      spr.position.copy(playerRig.position);
      spr.position.y += 0.9;
      const angle = Math.random() * Math.PI * 2;
      spr.userData.vx = Math.cos(angle) * (0.8 + Math.random());
      spr.userData.vz = Math.sin(angle) * (0.8 + Math.random());
      spr.userData.vy = 1.4 + Math.random();
      spr.userData.life = 0.7;
      group.add(spr);
    }
    scene.add(group);
    particles.push(group);
  }

  function updateParticles(dt) {
    particles.forEach((group) => {
      group.children.forEach((spr) => {
        spr.userData.life -= dt;
        spr.position.x += spr.userData.vx * dt;
        spr.position.z += spr.userData.vz * dt;
        spr.position.y += spr.userData.vy * dt;
        spr.userData.vy -= 3 * dt;
        spr.material.opacity = Math.max(0, spr.userData.life / 0.7);
      });
    });
    particles = particles.filter((group) => {
      const alive = group.children.some((c) => c.userData.life > 0);
      if (!alive) { scene.remove(group); }
      return alive;
    });
  }

  function pulseObject(mesh, color, ms) {
    if (!mesh) return;
    const original = mesh.material.emissive ? mesh.material.emissive.clone() : null;
    if (mesh.material.emissive) mesh.material.emissive.setHex(color);
    window.setTimeout(() => { if (original && mesh.material.emissive) mesh.material.emissive.copy(original); }, ms);
  }

  // ---------------- Missões: avaliação ----------------
  function evaluateActionMission(actionType) {
    if (mode !== 'missions') return;
    const mission = MissionManager.current();
    if (!mission || mission.isQuiz) return;
    const stepType = MissionManager.currentStepType();
    if (stepType !== actionType) return;
    const laneX = WorldBuilder.LANE_X[actionType];
    const near = Math.abs(player.x - laneX) < ZONE_RADIUS;
    if (near) missionStepSucceeded(stepType);
  }

  function missionStepSucceeded(stepType) {
    if (stepCooldown > 0) return;
    stepCooldown = 0.6;
    if (stepType === 'jump') { if (StorageManager.unlockMedal('primeiro_pulo')) Toast.medal('🦘 Medalha: Primeiro Pulo!'); }
    if (stepType === 'giant' && worldData && worldData.objects.giant) openGate(worldData.objects.giant);
    Toast.success('✅ Passo concluído!');
    MissionManager.completeStep();
  }

  function openGate(gate) {
    if (gate.userData.open) return;
    gate.userData.open = true;
    const l = gate.userData.left, r = gate.userData.right;
    let t = 0;
    const anim = () => {
      t += 0.05;
      l.position.x = -0.6 - t * 0.9;
      r.position.x = 0.6 + t * 0.9;
      if (t < 1) requestAnimationFrame(anim);
    };
    anim();
  }

  function collectCrystal(which) {
    if (!worldData) return;
    const obj = worldData.objects[which];
    if (!obj || obj.userData.collected) return;
    obj.userData.collected = true;
    obj.visible = false;
    StorageManager.incCounter('collect');
    StorageManager.addPoints(5);
    Toast.success('💎 Cristal coletado! +5 pontos');
  }

  function missionZoneChecks(dt) {
    if (mode !== 'missions' || !worldData) return;
    const mission = MissionManager.current();
    if (!mission || mission.isQuiz) return;
    const stepType = MissionManager.currentStepType();
    if (!stepType) return;
    const laneX = WorldBuilder.LANE_X[stepType];
    const near = Math.abs(player.x - laneX) < ZONE_RADIUS;

    if (stepType === 'collectLeft' || stepType === 'collectRight') {
      if (near) { collectCrystal(stepType); missionStepSucceeded(stepType); }
      return;
    }
    if (stepType === 'giant') {
      if (near && player.sizeState === 'giant') missionStepSucceeded('giant');
      return;
    }
    if (stepType === 'mini') {
      if (near && player.sizeState === 'mini') missionStepSucceeded('mini');
      return;
    }
    if (stepType === 'jump') {
      if (near && player.isJumping) { missionStepSucceeded('jump'); return; }
      const colliding = near && !player.isJumping && player.y <= GROUND_Y + 0.05;
      const threshold = mission.difficulty === 'facil' ? 999 : 0.7;
      MissionManager.zoneCollisionTick('jump', colliding, dt, threshold, () => {
        MissionManager.failStep('jump');
        onMissionFail('Você bateu no bloco! Pule na próxima tentativa.');
      });
      return;
    }
    if (stepType === 'crouch') {
      if (near && player.isCrouching) { missionStepSucceeded('crouch'); return; }
      const colliding = near && !player.isCrouching;
      const threshold = mission.difficulty === 'facil' ? 999 : 0.9;
      MissionManager.zoneCollisionTick('crouch', colliding, dt, threshold, () => {
        MissionManager.failStep('crouch');
        onMissionFail('Você esbarrou no portal baixo! Abaixe na próxima tentativa.');
      });
      return;
    }
  }

  function onMissionFail(text) {
    const mission = MissionManager.current();
    if (!mission) return;
    if (!MissionManager.cfg(mission.difficulty).punishHeart) {
      Toast.error(text);
      return;
    }
    const hearts = StorageManager.loseHeart();
    Toast.error(text + ' -1 coração');
    updateHudHearts();
    if (hearts <= 0) {
      showGameOver();
    } else {
      // Reinicia a missão atual (mesmos passos, do início) para tentar de novo.
      mission.stepIndex = 0;
      mission.timeLeft = mission.timeLimit;
    }
  }

  // ---------------- Missão: ciclo de vida ----------------
  function startMissionRound() {
    const s = StorageManager.get();
    const mission = MissionManager.build(worldId, s.difficulty, s.currentMissionIndex);
    updateMissionHud();
    if (mission.isQuiz) {
      Toast.show('Vá até o portal roxo e toque em Quiz!');
    }
  }

  function updateMissionHud() {
    const e = els();
    const mission = MissionManager.current();
    const s = StorageManager.get();
    e.missionMode.textContent = mode === 'free' ? 'BRINCAR LIVRE' : `MISSÃO (${MissionManager.label(s.difficulty)})`;
    e.missionText.textContent = mode === 'free' ? 'Explore o mundo e brinque sem pressão. Troque de cenário e experimente todas as ações.' : MissionManager.textFor(mission);
    const hasTimer = mode === 'missions' && mission && !mission.isQuiz && mission.timeLimit > 0;
    e.missionTimerWrap.hidden = !hasTimer;
  }

  function updateMissionTimerBar() {
    const mission = MissionManager.current();
    const e = els();
    if (!mission || mission.isQuiz || mission.timeLimit <= 0) return;
    const pct = Math.max(0, mission.timeLeft / mission.timeLimit) * 100;
    e.missionTimerBar.style.width = pct + '%';
  }

  function openQuizFromHotbar() {
    QuizManager.open(mode === 'missions' && MissionManager.current() && MissionManager.current().isQuiz ? onQuizMissionSolved : null);
  }

  function onQuizMissionSolved() {
    ModalManager.close('quizModal');
    Toast.success('Portal do quiz ativado!');
    onMissionComplete();
  }

  function onMissionComplete() {
    const mission = MissionManager.current();
    const s = StorageManager.get();
    const base = mission.isQuiz ? 20 : 15 * mission.steps.length;
    StorageManager.addPoints(base);
    s.phase += 1;
    s.currentMissionIndex += 1;
    if (mission.difficulty === 'dificil' && mission.perfect && !mission.isQuiz) {
      StorageManager.addPoints(25);
      if (StorageManager.unlockMedal('sequencia_perfeita')) Toast.medal('⭐ Medalha: Sequência Perfeita!');
    }
    StorageManager.save();
    maybeUnlockNextWorld();
    updateHudTop();
    Toast.success('🎉 Missão concluída! +' + base + ' pontos');
    window.setTimeout(startMissionRound, 500);
  }

  function maybeUnlockNextWorld() {
    const s = StorageManager.get();
    const idx = WORLDS.findIndex((w) => w.id === worldId);
    if (s.phase % 3 === 0 && idx >= 0 && idx < WORLDS.length - 1) {
      const nextWorld = WORLDS[idx + 1];
      if (StorageManager.unlockWorld(nextWorld.id)) {
        Toast.medal('🌍 Novo mundo desbloqueado: ' + nextWorld.name + '!');
      }
    }
    if (s.unlockedWorlds.length >= WORLDS.length && StorageManager.unlockMedal('explorador_mundos')) {
      Toast.medal('🗺️ Medalha: Explorador dos Mundos!');
    }
  }

  function showGameOver() {
    paused = true;
    els().gameOverOverlay.hidden = false;
  }

  function hideGameOver() { els().gameOverOverlay.hidden = true; }

  // ---------------- HUD ----------------
  function updateHudTop() {
    const s = StorageManager.get();
    const e = els();
    e.hudPoints.textContent = String(s.points);
    e.hudHearts.textContent = String(s.hearts);
    e.hudPhase.textContent = String(s.phase);
    e.hudDifficulty.textContent = MissionManager.label(s.difficulty);
    e.hudHeartsWrap.classList.toggle('lowHearts', mode === 'missions' && s.hearts <= 1);
    e.hudHeartsWrap.style.opacity = mode === 'free' ? '0.4' : '1';
  }
  function updateHudHearts() { updateHudTop(); }

  function openTalk() { ModalManager.open('talkModal'); }

  // ---------------- Pausa ----------------
  function openPause() {
    paused = true;
    const e = els();
    e.pauseOverlay.hidden = false;
    if (e.pauseSummary) e.pauseSummary.textContent = 'Pontos e progresso continuam salvos.';
  }
  function closePause() { paused = false; els().pauseOverlay.hidden = true; els().worldSwitchGrid.hidden = true; }

  function renderWorldSwitchGrid() {
    const grid = els().worldSwitchGrid;
    const s = StorageManager.get();
    grid.innerHTML = '';
    const list = mode === 'free' ? WORLDS.concat([REAL_WORLD]) : WORLDS;
    list.forEach((w) => {
      const unlocked = mode === 'free' || s.unlockedWorlds.includes(w.id);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = (unlocked ? '' : '🔒 ') + w.name;
      if (!unlocked) btn.disabled = true;
      if (w.id === worldId) btn.classList.add('active');
      btn.addEventListener('click', () => {
        buildWorld(w.id);
        if (mode === 'missions') startMissionRound();
        else updateMissionHud();
        grid.hidden = true;
        closePause();
      });
      grid.appendChild(btn);
    });
    grid.hidden = false;
  }

  // ---------------- Loop principal ----------------
  function loop() {
    if (!running) return;
    rafId = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (paused) { renderer.render(scene, camera); return; }

    // física simples: gravidade / pulo
    if (player.isJumping) {
      player.vy += GRAVITY * dt;
      player.y += player.vy * dt;
      if (player.y <= GROUND_Y) { player.y = GROUND_Y; player.vy = 0; player.isJumping = false; }
    }
    // agachar: temporizador
    if (player.isCrouching) {
      player.crouchTimer -= dt;
      if (player.crouchTimer <= 0) player.isCrouching = false;
    }
    // girar: animação de 360°
    if (player.spinning) {
      player.spinT += dt;
      player.rotY = (player.spinT / 0.5) * Math.PI * 2;
      if (player.spinT >= 0.5) { player.spinning = false; player.rotY = 0; }
    }
    syncPlayerTransform();
    updateParticles(dt);

    // portal sempre gira devagar
    if (worldData && worldData.objects.spin) worldData.objects.spin.userData.torus.rotation.z += dt * 0.6;
    if (worldData && worldData.objects.power && worldData.objects.power.userData.mesh) {
      worldData.objects.power.rotation.y += dt * 0.4;
    }

    if (stepCooldown > 0) stepCooldown = Math.max(0, stepCooldown - dt);

    if (mode === 'missions' && !paused) {
      MissionManager.tick(dt);
      missionZoneChecks(dt);
      updateMissionTimerBar();
    }

    // câmera terceira pessoa segue o player
    const camTargetX = player.x * 0.5;
    camera.position.lerp(new THREE.Vector3(camTargetX, 3.4, player.z + 6.4), 0.08);
    camera.lookAt(player.x * 0.5, 1.1, player.z - 3);

    renderer.render(scene, camera);
  }

  function start() {
    if (running) return; // evita loop duplicado (bug fix)
    running = true;
    clock.getDelta();
    loop();
  }
  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  MissionManager.on('missionComplete', onMissionComplete);
  MissionManager.on('timeout', () => onMissionFail('O tempo acabou!'));

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  // ---------------- Entrada / saída do jogo ----------------
  function enterGame({ gameMode }) {
    mode = gameMode;
    const e = els();
    e.screenLobby.hidden = true;
    e.screenGame.hidden = false;
    appEl.dataset.screen = 'game';
    hideGameOver();
    closePause();

    if (!renderer) {
      initThree();
      loadPlayer(() => {
        const s = StorageManager.get();
        StorageManager.resetHearts(MissionManager.cfg(s.difficulty).hearts);
        const startWorld = mode === 'free' ? 'campo' : (s.unlockedWorlds[s.unlockedWorlds.length - 1] || 'campo');
        buildWorld(startWorld);
        if (mode === 'missions') startMissionRound(); else updateMissionHud();
        updateHudTop();
        start();
      });
    } else {
      const s = StorageManager.get();
      StorageManager.resetHearts(MissionManager.cfg(s.difficulty).hearts);
      const startWorld = mode === 'free' ? 'campo' : (s.unlockedWorlds[s.unlockedWorlds.length - 1] || 'campo');
      buildWorld(startWorld);
      if (mode === 'missions') startMissionRound(); else updateMissionHud();
      updateHudTop();
      onResize();
      start();
    }
  }

  function exitToLobby() {
    stop();
    stopCamera();
    paused = false;
    closePause();
    hideGameOver();
    const e = els();
    e.screenGame.hidden = true;
    e.screenLobby.hidden = false;
    appEl.dataset.screen = 'lobby';
    LobbyEngine.refreshStats();
  }

  function retryAfterGameOver() {
    const s = StorageManager.get();
    StorageManager.resetHearts(MissionManager.cfg(s.difficulty).hearts);
    hideGameOver();
    paused = false;
    if (mode === 'missions') startMissionRound();
    updateHudTop();
  }

  return {
    enterGame, exitToLobby, handleAction, openPause, closePause, renderWorldSwitchGrid,
    retryAfterGameOver, updateHudTop
  };
})();

// -------------------------------------------------------------------------
// LobbyEngine
// -------------------------------------------------------------------------
const LobbyEngine = (() => {
  let viewer = null;
  let loaded = false;

  function els() {
    return {
      viewer: $('#lobbyViewer'),
      progressBar: $('#lobbyProgressBar'),
      statPoints: $('#statPoints'),
      statHearts: $('#statHearts'),
      statMedals: $('#statMedals'),
      statPhase: $('#statPhase'),
      statDifficulty: $('#statDifficulty'),
      lobbyHelp: $('#lobbyHelp'),
      arNativeBtn: $('#arNativeBtn')
    };
  }

  function refreshStats() {
    const s = StorageManager.get();
    const e = els();
    e.statPoints.textContent = String(s.points);
    e.statHearts.textContent = String(s.hearts);
    e.statMedals.textContent = `${s.medals.length}/${MEDALS.length}`;
    e.statPhase.textContent = String(s.phase);
    e.statDifficulty.textContent = MissionManager.label(s.difficulty);
  }

  function openNativeAR() {
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      Toast.error('AR real precisa de HTTPS. Abra pelo link do GitHub Pages.');
      return;
    }
    if (!loaded) {
      Toast.show('Aguarde o Athos carregar e toque de novo.');
      return;
    }
    if (typeof viewer.activateAR !== 'function') {
      Toast.error('AR indisponível neste navegador/aparelho.');
      return;
    }
    try {
      const ret = viewer.activateAR();
      if (ret && typeof ret.catch === 'function') {
        ret.catch(() => Toast.error('O AR real não abriu. Use “Jogar Missões” ou “Brincar Livre”.'));
      }
    } catch (_) {
      Toast.error('O AR real não abriu neste navegador.');
    }
  }

  function renderMedals() {
    const grid = $('#medalsGrid');
    if (!grid) return;
    const s = StorageManager.get();
    grid.innerHTML = '';
    MEDALS.forEach((m) => {
      const unlocked = s.medals.includes(m.id);
      const card = document.createElement('div');
      card.className = 'medalCard' + (unlocked ? ' unlocked' : '');
      card.innerHTML = `<span class="medalIcon">${m.icon}</span><span class="medalName">${m.name}</span>`;
      grid.appendChild(card);
    });
  }

  function renderDifficultyModal() {
    const s = StorageManager.get();
    $$('.difficultyOption').forEach((btn) => btn.classList.toggle('active', btn.dataset.difficulty === s.difficulty));
  }

  function init() {
    viewer = els().viewer;
    viewer.addEventListener('progress', (ev) => {
      const p = Math.round((ev.detail.totalProgress || 0) * 100);
      els().progressBar.style.width = p + '%';
    });
    viewer.addEventListener('load', () => { loaded = true; });
    viewer.addEventListener('error', () => { Toast.error('O athos.glb não abriu no visualizador do Lobby.'); });

    $$('[data-lobby-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.lobbyAction;
        if (action === 'play-missions') GameEngine.enterGame({ gameMode: 'missions' });
        else if (action === 'play-free') GameEngine.enterGame({ gameMode: 'free' });
        else if (action === 'ar-native') openNativeAR();
        else if (action === 'quiz') QuizManager.open();
        else if (action === 'talk') ModalManager.open('talkModal');
        else if (action === 'collection') { renderMedals(); ModalManager.open('collectionModal'); }
        else if (action === 'difficulty') { renderDifficultyModal(); ModalManager.open('difficultyModal'); }
        else if (action === 'reset') {
          if (window.confirm('Isso vai apagar pontos, corações, medalhas e progresso. Continuar?')) {
            StorageManager.reset();
            refreshStats();
            Toast.show('Progresso reiniciado.');
          }
        }
      });
    });

    $$('.difficultyOption').forEach((btn) => {
      btn.addEventListener('click', () => {
        StorageManager.set({ difficulty: btn.dataset.difficulty });
        renderDifficultyModal();
        refreshStats();
        ModalManager.close('difficultyModal');
        Toast.show('Dificuldade: ' + MissionManager.label(btn.dataset.difficulty));
      });
    });

    if ($('#arNativeBtn')) $('#arNativeBtn').addEventListener('click', openNativeAR);

    $('#themeBtn').addEventListener('click', () => {
      const cur = appEl.dataset.theme === 'dark' ? 'light' : 'dark';
      appEl.dataset.theme = cur;
      localStorage.setItem('athosGP-theme', cur);
      $('#themeBtn').textContent = cur === 'dark' ? '🌙' : '☀️';
    });
    const savedTheme = localStorage.getItem('athosGP-theme') || 'dark';
    appEl.dataset.theme = savedTheme;
    $('#themeBtn').textContent = savedTheme === 'dark' ? '🌙' : '☀️';

    refreshStats();
  }

  return { init, refreshStats };
})();

// -------------------------------------------------------------------------
// Bootstrap / wiring geral (hotbar, pausa, talk, resize seguro, etc.)
// -------------------------------------------------------------------------
function initGlobalUI() {
  ModalManager.init();
  QuizManager.init();

  // Hotbar do jogo
  $$('.hotBtn[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => GameEngine.handleAction(btn.dataset.action));
  });
  $('#pauseBtn').addEventListener('click', () => GameEngine.openPause());

  $$('[data-pause-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.pauseAction;
      if (act === 'resume') GameEngine.closePause();
      else if (act === 'worlds') GameEngine.renderWorldSwitchGrid();
      else if (act === 'exit') GameEngine.exitToLobby();
    });
  });

  $$('[data-gameover-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.gameoverAction;
      if (act === 'retry') GameEngine.retryAfterGameOver();
      else if (act === 'exit') GameEngine.exitToLobby();
    });
  });

  // Falar com Athos
  const askInput = $('#askInput');
  const askAnswer = $('#askAnswer');
  function ask(text) {
    const missionTxt = $('#missionText') ? $('#missionText').textContent : '';
    const a = AthosBrain.answer(text, missionTxt);
    askAnswer.textContent = a;
  }
  $('#askSendBtn').addEventListener('click', () => { ask(askInput.value); askInput.value = ''; });
  askInput.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ask(askInput.value); askInput.value = ''; } });
  $$('.quickQuestions [data-question]').forEach((btn) => {
    btn.addEventListener('click', () => ask(btn.dataset.question));
  });
  $('#askVoiceBtn').addEventListener('click', () => {
    askAnswer.textContent = 'Estou ouvindo... fale com o Athos.';
    AthosBrain.startVoiceQuestion(
      (text) => { askInput.value = text; ask(text); },
      (msg) => { askAnswer.textContent = msg; }
    );
  });

  // Avisos de boot (arquivo local / offline)
  if (location.protocol === 'file:') {
    Toast.error('Abra pelo GitHub Pages (https), não como arquivo solto, para câmera e AR funcionarem.');
  }
  if (!navigator.onLine) {
    Toast.show('Sem internet: o Three.js e o model-viewer podem não carregar agora.');
  }

  // Limpa cache antigo de service worker de versões anteriores, se houver.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister().catch(() => {}))).catch(() => {});
  }

  window.addEventListener('beforeunload', () => {
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (_) {}
  });
}

document.addEventListener('DOMContentLoaded', () => {
  LobbyEngine.init();
  initGlobalUI();
});
