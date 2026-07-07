// FILE: assets/render-v47/v47-render-premium.js
// CAMADA VISUAL PREMIUM V47 - ATHOS GUARDIÃO DOS PORTAIS
// MODO: ESPECIALISTA ATIVADO (*177)
// CONTEXTO: Totalmente defensivo, performance focada em mobile (InstancedMesh, texturas procedurais).

(function() {
    'use strict';

    const VERSION = "V47_RENDER_PREMIUM_FIEL_10_10";
    let group = null;
    let materials = {};
    let geometries = {};
    let updatables = [];
    let isInstalled = false;


    function normalizeWorldName(worldName) {
        const map = {
            field: 'campo',
            campo: 'campo',
            fire: 'vulcao',
            vulcao: 'vulcao',
            forest: 'floresta',
            floresta: 'floresta',
            castle: 'castelo',
            castelo: 'castelo',
            space: 'espaco',
            espaco: 'espaco',
            arena: 'arena',
            real: 'real',
            ar: 'real',
            AR: 'real'
        };
        return map[String(worldName || 'campo').toLowerCase()] || 'campo';
    }

    // Utilitário para criar texturas pixel art procedurais via Canvas
    function createProceduralTexture(THREE, type, colorBase, colorVar) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = colorBase;
        ctx.fillRect(0, 0, 64, 64);
        
        // Adicionar ruído voxel
        for (let i = 0; i < 400; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? colorVar : colorBase;
            const x = Math.floor(Math.random() * 16) * 4;
            const y = Math.floor(Math.random() * 16) * 4;
            ctx.fillRect(x, y, 4, 4);
        }

        // Detalhes específicos por tipo
        if (type === 'grass_side') {
            ctx.fillStyle = '#4d3319'; // terra
            ctx.fillRect(0, 16, 64, 48);
            for (let i = 0; i < 15; i++) {
                ctx.fillStyle = '#4CAF50'; // grama caindo
                const x = Math.floor(Math.random() * 16) * 4;
                const h = Math.floor(Math.random() * 4) * 4 + 4;
                ctx.fillRect(x, 16, 4, h);
            }
        }

        if (type === 'portal') {
            const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, '#e066ff');
            gradient.addColorStop(1, '#4b0082');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 64, 64);
        }

        // eslint-disable-next-line no-undef
        const texture = new THREE.CanvasTexture(canvas);
        // eslint-disable-next-line no-undef
        texture.magFilter = THREE.NearestFilter; // Visual Pixelado/Voxel
        // eslint-disable-next-line no-undef
        texture.minFilter = THREE.NearestFilter;
        // eslint-disable-next-line no-undef
        texture.wrapS = THREE.RepeatWrapping;
        // eslint-disable-next-line no-undef
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    function initResources(THREE) {
        if (Object.keys(materials).length > 0) return; // Já inicializado

        // Geometrias Base
        geometries.box = new THREE.BoxGeometry(1, 1, 1);
        geometries.plane = new THREE.PlaneGeometry(1, 1);
        geometries.crystal = new THREE.OctahedronGeometry(0.5, 0);

        // Texturas Procedurais
        const texGrassTop = createProceduralTexture(THREE, 'grass_top', '#4CAF50', '#45a049');
        const texGrassSide = createProceduralTexture(THREE, 'grass_side', '#4CAF50', '#8B4513');
        const texDirt = createProceduralTexture(THREE, 'dirt', '#8B4513', '#70380f');
        const texStone = createProceduralTexture(THREE, 'stone', '#808080', '#696969');
        const texLava = createProceduralTexture(THREE, 'lava', '#ff4500', '#ff8c00');
        const texWater = createProceduralTexture(THREE, 'water', '#1e90ff', '#00bfff');
        const texWood = createProceduralTexture(THREE, 'wood', '#5c3a21', '#4a2f1b');

        // Materiais
        materials.grass = [
            new THREE.MeshStandardMaterial({ map: texGrassSide, roughness: 0.9 }),
            new THREE.MeshStandardMaterial({ map: texGrassSide, roughness: 0.9 }),
            new THREE.MeshStandardMaterial({ map: texGrassTop, roughness: 0.8 }),
            new THREE.MeshStandardMaterial({ map: texDirt, roughness: 0.9 }),
            new THREE.MeshStandardMaterial({ map: texGrassSide, roughness: 0.9 }),
            new THREE.MeshStandardMaterial({ map: texGrassSide, roughness: 0.9 })
        ];

        materials.dirt = new THREE.MeshStandardMaterial({ map: texDirt, roughness: 0.9 });
        materials.stone = new THREE.MeshStandardMaterial({ map: texStone, roughness: 0.7 });
        materials.lava = new THREE.MeshStandardMaterial({ map: texLava, emissive: '#ff4500', emissiveIntensity: 0.5 });
        materials.water = new THREE.MeshStandardMaterial({ map: texWater, transparent: true, opacity: 0.8, roughness: 0.1 });
        materials.wood = new THREE.MeshStandardMaterial({ map: texWood, roughness: 0.9 });
        
        materials.crystal = new THREE.MeshStandardMaterial({ 
            color: 0x00ffff, emissive: 0x0088ff, emissiveIntensity: 0.8, transparent: true, opacity: 0.9, roughness: 0.1, metalness: 0.8
        });
        
        materials.portalGlow = new THREE.MeshBasicMaterial({
            map: createProceduralTexture(THREE, 'portal', '', ''),
            transparent: true, opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        materials.enemyGreen = new THREE.MeshStandardMaterial({ color: 0x2E8B57, roughness: 0.8 });
        materials.enemyEye = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000 });
        materials.golemStone = new THREE.MeshStandardMaterial({ map: texStone, roughness: 1.0 });
    }

    function setupLighting(THREE, scene, isReal) {
        if (isReal) return; // Em AR não mexemos na luz ambiente original
        
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        group.add(ambient);

        const dirLight = new THREE.DirectionalLight(0xfffae6, 1.2);
        dirLight.position.set(20, 50, 20);
        dirLight.castShadow = true;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 150;
        dirLight.shadow.camera.left = -30;
        dirLight.shadow.camera.right = 30;
        dirLight.shadow.camera.top = 30;
        dirLight.shadow.camera.bottom = -30;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        group.add(dirLight);
    }

    function buildDecorativeScenery(ctx) {
        const { THREE } = ctx;
        const dummy = new THREE.Object3D();

        // 1. Fundo: Ilhas Flutuantes
        const islandsCount = 10;
        const islandMesh = new THREE.InstancedMesh(geometries.box, materials.dirt, islandsCount);
        for (let i = 0; i < islandsCount; i++) {
            const x = (Math.random() - 0.5) * 200;
            const y = (Math.random() * 20) - 10;
            const z = -50 - Math.random() * 50;
            const sx = 5 + Math.random() * 15;
            const sy = 2 + Math.random() * 5;
            const sz = 5 + Math.random() * 15;
            dummy.position.set(x, y, z);
            dummy.scale.set(sx, sy, sz);
            dummy.updateMatrix();
            islandMesh.setMatrixAt(i, dummy.matrix);
        }
        group.add(islandMesh);

        // 2. Cachoeira de Voxel e Lava
        const decorGroup = new THREE.Group();
        
        const waterDrop = new THREE.Mesh(geometries.box, materials.water);
        waterDrop.position.set(-30, 10, -20);
        waterDrop.scale.set(4, 20, 1);
        decorGroup.add(waterDrop);

        const lavaPool = new THREE.Mesh(geometries.box, materials.lava);
        lavaPool.position.set(30, -5, -20);
        lavaPool.scale.set(15, 1, 15);
        decorGroup.add(lavaPool);

        // Animar UVs da água e lava
        updatables.push((dt) => {
            if (materials.water.map) materials.water.map.offset.y -= dt * 0.5;
            if (materials.lava.map) materials.lava.map.offset.x += dt * 0.1;
        });

        group.add(decorGroup);
    }

    function reskinPlatforms(ctx) {
        const { THREE, objects } = ctx;
        if (!objects || !objects.length) return;

        objects.forEach(obj => {
            if (!obj.geometry) return;
            
            // Ocultar material original (sem quebrar a física do jogo)
            if (obj.material) {
                obj.material.visible = false;
            }

            // Criar malha visual baseada no bounding box para parecer Voxel
            obj.geometry.computeBoundingBox();
            const bbox = obj.geometry.boundingBox;
            const size = new THREE.Vector3();
            bbox.getSize(size);

            const visualMesh = new THREE.Mesh(geometries.box, materials.grass);
            visualMesh.scale.copy(size);
            
            // Ajuste de texturas repetidas para não esticar
            visualMesh.material.forEach((mat) => {
                if (mat.map && mat.map.clone) {
                    mat = mat.clone();
                    mat.map = mat.map.clone();
                    // Assumindo tamanho 1 unit = 1 bloco voxel
                    mat.map.repeat.set(Math.max(1, size.x/2), Math.max(1, size.z/2));
                }
            });

            visualMesh.position.copy(obj.position);
            visualMesh.rotation.copy(obj.rotation);
            visualMesh.castShadow = true;
            visualMesh.receiveShadow = true;
            
            // Atrelar à cena visual, mas seguir a posição se o objeto original se mover
            group.add(visualMesh);
            updatables.push(() => {
                visualMesh.position.copy(obj.position);
                visualMesh.rotation.copy(obj.rotation);
            });
        });
    }

    function reskinEnemies(ctx) {
        const { THREE, enemies } = ctx;
        if (!enemies) return;

        enemies.forEach(enemy => {
            // Ocultar representação original
            enemy.traverse((child) => {
                if (child.isMesh) child.visible = false;
            });

            // Adicionar skin premium: Inimigo Voxel com Olhos Vermelhos
            const skinGroup = new THREE.Group();
            
            const body = new THREE.Mesh(geometries.box, materials.enemyGreen);
            body.scale.set(1.5, 1.5, 1.5);
            body.castShadow = true;
            skinGroup.add(body);

            const eyeL = new THREE.Mesh(geometries.box, materials.enemyEye);
            eyeL.scale.set(0.3, 0.3, 0.1);
            eyeL.position.set(-0.4, 0.3, 0.76);
            skinGroup.add(eyeL);

            const eyeR = new THREE.Mesh(geometries.box, materials.enemyEye);
            eyeR.scale.set(0.3, 0.3, 0.1);
            eyeR.position.set(0.4, 0.3, 0.76);
            skinGroup.add(eyeR);

            enemy.add(skinGroup); // Adiciona ao objeto pai da engine para mover junto

            // Animação de pulsação suave
            let time = Math.random() * 100;
            updatables.push((dt) => {
                time += dt;
                skinGroup.scale.y = 1 + Math.sin(time * 5) * 0.05;
            });
        });
    }

    function reskinPortal(ctx) {
        const { THREE, portal } = ctx;
        if (!portal) return;

        portal.traverse((child) => {
            if (child.isMesh) child.visible = false;
        });

        const portalGroup = new THREE.Group();

        // Estrutura de Pedra (Templo)
        const frameL = new THREE.Mesh(geometries.box, materials.stone);
        frameL.scale.set(1, 4, 1);
        frameL.position.set(-2, 2, 0);
        portalGroup.add(frameL);

        const frameR = new THREE.Mesh(geometries.box, materials.stone);
        frameR.scale.set(1, 4, 1);
        frameR.position.set(2, 2, 0);
        portalGroup.add(frameR);

        const frameT = new THREE.Mesh(geometries.box, materials.stone);
        frameT.scale.set(5, 1, 1);
        frameT.position.set(0, 4.5, 0);
        portalGroup.add(frameT);

        // Centro Brilhante
        const glow = new THREE.Mesh(geometries.plane, materials.portalGlow);
        glow.scale.set(3.8, 3.8, 1);
        glow.position.set(0, 2, 0);
        portalGroup.add(glow);

        portal.add(portalGroup);

        // Partículas do Portal
        const pCount = 30;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(pCount * 3);
        for(let i=0; i<pCount*3; i++) pPos[i] = (Math.random() - 0.5) * 3;
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({ color: 0xaa00ff, size: 0.2, transparent: true, blending: THREE.AdditiveBlending });
        const particles = new THREE.Points(pGeo, pMat);
        particles.position.set(0, 2, 0);
        portal.add(particles);

        updatables.push((dt) => {
            glow.rotation.z += dt * 0.5;
            particles.rotation.y += dt * 0.2;
            particles.rotation.z += dt * 0.1;
        });
    }

    function reskinCrystals(ctx) {
        const { THREE, crystals } = ctx;
        if (!crystals) return;

        crystals.forEach(crystalObj => {
            crystalObj.traverse((child) => {
                if (child.isMesh) child.visible = false;
            });

            const premiumCrystal = new THREE.Mesh(geometries.crystal, materials.crystal);
            premiumCrystal.scale.set(0.8, 1.5, 0.8);
            
            const pointLight = new THREE.PointLight(0x00ffff, 0.5, 5);
            premiumCrystal.add(pointLight);

            crystalObj.add(premiumCrystal);

            updatables.push((dt) => {
                premiumCrystal.rotation.y += dt;
                premiumCrystal.position.y = Math.sin(Date.now() * 0.002 + premiumCrystal.id) * 0.2;
            });
        });
    }

    window.ATHOS_V47_RENDER_PREMIUM = {
        version: VERSION,
        
        install: function(ctx) {
            console.log("[V47 PREMIUM] Iniciando Instalação...");
            if (!ctx || !ctx.THREE || !ctx.scene) {
                console.error("[V47 PREMIUM] Falha: THREE ou scene ausentes no contexto.");
                return;
            }
            isInstalled = true;
            document.body.classList.add('v47-premium-active');
            console.log("[V47 PREMIUM] Instalado com sucesso.");
        },

        update: function(ctx, dt) {
            if (!isInstalled || !group) return;
            const delta = dt || 0.016;
            for (let i = 0; i < updatables.length; i++) {
                try {
                    updatables[i](delta);
                } catch (e) {
                    console.warn("[V47 PREMIUM] Erro no update loop:", e);
                }
            }
        },

        rebuildWorld: function(ctx, worldName) {
            if (!isInstalled || !ctx || !ctx.THREE || !ctx.scene) return;
            worldName = normalizeWorldName(worldName);
            this.dispose(); // Limpa renderizações anteriores
            
            const isReal = (worldName === 'real');
            if (isReal) {
                console.log("[V47 PREMIUM] Modo Real/AR detectado. Mantendo câmera original. Limpeza visual efetuada.");
                return; // Em AR não adicionamos skybox ou cenário pesado
            }

            console.log(`[V47 PREMIUM] Reconstruindo mundo: ${worldName}`);
            const { THREE, scene } = ctx;
            group = new THREE.Group();
            group.name = "V47_RENDER_PREMIUM_GROUP";
            scene.add(group);

            initResources(THREE);
            setupLighting(THREE, scene, isReal);

            // Cores base do mundo
            let bgColor = 0x87CEEB; // Campo padrão
            if (worldName === 'vulcao') bgColor = 0x2b0f0f;
            if (worldName === 'floresta') bgColor = 0x001a00;
            if (worldName === 'espaco') bgColor = 0x00001a;
            
            scene.background = new THREE.Color(bgColor);
            scene.fog = new THREE.FogExp2(bgColor, 0.015);

            buildDecorativeScenery(ctx);
            reskinPlatforms(ctx);
            reskinEnemies(ctx);
            reskinPortal(ctx);
            reskinCrystals(ctx);
        },

        dispose: function() {
            if (group && group.parent) {
                group.parent.remove(group);
                group.traverse((child) => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
                group = null;
            }
            updatables = [];
            console.log("[V47 PREMIUM] Camada descartada e limpa.");
        },

        getStatus: function() {
            return {
                installed: isInstalled,
                version: VERSION,
                hasGroup: group !== null,
                updatablesCount: updatables.length,
                objects: group ? group.children.length : 0,
                worldNormalizer: true,
                arTouched: false
            };
        }
    };

})();