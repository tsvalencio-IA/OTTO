(async () => {
  'use strict';
  const VERSION = 'ATHOS_V35_RENDER_PREMIUM_TEST_001';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const results = []; const errors = [];
  window.addEventListener('error', e => errors.push(e.message || 'Erro JS'));
  window.addEventListener('unhandledrejection', e => errors.push(String(e.reason || 'Promise rejeitada')));
  const all = (s, r=document) => Array.from(r.querySelectorAll(s));
  const visible = el => !!el && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden' && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0;
  const txt = el => !el ? '' : [el.innerText, el.textContent, el.getAttribute('aria-label'), el.id, el.className, el.dataset ? Object.entries(el.dataset).map(([k,v])=>`${k}:${v}`).join(' ') : ''].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  function add(name, ok, detail=''){ results.push({teste:name,status:ok?'✅ OK':'❌ FALHOU',detalhe:String(detail||'')}); console[ok?'log':'warn'](`${ok?'✅ OK':'❌ FALHOU'} ${name}`, detail||''); panel(); }
  function warn(name, detail=''){ results.push({teste:name,status:'⚠️ AVISO',detalhe:String(detail||'')}); console.warn(`⚠️ ${name}`, detail||''); panel(); }
  function panel(){ let p=document.getElementById('athos-v35-test-panel'); if(!p){p=document.createElement('div'); p.id='athos-v35-test-panel'; p.style.cssText='position:fixed;right:10px;top:10px;width:min(520px,calc(100vw - 20px));max-height:84vh;overflow:auto;z-index:99999999;background:rgba(0,0,0,.94);color:#fff;font:13px Arial;border:3px solid #55ff55;border-radius:10px;padding:10px;box-shadow:0 10px 35px rgba(0,0,0,.55)'; document.body.appendChild(p);} const ok=results.filter(r=>r.status.includes('OK')).length, fail=results.filter(r=>r.status.includes('FALHOU')).length, av=results.filter(r=>r.status.includes('AVISO')).length; p.innerHTML=`<b>${VERSION}</b><div>✅ ${ok} ❌ ${fail} ⚠️ ${av} JS:${errors.length}</div>`+results.slice(-45).map(r=>`<div style="border-top:1px solid #444;padding:4px"><b>${r.status}</b> ${r.teste}<br><small>${String(r.detalhe).replace(/[<>&]/g,'')}</small></div>`).join(''); }
  async function fetchText(path){ try{ const r=await fetch(path+'?v35test='+Date.now(),{cache:'no-store'}); return r.ok ? await r.text() : ''; }catch{return '';} }
  async function checkFile(path){ try{ const r=await fetch(path+'?v35test='+Date.now(),{method:'HEAD',cache:'no-store'}); add(`Arquivo ${path}`, r.ok, `HTTP ${r.status}`); }catch(e){ add(`Arquivo ${path}`, false, e.message); } }
  function pointer(el,type){ const r=el.getBoundingClientRect(); const x=r.left+r.width/2, y=r.top+r.height/2; try{el.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:35,pointerType:'touch',clientX:x,clientY:y,isPrimary:true}));}catch{} }
  async function tap(el,name){ if(!el){add(`Clique ${name}`,false,'não encontrado');return false;} el.scrollIntoView({block:'center',inline:'center'}); await sleep(80); pointer(el,'pointerdown'); await sleep(80); pointer(el,'pointerup'); el.click(); add(`Clique ${name}`,true,txt(el).slice(0,160)); return true; }
  async function hold(el,ms,name){ if(!el){add(`Segurar ${name}`,false,'não encontrado');return false;} pointer(el,'pointerdown'); await sleep(ms); pointer(el,'pointerup'); add(`Segurar ${name}`,true,txt(el).slice(0,160)); return true; }
  function findButton(re, ex){ return all('button,a,[role="button"],.pixel-btn,.action-btn,.move-btn,.world-chip').find(b=>visible(b)&&re.test(txt(b))&&(!ex||!ex.test(txt(b)))); }
  function modal(){ return all('.modal,[role="dialog"],.overlay').find(visible); }
  async function closeModal(){ const m=modal(); const b=m && (m.querySelector('#modalClose') || all('button',m).find(x=>/fechar|close|^x$/i.test(txt(x)))); if(b) await tap(b,'Fechar modal'); else document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); await sleep(250); }

  console.log('%cATHOS V35 RENDER PREMIUM TESTE', 'font-size:20px;color:#55ff55;background:#111;padding:8px');
  await checkFile('./index.html'); await checkFile('./style.css'); await checkFile('./app.js'); await checkFile('./athos.glb'); await checkFile('./manifest.webmanifest'); await checkFile('./sw.js');
  const app = await fetchText('./app.js'); const css = await fetchText('./style.css'); const index = await fetchText('./index.html');
  add('Título V35 Render Premium', /V35|Render Premium/i.test(document.title + index), document.title);
  add('app.js grande carregado', app.length > 50000, `${app.length} caracteres`);
  add('style.css premium carregado', /V35 RENDER PREMIUM|premiumGlow|native-viewer/i.test(css), 'buscando camada premium');
  add('Render premium no app.js', /createPremiumAtmosphere|addPremiumRoadTiles|addPremiumSetPieces|makeEnemyModel|updatePremiumVisuals/.test(app), 'buscando funções visuais V35');
  add('Quiz 80+ perguntas', ((app.match(/\bq\s*:/g)||[]).length >= 80), `${(app.match(/\bq\s*:/g)||[]).length} perguntas`);
  add('model-viewer existe', !!document.querySelector('model-viewer'), document.querySelector('model-viewer')?.getAttribute('src'));
  add('AR Nativo externo existe', !!document.getElementById('arNativeExternalBtn'), txt(document.getElementById('arNativeExternalBtn')));
  add('B Poder separado por ID', !!document.getElementById('powerBtn'), txt(document.getElementById('powerBtn')));
  add('B Poder data-action power', document.getElementById('powerBtn')?.dataset.action === 'power', JSON.stringify(document.getElementById('powerBtn')?.dataset || {}));
  add('Vulcão não é B Poder', document.querySelector('[data-world="fire"]')?.id !== 'powerBtn' && document.querySelector('[data-world="fire"]')?.dataset.action !== 'power', txt(document.querySelector('[data-world="fire"]')));

  const quiz = document.getElementById('quizBtn') || findButton(/quiz/i); await tap(quiz,'Abrir Quiz'); await sleep(600);
  const m = modal() || document; const opts = all('button,.quiz-option,.choice,[data-correct]',m).filter(visible).filter(o=>!/fechar|close/i.test(txt(o)));
  add('Quiz abre alternativas reais', opts.length >= 2, `${opts.length} opções`); if(opts[0]) await tap(opts[0],'Responder Quiz'); await sleep(300); await closeModal();

  const ask = document.getElementById('askBtn') || findButton(/falar|perguntar/i); await tap(ask,'Falar com Athos'); await sleep(500);
  const m2=modal()||document; const inp=all('input,textarea',m2).find(visible); add('Campo falar existe', !!inp, 'input'); if(inp){ inp.value='Quem é o Athos?'; inp.dispatchEvent(new Event('input',{bubbles:true})); const send=m2.querySelector('#askSend') || all('button',m2).find(b=>/enviar/i.test(txt(b))); await tap(send,'Enviar pergunta'); await sleep(500); add('Athos responde', /athos|portal|fogo|guardião|guardiao/i.test(txt(m2)), txt(m2).slice(0,180)); } await closeModal();

  const play = document.getElementById('playBtn') || document.getElementById('heroPlayBtn') || findButton(/jogar|fases/i,/quiz|falar|brincar/i); await tap(play,'Entrar no jogo'); await sleep(3800);
  add('Three.js carregado após entrar', !!window.THREE, window.THREE ? `REV ${THREE.REVISION}` : 'ausente');
  add('GLTFLoader carregado após entrar', !!(window.THREE && THREE.GLTFLoader), 'GLTFLoader');
  const canvas=all('canvas').find(visible); if(canvas){ const r=canvas.getBoundingClientRect(); add('Canvas grande', r.width>100 && r.height>100, `${Math.round(r.width)}x${Math.round(r.height)}`);} else add('Canvas visível', false, 'não encontrado');
  const ids=['moveForwardBtn','moveBackBtn','moveLeftBtn','moveRightBtn','jumpBtn','powerBtn','crouchBtn','sizeBtn','normalBtn','pauseBtn','exitBtn','joystick']; ids.forEach(id=>add(`#${id} existe`, !!document.getElementById(id), txt(document.getElementById(id))));
  await hold(document.getElementById('moveForwardBtn'),650,'Fundo'); await tap(document.getElementById('jumpBtn'),'A Pular'); await tap(document.getElementById('powerBtn'),'B Poder'); await hold(document.getElementById('crouchBtn'),350,'Y Abaixar');
  add('HUD vida/XP/cristais/inimigos/objetivo', /vida|xp|cristais|inimigos|objetivo|portal/i.test(document.body.innerText), 'HUD texto');
  await sleep(800); add('Sem erro JavaScript capturado', errors.length === 0, errors.slice(-5).join(' | '));
  console.log('%cRELATÓRIO FINAL V35', 'font-size:18px;color:#ffcc00;background:#111;padding:8px'); console.table(results); window.ATHOS_V35_TEST_RESULTS=results; window.ATHOS_V35_TEST_ERRORS=errors;
  alert(`Teste V35 finalizado.\nOK: ${results.filter(r=>r.status.includes('OK')).length}\nFalhas: ${results.filter(r=>r.status.includes('FALHOU')).length}\nAvisos: ${results.filter(r=>r.status.includes('AVISO')).length}\nErros JS: ${errors.length}`);
})();
