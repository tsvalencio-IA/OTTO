(async()=>{
'use strict';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const results=[], errors=[];
window.__athosErrors=window.__athosErrors||[];
window.addEventListener('error',e=>{const m=e.message||'Erro JS'; errors.push(m); window.__athosErrors.push(m);});
window.addEventListener('unhandledrejection',e=>{const m=String(e.reason||'Promise rejeitada'); errors.push(m); window.__athosErrors.push(m);});
const $=s=>document.querySelector(s);
const all=s=>Array.from(document.querySelectorAll(s));
const visible=el=>!!el&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'&&el.getBoundingClientRect().width>0&&el.getBoundingClientRect().height>0;
const txt=el=>!el?'':[el.innerText,el.textContent,el.id,el.className,el.dataset?Object.entries(el.dataset).map(([k,v])=>`${k}:${v}`).join(' '):''].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
function add(name,ok,detail=''){results.push({teste:name,status:ok?'✅ OK':'❌ FALHOU',detalhe:String(detail||'')});console[ok?'log':'warn'](`${ok?'✅ OK':'❌ FALHOU'} ${name}`,detail||'');panel();}
function panel(){let p=$('#athos-v48-panel');if(!p){p=document.createElement('div');p.id='athos-v48-panel';p.style.cssText='position:fixed;right:10px;top:10px;width:min(600px,calc(100vw - 20px));max-height:82vh;overflow:auto;z-index:99999999;background:rgba(0,0,0,.94);color:#fff;font:13px Arial;border:3px solid #55ff55;border-radius:10px;padding:10px';document.body.appendChild(p)}const ok=results.filter(r=>r.status.includes('OK')).length,fail=results.filter(r=>r.status.includes('FALHOU')).length;p.innerHTML=`<b>ATHOS V48 RENDER-ALVO 10/10</b><div>✅ ${ok} ❌ ${fail} JS:${errors.length}</div>`+results.slice(-80).map(r=>`<div style="border-top:1px solid #444;padding:4px"><b>${r.status}</b> ${r.teste}<br><small>${r.detalhe.replace(/[<>&]/g,'')}</small></div>`).join('')}
async function fetchText(path){try{const r=await fetch(path+'?v48test='+Date.now(),{cache:'no-store'});return r.ok?await r.text():''}catch{return''}}
async function head(path){try{const r=await fetch(path+'?v48test='+Date.now(),{method:'HEAD',cache:'no-store'});add(`Arquivo ${path}`,r.ok,`HTTP ${r.status}`)}catch(e){add(`Arquivo ${path}`,false,e.message)}}
function pointer(el,type,dx=0,dy=0,id=4800){if(!el)return;const r=el.getBoundingClientRect();try{el.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:id,pointerType:'touch',clientX:r.left+r.width/2+dx,clientY:r.top+r.height/2+dy,isPrimary:true}))}catch{}}
async function tap(el,name){if(!el){add(`Clique ${name}`,false,'não encontrado');return false}el.scrollIntoView({block:'center',inline:'center'});await sleep(80);pointer(el,'pointerdown');await sleep(70);pointer(el,'pointerup');el.click();add(`Clique ${name}`,true,txt(el).slice(0,150));return true}
function overlap(a,b){const r1=a.getBoundingClientRect(),r2=b.getBoundingClientRect();return !(r1.right<=r2.left||r2.right<=r1.left||r1.bottom<=r2.top||r2.bottom<=r1.top)}
console.log('%cATHOS V48 RENDER-ALVO 10/10','font-size:20px;color:#55ff55;background:#111;padding:8px');
for(const f of ['./index.html','./style.css','./app.js','./athos.glb','./manifest.webmanifest','./sw.js','./assets/render-v48/v48-render-target.js','./assets/render-v48/v48-render-target.css','./assets/render-v48/v48-render-config.json','./F12_TESTE_ATHOS_GAMEPLAY_ENGINE_10.js']) await head(f);
const app=await fetchText('./app.js'), index=await fetchText('./index.html'), css=await fetchText('./assets/render-v48/v48-render-target.css'), rjs=await fetchText('./assets/render-v48/v48-render-target.js');
add('Título V48',/V48|RENDER ALVO|10\/10/i.test(document.title+index),document.title);
add('Módulo V48 existe',!!window.ATHOS_V48_RENDER_TARGET,window.ATHOS_V48_RENDER_TARGET?.version||'ausente');
add('Integração app.js V48 existe',/installV48Render|rebuildV48Render|updateV48Render|getV48Render/.test(app),'install/rebuild/update/status');
add('Render V48 shader-safe',/textureSamplers:0|shaderSafe:true|V48_RENDER_TARGET_GROUP/.test(rjs),'sem texturas pesadas no shader');
add('CSS V48 alvo aplicado',/v48-target-active|right-zone|action-grid|world-strip/.test(css),'skin alvo + controles');
add('IDs preservados',/id="powerBtn"[\s\S]*data-action="power"/.test(index)&&/data-world="real"/.test(index)&&!/quizActionBtn|askActionBtn/.test(index),'B Poder, Real, sem Quiz/Falar no controle');
await tap($('#playBtn')||$('#heroPlayBtn'),'Entrar no jogo');
await sleep(4300);
add('Three.js carregado',!!window.THREE,window.THREE?`REV ${THREE.REVISION}`:'ausente');
const api=window.ATHOS_TEST_API||{};
const st=api.getV48Render?.() || window.ATHOS_V48_RENDER_TARGET?.getStatus?.();
add('V48 instalado',st&&st.installed===true,JSON.stringify(st||{}));
add('V48 criou cenário rico',st&&st.hasGroup===true&&Number(st.objects||0)>120,JSON.stringify(st||{}));
add('V48 sem textura pesada',st&&st.shaderSafe===true&&Number(st.textureSamplers||99)===0,JSON.stringify(st||{}));
add('Body com V48 ativo',document.body.classList.contains('v48-target-active'),'body.v48-target-active');
const real=$('.game.active .world-chip[data-world="real"]');
add('Real visível',visible(real),real?`${Math.round(real.getBoundingClientRect().width)}x${Math.round(real.getBoundingClientRect().height)} ${txt(real)}`:'ausente');
const joystick=$('.game.active #joystick');
const btns=all('.game.active .action-grid .action-btn').filter(visible);
let badPairs=[]; for(let i=0;i<btns.length;i++){for(let j=i+1;j<btns.length;j++){if(overlap(btns[i],btns[j])) badPairs.push(`${txt(btns[i]).slice(0,12)} x ${txt(btns[j]).slice(0,12)}`)}}
add('Botões não sobrepostos',badPairs.length===0,badPairs.join(' | ')||`${btns.length} botões separados`);
add('Joystick visível e separado',visible(joystick)&&!btns.some(b=>overlap(joystick,b)),joystick?`${Math.round(joystick.getBoundingClientRect().width)}x${Math.round(joystick.getBoundingClientRect().height)}`:'ausente');
api.resetAllInputs?.(); let p0=api.getPlayerState?.(); await sleep(450); let p1=api.getPlayerState?.();
add('Athos parado não se move',p0&&p1&&Math.abs((p1.x-p0.x)||0)<.08&&Math.abs((p1.z-p0.z)||0)<.08,JSON.stringify({antes:p0,depois:p1}));
api.jump?.(); await sleep(120); let pj=api.getPlayerState?.(); add('Pulo responde',pj&&(pj.vy>0||pj.y>(p0?.y||0)+.05),JSON.stringify(pj||{}));
api.power?.(); await sleep(150); const gs=api.getGameplayState?.(); add('B Poder responde',gs&&(gs.fireballs>0||gs.powerCooldownMs>0),JSON.stringify(gs||{}));
const beforeErrors=errors.length; await tap(real,'Real/AR protegido'); await sleep(1000);
const ar=api.getARSafety?.(); add('AR sem câmera fake',ar&&ar.fakeCamera===false&&ar.realBg===false,JSON.stringify(ar||{}));
const arP1=api.getPlayerState?.(); await sleep(650); const arP2=api.getPlayerState?.(); add('Real não move Athos',arP1&&arP2&&Math.abs((arP2.x-arP1.x)||0)<.08&&Math.abs((arP2.z-arP1.z)||0)<.08,JSON.stringify({before:arP1,after:arP2}));
add('Clique Real sem erro novo',errors.length===beforeErrors,errors.slice(beforeErrors).join(' | ')||'sem erro novo');
add('Sem erro JavaScript capturado',errors.length===0,errors.slice(-5).join(' | '));
console.table(results); window.ATHOS_V48_TEST_RESULTS=results; window.ATHOS_V48_TEST_ERRORS=errors;
alert(`Teste V48 finalizado.\nOK: ${results.filter(r=>r.status.includes('OK')).length}\nFalhas: ${results.filter(r=>r.status.includes('FALHOU')).length}\nErros JS: ${errors.length}`);
})();
