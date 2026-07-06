(async () => {
  'use strict';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const results = [];
  const errors = [];
  window.addEventListener('error', e => errors.push(e.message));
  window.addEventListener('unhandledrejection', e => errors.push(String(e.reason || 'Promise rejeitada')));
  const all = (s, r=document) => Array.from(r.querySelectorAll(s));
  const visible = el => !!el && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden' && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0;
  const txt = el => !el ? '' : [el.innerText, el.textContent, el.getAttribute('aria-label'), el.id, el.className, el.dataset ? Object.entries(el.dataset).map(([k,v])=>`${k}:${v}`).join(' ') : ''].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  function add(name, ok, detail=''){ results.push({teste:name,status:ok?'✅ OK':'❌ FALHOU',detalhe:String(detail||'')}); console[ok?'log':'warn'](`${ok?'✅ OK':'❌ FALHOU'} ${name}`, detail||''); }
  async function head(path){ try{ const r=await fetch(path+'?v36test='+Date.now(),{method:'HEAD',cache:'no-store'}); add(`Arquivo ${path}`, r.ok, `HTTP ${r.status}`); }catch(e){ add(`Arquivo ${path}`, false, e.message); } }
  async function get(path){ try{ const r=await fetch(path+'?v36test='+Date.now(),{cache:'no-store'}); return r.ok?await r.text():''; }catch{return '';} }
  function ptr(el,type){ const r=el.getBoundingClientRect(); el.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:36,pointerType:'touch',isPrimary:true,clientX:r.left+r.width/2,clientY:r.top+r.height/2})); }
  async function tap(el,name){ if(!el){add(`Clique ${name}`,false,'não encontrado');return;} el.scrollIntoView({block:'center',inline:'center'}); await sleep(80); try{ptr(el,'pointerdown'); await sleep(80); ptr(el,'pointerup'); el.click(); add(`Clique ${name}`,true,txt(el).slice(0,140));}catch(e){add(`Clique ${name}`,false,e.message);} }
  async function hold(el,ms,name){ if(!el){add(`Segurar ${name}`,false,'não encontrado');return;} try{ptr(el,'pointerdown'); await sleep(ms); ptr(el,'pointerup'); add(`Segurar ${name}`,true,txt(el).slice(0,140));}catch(e){add(`Segurar ${name}`,false,e.message);} }
  function closeModal(){ const modal = all('.modal,[role="dialog"]').find(visible); const b = modal && (modal.querySelector('#modalClose') || all('button', modal).find(x=>/fechar|close/i.test(txt(x)))); if (b) b.click(); }

  console.log('%cATHOS V36 JOGÁVEL TESTE', 'font-size:20px;color:#55ff55;background:#111;padding:8px');
  for (const f of ['./index.html','./style.css','./app.js','./athos.glb','./manifest.webmanifest','./sw.js']) await head(f);
  const css = await get('./style.css'); const app = await get('./app.js');
  add('Título V36', /V36|JOGÁVEL|JOGAVEL/i.test(document.title + css), document.title);
  add('CSS tem camada V36 jogável', /V36 JOGÁVEL|V36 JOGAVEL|correção sênior de layout/i.test(css), 'camada mobile');
  add('JS tem clearMovementState', /clearMovementState/.test(app), 'anti movimento grudado');
  add('JS joystick robusto usa document pointermove', /document\.addEventListener\('pointermove'/.test(app), 'joystick fora do círculo');
  add('B Poder separado', document.querySelector('#powerBtn[data-action="power"]') !== null, txt(document.getElementById('powerBtn')));
  add('Vulcão não é poder', document.querySelector('[data-world="fire"]')?.dataset.action !== 'power', txt(document.querySelector('[data-world="fire"]')));

  const quiz = document.getElementById('quizBtn'); await tap(quiz,'Quiz'); await sleep(500); add('Quiz abriu', /Quiz|Portais|pergunta/i.test(document.body.innerText), 'texto quiz'); closeModal(); await sleep(200);
  const play = document.getElementById('playBtn') || document.getElementById('heroPlayBtn'); await tap(play,'Jogar Fases'); await sleep(3500);
  add('Three.js após entrar', !!window.THREE, window.THREE ? `REV ${THREE.REVISION}` : 'ausente');
  const canvas = all('canvas').find(visible); if(canvas){ const r=canvas.getBoundingClientRect(); add('Canvas grande', r.width>100 && r.height>100, `${Math.round(r.width)}x${Math.round(r.height)}`); } else add('Canvas grande', false, 'sem canvas');
  const ids=['joystick','moveForwardBtn','moveBackBtn','moveLeftBtn','moveRightBtn','jumpBtn','powerBtn','crouchBtn','sizeBtn','normalBtn','pauseBtn','exitBtn'];
  ids.forEach(id=>add(`#${id}`, !!document.getElementById(id), txt(document.getElementById(id))));
  await hold(document.getElementById('moveForwardBtn'),500,'Fundo');
  await tap(document.getElementById('jumpBtn'),'A Pular');
  await tap(document.getElementById('powerBtn'),'B Poder');
  const stuck = /holding/.test(document.getElementById('moveForwardBtn')?.className || '');
  add('Movimento não ficou grudado após soltar', !stuck, document.getElementById('moveForwardBtn')?.className || '');
  const controls = all('button,.action-btn,.move-btn,.world-chip').filter(visible).filter(el=>!el.closest('#athos-v36-test-panel'));
  let overlaps=0; for(let i=0;i<controls.length;i++){const a=controls[i].getBoundingClientRect(); for(let j=i+1;j<controls.length;j++){const b=controls[j].getBoundingClientRect(); if(!(a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom)&&a.width>20&&b.width>20&&a.height>20&&b.height>20) overlaps++;}}
  add('Sem sobreposição crítica', overlaps===0, `${overlaps} cruzamentos`);
  add('Sem erro JS capturado', errors.length===0, errors.slice(-5).join(' | '));
  console.table(results); window.ATHOS_V36_TEST_RESULTS = results; window.ATHOS_V36_TEST_ERRORS = errors;
  alert(`Teste V36 finalizado. OK: ${results.filter(r=>r.status.includes('OK')).length} Falhas: ${results.filter(r=>r.status.includes('FALHOU')).length} Erros JS: ${errors.length}`);
})();
