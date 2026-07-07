(async()=>{
'use strict';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const results=[], errors=[];
window.addEventListener('error',e=>errors.push(e.message||'Erro JS'));
window.addEventListener('unhandledrejection',e=>errors.push(String(e.reason||'Promise rejeitada')));
const $=s=>document.querySelector(s);
const all=s=>Array.from(document.querySelectorAll(s));
const visible=el=>!!el&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'&&el.getBoundingClientRect().width>0&&el.getBoundingClientRect().height>0;
function add(n,ok,d=''){results.push({teste:n,status:ok?'OK':'FALHOU',detalhe:String(d||'')});console[ok?'log':'warn']((ok?'OK':'FALHOU')+' - '+n,d||'');}
async function head(p){try{const r=await fetch(p+'?v50='+Date.now(),{method:'HEAD',cache:'no-store'});add('Arquivo '+p,r.ok,'HTTP '+r.status)}catch(e){add('Arquivo '+p,false,e.message)}}
async function tap(el,name){if(!el){add('Clique '+name,false,'não encontrado');return false} el.scrollIntoView({block:'center',inline:'center'}); await sleep(80); el.click(); add('Clique '+name,true,el.id||el.textContent||name); return true}
function overlap(a,b){const r1=a.getBoundingClientRect(),r2=b.getBoundingClientRect();return !(r1.right<=r2.left||r2.right<=r1.left||r1.bottom<=r2.top||r2.bottom<=r1.top)}
console.log('%cATHOS V50 RECUPERADO','font-size:20px;color:#55ff55;background:#111;padding:8px');
for(const f of ['./index.html','./style.css','./app.js','./athos.glb','./manifest.webmanifest','./sw.js','./assets/render-targets/render-exigido-referencia.jpg']) await head(f);
add('Título V50',/V50|RECUPERADO/i.test(document.title),document.title);
add('Quiz/Falar fora dos controles',!document.querySelector('.game [data-action="quiz"],.game [data-action="ask"],#quizActionBtn,#askActionBtn'),'controle limpo');
add('B Poder correto',!!$('#powerBtn[data-action="power"]'),'#powerBtn');
add('Real existe',!!$('.world-chip[data-world="real"]'),'Real');
await tap($('#playBtn')||$('#heroPlayBtn'),'Jogar');
await sleep(4200);
const api=window.ATHOS_TEST_API||{};
add('Three.js carregado',!!window.THREE,window.THREE?`REV ${THREE.REVISION}`:'ausente');
const st=api.getV50Render?.();
add('Render V50 ativo',st&&st.active===true,JSON.stringify(st||{}));
add('Render V50 criou objetos',st&&Number(st.objects||0)>150,JSON.stringify(st||{}));
const joy=$('#joystick'), btns=all('.action-grid .action-btn').filter(visible);
let bad=[]; for(let b of btns){ if(joy&&overlap(joy,b)) bad.push(b.id||b.textContent); }
add('Joystick separado dos botões',visible(joy)&&bad.length===0,bad.join(' | ')||'ok');
let p0=api.getPlayerState?.(); await sleep(450); let p1=api.getPlayerState?.();
add('Athos parado não anda sozinho',p0&&p1&&Math.abs((p1.x-p0.x)||0)<.08&&Math.abs((p1.z-p0.z)||0)<.08,JSON.stringify({antes:p0,depois:p1}));
await tap($('.world-chip[data-world="real"]'),'Real/AR');
await sleep(800);
let p2=api.getPlayerState?.(); await sleep(450); let p3=api.getPlayerState?.();
add('Real não move Athos',p2&&p3&&Math.abs((p3.x-p2.x)||0)<.08&&Math.abs((p3.z-p2.z)||0)<.08,JSON.stringify({antes:p2,depois:p3,ar:api.getARSafety?.()}));
add('Sem erro JS',errors.length===0,errors.slice(-5).join(' | '));
console.table(results);
window.ATHOS_V50_TEST_RESULTS=results;
window.ATHOS_V50_TEST_ERRORS=errors;
alert(`Teste V50 finalizado.\nOK: ${results.filter(r=>r.status==='OK').length}\nFalhas: ${results.filter(r=>r.status==='FALHOU').length}\nErros JS: ${errors.length}`);
})();