(async () => {
  'use strict';
  const VERSION = 'ATHOS_V43_QUIZ_STUDIO_RENDER2_TEST_001';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const results = []; const errors = [];
  window.addEventListener('error', e => errors.push(e.message || 'Erro JS'));
  window.addEventListener('unhandledrejection', e => errors.push(String(e.reason || 'Promise rejeitada')));
  const all = (s, r=document) => Array.from(r.querySelectorAll(s));
  const visible = el => !!el && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden' && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0;
  const txt = el => !el ? '' : [el.innerText, el.textContent, el.getAttribute('aria-label'), el.id, el.className, el.dataset ? Object.entries(el.dataset).map(([k,v])=>`${k}:${v}`).join(' ') : ''].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  function add(name, ok, detail=''){ results.push({teste:name,status:ok?'✅ OK':'❌ FALHOU',detalhe:String(detail||'')}); console[ok?'log':'warn'](`${ok?'✅ OK':'❌ FALHOU'} ${name}`, detail||''); panel(); }
  function panel(){ let p=document.getElementById('athos-v43-test-panel'); if(!p){p=document.createElement('div'); p.id='athos-v43-test-panel'; p.style.cssText='position:fixed;right:10px;top:10px;width:min(580px,calc(100vw - 20px));max-height:84vh;overflow:auto;z-index:99999999;background:rgba(0,0,0,.94);color:#fff;font:13px Arial;border:3px solid #55ff55;border-radius:10px;padding:10px;box-shadow:0 10px 35px rgba(0,0,0,.55)'; document.body.appendChild(p);} const ok=results.filter(r=>r.status.includes('OK')).length, fail=results.filter(r=>r.status.includes('FALHOU')).length; p.innerHTML=`<b>${VERSION}</b><div>✅ ${ok} ❌ ${fail} JS:${errors.length}</div>`+results.slice(-65).map(r=>`<div style="border-top:1px solid #444;padding:4px"><b>${r.status}</b> ${r.teste}<br><small>${String(r.detalhe).replace(/[<>&]/g,'')}</small></div>`).join(''); }
  async function fetchText(path){ try{ const r=await fetch(path+'?v43test='+Date.now(),{cache:'no-store'}); return r.ok ? await r.text() : ''; }catch{return '';} }
  async function checkFile(path){ try{ const r=await fetch(path+'?v43test='+Date.now(),{method:'HEAD',cache:'no-store'}); add(`Arquivo ${path}`, r.ok, `HTTP ${r.status}`); }catch(e){ add(`Arquivo ${path}`, false, e.message); } }
  function pointer(el,type){ const r=el.getBoundingClientRect(); const x=r.left+r.width/2, y=r.top+r.height/2; try{el.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:43,pointerType:'touch',clientX:x,clientY:y,isPrimary:true}));}catch{} }
  async function tap(el,name){ if(!el){add(`Clique ${name}`,false,'não encontrado');return false;} el.scrollIntoView({block:'center',inline:'center'}); await sleep(80); pointer(el,'pointerdown'); await sleep(80); pointer(el,'pointerup'); el.click(); add(`Clique ${name}`,true,txt(el).slice(0,180)); return true; }
  function modal(){ return all('.modal,[role="dialog"],.overlay').find(visible); }
  async function closeModal(){ const m=modal(); const b=m && (m.querySelector('#modalClose') || all('button',m).find(x=>/fechar|close/i.test(txt(x)))); if(b) await tap(b,'Fechar modal'); await sleep(250); }
  function api(){ return window.ATHOS_TEST_API || {}; }
  console.log('%cATHOS V43 QUIZ PRO + STUDIO + RENDER2 TESTE', 'font-size:20px;color:#55ff55;background:#111;padding:8px');
  await checkFile('./index.html'); await checkFile('./style.css'); await checkFile('./app.js'); await checkFile('./athos.glb'); await checkFile('./manifest.webmanifest'); await checkFile('./sw.js');
  const app = await fetchText('./app.js'); const index = await fetchText('./index.html'); const css = await fetchText('./style.css');
  add('Título V43', /V43|QUIZ PRO|ESTÚDIO 3D|ESTUDIO 3D/i.test(document.title + index), document.title);
  add('Camada V43 Quiz Pro existe', /quiz-pro|quizRounds|V43_STUDIO|roundSize/.test(app), 'quiz rodada');
  add('Estúdio 3D HTML existe', !!document.getElementById('studioControls') && !!document.getElementById('studioArBtn') && !!document.getElementById('studioFullscreenBtn'), 'controles do estúdio');
  add('Render Premium 2 existe', /applyV43RenderPremium2|addV43SetDressing|addV43PortalAura|V43_RENDER_PREMIUM_2/.test(app), 'render2');
  add('CSS V43 existe', /studio-controls|quiz-pro|studio-fullscreen/.test(css), 'css quiz/studio');
  add('Quiz/Falar continuam fora do controle do jogo', !/id="quizActionBtn"|id="askActionBtn"|data-action="quiz"|data-action="ask"/.test(index), 'controle limpo');
  add('AR seguro V42 preservado', /AR_SAFE|V42_AR_SAFE_NO_DRIFT|getARSafety/.test(app), 'ar safe');
  add('Game feel preservado', /GAME_FEEL|safePointerCapture|platformSnap/.test(app), 'v41.1');
  add('Render V40 preservado', /applyV40RenderPass|polishAthosMaterial/.test(app), 'v40');
  add('API V43 existe', !!(api().getQuizPro && api().getStudioState && api().getV43Design), 'ATHOS_TEST_API');
  add('Quiz Pro parâmetros', api().getQuizPro && api().getQuizPro().roundSize === 5, JSON.stringify(api().getQuizPro && api().getQuizPro()));
  await tap(document.querySelector('[data-studio-rotate]'), 'Studio girar'); await tap(document.querySelector('[data-studio-zoom]'), 'Studio zoom'); await tap(document.querySelector('[data-studio-pose="power"]'), 'Studio pose poder');
  const st = api().getStudioState ? api().getStudioState() : null; add('Studio altera estado', st && st.pose === 'power', JSON.stringify(st));
  const quiz = document.getElementById('quizBtn'); await tap(quiz,'Abrir Quiz Pro'); await sleep(400);
  let m = modal(); add('Quiz Pro abre modal', !!m && /Pergunta 1\/5|Rodada Pro/i.test(txt(m)), txt(m).slice(0,220));
  const firstOpt = all('.quiz-option', m).filter(visible)[0]; await tap(firstOpt,'Responder pergunta 1'); await sleep(250);
  m = modal(); add('Quiz NÃO fecha após responder 1 pergunta', !!m && visible(m) && /Próxima pergunta|Ver resultado/i.test(txt(m)), txt(m).slice(0,220));
  const next = document.getElementById('quizNextBtn'); await tap(next,'Próxima pergunta'); await sleep(250);
  m = modal(); add('Quiz avança para pergunta 2/5', !!m && /Pergunta 2\/5/i.test(txt(m)), txt(m).slice(0,220));
  await closeModal();
  const play = document.getElementById('playBtn') || document.getElementById('heroPlayBtn'); await tap(play,'Entrar no jogo'); await sleep(3900);
  add('Three.js carregado', !!window.THREE, window.THREE ? `REV ${THREE.REVISION}` : 'ausente');
  const d43 = api().getV43Design ? api().getV43Design() : null; add('Fase tem render V43', d43 && d43.markers >= 3, JSON.stringify(d43));
  const realBtn = document.querySelector('[data-world="real"]'); await tap(realBtn,'Trocar para Real/AR'); await sleep(900);
  const ar = api().getARSafety ? api().getARSafety() : null; add('AR seguro preservado', ar && /V42_AR_SAFE/.test(ar.label||''), JSON.stringify(ar));
  add('Sem erro JavaScript capturado', errors.length === 0, errors.slice(-6).join(' | '));
  console.log('%cRELATÓRIO FINAL V43', 'font-size:18px;color:#ffcc00;background:#111;padding:8px'); console.table(results); window.ATHOS_V43_TEST_RESULTS=results; window.ATHOS_V43_TEST_ERRORS=errors;
  alert(`Teste V43 finalizado.\nOK: ${results.filter(r=>r.status.includes('OK')).length}\nFalhas: ${results.filter(r=>r.status.includes('FALHOU')).length}\nErros JS: ${errors.length}`);
})();
