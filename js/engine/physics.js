/**
 * AETHERIA - Interactive Physics Engine
 * Hanging Wind Chimes, Verlet rope springs, and water wave surface
 */

class WindChime {
    constructor(x, y, length = 60, noteFreq = 440) {
        this.originX = x;
        this.originY = y;
        this.length = length;
        this.noteFreq = noteFreq;
        this.angle = 0;
        this.angularVelocity = 0;
        this.angularAcceleration = 0;
        this.damping = 0.985;
        this.bobRadius = 5;
        this.lastStruck = 0;
    }

    update(dt, windForce) {
        // Simple pendulum equation: a = - (g / L) * sin(theta) + externalForce
        const gravity = 9.8;
        const restoringForce = -(gravity / this.length) * Math.sin(this.angle);
        this.angularAcceleration = restoringForce + windForce * 0.15;

        this.angularVelocity += this.angularAcceleration;
        this.angularVelocity *= this.damping;
        this.angle += this.angularVelocity;

        // Collision or high impulse chime sound
        if (Math.abs(this.angularVelocity) > 0.08 && Date.now() - this.lastStruck > 450) {
            this.lastStruck = Date.now();
            if (window.AudioEngine) {
                window.AudioEngine.playCelestialChime(this.noteFreq, 0.25);
            }
        }
    }

    checkInteraction(cursorX, cursorY, cursorVx, cursorVy) {
        const bobX = this.originX + Math.sin(this.angle) * this.length;
        const bobY = this.originY + Math.cos(this.angle) * this.length;
        const dx = cursorX - bobX;
        const dy = cursorY - bobY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 20) {
            this.angularVelocity += (cursorVx * 0.03) + (Math.random() - 0.5) * 0.08;
            if (Date.now() - this.lastStruck > 200) {
                this.lastStruck = Date.now();
                if (window.AudioEngine) {
                    window.AudioEngine.playCelestialChime(this.noteFreq, 0.4);
                }
            }
            return true;
        }
        return false;
    }

    render(ctx) {
        const bobX = this.originX + Math.sin(this.angle) * this.length;
        const bobY = this.originY + Math.cos(this.angle) * this.length;

        ctx.save();
        // Brass chime string
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(this.originX, this.originY);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();

        // Metallic bell tube
        ctx.save();
        ctx.translate(bobX, bobY);
        ctx.rotate(-this.angle);
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(-3, 0, 6, 24, 3);
        ctx.fill();

        // Crystal clapper at bottom
        ctx.fillStyle = '#67e8f9';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 26, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.restore();
    }
}

class ChimeSet {
    constructor(mountX, mountY) {
        this.mountX = mountX;
        this.mountY = mountY;
        // Pentatonic tuned frequencies
        const freqs = [369.99, 440.00, 493.88, 587.33, 739.99]; // F#4, A4, B4, D5, F#5
        const lengths = [55, 48, 42, 36, 30];
        this.chimes = [];

        for (let i = 0; i < 5; i++) {
            const spacing = (i - 2) * 12;
            this.chimes.push(new WindChime(mountX + spacing, mountY, lengths[i], freqs[i]));
        }
    }

    update(dt, windForce) {
        for (const c of this.chimes) {
            c.update(dt, windForce);
        }
    }

    checkInteraction(cursorX, cursorY, vx, vy) {
        for (const c of this.chimes) {
            c.checkInteraction(cursorX, cursorY, vx, vy);
        }
    }

    render(ctx) {
        ctx.save();
        // Top mounting arch bar
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.mountX - 30, this.mountY);
        ctx.lineTo(this.mountX + 30, this.mountY);
        ctx.stroke();

        for (const c of this.chimes) {
            c.render(ctx);
        }
        ctx.restore();
    }
}

window.WindChime = WindChime;
window.ChimeSet = ChimeSet;
