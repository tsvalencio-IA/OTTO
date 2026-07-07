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
async function head(p){try{const r=await fetch(p+'?v46test='+Date.now(),{method:'HEAD',cache:'no-store'});add(`Arquivo ${p}`,r.ok,`HTTP ${r.status}`)}catch(e){add(`Arquivo ${p}`,false,e.message)}}
async function fetchText(p){try{const r=await fetch(p+'?v46test='+Date.now(),{cache:'no-store'});return r.ok?await r.text():''}catch{return''}}
function pointer(el,type){const r=el.getBoundingClientRect();try{el.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:46,pointerType:'touch',clientX:r.left+r.width/2,clientY:r.top+r.height/2,isPrimary:true}))}catch{}}
async function tap(el,name){if(!el){add(`Clique ${name}`,false,'não encontrado');return false}el.scrollIntoView({block:'center',inline:'center'});await sleep(80);pointer(el,'pointerdown');await sleep(60);pointer(el,'pointerup');el.click();add(`Clique ${name}`,true,txt(el).slice(0,160));return true}
console.log('%cATHOS V46 RENDER PREMIUM INTEGRADO TESTE','font-size:20px;color:#55ff55;background:#111;padding:8px');
for(const f of ['./index.html','./style.css','./app.js','./athos.glb','./manifest.webmanifest','./sw.js','./assets/render-v46/v46-render-premium.js','./assets/render-v46/v46-render-premium.css','./assets/render-v46/v46-render-config.json']) await head(f);
const app=await fetchText('./app.js'), index=await fetchText('./index.html'), css=await fetchText('./assets/render-v46/v46-render-premium.css'), js=await fetchText('./assets/render-v46/v46-render-premium.js');
add('Título V46',/V46|RENDER PREMIUM/i.test(document.title+index),document.title);
add('Global V46 carregado',!!window.ATHOS_V46_RENDER_PREMIUM,window.ATHOS_V46_RENDER_PREMIUM?.version||'ausente');
add('Camada V46 no app.js',/installV46Premium|rebuildV46Premium|updateV46Premium|getV46Render/.test(app),'integração app.js');
add('CSS V46 seguro sem [id*=hud]',!css.includes('[id*="hud"]'),'não quebra hudHearts');
add('JS V46 tem grupo independente',/V46_RENDER_PREMIUM_GROUP/.test(js),'grupo próprio');
add('Preserva IDs de controle',/id="powerBtn"[\s\S]*data-action="power"/.test(index)&&/data-world="real"/.test(index),'B/Real preservados');
await tap(document.getElementById('playBtn')||document.getElementById('heroPlayBtn'),'Entrar no jogo'); await sleep(4300);
add('Three.js carregado',!!window.THREE,window.THREE?`REV ${THREE.REVISION}`:'ausente');
const api=window.ATHOS_TEST_API||{}; const v46=api.getV46Render?.()||{};
add('V46 instalado no scene',v46.installed===true,JSON.stringify(v46));
add('V46 criou objetos premium',Number(v46.objects||0)>0 || Number(v46.animations||0)>0,JSON.stringify(v46));
const real=document.querySelector('.game.active [data-world="real"]'); add('Botão Real visível',visible(real),real?`${Math.round(real.getBoundingClientRect().width)}x${Math.round(real.getBoundingClientRect().height)} ${txt(real)}`:'ausente');
await tap(real,'Real/AR nativo'); await sleep(1000); const ar=api.getARSafety?.(); add('AR nativo/fake câmera protegido',ar&&ar.nativeAR===true&&ar.fakeCamera===false,JSON.stringify(ar||{}));
const p1=api.getPlayerState?.(); await sleep(700); const p2=api.getPlayerState?.(); add('Jogador não anda ao acionar AR',p1&&p2&&Math.abs((p2.x-p1.x)||0)<.08&&Math.abs((p2.z-p1.z)||0)<.08,JSON.stringify({before:p1,after:p2}));
add('Sem erro JavaScript capturado',errors.length===0,errors.slice(-5).join(' | '));
console.table(results); window.ATHOS_V46_TEST_RESULTS=results; window.ATHOS_V46_TEST_ERRORS=errors; alert(`Teste V46 finalizado.\nOK: ${results.filter(r=>r.status.includes('OK')).length}\nFalhas: ${results.filter(r=>r.status.includes('FALHOU')).length}\nErros JS: ${errors.length}`);
})();