(async () => {
  'use strict';
  const VERSION = 'ATHOS_V37_AUDITORIA_TOTAL_TEST_001';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const results = [];
  const errors = [];
  window.addEventListener('error', e => errors.push(e.message || 'Erro JS'));
  window.addEventListener('unhandledrejection', e => errors.push(String(e.reason || 'Promise rejeitada')));
  const all = (s, root=document) => Array.from(root.querySelectorAll(s));
  const visible = el => !!el && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden' && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0;
  const txt = el => !el ? '' : [el.innerText, el.textContent, el.getAttribute('aria-label'), el.id, el.className, el.dataset ? Object.entries(el.dataset).map(([k,v])=>`${k}:${v}`).join(' ') : ''].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  function add(name, ok, detail=''){ results.push({teste:name,status:ok?'✅ OK':'❌ FALHOU',detalhe:String(detail||'')}); console[ok?'log':'warn'](`${ok?'✅ OK':'❌ FALHOU'} ${name}`, detail||''); panel(); }
  function warn(name, detail=''){ results.push({teste:name,status:'⚠️ AVISO',detalhe:String(detail||'')}); console.warn(`⚠️ ${name}`, detail||''); panel(); }
  function panel(){ let p=document.getElementById('athos-v37-test-panel'); if(!p){p=document.createElement('div'); p.id='athos-v37-test-panel'; p.style.cssText='position:fixed;right:10px;top:10px;width:min(540px,calc(100vw - 20px));max-height:84vh;overflow:auto;z-index:99999999;background:rgba(0,0,0,.94);color:#fff;font:13px Arial;border:3px solid #55ff55;border-radius:10px;padding:10px;box-shadow:0 10px 35px rgba(0,0,0,.55)'; document.body.appendChild(p);} const ok=results.filter(r=>r.status.includes('OK')).length, fail=results.filter(r=>r.status.includes('FALHOU')).length, av=results.filter(r=>r.status.includes('AVISO')).length; p.innerHTML=`<b>${VERSION}</b><div>✅ ${ok} ❌ ${fail} ⚠️ ${av} JS:${errors.length}</div>`+results.slice(-55).map(r=>`<div style="border-top:1px solid #444;padding:4px"><b>${r.status}</b> ${r.teste}<br><small>${String(r.detalhe).replace(/[<>&]/g,'')}</small></div>`).join(''); }
  async function get(path){ try{ const r=await fetch(path+'?v37test='+Date.now(),{cache:'no-store'}); return r.ok ? await r.text() : ''; }catch{return '';} }
  async function head(path){ try{ const r=await fetch(path+'?v37test='+Date.now(),{method:'HEAD',cache:'no-store'}); add(`Arquivo ${path}`, r.ok, `HTTP ${r.status}`); }catch(e){ add(`Arquivo ${path}`, false, e.message); } }
  function pointer(el,type,x,y){ if(!el) return; const r=el.getBoundingClientRect(); const cx=x ?? r.left+r.width/2, cy=y ?? r.top+r.height/2; try{el.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:37,pointerType:'touch',clientX:cx,clientY:cy,isPrimary:true}));}catch{} }
  async function tap(el,name){ if(!el){add(`Clique ${name}`,false,'não encontrado');return false;} el.scrollIntoView({block:'center',inline:'center'}); await sleep(60); pointer(el,'pointerdown'); await sleep(80); pointer(el,'pointerup'); el.click(); add(`Clique ${name}`,true,txt(el).slice(0,160)); return true; }
  async function hold(el,ms,name){ if(!el){add(`Segurar ${name}`,false,'não encontrado');return false;} pointer(el,'pointerdown'); await sleep(ms); pointer(el,'pointerup'); add(`Segurar ${name}`,true,txt(el).slice(0,160)); return true; }
  const byText = (re, ex) => all('button,a,[role="button"],.pixel-btn,.action-btn,.move-btn,.world-chip').find(b=>visible(b)&&re.test(txt(b))&&(!ex||!ex.test(txt(b))));
  const modal = () => all('.modal,[role="dialog"],.overlay').find(visible);
  async function closeModal(){ const m=modal(); const b=m && (m.querySelector('#modalClose') || all('button',m).find(x=>/fechar|close|^x$/i.test(txt(x)))); if(b) await tap(b,'Fechar modal'); else document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); await sleep(250); }
  function api(){ return window.ATHOS_TEST_API; }

  console.log('%cATHOS V37 AUDITORIA TOTAL TESTE', 'font-size:20px;color:#55ff55;background:#111;padding:8px');
  await head('./index.html'); await head('./style.css'); await head('./app.js'); await head('./athos.glb'); await head('./manifest.webmanifest'); await head('./sw.js');
  const index = await get('./index.html'); const app = await get('./app.js'); const css = await get('./style.css'); const manifest = await get('./manifest.webmanifest');
  add('Título V37', /V37|Auditoria Total/i.test(document.title + index), document.title);
  add('Manifest V37', /V37|Auditoria Total/i.test(manifest), manifest.slice(0,120));
  add('CSS camada V37', /V37 AUDITORIA TOTAL|jogabilidade mobile/i.test(css), 'camada final');
  add('app.js grande carregado', app.length > 70000, `${app.length} caracteres`);
  add('Sem data-action nos botões de movimento no HTML', !/moveForwardBtn[\s\S]{0,160}data-action|moveBackBtn[\s\S]{0,160}data-action|moveLeftBtn[\s\S]{0,160}data-action|moveRightBtn[\s\S]{0,160}data-action/.test(index), 'movimento só data-move');
  add('Código tem hardStopAllInput', /function hardStopAllInput|hardStopAllInput\(/.test(app), 'limpeza de estado');
  add('Código zera joy.x e joy.z', /joy\.x\s*=\s*0[\s\S]{0,80}joy\.z\s*=\s*0/.test(app), 'sem drift');
  add('requestFullscreen não força mais layout', !/requestFullscreen\(\)/.test(app), 'sem fullscreen forçado');
  add('Quiz 80+ perguntas', ((app.match(/\bq\s*:/g)||[]).length >= 80), `${(app.match(/\bq\s*:/g)||[]).length} perguntas`);
  add('model-viewer existe', !!document.querySelector('model-viewer'), document.querySelector('model-viewer')?.getAttribute('src'));
  add('AR Nativo externo existe', !!document.getElementById('arNativeExternalBtn'), txt(document.getElementById('arNativeExternalBtn')));
  add('B Poder separado por ID', !!document.querySelector('#powerBtn[data-action="power"]'), txt(document.getElementById('powerBtn')));
  add('Vulcão separado por data-world', !!document.querySelector('[data-world="fire"]') && !document.querySelector('[data-world="fire"]').dataset.action, txt(document.querySelector('[data-world="fire"]')));

  const quiz = document.getElementById('quizBtn') || byText(/quiz/i); await tap(quiz,'Abrir Quiz'); await sleep(500);
  const m = modal() || document; const opts = all('button,.quiz-option,.choice,[data-correct]',m).filter(visible).filter(o=>!/fechar|close/i.test(txt(o)));
  add('Quiz abre alternativas reais', opts.length >= 2, `${opts.length} opções`); if(opts[0]) await tap(opts[0],'Responder Quiz'); await sleep(300); await closeModal();
  await sleep(700); if(api()){ const st=api().getInputState(); add('Após modal, input está zerado', st.input.x===0 && st.input.z===0 && st.joy.x===0 && st.joy.z===0 && !st.joy.active, JSON.stringify(st)); }

  const ask = document.getElementById('askBtn') || byText(/falar|perguntar/i); await tap(ask,'Falar com Athos'); await sleep(400); await closeModal();
  await sleep(500); if(api()){ const st=api().getInputState(); add('Após Falar, input continua zerado', st.input.x===0 && st.input.z===0 && st.joy.x===0 && st.joy.z===0 && !st.joy.active, JSON.stringify(st)); }

  const play = document.getElementById('playBtn') || document.getElementById('heroPlayBtn') || byText(/jogar|fases/i,/quiz|falar|brincar/i); await tap(play,'Entrar no jogo'); await sleep(3600);
  add('Three.js carregado após entrar', !!window.THREE, window.THREE ? `REV ${THREE.REVISION}` : 'ausente');
  const canvas=all('canvas').find(visible); if(canvas){ const r=canvas.getBoundingClientRect(); add('Canvas grande', r.width>100 && r.height>100, `${Math.round(r.width)}x${Math.round(r.height)}`);} else add('Canvas visível', false, 'não encontrado');
  ['moveForwardBtn','moveBackBtn','moveLeftBtn','moveRightBtn','jumpBtn','powerBtn','crouchBtn','sizeBtn','normalBtn','pauseBtn','exitBtn','joystick'].forEach(id=>add(`#${id} existe`, !!document.getElementById(id), txt(document.getElementById(id))));
  if(api()){ api().hardStopAllInput(); await sleep(1200); const st=api().getInputState(); const ps=api().getPlayerState(); add('Parado sem tocar: nenhum input preso', st.input.x===0 && st.input.z===0 && st.joy.x===0 && st.joy.z===0 && !st.joy.active && !Object.values(st.moveHold).some(Boolean), JSON.stringify(st)); add('Parado sem tocar: velocidade horizontal quase zero', Math.abs(ps.vx) < 0.08 && Math.abs(ps.vz) < 0.08, JSON.stringify(ps)); }
  await hold(document.getElementById('moveForwardBtn'),500,'Fundo'); await sleep(700); if(api()){ const st=api().getInputState(); const ps=api().getPlayerState(); add('Após soltar Fundo: input zerado', st.input.x===0 && st.input.z===0 && !Object.values(st.moveHold).some(Boolean), JSON.stringify(st)); add('Após soltar Fundo: sem escorregar', Math.abs(ps.vx) < 0.35 && Math.abs(ps.vz) < 0.35, JSON.stringify(ps)); }
  const joy=document.getElementById('joystick'); const ring=joy?.querySelector('.joy-ring') || joy; if(ring){ const r=ring.getBoundingClientRect(); pointer(ring,'pointerdown',r.left+r.width/2,r.top+r.height/2); await sleep(100); pointer(document,'pointermove',r.left+r.width*.84,r.top+r.height*.20); await sleep(350); pointer(document,'pointerup',r.left+r.width*.84,r.top+r.height*.20); await sleep(900); if(api()){ const st=api().getInputState(); const ps=api().getPlayerState(); add('Após soltar joystick: joy zerado', st.joy.x===0 && st.joy.z===0 && !st.joy.active, JSON.stringify(st)); add('Após soltar joystick: sem drift', Math.abs(ps.vx) < 0.45 && Math.abs(ps.vz) < 0.45, JSON.stringify(ps)); }}
  await tap(document.getElementById('jumpBtn'),'A Pular'); await tap(document.getElementById('powerBtn'),'B Poder'); await hold(document.getElementById('crouchBtn'),300,'Y Abaixar');
  const controls = all('button,.action-btn,.move-btn,.world-chip').filter(visible).filter(el=>!el.closest('#athos-v37-test-panel'));
  let overlaps=0; for(let i=0;i<controls.length;i++){ const a=controls[i].getBoundingClientRect(); for(let j=i+1;j<controls.length;j++){ const b=controls[j].getBoundingClientRect(); const inter=!(a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom); if(inter && a.width>20 && b.width>20 && a.height>20 && b.height>20) overlaps++; }}
  add('Sem sobreposição crítica de botões', overlaps===0, `${overlaps} cruzamentos`);
  await sleep(800); add('Sem erro JavaScript capturado', errors.length === 0, errors.slice(-5).join(' | '));
  console.log('%cRELATÓRIO FINAL V37', 'font-size:18px;color:#ffcc00;background:#111;padding:8px'); console.table(results); window.ATHOS_V37_TEST_RESULTS=results; window.ATHOS_V37_TEST_ERRORS=errors;
  alert(`Teste V37 finalizado. OK: ${results.filter(r=>r.status.includes('OK')).length} Falhas: ${results.filter(r=>r.status.includes('FALHOU')).length} Avisos: ${results.filter(r=>r.status.includes('AVISO')).length} Erros JS: ${errors.length}`);
})();
