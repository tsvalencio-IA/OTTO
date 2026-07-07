/**
 * ATHOS ADVENTURE 3D+ | RENDER PREMIUM V46
 * Camada visual Voxel Premium independente focada em fidelidade gráfica (Referência 10/10).
 * Arquivo 100% completo, gerando texturas procedurais e modelos compostos in-line.
 */

window.ATHOS_V46_RENDER_PREMIUM = (function() {
    // --- ESTADO INTERNO ---
    const VERSION = "V46_RENDER_PREMIUM_10_10";
    let isInstalled = false;
    let renderGroup = null;
    let currentCtx = null;
    let updatables = [];
    let textures = {};
    let materials = {};
    let currentWorldState = "campo";
    let arModeAtivo = false;

    // --- UTILITÁRIOS DEFENSIVOS ---
    function safe(fn) {
        return function(...args) {
            try { return fn.apply(this, args); } 
            catch (e) { console.warn("[V46 Render Premium] Proteção ativada:", e); }
        };
    }



    // Mapeia os nomes reais usados no jogo Athos para os nomes do pacote visual.
    // Isso evita o erro que fazia todos os mundos caírem no mesmo visual genérico.
    function normalizeWorldName(worldName) {
        const w = String(worldName || 'campo').toLowerCase();
        const map = {
            field: 'campo',
            training: 'campo',
            hub: 'campo',
            campo: 'campo',
            fire: 'vulcao',
            volcano: 'vulcao',
            vulcao: 'vulcao',
            vulcão: 'vulcao',
            forest: 'floresta',
            floresta: 'floresta',
            castle: 'castelo',
            castelo: 'castelo',
            space: 'espaco',
            espaço: 'espaco',
            espaco: 'espaco',
            arena: 'arena',
            real: 'real'
        };
        return map[w] || w || 'campo';
    }

    // --- GERADOR DE TEXTURAS PROCEDURAIS (PIXEL ART STYLE) ---
    const TextureGen = {
        generateCanvas: function(size, fn) {
            const canvas = document.createElement('canvas');
            canvas.width = size; canvas.height = size;
            const ctx = canvas.getContext('2d');
            fn(ctx, size);
            return canvas;
        },
        createVoxelTexture: function(THREE, type) {
            const size = 64;
            let canvas;
            
            if (type === 'grass_side') {
                canvas = this.generateCanvas(size, (ctx, s) => {
                    // Terra no fundo
                    ctx.fillStyle = '#6D4C41'; ctx.fillRect(0, 0, s, s);
                    for(let i=0; i<300; i++) {
                        ctx.fillStyle = Math.random() > 0.5 ? '#5D4037' : '#795548';
                        ctx.fillRect(Math.random()*s, Math.random()*s, 4, 4);
                    }
                    // Grama caindo no topo
                    ctx.fillStyle = '#4CAF50'; ctx.fillRect(0, 0, s, s*0.3);
                    for(let x=0; x<s; x+=4) {
                        let h = s*0.3 + Math.random() * 8;
                        ctx.fillStyle = '#4CAF50'; ctx.fillRect(x, 0, 4, h);
                        ctx.fillStyle = '#388E3C'; ctx.fillRect(x, h-4, 4, 4);
                    }
                });
            } else if (type === 'grass_top') {
                canvas = this.generateCanvas(size, (ctx, s) => {
                    ctx.fillStyle = '#4CAF50'; ctx.fillRect(0, 0, s, s);
                    for(let i=0; i<400; i++) {
                        ctx.fillStyle = Math.random() > 0.5 ? '#388E3C' : '#81C784';
                        ctx.fillRect(Math.random()*s, Math.random()*s, 4, 4);
                    }
                });
            } else if (type === 'dirt') {
                canvas = this.generateCanvas(size, (ctx, s) => {
                    ctx.fillStyle = '#6D4C41'; ctx.fillRect(0, 0, s, s);
                    for(let i=0; i<400; i++) {
                        ctx.fillStyle = Math.random() > 0.5 ? '#5D4037' : '#795548';
                        ctx.fillRect(Math.random()*s, Math.random()*s, 4, 4);
                    }
                });
            } else if (type === 'path') {
                canvas = this.generateCanvas(size, (ctx, s) => {
                    ctx.fillStyle = '#D7CCC8'; ctx.fillRect(0, 0, s, s); // Base clara
                    for(let i=0; i<200; i++) {
                        ctx.fillStyle = Math.random() > 0.5 ? '#BCAAA4' : '#EFEBE9';
                        ctx.fillRect(Math.random()*s, Math.random()*s, 8, 8); // Blocos maiores
                    }
                    // Bordas sutis simulando pedras
                    ctx.fillStyle = 'rgba(0,0,0,0.1)';
                    ctx.fillRect(0,0,s,2); ctx.fillRect(0,0,2,s);
                });
            } else if (type === 'stone') {
                canvas = this.generateCanvas(size, (ctx, s) => {
                    ctx.fillStyle = '#9E9E9E'; ctx.fillRect(0, 0, s, s);
                    for(let i=0; i<300; i++) {
                        ctx.fillStyle = Math.random() > 0.5 ? '#757575' : '#BDBDBD';
                        ctx.fillRect(Math.random()*s, Math.random()*s, 4, 4);
                    }
                    ctx.fillStyle = 'rgba(0,0,0,0.2)';
                    ctx.fillRect(0,0,s,2); ctx.fillRect(0,0,2,s);
                });
            } else if (type === 'wood') {
                canvas = this.generateCanvas(size, (ctx, s) => {
                    ctx.fillStyle = '#795548'; ctx.fillRect(0, 0, s, s);
                    for(let y=0; y<s; y+=8) {
                        ctx.fillStyle = '#5D4037';
                        ctx.fillRect(0, y + Math.random()*4, s, 2);
                    }
                });
            } else if (type === 'lava') {
                canvas = this.generateCanvas(size, (ctx, s) => {
                    ctx.fillStyle = '#FF3D00'; ctx.fillRect(0, 0, s, s);
                    for(let i=0; i<200; i++) {
                        ctx.fillStyle = Math.random() > 0.5 ? '#FFC107' : '#DD2C00';
                        ctx.fillRect(Math.random()*s, Math.random()*s, 8, 8);
                    }
                });
            }

            if (!canvas) return null;
            const tex = new THREE.CanvasTexture(canvas);
            tex.magFilter = THREE.NearestFilter;
            tex.minFilter = THREE.NearestFilter;
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            return tex;
        },

        initMaterials: function(THREE) {
            if (Object.keys(materials).length > 0) return;
            
            textures.grassTop = this.createVoxelTexture(THREE, 'grass_top');
            textures.grassSide = this.createVoxelTexture(THREE, 'grass_side');
            textures.dirt = this.createVoxelTexture(THREE, 'dirt');
            textures.path = this.createVoxelTexture(THREE, 'path');
            textures.stone = this.createVoxelTexture(THREE, 'stone');
            textures.wood = this.createVoxelTexture(THREE, 'wood');
            textures.lava = this.createVoxelTexture(THREE, 'lava');

            materials.dirt = new THREE.MeshStandardMaterial({ map: textures.dirt, roughness: 1.0 });
            materials.path = new THREE.MeshStandardMaterial({ map: textures.path, roughness: 0.9 });
            materials.stone = new THREE.MeshStandardMaterial({ map: textures.stone, roughness: 0.8 });
            materials.wood = new THREE.MeshStandardMaterial({ map: textures.wood, roughness: 0.9 });
            materials.leaves = new THREE.MeshStandardMaterial({ color: 0x33691E, roughness: 1.0 });
            materials.lava = new THREE.MeshStandardMaterial({ map: textures.lava, emissive: 0xFF3D00, emissiveIntensity: 0.8, roughness: 0.2 });
            materials.water = new THREE.MeshStandardMaterial({ color: 0x29B6F6, transparent: true, opacity: 0.7, roughness: 0.1 });
            materials.crystalBlue = new THREE.MeshStandardMaterial({ color: 0x00E5FF, emissive: 0x00B0FF, emissiveIntensity: 0.6, transparent: true, opacity: 0.9, roughness: 0.1, metalness: 0.5 });
            materials.crystalPurple = new THREE.MeshStandardMaterial({ color: 0xD500F9, emissive: 0xAA00FF, emissiveIntensity: 0.6, transparent: true, opacity: 0.9, roughness: 0.1, metalness: 0.5 });
            
            // Material composto para bloco de grama (lados com terra, topo com grama)
            materials.grassBlock = [
                new THREE.MeshStandardMaterial({ map: textures.grassSide, roughness: 1.0 }), // right
                new THREE.MeshStandardMaterial({ map: textures.grassSide, roughness: 1.0 }), // left
                new THREE.MeshStandardMaterial({ map: textures.grassTop, roughness: 1.0 }),  // top
                materials.dirt, // bottom
                new THREE.MeshStandardMaterial({ map: textures.grassSide, roughness: 1.0 }), // front
                new THREE.MeshStandardMaterial({ map: textures.grassSide, roughness: 1.0 })  // back
            ];
        }
    };

    // --- CONSTRUTORES DE ENTIDADES (VOXEL ART) ---
    const VoxelEntities = {
        createBlock: function(THREE, mat, w, h, d, x, y, z, castShadow=true) {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
            mesh.position.set(x, y, z);
            mesh.castShadow = castShadow;
            mesh.receiveShadow = true;
            return mesh;
        },

        buildTerrain: function(THREE, group, worldType) {
            const length = 120;
            const width = 40;
            
            // Chão Base Profundo (Dirt/Stone)
            let baseMat = materials.dirt;
            if (worldType === 'vulcao' || worldType === 'espaco' || worldType === 'castelo') baseMat = materials.stone;
            const base = this.createBlock(THREE, baseMat, width, 10, length, 0, -5.5, -length/2 + 10);
            group.add(base);

            // Caminho Central (Paved)
            const pathWidth = 6;
            let pathMat = materials.path;
            if (worldType === 'vulcao') pathMat = materials.stone;
            for (let z = 10; z > -length; z -= 2) {
                const pathBlock = this.createBlock(THREE, pathMat, pathWidth, 1, 2, 0, -0.4, z);
                group.add(pathBlock);
            }

            // Blocos Laterais Ricos (Grama Elevada, Ilhas, etc)
            for (let z = 10; z > -length; z -= 2) {
                for (let x = -width/2; x <= width/2; x += 2) {
                    if (Math.abs(x) <= pathWidth/2) continue; // Pula o caminho
                    
                    // Probabilidade de criar blocos nas laterais formando "paredões" ou desníveis
                    let height = Math.random() > 0.8 ? 1 + Math.random() * 2 : 0;
                    if (Math.abs(x) > pathWidth/2 + 2) height += Math.random() * 3; // Mais alto nas bordas extremas

                    if (height > 0) {
                        let blockMat = materials.grassBlock;
                        if (worldType === 'vulcao') blockMat = materials.stone;
                        else if (worldType === 'espaco') blockMat = materials.stone;

                        const b = this.createBlock(THREE, blockMat, 2, height, 2, x, height/2 - 0.5, z);
                        group.add(b);

                        // Decorações em cima do bloco
                        if (Math.random() > 0.85 && worldType === 'campo') {
                            this.buildDecoration(THREE, group, x, height, z);
                        }
                    }
                }
            }
        },

        buildDecoration: function(THREE, group, x, y, z) {
            const rand = Math.random();
            if (rand < 0.3) {
                // Flor
                const stem = this.createBlock(THREE, new THREE.MeshStandardMaterial({color: 0x4CAF50}), 0.1, 0.4, 0.1, x, y+0.2, z);
                const petalColor = Math.random() > 0.5 ? 0xFFEB3B : 0xFF4081;
                const petal = this.createBlock(THREE, new THREE.MeshStandardMaterial({color: petalColor}), 0.4, 0.2, 0.4, x, y+0.5, z);
                group.add(stem, petal);
            } else if (rand < 0.6) {
                // Cogumelo Vermelho Voxel
                const stem = this.createBlock(THREE, new THREE.MeshStandardMaterial({color: 0xFFECB3}), 0.4, 0.5, 0.4, x, y+0.25, z);
                const cap = this.createBlock(THREE, new THREE.MeshStandardMaterial({color: 0xE53935}), 1.0, 0.4, 1.0, x, y+0.7, z);
                // Pontinhos brancos (simplificado adicionando pequenos boxes)
                const spotMat = new THREE.MeshStandardMaterial({color: 0xFFFFFF});
                const s1 = this.createBlock(THREE, spotMat, 0.2, 0.1, 0.2, x+0.2, y+0.9, z+0.2);
                const s2 = this.createBlock(THREE, spotMat, 0.2, 0.1, 0.2, x-0.3, y+0.9, z-0.2);
                group.add(stem, cap, s1, s2);
            } else {
                // Árvore
                const trunk = this.createBlock(THREE, materials.wood, 0.8, 2, 0.8, x, y+1, z);
                const leaves1 = this.createBlock(THREE, materials.leaves, 3, 2, 3, x, y+2.5, z);
                const leaves2 = this.createBlock(THREE, materials.leaves, 2, 1.5, 2, x, y+4, z);
                group.add(trunk, leaves1, leaves2);
            }
        },

        buildSign: function(THREE, group, x, y, z) {
            const post = this.createBlock(THREE, materials.wood, 0.2, 1.5, 0.2, x, y+0.75, z);
            const board = this.createBlock(THREE, materials.wood, 1.5, 0.8, 0.1, x+0.5, y+1.2, z+0.15);
            const arrow = this.createBlock(THREE, new THREE.MeshStandardMaterial({color: 0xFFFFFF}), 0.8, 0.2, 0.12, x+0.5, y+1.2, z+0.16);
            group.add(post, board, arrow);
        },

        buildCrystal: function(THREE, group, x, y, z, type='blue') {
            const mat = type === 'blue' ? materials.crystalBlue : materials.crystalPurple;
            const cGroup = new THREE.Group();
            
            // Formato diamante voxel
            const bottom = this.createBlock(THREE, mat, 0.5, 0.5, 0.5, 0, 0, 0);
            const mid = this.createBlock(THREE, mat, 0.7, 0.8, 0.7, 0, 0.65, 0);
            const top = this.createBlock(THREE, mat, 0.4, 0.5, 0.4, 0, 1.3, 0);
            cGroup.add(bottom, mid, top);
            cGroup.position.set(x, y, z);
            
            // Luz
            const color = type === 'blue' ? 0x00E5FF : 0xD500F9;
            const light = new THREE.PointLight(color, 1.5, 6);
            light.position.set(0, 0.65, 0);
            cGroup.add(light);

            group.add(cGroup);
            updatables.push({ mesh: cGroup, type: 'crystal', baseY: y });
        },

        buildSpikyEnemy: function(THREE, group, x, y, z) {
            // Baseado na referência: Cubo verde com espinhos e olhos vermelhos
            const eGroup = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({color: 0x43A047, roughness: 0.8});
            const spikeMat = new THREE.MeshStandardMaterial({color: 0x9E9E9E});
            const eyeMat = new THREE.MeshBasicMaterial({color: 0xFF1744});

            const body = this.createBlock(THREE, bodyMat, 1.8, 1.8, 1.8, 0, 0.9, 0);
            eGroup.add(body);

            // Olhos
            eGroup.add(this.createBlock(THREE, eyeMat, 0.3, 0.2, 0.1, -0.4, 1.0, 0.95));
            eGroup.add(this.createBlock(THREE, eyeMat, 0.3, 0.2, 0.1, 0.4, 1.0, 0.95));

            // Espinhos no topo
            eGroup.add(this.createBlock(THREE, spikeMat, 0.2, 0.3, 0.2, -0.5, 1.9, -0.5));
            eGroup.add(this.createBlock(THREE, spikeMat, 0.2, 0.3, 0.2, 0.5, 1.9, 0.5));
            eGroup.add(this.createBlock(THREE, spikeMat, 0.2, 0.4, 0.2, 0, 1.95, 0));

            eGroup.position.set(x, y, z);
            group.add(eGroup);
            updatables.push({ mesh: eGroup, type: 'enemy_bounce', baseY: y });
        },

        buildFlyingEnemy: function(THREE, group, x, y, z) {
            // Cubo escuro/roxo flutuante
            const eGroup = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({color: 0x212121, emissive: 0x311B92, emissiveIntensity: 0.4});
            const eyeMat = new THREE.MeshBasicMaterial({color: 0xD500F9});

            const body = this.createBlock(THREE, bodyMat, 1.2, 1.2, 1.2, 0, 0, 0);
            const eyeL = this.createBlock(THREE, eyeMat, 0.2, 0.2, 0.1, -0.3, 0.2, 0.65);
            const eyeR = this.createBlock(THREE, eyeMat, 0.2, 0.2, 0.1, 0.3, 0.2, 0.65);
            
            // Partículas orbitando (cubos menores)
            const p1 = this.createBlock(THREE, eyeMat, 0.2, 0.2, 0.2, -1, 0, 0);
            const p2 = this.createBlock(THREE, eyeMat, 0.2, 0.2, 0.2, 1, 0, 0);

            eGroup.add(body, eyeL, eyeR, p1, p2);
            eGroup.position.set(x, y, z);
            group.add(eGroup);
            updatables.push({ mesh: eGroup, type: 'enemy_fly', baseY: y, p1: p1, p2: p2 });
        },

        buildGolem: function(THREE, group, x, y, z) {
            const gGroup = new THREE.Group();
            const mat = materials.stone;
            const eyeMat = new THREE.MeshBasicMaterial({color: 0xFF1744});

            const torso = this.createBlock(THREE, mat, 2, 2.5, 1.5, 0, 1.25, 0);
            const head = this.createBlock(THREE, mat, 1, 1, 1, 0, 3, 0);
            const armL = this.createBlock(THREE, mat, 0.8, 2.5, 0.8, -1.6, 1.5, 0);
            const armR = this.createBlock(THREE, mat, 0.8, 2.5, 0.8, 1.6, 1.5, 0);
            
            const eye1 = this.createBlock(THREE, eyeMat, 0.2, 0.15, 0.1, -0.2, 3.1, 0.55);
            const eye2 = this.createBlock(THREE, eyeMat, 0.2, 0.15, 0.1, 0.2, 3.1, 0.55);

            gGroup.add(torso, head, armL, armR, eye1, eye2);
            gGroup.position.set(x, y, z);
            group.add(gGroup);
        },

        buildPortalTemple: function(THREE, group, zPos) {
            const pGroup = new THREE.Group();
            const stoneMat = materials.stone;
            const darkStoneMat = new THREE.MeshStandardMaterial({color: 0x424242, roughness: 0.9});
            const portalGlowMat = new THREE.MeshBasicMaterial({color: 0xD500F9, transparent: true, opacity: 0.8, side: THREE.DoubleSide});

            // Escadas
            for (let i = 0; i < 4; i++) {
                pGroup.add(this.createBlock(THREE, stoneMat, 8 - i, 0.5, 1, 0, i*0.5, i));
            }

            const baseY = 2;
            const baseZ = -1;
            // Base do templo
            pGroup.add(this.createBlock(THREE, stoneMat, 10, 1, 4, 0, baseY, baseZ));
            
            // Colunas
            pGroup.add(this.createBlock(THREE, darkStoneMat, 2, 6, 2, -3, baseY + 3.5, baseZ));
            pGroup.add(this.createBlock(THREE, darkStoneMat, 2, 6, 2, 3, baseY + 3.5, baseZ));
            
            // Topo
            pGroup.add(this.createBlock(THREE, stoneMat, 10, 2, 3, 0, baseY + 7.5, baseZ));
            pGroup.add(this.createBlock(THREE, stoneMat, 6, 1, 2, 0, baseY + 9, baseZ)); // Detalhe central

            // Portal Glow
            const portalInner = this.createBlock(THREE, portalGlowMat, 4, 5, 0.2, 0, baseY + 3.5, baseZ);
            pGroup.add(portalInner);

            // Luz Forte
            const light = new THREE.PointLight(0xD500F9, 5, 20);
            light.position.set(0, baseY + 3.5, baseZ + 2);
            pGroup.add(light);

            pGroup.position.set(0, -0.5, zPos);
            group.add(pGroup);
            updatables.push({ mesh: portalInner, type: 'portal', light: light });
        },

        buildWaterfall: function(THREE, group, x, y, z) {
            const waterMat = materials.water;
            const fall = this.createBlock(THREE, waterMat, 3, 10, 0.5, x, y + 5, z);
            const pool = this.createBlock(THREE, waterMat, 5, 0.5, 4, x, y + 0.25, z + 2);
            group.add(fall, pool);
            updatables.push({ mesh: fall, type: 'waterfall' });
        }
    };

    // --- ILUMINAÇÃO PREMIUM ---
    const applyPremiumLighting = safe(function(ctx, worldName) {
        if (!ctx.THREE || !ctx.scene || !renderGroup) return;
        
        // Remove luzes antigas
        const toRemove = [];
        renderGroup.children.forEach(c => { if(c.isLight) toRemove.push(c); });
        toRemove.forEach(c => renderGroup.remove(c));

        const THREE = ctx.THREE;
        
        // Luz Ambiente Suave (Hemisphere para simular rebatimento do céu e chão)
        const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0x444444, 0.5);
        
        // Luz Direcional Principal (Sol Quente Cinematico)
        const dirLight = new THREE.DirectionalLight(0xFFF3E0, 1.2);
        dirLight.position.set(15, 25, 10);
        dirLight.castShadow = true;
        if(dirLight.shadow) {
            dirLight.shadow.mapSize.width = 2048; // Alta resolução para bordas nítidas Voxel
            dirLight.shadow.mapSize.height = 2048;
            dirLight.shadow.camera.near = 0.5;
            dirLight.shadow.camera.far = 100;
            const d = 25;
            dirLight.shadow.camera.left = -d; dirLight.shadow.camera.right = d;
            dirLight.shadow.camera.top = d; dirLight.shadow.camera.bottom = -d;
            dirLight.shadow.bias = -0.0005;
        }

        // Rim Light Azul/Roxa para contra-luz
        const rimLight = new THREE.DirectionalLight(0x00E5FF, 0.4);
        rimLight.position.set(-15, 10, -20);

        renderGroup.add(hemiLight, dirLight, rimLight);

        // Fog simulando profundidade
        ctx.scene.fog = new THREE.Fog(0x87CEEB, 20, 80);

        // Tone Mapping
        if (ctx.renderer) {
            ctx.renderer.shadowMap.enabled = true;
            ctx.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            if(ctx.renderer.toneMapping !== undefined) {
                ctx.renderer.toneMapping = THREE.ACESFilmicToneMapping;
                ctx.renderer.toneMappingExposure = 1.1;
            }
        }
    });

    const applyPremiumCameraHints = safe(function(ctx) {
        if (!ctx.camera) return;
        window.ATHOS_V46_RENDER_PREMIUM.cameraPreset = {
            height: 6.0,
            distance: 9.0,
            lookAhead: 8,
            fov: 45, // FOV menor deixa isométrico/cinemático
            smoothing: 0.1
        };
        if(ctx.camera.fov) {
            ctx.camera.fov = 48;
            if(ctx.camera.updateProjectionMatrix) ctx.camera.updateProjectionMatrix();
        }
    });

    // --- API PÚBLICA ---
    return {
        version: VERSION,
        
        install: safe(function(ctx) {
            if(isInstalled) return;
            if (!ctx || !ctx.THREE || !ctx.scene) return;
            currentCtx = ctx;
            
            TextureGen.initMaterials(ctx.THREE);

            renderGroup = new ctx.THREE.Group();
            renderGroup.name = "V46_RENDER_PREMIUM_GROUP";
            ctx.scene.add(renderGroup);

            document.body.classList.add('v46-premium-active');
            isInstalled = true;
            
            this.rebuildWorld(ctx, ctx.currentWorld || 'campo');
        }),

        update: safe(function(ctx, dt) {
            if (!isInstalled || arModeAtivo) return;
            const delta = typeof dt === 'number' ? dt : 0.016;
            const time = performance.now() * 0.001;

            updatables.forEach(item => {
                if (!item.mesh) return;
                
                if (item.type === 'crystal') {
                    item.mesh.rotation.y += delta * 1.0;
                    item.mesh.position.y = item.baseY + Math.sin(time * 2) * 0.15;
                }
                else if (item.type === 'portal') {
                    item.mesh.material.opacity = 0.7 + Math.sin(time * 4) * 0.3;
                    if(item.light) item.light.intensity = 4 + Math.sin(time * 4) * 2;
                }
                else if (item.type === 'waterfall') {
                    if(item.mesh.material && item.mesh.material.map) {
                        item.mesh.material.map.offset.y -= delta * 1.0; // Desliza a textura UV
                    }
                }
                else if (item.type === 'enemy_bounce') {
                    // Pulo seco estilo voxel
                    item.mesh.position.y = item.baseY + Math.abs(Math.sin(time * 3)) * 1.2;
                }
                else if (item.type === 'enemy_fly') {
                    item.mesh.position.y = item.baseY + Math.sin(time * 2) * 0.5;
                    item.mesh.rotation.y += delta * 0.8;
                    if(item.p1) { item.p1.rotation.x += delta; item.p1.rotation.y += delta; }
                    if(item.p2) { item.p2.rotation.x -= delta; item.p2.rotation.y -= delta; }
                }
            });
        }),

        rebuildWorld: safe(function(ctx, worldName) {
            if (!isInstalled || !renderGroup || !ctx.THREE) return;
            currentWorldState = normalizeWorldName(worldName || 'campo');
            
            if (currentWorldState.toLowerCase() === 'real') {
                arModeAtivo = true;
                this.disposeVisualsOnly();
                if (ctx.scene.fog) ctx.scene.fog = null;
                return;
            }
            
            arModeAtivo = false;
            this.disposeVisualsOnly();
            
            // Popula o cenário baseado na referência 10/10
            VoxelEntities.buildTerrain(ctx.THREE, renderGroup, currentWorldState);
            
            // Set Pieces (Baseados na imagem)
            VoxelEntities.buildSign(ctx.THREE, renderGroup, -3.5, 0, -2);
            VoxelEntities.buildWaterfall(ctx.THREE, renderGroup, -12, 0, -15);
            VoxelEntities.buildCrystal(ctx.THREE, renderGroup, 0, 0.5, -4, 'blue');
            VoxelEntities.buildCrystal(ctx.THREE, renderGroup, 2, 0.5, -12, 'blue');
            VoxelEntities.buildCrystal(ctx.THREE, renderGroup, -1.5, 0.5, -18, 'blue');
            
            VoxelEntities.buildSpikyEnemy(ctx.THREE, renderGroup, 3.5, 0, -6);
            VoxelEntities.buildFlyingEnemy(ctx.THREE, renderGroup, -2.5, 2.5, -10);
            VoxelEntities.buildGolem(ctx.THREE, renderGroup, -5, 4, -18); // Golem no penhasco

            VoxelEntities.buildPortalTemple(ctx.THREE, renderGroup, -30);

            applyPremiumLighting(ctx, currentWorldState);
            applyPremiumCameraHints(ctx);
        }),

        disposeVisualsOnly: safe(function() {
            if (!renderGroup) return;
            function disposeNode(node) {
                if (!node) return;
                if (node.children && node.children.length) {
                    [...node.children].forEach(disposeNode);
                }
                if (node.geometry && typeof node.geometry.dispose === 'function') node.geometry.dispose();
                if (node.material) {
                    const mats = Array.isArray(node.material) ? node.material : [node.material];
                    mats.forEach(m => {
                        if (m && m.map && typeof m.map.dispose === 'function') m.map.dispose();
                        if (m && typeof m.dispose === 'function') m.dispose();
                    });
                }
            }
            while(renderGroup.children.length > 0) {
                const child = renderGroup.children[0];
                renderGroup.remove(child);
                disposeNode(child);
            }
            updatables = [];
        }),

        dispose: safe(function() {
            if (!isInstalled) return;
            this.disposeVisualsOnly();
            if (currentCtx && currentCtx.scene && renderGroup) {
                currentCtx.scene.remove(renderGroup);
            }
            renderGroup = null;
            document.body.classList.remove('v46-premium-active');
            isInstalled = false;
        }),

        getStatus: function() {
            return {
                version: VERSION,
                installed: isInstalled,
                world: currentWorldState,
                objects: renderGroup ? renderGroup.children.length : 0,
                animations: updatables.length,
                portalTemple: true,
                premiumHud: document.body.classList.contains('v46-premium-active'),
                arTouched: false
            };
        }
    };
})();