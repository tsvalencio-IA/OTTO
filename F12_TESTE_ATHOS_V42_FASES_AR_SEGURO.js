(async () => {
  'use strict';
  const VERSION = 'ATHOS_V42_FASES_AR_SEGURO_TEST_001';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const results = []; const errors = [];
  window.addEventListener('error', e => errors.push(e.message || 'Erro JS'));
  window.addEventListener('unhandledrejection', e => errors.push(String(e.reason || 'Promise rejeitada')));
  const all = (s, r=document) => Array.from(r.querySelectorAll(s));
  const visible = el => !!el && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden' && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0;
  const txt = el => !el ? '' : [el.innerText, el.textContent, el.getAttribute('aria-label'), el.id, el.className, el.dataset ? Object.entries(el.dataset).map(([k,v])=>`${k}:${v}`).join(' ') : ''].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  function add(name, ok, detail=''){ results.push({teste:name,status:ok?'✅ OK':'❌ FALHOU',detalhe:String(detail||'')}); console[ok?'log':'warn'](`${ok?'✅ OK':'❌ FALHOU'} ${name}`, detail||''); panel(); }
  function warn(name, detail=''){ results.push({teste:name,status:'⚠️ AVISO',detalhe:String(detail||'')}); console.warn(`⚠️ ${name}`, detail||''); panel(); }
  function panel(){ let p=document.getElementById('athos-v42-test-panel'); if(!p){p=document.createElement('div'); p.id='athos-v42-test-panel'; p.style.cssText='position:fixed;right:10px;top:10px;width:min(560px,calc(100vw - 20px));max-height:84vh;overflow:auto;z-index:99999999;background:rgba(0,0,0,.94);color:#fff;font:13px Arial;border:3px solid #55ff55;border-radius:10px;padding:10px;box-shadow:0 10px 35px rgba(0,0,0,.55)'; document.body.appendChild(p);} const ok=results.filter(r=>r.status.includes('OK')).length, fail=results.filter(r=>r.status.includes('FALHOU')).length, av=results.filter(r=>r.status.includes('AVISO')).length; p.innerHTML=`<b>${VERSION}</b><div>✅ ${ok} ❌ ${fail} ⚠️ ${av} JS:${errors.length}</div>`+results.slice(-60).map(r=>`<div style="border-top:1px solid #444;padding:4px"><b>${r.status}</b> ${r.teste}<br><small>${String(r.detalhe).replace(/[<>&]/g,'')}</small></div>`).join(''); }
  async function fetchText(path){ try{ const r=await fetch(path+'?v42test='+Date.now(),{cache:'no-store'}); return r.ok ? await r.text() : ''; }catch{return '';} }
  async function checkFile(path){ try{ const r=await fetch(path+'?v42test='+Date.now(),{method:'HEAD',cache:'no-store'}); add(`Arquivo ${path}`, r.ok, `HTTP ${r.status}`); }catch(e){ add(`Arquivo ${path}`, false, e.message); } }
  function pointer(el,type,dx=0,dy=0){ const r=el.getBoundingClientRect(); const x=r.left+r.width/2+dx, y=r.top+r.height/2+dy; try{el.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:42,pointerType:'touch',clientX:x,clientY:y,isPrimary:true}));}catch{} }
  async function tap(el,name){ if(!el){add(`Clique ${name}`,false,'não encontrado');return false;} el.scrollIntoView({block:'center',inline:'center'}); await sleep(80); pointer(el,'pointerdown'); await sleep(80); pointer(el,'pointerup'); el.click(); add(`Clique ${name}`,true,txt(el).slice(0,180)); return true; }
  async function hold(el,ms,name){ if(!el){add(`Segurar ${name}`,false,'não encontrado');return false;} pointer(el,'pointerdown'); await sleep(ms); pointer(el,'pointerup'); add(`Segurar ${name}`,true,txt(el).slice(0,180)); return true; }
  function findButton(re, ex){ return all('button,a,[role="button"],.pixel-btn,.action-btn,.move-btn,.world-chip').find(b=>visible(b)&&re.test(txt(b))&&(!ex||!ex.test(txt(b)))); }
  function modal(){ return all('.modal,[role="dialog"],.overlay').find(visible); }
  async function closeModal(){ const m=modal(); const b=m && (m.querySelector('#modalClose') || all('button',m).find(x=>/fechar|close|^x$/i.test(txt(x)))); if(b) await tap(b,'Fechar modal'); else document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); await sleep(250); }
  function api(){ return window.ATHOS_TEST_API || {}; }
  function playerState(){ return api().getPlayerState ? api().getPlayerState() : null; }
  function inputState(){ return api().getInputState ? api().getInputState() : null; }

  console.log('%cATHOS V42 FASES + AR SEGURO TESTE', 'font-size:20px;color:#55ff55;background:#111;padding:8px');
  await checkFile('./index.html'); await checkFile('./style.css'); await checkFile('./app.js'); await checkFile('./athos.glb'); await checkFile('./manifest.webmanifest'); await checkFile('./sw.js');
  const app = await fetchText('./app.js'); const index = await fetchText('./index.html'); const css = await fetchText('./style.css');
  add('Título V42', /V42|FASES E AR SEGURO|Fases e AR Seguro/i.test(document.title + index), document.title);
  add('app.js grande carregado', app.length > 50000, `${app.length} caracteres`);
  add('Camada V42 fases existe', /applyV42LevelDesign|addV42GuideBoard|V42_LEVEL_GUIDES|getV42Design/.test(app), 'fases desenhadas');
  add('Camada AR seguro existe', /AR_SAFE|enterARSafeMode|getARSafety|V42_AR_SAFE_NO_DRIFT/.test(app), 'AR sem drift');
  add('Auto-rotate removido do model-viewer', !/auto-rotate/.test(index), 'model-viewer não deve girar sozinho no lobby');
  add('CSS de AR seguro existe', /ar-safe-mode/.test(css), 'selo AR seguro');
  add('Render V40 preservado', /applyV40RenderPass|addV40LaneReadability|polishAthosMaterial/.test(app), 'render/câmera V40 ainda presente');
  add('Game feel V41 preservado', /GAME_FEEL|joystickDeadzone|platformSnap|jumpBufferMs|safePointerCapture/.test(app), 'V41.1 ainda presente');
  add('Quiz/Falar NÃO estão no action-grid do HTML', !/id="quizActionBtn"|id="askActionBtn"|data-action="quiz"|data-action="ask"/.test(index), 'controle limpo');
  add('Quiz 80+ perguntas preservado', ((app.match(/\bq\s*:/g)||[]).length >= 80), `${(app.match(/\bq\s*:/g)||[]).length} perguntas`);
  add('model-viewer existe', !!document.querySelector('model-viewer'), document.querySelector('model-viewer')?.getAttribute('src'));
  add('AR Nativo externo existe', !!document.getElementById('arNativeExternalBtn'), txt(document.getElementById('arNativeExternalBtn')));
  add('B Poder separado por ID', !!document.getElementById('powerBtn'), txt(document.getElementById('powerBtn')));
  add('B Poder data-action power', document.getElementById('powerBtn')?.dataset.action === 'power', JSON.stringify(document.getElementById('powerBtn')?.dataset || {}));

  const quiz = document.getElementById('quizBtn') || findButton(/quiz/i); await tap(quiz,'Abrir Quiz'); await sleep(350); const m = modal() || document; const opts = all('button,.quiz-option,.choice,[data-correct]',m).filter(visible).filter(o=>!/fechar|close/i.test(txt(o))); add('Quiz abre no lobby', opts.length >= 2, `${opts.length} opções`); await closeModal();
  const ask = document.getElementById('askBtn') || findButton(/falar|perguntar/i); await tap(ask,'Falar com Athos'); await sleep(300); const m2=modal()||document; add('Falar abre no lobby', !!all('input,textarea',m2).find(visible), 'input'); await closeModal();

  const play = document.getElementById('playBtn') || document.getElementById('heroPlayBtn') || findButton(/jogar|fases/i,/quiz|falar|brincar/i); await tap(play,'Entrar no jogo'); await sleep(3900);
  add('Three.js carregado após entrar', !!window.THREE, window.THREE ? `REV ${THREE.REVISION}` : 'ausente');
  add('GLTFLoader carregado após entrar', !!(window.THREE && THREE.GLTFLoader), 'GLTFLoader');
  const canvas=all('canvas').find(visible); if(canvas){ const r=canvas.getBoundingClientRect(); add('Canvas grande', r.width>100 && r.height>100, `${Math.round(r.width)}x${Math.round(r.height)}`);} else add('Canvas visível', false, 'não encontrado');
  ['moveForwardBtn','moveBackBtn','moveLeftBtn','moveRightBtn','jumpBtn','powerBtn','crouchBtn','sizeBtn','normalBtn','pauseBtn','exitBtn','joystick'].forEach(id=>add(`#${id} existe`, !!document.getElementById(id), txt(document.getElementById(id))));
  add('Quiz/Falar não aparecem no controle do jogo', !document.querySelector('.game.active #quizActionBtn,.game.active #askActionBtn,.game.active [data-action="quiz"],.game.active [data-action="ask"]'), 'controle limpo');
  const d1 = api().getV42Design ? api().getV42Design() : null;
  add('Fase tem marcações V42', d1 && d1.markers >= 8, JSON.stringify(d1));
  const beforeIdle = playerState(); await sleep(700); const afterIdle = playerState();
  add('Parado sem tocar', beforeIdle && afterIdle && Math.abs((afterIdle.x-beforeIdle.x)||0) < .08 && Math.abs((afterIdle.z-beforeIdle.z)||0) < .08, JSON.stringify({before:beforeIdle, after:afterIdle}));
  await hold(document.getElementById('moveForwardBtn'),600,'Fundo'); await sleep(900); const st=inputState(), ps=playerState();
  add('Soltou controle e zerou input', st && Math.abs(st.input.x) < .08 && Math.abs(st.input.z) < .08 && !Object.values(st.moveHold).some(Boolean), JSON.stringify(st));
  add('Soltou controle e zerou velocidade horizontal', ps && Math.abs(ps.vx) < .25 && Math.abs(ps.vz) < .25, JSON.stringify(ps));
  await tap(document.getElementById('jumpBtn'),'A Pular'); await sleep(150); const jumpState=playerState(); add('A Pular aplica velocidade vertical', jumpState && jumpState.vy > 1, JSON.stringify(jumpState));
  await hold(document.getElementById('crouchBtn'),350,'Y Abaixar'); await sleep(500); const crouchState=inputState(); add('Y Abaixar não fica travado', crouchState && crouchState.input.crouch === false, JSON.stringify(crouchState));
  await tap(document.getElementById('powerBtn'),'B Poder');
  const realBtn = document.querySelector('[data-world="real"]'); await tap(realBtn,'Trocar para Real/AR'); await sleep(450);
  const ar1 = api().getARSafety ? api().getARSafety() : null; const in1 = inputState(); const p1 = playerState(); await sleep(800); const p2 = playerState();
  add('AR seguro ativado', ar1 && ar1.realBg && /V42_AR_SAFE/.test(ar1.label || ''), JSON.stringify(ar1));
  add('AR não deixa input residual', in1 && Math.abs(in1.input.x) < .08 && Math.abs(in1.input.z) < .08 && !Object.values(in1.moveHold).some(Boolean), JSON.stringify(in1));
  add('AR não anda sozinho ao abrir', p1 && p2 && Math.abs((p2.x-p1.x)||0) < .08 && Math.abs((p2.z-p1.z)||0) < .08, JSON.stringify({before:p1, after:p2}));
  add('HUD vida/XP/cristais/inimigos/objetivo', /vida|xp|cristais|inimigos|objetivo|portal/i.test(document.body.innerText), 'HUD texto');
  await sleep(800); add('Sem erro JavaScript capturado', errors.length === 0, errors.slice(-6).join(' | '));
  console.log('%cRELATÓRIO FINAL V42', 'font-size:18px;color:#ffcc00;background:#111;padding:8px'); console.table(results); window.ATHOS_V42_TEST_RESULTS=results; window.ATHOS_V42_TEST_ERRORS=errors;
  alert(`Teste V42 finalizado.\nOK: ${results.filter(r=>r.status.includes('OK')).length}\nFalhas: ${results.filter(r=>r.status.includes('FALHOU')).length}\nAvisos: ${results.filter(r=>r.status.includes('AVISO')).length}\nErros JS: ${errors.length}`);
})();
