class Aquarium3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.fishes = [];
        this.bubbles = [];
        this.aquariumBounds = { width: 0, height: 0, depth: 0 };
        this.speedMultiplier = 1;
        this.videoBackground = null;
        this.useVideo = false;
        this.foodParticles = [];
        
        this.updateAquariumBounds();
        this.init();
        this.setupEventListeners();
        this.animate();
    }

    updateAquariumBounds() {
        const aspect = window.innerWidth / window.innerHeight;
        const baseHeight = 13; // Aumentado para preencher mais espaço
        this.aquariumBounds.height = baseHeight;
        this.aquariumBounds.width = baseHeight * aspect;
        this.aquariumBounds.depth = Math.min(this.aquariumBounds.width, this.aquariumBounds.height) * 0.8;
    }

    init() {
        // Criar cena
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x0066cc, 10, 50);

        // Configurar câmera (vista frontal do aquário)
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        
        // Ajustar posição da câmera baseada nas dimensões do aquário
        const cameraDistance = Math.max(this.aquariumBounds.width, this.aquariumBounds.height) * 0.5; // Reduzido para zoom maior
        this.camera.position.set(0, 0, cameraDistance);
        this.camera.lookAt(0, 0, 0);

        // Configurar renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x0066cc, 1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // Criar aquário
        this.createAquarium();
        
        // Adicionar iluminação
        this.setupLighting();
        
        // Criar peixes iniciais
        this.createInitialFishes(15);
        
        // Criar bolhas
        this.createBubbles();
        
        // Tentar carregar vídeo de fundo
        this.setupVideoBackground();

        // Esconder loading
        document.getElementById('loading').style.display = 'none';
    }

    createAquarium() {
        // Criar paredes do aquário (vidro)
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0,
            roughness: 0,
            transmission: 0.9,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });

        // Parede frontal (não visível, é a "tela")
        // Não criamos a parede frontal para que a câmera veja através dela

        // Parede traseira
        const backGeometry = new THREE.PlaneGeometry(this.aquariumBounds.width, this.aquariumBounds.height);
        const backWall = new THREE.Mesh(backGeometry, glassMaterial);
        backWall.position.z = -this.aquariumBounds.depth / 2;
        backWall.receiveShadow = true;
        backWall.userData.isAquariumWall = true;
        this.scene.add(backWall);

        // Paredes laterais
        const sideGeometry = new THREE.PlaneGeometry(this.aquariumBounds.depth, this.aquariumBounds.height);
        
        const leftWall = new THREE.Mesh(sideGeometry, glassMaterial);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.x = -this.aquariumBounds.width / 2;
        leftWall.userData.isAquariumWall = true;
        this.scene.add(leftWall);

        const rightWall = new THREE.Mesh(sideGeometry, glassMaterial);
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.position.x = this.aquariumBounds.width / 2;
        rightWall.userData.isAquariumWall = true;
        this.scene.add(rightWall);

        // Chão
        const floorGeometry = new THREE.PlaneGeometry(this.aquariumBounds.width, this.aquariumBounds.depth);
        const floorMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x8B4513,
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -this.aquariumBounds.height / 2;
        floor.receiveShadow = true;
        floor.userData.isAquariumWall = true;
        this.scene.add(floor);

        // Adicionar areia no chão
        this.createSand();

        // Adicionar plantas decorativas
        this.createPlants();
    }

    createSand() {
        const sandGeometry = new THREE.PlaneGeometry(this.aquariumBounds.width * 0.9, this.aquariumBounds.depth * 0.9);
        const sandMaterial = new THREE.MeshLambertMaterial({
            color: 0xC2B280,
            transparent: true,
            opacity: 0.8
        });
        const sand = new THREE.Mesh(sandGeometry, sandMaterial);
        sand.rotation.x = -Math.PI / 2;
        sand.position.y = -this.aquariumBounds.height / 2 + 0.1;
        sand.userData.isAquariumWall = true;
        this.scene.add(sand);
    }

    createPlants() {
        // Calcular posições relativas às dimensões do aquário
        const plantPositions = [
            { x: -this.aquariumBounds.width * 0.3, z: -this.aquariumBounds.depth * 0.3 },
            { x: this.aquariumBounds.width * 0.3, z: -this.aquariumBounds.depth * 0.2 },
            { x: -this.aquariumBounds.width * 0.2, z: this.aquariumBounds.depth * 0.3 },
            { x: this.aquariumBounds.width * 0.2, z: this.aquariumBounds.depth * 0.2 }
        ];

        plantPositions.forEach(pos => {
            const plantGroup = new THREE.Group();
            
            // Caule
            const stemGeometry = new THREE.CylinderGeometry(0.1, 0.15, 3);
            const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.y = -this.aquariumBounds.height / 2 + this.aquariumBounds.height * 0.125;
            stem.userData.isAquariumWall = true;
            plantGroup.add(stem);

            // Folhas
            for (let i = 0; i < 5; i++) {
                const leafGeometry = new THREE.PlaneGeometry(0.8, 2);
                const leafMaterial = new THREE.MeshLambertMaterial({ 
                    color: 0x32CD32,
                    side: THREE.DoubleSide 
                });
                const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
                leaf.position.y = -this.aquariumBounds.height / 2 + i * this.aquariumBounds.height * 0.05;
                leaf.rotation.z = (Math.random() - 0.5) * 0.5;
                leaf.position.x = (Math.random() - 0.5) * 0.5;
                leaf.userData.isAquariumWall = true;
                plantGroup.add(leaf);
            }

            plantGroup.position.set(pos.x, 0, pos.z);
            this.scene.add(plantGroup);
        });
    }

    setupLighting() {
        // Luz ambiente
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Luz principal (simulando luz do teto)
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(0, 10, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -15;
        mainLight.shadow.camera.right = 15;
        mainLight.shadow.camera.top = 15;
        mainLight.shadow.camera.bottom = -15;
        this.scene.add(mainLight);

        // Luzes laterais para efeito de aquário
        const leftLight = new THREE.PointLight(0x00ccff, 0.5, 20);
        leftLight.position.set(-10, 0, 0);
        this.scene.add(leftLight);

        const rightLight = new THREE.PointLight(0x00ccff, 0.5, 20);
        rightLight.position.set(10, 0, 0);
        this.scene.add(rightLight);

        // Luz de fundo (efeito de água)
        const backLight = new THREE.PointLight(0x0066cc, 0.3, 15);
        backLight.position.set(0, 0, -8);
        this.scene.add(backLight);
    }

    createFish() {
        const fishGroup = new THREE.Group();
        
        // Cores variadas para os peixes
        const colors = [0xFF6B6B, 0xFFD93D, 0x6BCF7F, 0x4ECDC4, 0xFF8C42, 0x9B59B6, 0xE91E63];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Corpo do peixe (esfera como fallback)
        const bodyGeometry = new THREE.SphereGeometry(0.5, 16, 12);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.scale.set(1.5, 0.8, 0.6);
        body.castShadow = true;
        fishGroup.add(body);

        // Cauda
        const tailGeometry = new THREE.ConeGeometry(0.3, 0.8, 8);
        const tailMaterial = new THREE.MeshLambertMaterial({ color: color });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.x = -1;
        tail.rotation.z = Math.PI / 2;
        fishGroup.add(tail);

        // Nadadeiras
        const finGeometry = new THREE.PlaneGeometry(0.3, 0.6);
        const finMaterial = new THREE.MeshLambertMaterial({ 
            color: color,
            side: THREE.DoubleSide 
        });
        
        const topFin = new THREE.Mesh(finGeometry, finMaterial);
        topFin.position.set(0, 0.4, 0);
        topFin.rotation.x = Math.PI / 4;
        fishGroup.add(topFin);

        const sideFin1 = new THREE.Mesh(finGeometry, finMaterial);
        sideFin1.position.set(0.2, 0, 0.3);
        sideFin1.rotation.y = Math.PI / 6;
        fishGroup.add(sideFin1);

        const sideFin2 = new THREE.Mesh(finGeometry, finMaterial);
        sideFin2.position.set(0.2, 0, -0.3);
        sideFin2.rotation.y = -Math.PI / 6;
        fishGroup.add(sideFin2);

        // Olhos
        const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(0.5, 0.1, 0.2);
        fishGroup.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.5, 0.1, -0.2);
        fishGroup.add(rightEye);

        // Posição inicial aleatória
        fishGroup.position.set(
            (Math.random() - 0.5) * this.aquariumBounds.width * 0.8,
            (Math.random() - 0.5) * this.aquariumBounds.height * 0.8,
            (Math.random() - 0.5) * this.aquariumBounds.depth * 0.8
        );

        // Propriedades de movimento
        fishGroup.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.05,
                (Math.random() - 0.5) * 0.1
            ),
            targetVelocity: new THREE.Vector3(),
            wanderAngle: Math.random() * Math.PI * 2,
            size: 1,
            color: color,
            tailPhase: Math.random() * Math.PI * 2
        };

        this.scene.add(fishGroup);
        this.fishes.push(fishGroup);
        
        return fishGroup;
    }

    createInitialFishes(count) {
        for (let i = 0; i < count; i++) {
            this.createFish();
        }
    }

    createBubbles() {
        // Criar bolhas periódicas
        setInterval(() => {
            if (this.bubbles.length < 20) {
                this.createBubble();
            }
        }, 500);
    }

    createBubble() {
        const bubbleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const bubbleMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            transmission: 0.9,
            roughness: 0,
            metalness: 0
        });
        
        const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
        bubble.position.set(
            (Math.random() - 0.5) * this.aquariumBounds.width * 0.8,
            -this.aquariumBounds.height / 2 + 0.5,
            (Math.random() - 0.5) * this.aquariumBounds.depth * 0.8
        );
        
        bubble.userData = {
            velocity: 0.02 + Math.random() * 0.03,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.05 + Math.random() * 0.05
        };
        
        this.scene.add(bubble);
        this.bubbles.push(bubble);
    }

    setupVideoBackground() {
        // Tentar usar um vídeo de fundo (fallback para cor azul)
        try {
            const video = document.createElement('video');
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
            
            video.addEventListener('loadeddata', () => {
                const videoTexture = new THREE.VideoTexture(video);
                videoTexture.minFilter = THREE.LinearFilter;
                videoTexture.magFilter = THREE.LinearFilter;
                
                const videoMaterial = new THREE.MeshBasicMaterial({
                    map: videoTexture,
                    side: THREE.BackSide
                });
                
                const videoGeometry = new THREE.PlaneGeometry(this.aquariumBounds.width, this.aquariumBounds.height);
                this.videoBackground = new THREE.Mesh(videoGeometry, videoMaterial);
                this.videoBackground.position.z = -this.aquariumBounds.depth / 2 - 0.1;
                this.scene.add(this.videoBackground);
                
                video.play();
                this.useVideo = true;
            });
            
            video.addEventListener('error', () => {
                console.log('Vídeo não pôde ser carregado, usando fundo azul');
                this.useVideo = false;
            });
        } catch (error) {
            console.log('Erro ao configurar vídeo, usando fundo azul');
            this.useVideo = false;
        }
    }

    updateFishMovement(fish, deltaTime) {
        const userData = fish.userData;
        const bounds = this.aquariumBounds;
        
        // Comportamento de rebanho (flocking)
        const separation = this.calculateSeparation(fish);
        const alignment = this.calculateAlignment(fish);
        const cohesion = this.calculateCohesion(fish);
        const wander = this.calculateWander(fish);
        
        // Combinar forças
        userData.targetVelocity.add(separation.multiplyScalar(2.0));
        userData.targetVelocity.add(alignment.multiplyScalar(1.0));
        userData.targetVelocity.add(cohesion.multiplyScalar(1.0));
        userData.targetVelocity.add(wander.multiplyScalar(0.5));
        
        // Evitar paredes
        const avoidance = this.calculateAvoidance(fish);
        userData.targetVelocity.add(avoidance.multiplyScalar(3.0));
        
        // Suavizar transição de velocidade
        userData.velocity.lerp(userData.targetVelocity, 0.05);
        
        // Limitar velocidade
        const maxSpeed = 0.15 * this.speedMultiplier;
        if (userData.velocity.length() > maxSpeed) {
            userData.velocity.normalize().multiplyScalar(maxSpeed);
        }
        
        // Atualizar posição
        fish.position.add(userData.velocity.clone().multiplyScalar(deltaTime));
        
        // Manter dentro dos limites
        this.keepFishInBounds(fish);
        
        // Orientar peixe na direção do movimento
        if (userData.velocity.length() > 0.01) {
            fish.lookAt(fish.position.clone().add(userData.velocity));
        }
        
        // Animar cauda
        userData.tailPhase += 0.1 * this.speedMultiplier;
        const tail = fish.children[1]; // Cauda é o segundo filho
        if (tail) {
            tail.rotation.y = Math.sin(userData.tailPhase) * 0.3;
        }
        
        // Resetar velocidade alvo
        userData.targetVelocity.set(0, 0, 0);
    }

    calculateSeparation(fish) {
        const separation = new THREE.Vector3();
        const desiredSeparation = 2.0;
        let count = 0;
        
        this.fishes.forEach(other => {
            if (other !== fish) {
                const distance = fish.position.distanceTo(other.position);
                if (distance > 0 && distance < desiredSeparation) {
                    const diff = fish.position.clone().sub(other.position);
                    diff.normalize().divideScalar(distance);
                    separation.add(diff);
                    count++;
                }
            }
        });
        
        if (count > 0) {
            separation.divideScalar(count);
            separation.normalize().multiplyScalar(0.1);
        }
        
        return separation;
    }

    calculateAlignment(fish) {
        const alignment = new THREE.Vector3();
        const neighborDistance = 4.0;
        let count = 0;
        
        this.fishes.forEach(other => {
            if (other !== fish) {
                const distance = fish.position.distanceTo(other.position);
                if (distance > 0 && distance < neighborDistance) {
                    alignment.add(other.userData.velocity);
                    count++;
                }
            }
        });
        
        if (count > 0) {
            alignment.divideScalar(count);
            alignment.normalize().multiplyScalar(0.05);
        }
        
        return alignment;
    }

    calculateCohesion(fish) {
        const cohesion = new THREE.Vector3();
        const neighborDistance = 4.0;
        let count = 0;
        
        this.fishes.forEach(other => {
            if (other !== fish) {
                const distance = fish.position.distanceTo(other.position);
                if (distance > 0 && distance < neighborDistance) {
                    cohesion.add(other.position);
                    count++;
                }
            }
        });
        
        if (count > 0) {
            cohesion.divideScalar(count);
            cohesion.sub(fish.position);
            cohesion.normalize().multiplyScalar(0.03);
        }
        
        return cohesion;
    }

    calculateWander(fish) {
        const userData = fish.userData;
        userData.wanderAngle += (Math.random() - 0.5) * 0.3;
        
        const wander = new THREE.Vector3(
            Math.cos(userData.wanderAngle) * 0.02,
            (Math.random() - 0.5) * 0.01,
            Math.sin(userData.wanderAngle) * 0.02
        );
        
        return wander;
    }

    calculateAvoidance(fish) {
        const avoidance = new THREE.Vector3();
        const bounds = this.aquariumBounds;
        const margin = 2.0;
        
        // Evitar paredes
        if (fish.position.x < -bounds.width / 2 + margin) {
            avoidance.x = 0.1;
        } else if (fish.position.x > bounds.width / 2 - margin) {
            avoidance.x = -0.1;
        }
        
        if (fish.position.y < -bounds.height / 2 + margin) {
            avoidance.y = 0.1;
        } else if (fish.position.y > bounds.height / 2 - margin) {
            avoidance.y = -0.1;
        }
        
        if (fish.position.z < -bounds.depth / 2 + margin) {
            avoidance.z = 0.1;
        } else if (fish.position.z > bounds.depth / 2 - margin) {
            avoidance.z = -0.1;
        }
        
        return avoidance;
    }

    keepFishInBounds(fish) {
        const bounds = this.aquariumBounds;
        const margin = 0.5;
        
        fish.position.x = Math.max(-bounds.width / 2 + margin, Math.min(bounds.width / 2 - margin, fish.position.x));
        fish.position.y = Math.max(-bounds.height / 2 + margin, Math.min(bounds.height / 2 - margin, fish.position.y));
        fish.position.z = Math.max(-bounds.depth / 2 + margin, Math.min(bounds.depth / 2 - margin, fish.position.z));
    }

    updateBubbles(deltaTime) {
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            const userData = bubble.userData;
            
            // Movimento para cima com ondulação
            bubble.position.y += userData.velocity;
            bubble.position.x += Math.sin(userData.wobble) * 0.02;
            userData.wobble += userData.wobbleSpeed;
            
            // Remover bolhas que chegam ao topo
            if (bubble.position.y > this.aquariumBounds.height / 2) {
                this.scene.remove(bubble);
                this.bubbles.splice(i, 1);
            }
        }
    }

    updateFoodParticles(deltaTime) {
        for (let i = this.foodParticles.length - 1; i >= 0; i--) {
            const food = this.foodParticles[i];
            
            // Queda lenta
            food.position.y -= 0.02;
            food.rotation.x += 0.05;
            food.rotation.y += 0.03;
            
            // Verificar se peixes estão comendo
            this.fishes.forEach(fish => {
                const distance = fish.position.distanceTo(food.position);
                if (distance < 1.0) {
                    // Peixe come a comida
                    this.scene.remove(food);
                    this.foodParticles.splice(i, 1);
                    
                    // Peixe fica temporariamente mais rápido
                    fish.userData.velocity.multiplyScalar(1.5);
                }
            });
            
            // Remover comida que chega ao fundo
            if (food.position.y < -this.aquariumBounds.height / 2) {
                this.scene.remove(food);
                this.foodParticles.splice(i, 1);
            }
        }
    }

    feedFish() {
        // Adicionar partículas de comida
        for (let i = 0; i < 10; i++) {
            const foodGeometry = new THREE.SphereGeometry(0.1, 6, 6);
            const foodMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const food = new THREE.Mesh(foodGeometry, foodMaterial);
            
            food.position.set(
                (Math.random() - 0.5) * this.aquariumBounds.width * 0.6,
                this.aquariumBounds.height / 2 - 1,
                (Math.random() - 0.5) * this.aquariumBounds.depth * 0.6
            );
            
            this.scene.add(food);
            this.foodParticles.push(food);
        }
    }

    setupEventListeners() {
        // Controles de UI
        const fishSlider = document.getElementById('fish-slider');
        const fishCount = document.getElementById('fish-count');
        const speedSlider = document.getElementById('speed-slider');
        const speedValue = document.getElementById('speed-value');
        
        fishSlider.addEventListener('input', (e) => {
            const targetCount = parseInt(e.target.value);
            fishCount.textContent = targetCount;
            
            // Ajustar quantidade de peixes
            while (this.fishes.length < targetCount) {
                this.createFish();
            }
            while (this.fishes.length > targetCount) {
                const fish = this.fishes.pop();
                this.scene.remove(fish);
            }
        });
        
        speedSlider.addEventListener('input', (e) => {
            this.speedMultiplier = parseFloat(e.target.value);
            speedValue.textContent = this.speedMultiplier.toFixed(1);
        });
        
        document.getElementById('add-fish').addEventListener('click', () => {
            this.createFish();
            fishSlider.value = this.fishes.length;
            fishCount.textContent = this.fishes.length;
        });
        
        document.getElementById('remove-fish').addEventListener('click', () => {
            if (this.fishes.length > 1) {
                const fish = this.fishes.pop();
                this.scene.remove(fish);
                fishSlider.value = this.fishes.length;
                fishCount.textContent = this.fishes.length;
            }
        });
        
        document.getElementById('toggle-video').addEventListener('click', () => {
            if (this.videoBackground) {
                this.videoBackground.visible = !this.videoBackground.visible;
            }
        });
        
        document.getElementById('feed-fish').addEventListener('click', () => {
            this.feedFish();
        });
        
        // Resize handler
        window.addEventListener('resize', () => {
            const aspect = window.innerWidth / window.innerHeight;
            this.camera.aspect = aspect;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            
            // Atualizar dimensões do aquário
            this.updateAquariumBounds();
            
            // Ajustar posição da câmera
            const cameraDistance = Math.max(this.aquariumBounds.width, this.aquariumBounds.height) * 0.8; // Reduzido para zoom maior
            this.camera.position.set(0, 0, cameraDistance);
            this.camera.lookAt(0, 0, 0);
            
            this.rebuildAquarium();
        });
    }

    rebuildAquarium() {
        // Remover paredes antigas
        const oldWalls = [];
        this.scene.traverse((child) => {
            if (child.userData.isAquariumWall) {
                oldWalls.push(child);
            }
        });
        oldWalls.forEach(wall => this.scene.remove(wall));
        
        // Recriar aquário com novas dimensões
        this.createAquarium();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = 1;
        
        // Atualizar peixes
        this.fishes.forEach(fish => {
            this.updateFishMovement(fish, deltaTime);
        });
        
        // Atualizar bolhas
        this.updateBubbles(deltaTime);
        
        // Atualizar partículas de comida
        this.updateFoodParticles(deltaTime);
        
        // Renderizar
        this.renderer.render(this.scene, this.camera);
    }
}

// Inicializar o aquário quando a página carregar
window.addEventListener('load', () => {
    new Aquarium3D();
});
