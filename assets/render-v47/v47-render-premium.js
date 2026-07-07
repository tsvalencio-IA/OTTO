// FILE: assets/render-v47/v47-render-premium.js
// ATHOS V47.1 — RENDER PREMIUM FIEL 10/10 — HOTFIX REAL DE RENDER
// Camada visual isolada. Não altera física, joystick, B Poder, AR nativo, model-viewer ou athos.glb.
(function(){
  'use strict';

  const VERSION = 'V47_3_RENDER_ALVO_SHADER_SAFE_CONTROLES_10_10';
  let installed = false;
  let group = null;
  let THREE_REF = null;
  let currentWorld = 'campo';
  let mats = {};
  let geos = {};
  let updatables = [];
  let stats = { objects:0, decorative:0, attached:0, updatables:0 };

  const WORLD_MAP = {
    field:'campo', training:'campo', hub:'campo', free:'campo', campo:'campo',
    fire:'vulcao', volcano:'vulcao', vulcao:'vulcao',
    forest:'floresta', floresta:'floresta',
    castle:'castelo', castelo:'castelo',
    space:'espaco', espaço:'espaco', espaco:'espaco',
    arena:'arena', boss:'arena', real:'real', ar:'real', camera:'real'
  };

  const PALETTES = {
    campo:{ sky:0x8bd8ff, fog:0x8bd8ff, top:0x52c85a, side:0x5f3f22, path:0xc89a5a, stone:0x8f9498, accent:0x18d8ff, magic:0xd800ff, enemy:0x2ca84a, flower:0xffe66d, glow:0x9f5cff },
    vulcao:{ sky:0x35100c, fog:0x35100c, top:0x3d3531, side:0x1d1714, path:0x5b4b45, stone:0x4a4a50, accent:0xff7a00, magic:0xff2a8a, enemy:0x7f1d1d, flower:0xffa000, glow:0xff4a00 },
    floresta:{ sky:0x12341f, fog:0x1b5e20, top:0x2e7d32, side:0x4e342e, path:0x8d6e3e, stone:0x73806f, accent:0x64ff7a, magic:0x48ffca, enemy:0x1b5e20, flower:0xf472b6, glow:0x55ff99 },
    castelo:{ sky:0x5d687a, fog:0x64748b, top:0x64748b, side:0x3f4652, path:0x9ca3af, stone:0x7b8491, accent:0xffc857, magic:0x8b5cf6, enemy:0x5b6470, flower:0xeab308, glow:0xffd28a },
    espaco:{ sky:0x03071f, fog:0x050816, top:0x1f2a44, side:0x111827, path:0x28324f, stone:0x404b70, accent:0x38bdf8, magic:0xa855f7, enemy:0x111827, flower:0x67e8f9, glow:0x7c3aed },
    arena:{ sky:0x251000, fog:0x3b1d00, top:0x7c3f18, side:0x3c1f0d, path:0x8b5a2b, stone:0x6b5a49, accent:0xff2e63, magic:0xff7a18, enemy:0x111827, flower:0xffcc33, glow:0xff2e63 }
  };

  function normalizeWorldName(world){ return WORLD_MAP[String(world||'campo').toLowerCase()] || 'campo'; }
  function norm(world){ return normalizeWorldName(world); }
  function safe(fn){ return function(){ try { return fn.apply(this, arguments); } catch(e){ console.warn('[V47.3 Render] protegido:', e); return null; } }; }
  function isObj3D(o){ return !!o && (o.isObject3D || typeof o.add === 'function' || typeof o.traverse === 'function' || o.position); }
  function meshOf(item){ return item && (item.mesh || item.object || item.group || item.model || item); }
  function addTo(parent, child){ if(parent && child && typeof parent.add === 'function') parent.add(child); return child; }

  function tex(THREE, base, speck, type){
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = base; ctx.fillRect(0,0,64,64);
    for(let i=0;i<520;i++){
      ctx.fillStyle = Math.random()>.5 ? speck : base;
      const x=(Math.random()*16|0)*4, y=(Math.random()*16|0)*4;
      ctx.fillRect(x,y,4,4);
    }
    if(type==='grassSide'){
      ctx.fillStyle = speck; ctx.fillRect(0,18,64,46);
      for(let x=0;x<64;x+=4){ const h=18+(Math.random()*16|0); ctx.fillStyle = base; ctx.fillRect(x,0,4,h); }
    }
    if(type==='path'){
      ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=3;
      for(let y=0;y<64;y+=16){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(64,y+((Math.random()-.5)*6)); ctx.stroke(); }
      for(let x=0;x<64;x+=16){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x+((Math.random()-.5)*6),64); ctx.stroke(); }
    }
    if(type==='portal'){
      const g = ctx.createRadialGradient(32,32,1,32,32,34);
      g.addColorStop(0,'#fff7ff'); g.addColorStop(.28,'#f000ff'); g.addColorStop(.68,'#7210ff'); g.addColorStop(1,'#18002f');
      ctx.fillStyle=g; ctx.fillRect(0,0,64,64);
      ctx.strokeStyle='rgba(255,255,255,.6)'; for(let i=0;i<8;i++){ ctx.beginPath(); ctx.arc(32,32,6+i*3,Math.random()*6.28,Math.random()*6.28+2.5); ctx.stroke(); }
    }
    const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  }

  function init(THREE, pal){
    if(THREE_REF === THREE && Object.keys(mats).length) return;
    THREE_REF = THREE; mats = {}; geos = {};
    geos.box = new THREE.BoxGeometry(1,1,1);
    geos.crystal = new THREE.OctahedronGeometry(.52,0);
    geos.plane = new THREE.PlaneGeometry(1,1);
    geos.circle = new THREE.CircleGeometry(1,24);

    // V47.3 SHADER SAFE:
    // A V47.1/V47.2 podia estourar MAX_TEXTURE_IMAGE_UNITS em celulares/Chrome
    // porque usava vários CanvasTexture em materiais multi-face. Aqui o render
    // fica voxel/premium por geometria, cores, emissive e luz — sem sampler pesado.
    const mat = (color, opt={}) => new THREE.MeshStandardMaterial({
      color,
      roughness: opt.roughness ?? .82,
      metalness: opt.metalness ?? 0,
      emissive: opt.emissive ?? 0x000000,
      emissiveIntensity: opt.emissiveIntensity ?? 0,
      transparent: !!opt.transparent,
      opacity: opt.opacity ?? 1,
      depthWrite: opt.depthWrite ?? true
    });
    const basic = (color,opt={}) => new THREE.MeshBasicMaterial({
      color,
      transparent: !!opt.transparent,
      opacity: opt.opacity ?? 1,
      side: opt.side ?? THREE.FrontSide,
      blending: opt.blending
    });

    mats.grass = mat(pal.top, {roughness:.92});
    mats.dirt = mat(pal.side, {roughness:.96});
    mats.path = mat(pal.path, {roughness:.90});
    mats.stone = mat(pal.stone, {roughness:.84});
    mats.wood = mat(0x6a3f22, {roughness:.90});
    mats.lava = mat(0xff4a00, {roughness:.30, emissive:0xff3b00, emissiveIntensity:1.05});
    mats.water = mat(0x18bdff, {transparent:true, opacity:.70, roughness:.12, emissive:0x006dff, emissiveIntensity:.18});
    mats.leaf = mat(pal.top, {roughness:.96});
    mats.flower = mat(pal.flower, {roughness:.70, emissive:pal.flower, emissiveIntensity:.10});
    mats.enemy = mat(pal.enemy, {roughness:.78});
    mats.enemyDark = mat(0x151923, {roughness:.72, emissive:pal.magic, emissiveIntensity:.24});
    mats.eye = basic(0xff001e);
    mats.crystalBlue = mat(0x50e6ff, {emissive:0x0bb8ff, emissiveIntensity:1.05, transparent:true, opacity:.95, roughness:.08, metalness:.18});
    mats.crystalPurple = mat(0xf032ff, {emissive:0x9f00ff, emissiveIntensity:1.05, transparent:true, opacity:.93, roughness:.08, metalness:.18});
    mats.portal = basic(pal.magic, {transparent:true, opacity:.82, side:THREE.DoubleSide, blending:THREE.AdditiveBlending});
    mats.shadow = basic(0x000000, {transparent:true, opacity:.18});
  }

  function block(THREE, mat, x,y,z, sx=1,sy=1,sz=1){
    const m = new THREE.Mesh(geos.box, mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz); m.castShadow = true; m.receiveShadow = true; group.add(m); stats.objects++; return m;
  }
  function addLight(THREE, type, color, intensity, dist, x,y,z){
    const l = type==='point' ? new THREE.PointLight(color,intensity,dist) : new THREE.DirectionalLight(color,intensity);
    l.position.set(x,y,z); if(l.castShadow!==undefined) l.castShadow = true; group.add(l); stats.objects++; return l;
  }
  function crystal(THREE,x,y,z, purple=false){
    const c = new THREE.Mesh(geos.crystal, purple?mats.crystalPurple:mats.crystalBlue); c.position.set(x,y,z); c.scale.set(.9,1.75,.9); c.castShadow = true; group.add(c); stats.objects++;
    addLight(THREE,'point', purple?0xc026ff:0x23d6ff, .85, 7, x,y,z);
    updatables.push(dt=>{ c.rotation.y += dt*1.4; c.position.y = y + Math.sin(performance.now()*.002 + x)*.16; });
    return c;
  }
  function flower(THREE,x,z,pal){
    block(THREE, new THREE.MeshStandardMaterial({color:0x2f9d45}), x,.22,z,.12,.44,.12);
    block(THREE, mats.flower, x,.55,z,.38,.22,.38); stats.decorative++;
  }
  function mushroom(THREE,x,z){
    block(THREE,new THREE.MeshStandardMaterial({color:0xfff1cf}),x,.25,z,.26,.5,.26);
    const cap=block(THREE,new THREE.MeshStandardMaterial({color:0xe53935}),x,.62,z,.9,.36,.9); stats.decorative++;
    block(THREE,new THREE.MeshStandardMaterial({color:0xffffff}),x+.18,.83,z+.15,.18,.08,.18);
    block(THREE,new THREE.MeshStandardMaterial({color:0xffffff}),x-.22,.83,z-.18,.16,.08,.16);
    return cap;
  }
  function tree(THREE,x,z,pal, tall=false){
    const h = tall?3.2:2.2;
    block(THREE,mats.wood,x,h/2,z,.62,h,.62);
    block(THREE,mats.leaf,x,h+1.0,z,2.4,1.8,2.4);
    block(THREE,mats.leaf,x,h+2.0,z,1.65,1.2,1.65); stats.decorative++;
  }
  function sign(THREE,x,z){
    block(THREE,mats.wood,x,.75,z,.22,1.5,.22);
    block(THREE,mats.wood,x+.55,1.35,z,.16,1.3,.12,.18);
    block(THREE,new THREE.MeshBasicMaterial({color:0xffffff}),x+.58,1.35,z+.1,.08,.72,.05); stats.decorative++;
  }
  function enemySkin(THREE, type, x,y,z){
    const g = new THREE.Group(); g.position.set(x,y,z);
    const mat = type==='flyer'||type==='boss' ? mats.enemyDark : type==='golem' ? mats.stone : mats.enemy;
    const s = type==='boss'?1.8:type==='golem'?1.55:type==='flyer'?1.05:1.15;
    const body = new THREE.Mesh(geos.box, mat); body.scale.set(s,s,s); body.position.y=s/2; body.castShadow=true; body.receiveShadow=true; g.add(body);
    const eyeL = new THREE.Mesh(geos.box, mats.eye); eyeL.scale.set(.22,.18,.08); eyeL.position.set(-s*.25,s*.58,s*.51); g.add(eyeL);
    const eyeR = new THREE.Mesh(geos.box, mats.eye); eyeR.scale.set(.22,.18,.08); eyeR.position.set(s*.25,s*.58,s*.51); g.add(eyeR);
    if(type==='spiky'){
      for(let i=0;i<5;i++){ const sp = new THREE.Mesh(geos.box, mats.stone); sp.scale.set(.18,.42,.18); sp.position.set((i-2)*.32,s+.2,(i%2-.5)*.5); g.add(sp); }
    }
    if(type==='golem'||type==='boss'){
      const armL = new THREE.Mesh(geos.box, mat); armL.scale.set(.45,1.25,.45); armL.position.set(-s*.75,s*.42,0); g.add(armL);
      const armR = new THREE.Mesh(geos.box, mat); armR.scale.set(.45,1.25,.45); armR.position.set(s*.75,s*.42,0); g.add(armR);
    }
    const sh = new THREE.Mesh(geos.circle, mats.shadow); sh.rotation.x = -Math.PI/2; sh.scale.set(s*1.25,s*1.25,1); sh.position.y=.03; g.add(sh);
    group.add(g); stats.objects++; stats.decorative++;
    updatables.push(dt=>{ if(type==='flyer'){ g.position.y = y+2.3+Math.sin(performance.now()*.002+x)*.45; g.rotation.y += dt*.7; } else { g.scale.y = 1 + Math.sin(performance.now()*.006+x)*.035; } });
    return g;
  }
  function portalTemple(THREE, pal, z){
    const pg = new THREE.Group(); pg.position.set(0,0,z); group.add(pg); stats.objects++;
    const add = (mat,x,y,zz,sx,sy,sz)=>{ const m=new THREE.Mesh(geos.box,mat); m.position.set(x,y,zz); m.scale.set(sx,sy,sz); m.castShadow=true; m.receiveShadow=true; pg.add(m); stats.objects++; return m; };
    for(let i=0;i<5;i++) add(mats.stone,0,.12+i*.18,2.6-i*.62,8.2-i*.8,.32,1.1);
    add(mats.stone,-3.1,2.6,0,1.2,5.2,1.2); add(mats.stone,3.1,2.6,0,1.2,5.2,1.2);
    add(mats.stone,0,5.3,0,7.8,1.05,1.35); add(mats.stone,0,6.15,0,5.3,.75,1.15);
    const p = new THREE.Mesh(geos.plane,mats.portal); p.position.set(0,2.75,.08); p.scale.set(4.6,5.1,1); pg.add(p); stats.objects++;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.35,.09,8,42), new THREE.MeshBasicMaterial({color:pal.magic, transparent:true, opacity:.85})); ring.position.set(0,2.75,.12); pg.add(ring); stats.objects++;
    addLight(THREE,'point',pal.magic,4.0,26,0,3.1,z+1.3);
    for(let i=0;i<6;i++) crystal(THREE, (i%2?1:-1)*(4.2+Math.random()*2.0), 1.1+Math.random()*1.8, z+1-Math.random()*5, true);
    updatables.push(dt=>{ p.rotation.z += dt*.45; ring.rotation.z -= dt*.25; });
  }
  function waterfall(THREE,x,z){
    const fall = block(THREE,mats.water,x,4.4,z,3.2,8.8,.34); const pool = block(THREE,mats.water,x,.08,z+2.4,4.8,.18,3.2);
    updatables.push(dt=>{ if(fall.material.map) fall.material.map.offset.y -= dt*.7; }); stats.decorative++;
  }
  function lavaSet(THREE,x,z){
    const lava = block(THREE,mats.lava,x,.04,z,7,.16,10); addLight(THREE,'point',0xff4d00,1.2,10,x,1.4,z); stats.decorative++;
    updatables.push(dt=>{ if(lava.material.map) lava.material.map.offset.x += dt*.15; });
  }
  function buildWorld(THREE, ctx, pal, world){
    const len = Math.min(420, Math.max(170, Number(ctx.level?.length || 240)));
    // base path like reference: central dirt/stone road, grass blocks and cliffs on sides.
    const pathMat = world==='castelo'||world==='espaco'||world==='vulcao' ? mats.stone : mats.path;
    for(let z=10; z>-len; z-=2){
      block(THREE,pathMat,0,.10,z,5.15,.22,2.02);
      if(world!=='espaco'){
        block(THREE,mats.grass,-5.15,.16,z,3.75,.42,2.0);
        block(THREE,mats.grass,5.15,.16,z,3.75,.42,2.0);
      } else {
        if(Math.abs(z/8|0)%2===0){ block(THREE,mats.stone,-5.15,.14,z,3.0,.36,1.6); block(THREE,mats.stone,5.15,.14,z,3.0,.36,1.6); }
      }
      if(Math.abs(z)%12===0){
        block(THREE,mats.grass,-9.0,.55,z,2.8,1.4,2.8); block(THREE,mats.grass,9.0,.55,z,2.8,1.4,2.8);
      }
    }
    // lateral rich clutter, but not on path.
    for(let z=4; z>-len+15; z-=8){
      const side = (Math.abs(z/8)%2===0)?-1:1;
      const x1 = side*(7.8+Math.random()*3.2);
      if(world==='vulcao') lavaSet(THREE, side*11.6, z-3);
      else if(world==='espaco') { crystal(THREE, x1, 1.2, z, true); }
      else {
        if(Math.random()>.35) tree(THREE,x1,z,pal,Math.random()>.55);
        if(Math.random()>.25) flower(THREE,-side*(6.8+Math.random()*2.0),z+1,pal);
        if(Math.random()>.68) mushroom(THREE,side*(4.2+Math.random()*2.5),z-1);
      }
      if(Math.abs(z)%32===0) sign(THREE, -3.8, z);
    }
    // collectibles guide line, as visual reference only.
    for(let i=0;i<7;i++){ const z = -18 - i*24; crystal(THREE, (i%2?1:-1)*1.15, 1.25, z, i>4); }
    // readable enemies in scene.
    enemySkin(THREE,'spiky',4.2,0,-34);
    enemySkin(THREE,'flyer',-2.6,2.3,-62);
    enemySkin(THREE,'golem',-7.4,1.2,-90);
    if(world==='arena') enemySkin(THREE,'boss',0,0,-118);
    waterfall(THREE,-12.5,-48);
    if(world!=='vulcao') lavaSet(THREE,13.4,-78);
    portalTemple(THREE,pal,-Math.min(118, Math.max(82, len*.48)));

    // V47.2 target-reference pass: densidade próxima ao jogador, como a imagem aprovada.
    for(let z=2; z>-118; z-=6){
      const k=Math.floor(Math.abs(z)/6);
      const lx=-3.6-(k%3)*.42, rx=3.6+(k%3)*.42;
      if(world!=='vulcao' && world!=='espaco'){
        if(k%2===0) flower(THREE,lx,z+.6,pal);
        if(k%3===0) flower(THREE,rx,z-.6,pal);
        if(k%5===0) mushroom(THREE,rx+.75,z+.2);
      }
      if(k%4===1){ crystal(THREE, (k%2?1:-1)*1.55, 1.05, z-2.2, k>10); }
      if(k%6===2){ sign(THREE, (k%2? -1:1)*3.95, z-1.6); }
      if(k%7===3){ block(THREE,mats.wood,(k%2?1:-1)*4.6,.72,z-2.6,1.25,1.25,1.25); }
    }
    // penhascos laterais mais altos e visíveis perto da câmera.
    for(let i=0;i<10;i++){
      const z=-12-i*10; const side=i%2?1:-1; const x=side*(8.2+(i%3)*1.1); const y=.9+(i%4)*.32;
      block(THREE,mats.dirt,x,y*.55,z,3.4,1.1+y*.25,3.2);
      block(THREE,mats.grass,x,y+1.02,z,3.55,.34,3.35);
      if(i%2===0) tree(THREE,x,y?z:z,pal,true);
      if(i%3===0) crystal(THREE,x+side*.9,y+1.5,z+.8,true);
    }
    // distant floating islands/clouds.
    const dummy = new THREE.Object3D();
    const islandMesh = new THREE.InstancedMesh(geos.box, mats.dirt, 22);
    for(let i=0;i<22;i++){ dummy.position.set((Math.random()>.5?1:-1)*(15+Math.random()*42), 4+Math.random()*18, -34-Math.random()*len); dummy.scale.set(3+Math.random()*8, .9+Math.random()*3, 3+Math.random()*8); dummy.updateMatrix(); islandMesh.setMatrixAt(i,dummy.matrix); }
    group.add(islandMesh); stats.objects++;
    const cloudMat = new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:world==='espaco'?.15:.78});
    for(let i=0;i<18;i++){
      const c = new THREE.Group();
      const m1=new THREE.Mesh(geos.box,cloudMat); m1.scale.set(2.6,.52,1.1); c.add(m1);
      const m2=new THREE.Mesh(geos.box,cloudMat); m2.scale.set(1.5,.5,1); m2.position.set(1.7,.08,.2); c.add(m2);
      c.position.set((Math.random()-.5)*60, 12+Math.random()*16, -20-Math.random()*len); group.add(c); stats.objects++;
      updatables.push(dt=>{ c.position.x += dt*.16; if(c.position.x>34)c.position.x=-34; });
    }
  }
  function attachToEngineObjects(THREE, ctx){
    // Defensive: enemies in our engine are plain objects {mesh,type}. Gemini's first code expected Object3D and failed.
    const enemies = Array.isArray(ctx.enemies)?ctx.enemies:[];
    enemies.forEach((e,idx)=>{
      const host = meshOf(e);
      if(!isObj3D(host) || host.userData?.v471SkinAttached) return;
      try{
        host.userData = host.userData || {}; host.userData.v471SkinAttached = true;
        const s = enemySkin(THREE, e.type || 'walker', 0, -9999, 0); // create in group, then reparent pieces safely by following host instead of modifying host hierarchy
        updatables.push(()=>{ if(host.position){ s.position.copy(host.position); s.position.y = (host.position.y||0) - ((e.size||1)/2); s.rotation.y = host.rotation?.y || 0; } });
        stats.attached++;
      }catch(err){ console.warn('[V47.3 Render] enemy skin ignorada', err); }
    });
  }

  const API = {
    version: VERSION,
    install: safe(function(ctx){
      if(!ctx || !ctx.THREE || !ctx.scene) return false;
      installed = true; document.body.classList.add('v47-premium-active');
      return true;
    }),
    rebuildWorld: safe(function(ctx, worldName){
      if(!installed || !ctx || !ctx.THREE || !ctx.scene) return false;
      const THREE = ctx.THREE; currentWorld = norm(worldName || ctx.currentWorld || ctx.level?.world || 'campo');
      API.disposeVisualOnly();
      if(currentWorld === 'real') { stats = {objects:0,decorative:0,attached:0,updatables:0}; return true; }
      const pal = PALETTES[currentWorld] || PALETTES.campo;
      init(THREE,pal);
      group = new THREE.Group(); group.name = 'V47_RENDER_PREMIUM_GROUP'; ctx.scene.add(group);
      stats = {objects:0, decorative:0, attached:0, updatables:0};
      try { if(ctx.scene) { ctx.scene.background = new THREE.Color(pal.sky); ctx.scene.fog = new THREE.FogExp2(pal.fog, currentWorld==='espaco'?.0012:currentWorld==='vulcao'?.0030:.0009); } } catch{}
      try { if(ctx.renderer && ctx.renderer.shadowMap){ ctx.renderer.shadowMap.enabled = true; ctx.renderer.shadowMap.type = THREE.PCFSoftShadowMap; } if(ctx.renderer && ctx.renderer.toneMapping !== undefined){ ctx.renderer.toneMapping = THREE.ACESFilmicToneMapping; ctx.renderer.toneMappingExposure = currentWorld==='vulcao'?1.12:1.02; } } catch{}
      addLight(THREE,'point',pal.glow,.8,22,-8,8,-30);
      addLight(THREE,'point',pal.magic,1.5,30,8,8,-110);
      const hemi = new THREE.HemisphereLight(0xffffff, pal.side, currentWorld==='espaco'?.48:.72); group.add(hemi); stats.objects++;
      const sun = new THREE.DirectionalLight(currentWorld==='vulcao'?0xffd199:0xfff5dd, 1.25); sun.position.set(-12,24,18); sun.castShadow = true; if(sun.shadow){ sun.shadow.mapSize.width=1024; sun.shadow.mapSize.height=1024; sun.shadow.camera.left=-32; sun.shadow.camera.right=32; sun.shadow.camera.top=32; sun.shadow.camera.bottom=-32; sun.shadow.camera.far=120; } group.add(sun); stats.objects++;
      buildWorld(THREE,ctx,pal,currentWorld);
      attachToEngineObjects(THREE,ctx);
      stats.updatables = updatables.length;
      return true;
    }),
    update: safe(function(ctx,dt){
      if(!installed || !group) return;
      const delta = typeof dt === 'number' ? dt : .016;
      for(let i=0;i<updatables.length;i++){ try{ updatables[i](delta); }catch(e){} }
    }),
    disposeVisualOnly: safe(function(){
      if(group && group.parent){ group.parent.remove(group); }
      group = null; updatables = [];
    }),
    dispose: safe(function(){ API.disposeVisualOnly(); installed = false; document.body.classList.remove('v47-premium-active'); }),
    getStatus: function(){ return { installed, version:VERSION, world:currentWorld, hasGroup:!!group, objects:stats.objects||0, decorative:stats.decorative||0, attached:stats.attached||0, updatablesCount:updatables.length, worldNormalizer:true, arTouched:false, renderFixed:true }; }
  };

  window.ATHOS_V47_RENDER_PREMIUM = API;
})();
