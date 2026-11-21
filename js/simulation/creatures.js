/**
 * AETHERIA - Living Fauna & Spirit Creature Simulation
 * Multi-joint inverse kinematics Koi, fluttering moths, guardian spirit, and majestic sky ray
 */

class SpiritKoi {
    constructor(x, y, pondBounds, variant = 0) {
        this.x = x;
        this.y = y;
        this.vx = Math.random() * 0.8 - 0.4;
        this.vy = Math.random() * 0.4 - 0.2;
        this.angle = Math.atan2(this.vy, this.vx);
        this.speed = 0.8;
        this.targetSpeed = 0.8;
        this.pond = pondBounds;
        this.variant = variant; // 0: Crimson Kohaku, 1: Azure Starlight, 2: Solar Gold

        if (variant === 0) {
            this.color = '#f43f5e';
            this.secondaryColor = '#ffffff';
            this.glow = '#fda4af';
        } else if (variant === 1) {
            this.color = '#38bdf8';
            this.secondaryColor = '#c084fc';
            this.glow = '#7dd3fc';
        } else {
            this.color = '#f59e0b';
            this.secondaryColor = '#fef08a';
            this.glow = '#fbbf24';
        }

        this.numSegments = 6;
        this.segmentLengths = [9, 8, 7, 6, 5, 4];
        this.segments = [];
        for (let i = 0; i < this.numSegments; i++) {
            this.segments.push({ x: this.x - i * 8, y: this.y, angle: 0 });
        }
        this.finPhase = Math.random() * Math.PI * 2;
        this.target = null;
    }

    update(dt, particles = null) {
        this.finPhase += 0.12 * (this.speed + 0.5);

        // Steering behavior
        if (this.target) {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 15) {
                this.target = null;
                if (particles) particles.addBubble(this.x, this.y);
            } else {
                const desiredAngle = Math.atan2(dy, dx);
                let diff = desiredAngle - this.angle;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;
                this.angle += diff * 0.06;
                this.targetSpeed = 1.4;
            }
        } else {
            this.angle += (Math.sin(this.finPhase * 0.4) * 0.03) + (Math.random() - 0.5) * 0.05;
            this.targetSpeed = 0.75 + Math.sin(this.finPhase * 0.2) * 0.3;
        }

        // Elliptical boundaries
        const ex = (this.x - this.pond.cx) / this.pond.rx;
        const ey = (this.y - this.pond.cy) / this.pond.ry;
        const distSq = ex * ex + ey * ey;
        if (distSq > 0.75) {
            const centerAngle = Math.atan2(this.pond.cy - this.y, this.pond.cx - this.x);
            let diff = centerAngle - this.angle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            this.angle += diff * 0.14;
            this.targetSpeed = 0.95;
        }

        this.speed += (this.targetSpeed - this.speed) * 0.08;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed * 0.5;

        // Kinematics
        this.segments[0].x = this.x;
        this.segments[0].y = this.y;
        this.segments[0].angle = this.angle;

        for (let i = 1; i < this.numSegments; i++) {
            const prev = this.segments[i - 1];
            const curr = this.segments[i];
            const dx = curr.x - prev.x;
            const dy = curr.y - prev.y;
            const segDist = this.segmentLengths[i - 1];
            const currentDist = Math.sqrt(dx * dx + dy * dy);

            if (currentDist > 0.001) {
                curr.x = prev.x + (dx / currentDist) * segDist;
                curr.y = prev.y + (dy / currentDist) * segDist;
            }
            curr.angle = Math.atan2(prev.y - curr.y, prev.x - curr.x);
        }

        // Random bubbles
        if (particles && Math.random() < 0.004) {
            particles.addBubble(this.x, this.y);
        }
    }

    spook(fromX, fromY) {
        const awayAngle = Math.atan2(this.y - fromY, this.x - fromX);
        this.angle = awayAngle;
        this.targetSpeed = 2.8;
    }

    render(ctx) {
        ctx.save();

        // Water depth shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
        ctx.beginPath();
        ctx.ellipse(this.x + 3, this.y + 6, 12, 6, this.angle, 0, Math.PI * 2);
        ctx.fill();

        // Render Tail Fin
        const lastSeg = this.segments[this.segments.length - 1];
        const tailAngle = lastSeg.angle + Math.sin(this.finPhase) * 0.45;
        ctx.save();
        ctx.translate(lastSeg.x, lastSeg.y);
        ctx.rotate(tailAngle);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.glow;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-12, -7);
        ctx.quadraticCurveTo(-7, 0, -12, 7);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Render Body Segments
        for (let i = this.segments.length - 1; i >= 0; i--) {
            const seg = this.segments[i];
            const radius = (this.numSegments - i) * 1.3 + 2.5;

            ctx.save();
            ctx.translate(seg.x, seg.y);
            ctx.rotate(seg.angle);

            // Pectoral Fins (segment 1)
            if (i === 1) {
                const finFlap = Math.sin(this.finPhase) * 0.35;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.beginPath();
                ctx.ellipse(-2, -8, 6, 2.5, -0.4 + finFlap, 0, Math.PI * 2);
                ctx.ellipse(-2, 8, 6, 2.5, 0.4 - finFlap, 0, Math.PI * 2);
                ctx.fill();
            }

            // Body Segment
            ctx.fillStyle = i % 2 === 0 ? this.color : this.secondaryColor;
            ctx.shadowColor = this.glow;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.ellipse(0, 0, radius, radius * 0.7, 0, 0, Math.PI * 2);
            ctx.fill();

            // Head details
            if (i === 0) {
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.arc(3, -3, 1.2, 0, Math.PI * 2);
                ctx.arc(3, 3, 1.2, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }

        ctx.restore();
    }
}

class LuminousButterfly {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.wingPhase = Math.random() * Math.PI * 2;
        this.color = Math.random() > 0.5 ? '#a78bfa' : '#38bdf8';
        this.targetX = x;
        this.targetY = y;
    }

    update(dt) {
        this.wingPhase += 0.22;
        if (Math.random() < 0.03) {
            this.targetX += (Math.random() - 0.5) * 80;
            this.targetY += (Math.random() - 0.5) * 50;
        }
        this.x += (this.targetX - this.x) * 0.04;
        this.y += (this.targetY - this.y) * 0.04 + Math.sin(this.wingPhase * 0.5) * 0.8;
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        const flap = Math.cos(this.wingPhase);
        const wingScaleX = Math.abs(flap);

        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.ellipse(-6 * wingScaleX, -2, 6 * wingScaleX, 5, -0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(6 * wingScaleX, -2, 6 * wingScaleX, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, 0, 1.2, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

class GuardianSpirit {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.blinkTimer = 0;
        this.isBlinking = false;
        this.headTilt = 0;
        this.targetTilt = 0;
        this.breathPhase = 0;
        this.dialogue = null;
        this.dialogueTimer = 0;

        this.wisdomQuotes = [
            '「愿星穹的光芒，照亮你明日的每一步旅途。」',
            '「听，风掠过悬岛的声响，是宇宙在轻柔地呼吸。」',
            '「世间最美好的造物，往往诞生于安静专注的黎明。」',
            '「每一颗种子在泥土里的等待，都是在积蓄盛开的奇迹。」',
            '「时光如流光溪水，驻足片刻，也是对生命的敬礼。」',
            '「如果你感到疲惫，请在这里放下纷扰，聆听风铃的低吟。」',
            '「星辰永不熄灭，它只是在白昼的光芒中悄然守护。」'
        ];
    }

    update(dt, mouseX, mouseY) {
        this.breathPhase += 0.04;
        this.blinkTimer += dt;
        if (this.blinkTimer > 4.0) {
            this.isBlinking = true;
            if (this.blinkTimer > 4.2) {
                this.isBlinking = false;
                this.blinkTimer = 0;
            }
        }

        const dx = mouseX - this.x;
        this.targetTilt = Math.max(-0.25, Math.min(0.25, dx * 0.0015));
        this.headTilt += (this.targetTilt - this.headTilt) * 0.1;

        if (this.dialogueTimer > 0) {
            this.dialogueTimer -= dt;
            if (this.dialogueTimer <= 0) this.dialogue = null;
        }
    }

    interact() {
        this.dialogue = this.wisdomQuotes[Math.floor(Math.random() * this.wisdomQuotes.length)];
        this.dialogueTimer = 6.0;

        if (window.AudioEngine) {
            window.AudioEngine.playCelestialChime(587.33, 0.4);
            setTimeout(() => {
                window.AudioEngine.playCelestialChime(880.00, 0.3);
            }, 140);
        }
    }

    render(ctx) {
        ctx.save();
        const breathY = Math.sin(this.breathPhase) * 2;
        ctx.translate(this.x, this.y + breathY);

        // Stone perch
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.ellipse(0, 16, 18, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Soft aura
        const aura = ctx.createRadialGradient(0, 0, 5, 0, 0, 26);
        aura.addColorStop(0, 'rgba(186, 230, 253, 0.6)');
        aura.addColorStop(1, 'rgba(186, 230, 253, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = '#f8fafc';
        ctx.shadowColor = '#7dd3fc';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.ellipse(0, 4, 13, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Starlight Horns
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(-7, -8);
        ctx.lineTo(-12, -18);
        ctx.lineTo(-4, -10);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(7, -8);
        ctx.lineTo(12, -18);
        ctx.lineTo(4, -10);
        ctx.fill();

        // Head
        ctx.save();
        ctx.rotate(this.headTilt);

        if (this.isBlinking) {
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(-4, 2, 3, 0, Math.PI);
            ctx.arc(4, 2, 3, 0, Math.PI);
            ctx.stroke();
        } else {
            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.arc(-4, 1, 3.2, 0, Math.PI * 2);
            ctx.arc(4, 1, 3.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-3.2, 0, 1.2, 0, Math.PI * 2);
            ctx.arc(4.8, 0, 1.2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.lineTo(-2, 6);
        ctx.lineTo(2, 6);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        if (this.dialogue) {
            this.renderDialogueBubble(ctx);
        }

        ctx.restore();
    }

    renderDialogueBubble(ctx) {
        ctx.save();
        ctx.font = '13px "Segoe UI", system-ui, sans-serif';
        const textWidth = ctx.measureText(this.dialogue).width;
        const padX = 14;
        const bw = textWidth + padX * 2;
        const bh = 32;
        const bx = -bw / 2;
        const by = -46;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = 'rgba(125, 211, 252, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 8);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-5, by + bh);
        ctx.lineTo(0, by + bh + 6);
        ctx.lineTo(5, by + bh);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f0f9ff';
        ctx.shadowBlur = 0;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.dialogue, 0, by + bh / 2);

        ctx.restore();
    }
}

class SkyRay {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = -300;
        this.y = 120 + Math.random() * 80;
        this.speed = 0.45;
        this.scale = 0.75 + Math.random() * 0.35;
        this.finPhase = 0;
        this.active = false;
        this.cooldown = 15;
    }

    update(dt) {
        if (!this.active) {
            this.cooldown -= dt;
            if (this.cooldown <= 0) {
                this.active = true;
                this.x = -250;
            }
            return;
        }

        this.finPhase += 0.035;
        this.x += this.speed;
        this.y += Math.sin(this.finPhase * 0.5) * 0.3;

        if (this.x > 1400) {
            this.reset();
        }
    }

    render(ctx) {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale * 0.5);

        const wingWave = Math.sin(this.finPhase) * 18;

        ctx.fillStyle = 'rgba(186, 230, 253, 0.22)';
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.45)';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 16;

        ctx.beginPath();
        ctx.moveTo(0, -35);
        ctx.quadraticCurveTo(55, wingWave, 70, 0);
        ctx.quadraticCurveTo(35, 30, 0, 45);
        ctx.quadraticCurveTo(-35, 30, -70, 0);
        ctx.quadraticCurveTo(-55, wingWave, 0, -35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, 45);
        ctx.quadraticCurveTo(Math.sin(this.finPhase) * 15, 80, 0, 130);
        ctx.stroke();

        ctx.restore();
    }
}

class FaunaManager {
    constructor(pondBounds) {
        this.pond = pondBounds;
        this.koi = [
            new SpiritKoi(pondBounds.cx - 15, pondBounds.cy, pondBounds, 0),
            new SpiritKoi(pondBounds.cx + 20, pondBounds.cy + 10, pondBounds, 1),
            new SpiritKoi(pondBounds.cx, pondBounds.cy - 10, pondBounds, 2)
        ];
        this.butterflies = [
            new LuminousButterfly(-60, -30),
            new LuminousButterfly(50, -40),
            new LuminousButterfly(0, -50)
        ];
        this.spirit = new GuardianSpirit(120, -5);
        this.skyRay = new SkyRay();
    }

    update(dt, mouseX, mouseY, particles = null) {
        for (const k of this.koi) k.update(dt, particles);
        for (const b of this.butterflies) b.update(dt);
        this.spirit.update(dt, mouseX, mouseY);
        this.skyRay.update(dt);
    }

    render(ctx) {
        this.skyRay.render(ctx);
        for (const k of this.koi) k.render(ctx);
        this.spirit.render(ctx);
        for (const b of this.butterflies) b.render(ctx);
    }
}

window.FaunaManager = FaunaManager;
