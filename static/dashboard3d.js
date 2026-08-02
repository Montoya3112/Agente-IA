let scene, camera, renderer, animationId;
let currentViz = 'sphere';
let vizGroup = null;
let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
const clock = new THREE.Clock();

window.inicializar3D = function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (renderer) window.destruir3D();

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.015);

    camera = new THREE.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 32);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Dynamic Multi-Color Lighting System
    scene.add(new THREE.AmbientLight(0x303050, 0.7));

    const light1 = new THREE.PointLight(0x6c5ce7, 2.5, 120);
    light1.position.set(25, 25, 25);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x00cec9, 2.5, 120);
    light2.position.set(-25, -25, 25);
    scene.add(light2);

    const light3 = new THREE.PointLight(0xfdcb6e, 1.5, 80);
    light3.position.set(0, 20, -15);
    scene.add(light3);

    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);

    document.querySelectorAll('.viz-btn').forEach(btn => {
        btn.onclick = (e) => {
            document.querySelectorAll('.viz-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            createVisualization(e.target.dataset.viz);
        };
    });

    createVisualization('network'); // Default to enhanced Neural Network
    animate();
};

function createVisualization(type) {
    currentViz = type;
    if (vizGroup) {
        scene.remove(vizGroup);
        vizGroup.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                else child.material.dispose();
            }
        });
    }

    vizGroup = new THREE.Group();
    scene.add(vizGroup);

    if (type === 'sphere') createParticleSphere();
    else if (type === 'bars') create3DBars();
    else if (type === 'network') create3DNeuralNetwork();
}

/* --- 1. Enhanced Particle Sphere --- */
function createParticleSphere() {
    const count = 3500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color1 = new THREE.Color(0x6c5ce7), color2 = new THREE.Color(0x00cec9);

    for (let i = 0; i < count; i++) {
        const r = 14 + (Math.random() * 2.5 - 1.25);
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        const mixed = color1.clone().lerp(color2, Math.random());
        colors[i * 3] = mixed.r; colors[i * 3 + 1] = mixed.g; colors[i * 3 + 2] = mixed.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particles = new THREE.Points(geometry, new THREE.PointsMaterial({
        size: 0.18, vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending
    }));
    vizGroup.add(particles);

    const innerCore = new THREE.Mesh(
        new THREE.IcosahedronGeometry(7, 3),
        new THREE.MeshStandardMaterial({
            color: 0x00cec9, wireframe: true, transparent: true, opacity: 0.25, emissive: 0x00cec9, emissiveIntensity: 0.5
        })
    );
    vizGroup.add(innerCore);

    vizGroup.userData.update = (time) => {
        particles.rotation.y = time * 0.08;
        particles.rotation.x = time * 0.04;
        innerCore.rotation.y = -time * 0.15;
        innerCore.rotation.z = time * 0.08;
        const scale = 1 + Math.sin(time * 1.8) * 0.04;
        vizGroup.scale.set(scale, scale, scale);
    };
}

/* --- 2. 3D Metric Bars --- */
function create3DBars() {
    const data = window._lastMetricData || [12458, 843, 142, 99];
    const maxVal = Math.max(...data, 1);
    const colors = [0x6c5ce7, 0x00cec9, 0xfdcb6e, 0x00b894];
    const spacing = 7;
    const startX = -((data.length - 1) * spacing) / 2;

    const bars = [];
    for (let i = 0; i < data.length; i++) {
        const targetH = Math.max(2, (data[i] / maxVal) * 18);
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(4.5, 1, 4.5),
            new THREE.MeshStandardMaterial({
                color: colors[i], emissive: colors[i], emissiveIntensity: 0.45,
                roughness: 0.2, metalness: 0.8
            })
        );
        mesh.position.set(startX + (i * spacing), -10, 0);
        mesh.userData = { targetHeight: targetH, currentH: 1 };
        bars.push(mesh);
        vizGroup.add(mesh);
    }

    vizGroup.userData.update = (time) => {
        vizGroup.rotation.y = Math.sin(time * 0.4) * 0.18;
        bars.forEach(bar => {
            if (bar.userData.currentH < bar.userData.targetHeight) {
                bar.userData.currentH += (bar.userData.targetHeight - bar.userData.currentH) * 0.08;
                bar.scale.y = bar.userData.currentH;
                bar.position.y = -10 + (bar.userData.currentH / 2);
            }
        });
    };
}

window.actualizarMetricas = function(data) {
    window._lastMetricData = data;
    if (currentViz === 'bars' && vizGroup) createVisualization('bars');
};

/* --- 3. HIGH-TECH 3D NEURAL NETWORK VISUALIZER --- */
function create3DNeuralNetwork() {
    const layers = [4, 7, 7, 4]; // Deep Neural Net architecture: Input (4) -> Hidden 1 (7) -> Hidden 2 (7) -> Output (4)
    const layerSpacing = 9;
    const startX = -((layers.length - 1) * layerSpacing) / 2;

    const nodes = [];
    const nodePositions = [];
    const connections = [];

    const nodeColors = [0x6c5ce7, 0x00cec9, 0xa29bfe, 0xfdcb6e];

    // Create Neural Layer Nodes
    layers.forEach((nodeCount, layerIdx) => {
        const nodeSpacing = 4.5;
        const startY = -((nodeCount - 1) * nodeSpacing) / 2;
        const color = nodeColors[layerIdx % nodeColors.length];

        for (let n = 0; n < nodeCount; n++) {
            const pos = new THREE.Vector3(
                startX + (layerIdx * layerSpacing),
                startY + (n * nodeSpacing),
                (Math.random() - 0.5) * 3
            );

            // Glowing Sphere Node
            const nodeMesh = new THREE.Mesh(
                new THREE.SphereGeometry(0.7, 32, 32),
                new THREE.MeshStandardMaterial({
                    color: color, emissive: color, emissiveIntensity: 0.8,
                    roughness: 0.1, metalness: 0.9
                })
            );
            nodeMesh.position.copy(pos);
            nodeMesh.userData = {
                layer: layerIdx,
                basePos: pos.clone(),
                pulseOffset: Math.random() * Math.PI * 2
            };

            nodes.push(nodeMesh);
            nodePositions.push(pos);
            vizGroup.add(nodeMesh);

            // Outer Halo Rings around neurons
            const ring = new THREE.Mesh(
                new THREE.RingGeometry(1.0, 1.2, 32),
                new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending })
            );
            ring.position.copy(pos);
            ring.rotation.x = Math.PI / 2;
            vizGroup.add(ring);
        }
    });

    // Create Synaptic Connection Lines between Adjacent Layers
    let prevLayerStart = 0;
    const lineMat = new THREE.LineBasicMaterial({
        color: 0x00cec9, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending
    });

    for (let l = 0; l < layers.length - 1; l++) {
        const currCount = layers[l];
        const nextCount = layers[l + 1];
        const currStart = prevLayerStart;
        const nextStart = currStart + currCount;

        for (let i = 0; i < currCount; i++) {
            for (let j = 0; j < nextCount; j++) {
                const p1 = nodes[currStart + i].position;
                const p2 = nodes[nextStart + j].position;

                const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
                const line = new THREE.Line(lineGeo, lineMat);
                vizGroup.add(line);

                connections.push({ from: p1, to: p2, progress: Math.random() });
            }
        }
        prevLayerStart = nextStart;
    }

    // Synaptic Pulse Signals (moving light sparks)
    const pulsesGroup = new THREE.Group();
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending });
    const pulseGeo = new THREE.SphereGeometry(0.2, 16, 16);

    const activePulses = [];
    for (let p = 0; p < 25; p++) {
        const spark = new THREE.Mesh(pulseGeo, pulseMat);
        pulsesGroup.add(spark);
        const connIndex = Math.floor(Math.random() * connections.length);
        activePulses.push({
            mesh: spark,
            conn: connections[connIndex],
            speed: 0.008 + Math.random() * 0.012,
            progress: Math.random()
        });
    }
    vizGroup.add(pulsesGroup);

    // Animation Loop for Neural Network
    vizGroup.userData.update = (time) => {
        vizGroup.rotation.y = Math.sin(time * 0.25) * 0.15;
        vizGroup.rotation.x = Math.cos(time * 0.2) * 0.08;

        // Oscillate Neuron Nodes
        nodes.forEach(node => {
            const floatY = Math.sin(time * 2 + node.userData.pulseOffset) * 0.15;
            node.position.y = node.userData.basePos.y + floatY;
        });

        // Move Synaptic Pulses along Connection Pathways
        activePulses.forEach(p => {
            p.progress += p.speed;
            if (p.progress >= 1) {
                p.progress = 0;
                p.conn = connections[Math.floor(Math.random() * connections.length)];
            }
            p.mesh.position.lerpVectors(p.conn.from, p.conn.to, p.progress);
        });
    };
}

function onMouseMove(event) {
    mouseX = (event.clientX - window.innerWidth / 2) * 0.0008;
    mouseY = (event.clientY - window.innerHeight / 2) * 0.0008;
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    if (!container || !camera || !renderer) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    animationId = requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    targetX = mouseX * 2.5;
    targetY = mouseY * 2.5;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    if (vizGroup && vizGroup.userData.update) vizGroup.userData.update(elapsedTime);
    renderer.render(scene, camera);
}

window.destruir3D = function() {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('resize', onWindowResize);
    document.removeEventListener('mousemove', onMouseMove);
    if (renderer) {
        renderer.dispose();
        const container = document.getElementById('canvas-container');
        if (container && renderer.domElement) container.removeChild(renderer.domElement);
        renderer = null;
    }
    if (scene) {
        scene.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                else child.material.dispose();
            }
        });
        scene = null;
    }
};
