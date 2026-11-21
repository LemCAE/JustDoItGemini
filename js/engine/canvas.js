/**
 * AETHERIA - Master Canvas & Parallax Scene Renderer
 * With Floating Botanical HUD, Dynamic Tool Reticles, and Spatial Audio Integration
 */

class SceneRenderer {
    constructor(canvas, weatherEngine, particleEngine, ecosystem, fauna) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.weather = weatherEngine;
        this.particles = particleEngine;
        this.ecosystem = ecosystem;
        this.fauna = fauna;

        this.camera = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            zoom: 1.0,
            tiltX: 0,
            tiltY: 0
        };

        this.terrarium = {
            width: 440,
            height: 540,
            radiusX: 220,
            radiusY: 270
        };

        this.pond = {
            cx: 15,
            cy: 18,
            rx: 68,
            ry: 34
        };

        this.chimes = new ChimeSet(-105, -70);

        this.currentTool = 'pipette';
        this.isPointerDown = false;
        this.pointerWorldX = 0;
        this.pointerWorldY = 0;
        this.lastPointerWorldX = 0;
        this.lastPointerWorldY = 0;
        this.pointerScreenX = 0;
        this.pointerScreenY = 0;

        this.hoveredPlant = null;
        this.windStrength = 0;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.ctx.scale(dpr, dpr);
    }

    screenToWorld(screenX, screenY) {
        const cx = this.width * 0.5 + this.camera.x;
        const cy = this.height * 0.5 + this.camera.y;
        return {
            x: (screenX - cx) / this.camera.zoom,
            y: (screenY - cy) / this.camera.zoom
        };
    }

    update(dt) {
        this.camera.x += (this.camera.targetX - this.camera.x) * 0.08;
        this.camera.y += (this.camera.targetY - this.camera.y) * 0.08;

        this.updateToolInteractions(dt);
        this.chimes.update(dt, this.windStrength);

        if (this.weather.currentWeather === 'rain') {
            this.windStrength = 0.2 + Math.sin(Date.now() * 0.002) * 0.15;
        } else {
            this.windStrength *= 0.94;
        }

        // Check hovered plant
        this.checkHoveredPlant();
    }

    checkHoveredPlant() {
        const wx = this.pointerWorldX;
        const wy = this.pointerWorldY;
        this.hoveredPlant = null;

        for (const p of this.ecosystem.plants) {
            const plantTopY = p.y - p.species.maxHeight * (0.3 + 0.7 * p.growth);
            const dist = Math.hypot(p.x - wx, (plantTopY + p.y) * 0.5 - wy);
            if (dist < 28) {
                this.hoveredPlant = p;
                break;
            }
        }
    }

    updateToolInteractions(dt) {
        if (!this.isPointerDown) return;

        const wx = this.pointerWorldX;
        const wy = this.pointerWorldY;
        const vx = wx - this.lastPointerWorldX;
        const vy = wy - this.lastPointerWorldY;
        const pan = Math.max(-1, Math.min(1, wx / 200)); // Stereo Panning calculation!

        if (this.currentTool === 'pipette') {
            if (Math.random() < 0.6) {
                this.particles.add({
                    x: wx + (Math.random() - 0.5) * 12,
                    y: wy,
                    vx: (Math.random() - 0.5) * 0.6,
                    vy: 3.5 + Math.random() * 2.0,
                    size: 3,
                    color: '#7dd3fc',
                    glow: true,
                    glowColor: '#38bdf8',
                    life: 1.0,
                    decay: 0.02,
                    type: 'rain'
                });
            }

            const ex = (wx - this.pond.cx) / this.pond.rx;
            const ey = (wy - this.pond.cy) / this.pond.ry;
            if (ex * ex + ey * ey < 1.0) {
                if (Math.random() < 0.25) {
                    this.particles.addRipple(wx, wy, 42, 0.9);
                    if (window.AudioEngine) window.AudioEngine.playWaterDrip(undefined, undefined, pan);
                    
                    for (const k of this.fauna.koi) {
                        const dist = Math.hypot(k.x - wx, k.y - wy);
                        if (dist < 35) k.spook(wx, wy);
                    }
                }
            }

            for (const p of this.ecosystem.plants) {
                const dist = Math.hypot(p.x - wx, p.y - wy);
                if (dist < 40) {
                    p.water(0.015);
                }
            }
        } else if (this.currentTool === 'sol') {
            if (Math.random() < 0.4) {
                this.particles.add({
                    x: wx + (Math.random() - 0.5) * 30,
                    y: wy + (Math.random() - 0.5) * 30,
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: (Math.random() - 0.5) * 1.5,
                    size: 2.5,
                    color: '#fef08a',
                    glow: true,
                    glowColor: '#eab308',
                    life: 1.0,
                    decay: 0.03,
                    type: 'sparkle'
                });
            }

            for (const p of this.ecosystem.plants) {
                const dist = Math.hypot(p.x - wx, p.y - wy);
                if (dist < 45) {
                    p.growth = Math.min(1.0, p.growth + 0.003);
                    p.bloomProgress = Math.min(1.0, p.bloomProgress + 0.005);
                }
            }
        } else if (this.currentTool === 'wind') {
            this.windStrength = Math.max(-1.5, Math.min(1.5, vx * 0.2));
            this.chimes.checkInteraction(wx, wy, vx, vy);

            if (Math.random() < 0.5) {
                this.particles.add({
                    x: wx,
                    y: wy,
                    vx: vx * 0.8 + (Math.random() - 0.5) * 2,
                    vy: vy * 0.8 + (Math.random() - 0.5) * 2,
                    size: 3,
                    color: 'rgba(255, 255, 255, 0.7)',
                    glow: true,
                    glowColor: '#bae6fd',
                    life: 1.0,
                    decay: 0.035,
                    type: 'mote'
                });
            }
        } else if (this.currentTool === 'scythe') {
            const harvested = this.ecosystem.harvestAt(wx, wy, 35);
            if (harvested > 0) {
                this.particles.burst(wx, wy, 18, '#fde047', 4.5);
            }
        }

        this.lastPointerWorldX = wx;
        this.lastPointerWorldY = wy;
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // 1. Sky & Celestial Background
        this.weather.renderSky(ctx, this.width, this.height);

        // 2. Distant Floating Islands
        this.renderDistantAtmosphere(ctx);

        // 3. Central Terrarium World Container
        ctx.save();
        const originX = this.width * 0.5 + this.camera.x;
        const originY = this.height * 0.5 + this.camera.y;
        ctx.translate(originX, originY);
        ctx.scale(this.camera.zoom, this.camera.zoom);

        // Terrarium Back Glass
        this.renderTerrariumBackGlass(ctx);

        // Floating Island Bedrock & Runes
        this.renderIslandBedrock(ctx);

        // Hanging Chimes
        this.chimes.render(ctx);

        // Water Pond Surface & Koi
        this.renderPondWater(ctx);

        // Living Flora
        const tod = this.weather.getTimeOfDay();
        this.ecosystem.render(ctx, tod);

        // Fauna
        this.fauna.render(ctx);

        // Front Glass with Specular Highlights & Geodesics
        this.renderTerrariumFrontGlass(ctx);

        // Active Tool Reticle & Overlays
        this.renderToolOverlay(ctx);

        // World Particles
        this.particles.render(ctx);

        // Glass Droplets
        this.particles.renderGlassDroplets(ctx);

        // Floating Botanical HUD
        if (this.hoveredPlant) {
            this.renderBotanicalHUD(ctx, this.hoveredPlant);
        }

        ctx.restore();
    }

    renderDistantAtmosphere(ctx) {
        ctx.save();
        const light = this.weather.getAmbientLighting();
        const baseY = this.height * 0.65;

        ctx.fillStyle = light.shadowColor;
        ctx.beginPath();
        ctx.moveTo(this.width * 0.08, baseY);
        ctx.lineTo(this.width * 0.16, baseY - 60);
        ctx.lineTo(this.width * 0.24, baseY);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.width * 0.76, baseY + 20);
        ctx.lineTo(this.width * 0.86, baseY - 80);
        ctx.lineTo(this.width * 0.94, baseY + 20);
        ctx.fill();

        ctx.restore();
    }

    renderTerrariumBackGlass(ctx) {
        ctx.save();
        const rX = this.terrarium.radiusX;
        const rY = this.terrarium.radiusY;

        const glassGrad = ctx.createRadialGradient(0, -20, 40, 0, 0, rY);
        glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
        glassGrad.addColorStop(0.7, 'rgba(224, 242, 254, 0.08)');
        glassGrad.addColorStop(1, 'rgba(186, 230, 253, 0.18)');

        ctx.fillStyle = glassGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, rX, rY, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.ellipse(0, 0, rX * 0.6, rY, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(0, 0, rX, rY * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    renderIslandBedrock(ctx) {
        ctx.save();
        const floatY = Math.sin(Date.now() * 0.0015) * 5;
        ctx.translate(0, floatY);

        const rockGrad = ctx.createLinearGradient(0, 30, 0, 160);
        rockGrad.addColorStop(0, '#334155');
        rockGrad.addColorStop(0.5, '#1e293b');
        rockGrad.addColorStop(1, '#0f172a');

        ctx.fillStyle = rockGrad;
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(-160, 25);
        ctx.lineTo(-110, 80);
        ctx.lineTo(-40, 140);
        ctx.lineTo(0, 175);
        ctx.lineTo(50, 130);
        ctx.lineTo(120, 75);
        ctx.lineTo(160, 25);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Glowing Embedded Runic Crystals
        const crystalPulse = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(56, 189, 248, ${crystalPulse * 0.9})`;
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 15;

        const runes = [
            { x: -50, y: 70 },
            { x: 30, y: 95 },
            { x: -10, y: 125 }
        ];
        for (const r of runes) {
            ctx.beginPath();
            ctx.moveTo(r.x, r.y - 7);
            ctx.lineTo(r.x + 5, r.y);
            ctx.lineTo(r.x, r.y + 7);
            ctx.lineTo(r.x - 5, r.y);
            ctx.closePath();
            ctx.fill();
        }

        // Roots
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(-90, 45);
        ctx.quadraticCurveTo(-95, 95, -85, 115);
        ctx.moveTo(70, 40);
        ctx.quadraticCurveTo(78, 85, 68, 120);
        ctx.stroke();

        // Top Lush Soil Plate
        const grassGrad = ctx.createRadialGradient(0, 0, 30, 0, 10, 165);
        if (this.weather.getTimeOfDay() === 'night') {
            grassGrad.addColorStop(0, '#064e3b');
            grassGrad.addColorStop(0.7, '#0f172a');
            grassGrad.addColorStop(1, '#020617');
        } else {
            grassGrad.addColorStop(0, '#10b981');
            grassGrad.addColorStop(0.6, '#059669');
            grassGrad.addColorStop(1, '#047857');
        }

        ctx.fillStyle = grassGrad;
        ctx.beginPath();
        ctx.ellipse(0, 15, 160, 45, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stone Arch for Guardian Spirit
        ctx.fillStyle = '#475569';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(110, -35, 16, 45, 3);
        ctx.roundRect(95, -42, 46, 10, 3);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    renderPondWater(ctx) {
        ctx.save();
        const p = this.pond;
        const floatY = Math.sin(Date.now() * 0.0015) * 5;
        ctx.translate(0, floatY);

        ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(p.cx, p.cy, p.rx + 2, p.ry + 2, 0, 0, Math.PI * 2);
        ctx.stroke();

        const waterGrad = ctx.createRadialGradient(p.cx, p.cy, 5, p.cx, p.cy, p.rx);
        waterGrad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
        waterGrad.addColorStop(0.6, 'rgba(14, 116, 144, 0.9)');
        waterGrad.addColorStop(1, 'rgba(8, 51, 68, 0.95)');

        ctx.fillStyle = waterGrad;
        ctx.beginPath();
        ctx.ellipse(p.cx, p.cy, p.rx, p.ry, 0, 0, Math.PI * 2);
        ctx.fill();

        const wavePhase = Date.now() * 0.0025;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(p.cx - 15 + Math.sin(wavePhase) * 6, p.cy - 6, 18, 0.3, Math.PI * 0.9);
        ctx.stroke();

        ctx.restore();
    }

    renderTerrariumFrontGlass(ctx) {
        ctx.save();
        const rX = this.terrarium.radiusX;
        const rY = this.terrarium.radiusY;

        // Front Glass Specular Reflection Curves
        const shineGrad = ctx.createLinearGradient(-rX, -rY, rX * 0.8, rY * 0.8);
        shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        shineGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.08)');
        shineGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        shineGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0.05)');
        shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0.25)');

        ctx.fillStyle = shineGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, rX, rY, 0, 0, Math.PI * 2);
        ctx.fill();

        // Snow frost vignette on glass edges if snow weather
        if (this.weather.currentWeather === 'snow') {
            const frostGrad = ctx.createRadialGradient(0, 0, rX * 0.7, 0, 0, rX);
            frostGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            frostGrad.addColorStop(1, 'rgba(224, 242, 254, 0.28)');
            ctx.fillStyle = frostGrad;
            ctx.beginPath();
            ctx.ellipse(0, 0, rX, rY, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Outer Brass/Gold Framing Rim
        const rimGrad = ctx.createLinearGradient(-rX, -rY, rX, rY);
        rimGrad.addColorStop(0, '#fef08a');
        rimGrad.addColorStop(0.4, '#d97706');
        rimGrad.addColorStop(0.7, '#b45309');
        rimGrad.addColorStop(1, '#fef08a');

        ctx.strokeStyle = rimGrad;
        ctx.lineWidth = 4;
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(0, 0, rX, rY, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Top Brass Finial
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, -rY - 6, 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();

        ctx.restore();
    }

    renderToolOverlay(ctx) {
        const wx = this.pointerWorldX;
        const wy = this.pointerWorldY;

        ctx.save();
        // Dynamic Cursor Reticles
        if (this.currentTool === 'pipette') {
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(wx, wy, 12, 0, Math.PI * 2);
            ctx.stroke();
            // Tiny drop inside
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(wx, wy, 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.currentTool === 'sol') {
            const beam = ctx.createRadialGradient(wx, wy, 5, wx, wy, 80);
            beam.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
            beam.addColorStop(0.4, 'rgba(253, 224, 71, 0.25)');
            beam.addColorStop(1, 'rgba(253, 224, 71, 0)');

            ctx.fillStyle = beam;
            ctx.beginPath();
            ctx.arc(wx, wy, 80, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(wx, wy, 16, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.currentTool === 'wind') {
            ctx.strokeStyle = 'rgba(224, 242, 254, 0.6)';
            ctx.lineWidth = 1.5;
            const swirlPhase = Date.now() * 0.005;
            ctx.beginPath();
            ctx.arc(wx, wy, 14, swirlPhase, swirlPhase + Math.PI * 1.2);
            ctx.stroke();
        } else if (this.currentTool === 'bell') {
            ctx.strokeStyle = 'rgba(167, 243, 208, 0.7)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(wx, wy, 20, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.currentTool === 'scythe') {
            ctx.strokeStyle = '#fde047';
            ctx.shadowColor = '#eab308';
            ctx.shadowBlur = 8;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(wx, wy, 18, -0.6, Math.PI * 0.6);
            ctx.stroke();
        }
        ctx.restore();
    }

    renderBotanicalHUD(ctx, plant) {
        ctx.save();
        const plantHeight = plant.species.maxHeight * (0.3 + 0.7 * plant.growth);
        const hudX = plant.x;
        const hudY = plant.y - plantHeight - 34;

        const stageNames = ['种子', '生根', '展叶', '孕蕾', '盛放'];
        const stageName = stageNames[plant.stage] || '盛放';

        ctx.font = '11px "Segoe UI", system-ui, sans-serif';
        const titleText = `${plant.species.name} · ${stageName}`;
        const textWidth = ctx.measureText(titleText).width;
        const boxW = Math.max(110, textWidth + 18);
        const boxH = 44;
        const boxX = hudX - boxW / 2;
        const boxY = hudY;

        // Background Box
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = plant.species.glowColor;
        ctx.lineWidth = 1;
        ctx.shadowColor = plant.species.glowColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 6);
        ctx.fill();
        ctx.stroke();

        // Title text
        ctx.fillStyle = '#f8fafc';
        ctx.shadowBlur = 0;
        ctx.fillText(titleText, boxX + 9, boxY + 16);

        // Hydration Bar
        const barX = boxX + 9;
        const barY = boxY + 24;
        const barW = boxW - 18;
        const barH = 5;

        // Track
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, 2.5);
        ctx.fill();

        // Fill (Hydration)
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW * Math.max(0.05, plant.hydration), barH, 2.5);
        ctx.fill();

        // Little Label
        ctx.font = '9px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`水份: ${Math.round(plant.hydration * 100)}%`, barX, barY + 15);

        ctx.restore();
    }
}

window.SceneRenderer = SceneRenderer;
