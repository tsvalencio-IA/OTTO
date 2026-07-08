(async()=>{
  'use strict';

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const results = [];
  const errors = [];
  const $ = selector => document.querySelector(selector);

  window.addEventListener('error', event => errors.push(event.message || 'Erro JS'));
  window.addEventListener('unhandledrejection', event => errors.push(String(event.reason || 'Promise rejeitada')));

  function add(name, ok, detail=''){
    const row = { teste:name, status:ok ? 'OK' : 'FALHOU', detalhe:String(detail || '') };
    results.push(row);
    console[ok ? 'log' : 'warn'](`${row.status} - ${name}`, detail || '');
  }

  function visible(el){
    if (!el) return false;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0;
  }

  function rect(el){
    const r = el.getBoundingClientRect();
    return {
      x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height),
      right:Math.round(innerWidth - r.right), bottom:Math.round(innerHeight - r.bottom)
    };
  }

  function inside(el){
    if (!visible(el)) return false;
    const r = el.getBoundingClientRect();
    return r.left >= -4 && r.top >= -4 && r.right <= innerWidth + 4 && r.bottom <= innerHeight + 4;
  }

  function overlap(a,b){
    if (!visible(a) || !visible(b)) return false;
    const r1 = a.getBoundingClientRect();
    const r2 = b.getBoundingClientRect();
    return !(r1.right <= r2.left || r2.right <= r1.left || r1.bottom <= r2.top || r2.bottom <= r1.top);
  }

  async function httpOk(path){
    try {
      const r = await fetch(`${path}?v54test=${Date.now()}`, { method:'GET', cache:'no-store' });
      add(`HTTP 200 ${path}`, r.ok, `HTTP ${r.status}`);
      return r.ok ? await r.text() : '';
    } catch (err) {
      add(`HTTP 200 ${path}`, false, err.message);
      return '';
    }
  }

  function syntaxOk(name, source){
    try {
      new Function(source);
      add(`${name} sem erro de sintaxe`, true);
    } catch (err) {
      add(`${name} sem erro de sintaxe`, false, `${err.name}: ${err.message}`);
    }
  }

  async function tap(el,name){
    if (!el) {
      add(`Clique ${name}`, false, 'nao encontrado');
      return false;
    }
    el.scrollIntoView({ block:'center', inline:'center' });
    await sleep(80);
    el.click();
    add(`Clique ${name}`, true, el.id || el.textContent || name);
    return true;
  }

  console.log('%cATHOS V54 RENDER PREMIUM', 'font-size:20px;color:#8bff8b;background:#111;padding:8px');

  const files = [
    './index.html',
    './style.css',
    './app.js',
    './sw.js',
    './athos.glb',
    './manifest.webmanifest',
    './assets/render-v54/v54-render-premium.js',
    './assets/render-v54/v54-render-premium.css',
    './assets/render-v54/v54-render-config.json',
    './F12_TESTE_ATHOS_V54_RENDER_PREMIUM.js'
  ];
  const fetched = {};
  for (const file of files) fetched[file] = await httpOk(file);

  add('Titulo V54', /V54/i.test(document.title), document.title);

  const lobby = $('#lobby');
  const lobbyText = (lobby && lobby.innerText || '').toLowerCase();
  const forbidden = ['v49','v50','codex','debug','render exigido','base novo repositório','base novo repositorio'];
  add('Lobby sem texto tecnico proibido', !forbidden.some(word => lobbyText.includes(word)), forbidden.filter(word => lobbyText.includes(word)).join(', '));
  add('Titulo visivel infantil', /Athos Adventure 3D\+/i.test(lobbyText), $('#lobby h1')?.textContent || '');
  add('Subtitulo visivel correto', /Jogue, colete cristais e vença os monstros/i.test(lobbyText), $('.subtitle')?.textContent || '');

  syntaxOk('app.js', fetched['./app.js']);
  syntaxOk('sw.js', fetched['./sw.js']);
  syntaxOk('render-v54', fetched['./assets/render-v54/v54-render-premium.js']);
  syntaxOk('F12 V54', fetched['./F12_TESTE_ATHOS_V54_RENDER_PREMIUM.js']);

  await tap($('#playBtn') || $('#heroPlayBtn'), 'JOGAR');
  await sleep(4200);

  const api = window.ATHOS_TEST_API || {};
  const status = api.getV54Render ? api.getV54Render() : (window.ATHOS_V54_RENDER_PREMIUM?.getStatus?.() || null);
  add('Render V54 carregado', !!(window.ATHOS_V54_RENDER_PREMIUM && status && status.version === 'V54_RENDER_PREMIUM_VERDADEIRO'), JSON.stringify(status || {}));
  add('Render V54 instalado', !!(status && status.installed && status.hasGroup), JSON.stringify(status || {}));
  add('Mundo tem objetos visuais premium', !!(status && status.objects >= 220 && status.animated >= 20), JSON.stringify({ objects:status?.objects, animated:status?.animated }));

  const f = status?.features || {};
  add('Portal premium existe', (f.portal || 0) >= 1, JSON.stringify(f));
  add('Cristais premium existem', (f.crystals || 0) >= 8, JSON.stringify(f));
  add('Vegetacao premium existe', (f.vegetation || 0) >= 20, JSON.stringify(f));
  add('Flores/cogumelos existem', (f.flowers || 0) >= 4 && (f.mushrooms || 0) >= 2, JSON.stringify(f));
  add('Inimigos diferentes existem', (f.enemies || 0) >= 5 && (f.shieldEnemy || 0) >= 1 && (f.jumpEnemy || 0) >= 1 && (f.crouchEnemy || 0) >= 1, JSON.stringify(f));
  add('Lava/agua/buraco existem', (f.lava || 0) >= 1 && (f.water || 0) >= 1 && (f.pit || 0) >= 1, JSON.stringify(f));
  add('Espada escudo estrela existem', (f.sword || 0) >= 1 && (f.shield || 0) >= 1 && (f.star || 0) >= 1, JSON.stringify(f));

  const joy = $('#joystick');
  const grid = $('.action-grid');
  const worlds = $('.world-strip');
  const hud = $('.top-hud');
  const objective = $('.objective-card');
  add('Joystick dentro da tela', inside(joy), JSON.stringify(rect(joy)));
  add('Botoes dentro da tela', inside(grid), JSON.stringify(rect(grid)));
  add('Mundos dentro da tela', inside(worlds), JSON.stringify(rect(worlds)));
  add('HUD dentro da tela', inside(hud), JSON.stringify(rect(hud)));
  add('Objetivo dentro da tela', inside(objective), JSON.stringify(rect(objective)));
  add('Joystick nao sobrepoe botoes', visible(joy) && visible(grid) && !overlap(joy,grid), JSON.stringify({ joy:rect(joy), grid:rect(grid) }));

  const p0 = api.getPlayerState?.();
  await sleep(500);
  const p1 = api.getPlayerState?.();
  add('Athos parado nao anda sozinho', p0 && p1 && Math.abs((p1.x-p0.x)||0)<.08 && Math.abs((p1.z-p0.z)||0)<.08, JSON.stringify({ antes:p0, depois:p1 }));

  await tap($('.world-chip[data-world="real"]'), 'Real/AR');
  await sleep(900);
  const p2 = api.getPlayerState?.();
  await sleep(500);
  const p3 = api.getPlayerState?.();
  add('Real/AR nao move Athos sozinho', p2 && p3 && Math.abs((p3.x-p2.x)||0)<.08 && Math.abs((p3.z-p2.z)||0)<.08, JSON.stringify({ antes:p2, depois:p3, ar:api.getARSafety?.() }));

  add('Sem erro JS', errors.length === 0, errors.slice(-5).join(' | '));

  console.table(results);
  window.ATHOS_V54_TEST_RESULTS = results;
  alert(`Teste V54 finalizado.\nOK: ${results.filter(r=>r.status==='OK').length}\nFalhas: ${results.filter(r=>r.status==='FALHOU').length}\nErros JS: ${errors.length}`);
})();
