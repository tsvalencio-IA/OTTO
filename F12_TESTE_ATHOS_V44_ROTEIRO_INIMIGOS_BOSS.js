(async()=>{
'use strict';
const VERSION='ATHOS_V44_ROTEIRO_INIMIGOS_BOSS_TEST_001';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const results=[], errors=[];
window.addEventListener('error',e=>errors.push(e.message||'Erro JS'));
window.addEventListener('unhandledrejection',e=>errors.push(String(e.reason||'Promise rejeitada')));
const all=(s,r=document)=>Array.from(r.querySelectorAll(s));
const visible=el=>!!el&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'&&el.getBoundingClientRect().width>0&&el.getBoundingClientRect().height>0;
const txt=el=>!el?'':[el.innerText,el.textContent,el.id,el.className,el.dataset?Object.entries(el.dataset).map(([k,v])=>`${k}:${v}`).join(' '):''].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
function add(n,ok,d=''){results.push({teste:n,status:ok?'✅ OK':'❌ FALHOU',detalhe:String(d||'')});console[ok?'log':'warn'](`${ok?'✅ OK':'❌ FALHOU'} ${n}`,d||'');panel();}
function panel(){let p=document.getElementById('athos-v44-roteiro-test-panel');if(!p){p=document.createElement('div');p.id='athos-v44-roteiro-test-panel';p.style.cssText='position:fixed;right:10px;top:10px;width:min(590px,calc(100vw - 20px));max-height:84vh;overflow:auto;z-index:99999999;background:rgba(0,0,0,.94);color:#fff;font:13px Arial;border:3px solid #55ff55;border-radius:10px;padding:10px';document.body.appendChild(p)}const ok=results.filter(r=>r.status.includes('OK')).length,fail=results.filter(r=>r.status.includes('FALHOU')).length;p.innerHTML=`<b>${VERSION}</b><div>✅ ${ok} ❌ ${fail} JS:${errors.length}</div>`+results.slice(-75).map(r=>`<div style="border-top:1px solid #444;padding:4px"><b>${r.status}</b> ${r.teste}<br><small>${r.detalhe.replace(/[<>&]/g,'')}</small></div>`).join('')}
async function fetchText(p){try{const r=await fetch(p+'?v44roteiro='+Date.now(),{cache:'no-store'});return r.ok?await r.text():''}catch{return''}}
async function head(p){try{const r=await fetch(p+'?v44roteiro='+Date.now(),{method:'HEAD',cache:'no-store'});add(`Arquivo ${p}`,r.ok,`HTTP ${r.status}`)}catch(e){add(`Arquivo ${p}`,false,e.message)}}
function pointer(el,type){const r=el.getBoundingClientRect();try{el.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:44,pointerType:'touch',clientX:r.left+r.width/2,clientY:r.top+r.height/2,isPrimary:true}))}catch{}}
async function tap(el,name){if(!el){add(`Clique ${name}`,false,'não encontrado');return false}el.scrollIntoView({block:'center',inline:'center'});await sleep(80);pointer(el,'pointerdown');await sleep(60);pointer(el,'pointerup');el.click();add(`Clique ${name}`,true,txt(el).slice(0,160));return true}
function modal(){return all('.modal,[role="dialog"],.overlay').find(visible)}
console.log('%cATHOS V44 ROTEIRO INIMIGOS/BOSS TESTE','font-size:20px;color:#55ff55;background:#111;padding:8px');
for(const f of ['./index.html','./style.css','./app.js','./athos.glb','./manifest.webmanifest','./sw.js']) await head(f);
const app=await fetchText('./app.js'), index=await fetchText('./index.html'), css=await fetchText('./style.css');
add('Título V44 roteiro',/V44|INIMIGOS|BOSS/i.test(document.title+index),document.title);
add('Não mexeu no HTML estrutural dos controles',/id="powerBtn"[\s\S]*data-action="power"/.test(index)&&/data-world="real"/.test(index)&&!/quizActionBtn|askActionBtn/.test(index),'IDs e data-action principais preservados');
add('Base V43.1 preservada',/renderQuestion|renderResult|VIEWER_3D/.test(app),'Quiz/3D estável');
add('Base V42 preservada',/V42_LEVEL_GUIDES|AR_SAFE|getV42Design/.test(app),'Fases/AR seguro');
add('V44 somente inimigos/boss existe',/V44_ENEMY_AI|applyV44EnemyBossLayer|updateV44EnemyProjectiles|getV44Enemies/.test(app),'camada inimigos');
add('CSS Real visível existe',/HOTFIX REAL VISÍVEL|repeat\(7|minmax\(0,1fr\)/.test(css),'7 mundos cabem no mobile');
add('Quiz em rodada preservado',/quiz-round-head|renderQuestion|renderResult/.test(app),'não fecha ao responder');
const qbtn=document.getElementById('quizBtn');await tap(qbtn,'Abrir Quiz');await sleep(350);let opts=all('button.quiz-option',modal()).filter(visible);add('Quiz abre alternativas',opts.length>=2,`${opts.length}`);await tap(opts[0],'Responder 1');await sleep(300);add('Quiz não fecha ao responder',!!modal()&&!modal().hidden,'modal aberto');document.getElementById('modalClose')?.click();await sleep(250);
await tap(document.getElementById('playBtn')||document.getElementById('heroPlayBtn'),'Entrar no jogo');await sleep(3900);
add('Three.js carregado',!!window.THREE,window.THREE?`REV ${THREE.REVISION}`:'ausente');
add('Quiz/Falar fora do controle',!document.querySelector('.game.active [data-action="quiz"],.game.active [data-action="ask"],.game.active #quizActionBtn,.game.active #askActionBtn'),'controle limpo');
const real=document.querySelector('.game.active [data-world="real"]');
add('Botão Real visível no jogo',visible(real),real?`${Math.round(real.getBoundingClientRect().width)}x${Math.round(real.getBoundingClientRect().height)} ${txt(real)}`:'ausente');
const api=window.ATHOS_TEST_API||{};add('API V44 inimigos existe',!!api.getV44Enemies,JSON.stringify(api.getV44Enemies?.()||{}));
const inf=api.getV44Enemies?.();add('Inimigos carregados',inf&&inf.enemies>=3&&inf.markers>=2,JSON.stringify(inf));
await tap(real,'Real/AR');await sleep(900);const p1=api.getPlayerState?.();await sleep(800);const p2=api.getPlayerState?.();add('AR seguro sem andar sozinho',p1&&p2&&Math.abs((p2.x-p1.x)||0)<.08&&Math.abs((p2.z-p1.z)||0)<.08,JSON.stringify({before:p1,after:p2}));
add('Sem erro JavaScript capturado',errors.length===0,errors.slice(-5).join(' | '));
console.table(results);window.ATHOS_V44_ROTEIRO_TEST_RESULTS=results;window.ATHOS_V44_ROTEIRO_TEST_ERRORS=errors;alert(`Teste V44 roteiro finalizado.\nOK: ${results.filter(r=>r.status.includes('OK')).length}\nFalhas: ${results.filter(r=>r.status.includes('FALHOU')).length}\nErros JS: ${errors.length}`);
})();
