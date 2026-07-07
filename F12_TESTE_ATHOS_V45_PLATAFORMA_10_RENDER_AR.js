(async()=>{
'use strict';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const results=[], errors=[];
window.addEventListener('error',e=>errors.push(e.message||'Erro JS'));
window.addEventListener('unhandledrejection',e=>errors.push(String(e.reason||'Promise rejeitada')));
const all=(s,r=document)=>Array.from(r.querySelectorAll(s));
const visible=el=>!!el&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'&&el.getBoundingClientRect().width>0&&el.getBoundingClientRect().height>0;
const txt=el=>!el?'':[el.innerText,el.textContent,el.id,el.className,el.dataset?Object.entries(el.dataset).map(([k,v])=>`${k}:${v}`).join(' '):''].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
function add(n,ok,d=''){results.push({teste:n,status:ok?'✅ OK':'❌ FALHOU',detalhe:String(d||'')});console[ok?'log':'warn'](`${ok?'✅ OK':'❌ FALHOU'} ${n}`,d||'');}
async function fetchText(p){try{const r=await fetch(p+'?v45test='+Date.now(),{cache:'no-store'});return r.ok?await r.text():''}catch{return''}}
async function head(p){try{const r=await fetch(p+'?v45test='+Date.now(),{method:'HEAD',cache:'no-store'});add(`Arquivo ${p}`,r.ok,`HTTP ${r.status}`)}catch(e){add(`Arquivo ${p}`,false,e.message)}}
function pointer(el,type){const r=el.getBoundingClientRect();try{el.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:45,pointerType:'touch',clientX:r.left+r.width/2,clientY:r.top+r.height/2,isPrimary:true}))}catch{}}
async function tap(el,name){if(!el){add(`Clique ${name}`,false,'não encontrado');return false}el.scrollIntoView({block:'center',inline:'center'});await sleep(80);pointer(el,'pointerdown');await sleep(60);pointer(el,'pointerup');el.click();add(`Clique ${name}`,true,txt(el).slice(0,160));return true}
console.log('%cATHOS V45 PLATAFORMA 10/10 TESTE','font-size:20px;color:#55ff55;background:#111;padding:8px');
for(const f of ['./index.html','./style.css','./app.js','./athos.glb','./manifest.webmanifest','./sw.js','./assets/v45_gameplay_target.png','./assets/v45_menu_target.png']) await head(f);
const app=await fetchText('./app.js'), index=await fetchText('./index.html'), css=await fetchText('./style.css');
add('Título V45',/V45|PLATAFORMA 10\/10/i.test(document.title+index),document.title);
add('Render V45 no app.js',/applyV45TrueGamePlatformRender|V45_TRUE_GAME_PLATFORM_10_10|approved_voxel_portal_adventure/.test(app),'camada de render real');
add('CSS V45 premium existe',/V45 — PLATAFORMA 10\/10|v45_gameplay_target|v45_menu_target/.test(css),'visual alvo aplicado');
add('AR nativo ancorado existe',/arAnchorViewer|ar-scale="fixed"/.test(index),'model-viewer AR fora do lobby');
add('Fake câmera AR desativável',/noFakeCameraAR|V45_NATIVE_AR_ANCHORED_NO_FAKE_CAMERA/.test(app),'sem câmera falsa como AR principal');
add('IDs controles preservados',/id="powerBtn"[\s\S]*data-action="power"/.test(index)&&/data-world="real"/.test(index),'B e Real preservados');
await tap(document.getElementById('playBtn')||document.getElementById('heroPlayBtn'),'Entrar no jogo'); await sleep(4200);
add('Three.js carregado',!!window.THREE,window.THREE?`REV ${THREE.REVISION}`:'ausente');
const api=window.ATHOS_TEST_API||{}; add('Render V45 exposto',/V45_TRUE_GAME_PLATFORM/.test(JSON.stringify(api.getV442Render?.()||{})),JSON.stringify(api.getV442Render?.()||{}));
const real=document.querySelector('.game.active [data-world="real"]'); add('Botão Real visível',visible(real),real?`${Math.round(real.getBoundingClientRect().width)}x${Math.round(real.getBoundingClientRect().height)} ${txt(real)}`:'ausente');
await tap(real,'Real/AR nativo'); await sleep(1000); const ar=api.getARSafety?.(); add('AR seguro nativo acionado',ar&&ar.nativeAR===true&&ar.fakeCamera===false,JSON.stringify(ar||{}));
const p1=api.getPlayerState?.(); await sleep(700); const p2=api.getPlayerState?.(); add('Jogador não anda ao acionar AR',p1&&p2&&Math.abs((p2.x-p1.x)||0)<.08&&Math.abs((p2.z-p1.z)||0)<.08,JSON.stringify({before:p1,after:p2}));
add('Sem erro JavaScript capturado',errors.length===0,errors.slice(-5).join(' | '));
console.table(results); window.ATHOS_V45_TEST_RESULTS=results; window.ATHOS_V45_TEST_ERRORS=errors; alert(`Teste V45 finalizado.\nOK: ${results.filter(r=>r.status.includes('OK')).length}\nFalhas: ${results.filter(r=>r.status.includes('FALHOU')).length}\nErros JS: ${errors.length}`);
})();