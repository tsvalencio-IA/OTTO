(async()=>{
'use strict';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const results=[],errors=[];
window.__athosErrors=window.__athosErrors||[];
window.addEventListener('error',e=>{errors.push(e.message||'Erro JS');window.__athosErrors.push(e.message||'Erro JS');});
window.addEventListener('unhandledrejection',e=>{const msg=String(e.reason||'Promise rejeitada');errors.push(msg);window.__athosErrors.push(msg);});
const $=s=>document.querySelector(s);
const all=s=>Array.from(document.querySelectorAll(s));
const visible=el=>!!el&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'&&el.getBoundingClientRect().width>0&&el.getBoundingClientRect().height>0;
const txt=el=>!el?'':[el.innerText,el.textContent,el.id,el.className,el.dataset?Object.entries(el.dataset).map(([k,v])=>`${k}:${v}`).join(' '):''].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
function add(name,ok,detail=''){const row={teste:name,status:ok?'OK':'FALHOU',detalhe:String(detail||'')};results.push(row);console[ok?'log':'warn'](`${ok?'OK':'FALHOU'} - ${name}`,detail||'');}
async function fetchText(path){try{const r=await fetch(path+'?engine10='+Date.now(),{cache:'no-store'});return r.ok?await r.text():''}catch{return''}}
function pointer(el,type,dx=0,dy=0,id=1010){if(!el)return;const r=el.getBoundingClientRect();try{el.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:id,pointerType:'touch',clientX:r.left+r.width/2+dx,clientY:r.top+r.height/2+dy,isPrimary:true}))}catch{}}
async function tap(el,name){if(!el){add(`Clique ${name}`,false,'nao encontrado');return false}el.scrollIntoView({block:'center',inline:'center'});await sleep(60);pointer(el,'pointerdown');await sleep(80);pointer(el,'pointerup');el.click();add(`Clique ${name}`,true,txt(el).slice(0,120));return true}
async function waitFor(fn,ms=9000){const start=performance.now();while(performance.now()-start<ms){try{if(fn())return true}catch{}await sleep(120)}return false}
function near(a,b,t=.08){return Math.abs(Number(a)-Number(b))<=t}

console.log('%cATHOS GAMEPLAY ENGINE 10','font-size:20px;color:#67e8f9;background:#111;padding:8px');

const appText=await fetchText('./app.js');
add('Joystick existe',!!$('#joystick')&&!!$('#joyKnob'),'#joystick/#joyKnob');
add('B Poder existe',!!$('#powerBtn[data-action="power"]'),'#powerBtn[data-action=power]');
add('Real existe',!!$('.world-chip[data-world="real"]')||!!$('#arNativeExternalBtn'),'world real ou AR externo');
add('Funcoes defensivas existem',typeof window.resetAllInputs==='function'&&typeof window.safePointerCapture==='function'&&typeof window.safePointerRelease==='function'&&typeof window.setMoveHold==='function'&&typeof window.clearVelocityHorizontal==='function','resetAllInputs/safePointer*/setMoveHold/clearVelocityHorizontal');
add('Codigo contem parametros de camera',/cameraFollowDistance|cameraHeight|cameraLookAhead|cameraSmoothing|cameraJumpOffset/.test(appText),'camera gameplay');

await tap($('#playBtn')||$('#heroPlayBtn'),'Jogar');
const gameReady=await waitFor(()=>window.ATHOS_TEST_API&&$('.game.active')&&window.ATHOS_TEST_API.getPlayerState?.(),12000);
add('Jogo iniciou sem travar',gameReady,'ATHOS_TEST_API + .game.active');
const api=window.ATHOS_TEST_API||{};

api.resetAllInputs?.();
api.setMoveHold?.('left',true);
await sleep(100);
api.setMoveHold?.('left',false);
await sleep(160);
let input=api.getInputState?.();
add('Soltar controle zera input',input&&input.input.x===0&&input.input.z===0&&!input.moveHold.left&&!input.moveHold.right&&!input.moveHold.forward&&!input.moveHold.back,JSON.stringify(input||{}));

api.resetAllInputs?.();
let p0=api.getPlayerState?.();
await sleep(450);
let p1=api.getPlayerState?.();
add('Athos parado nao se move',p0&&p1&&near(p0.x,p1.x,.08)&&near(p0.z,p1.z,.08),JSON.stringify({antes:p0,depois:p1}));

api.resetAllInputs?.();
await sleep(80);
api.jump?.();
await sleep(120);
let pJump=api.getPlayerState?.();
add('A aplica pulo',pJump&&(pJump.vy>0||pJump.y>(p0?.y||0)+.05),JSON.stringify(pJump||{}));

const yBtn=$('#crouchBtn[data-action="crouch"]');
pointer(yBtn,'pointerdown',0,0,2010);
await sleep(120);
pointer(yBtn,'pointerup',0,0,2010);
await sleep(180);
input=api.getInputState?.();
add('Y nao fica preso',input&&input.input.crouch===false,JSON.stringify(input||{}));

api.resetAllInputs?.();
await sleep(80);
api.power?.();
await sleep(120);
let gs=api.getGameplayState?.();
add('B gera cooldown/projetil ou acao',gs&&(gs.fireballs>0||gs.powerCooldownMs>0),JSON.stringify(gs||{}));

gs=api.getGameplayState?.();
add('Inimigos existem',gs&&Array.isArray(gs.enemies)&&gs.enemies.length>0,JSON.stringify(gs?.enemies?.slice(0,4)||[]));
add('Inimigos tem tipo',gs&&gs.enemies.every(e=>!!e.type),JSON.stringify(gs?.enemies?.map(e=>e.type)||[]));

api.buildLevelById?.('arena');
await sleep(700);
gs=api.getGameplayState?.();
add('Boss existe na arena',gs&&gs.enemies.some(e=>e.type==='boss'),JSON.stringify(gs?.enemies?.map(e=>e.type)||[]));
add('Portal bloqueia antes dos objetivos',gs&&gs.portalUnlocked===false,JSON.stringify({portalUnlocked:gs?.portalUnlocked}));
const forced=api.forcePortalReady?.();
await sleep(200);
gs=api.getGameplayState?.();
add('Portal libera com objetivos completos',forced===true&&gs&&gs.portalUnlocked===true,JSON.stringify({forced,portalUnlocked:gs?.portalUnlocked}));

api.resetAllInputs?.();
const fireChip=$('.world-chip[data-world="fire"]');
await tap(fireChip,'Mudar mundo Vulcao');
await sleep(450);
input=api.getInputState?.();
add('Mudar mundo nao prende input',input&&input.input.x===0&&input.input.z===0&&input.input.crouch===false,JSON.stringify(input||{}));

api.resetAllInputs?.();
const realBefore=api.getPlayerState?.();
await tap($('.world-chip[data-world="real"]')||$('#arNativeExternalBtn'),'Abrir Real');
await sleep(700);
const realAfter=api.getPlayerState?.();
input=api.getInputState?.();
const ar=api.getARSafety?.();
add('Abrir Real nao move Athos',realBefore&&realAfter&&near(realBefore.x,realAfter.x,.08)&&near(realBefore.z,realAfter.z,.08)&&input&&input.input.x===0&&input.input.z===0,JSON.stringify({antes:realBefore,depois:realAfter,input,ar}));

await sleep(250);
const captured=(window.__athosErrors||[]).concat(errors).filter(Boolean);
add('Sem erro JS',captured.length===0,captured.slice(-8).join(' | '));

console.table(results);
window.ATHOS_GAMEPLAY_ENGINE_10_RESULTS=results;
window.ATHOS_GAMEPLAY_ENGINE_10_ERRORS=captured;
alert(`ATHOS Gameplay Engine 10 finalizado.\nOK: ${results.filter(r=>r.status==='OK').length}\nFalhas: ${results.filter(r=>r.status==='FALHOU').length}\nErros JS: ${captured.length}`);
})();
