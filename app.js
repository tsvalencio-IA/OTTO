(() => {
  'use strict';
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  const storageKey = 'athos-guardiao-v11-state';
  const defaultState = { points:0, lives:3, level:1, medals:[], difficulty:'easy', best:0 };
  let state = loadState();
  let mode = 'lobby';
  let currentLevel = null;
  let currentWorld = 'campo';
  let collected = 0;
  let objectiveDone = false;
  let damageCooldown = 0;
  let cameraStream = null;

  function loadState(){ try { return Object.assign({}, defaultState, JSON.parse(localStorage.getItem(storageKey)||'{}')); } catch { return {...defaultState}; } }
  function save(){ state.best = Math.max(state.best || 0, state.points || 0); localStorage.setItem(storageKey, JSON.stringify(state)); updateStats(); }
  function resetState(){ state = {...defaultState}; save(); toast('Progresso zerado.','guide'); }

  const worlds = {
    real:{name:'Mundo Real', emoji:'📷', sky:null, fog:null, ground:0x222222, accent:0x1fc4ff, deco:'real'},
    campo:{name:'Campo dos Blocos', emoji:'🌱', sky:0x9fe0ff, fog:0x9fe0ff, ground:0x4caf50, accent:0x23d96b, deco:'campo'},
    vulcao:{name:'Vulcão Pixel', emoji:'🔥', sky:0x210702, fog:0x210702, ground:0x4a160d, accent:0xff5e00, deco:'vulcao'},
    floresta:{name:'Floresta Voxel', emoji:'🌳', sky:0x123522, fog:0x123522, ground:0x2e5d33, accent:0x23d96b, deco:'floresta'},
    castelo:{name:'Castelo de Pedra', emoji:'🏰', sky:0x151926, fog:0x151926, ground:0x676c75, accent:0x1fc4ff, deco:'castelo'},
    espaco:{name:'Espaço Cubo', emoji:'🚀', sky:0x05040f, fog:0x05040f, ground:0x252052, accent:0xb264ff, deco:'espaco'}
  };

  const medals = [
    {id:'first', emoji:'⭐', title:'Primeira Fase', desc:'Completou uma fase de verdade.'},
    {id:'crystal', emoji:'💎', title:'Caçador de Cristais', desc:'Coletou cristais com o Athos.'},
    {id:'fire', emoji:'🔥', title:'Guardião do Fogo', desc:'Venceu no vulcão.'},
    {id:'giant', emoji:'🦾', title:'Athos Gigante', desc:'Usou força gigante no portão.'},
    {id:'quiz', emoji:'🧠', title:'Campeão do Quiz', desc:'Acertou o desafio mental.'},
    {id:'explorer', emoji:'🗺️', title:'Explorador', desc:'Visitou mundos diferentes.'}
  ];

  const quiz = [
    {q:'Qual é o poder principal do Athos?', opts:['Fogo pixelado','Água congelada','Vento invisível'], ans:0, exp:'Isso! O Athos usa fogo pixelado.'},
    {q:'O que abre a saída da fase?', opts:['O portal','Um carro','Uma televisão'], ans:0, exp:'Certo! O objetivo é chegar no portal.'},
    {q:'Para passar num túnel baixo, o Athos deve...', opts:['Abaixar ou ficar mini','Ficar gigante','Fechar o jogo'], ans:0, exp:'Perfeito! Abaixar ou mini ajuda nos túneis.'},
    {q:'Quem é o parceiro do Athos?', opts:['Otto','Dragão','Robô'], ans:0, exp:'Isso! O Otto é o parceiro do Athos.'}
  ];

  const levels = [
    {world:'campo', title:'Fase 1 — Campo dos Blocos', objective:'Pegue 3 cristais e chegue no portal.', crystals:[-3,0.5,4], obstacles:[{type:'block',x:2}], portalX:8},
    {world:'vulcao', title:'Fase 2 — Chão de Lava', objective:'Pule a lava, quebre o bloco escuro com Poder e vá ao portal.', crystals:[-2.5,3.5,6], obstacles:[{type:'lava',x:1.1,w:1.6},{type:'dark',x:5}], portalX:10},
    {world:'floresta', title:'Fase 3 — Túnel da Floresta', objective:'Fique mini ou abaixe para passar no túnel e colete 3 cristais.', crystals:[-4,1.2,6.5], obstacles:[{type:'tunnel',x:3.4}], portalX:10.5},
    {world:'castelo', title:'Fase 4 — Portão de Pedra', objective:'Fique gigante para abrir o portão, pegue o cristal e alcance o portal.', crystals:[-3,4,7], obstacles:[{type:'gate',x:4.7}], portalX:11},
    {world:'espaco', title:'Fase 5 — Espaço Cubo', objective:'Gravidade leve: colete 4 cristais e gire no portal.', crystals:[-4,-1,3,7], obstacles:[{type:'block',x:1.5},{type:'gap',x:5.8,w:1.4}], portalX:11.5, lowGravity:true},
    {world:'vulcao', title:'Fase 6 — Portal de Fogo', objective:'Colete os cristais, use Poder no bloco e entre no portal.', crystals:[-3,0,3,7], obstacles:[{type:'lava',x:1.6,w:1.4},{type:'dark',x:6}], portalX:12}
  ];

  // THREE
  let scene, camera, renderer, clock;
  let player, athosModel, portal, levelGroup;
  let solids = [], hazards = [], crystals = [], blockers = [], particles = [];
  let input = {left:false,right:false,crouch:false};
  let p = {x:-6,y:0,vx:0,vy:0,scale:1,targetScale:1,rot:0,targetRot:0,squash:1,targetSquash:1,onGround:true,power:false,mini:false,giant:false};

  function updateStats(){
    $('#statPoints').textContent = state.points; $('#hudPoints').textContent = state.points;
    $('#statLives').textContent = state.lives; $('#hudLives').textContent = state.lives;
    $('#statLevel').textContent = state.level; $('#hudLevel').textContent = state.level;
    $('#statMedals').textContent = state.medals.length;
    $$('.diffBtn').forEach(b => b.classList.toggle('active', b.dataset.diff === state.difficulty));
  }

  function unlock(id){ if(!state.medals.includes(id)){ state.medals.push(id); save(); toast('Nova medalha!', 'ok'); } }
  function addPoints(n){ state.points += n; save(); }
  function loseLife(){
    if (mode !== 'missions') return;
    if (damageCooldown > 0) return;
    damageCooldown = 1.2;
    if (state.difficulty === 'easy') { toast('Cuidado! No fácil não perde vida.', 'guide'); return; }
    state.lives = Math.max(0, state.lives - 1); save();
    toast('Cuidado! Perdeu 1 vida.', 'bad');
    if(state.lives <= 0){ setTimeout(()=>{ state.lives = 3; save(); restartLevel(); }, 1200); }
  }

  function toast(msg, type=''){
    const el = $('#toast');
    el.textContent = msg; el.className = 'toast show ' + type;
    clearTimeout(el._t); el._t = setTimeout(()=>el.classList.remove('show'), 1800);
  }

  function speak(text){
    if(!('speechSynthesis' in window)) return;
    try{ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.lang='pt-BR'; u.rate=.98; u.pitch=1.08; speechSynthesis.speak(u); }catch{}
  }

  async function startCamera(){
    if(cameraStream) return;
    try{ cameraStream = await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}}, audio:false}); $('#cameraFeed').srcObject = cameraStream; await $('#cameraFeed').play().catch(()=>{}); }
    catch{ toast('Câmera bloqueada. Use cenário 3D.', 'guide'); }
  }
  function stopCamera(){ if(cameraStream){ cameraStream.getTracks().forEach(t=>t.stop()); cameraStream=null; } $('#cameraFeed').srcObject=null; }

  function init3D(){
    if(renderer) return;
    const wrap = $('#threeWrap');
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x9fe0ff, 0.02);
    camera = new THREE.PerspectiveCamera(55, wrap.clientWidth / wrap.clientHeight, .1, 150);
    camera.position.set(0, 4.2, 9.5); camera.lookAt(0,1,0);
    renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
    renderer.domElement.id = 'three-canvas';
    renderer.setSize(wrap.clientWidth, wrap.clientHeight);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    wrap.innerHTML=''; wrap.appendChild(renderer.domElement);
    clock = new THREE.Clock();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x333333, .75));
    const sun = new THREE.DirectionalLight(0xffffff, 1.0); sun.position.set(5,12,6); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024); scene.add(sun);
    player = new THREE.Group(); scene.add(player);
    loadAthos();
    levelGroup = new THREE.Group(); scene.add(levelGroup);
    window.addEventListener('resize', resize3D, {passive:true});
    animate();
  }
  function resize3D(){ if(!renderer) return; const wrap=$('#threeWrap'); camera.aspect = wrap.clientWidth / wrap.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(wrap.clientWidth, wrap.clientHeight); }
  function loadAthos(){
    const loader = new THREE.GLTFLoader();
    loader.load('./athos.glb', gltf => {
      athosModel = gltf.scene;
      const box = new THREE.Box3().setFromObject(athosModel);
      const h = box.max.y - box.min.y || 3;
      const target = 2.3;
      const s = target / h;
      athosModel.scale.set(s,s,s);
      athosModel.position.y = -box.min.y*s;
      athosModel.traverse(c=>{ if(c.isMesh){ c.castShadow=true; c.receiveShadow=true; }});
      player.add(athosModel);
    }, undefined, () => createFallbackAthos());
  }
  function createFallbackAthos(){
    const black = mat(0x111111), fire=mat(0xff6a00,0x551500), red=mat(0xff1111,0x330000);
    const g = new THREE.Group();
    function cube(x,y,z,w,h,d,m){ const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true; g.add(mesh); return mesh; }
    cube(0,1.2,0,1.1,1.4,.7,black); cube(0,2.4,0,1,1,.8,black); cube(-.24,2.48,.43,.18,.12,.08,red); cube(.24,2.48,.43,.18,.12,.08,red); cube(-.8,1.2,0,.35,1.2,.35,fire); cube(.8,1.2,0,.35,1.2,.35,fire); cube(-.32,.35,0,.35,.7,.35,fire); cube(.32,.35,0,.35,.7,.35,fire); athosModel=g; player.add(g);
  }
  function mat(color, emissive=0x000000){ return new THREE.MeshStandardMaterial({color, emissive, roughness:.72, metalness:0}); }

  function buildWorld(worldId, level){
    if(!levelGroup) return;
    while(levelGroup.children.length) levelGroup.remove(levelGroup.children[0]);
    solids=[]; hazards=[]; crystals=[]; blockers=[]; particles=[]; portal=null;
    const conf = worlds[worldId] || worlds.campo;
    currentWorld = worldId;
    $('#game').classList.toggle('realMode', worldId === 'real');
    $('#worldLabel').textContent = conf.emoji + ' ' + conf.name;
    scene.background = worldId === 'real' ? null : new THREE.Color(conf.sky);
    scene.fog.color.setHex(conf.fog || 0x000000); scene.fog.density = worldId === 'real' ? 0 : .026;
    if(worldId === 'real') startCamera(); else stopCamera();
    $$('.worldChip').forEach(b=>b.classList.toggle('active', b.dataset.world === worldId));

    const groundMat = worldId === 'real' ? new THREE.ShadowMaterial({opacity:.34}) : mat(conf.ground);
    const ground = new THREE.Mesh(new THREE.BoxGeometry(42,.35,7), groundMat); ground.position.set(3,-.18,0); ground.receiveShadow=true; levelGroup.add(ground); solids.push({x:-18,w:42,y:0,h:.3,mesh:ground});
    addGrid(conf.ground);
    addDecor(conf.deco, conf);
    const px = level ? level.portalX : 8;
    createPortal(px, conf.accent);
    if(level) createLevelObjects(level, conf);
  }
  function addGrid(color){
    const lineMat = new THREE.LineBasicMaterial({color:0xffffff, transparent:true, opacity:.12});
    const g = new THREE.BufferGeometry();
    const verts=[]; for(let x=-18;x<=24;x+=1){ verts.push(x,.02,-3.5,x,.02,3.5); } for(let z=-3;z<=3;z+=1){ verts.push(-18,.025,z,24,.025,z); }
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts,3)); const lines=new THREE.LineSegments(g,lineMat); levelGroup.add(lines);
  }
  function addDecor(type, conf){
    const decoMat = mat(conf.accent, type==='vulcao' ? 0x551100 : 0);
    const dark = mat(0x151515), stone=mat(0x686b73), trunk=mat(0x654321), leaf=mat(0x1f9d45,0x001d05);
    const cube=(x,y,z,w,h,d,m)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.set(x,y,z); o.castShadow=true; o.receiveShadow=true; levelGroup.add(o); return o; };
    if(type==='campo'){ [-9,-5,13,18].forEach(x=>cube(x,.35,-3,.7,.7,.7,decoMat)); }
    if(type==='vulcao'){ cube(-8,.8,-2.8,2,1.6,2,dark); cube(14,.5,-2.5,2,1,2,dark); cube(0,.08,2.7,30,.12,.9,decoMat); }
    if(type==='floresta'){ [-8,-2,8,15].forEach(x=>{cube(x,1,-3, .7,2,.7,trunk); cube(x,2.7,-3,2,2,2,leaf);}); }
    if(type==='castelo'){ cube(-9,1.5,-3,1.3,3,1.3,stone); cube(12,1.5,-3,1.3,3,1.3,stone); cube(1,3.2,-3,8,.8,1,stone); }
    if(type==='espaco'){ for(let i=0;i<20;i++) cube(Math.random()*34-12,Math.random()*6+1,-4-Math.random()*8,.25,.25,.25,mat(0xffffff,0x3355ff)); }
  }
  function createPortal(x, color){
    portal = new THREE.Group();
    const frame = mat(0x111111);
    const glowMat = new THREE.MeshBasicMaterial({color, transparent:true, opacity:.55, side:THREE.DoubleSide});
    const add=(w,h,px,py)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,.55),frame); m.position.set(px,py,0); m.castShadow=true; portal.add(m); };
    add(.55,3.9,-1.35,1.95); add(.55,3.9,1.35,1.95); add(3.25,.55,0,3.65);
    const glow=new THREE.Mesh(new THREE.PlaneGeometry(2.45,3.35), glowMat); glow.position.y=1.9; portal.add(glow);
    portal.position.set(x,0,-2.1); levelGroup.add(portal);
  }
  function createLevelObjects(level, conf){
    level.crystals.forEach(x=>addCrystal(x));
    level.obstacles.forEach(o=>{
      if(o.type==='lava'){ const m=addBox(o.x,.08,0,o.w||1.5,.16,3.3,0xff3300,0xaa1100); hazards.push({type:'lava',x:o.x,w:o.w||1.5,mesh:m}); }
      if(o.type==='block'){ const m=addBox(o.x,.6,0,1,1.2,1.2,0x8a5b33); blockers.push({type:'block',x:o.x,w:1,mesh:m}); }
      if(o.type==='dark'){ const m=addBox(o.x,.7,0,1.1,1.4,1.1,0x050505); blockers.push({type:'dark',x:o.x,w:1.1,mesh:m,alive:true}); }
      if(o.type==='tunnel'){ const top=addBox(o.x,1.65,0,2.6,.5,1.2,0x7a5133); blockers.push({type:'tunnel',x:o.x,w:2.6,mesh:top}); }
      if(o.type==='gate'){ const m=addBox(o.x,1.45,0,2.2,2.9,.7,0x606070); blockers.push({type:'gate',x:o.x,w:2.2,mesh:m,alive:true}); }
      if(o.type==='gap'){ const m=addBox(o.x,.08,0,o.w||1,.18,3.2,0x110011,0x220044); hazards.push({type:'gap',x:o.x,w:o.w||1,mesh:m}); }
    });
  }
  function addBox(x,y,z,w,h,d,color,em=0){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat(color,em)); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; levelGroup.add(m); return m; }
  function addCrystal(x){ const m=new THREE.Mesh(new THREE.OctahedronGeometry(.48,0), new THREE.MeshStandardMaterial({color:0x2feaff, emissive:0x004466, roughness:.22, metalness:.2})); m.position.set(x,1.1,0); m.castShadow=true; levelGroup.add(m); crystals.push({x,mesh:m,got:false}); }

  function startMissions(){ mode='missions'; $('#lobby').classList.add('hidden'); $('#game').classList.add('active'); $('#game').setAttribute('aria-hidden','false'); init3D(); state.lives = state.lives || 3; loadLevel(state.level); save(); }
  function startFree(){ mode='free'; $('#lobby').classList.add('hidden'); $('#game').classList.add('active'); $('#game').setAttribute('aria-hidden','false'); init3D(); currentLevel=null; resetPlayer(-2); buildWorld('real', null); $('#objectiveText').textContent='Brincadeira livre: use o controle para mover o Athos no mundo real ou nos cenários.'; $('#hudCrystals').textContent='Livre'; $('#progressFill').style.width='0%'; save(); }
  function exitGame(){ mode='lobby'; $('#lobby').classList.remove('hidden'); $('#game').classList.remove('active'); $('#game').setAttribute('aria-hidden','true'); stopCamera(); save(); }
  function loadLevel(n){
    currentLevel = levels[(n-1) % levels.length]; collected=0; objectiveDone=false; damageCooldown=0;
    resetPlayer(-6); buildWorld(currentLevel.world, currentLevel);
    $('#objectiveText').textContent = currentLevel.objective;
    $('#hudCrystals').textContent = `0/${currentLevel.crystals.length}`;
    $('#progressFill').style.width = '0%';
    speak(currentLevel.title + '. ' + currentLevel.objective);
    toast(currentLevel.title, 'guide');
  }
  function restartLevel(){ loadLevel(state.level); }
  function resetPlayer(x=-6){ p={x, y:0, vx:0, vy:0, scale:1, targetScale:1, rot:0, targetRot:0, squash:1, targetSquash:1, onGround:true, power:false, mini:false, giant:false}; if(player){ player.position.set(x,0,0); player.scale.set(1,1,1); player.rotation.y=0; } }

  function action(act, btn){
    if(btn) { btn.style.filter='brightness(1.4)'; setTimeout(()=>btn.style.filter='',120); }
    if(act==='left') p.vx = -4.2;
    if(act==='right') p.vx = 4.2;
    if(act==='jump') jump();
    if(act==='crouch') crouch();
    if(act==='spin') { p.targetRot += Math.PI*2; toast('Giro ativado!', 'guide'); }
    if(act==='power') power();
    if(act==='mini') { p.targetScale=.55; p.mini=true; p.giant=false; toast('Modo mini!', 'guide'); }
    if(act==='normal') { p.targetScale=1; p.mini=false; p.giant=false; p.targetSquash=1; toast('Tamanho normal.', 'guide'); }
    if(act==='giant') { p.targetScale=1.55; p.giant=true; p.mini=false; unlock('giant'); toast('Athos gigante!', 'guide'); }
  }
  function jump(){ if(p.onGround){ p.vy = currentLevel && currentLevel.lowGravity ? 9 : 12; p.onGround=false; p.targetSquash=1.12; toast('Pulo!', 'guide'); } }
  function crouch(){ p.targetSquash=.55; setTimeout(()=>{ if(!input.crouch) p.targetSquash=1; },650); }
  function power(){
    spawnParticles('power');
    const nearDark = blockers.find(b=>b.type==='dark' && b.alive && Math.abs(p.x-b.x)<1.7);
    if(nearDark){ nearDark.alive=false; levelGroup.remove(nearDark.mesh); toast('Bloco escuro quebrado!', 'ok'); addPoints(5); }
    toast('Poder de fogo!', 'guide');
  }

  function animate(){
    requestAnimationFrame(animate);
    if(!renderer || mode==='lobby') return;
    const dt = Math.min(clock.getDelta(), .08);
    damageCooldown = Math.max(0, damageCooldown-dt);
    if(input.left) p.vx = -4.2; else if(input.right) p.vx = 4.2; else p.vx *= Math.pow(.0002, dt);
    if(input.crouch) p.targetSquash = .55;
    const gravity = currentLevel && currentLevel.lowGravity ? 12 : 26;
    p.vy -= gravity*dt;
    p.x += p.vx*dt; p.y += p.vy*dt;
    if(p.y <= 0){ p.y=0; p.vy=0; p.onGround=true; if(!input.crouch) p.targetSquash=1; }
    p.x = Math.max(-8.5, Math.min((currentLevel?currentLevel.portalX+2:8), p.x));
    p.scale += (p.targetScale-p.scale)*8*dt; p.squash += (p.targetSquash-p.squash)*10*dt; p.rot += (p.targetRot-p.rot)*7*dt;
    if(player){ player.position.set(p.x,p.y,0); player.rotation.y=p.rot; player.scale.set(p.scale, p.scale*p.squash, p.scale); }
    updateGameLogic(dt);
    updateCamera();
    updateParticles(dt);
    if(portal && portal.children[3]) portal.children[3].material.opacity = .38 + Math.sin(Date.now()*.005)*.24;
    crystals.forEach(c=>{ if(!c.got){ c.mesh.rotation.y += dt*2.4; c.mesh.position.y = 1.1 + Math.sin(Date.now()*.004 + c.x)*.12; }});
    renderer.render(scene,camera);
  }
  function updateCamera(){ if(!camera || !player) return; const targetX = mode === 'free' ? p.x : Math.max(-2, p.x+1.2); camera.position.x += (targetX-camera.position.x)*.08; camera.position.y += ((p.y+4.0)-camera.position.y)*.035; camera.lookAt(camera.position.x, 1.2, 0); }
  function updateGameLogic(){
    if(mode !== 'missions' || !currentLevel) return;
    crystals.forEach(c=>{ if(!c.got && Math.abs(p.x-c.x)<.75 && p.y<2.6){ c.got=true; levelGroup.remove(c.mesh); collected++; addPoints(10); unlock('crystal'); spawnParticles('win'); toast(`Cristal ${collected}/${currentLevel.crystals.length}`, 'ok'); $('#hudCrystals').textContent=`${collected}/${currentLevel.crystals.length}`; }});
    blockers.forEach(b=>{
      if(b.alive===false) return;
      const near = Math.abs(p.x-b.x) < (b.w/2+.45);
      if(!near) return;
      if(b.type==='block' && p.y<1.05){ p.x = b.x - Math.sign(p.vx||1)*(b.w/2+.62); }
      if(b.type==='tunnel' && !(input.crouch || p.mini || p.squash<.7)){ toast('Túnel baixo: abaixe ou fique mini!', 'guide'); p.x = b.x - Math.sign(p.vx||1)*(b.w/2+.62); }
      if(b.type==='gate' && !p.giant){ toast('Portão pesado: fique gigante!', 'guide'); p.x = b.x - Math.sign(p.vx||1)*(b.w/2+.62); }
      if(b.type==='gate' && p.giant){ b.alive=false; levelGroup.remove(b.mesh); toast('Portão aberto!', 'ok'); addPoints(8); }
      if(b.type==='dark'){ toast('Bloco escuro: use Poder perto dele!', 'guide'); p.x = b.x - Math.sign(p.vx||1)*(b.w/2+.62); }
    });
    hazards.forEach(h=>{ if(Math.abs(p.x-h.x)<(h.w/2+.38) && p.y<.75){ loseLife(); p.vy=8; p.x -= Math.sign(p.vx||1)*.8; }});
    const pct = Math.max(0, Math.min(100, ((p.x+6)/(currentLevel.portalX+6))*100)); $('#progressFill').style.width = pct+'%';
    if(Math.abs(p.x-currentLevel.portalX)<1.2 && collected>=currentLevel.crystals.length){ completeLevel(); }
    else if(Math.abs(p.x-currentLevel.portalX)<1.2 && collected<currentLevel.crystals.length){ toast('Pegue todos os cristais antes do portal.', 'guide'); }
  }
  function completeLevel(){
    if(objectiveDone) return; objectiveDone=true; spawnParticles('win'); addPoints(40); unlock('first'); if(currentLevel.world==='vulcao') unlock('fire'); if(currentLevel.world==='espaco') unlock('explorer'); state.level++; save(); toast('Portal aberto! Fase completa!', 'ok'); speak('Fase completa! O portal abriu.'); setTimeout(()=>loadLevel(state.level),2200);
  }
  function spawnParticles(kind){
    if(!scene) return; const count=kind==='win'?38:22;
    for(let i=0;i<count;i++){ const color=kind==='win'?Math.random()*0xffffff:0xff7a00; const mesh=new THREE.Mesh(new THREE.BoxGeometry(.18,.18,.18), new THREE.MeshBasicMaterial({color})); mesh.position.set(p.x,p.y+1.2,0); scene.add(mesh); particles.push({mesh,life:1+Math.random()*.6,vx:(Math.random()-.5)*.22,vy:Math.random()*.25+.07,vz:(Math.random()-.5)*.22}); }
  }
  function updateParticles(dt){
    for(let i=particles.length-1;i>=0;i--){ const q=particles[i]; q.mesh.position.x+=q.vx; q.mesh.position.y+=q.vy; q.mesh.position.z+=q.vz; q.vy-=.7*dt; q.life-=dt; q.mesh.rotation.x+=.08; q.mesh.rotation.y+=.06; if(q.life<=0){ scene.remove(q.mesh); particles.splice(i,1); }}
  }

  function openQuiz(){
    const q = quiz[Math.floor(Math.random()*quiz.length)];
    $('#quizQuestion').textContent = q.q; $('#quizFeedback').textContent=''; const box=$('#quizOptions'); box.innerHTML='';
    q.opts.forEach((opt,i)=>{ const b=document.createElement('button'); b.className='btn'; b.textContent=opt; b.onclick=()=>{ box.querySelectorAll('button').forEach(x=>x.disabled=true); if(i===q.ans){ b.classList.add('ok'); $('#quizFeedback').textContent=q.exp+' +10 pontos'; addPoints(10); unlock('quiz'); speak('Resposta certa!'); setTimeout(()=>closeModal(b),1400); } else { b.classList.add('danger'); $('#quizFeedback').textContent='Quase! '+q.exp; speak('Quase!'); }}; box.appendChild(b); });
    openModal('#quizModal');
  }
  function answerAthos(){
    const q = ($('#askInput').value||'').toLowerCase(); let r='No meu mundo existem cristais, portais e fases para explorar.';
    if(q.includes('fogo')||q.includes('poder')) r='Meu poder de fogo quebra blocos escuros e acende os portais.';
    else if(q.includes('otto')) r='O Otto é meu parceiro guardião. Com ele eu consigo passar qualquer fase!';
    else if(q.includes('portal')) r='Para abrir o portal, colete os cristais e chegue até ele.';
    else if(q.includes('mini')) r='O modo mini ajuda a passar em túneis pequenos.';
    else if(q.includes('gigante')) r='O modo gigante abre portões pesados do castelo.';
    else if(q.includes('quem')) r='Eu sou o Athos, um boneco 3D guardião dos portais.';
    $('#askResponse').textContent=r; $('#askInput').value=''; speak(r);
  }
  function openCollection(){ const grid=$('#collectionGrid'); grid.innerHTML=''; medals.forEach(m=>{ const ok=state.medals.includes(m.id); const div=document.createElement('div'); div.className='badgeItem '+(ok?'':'locked'); div.innerHTML=`<span class="emoji">${ok?m.emoji:'🔒'}</span><strong>${m.title}</strong><small>${m.desc}</small>`; grid.appendChild(div); }); openModal('#collectionModal'); }
  function openModal(id){ $(id).hidden=false; } function closeModal(el){ el.closest('.modal').hidden=true; }

  // events
  $('#playBtn').onclick = startMissions; $('#freeBtn').onclick=startFree; $('#exitTopBtn').onclick=exitGame; $('#exitBottomBtn').onclick=exitGame; $('#resetBtn').onclick=()=>{ if(confirm('Zerar pontos, fases e medalhas?')) resetState(); };
  $('#quizLobbyBtn').onclick=openQuiz; $('#askLobbyBtn').onclick=()=>openModal('#askModal'); $('#collectionBtn').onclick=openCollection;
  $$('.diffBtn').forEach(b=>b.onclick=()=>{ state.difficulty=b.dataset.diff; save(); });
  $$('[data-action]').forEach(b=>b.addEventListener('click',()=>action(b.dataset.action,b)));
  $$('[data-open="quiz"]').forEach(b=>b.onclick=openQuiz); $$('[data-open="ask"]').forEach(b=>b.onclick=()=>openModal('#askModal'));
  $$('[data-close]').forEach(b=>b.onclick=()=>closeModal(b));
  $('#askSend').onclick=answerAthos; $('#askInput').onkeydown=e=>{ if(e.key==='Enter') answerAthos(); };
  $('#askVoice').onclick=()=>{ const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR){ toast('Voz não suportada neste navegador.','guide'); return;} const rec=new SR(); rec.lang='pt-BR'; rec.onresult=e=>{ $('#askInput').value=e.results[0][0].transcript; answerAthos(); }; rec.start(); };
  $$('.worldChip').forEach(b=>b.onclick=()=>{ if(mode==='missions'){ toast('Nas fases o mundo vem do portal. Use Brincar Livre para trocar.', 'guide'); return;} buildWorld(b.dataset.world, null); });
  $$('[data-hold]').forEach(b=>{
    const key=b.dataset.hold;
    const down=e=>{e.preventDefault(); input[key]=true; if(key==='jump') jump(); if(key==='crouch') crouch();};
    const up=()=>{ input[key]=false; if(key==='crouch') p.targetSquash=1; };
    b.addEventListener('pointerdown',down); b.addEventListener('pointerup',up); b.addEventListener('pointercancel',up); b.addEventListener('pointerleave',up);
  });
  document.addEventListener('keydown', e=>{ if(mode==='lobby') return; const map={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',Space:'jump',KeyW:'jump',ArrowDown:'crouch',KeyS:'crouch',KeyX:'power',KeyY:'spin',KeyG:'giant',KeyM:'mini',KeyN:'normal'}; const a=map[e.code]; if(!a) return; e.preventDefault(); if(a==='left'||a==='right'||a==='crouch') input[a]=true; action(a); });
  document.addEventListener('keyup', e=>{ const map={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowDown:'crouch',KeyS:'crouch'}; const a=map[e.code]; if(a) {input[a]=false; if(a==='crouch') p.targetSquash=1;} });
  window.addEventListener('beforeunload', stopCamera);
  updateStats();
})();
