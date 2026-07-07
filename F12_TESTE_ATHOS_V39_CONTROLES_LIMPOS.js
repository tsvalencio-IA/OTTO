(async () => {
  'use strict';
  const VERSION = 'ATHOS_V39_CONTROLES_LIMPOS_TEST_001';
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const results = [];
  const errors = [];
  window.addEventListener('error', e => errors.push(e.message || 'Erro JS'));
  window.addEventListener('unhandledrejection', e => errors.push(String(e.reason || 'Promise rejeitada')));
  const all = (s, root=document) => Array.from(root.querySelectorAll(s));
  const visible = el => !!el && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden' && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0;
  const txt = el => !el ? '' : [el.innerText, el.textContent, el.getAttribute('aria-label'), el.id, el.className, el.dataset ? Object.entries(el.dataset).map(([k,v])=>`${k}:${v}`).join(' ') : ''].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  function add(name, ok, detail='') { results.push({teste:name,status:ok?'✅ OK':'❌ FALHOU',detalhe:String(detail||'')}); console[ok?'log':'warn'](`${ok?'✅ OK':'❌ FALHOU'} ${name}`, detail || ''); panel(); }
  function warn(name, detail='') { results.push({teste:name,status:'⚠️ AVISO',detalhe:String(detail||'')}); console.warn(`⚠️ ${name}`, detail || ''); panel(); }
  function panel(){ let p=document.getElementById('athos-v39-test-panel'); if(!p){p=document.createElement('div'); p.id='athos-v39-test-panel'; p.style.cssText='position:fixed;right:10px;top:10px;width:min(520px,calc(100vw - 20px));max-height:84vh;overflow:auto;z-index:99999999;background:rgba(0,0,0,.94);color:#fff;font:13px Arial;border:3px solid #55ff55;border-radius:10px;padding:10px;box-shadow:0 10px 35px rgba(0,0,0,.55)'; document.body.appendChild(p);} const ok=results.filter(r=>r.status.includes('OK')).length, fail=results.filter(r=>r.status.includes('FALHOU')).length, av=results.filter(r=>r.status.includes('AVISO')).length; p.innerHTML=`<b>${VERSION}</b><div>✅ ${ok} ❌ ${fail} ⚠️ ${av} JS:${errors.length}</div>`+results.slice(-50).map(r=>`<div style="border-top:1px solid #444;padding:4px"><b>${r.status}</b> ${r.teste}<br><small>${String(r.detalhe).replace(/[<>&]/g,'')}</small></div>`).join(''); }
  async function fetchText(path){ try{ const r=await fetch(path+'?v39test='+Date.now(),{cache:'no-store'}); return r.ok ? await r.text() : ''; }catch{return '';} }
  async function head(path){ try{ const r=await fetch(path+'?v39test='+Date.now(),{method:'HEAD',cache:'no-store'}); add(`Arquivo ${path}`, r.ok, `HTTP ${r.status}`); return r.ok; }catch(e){ add(`Arquivo ${path}`, false, e.message); return false; } }
  function findButton(re, ex){ return all('button,a,[role="button"],.pixel-btn,.action-btn,.move-btn,.world-chip').find(b=>visible(b)&&re.test(txt(b))&&(!ex||!ex.test(txt(b)))); }
  function pointer(el,type){ const r=el.getBoundingClientRect(); const x=r.left+r.width/2, y=r.top+r.height/2; try{ el.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:39,pointerType:'touch',clientX:x,clientY:y,isPrimary:true})); }catch{} }
  async function tap(el,name){ if(!el){add(`Clique ${name}`,false,'não encontrado');return false;} el.scrollIntoView({block:'center',inline:'center'}); await sleep(80); pointer(el,'pointerdown'); await sleep(80); pointer(el,'pointerup'); el.click(); add(`Clique ${name}`,true,txt(el).slice(0,160)); return true; }

  console.log('%cATHOS V39 CONTROLES LIMPOS TESTE', 'font-size:20px;color:#55ff55;background:#111;padding:8px');
  await head('./index.html'); await head('./style.css'); await head('./app.js'); await head('./athos.glb'); await head('./manifest.webmanifest'); await head('./sw.js');
  const index = await fetchText('./index.html');
  const css = await fetchText('./style.css');
  const app = await fetchText('./app.js');
  add('Título V39', /V39|CONTROLES LIMPOS/i.test(document.title + index), document.title);
  add('Quiz existe no lobby', !!document.getElementById('quizBtn'), txt(document.getElementById('quizBtn')));
  add('Falar existe no lobby', !!document.getElementById('askBtn'), txt(document.getElementById('askBtn')));
  add('Quiz/Falar NÃO existem no action-grid do HTML', !/action-grid[\s\S]*data-action=["']quiz["'][\s\S]*<\/div>|action-grid[\s\S]*data-action=["']ask["'][\s\S]*<\/div>/i.test(index), 'verificando index.html');
  add('CSS esconde quiz/falar no controle se cache antigo aparecer', /data-action="quiz"[\s\S]*display\s*:\s*none|data-action="ask"[\s\S]*display\s*:\s*none/i.test(css), 'regra de segurança');
  add('handleAction não abre quiz/falar no controle do jogo', /a==='quiz' \|\| a==='ask'\) return/.test(app), 'verificando app.js');

  const play = document.getElementById('playBtn') || document.getElementById('heroPlayBtn') || findButton(/jogar|fases/i,/quiz|falar|brincar/i);
  await tap(play,'Entrar no jogo');
  await sleep(3500);
  const canvas = all('canvas').find(visible);
  if(canvas){ const r=canvas.getBoundingClientRect(); add('Canvas grande', r.width > 100 && r.height > 100, `${Math.round(r.width)}x${Math.round(r.height)}`); } else add('Canvas visível', false, 'não encontrado');
  const actionGrid = document.querySelector('.game .action-grid') || document.querySelector('.action-grid');
  const inGameButtons = actionGrid ? all('button', actionGrid).filter(visible) : [];
  add('Controle do jogo tem 9 botões visíveis', inGameButtons.length === 9, `${inGameButtons.length}: ${inGameButtons.map(b=>txt(b).split(' ')[0]).join(', ')}`);
  add('Quiz NÃO aparece no controle durante jogo', !inGameButtons.some(b => /quiz|🧠/i.test(txt(b)) || b.dataset.action === 'quiz'), inGameButtons.map(txt).join(' | '));
  add('Falar NÃO aparece no controle durante jogo', !inGameButtons.some(b => /falar|perguntar|💬/i.test(txt(b)) || b.dataset.action === 'ask'), inGameButtons.map(txt).join(' | '));
  ['jumpBtn','powerBtn','crouchBtn','sizeBtn','normalBtn','pauseBtn','exitBtn','moveForwardBtn','moveBackBtn','moveLeftBtn','moveRightBtn','joystick'].forEach(id => add(`#${id} existe`, !!document.getElementById(id), txt(document.getElementById(id))));
  await sleep(1000);
  add('Sem erro JS capturado', errors.length === 0, errors.slice(-5).join(' | '));
  console.log('%cRELATÓRIO FINAL V39', 'font-size:18px;color:#ffcc00;background:#111;padding:8px');
  console.table(results);
  window.ATHOS_V39_TEST_RESULTS = results;
  window.ATHOS_V39_TEST_ERRORS = errors;
  alert(`Teste V39 finalizado.\nOK: ${results.filter(r=>r.status.includes('OK')).length}\nFalhas: ${results.filter(r=>r.status.includes('FALHOU')).length}\nAvisos: ${results.filter(r=>r.status.includes('AVISO')).length}\nErros JS: ${errors.length}`);
})();
