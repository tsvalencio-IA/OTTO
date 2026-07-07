(async()=>{
'use strict';
const VERSION='ATHOS_V461_RENDER_PREMIUM_CORRIGIDO_TESTE';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const results=[],errors=[];
window.addEventListener('error',e=>errors.push(e.message||'Erro JS'));
window.addEventListener('unhandledrejection',e=>errors.push(String(e.reason||'Promise rejeitada')));
const all=(s,r=document)=>Array.from(r.querySelectorAll(s));
const visible=el=>!!el&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'&&el.getBoundingClientRect().width>0&&el.getBoundingClientRect().height>0;
const txt=el=>!el?'':[el.innerText,el.textContent,el.id,el.className,el.dataset?Object.entries(el.dataset).map(([k,v])=>`${k}:${v}`).join(' '):''].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
function add(n,ok,d=''){results.push({teste:n,status:ok?'✅ OK':'❌ FALHOU',detalhe:String(d||'')});console[ok?'log':'warn'](`${ok?'✅ OK':'❌ FALHOU'} ${n}`,d||'');panel();}
function panel(){let p=document.getElementById('athos-v461-test-panel');if(!p){p=document.createElement('div');p.id='athos-v461-test-panel';p.style.cssText='position:fixed;right:10px;top:10px;width:min(590px,calc(100vw - 20px));max-height:84vh;overflow:auto;z-index:99999999;background:rgba(0,0,0,.94);color:#fff;font:13px Arial;border:3px solid #55ff55;border-radius:10px;padding:10px';document.body.appendChild(p)}const ok=results.filter(r=>r.status.includes('OK')).length,fail=results.filter(r=>r.status.includes('FALHOU')).length;p.innerHTML=`<b>${VERSION}</b><div>✅ ${ok} ❌ ${fail} JS:${errors.length}</div>`+results.slice(-80).map(r=>`<div style="border-top:1px solid #444;padding:4px"><b>${r.status}</b> ${r.teste}<br><small>${r.detalhe.replace(/[<>&]/g,'')}</small></div>`).join('')}
async function fetchText(p){try{const r=await fetch(p+'?v461test='+Date.now(),{cache:'no-store'});return r.ok?await r.text():''}catch{return''}}
async function head(p){try{const r=await fetch(p+'?v461test='+Date.now(),{method:'HEAD',cache:'no-store'});add(`Arquivo ${p}`,r.ok,`HTTP ${r.status}`)}catch(e){add(`Arquivo ${p}`,false,e.message)}}
function pointer(el,type){const r=el.getBoundingClientRect();try{el.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:461,pointerType:'touch',clientX:r.left+r.width/2,clientY:r.top+r.height/2,isPrimary:true}))}catch{}}
async function tap(el,name){if(!el){add(`Clique ${name}`,false,'não encontrado');return false}el.scrollIntoView({block:'center',inline:'center'});await sleep(80);pointer(el,'pointerdown');await sleep(60);pointer(el,'pointerup');el.click();add(`Clique ${name}`,true,txt(el).slice(0,160));return true}
console.log('%cATHOS V46.1 RENDER PREMIUM CORRIGIDO TESTE','font-size:20px;color:#55ff55;background:#111;padding:8px');
for(const f of ['./index.html','./style.css','./app.js','./athos.glb','./manifest.webmanifest','./sw.js','./assets/render-v46/v46-render-premium.js','./assets/render-v46/v46-render-premium.css','./assets/render-v46/v46-render-config.json']) await head(f);
const app=await fetchText('./app.js'), index=await fetchText('./index.html'), css=await fetchText('./style.css'), v46=await fetchText('./assets/render-v46/v46-render-premium.js');
add('Título V46.1',/V46\.1|RENDER PREMIUM CORRIGIDO/i.test(document.title+index),document.title);
add('Módulo V46 carregado',!!window.ATHOS_V46_RENDER_PREMIUM,window.ATHOS_V46_RENDER_PREMIUM?.version||'ausente');
add('Safe wrapper corrigido com apply(this,args)',/fn\.apply\(this, args\)/.test(v46),'preserva this em install/rebuild/dispose');
add('Mapeamento de mundos existe',/normalizeWorldName/.test(v46)&&/field:\s*'campo'/.test(v46)&&/fire:\s*'vulcao'/.test(v46),'field/fire/space -> V46');
add('Integração no app.js existe',/installV46Render|rebuildV46Render|updateV46Render|getV46Render/.test(app),'install/update/rebuild/status');
add('Camadas visuais antigas desativadas',/V442_LEGACY_VISUAL_LAYER_DISABLED_BY_V46/.test(app)&&/V45_LEGACY_VISUAL_LAYER_DISABLED_BY_V46/.test(app),'V46 vira visual principal');
add('CSS V46 seguro no index',/v46-render-premium\.css/.test(index),'link CSS');
add('JS V46 antes do app',/v46-render-premium\.js[\s\S]*app\.js/.test(index),'script order');
add('AR nativo scene-viewer primeiro',/ar-modes="scene-viewer webxr quick-look"/.test(index),'model-viewer AR');
add('Câmera fake não é usada no Real',/Câmera falsa não será usada|realBg = false/.test(app),'sem fallback fake');
add('IDs e controles preservados',/id="powerBtn"[\s\S]*data-action="power"/.test(index)&&/data-world="real"/.test(index)&&!/quizActionBtn|askActionBtn/.test(index),'B, Real, sem Quiz/Falar no controle');
await tap(document.getElementById('playBtn')||document.getElementById('heroPlayBtn'),'Entrar no jogo'); await sleep(4300);
add('Three.js carregado',!!window.THREE,window.THREE?`REV ${THREE.REVISION}`:'ausente');
const api=window.ATHOS_TEST_API||{};
const st=api.getV46Render?.() || window.ATHOS_V46_RENDER_PREMIUM?.getStatus?.();
add('Status V46 instalado',st&&st.installed===true,JSON.stringify(st||{}));
add('Render V46 criou objetos',st&&st.objects>0,JSON.stringify(st||{}));
add('Body com skin V46 ativa',document.body.classList.contains('v46-premium-active'),'body.v46-premium-active');
const real=document.querySelector('.game.active [data-world="real"]');
add('Botão Real visível no jogo',visible(real),real?`${Math.round(real.getBoundingClientRect().width)}x${Math.round(real.getBoundingClientRect().height)} ${txt(real)}`:'ausente');
await tap(real,'Real/AR nativo'); await sleep(1000);
const ar=api.getARSafety?.();
add('AR seguro sem câmera falsa',ar&&ar.nativeAR===true&&ar.fakeCamera===false&&ar.realBg===false,JSON.stringify(ar||{}));
const p1=api.getPlayerState?.(); await sleep(700); const p2=api.getPlayerState?.();
add('Jogador não anda ao acionar Real',p1&&p2&&Math.abs((p2.x-p1.x)||0)<.08&&Math.abs((p2.z-p1.z)||0)<.08,JSON.stringify({before:p1,after:p2}));
add('Sem erro JavaScript capturado',errors.length===0,errors.slice(-5).join(' | '));
console.table(results); window.ATHOS_V461_TEST_RESULTS=results; window.ATHOS_V461_TEST_ERRORS=errors; alert(`Teste V46.1 finalizado.\nOK: ${results.filter(r=>r.status.includes('OK')).length}\nFalhas: ${results.filter(r=>r.status.includes('FALHOU')).length}\nErros JS: ${errors.length}`);
})();
