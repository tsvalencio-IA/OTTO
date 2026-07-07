(async () => {
  'use strict';
  const VERSION = 'ATHOS_V38_LAYOUT_MOBILE_TEST_001';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const results = [], errors = [];
  window.addEventListener('error', e => errors.push(e.message || 'Erro JS'));
  window.addEventListener('unhandledrejection', e => errors.push(String(e.reason || 'Promise rejeitada')));
  const all = (s, r=document) => Array.from(r.querySelectorAll(s));
  const visible = el => !!el && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden' && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0;
  const txt = el => !el ? '' : [el.innerText, el.textContent, el.getAttribute('aria-label'), el.id, el.className, el.dataset ? Object.entries(el.dataset).map(([k,v])=>`${k}:${v}`).join(' ') : ''].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  function add(name, ok, detail=''){ results.push({teste:name,status:ok?'✅ OK':'❌ FALHOU',detalhe:String(detail||'')}); console[ok?'log':'warn'](`${ok?'✅ OK':'❌ FALHOU'} ${name}`, detail||''); panel(); }
  function warn(name, detail=''){ results.push({teste:name,status:'⚠️ AVISO',detalhe:String(detail||'')}); console.warn(`⚠️ ${name}`, detail||''); panel(); }
  function panel(){ let p=document.getElementById('athos-v38-test-panel'); if(!p){ p=document.createElement('div'); p.id='athos-v38-test-panel'; p.style.cssText='position:fixed;right:10px;top:10px;width:min(520px,calc(100vw - 20px));max-height:84vh;overflow:auto;z-index:99999999;background:rgba(0,0,0,.94);color:#fff;font:13px Arial;border:3px solid #55ff55;border-radius:10px;padding:10px;box-shadow:0 10px 35px rgba(0,0,0,.55)'; document.body.appendChild(p);} const ok=results.filter(r=>r.status.includes('OK')).length, fail=results.filter(r=>r.status.includes('FALHOU')).length, av=results.filter(r=>r.status.includes('AVISO')).length; p.innerHTML=`<b>${VERSION}</b><div>✅ ${ok} ❌ ${fail} ⚠️ ${av} JS:${errors.length}</div>`+results.slice(-50).map(r=>`<div style="border-top:1px solid #444;padding:4px"><b>${r.status}</b> ${r.teste}<br><small>${String(r.detalhe).replace(/[<>&]/g,'')}</small></div>`).join(''); }
  async function checkFile(path){ try{ const r=await fetch(path+'?v38test='+Date.now(),{method:'HEAD',cache:'no-store'}); add(`Arquivo ${path}`, r.ok, `HTTP ${r.status}`); }catch(e){ add(`Arquivo ${path}`, false, e.message); } }
  async function fetchText(path){ try{ const r=await fetch(path+'?v38test='+Date.now(),{cache:'no-store'}); return r.ok ? await r.text() : ''; }catch{return '';} }
  function centerTap(el){ const r=el.getBoundingClientRect(); const x=r.left+r.width/2, y=r.top+r.height/2; try{el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,pointerId:38,pointerType:'touch',clientX:x,clientY:y,isPrimary:true}));}catch{} try{el.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,cancelable:true,pointerId:38,pointerType:'touch',clientX:x,clientY:y,isPrimary:true}));}catch{} el.click(); }
  async function tap(el,name){ if(!el){add(`Clique ${name}`,false,'não encontrado');return false;} el.scrollIntoView({block:'center',inline:'center'}); await sleep(80); centerTap(el); add(`Clique ${name}`,true,txt(el).slice(0,160)); return true; }
  function rect(el){ return el ? el.getBoundingClientRect() : {left:0,right:0,top:0,bottom:0,width:0,height:0}; }
  function overlap(a,b){ const A=rect(a),B=rect(b); return !(A.right<=B.left || A.left>=B.right || A.bottom<=B.top || A.top>=B.bottom); }
  function findButton(re, ex){ return all('button,a,[role="button"],.pixel-btn,.action-btn,.move-btn,.world-chip').find(b=>visible(b)&&re.test(txt(b))&&(!ex||!ex.test(txt(b)))); }
  function modal(){ return all('.modal,[role="dialog"],.overlay').find(visible); }
  async function closeModal(){ const m=modal(); const b=m && (m.querySelector('#modalClose') || all('button',m).find(x=>/fechar|close|^x$/i.test(txt(x)))); if(b) await tap(b,'Fechar modal'); else document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); await sleep(250); }

  console.log('%cATHOS V38 LAYOUT MOBILE TESTE', 'font-size:20px;color:#55ff55;background:#111;padding:8px');
  await checkFile('./index.html'); await checkFile('./style.css'); await checkFile('./app.js'); await checkFile('./athos.glb'); await checkFile('./manifest.webmanifest'); await checkFile('./sw.js');
  const index = await fetchText('./index.html'), css = await fetchText('./style.css'), app = await fetchText('./app.js');
  add('Título/cache V38', /V38|v=38-layout-mobile/i.test(document.title + index), document.title);
  add('CSS tem camada V38', /V38 LAYOUT MOBILE JOGÁVEL|v38-dock-portrait|game-controls > \.world-strip/i.test(css), 'buscando dock V38');
  add('World-strip é filho direto do game-controls', !!document.querySelector('.game-controls > .world-strip'), 'estrutura HTML');
  add('app.js carregado e grande', app.length > 50000, `${app.length} caracteres`);
  add('B Poder separado', document.getElementById('powerBtn')?.dataset.action === 'power', JSON.stringify(document.getElementById('powerBtn')?.dataset || {}));

  const quiz=document.getElementById('quizBtn')||findButton(/quiz/i); await tap(quiz,'Abrir Quiz'); await sleep(500); const m=modal()||document; const opts=all('button,.quiz-option,.choice,[data-correct]',m).filter(visible).filter(o=>!/fechar|close/i.test(txt(o))); add('Quiz alternativas sem quebrar layout', opts.length>=2, `${opts.length} opções`); await closeModal();
  const play=document.getElementById('playBtn')||document.getElementById('heroPlayBtn')||findButton(/jogar|fases/i,/quiz|falar|brincar/i); await tap(play,'Entrar no jogo'); await sleep(3600);
  const canvas=all('canvas').find(visible); if(canvas){const r=rect(canvas); add('Canvas grande e acima do dock', r.width>100 && r.height>100, `${Math.round(r.width)}x${Math.round(r.height)}`);} else add('Canvas visível',false,'não encontrado');
  const dock=document.querySelector('.game-controls'), strip=document.querySelector('.game-controls > .world-strip'), left=document.querySelector('.left-zone'), right=document.querySelector('.right-zone'), joy=document.getElementById('joystick'), actions=document.querySelector('.action-grid');
  add('Dock de controles visível', visible(dock), dock ? `${Math.round(rect(dock).width)}x${Math.round(rect(dock).height)}` : 'sem dock');
  add('Barra de mundos no dock', visible(strip), strip ? `${Math.round(rect(strip).width)}x${Math.round(rect(strip).height)}` : 'sem mundos');
  add('Joystick no bloco esquerdo', visible(left)&&visible(joy), joy ? txt(joy).slice(0,80) : 'sem joystick');
  add('Ações no bloco direito', visible(right)&&visible(actions), actions ? `${all('.action-btn', actions).length} botões` : 'sem ações');
  add('Mundos NÃO sobrepõem joystick', strip && joy ? !overlap(strip, joy) : false, 'world-strip x joystick');
  add('Mundos NÃO sobrepõem ações', strip && actions ? !overlap(strip, actions) : false, 'world-strip x action-grid');
  add('Joystick NÃO sobrepõe ações', joy && actions ? !overlap(joy, actions) : false, 'joystick x action-grid');
  add('B Poder clicável e visível', visible(document.getElementById('powerBtn')), txt(document.getElementById('powerBtn')));
  await tap(document.getElementById('moveForwardBtn'),'Fundo'); await tap(document.getElementById('jumpBtn'),'A Pular'); await tap(document.getElementById('powerBtn'),'B Poder');
  await sleep(800); add('Sem erro JavaScript capturado', errors.length === 0, errors.slice(-5).join(' | '));
  console.log('%cRELATÓRIO FINAL V38', 'font-size:18px;color:#ffcc00;background:#111;padding:8px'); console.table(results); window.ATHOS_V38_TEST_RESULTS=results; window.ATHOS_V38_TEST_ERRORS=errors;
  alert(`Teste V38 finalizado.\nOK: ${results.filter(r=>r.status.includes('OK')).length}\nFalhas: ${results.filter(r=>r.status.includes('FALHOU')).length}\nAvisos: ${results.filter(r=>r.status.includes('AVISO')).length}\nErros JS: ${errors.length}`);
})();
