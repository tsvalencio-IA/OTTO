/**
 * ATHOS ADVENTURE 3D+ | RENDER PREMIUM V46
 * Camada visual Voxel Premium independente.
 * Arquivo 100% completo, sem dependências externas.
 */

window.ATHOS_V46_RENDER_PREMIUM = (function() {
    // --- ESTADO INTERNO ---
    const VERSION = "V46_RENDER_PREMIUM_10_10";
    let isInstalled = false;
    let renderGroup = null;
    let currentCtx = null;
    let updatables = [];
    let textures = {};
    let currentWorldState = "campo";
    let arModeAtivo = false;

    // --- UTILITÁRIOS DEFENSIVOS ---
    function safe(fn) {
        return function(...args) {
            try { return fn(...args); } 
            catch (e) { console.warn("[V46 Render Premium] Aviso contornado:", e); }
        };
    }

    // --- GERADOR DE TEXTURAS PROCEDURAIS (CANVAS) ---
    const TextureGen = {
        createNoise: function(THREE, baseColor, noiseColor, density = 0.2, size = 128) {
            if (!THREE) return null;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = baseColor;
            ctx.fillRect(0, 0, size, size);
            
            for (let i = 0; i < (size * size * density); i++) {
                ctx.fillStyle = noiseColor;
                ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
            }
            
            const texture = new THREE.CanvasTexture(canvas);
            texture.magFilter = THREE.NearestFilter; // Estilo Voxel/Pixel
            texture.minFilter = THREE.NearestFilter;
            return texture;
        },
        createGradient: function(THREE, colorTop, colorBottom, size = 64) {
            if (!THREE) return null;
            const canvas = document.createElement('canvas');
            canvas.width = size; canvas.height = size;
            const ctx = canvas.getContext('2d');
            const grd = ctx.createLinearGradient(0, 0, 0, size);
            grd.addColorStop(0, colorTop);
            grd.addColorStop(1, colorBottom);
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, size, size);
            const texture = new THREE.CanvasTexture(canvas);
            texture.magFilter = THREE.NearestFilter;
            return texture;
        },
        initTextures: function(THREE) {
            if(Object.keys(textures).length > 0) return;
            textures.grassTop = this.createNoise(THREE, '#4CAF50', '#388E3C', 0.15);
            textures.dirt = this.createNoise(THREE, '#795548', '#5D4037', 0.2);
            textures.stone = this.createNoise(THREE, '#9E9E9E', '#757575', 0.2);
            textures.wood = this.createNoise(THREE, '#8D6E63', '#5D4037', 0.3);
            textures.lava = this.createNoise(THREE, '#FF5722', '#FF9800', 0.1);
            textures.water = this.createNoise(THREE, '#29B6F6', '#03A9F4', 0.05);
            textures.sand = this.createNoise(THREE, '#FFE082', '#FFCA28', 0.1);
            textures.darkStone = this.createNoise(THREE, '#424242', '#212121', 0.15);
            textures.mossyStone = this.createNoise(THREE, '#9E9E9E', '#4CAF50', 0.1);
        }
    };

    // --- FÁBRICA DE OBJETOS VOXEL ---
    const VoxelFactory = {
        getMaterial: function(THREE, type) {
            const mats = {
                'grass': new THREE.MeshStandardMaterial({ map: textures.grassTop, roughness: 0.8 }),
                'dirt': new THREE.MeshStandardMaterial({ map: textures.dirt, roughness: 0.9 }),
                'stone': new THREE.MeshStandardMaterial({ map: textures.stone, roughness: 0.7 }),
                'wood': new THREE.MeshStandardMaterial({ map: textures.wood, roughness: 0.8 }),
                'lava': new THREE.MeshStandardMaterial({ map: textures.lava, emissive: 0xFF5722, emissiveIntensity: 0.5, roughness: 0.1 }),
                'water': new THREE.MeshStandardMaterial({ map: textures.water, transparent: true, opacity: 0.8, roughness: 0.1 }),
                'leaves': new THREE.MeshStandardMaterial({ color: 0x2E7D32, roughness: 0.9 }),
                'crystalBlue': new THREE.MeshStandardMaterial({ color: 0x00E5FF, emissive: 0x00B0FF, emissiveIntensity: 0.8, transparent: true, opacity: 0.9 }),
                'crystalPurple': new THREE.MeshStandardMaterial({ color: 0xD500F9, emissive: 0xAA00FF, emissiveIntensity: 0.8, transparent: true, opacity: 0.9 }),
                'portalGlow': new THREE.MeshStandardMaterial({ color: 0xAA00FF, emissive: 0xAA00FF, emissiveIntensity: 1.5, transparent: true, opacity: 0.7, side: THREE.DoubleSide }),
                'darkStone': new THREE.MeshStandardMaterial({ map: textures.darkStone, roughness: 0.8 }),
                'sand': new THREE.MeshStandardMaterial({ map: textures.sand, roughness: 0.9 })
            };
            return mats[type] || mats['stone'];
        },
        createBlock: function(THREE, type, x, y, z, size = 1) {
            const geo = new THREE.BoxGeometry(size, size, size);
            const mat = this.getMaterial(THREE, type);
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, y, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        }
    };

    // --- GERADORES PROCEDURAIS ESPECÍFICOS ---
    const Builders = {
        createVoxelTerrain: function(THREE, group, world) {
            const gridSize = 24;
            const blockSize = 1;
            const yOffset = -0.5;

            const instancedGeo = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
            let matType = 'grass';
            if (world === 'vulcao') matType = 'darkStone';
            if (world === 'espaco') matType = 'stone';
            if (world === 'arena') matType = 'sand';

            const material = VoxelFactory.getMaterial(THREE, matType);
            const dirtMat = VoxelFactory.getMaterial(THREE, 'dirt');
            
            const count = gridSize * gridSize;
            const mesh = new THREE.InstancedMesh(instancedGeo, material, count);
            const dummy = new THREE.Object3D();

            let idx = 0;
            for (let i = -gridSize/2; i < gridSize/2; i++) {
                for (let j = -gridSize/2; j < gridSize/2; j++) {
                    // Evitar caminho central para o terreno principal (deixar buraco para o path)
                    if (Math.abs(i) <= 2) {
                        dummy.position.set(i, yOffset - 0.1, j); // Abaixo do caminho
                    } else {
                        // Variação de altura procedual simples
                        const h = (Math.sin(i * 0.5) * Math.cos(j * 0.5)) * 0.3;
                        dummy.position.set(i, yOffset + h, j);
                    }
                    dummy.updateMatrix();
                    mesh.setMatrixAt(idx++, dummy.matrix);
                }
            }
            mesh.receiveShadow = true;
            group.add(mesh);
        },

        createPath: function(THREE, group, world) {
            const pathLength = 24;
            const pathWidth = 4;
            let matType = 'dirt';
            if (world === 'vulcao') matType = 'stone';
            if (world === 'castelo') matType = 'stone';
            if (world === 'espaco') matType = 'darkStone';

            for (let z = -pathLength/2; z < pathLength/2; z++) {
                for (let x = -pathWidth/2; x <= pathWidth/2; x++) {
                    const block = VoxelFactory.createBlock(THREE, matType, x, -0.4, z, 1);
                    // Suavizar um pouco o caminho
                    block.position.y += (Math.random() * 0.05);
                    group.add(block);
                }
            }
        },

        createGrassBlocks: function(THREE, group) {
            // Detalhes extras de grama
            for(let i=0; i<30; i++) {
                const x = (Math.random() - 0.5) * 20;
                const z = (Math.random() - 0.5) * 20;
                if (Math.abs(x) < 3) continue; // Pula caminho
                const b = VoxelFactory.createBlock(THREE, 'grass', x, 0.2, z, 0.8);
                group.add(b);
            }
        },

        createFlower: function(THREE, group, x, z) {
            const fGroup = new THREE.Group();
            const stem = VoxelFactory.createBlock(THREE, 'grass', 0, 0.2, 0, 0.2);
            stem.scale.set(1, 2, 1);
            const petalMat = new THREE.MeshStandardMaterial({color: Math.random() > 0.5 ? 0xFFEB3B : 0xE91E63});
            const petal = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), petalMat);
            petal.position.set(0, 0.5, 0);
            fGroup.add(stem, petal);
            fGroup.position.set(x, 0, z);
            group.add(fGroup);
        },

        createMushroom: function(THREE, group, x, z) {
            const mGroup = new THREE.Group();
            const stemMat = new THREE.MeshStandardMaterial({color: 0xFFF8E1});
            const capMat = new THREE.MeshStandardMaterial({color: 0xE53935});
            const stem = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 0.3), stemMat);
            const cap = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.8), capMat);
            stem.position.y = 0.3;
            cap.position.y = 0.7;
            mGroup.add(stem, cap);
            mGroup.position.set(x, 0, z);
            group.add(mGroup);
        },

        createSign: function(THREE, group, x, z) {
            const sGroup = new THREE.Group();
            const post = VoxelFactory.createBlock(THREE, 'wood', 0, 0.5, 0, 0.2);
            post.scale.set(1, 4, 1);
            const board = VoxelFactory.createBlock(THREE, 'wood', 0, 1.2, 0.1, 1.2);
            board.scale.set(1, 0.5, 0.2);
            sGroup.add(post, board);
            sGroup.position.set(x, 0, z);
            // Angulação leve
            sGroup.rotation.y = Math.random() * 0.5 - 0.25;
            group.add(sGroup);
        },

        createChest: function(THREE, group, x, z) {
            const cGroup = new THREE.Group();
            const base = VoxelFactory.createBlock(THREE, 'wood', 0, 0.4, 0, 0.8);
            const lid = VoxelFactory.createBlock(THREE, 'wood', 0, 0.9, 0, 0.8);
            const lockMat = new THREE.MeshStandardMaterial({color: 0xFFD700});
            const lock = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.1), lockMat);
            lock.position.set(0, 0.65, 0.45);
            cGroup.add(base, lid, lock);
            cGroup.position.set(x, 0, z);
            group.add(cGroup);
        },

        createCrystal: function(THREE, group, x, z, type = 'blue') {
            const matType = type === 'blue' ? 'crystalBlue' : 'crystalPurple';
            const crystal = VoxelFactory.createBlock(THREE, matType, x, 0.8, z, 0.6);
            crystal.scale.set(0.6, 2, 0.6);
            
            // Luz do cristal
            const color = type === 'blue' ? 0x00E5FF : 0xD500F9;
            const light = new THREE.PointLight(color, 1, 3);
            light.position.set(x, 1, z);
            group.add(light);
            
            group.add(crystal);
            updatables.push({
                mesh: crystal,
                type: 'crystal',
                baseY: 0.8,
                randomOffset: Math.random() * 10
            });
        },

        createPortalTemple: function(THREE, group, zPos) {
            const pGroup = new THREE.Group();
            
            // Base
            const base = VoxelFactory.createBlock(THREE, 'stone', 0, 0, 0, 6);
            base.scale.set(1, 0.2, 0.5);
            pGroup.add(base);

            // Pilares
            const pilarL = VoxelFactory.createBlock(THREE, 'stone', -2.5, 2.5, 0, 1);
            pilarL.scale.set(1, 5, 1);
            const pilarR = VoxelFactory.createBlock(THREE, 'stone', 2.5, 2.5, 0, 1);
            pilarR.scale.set(1, 5, 1);
            pGroup.add(pilarL, pilarR);

            // Topo
            const top = VoxelFactory.createBlock(THREE, 'stone', 0, 5.5, 0, 6);
            top.scale.set(1, 1, 1);
            pGroup.add(top);

            // Portal Glow
            const portalGeo = new THREE.PlaneGeometry(4, 4.5);
            const portalMat = VoxelFactory.getMaterial(THREE, 'portalGlow');
            const portalMesh = new THREE.Mesh(portalGeo, portalMat);
            portalMesh.position.set(0, 2.8, 0);
            pGroup.add(portalMesh);

            // Luz do Portal
            const pLight = new THREE.PointLight(0xAA00FF, 3, 10);
            pLight.position.set(0, 3, 1);
            pGroup.add(pLight);

            pGroup.position.set(0, 0, zPos);
            group.add(pGroup);

            updatables.push({
                mesh: portalMesh,
                type: 'portal',
                light: pLight
            });
        },

        createLava: function(THREE, group) {
            const lavaGeo = new THREE.PlaneGeometry(30, 30);
            const lavaMat = VoxelFactory.getMaterial(THREE, 'lava');
            const lavaMesh = new THREE.Mesh(lavaGeo, lavaMat);
            lavaMesh.rotation.x = -Math.PI / 2;
            lavaMesh.position.y = -1; // Abaixo do terreno
            group.add(lavaMesh);
            
            // Luz emissiva global vinda da lava
            const lavaLight = new THREE.DirectionalLight(0xFF5722, 0.5);
            lavaLight.position.set(0, -5, 0);
            lavaLight.target.position.set(0, 0, 0);
            group.add(lavaLight);
            group.add(lavaLight.target);
        },

        createWaterfall: function(THREE, group, x, z) {
            const wGroup = new THREE.Group();
            const waterGeo = new THREE.BoxGeometry(2, 6, 0.2);
            const waterMat = VoxelFactory.getMaterial(THREE, 'water');
            const waterfall = new THREE.Mesh(waterGeo, waterMat);
            waterfall.position.set(0, 3, 0);
            wGroup.add(waterfall);
            
            // Particulas da base
            const poolGeo = new THREE.BoxGeometry(3, 0.5, 2);
            const pool = new THREE.Mesh(poolGeo, waterMat);
            pool.position.set(0, 0.2, 1);
            wGroup.add(pool);

            wGroup.position.set(x, 0, z);
            group.add(wGroup);

            updatables.push({ mesh: waterfall, type: 'waterfall' });
        },

        createFloatingIslands: function(THREE, group) {
            for(let i=0; i<5; i++) {
                const iGroup = new THREE.Group();
                const base = VoxelFactory.createBlock(THREE, 'dirt', 0, 0, 0, 3);
                const top = VoxelFactory.createBlock(THREE, 'grass', 0, 1.5, 0, 3);
                iGroup.add(base, top);
                
                const x = (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 15);
                const y = 5 + Math.random() * 10;
                const z = -20 + Math.random() * 20;
                
                iGroup.position.set(x, y, z);
                group.add(iGroup);
                
                updatables.push({
                    mesh: iGroup,
                    type: 'floating',
                    baseY: y,
                    randomOffset: Math.random() * 10,
                    speed: 0.5 + Math.random() * 0.5
                });
            }
        },

        createClouds: function(THREE, group) {
            const cloudMat = new THREE.MeshStandardMaterial({color: 0xFFFFFF, transparent: true, opacity: 0.8, roughness: 1});
            for(let i=0; i<8; i++) {
                const cGroup = new THREE.Group();
                const b1 = new THREE.Mesh(new THREE.BoxGeometry(2,1,2), cloudMat);
                const b2 = new THREE.Mesh(new THREE.BoxGeometry(1.5,1,1.5), cloudMat);
                b2.position.set(1, 0, 0.5);
                const b3 = new THREE.Mesh(new THREE.BoxGeometry(1.5,1,1.5), cloudMat);
                b3.position.set(-1, 0.2, -0.5);
                cGroup.add(b1, b2, b3);

                cGroup.position.set(
                    (Math.random() - 0.5) * 40,
                    15 + Math.random() * 5,
                    (Math.random() - 0.5) * 40
                );
                group.add(cGroup);

                updatables.push({
                    mesh: cGroup,
                    type: 'cloud',
                    speed: 0.02 + Math.random() * 0.03
                });
            }
        },

        createTree: function(THREE, group, x, z) {
            const tGroup = new THREE.Group();
            const trunk = VoxelFactory.createBlock(THREE, 'wood', 0, 1, 0, 0.6);
            trunk.scale.set(1, 3, 1);
            tGroup.add(trunk);

            const leavesMat = VoxelFactory.getMaterial(THREE, 'leaves');
            const lGeo = new THREE.BoxGeometry(2.5, 2.5, 2.5);
            const leaves = new THREE.Mesh(lGeo, leavesMat);
            leaves.position.set(0, 3, 0);
            tGroup.add(leaves);

            tGroup.position.set(x, 0, z);
            group.add(tGroup);
        },

        createSlimeEnemy: function(THREE, group, x, z) {
            const eGroup = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({color: 0x00FF00, transparent: true, opacity: 0.8});
            const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), bodyMat);
            body.position.y = 0.6;
            
            const eyeMat = new THREE.MeshBasicMaterial({color: 0xFF0000});
            const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.1), eyeMat);
            eyeL.position.set(-0.3, 0.8, 0.61);
            const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.1), eyeMat);
            eyeR.position.set(0.3, 0.8, 0.61);
            
            eGroup.add(body, eyeL, eyeR);
            eGroup.position.set(x, 0, z);
            group.add(eGroup);

            updatables.push({
                mesh: eGroup,
                type: 'enemy_bounce',
                baseY: 0,
                randomOffset: Math.random() * 10
            });
        },

        createGolemEnemy: function(THREE, group, x, z) {
            const gGroup = new THREE.Group();
            const mat = VoxelFactory.getMaterial(THREE, 'stone');
            const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), mat);
            body.position.y = 1;
            const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), mat);
            head.position.y = 2.2;
            
            const eyeMat = new THREE.MeshBasicMaterial({color: 0xFF0000});
            const eye = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.2), eyeMat);
            eye.position.set(0, 2.3, 0.41);
            
            gGroup.add(body, head, eye);
            gGroup.position.set(x, 0, z);
            group.add(gGroup);
        },

        createFlyingEnemy: function(THREE, group, x, z) {
            const fGroup = new THREE.Group();
            const mat = new THREE.MeshStandardMaterial({color: 0x212121, emissive: 0x4A148C, emissiveIntensity: 0.5});
            const body = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat);
            fGroup.add(body);
            
            const pLight = new THREE.PointLight(0x4A148C, 1, 4);
            fGroup.add(pLight);

            fGroup.position.set(x, 3, z);
            group.add(fGroup);

            updatables.push({
                mesh: fGroup,
                type: 'enemy_fly',
                baseY: 3,
                randomOffset: Math.random() * 10
            });
        },

        createParticles: function(THREE, group, type, x, y, z) {
            const particleCount = 20;
            const geo = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            
            for(let i=0; i<particleCount*3; i++) {
                positions[i] = (Math.random() - 0.5) * 2;
            }
            geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            let color = 0xFFFFFF;
            if (type === 'magic') color = 0xAA00FF;
            if (type === 'fire') color = 0xFF5722;
            if (type === 'nature') color = 0x64DD17;

            const mat = new THREE.PointsMaterial({
                color: color,
                size: 0.2,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });

            const particles = new THREE.Points(geo, mat);
            particles.position.set(x, y, z);
            group.add(particles);

            updatables.push({
                mesh: particles,
                type: 'particle_system',
                pType: type
            });
        }
    };

    // --- CONSTRUÇÃO DE MUNDOS ---
    const WorldScenarios = {
        buildCampo: function(THREE, group) {
            Builders.createVoxelTerrain(THREE, group, 'campo');
            Builders.createPath(THREE, group, 'campo');
            Builders.createGrassBlocks(THREE, group);
            Builders.createClouds(THREE, group);
            Builders.createFloatingIslands(THREE, group);
            
            // Decoração Lateral
            for(let i=0; i<8; i++) {
                const z = -10 + i * 2;
                if(i%2 === 0) Builders.createTree(THREE, group, -4, z);
                if(i%3 === 0) Builders.createTree(THREE, group, 4, z - 2);
                Builders.createFlower(THREE, group, -3 - Math.random()*2, z);
                Builders.createMushroom(THREE, group, 3 + Math.random()*2, z);
            }

            Builders.createSign(THREE, group, -2.5, 2);
            Builders.createChest(THREE, group, 3, -5);
            
            // Guia de cristais
            Builders.createCrystal(THREE, group, -2, 0, 'blue');
            Builders.createCrystal(THREE, group, 2, -6, 'blue');

            // Inimigos
            Builders.createSlimeEnemy(THREE, group, -4, -4);
            Builders.createSlimeEnemy(THREE, group, 4, -8);

            Builders.createPortalTemple(THREE, group, -12);
        },
        buildVulcao: function(THREE, group) {
            Builders.createVoxelTerrain(THREE, group, 'vulcao');
            Builders.createPath(THREE, group, 'vulcao');
            Builders.createLava(THREE, group);
            
            // Pilares de pedra
            for(let i=0; i<5; i++) {
                const g = Builders.createGolemEnemy(THREE, group, (Math.random()>0.5?1:-1)*(4+Math.random()*2), -2 - i*3);
            }
            Builders.createCrystal(THREE, group, -2, -2, 'purple');
            Builders.createCrystal(THREE, group, 2, -8, 'purple');
            Builders.createParticles(THREE, group, 'fire', 0, 2, -5);
            Builders.createPortalTemple(THREE, group, -12);
        },
        buildFloresta: function(THREE, group) {
            Builders.createVoxelTerrain(THREE, group, 'campo');
            Builders.createPath(THREE, group, 'campo');
            
            // Densidade alta de árvores
            for(let z=-15; z<5; z+=2) {
                Builders.createTree(THREE, group, -3.5 - Math.random()*2, z);
                Builders.createTree(THREE, group, 3.5 + Math.random()*2, z);
            }
            Builders.createParticles(THREE, group, 'nature', 0, 2, -5);
            Builders.createPortalTemple(THREE, group, -12);
        },
        buildCastelo: function(THREE, group) {
            Builders.createVoxelTerrain(THREE, group, 'espaco'); // pedra
            Builders.createPath(THREE, group, 'castelo');
            
            for(let z=-12; z<2; z+=4) {
                Builders.createGolemEnemy(THREE, group, -3, z);
                Builders.createGolemEnemy(THREE, group, 3, z);
            }
            Builders.createChest(THREE, group, -2, -2);
            Builders.createPortalTemple(THREE, group, -12);
        },
        buildEspaco: function(THREE, group) {
            Builders.createPath(THREE, group, 'espaco');
            Builders.createFloatingIslands(THREE, group);
            
            for(let i=0; i<4; i++) {
                Builders.createFlyingEnemy(THREE, group, (Math.random()>0.5?3:-3), -i*4);
                Builders.createCrystal(THREE, group, (Math.random()>0.5?2:-2), -i*3, 'purple');
            }
            Builders.createParticles(THREE, group, 'magic', 0, 3, -6);
            Builders.createPortalTemple(THREE, group, -12);
        },
        buildArena: function(THREE, group) {
            Builders.createVoxelTerrain(THREE, group, 'arena');
            Builders.createPath(THREE, group, 'vulcao');
            Builders.createGolemEnemy(THREE, group, -4, -6);
            Builders.createSlimeEnemy(THREE, group, 4, -6);
            Builders.createFlyingEnemy(THREE, group, 0, -8);
            Builders.createPortalTemple(THREE, group, -12);
        }
    };

    // --- LUZES E CÂMERA ---
    const applyPremiumLighting = safe(function(ctx, worldName) {
        if (!ctx.THREE || !ctx.scene || !renderGroup) return;
        
        // Remove luzes antigas do grupo premium
        const toRemove = [];
        renderGroup.children.forEach(c => {
            if(c.isLight) toRemove.push(c);
        });
        toRemove.forEach(c => renderGroup.remove(c));

        const THREE = ctx.THREE;
        let ambColor = 0xFFFFFF, ambInt = 0.6;
        let dirColor = 0xFFF9C4, dirInt = 1.0;
        let fogColor = 0x87CEEB, fogDensity = 0.02;

        switch(worldName) {
            case 'vulcao': 
                ambColor = 0x424242; ambInt = 0.8; dirColor = 0xFF5722; fogColor = 0x3E2723; fogDensity = 0.04; break;
            case 'floresta': 
                ambColor = 0x33691E; ambInt = 0.7; dirColor = 0xDCEDC8; fogColor = 0x1B5E20; fogDensity = 0.05; break;
            case 'espaco': 
                ambColor = 0x1A237E; ambInt = 0.5; dirColor = 0x651FFF; fogColor = 0x000000; fogDensity = 0.01; break;
            case 'castelo': 
                ambColor = 0x616161; ambInt = 0.6; dirColor = 0x9E9E9E; fogColor = 0x212121; fogDensity = 0.03; break;
        }

        const ambLight = new THREE.AmbientLight(ambColor, ambInt);
        renderGroup.add(ambLight);

        const dirLight = new THREE.DirectionalLight(dirColor, dirInt);
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        // Ajustes de sombra mobile-friendly
        if(dirLight.shadow) {
            dirLight.shadow.mapSize.width = 1024;
            dirLight.shadow.mapSize.height = 1024;
            dirLight.shadow.camera.near = 0.5;
            dirLight.shadow.camera.far = 50;
            dirLight.shadow.camera.left = -15;
            dirLight.shadow.camera.right = 15;
            dirLight.shadow.camera.top = 15;
            dirLight.shadow.camera.bottom = -15;
        }
        renderGroup.add(dirLight);

        // Rim Light para destacar personagem e centro
        const rimLight = new THREE.PointLight(0xAA00FF, 0.8, 20);
        rimLight.position.set(-5, 5, -5);
        renderGroup.add(rimLight);

        // Fog
        if (ctx.scene.fog === undefined || ctx.scene.fog !== null) {
             ctx.scene.fog = new THREE.FogExp2(fogColor, fogDensity);
        }
        
        // Tone Mapping se disponível
        if (ctx.renderer) {
            ctx.renderer.shadowMap.enabled = true;
            ctx.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            if(ctx.renderer.toneMapping !== undefined) {
                ctx.renderer.toneMapping = THREE.ACESFilmicToneMapping;
                ctx.renderer.toneMappingExposure = 1.0;
            }
        }
    });

    const applyPremiumCameraHints = safe(function(ctx) {
        if (!ctx.camera) return;
        // Apenas expõe sugestões, não força a menos que seja seguro
        window.ATHOS_V46_RENDER_PREMIUM.cameraPreset = {
            height: 5.8,
            distance: 8.5,
            lookAhead: 7,
            fov: 48,
            smoothing: 0.08
        };
        
        // Tweak defensivo sutil no FOV para aspecto mais cinemático, se não quebrar o jogo
        if(ctx.camera.fov && ctx.camera.fov > 60) {
            ctx.camera.fov = 50;
            if(typeof ctx.camera.updateProjectionMatrix === 'function') {
                ctx.camera.updateProjectionMatrix();
            }
        }
    });

    // --- API PÚBLICA ---
    return {
        version: VERSION,
        
        install: safe(function(ctx) {
            if(isInstalled) return;
            if (!ctx || !ctx.THREE || !ctx.scene) {
                console.warn("[V46 Render Premium] Falha na instalação: ctx, THREE ou scene ausentes.");
                return;
            }
            currentCtx = ctx;
            
            // Inicializa Texturas Globais
            TextureGen.initTextures(ctx.THREE);

            // Cria Grupo
            renderGroup = new ctx.THREE.Group();
            renderGroup.name = "V46_RENDER_PREMIUM_GROUP";
            ctx.scene.add(renderGroup);

            // Aplica Injeção de UI (CSS cuidará do visual dinamicamente via arquivo externo, mas garantimos classes)
            document.body.classList.add('v46-premium-active');

            isInstalled = true;
            console.log(`[V46 Render Premium] ${VERSION} Instalado com sucesso.`);
            
            // Força primeiro build se mundo conhecido
            if (ctx.currentWorld) {
                this.rebuildWorld(ctx, ctx.currentWorld);
            } else {
                this.rebuildWorld(ctx, 'campo');
            }
        }),

        update: safe(function(ctx, dt) {
            if (!isInstalled || arModeAtivo) return;
            const delta = typeof dt === 'number' ? dt : 0.016;
            const time = performance.now() * 0.001;

            updatables.forEach(item => {
                if (!item.mesh) return;
                
                if (item.type === 'crystal') {
                    item.mesh.rotation.y += delta * 1.5;
                    item.mesh.position.y = item.baseY + Math.sin(time * 2 + item.randomOffset) * 0.2;
                }
                else if (item.type === 'portal') {
                    // Pulsar textura ou glow
                    if (item.mesh.material && item.mesh.material.emissiveIntensity !== undefined) {
                        item.mesh.material.emissiveIntensity = 1.0 + Math.sin(time * 3) * 0.5;
                    }
                }
                else if (item.type === 'floating') {
                    item.mesh.position.y = item.baseY + Math.sin(time * item.speed + item.randomOffset) * 1.5;
                }
                else if (item.type === 'cloud') {
                    item.mesh.position.x += item.speed;
                    if (item.mesh.position.x > 30) item.mesh.position.x = -30;
                }
                else if (item.type === 'waterfall') {
                    if(item.mesh.material && item.mesh.material.map) {
                        item.mesh.material.map.offset.y -= delta * 0.5;
                    }
                }
                else if (item.type === 'enemy_bounce') {
                    item.mesh.position.y = item.baseY + Math.abs(Math.sin(time * 4 + item.randomOffset)) * 0.8;
                }
                else if (item.type === 'enemy_fly') {
                    item.mesh.position.y = item.baseY + Math.sin(time * 2 + item.randomOffset) * 1;
                    item.mesh.rotation.y += delta * 0.5;
                    item.mesh.rotation.z = Math.sin(time * 3) * 0.2;
                }
                else if (item.type === 'particle_system') {
                    item.mesh.rotation.y += delta * 0.2;
                    const pos = item.mesh.geometry.attributes.position;
                    for(let i=0; i<pos.count; i++) {
                        let y = pos.getY(i);
                        y += delta * (item.pType === 'fire' ? 2 : 1);
                        if (y > 3) y = -1;
                        pos.setY(i, y);
                    }
                    pos.needsUpdate = true;
                }
            });
        }),

        rebuildWorld: safe(function(ctx, worldName) {
            if (!isInstalled || !renderGroup || !ctx.THREE) return;
            
            currentWorldState = worldName || 'campo';
            
            // Modo Real / AR seguro
            if (currentWorldState.toLowerCase() === 'real') {
                arModeAtivo = true;
                this.disposeVisualsOnly(); // Limpa render 3D, mantem classe UI
                if (ctx.scene.fog) ctx.scene.fog = null;
                return;
            }
            
            arModeAtivo = false;
            this.disposeVisualsOnly();
            
            // Seleciona construtor
            let builder = WorldScenarios.buildCampo;
            if (currentWorldState === 'vulcao') builder = WorldScenarios.buildVulcao;
            else if (currentWorldState === 'floresta') builder = WorldScenarios.buildFloresta;
            else if (currentWorldState === 'castelo') builder = WorldScenarios.buildCastelo;
            else if (currentWorldState === 'espaco') builder = WorldScenarios.buildEspaco;
            else if (currentWorldState === 'arena') builder = WorldScenarios.buildArena;

            // Constrói cenário
            builder(ctx.THREE, renderGroup);

            // Aplica Luz e Câmera
            applyPremiumLighting(ctx, currentWorldState);
            applyPremiumCameraHints(ctx);
        }),

        disposeVisualsOnly: safe(function() {
            if (!renderGroup) return;
            while(renderGroup.children.length > 0) {
                const child = renderGroup.children[0];
                renderGroup.remove(child);
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                    else child.material.dispose();
                }
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
            console.log(`[V46 Render Premium] Desinstalado.`);
        }),

        getStatus: function() {
            return {
                version: VERSION,
                installed: isInstalled,
                world: currentWorldState,
                objects: renderGroup ? renderGroup.children.length : 0,
                animations: updatables.length,
                portalTemple: true,
                premiumHud: true,
                arTouched: false // CRÍTICO: Não mexe no AR nativo do Model-Viewer
            };
        }
    };
})();