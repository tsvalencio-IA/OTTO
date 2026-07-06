(async () => {
  'use strict';
  const VERSION = 'ATHOS_V34_FINAL_F12_001';
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const rows = [];
  const errors = [];
  window.addEventListener('error', e => errors.push(e.message || String(e.error || 'Erro JS')));
  window.addEventListener('unhandledrejection', e => errors.push(String(e.reason?.message || e.reason || 'Promise rejeitada')));
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
  const visible = (el) => {
    if (!el) return false;
    const st = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return st.display !== 'none' && st.visibility !== 'hidden' && st.opacity !== '0' && r.width > 0 && r.height > 0;
  };
  const label = (el) => !el ? '' : [el.innerText, el.textContent, el.getAttribute('aria-label'), el.id, el.className, el.dataset ? Object.entries(el.dataset).map(([k,v]) => `${k}:${v}`).join(' ') : ''].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  const add = (teste, ok, detalhe='') => { rows.push({ teste, status: ok ? '✅ OK' : '❌ FALHOU', detalhe: String(detalhe || '') }); console[ok?'log':'warn'](`${ok?'✅':'❌'} ${teste}`, detalhe || ''); render(); };
  const warn = (teste, detalhe='') => { rows.push({ teste, status: '⚠️ AVISO', detalhe: String(detalhe || '') }); console.warn(`⚠️ ${teste}`, detalhe || ''); render(); };
  const esc = (s) => String(s||'').replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
  function render(){
    let panel = $('#athos-v34-test-panel');
    if(!panel){
      panel = document.createElement('div'); panel.id='athos-v34-test-panel';
      panel.style.cssText='position:fixed;right:10px;top:10px;width:min(500px,calc(100vw - 20px));max-height:84vh;overflow:auto;z-index:99999999;background:rgba(0,0,0,.94);color:#fff;font:13px Arial,sans-serif;border:3px solid #55ff55;border-radius:10px;padding:10px;box-shadow:0 10px 35px rgba(0,0,0,.55)';
      document.body.appendChild(panel);
    }
    const ok=rows.filter(r=>r.status.includes('OK')).length, fail=rows.filter(r=>r.status.includes('FALHOU')).length, av=rows.filter(r=>r.status.includes('AVISO')).length;
    panel.innerHTML = `<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:8px"><b>${VERSION}</b><button onclick="document.getElementById('athos-v34-test-panel').remove()">X</button></div><div style="margin-bottom:8px">✅ ${ok} &nbsp; ❌ ${fail} &nbsp; ⚠️ ${av} &nbsp; JS: ${errors.length}</div>${rows.slice(-45).map(r=>`<div style="border-top:1px solid rgba(255,255,255,.18);padding-top:5px"><b>${r.status}</b> ${esc(r.teste)}<br><small style="color:#ccc">${esc(r.detalhe)}</small></div>`).join('')}`;
  }
  async function fetchOk(path){ try { const r = await fetch(path + (path.includes('?')?'&':'?') + 'f12=' + Date.now(), { cache:'no-store' }); return { ok:r.ok, status:r.status }; } catch(e){ return { ok:false, status:e.message }; } }
  function pointer(el,type){ if(!el)return; const r=el.getBoundingClientRect(); const x=r.left+r.width/2, y=r.top+r.height/2; try{el.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:88,pointerType:'touch',isPrimary:true,clientX:x,clientY:y}));}catch{} if(type==='pointerdown') try{el.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,cancelable:true,clientX:x,clientY:y}));}catch{} if(type==='pointerup') try{el.dispatchEvent(new MouseEvent('mouseup',{bubbles:true,cancelable:true,clientX:x,clientY:y}));}catch{} }
  async function tap(el,name){ if(!el){add(`Clique: ${name}`,false,'não encontrado');return false;} try{el.scrollIntoView({block:'center',inline:'center'});}catch{} await sleep(80); pointer(el,'pointerdown'); await sleep(80); pointer(el,'pointerup'); try{el.click();}catch{} add(`Clique: ${name}`,true,label(el).slice(0,140)); return true; }
  async function hold(el,ms,name){ if(!el){add(`Segurar: ${name}`,false,'não encontrado');return false;} try{el.scrollIntoView({block:'center',inline:'center'});}catch{} await sleep(80); pointer(el,'pointerdown'); await sleep(ms); pointer(el,'pointerup'); add(`Segurar: ${name}`,true,label(el).slice(0,140)); return true; }

  console.log('%cATHOS V34 FINAL TESTE INICIADO','font-size:20px;color:#55ff55;background:#111;padding:8px');
  for (const f of ['./index.html','./style.css','./app.js','./athos.glb','./manifest.webmanifest','./sw.js']) { const r=await fetchOk(f); add(`Arquivo ${f}`, r.ok, `HTTP/status ${r.status}`); }
  add('model-viewer tag existe', !!$('model-viewer'), $('model-viewer')?.getAttribute('src') || 'sem tag');
  add('AR Nativo no model-viewer', !!$('model-viewer[ar][src="./athos.glb"]'), 'model-viewer[ar][src]');
  add('Botão AR Nativo externo existe', !!$('#arNativeExternalBtn'), label($('#arNativeExternalBtn')));
  add('Botão Jogar Fases existe', !!$('#playBtn[data-play="missions"]'), label($('#playBtn')));
  add('Botão Brincar Livre existe', !!$('#freeBtn[data-play="free"]'), label($('#freeBtn')));
  add('Botão Quiz existe', !!$('#quizBtn'), label($('#quizBtn')));
  add('Botão Falar existe', !!$('#askBtn'), label($('#askBtn')));
  add('Botão Coleção existe', !!$('#collectionBtn'), label($('#collectionBtn')));
  add('Joystick existe', !!$('#joystick'), label($('#joystick')));
  const controls = [
    ['▲ Fundo','#moveForwardBtn[data-action="forward"][data-move="forward"]'], ['▼ Voltar','#moveBackBtn[data-action="back"][data-move="back"]'], ['◀ Esq','#moveLeftBtn[data-action="left"][data-move="left"]'], ['▶ Dir','#moveRightBtn[data-action="right"][data-move="right"]'], ['A Pular','#jumpBtn[data-action="jump"]'], ['B Poder','#powerBtn[data-action="power"]'], ['Y Abaixar','#crouchBtn[data-action="crouch"]'], ['X Tamanho','#sizeBtn[data-action="size"]'], ['N Normal','#normalBtn[data-action="normal"]'], ['Pausa','#pauseBtn[data-action="pause"]'], ['Sair','#exitBtn[data-action="exit"]']
  ];
  controls.forEach(([n,s]) => add(`Controle ${n}`, !!$(s), s));
  add('B Poder não é botão de mundo', !!$('#powerBtn[data-action="power"]') && !$('#powerBtn')?.dataset.world, label($('#powerBtn')));
  add('Botões de mundo usam data-world e não data-action', $$('.world-chip').length >= 6 && $$('.world-chip').every(b => b.dataset.world && !b.dataset.action), `${$$('.world-chip').length} mundos`);
  const play = $('#playBtn[data-play="missions"]'); await tap(play, 'Entrar em Jogar Fases 3D'); await sleep(4500);
  add('Three.js carregado', !!window.THREE, window.THREE ? `REV ${THREE.REVISION}` : 'ausente');
  add('GLTFLoader carregado', !!(window.THREE && THREE.GLTFLoader), 'THREE.GLTFLoader');
  const api = window.ATHOS_TEST_API; add('ATHOS_TEST_API existe', !!api, api ? Object.keys(api).join(', ') : 'ausente');
  add('Quiz tem no mínimo 80 perguntas', !!api && api.getQuizCount() >= 80, api ? String(api.getQuizCount()) : 'sem API');
  add('Fases mínimas existem', !!api && api.getLevelCount() >= 7, api ? String(api.getLevelCount()) : 'sem API');
  const canvas = $('#three-canvas'); add('Canvas visível e maior que 100x100', !!canvas && canvas.clientWidth > 100 && canvas.clientHeight > 100, canvas ? `${canvas.clientWidth}x${canvas.clientHeight}` : 'sem canvas');
  add('HUD completo existe', !!$('#hudHearts') && !!$('#hudXP') && !!$('#hudCrystals') && !!$('#hudEnemies') && !!$('#objectiveCard'), 'vida/xp/cristais/inimigos/objetivo');
  await hold($('#moveForwardBtn'), 450, '▲ Fundo'); await hold($('#moveLeftBtn'), 260, '◀ Esq'); await hold($('#moveRightBtn'), 260, '▶ Dir'); await hold($('#moveBackBtn'), 260, '▼ Voltar');
  await tap($('#jumpBtn'), 'A Pular'); await tap($('#powerBtn'), 'B Poder'); await tap($('#crouchBtn'), 'Y Abaixar'); await tap($('#sizeBtn'), 'X Tamanho'); await tap($('#normalBtn'), 'N Normal');
  pointer($('#moveForwardBtn'),'pointerdown'); await sleep(120); await tap($('#jumpBtn'), 'Combo ▲ + A'); await sleep(350); pointer($('#moveForwardBtn'),'pointerup');
  pointer($('#moveForwardBtn'),'pointerdown'); await sleep(120); await tap($('#powerBtn'), 'Combo ▲ + B Poder'); await sleep(350); pointer($('#moveForwardBtn'),'pointerup');
  await tap($('#quizBtn'), 'Abrir Quiz'); await sleep(400); add('Quiz abre alternativas com data-answer/data-correct', $$('.quiz-option[data-answer][data-correct]').length >= 3, `${$$('.quiz-option[data-answer][data-correct]').length} alternativas`); await tap($('#modalClose'), 'Fechar Quiz'); await sleep(200);
  await tap($('#askBtn'), 'Abrir Falar'); await sleep(250); const inp=$('#askInput'); if(inp){ inp.value='portal'; inp.dispatchEvent(new Event('input',{bubbles:true})); await tap($('#askSend'),'Enviar Falar'); await sleep(300); } add('Falar com Athos respondeu', ($('#askAnswer')?.textContent || '').length > 20, ($('#askAnswer')?.textContent || '').slice(0,120)); await tap($('#modalClose'),'Fechar Falar');
  localStorage.setItem('athos_v34_f12_probe','ok'); add('localStorage grava', localStorage.getItem('athos_v34_f12_probe')==='ok'); localStorage.removeItem('athos_v34_f12_probe');
  const btns = $$('.action-grid button,.direction-buttons button').filter(visible); let overlap=false; for(let i=0;i<btns.length;i++){const a=btns[i].getBoundingClientRect(); for(let j=i+1;j<btns.length;j++){const b=btns[j].getBoundingClientRect(); if(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top) overlap=true; }} add('Controles sem sobreposição crítica', !overlap, `${btns.length} botões`);
  add('Sem erros JS capturados', errors.length === 0 && !(window.__athosErrors && window.__athosErrors.length), (errors.concat(window.__athosErrors||[])).join(' | '));
  const fail = rows.filter(r => r.status.includes('FALHOU'));
  console.log('%cRELATÓRIO FINAL ATHOS V34', 'font-size:18px;color:#ffcc00;background:#111;padding:8px'); console.table(rows);
  alert(`Teste V34 finalizado.\nOK: ${rows.length - fail.length}\nFalhas: ${fail.length}\nErros JS: ${errors.length}\nVeja a tabela no Console.`);
  window.ATHOS_V34_TEST_RESULTS = rows;
  return { ok: fail.length === 0, rows, errors };
})();
