/**
 * AETHERIA - Master Application Controller
 * High polish, responsive interactions, tactile feedback, seed economy, time lapse, oracle, and easter eggs
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Subsystems
    const canvas = document.getElementById('renderCanvas');
    const audio = window.AudioEngine;
    const soundscape = new window.SoundscapeManager(audio);
    const particles = new window.ParticleEngine();
    const weather = new window.WeatherEngine();
    const ecosystem = new window.EcosystemManager();
    const codex = new window.CodexManager();
    const oracle = new window.OracleManager();

    ecosystem.initDefaultSanctuary();

    const pondBounds = { cx: 15, cy: 18, rx: 68, ry: 34 };
    const fauna = new window.FaunaManager(pondBounds);
    const renderer = new window.SceneRenderer(canvas, weather, particles, ecosystem, fauna);

    const stargazer = new window.Stargazer(codex, particles, ecosystem);
    const cameraStudio = new window.PolaroidStudio(canvas, weather, codex);

    window.StorageManager.load(ecosystem, codex, audio, weather);

    let selectedSeedSpecies = null;
    let isPlantingMode = false;
    let lastTime = performance.now();

    // Easter egg & chime sequence tracking
    let chimeHistory = [];
    let glassTapCount = 0;
    let lastGlassTapTime = 0;

    // 2. Toast Notification System
    function showToast(title, message, icon = '✨') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div>
                <div class="toast-title">${title}</div>
                <div style="font-size: 11px; color: #bae6fd;">${message}</div>
            </div>
        `;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s forwards';
            setTimeout(() => toast.remove(), 320);
        }, 4200);
    }

    codex.onUnlockCallback = (item) => {
        if (item.isAchievement) {
            showToast(`成就解锁：${item.name}`, item.desc, '🏆');
        } else {
            showToast(`图鉴发现：${item.name}`, item.desc, item.icon || '📜');
        }
    };

    // 3. UI Element References
    const timeDisplay = document.getElementById('timeDisplay');
    const timeSlider = document.getElementById('timeSlider');
    const timeLapseBtn = document.getElementById('timeLapseBtn');
    const syncTimeBtn = document.getElementById('syncTimeBtn');
    const shardCountEl = document.getElementById('shardCount');
    const audioToggleBtn = document.getElementById('audioToggleBtn');
    const zenToggleBtn = document.getElementById('zenToggleBtn');
    const shutterOverlay = document.getElementById('shutterOverlay');

    const welcomeScreen = document.getElementById('welcomeScreen');
    const awakenBtn = document.getElementById('awakenBtn');
    const seedModal = document.getElementById('seedModal');
    const codexModal = document.getElementById('codexModal');
    const stargazerModal = document.getElementById('stargazerModal');
    const cameraModal = document.getElementById('cameraModal');
    const mixerModal = document.getElementById('mixerModal');
    const oracleModal = document.getElementById('oracleModal');

    // 4. Time & Weather Updates
    function updateClockDisplay() {
        const tod = weather.getTimeOfDay();
        const todNames = {
            'dawn': '晨曦',
            'day': '盛昼',
            'dusk': '暮霞',
            'night': '幽夜'
        };
        const hours = Math.floor(weather.time);
        const mins = Math.floor((weather.time % 1) * 60);
        const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
        timeDisplay.textContent = `${timeStr} · ${todNames[tod]}`;
        timeSlider.value = weather.time;

        if (tod === 'night') {
            codex.unlock('aurora');
            codex.unlockAchievement('night_owl');
        }
    }

    timeSlider.addEventListener('input', (e) => {
        weather.time = parseFloat(e.target.value);
        weather.realTimeSync = false;
        weather.isAutoAdvancing = false;
        timeLapseBtn.classList.remove('active');
        syncTimeBtn.classList.remove('active');
        updateClockDisplay();
    });

    timeLapseBtn.addEventListener('click', () => {
        weather.isAutoAdvancing = !weather.isAutoAdvancing;
        weather.realTimeSync = false;
        timeLapseBtn.classList.toggle('active', weather.isAutoAdvancing);
        syncTimeBtn.classList.remove('active');
        if (weather.isAutoAdvancing) {
            weather.timeSpeed = 0.5; // Smooth 48s day-night voyage
            showToast('昼夜巡航已启航', '悬岛时光正平滑流淌，静观晨昏更迭与星辰起落', '⏳');
        } else {
            showToast('巡航已暂停', '当前时光已定格', '⏸️');
        }
    });

    syncTimeBtn.addEventListener('click', () => {
        weather.realTimeSync = !weather.realTimeSync;
        weather.isAutoAdvancing = false;
        timeLapseBtn.classList.remove('active');
        syncTimeBtn.classList.toggle('active', weather.realTimeSync);
        if (weather.realTimeSync) {
            showToast('已同步本地时刻', '悬岛昼夜将与你的现实世界无缝对应', '🕰️');
        }
    });

    // Weather pills
    document.querySelectorAll('.weather-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.weather-pill').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const type = btn.getAttribute('data-weather');
            weather.setWeather(type);

            if (type === 'rain') {
                codex.unlock('celestial_rain');
                codex.unlockAchievement('rain_maker');
            } else if (type === 'stardust') {
                codex.unlock('shooting_star');
                for (let i = 0; i < 4; i++) {
                    setTimeout(() => particles.spawnShootingStar(window.innerWidth, window.innerHeight), i * 400);
                }
            }

            if (window.AudioEngine) window.AudioEngine.playGlassTap(600);
        });
    });

    // 5. Creator Tool Dock Switching
    const toolBtns = document.querySelectorAll('.tool-btn[data-tool]');
    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toolBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderer.currentTool = btn.getAttribute('data-tool');
            isPlantingMode = false;
            canvas.style.cursor = 'default';

            if (window.AudioEngine) {
                window.AudioEngine.playGlassTap(800);
            }
        });
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        if (e.key === '1') selectTool('pipette');
        if (e.key === '2') selectTool('sol');
        if (e.key === '3') selectTool('wind');
        if (e.key === '4') selectTool('bell');
        if (e.key === '5') selectTool('scythe');
        if (e.code === 'Space') {
            particles.spawnShootingStar(window.innerWidth, window.innerHeight);
        }
        if (e.key === 'z' || e.key === 'Z') {
            toggleZenMode();
        }
        if (e.key === 'm' || e.key === 'M') {
            toggleMute();
        }
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
            if (document.body.classList.contains('zen-mode')) toggleZenMode();
        }
    });

    function selectTool(toolName) {
        toolBtns.forEach(b => {
            if (b.getAttribute('data-tool') === toolName) {
                b.click();
            }
        });
    }

    function toggleZenMode() {
        document.body.classList.toggle('zen-mode');
        const isZen = document.body.classList.contains('zen-mode');
        zenToggleBtn.classList.toggle('active', isZen);
        if (isZen) {
            showToast('已进入禅境模式', '所有界面已隐去，按 ESC 或再次点击可退出', '🍃');
        }
    }

    zenToggleBtn.addEventListener('click', toggleZenMode);

    function toggleMute() {
        const isMuted = audio.toggleMute();
        audioToggleBtn.textContent = isMuted ? '🔇' : '🔊';
        audioToggleBtn.classList.toggle('active', !isMuted);
    }

    audioToggleBtn.addEventListener('click', toggleMute);

    // 6. Interactive Canvas Mouse & Touch Handling
    function handlePointerMove(e) {
        const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
        const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
        if (clientX === undefined) return;

        renderer.pointerScreenX = clientX;
        renderer.pointerScreenY = clientY;

        const cx = window.innerWidth * 0.5;
        const cy = window.innerHeight * 0.5;
        renderer.camera.targetX = (clientX - cx) * 0.04;
        renderer.camera.targetY = (clientY - cy) * 0.04;

        const world = renderer.screenToWorld(clientX, clientY);
        renderer.pointerWorldX = world.x;
        renderer.pointerWorldY = world.y;

        // Check Chimes sweep
        if (renderer.chimes) {
            renderer.chimes.chimes.forEach((c, idx) => {
                const struck = c.checkInteraction(world.x, world.y, world.x - renderer.lastPointerWorldX, world.y - renderer.lastPointerWorldY);
                if (struck) {
                    recordChimeStrike(idx);
                }
            });
        }
    }

    function recordChimeStrike(chimeIdx) {
        const now = Date.now();
        chimeHistory.push({ idx: chimeIdx, time: now });
        if (chimeHistory.length > 5) chimeHistory.shift();

        // Check if user swept chimes 0 -> 1 -> 2 -> 3 -> 4
        if (chimeHistory.length === 5) {
            const isSweep = chimeHistory.every((item, i) => item.idx === i);
            const timeSpan = chimeHistory[4].time - chimeHistory[0].time;
            if (isSweep && timeSpan < 2200) {
                // Secret Harmony of the Spheres Easter Egg!
                audio.playSacredChoirChord();
                for (let i = 0; i < 6; i++) {
                    setTimeout(() => particles.spawnShootingStar(window.innerWidth, window.innerHeight), i * 250);
                }
                weather.setWeather('stardust');
                codex.unlock('resonance_chimes');
                showToast('🌟 唤醒隐藏天象：以太天籁共鸣！', '五音天籁磬依律同振，神圣极光与星屑流光降临！', '🎵');
                chimeHistory = [];
            }
        }
    }

    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('touchmove', handlePointerMove, { passive: true });

    canvas.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        renderer.isPointerDown = true;
        handlePointerClick(e);
    });

    window.addEventListener('mouseup', () => {
        renderer.isPointerDown = false;
    });

    canvas.addEventListener('touchstart', (e) => {
        renderer.isPointerDown = true;
        handlePointerClick(e);
    }, { passive: true });

    window.addEventListener('touchend', () => {
        renderer.isPointerDown = false;
    });

    function handlePointerClick(e) {
        const world = renderer.screenToWorld(renderer.pointerScreenX, renderer.pointerScreenY);
        const wx = world.x;
        const wy = world.y;
        const pan = Math.max(-1, Math.min(1, wx / 200));

        // 1. Guardian Spirit
        const spiritDist = Math.hypot(fauna.spirit.x - wx, fauna.spirit.y - wy);
        if (spiritDist < 30) {
            fauna.spirit.interact();
            codex.unlock('guardian_spirit');
            codex.unlockAchievement('spirit_friend');
            particles.burst(fauna.spirit.x, fauna.spirit.y - 10, 12, '#bae6fd', 3);
            return;
        }

        // 2. Planting Mode
        if (isPlantingMode && selectedSeedSpecies) {
            const isWater = Math.hypot(pondBounds.cx - wx, (pondBounds.cy - wy) * 2) < pondBounds.rx;
            const speciesData = Plant.SPECIES[selectedSeedSpecies];

            if (speciesData.waterPlant && !isWater) {
                showToast('播种失败', `${speciesData.name} 需要种植在水池灵泉中哦！`, '💧');
                return;
            }

            if (ecosystem.starlightShards < speciesData.cost) {
                showToast('星尘不足', `播种「${speciesData.name}」需要 ✨ ${speciesData.cost}，请先采收盛开的花朵。`, '✨');
                return;
            }

            ecosystem.starlightShards -= speciesData.cost;
            shardCountEl.textContent = ecosystem.starlightShards;

            ecosystem.addPlant(selectedSeedSpecies, wx, wy, isWater, 0.35);
            particles.burst(wx, wy, 16, '#6ee7b7', 3);
            if (window.AudioEngine) window.AudioEngine.playWaterDrip(880, 0.35, pan);
            codex.unlock(selectedSeedSpecies);

            isPlantingMode = false;
            canvas.style.cursor = 'default';
            showToast('播种成功！', `已在悬岛植下「${speciesData.name}」，请用甘露细心呵护。`, '🌱');
            return;
        }

        // 3. Harmonic Bell
        if (renderer.currentTool === 'bell') {
            particles.spawnMusicNote(wx, wy);
            const notes = [293.66, 369.99, 440.00, 587.33, 739.99];
            const randomNote = notes[Math.floor(Math.random() * notes.length)];
            if (window.AudioEngine) window.AudioEngine.playCelestialChime(randomNote, 0.45, pan);

            for (const p of ecosystem.plants) {
                const dist = Math.hypot(p.x - wx, p.y - wy);
                if (dist < 70) {
                    p.swayVelocity += (Math.random() - 0.5) * 0.15;
                    particles.burst(p.x, p.y - 20, 6, p.species.glowColor, 2);
                }
            }
        }

        // 4. Glass Tap
        const rX = renderer.terrarium.radiusX;
        const rY = renderer.terrarium.radiusY;
        const edgeDist = Math.hypot(wx / rX, wy / rY);
        if (edgeDist > 0.85 && edgeDist < 1.15) {
            if (window.AudioEngine) window.AudioEngine.playGlassTap(1100, pan);
            particles.addRipple(wx, wy, 30, 0.6);

            const now = Date.now();
            if (now - lastGlassTapTime < 800) {
                glassTapCount++;
                if (glassTapCount >= 3) {
                    for (let i = 0; i < 4; i++) {
                        setTimeout(() => {
                            particles.addRipple((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 100, 45, 0.8);
                        }, i * 100);
                    }
                    fauna.butterflies.forEach(b => {
                        b.targetX += (Math.random() - 0.5) * 120;
                        b.targetY -= 40;
                    });
                    glassTapCount = 0;
                }
            } else {
                glassTapCount = 1;
            }
            lastGlassTapTime = now;
        }
    }

    // 7. Seed Selection Drawer Setup
    const openSeedDrawerBtn = document.getElementById('openSeedDrawerBtn');
    const seedGridContainer = document.getElementById('seedGridContainer');

    function renderSeedGrid() {
        seedGridContainer.innerHTML = '';
        Object.values(Plant.SPECIES).forEach(sp => {
            const card = document.createElement('div');
            const canAfford = ecosystem.starlightShards >= sp.cost;
            card.className = `seed-card ${selectedSeedSpecies === sp.id ? 'selected' : ''}`;
            const icons = {
                'starlight_sprout': '🌱',
                'moon_lotus': '🪷',
                'whispering_willow': '🌾',
                'chrono_orchid': '🌸',
                'crystal_bonsai': '💎',
                'prism_blossom': '🌺'
            };
            card.innerHTML = `
                <div class="seed-icon">${icons[sp.id] || '🌱'}</div>
                <div class="seed-name">${sp.name}</div>
                <div class="seed-latin">${sp.latin}</div>
                <div style="font-size: 11px; color: ${canAfford ? 'var(--gold)' : 'var(--text-dim)'}; margin: 5px 0; font-weight: 600;">
                    ${sp.cost === 0 ? '✨ 免费灵种' : `✨ 消耗 ${sp.cost} 星尘`}
                </div>
                <div style="font-size: 11px; color: var(--text-muted); line-height: 1.3;">${sp.desc}</div>
            `;
            card.addEventListener('click', () => {
                if (!canAfford) {
                    showToast('星尘结晶不足', `培育「${sp.name}」需要 ✨ ${sp.cost} 星尘，你可以用采撷工具采收盛开的花朵获取！`, '✨');
                    return;
                }
                selectedSeedSpecies = sp.id;
                isPlantingMode = true;
                canvas.style.cursor = 'crosshair';
                seedModal.classList.remove('open');
                showToast('已选定种子', `请点击悬岛上的泥土或水池，植下「${sp.name}」`, '🌱');
            });
            seedGridContainer.appendChild(card);
        });
    }

    openSeedDrawerBtn.addEventListener('click', () => {
        renderSeedGrid();
        seedModal.classList.add('open');
        if (window.AudioEngine) window.AudioEngine.playGlassTap(800);
    });

    // 8. Codex & Achievements Modal Setup
    const openCodexBtn = document.getElementById('openCodexBtn');
    const codexListContainer = document.getElementById('codexListContainer');
    let currentCodexTab = 'flora';

    function renderCodexList(tab) {
        currentCodexTab = tab;
        codexListContainer.innerHTML = '';

        if (tab === 'achievements') {
            codex.achievements.forEach(ach => {
                const item = document.createElement('div');
                item.className = `codex-item ${ach.unlocked ? '' : 'locked'}`;
                item.innerHTML = `
                    <div class="codex-icon">${ach.unlocked ? '🏆' : '🔒'}</div>
                    <div class="codex-info">
                        <div class="codex-name">${ach.title}</div>
                        <div class="codex-desc">${ach.desc}</div>
                        <div style="font-size: 10px; color: ${ach.unlocked ? 'var(--primary)' : 'var(--text-dim)'}; margin-top: 4px;">
                            ${ach.unlocked ? '✓ 已达成' : '尚未达成'}
                        </div>
                    </div>
                `;
                codexListContainer.appendChild(item);
            });
            return;
        }

        const filtered = Object.values(codex.entries).filter(e => e.category === tab);
        filtered.forEach(entry => {
            const item = document.createElement('div');
            item.className = `codex-item ${entry.unlocked ? '' : 'locked'}`;
            item.innerHTML = `
                <div class="codex-icon">${entry.unlocked ? (entry.icon || '📜') : '🔒'}</div>
                <div class="codex-info">
                    <div class="codex-name">${entry.unlocked ? entry.name : '未知秘境档案'}</div>
                    <div class="codex-desc">${entry.unlocked ? entry.desc : '探索悬岛并进行相应互动以解锁此条目档案。'}</div>
                </div>
            `;
            codexListContainer.appendChild(item);
        });
    }

    document.querySelectorAll('.codex-tab').forEach(tabBtn => {
        tabBtn.addEventListener('click', () => {
            document.querySelectorAll('.codex-tab').forEach(b => b.classList.remove('active'));
            tabBtn.classList.add('active');
            renderCodexList(tabBtn.getAttribute('data-tab'));
        });
    });

    openCodexBtn.addEventListener('click', () => {
        renderCodexList(currentCodexTab);
        codexModal.classList.add('open');
        if (window.AudioEngine) window.AudioEngine.playGlassTap(800);
    });

    // 9. Stargazer Constellation Puzzle
    const openStargazerBtn = document.getElementById('openStargazerBtn');
    const constellationCanvas = document.getElementById('constellationCanvas');
    const cCtx = constellationCanvas.getContext('2d');
    const constellationTitle = document.getElementById('constellationTitle');
    const constellationDesc = document.getElementById('constellationDesc');
    const prevConstellationBtn = document.getElementById('prevConstellationBtn');
    const nextConstellationBtn = document.getElementById('nextConstellationBtn');

    function renderConstellation() {
        const cur = stargazer.getCurrent();
        const w = constellationCanvas.width;
        const h = constellationCanvas.height;

        cCtx.clearRect(0, 0, w, h);

        cCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < 40; i++) {
            const sx = (Math.sin(i * 123) * 0.5 + 0.5) * w;
            const sy = (Math.cos(i * 456) * 0.5 + 0.5) * h;
            cCtx.beginPath();
            cCtx.arc(sx, sy, 0.8, 0, Math.PI * 2);
            cCtx.fill();
        }

        cCtx.save();
        cCtx.strokeStyle = cur.completed ? '#fde047' : '#38bdf8';
        cCtx.shadowColor = cur.completed ? '#eab308' : '#0284c7';
        cCtx.shadowBlur = 12;
        cCtx.lineWidth = 2.5;

        for (const edgeKey of stargazer.connectedEdges) {
            const [a, b] = edgeKey.split('-').map(Number);
            const starA = cur.stars[a];
            const starB = cur.stars[b];
            if (starA && starB) {
                cCtx.beginPath();
                cCtx.moveTo(starA.x, starA.y);
                cCtx.lineTo(starB.x, starB.y);
                cCtx.stroke();
            }
        }
        cCtx.restore();

        if (stargazer.selectedStar !== null && !cur.completed) {
            const starA = cur.stars[stargazer.selectedStar];
            cCtx.save();
            cCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            cCtx.setLineDash([4, 4]);
            cCtx.lineWidth = 1.5;
            cCtx.beginPath();
            cCtx.moveTo(starA.x, starA.y);
            cCtx.lineTo(stargazerMouseX, stargazerMouseY);
            cCtx.stroke();
            cCtx.restore();
        }

        cur.stars.forEach(s => {
            const isSelected = stargazer.selectedStar === s.id;
            cCtx.save();
            cCtx.fillStyle = isSelected ? '#fde047' : '#ffffff';
            cCtx.shadowColor = isSelected ? '#eab308' : '#38bdf8';
            cCtx.shadowBlur = 14;

            cCtx.beginPath();
            cCtx.arc(s.x, s.y, isSelected ? 6 : 4, 0, Math.PI * 2);
            cCtx.fill();

            cCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            cCtx.lineWidth = 1;
            cCtx.beginPath();
            cCtx.arc(s.x, s.y, 10, 0, Math.PI * 2);
            cCtx.stroke();

            cCtx.restore();
        });

        constellationTitle.textContent = `${cur.name} ${cur.completed ? '★ 已点亮神恩' : ''}`;
        constellationDesc.textContent = cur.desc;
    }

    let stargazerMouseX = 0;
    let stargazerMouseY = 0;

    constellationCanvas.addEventListener('mousemove', (e) => {
        const rect = constellationCanvas.getBoundingClientRect();
        stargazerMouseX = (e.clientX - rect.left) * (constellationCanvas.width / rect.width);
        stargazerMouseY = (e.clientY - rect.top) * (constellationCanvas.height / rect.height);
        renderConstellation();
    });

    constellationCanvas.addEventListener('click', (e) => {
        const rect = constellationCanvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (constellationCanvas.width / rect.width);
        const my = (e.clientY - rect.top) * (constellationCanvas.height / rect.height);
        const cur = stargazer.getCurrent();

        for (const s of cur.stars) {
            const dist = Math.hypot(s.x - mx, s.y - my);
            if (dist < 18) {
                stargazer.selectStar(s.id);
                renderConstellation();
                break;
            }
        }
    });

    prevConstellationBtn.addEventListener('click', () => {
        stargazer.prevConstellation();
        renderConstellation();
    });

    nextConstellationBtn.addEventListener('click', () => {
        stargazer.nextConstellation();
        renderConstellation();
    });

    openStargazerBtn.addEventListener('click', () => {
        renderConstellation();
        stargazerModal.classList.add('open');
        if (window.AudioEngine) window.AudioEngine.playGlassTap(800);
    });

    // 10. Polaroid Camera Snapshot Modal
    const openCameraBtn = document.getElementById('openCameraBtn');
    const polaroidImg = document.getElementById('polaroidImg');
    const retakePhotoBtn = document.getElementById('retakePhotoBtn');
    const savePhotoBtn = document.getElementById('savePhotoBtn');

    function takeSnapshot() {
        shutterOverlay.classList.remove('flash');
        void shutterOverlay.offsetWidth;
        shutterOverlay.classList.add('flash');

        const dataUrl = cameraStudio.captureSnapshot();
        polaroidImg.src = dataUrl;
        cameraModal.classList.add('open');
    }

    openCameraBtn.addEventListener('click', takeSnapshot);
    retakePhotoBtn.addEventListener('click', takeSnapshot);
    savePhotoBtn.addEventListener('click', () => {
        cameraStudio.downloadSnapshot();
        showToast('照片已保存！', '高分辨率留影相片已下载至你的设备。', '📷');
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            cameraStudio.activeFilter = btn.getAttribute('data-filter');
            polaroidImg.src = cameraStudio.captureSnapshot();
        });
    });

    // 11. Daily Oracle & Morning Wisdom Setup
    const openOracleBtn = document.getElementById('openOracleBtn');
    const oracleSign = document.getElementById('oracleSign');
    const oracleTitle = document.getElementById('oracleTitle');
    const oracleGuidance = document.getElementById('oracleGuidance');
    const oracleAdvice = document.getElementById('oracleAdvice');
    const oracleLucky = document.getElementById('oracleLucky');
    const drawAnotherOracleBtn = document.getElementById('drawAnotherOracleBtn');

    function displayOracleCard(card) {
        oracleSign.textContent = card.sign;
        oracleTitle.textContent = card.title;
        oracleGuidance.textContent = card.guidance;
        oracleAdvice.textContent = card.advice;
        oracleLucky.textContent = card.luckySign;
    }

    openOracleBtn.addEventListener('click', () => {
        const card = oracle.getDailyCard(weather.getTimeOfDay());
        displayOracleCard(card);
        oracleModal.classList.add('open');
        if (window.AudioEngine) window.AudioEngine.playCelestialChime(587.33, 0.4);
    });

    drawAnotherOracleBtn.addEventListener('click', () => {
        const card = oracle.getRandomCard();
        displayOracleCard(card);
        if (window.AudioEngine) window.AudioEngine.playCelestialChime(739.99, 0.4);
    });

    // 12. Soundscape Mixer Setup
    const openMixerBtn = document.getElementById('openMixerBtn');
    const volPad = document.getElementById('volPad');
    const volWind = document.getElementById('volWind');
    const volRain = document.getElementById('volRain');
    const volFauna = document.getElementById('volFauna');
    const toggleBinauralBtn = document.getElementById('toggleBinauralBtn');

    openMixerBtn.addEventListener('click', () => {
        mixerModal.classList.add('open');
        if (window.AudioEngine) window.AudioEngine.playGlassTap(800);
    });

    volPad.addEventListener('input', (e) => {
        if (audio.padGain && audio.ctx) {
            audio.padGain.gain.setTargetAtTime(parseFloat(e.target.value) * 0.7, audio.ctx.currentTime, 0.1);
        }
    });

    volWind.addEventListener('input', (e) => {
        if (audio.windGain && audio.ctx) {
            audio.layers.wind.volume = parseFloat(e.target.value);
            audio.windGain.gain.setTargetAtTime(parseFloat(e.target.value) * 0.25, audio.ctx.currentTime, 0.1);
        }
    });

    volRain.addEventListener('input', (e) => {
        if (audio.rainGain && audio.ctx) {
            audio.layers.rain.volume = parseFloat(e.target.value);
            audio.rainGain.gain.setTargetAtTime(parseFloat(e.target.value) * 0.4, audio.ctx.currentTime, 0.1);
        }
    });

    volFauna.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        audio.layers.birds.volume = val;
        audio.layers.crickets.volume = val;
    });

    let binauralActive = false;
    toggleBinauralBtn.addEventListener('click', () => {
        binauralActive = !binauralActive;
        audio.toggleBinauralBeat(binauralActive, 10.0);
        toggleBinauralBtn.textContent = binauralActive ? '已开启' : '开启';
        toggleBinauralBtn.classList.toggle('active', binauralActive);
        if (binauralActive) {
            showToast('阿尔法节拍已激活', '10Hz 双耳节拍正在共振，推荐佩戴耳机聆听', '🎧');
        }
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close, [data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-close');
            const target = modalId ? document.getElementById(modalId) : btn.closest('.modal-overlay');
            if (target) target.classList.remove('open');
        });
    });

    // 13. Awaken Entry Button
    awakenBtn.addEventListener('click', () => {
        audio.resume();
        welcomeScreen.classList.remove('open');
        soundscape.applyPreset('celestial');
        showToast('秘境已苏醒', '欢迎来到 AETHERIA · 浮光秘境，探索或静心聆听吧！', '🌟');
    });

    // 14. Auto-save loop
    setInterval(() => {
        window.StorageManager.save(ecosystem, codex, audio, weather);
    }, 12000);

    // 15. Master Animation Frame Loop
    function animate(now) {
        const dt = Math.min(0.1, (now - lastTime) / 1000);
        lastTime = now;

        weather.update(dt);
        particles.update(dt, weather.currentWeather, renderer.windStrength);
        ecosystem.update(dt, weather.currentWeather, weather.getTimeOfDay(), renderer.windStrength);
        fauna.update(dt, renderer.pointerWorldX, renderer.pointerWorldY, particles);
        renderer.update(dt);

        shardCountEl.textContent = ecosystem.starlightShards;
        updateClockDisplay();

        const hasBlooming = ecosystem.plants.some(p => p.stage === 4);
        if (hasBlooming) {
            codex.unlockAchievement('first_bloom');
        }

        renderer.render();

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
});
