(async()=>{
'use strict';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const results=[], errors=[];
window.addEventListener('error',e=>errors.push(e.message||'Erro JS'));
window.addEventListener('unhandledrejection',e=>errors.push(String(e.reason||'Promise rejeitada')));
const $=s=>document.querySelector(s); const all=s=>Array.from(document.querySelectorAll(s));
const visible=el=>!!el&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'&&el.getBoundingClientRect().width>0&&el.getBoundingClientRect().height>0;
const txt=el=>!el?'':[el.innerText,el.textContent,el.id,el.className,el.dataset?Object.entries(el.dataset).map(([k,v])=>`${k}:${v}`).join(' '):''].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
function add(n,ok,d=''){results.push({teste:n,status:ok?'✅ OK':'❌ FALHOU',detalhe:String(d||'')});console[ok?'log':'warn'](`${ok?'✅ OK':'❌ FALHOU'} ${n}`,d||'');}
async function head(p){try{const r=await fetch(p+'?v474test='+Date.now(),{method:'HEAD',cache:'no-store'});add(`Arquivo ${p}`,r.ok,`HTTP ${r.status}`)}catch(e){add(`Arquivo ${p}`,false,e.message)}}
async function tap(el,name){if(!el){add(`Clique ${name}`,false,'não encontrado');return false}el.scrollIntoView({block:'center',inline:'center'});await sleep(80);const r=el.getBoundingClientRect();try{el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,pointerId:472,pointerType:'touch',clientX:r.left+r.width/2,clientY:r.top+r.height/2,isPrimary:true}));await sleep(70);el.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,cancelable:true,pointerId:472,pointerType:'touch',clientX:r.left+r.width/2,clientY:r.top+r.height/2,isPrimary:true}));}catch{} el.click(); add(`Clique ${name}`,true,txt(el).slice(0,140));return true}
function overlap(a,b){const r1=a.getBoundingClientRect(),r2=b.getBoundingClientRect();return !(r1.right<=r2.left||r2.right<=r1.left||r1.bottom<=r2.top||r2.bottom<=r1.top)}
console.log('%cATHOS V47.4 RENDER SHADER/LIGHT SAFE + CONTROLES','font-size:20px;color:#55ff55;background:#111;padding:8px');
for(const f of ['./index.html','./style.css','./app.js','./athos.glb','./manifest.webmanifest','./sw.js','./assets/render-v47/v47-render-premium.js','./assets/render-v47/v47-render-premium.css','./assets/render-v47/v47-render-config.json','./F12_TESTE_ATHOS_GAMEPLAY_ENGINE_10.js']) await head(f);
add('Título V47.4',/V47\.4|SHADER\/LIGHT SAFE|SHADER LIGHT SAFE/i.test(document.title),document.title);
add('Módulo V47 existe',!!window.ATHOS_V47_RENDER_PREMIUM,window.ATHOS_V47_RENDER_PREMIUM?.version||'ausente');
add('CSS alvo V47.4 carregado',/V47\.3/.test(await (await fetch('./assets/render-v47/v47-render-premium.css?v='+Date.now())).text()),'override de controles/render');
await tap($('#playBtn')||$('#heroPlayBtn'),'Entrar no jogo'); await sleep(4200);
add('Three.js carregado',!!window.THREE,window.THREE?`REV ${THREE.REVISION}`:'ausente');
const api=window.ATHOS_TEST_API||{}; const st=api.getV47Render?.()||window.ATHOS_V47_RENDER_PREMIUM?.getStatus?.();
add('Render V47 instalado',st&&st.installed===true,JSON.stringify(st||{}));
add('Render shader/light safe ativo',st&&st.shaderSafe===true&&st.version&&st.version.includes('V47_4'),JSON.stringify(st||{}));
add('Render com muitos objetos',st&&(st.objects>=120||st.decorative>=30),JSON.stringify(st||{}));
add('Canvas ocupa a área inteira por trás dos controles',(()=>{const c=$('.three-stage'); if(!c)return false; const r=c.getBoundingClientRect(); return r.bottom>=innerHeight-4;})(),$('.three-stage')?.getBoundingClientRect().toJSON?.()||'');
const real=$('.game.active .world-chip[data-world="real"]'); add('Real visível',visible(real),real?`${Math.round(real.getBoundingClientRect().width)}x${Math.round(real.getBoundingClientRect().height)}`:'ausente');
const primary=['#jumpBtn','#powerBtn','[data-action="interact"]'].map($); add('3 botões principais visíveis',primary.every(visible),primary.map(e=>txt(e)).join(' | '));
const controls=all('.game.active .action-btn,.game.active #joystick,.game.active .world-chip').filter(visible); let bad=[]; for(let i=0;i<controls.length;i++){for(let j=i+1;j<controls.length;j++){if(overlap(controls[i],controls[j])) bad.push(`${txt(controls[i]).slice(0,10)} x ${txt(controls[j]).slice(0,10)}`)}}
add('Controles sem sobreposição',bad.length===0,bad.join(' | ')||`${controls.length} itens OK`);
api.resetAllInputs?.(); const p0=api.getPlayerState?.(); await sleep(500); const p1=api.getPlayerState?.(); add('Athos parado não se move',p0&&p1&&Math.abs((p1.x-p0.x)||0)<.08&&Math.abs((p1.z-p0.z)||0)<.08,JSON.stringify({antes:p0,depois:p1}));
api.power?.(); await sleep(150); const gs=api.getGameplayState?.(); add('B Poder responde',gs&&(gs.fireballs>0||gs.powerCooldownMs>0),JSON.stringify(gs||{}));
const before=errors.length; await tap(real,'Real/AR'); await sleep(800); const ar=api.getARSafety?.(); add('AR sem câmera fake',ar&&ar.fakeCamera===false&&ar.realBg===false,JSON.stringify(ar||{})); add('Clique Real sem erro novo',errors.length===before,errors.slice(before).join(' | ')||'sem erro novo');
add('Sem erro JavaScript capturado',errors.length===0,errors.slice(-6).join(' | '));
console.table(results); window.ATHOS_V474_TEST_RESULTS=results; window.ATHOS_V474_TEST_ERRORS=errors;
alert(`Teste V47.4 finalizado.\nOK: ${results.filter(r=>r.status.includes('OK')).length}\nFalhas: ${results.filter(r=>r.status.includes('FALHOU')).length}\nErros JS: ${errors.length}`);
})();