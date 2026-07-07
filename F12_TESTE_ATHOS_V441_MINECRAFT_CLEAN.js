
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
async function fetchText(p){try{const r=await fetch(p+'?v441test='+Date.now(),{cache:'no-store'});return r.ok?await r.text():''}catch{return''}}
async function head(p){try{const r=await fetch(p+'?v441test='+Date.now(),{method:'HEAD',cache:'no-store'});add(`Arquivo ${p}`,r.ok,`HTTP ${r.status}`)}catch(e){add(`Arquivo ${p}`,false,e.message)}}
function pointer(el,type){const r=el.getBoundingClientRect();try{el.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:441,pointerType:'touch',clientX:r.left+r.width/2,clientY:r.top+r.height/2,isPrimary:true}))}catch{}}
async function tap(el,name){if(!el){add(`Clique ${name}`,false,'não encontrado');return false}el.scrollIntoView({block:'center',inline:'center'});await sleep(80);pointer(el,'pointerdown');await sleep(60);pointer(el,'pointerup');el.click();add(`Clique ${name}`,true,txt(el).slice(0,160));return true}
function modal(){return all('.modal,[role="dialog"],.overlay').find(visible)}
console.log('%cATHOS V44.1 MINECRAFT CLEAN TESTE','font-size:20px;color:#55ff55;background:#111;padding:8px');
for(const f of ['./index.html','./style.css','./app.js','./athos.glb','./manifest.webmanifest','./sw.js']) await head(f);
const app=await fetchText('./app.js'), index=await fetchText('./index.html'), css=await fetchText('./style.css');
add('Título V44.1 clean',/V44\.1|MINECRAFT CLEAN/i.test(document.title+index),document.title);
add('CSS Minecraft clean existe',/MINECRAFT CLEAN UI|menos poluição visual/.test(css),'camada visual limpa');
add('Objetivos curtos',/Pegue 5 cristais|Lava machuca|Use tamanho gigante/.test(app)&&!/Ritmo guiado: ande/.test(app),'sem textão de missão');
add('Placas curtas',/training: \['IR', 'PULO', 'GEMA', 'B', 'PORTAL'\]/.test(app),'placas menos poluídas');
add('Base V44 inimigos preservada',/V44_ENEMY_AI|applyV44EnemyBossLayer|getV44Enemies/.test(app),'inimigos/boss');
add('Base V43.1 Quiz/3D preservada',/renderQuestion|renderResult|VIEWER_3D/.test(app),'quiz/3D');
add('Base V42 AR seguro preservada',/AR_SAFE|getARSafety/.test(app),'AR seguro');
add('Quiz/Falar fora do controle',!/quizActionBtn|askActionBtn/.test(index),'controle limpo');
await tap(document.getElementById('playBtn')||document.getElementById('heroPlayBtn'),'Entrar no jogo');await sleep(3800);
add('Three.js carregado',!!window.THREE,window.THREE?`REV ${THREE.REVISION}`:'ausente');
const real=document.querySelector('.game.active [data-world="real"]'); add('Botão Real visível',visible(real),real?`${Math.round(real.getBoundingClientRect().width)}x${Math.round(real.getBoundingClientRect().height)} ${txt(real)}`:'ausente');
const api=window.ATHOS_TEST_API||{}; const inf=api.getV44Enemies?.(); add('Inimigos V44 preservados',inf&&inf.enemies>=3,JSON.stringify(inf||{}));
await tap(real,'Real/AR'); await sleep(900); const p1=api.getPlayerState?.(); await sleep(700); const p2=api.getPlayerState?.(); add('AR seguro sem andar sozinho',p1&&p2&&Math.abs((p2.x-p1.x)||0)<.08&&Math.abs((p2.z-p1.z)||0)<.08,JSON.stringify({before:p1,after:p2}));
add('Sem erro JavaScript capturado',errors.length===0,errors.slice(-5).join(' | '));
console.table(results); window.ATHOS_V441_TEST_RESULTS=results; window.ATHOS_V441_TEST_ERRORS=errors; alert(`Teste V44.1 finalizado.\nOK: ${results.filter(r=>r.status.includes('OK')).length}\nFalhas: ${results.filter(r=>r.status.includes('FALHOU')).length}\nErros JS: ${errors.length}`);
})();
