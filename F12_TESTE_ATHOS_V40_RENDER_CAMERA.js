(async () => {
  'use strict';
  const VERSION = 'ATHOS_V40_RENDER_CAMERA_TEST_001';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const results = []; const errors = [];
  window.addEventListener('error', e => errors.push(e.message || 'Erro JS'));
  window.addEventListener('unhandledrejection', e => errors.push(String(e.reason || 'Promise rejeitada')));
  const all = (s, r=document) => Array.from(r.querySelectorAll(s));
  const visible = el => !!el && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden' && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0;
  const txt = el => !el ? '' : [el.innerText, el.textContent, el.getAttribute('aria-label'), el.id, el.className, el.dataset ? Object.entries(el.dataset).map(([k,v])=>`${k}:${v}`).join(' ') : ''].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  function add(name, ok, detail=''){ results.push({teste:name,status:ok?'✅ OK':'❌ FALHOU',detalhe:String(detail||'')}); console[ok?'log':'warn'](`${ok?'✅ OK':'❌ FALHOU'} ${name}`, detail||''); panel(); }
  function warn(name, detail=''){ results.push({teste:name,status:'⚠️ AVISO',detalhe:String(detail||'')}); console.warn(`⚠️ ${name}`, detail||''); panel(); }
  function panel(){ let p=document.getElementById('athos-v40-test-panel'); if(!p){p=document.createElement('div'); p.id='athos-v40-test-panel'; p.style.cssText='position:fixed;right:10px;top:10px;width:min(520px,calc(100vw - 20px));max-height:84vh;overflow:auto;z-index:99999999;background:rgba(0,0,0,.94);color:#fff;font:13px Arial;border:3px solid #55ff55;border-radius:10px;padding:10px;box-shadow:0 10px 35px rgba(0,0,0,.55)'; document.body.appendChild(p);} const ok=results.filter(r=>r.status.includes('OK')).length, fail=results.filter(r=>r.status.includes('FALHOU')).length, av=results.filter(r=>r.status.includes('AVISO')).length; p.innerHTML=`<b>${VERSION}</b><div>✅ ${ok} ❌ ${fail} ⚠️ ${av} JS:${errors.length}</div>`+results.slice(-50).map(r=>`<div style="border-top:1px solid #444;padding:4px"><b>${r.status}</b> ${r.teste}<br><small>${String(r.detalhe).replace(/[<>&]/g,'')}</small></div>`).join(''); }
  async function fetchText(path){ try{ const r=await fetch(path+'?v40test='+Date.now(),{cache:'no-store'}); return r.ok ? await r.text() : ''; }catch{return '';} }
  async function checkFile(path){ try{ const r=await fetch(path+'?v40test='+Date.now(),{method:'HEAD',cache:'no-store'}); add(`Arquivo ${path}`, r.ok, `HTTP ${r.status}`); }catch(e){ add(`Arquivo ${path}`, false, e.message); } }
  function pointer(el,type){ const r=el.getBoundingClientRect(); const x=r.left+r.width/2, y=r.top+r.height/2; try{el.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:40,pointerType:'touch',clientX:x,clientY:y,isPrimary:true}));}catch{} }
  async function tap(el,name){ if(!el){add(`Clique ${name}`,false,'não encontrado');return false;} el.scrollIntoView({block:'center',inline:'center'}); await sleep(80); pointer(el,'pointerdown'); await sleep(80); pointer(el,'pointerup'); el.click(); add(`Clique ${name}`,true,txt(el).slice(0,170)); return true; }
  async function hold(el,ms,name){ if(!el){add(`Segurar ${name}`,false,'não encontrado');return false;} pointer(el,'pointerdown'); await sleep(ms); pointer(el,'pointerup'); add(`Segurar ${name}`,true,txt(el).slice(0,170)); return true; }
  function findButton(re, ex){ return all('button,a,[role="button"],.pixel-btn,.action-btn,.move-btn,.world-chip').find(b=>visible(b)&&re.test(txt(b))&&(!ex||!ex.test(txt(b)))); }
  function modal(){ return all('.modal,[role="dialog"],.overlay').find(visible); }
  async function closeModal(){ const m=modal(); const b=m && (m.querySelector('#modalClose') || all('button',m).find(x=>/fechar|close|^x$/i.test(txt(x)))); if(b) await tap(b,'Fechar modal'); else document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); await sleep(250); }

  console.log('%cATHOS V40 RENDER/CÂMERA TESTE', 'font-size:20px;color:#55ff55;background:#111;padding:8px');
  await checkFile('./index.html'); await checkFile('./style.css'); await checkFile('./app.js'); await checkFile('./athos.glb'); await checkFile('./manifest.webmanifest'); await checkFile('./sw.js');
  const app = await fetchText('./app.js'); const css = await fetchText('./style.css'); const index = await fetchText('./index.html');
  add('Título V40', /V40|Render e Câmera|RENDER E CÂMERA/i.test(document.title + index), document.title);
  add('app.js grande carregado', app.length > 50000, `${app.length} caracteres`);
  add('Camada V40 no app.js', /applyV40RenderPass|addV40LaneReadability|addV40PortalRunway|addV40SoftSpotlights|polishAthosMaterial/.test(app), 'buscando render V40');
  add('Câmera V40 sem mexer em controles', /cameraRig|desiredFov|desiredLook/.test(app), 'buscando câmera cinematográfica');
  add('CSS mantém V39 sem Quiz/Falar no game', /data-action="quiz"|quizActionBtn|askActionBtn/.test(css), 'trava CSS de controles limpos');
  add('Quiz/Falar NÃO estão no action-grid do HTML', !/id="quizActionBtn"|id="askActionBtn"|data-action="quiz"|data-action="ask"/.test(index), 'HTML do controle limpo');
  add('Quiz 80+ perguntas preservado', ((app.match(/\bq\s*:/g)||[]).length >= 80), `${(app.match(/\bq\s*:/g)||[]).length} perguntas`);
  add('model-viewer existe', !!document.querySelector('model-viewer'), document.querySelector('model-viewer')?.getAttribute('src'));
  add('AR Nativo externo existe', !!document.getElementById('arNativeExternalBtn'), txt(document.getElementById('arNativeExternalBtn')));
  add('B Poder separado por ID', !!document.getElementById('powerBtn'), txt(document.getElementById('powerBtn')));
  add('B Poder data-action power', document.getElementById('powerBtn')?.dataset.action === 'power', JSON.stringify(document.getElementById('powerBtn')?.dataset || {}));
  add('Vulcão não é B Poder', document.querySelector('[data-world="fire"]')?.id !== 'powerBtn' && document.querySelector('[data-world="fire"]')?.dataset.action !== 'power', txt(document.querySelector('[data-world="fire"]')));

  const quiz = document.getElementById('quizBtn') || findButton(/quiz/i); await tap(quiz,'Abrir Quiz'); await sleep(500); const m = modal() || document; const opts = all('button,.quiz-option,.choice,[data-correct]',m).filter(visible).filter(o=>!/fechar|close/i.test(txt(o))); add('Quiz abre no lobby', opts.length >= 2, `${opts.length} opções`); await closeModal();
  const ask = document.getElementById('askBtn') || findButton(/falar|perguntar/i); await tap(ask,'Falar com Athos'); await sleep(400); const m2=modal()||document; add('Falar abre no lobby', !!all('input,textarea',m2).find(visible), 'input'); await closeModal();

  const play = document.getElementById('playBtn') || document.getElementById('heroPlayBtn') || findButton(/jogar|fases/i,/quiz|falar|brincar/i); await tap(play,'Entrar no jogo'); await sleep(3800);
  add('Three.js carregado após entrar', !!window.THREE, window.THREE ? `REV ${THREE.REVISION}` : 'ausente');
  add('GLTFLoader carregado após entrar', !!(window.THREE && THREE.GLTFLoader), 'GLTFLoader');
  const canvas=all('canvas').find(visible); if(canvas){ const r=canvas.getBoundingClientRect(); add('Canvas grande', r.width>100 && r.height>100, `${Math.round(r.width)}x${Math.round(r.height)}`);} else add('Canvas visível', false, 'não encontrado');
  ['moveForwardBtn','moveBackBtn','moveLeftBtn','moveRightBtn','jumpBtn','powerBtn','crouchBtn','sizeBtn','normalBtn','pauseBtn','exitBtn','joystick'].forEach(id=>add(`#${id} existe`, !!document.getElementById(id), txt(document.getElementById(id))));
  add('Quiz/Falar não aparecem no controle do jogo', !document.querySelector('.game.active #quizActionBtn,.game.active #askActionBtn,.game.active [data-action="quiz"],.game.active [data-action="ask"]'), 'controle limpo');
  await hold(document.getElementById('moveForwardBtn'),500,'Fundo'); await tap(document.getElementById('jumpBtn'),'A Pular'); await tap(document.getElementById('powerBtn'),'B Poder');
  add('HUD vida/XP/cristais/inimigos/objetivo', /vida|xp|cristais|inimigos|objetivo|portal/i.test(document.body.innerText), 'HUD texto');
  await sleep(800); add('Sem erro JavaScript capturado', errors.length === 0, errors.slice(-5).join(' | '));
  console.log('%cRELATÓRIO FINAL V40', 'font-size:18px;color:#ffcc00;background:#111;padding:8px'); console.table(results); window.ATHOS_V40_TEST_RESULTS=results; window.ATHOS_V40_TEST_ERRORS=errors;
  alert(`Teste V40 finalizado.\nOK: ${results.filter(r=>r.status.includes('OK')).length}\nFalhas: ${results.filter(r=>r.status.includes('FALHOU')).length}\nAvisos: ${results.filter(r=>r.status.includes('AVISO')).length}\nErros JS: ${errors.length}`);
})();
