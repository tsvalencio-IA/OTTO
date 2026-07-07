(async()=>{
'use strict';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const results=[],errors=[];
window.addEventListener('error',e=>errors.push(e.message||'Erro JS'));
window.addEventListener('unhandledrejection',e=>errors.push(String(e.reason||'Promise rejeitada')));
const $=s=>document.querySelector(s);
const visible=el=>!!el&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'&&el.getBoundingClientRect().width>0&&el.getBoundingClientRect().height>0;
function add(n,ok,d=''){results.push({teste:n,status:ok?'OK':'FALHOU',detalhe:String(d||'')});console[ok?'log':'warn']((ok?'OK':'FALHOU')+' - '+n,d||'');}
async function head(p){try{const r=await fetch(p+'?v492='+Date.now(),{method:'HEAD',cache:'no-store'});add('Arquivo '+p,r.ok,'HTTP '+r.status)}catch(e){add('Arquivo '+p,false,e.message)}}
async function tap(el,name){if(!el){add('Clique '+name,false,'não encontrado');return} el.scrollIntoView({block:'center',inline:'center'}); await sleep(80); el.click(); add('Clique '+name,true,el.id||el.textContent||name)}
function rect(el){const r=el.getBoundingClientRect(); return {x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height), bottom:Math.round(innerHeight-r.bottom)}}
console.log('%cATHOS V49.2 RENDER EXIGIDO REAL','font-size:20px;color:#55ff55;background:#111;padding:8px');
for(const f of ['./index.html','./style.css','./app.js','./athos.glb','./manifest.webmanifest','./sw.js','./assets/render-v49/v49-render-exigido.css','./assets/render-targets/render-exigido-absoluto.jpg','./F12_TESTE_ATHOS_GAMEPLAY_ENGINE_10.js']) await head(f);
await tap($('#playBtn')||$('#heroPlayBtn'),'Jogar');
await sleep(4200);
const api=window.ATHOS_TEST_API||{};
const st=api.getV49Render?.();
add('Status V49.2 ativo',st&&st.version==='V49_2_RENDER_EXIGIDO_REAL_BACKGROUND',JSON.stringify(st||{}));
add('Classe V49.2 ativa',document.body.classList.contains('v492-render-exigido-real-active'),document.body.className);
const stage=$('.three-stage');
add('Render exigido como backplate',getComputedStyle(stage).backgroundImage.includes('render-exigido-absoluto'),getComputedStyle(stage).backgroundImage.slice(0,180));
add('Mundo procedural oculto',st&&st.proceduralWorldHidden===true,JSON.stringify(st||{}));
add('Sem bola preta/sombra circular',!document.querySelector('[name="athosContactShadowV40"]'),'contactShadow removido');
const joy=$('#joystick'), grid=$('.action-grid'), world=$('.world-strip');
add('Joystick embaixo',visible(joy)&&rect(joy).bottom<230,JSON.stringify(rect(joy)));
add('Botões embaixo',visible(grid)&&rect(grid).bottom<230,JSON.stringify(rect(grid)));
add('Mundos embaixo',visible(world)&&rect(world).bottom<270,JSON.stringify(rect(world)));
add('B Poder existe',!!$('#powerBtn[data-action="power"]'),'B');
add('Real existe',!!$('.world-chip[data-world="real"]'),'Real');
add('Sem erro JS',errors.length===0,errors.slice(-5).join(' | '));
console.table(results);
window.ATHOS_V492_TEST_RESULTS=results;
alert(`Teste V49.2 finalizado.\nOK: ${results.filter(r=>r.status==='OK').length}\nFalhas: ${results.filter(r=>r.status==='FALHOU').length}\nErros JS: ${errors.length}`);
})();