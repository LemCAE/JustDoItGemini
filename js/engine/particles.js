/**
 * AETHERIA - High Performance Particle & Ripple Engine
 * Enhanced with physical water surface waves, bubble physics, and spatial dynamics
 */

class ParticleEngine {
    constructor() {
        this.particles = [];
        this.ripples = [];
        this.shootingStars = [];
        this.glassDroplets = []; // Rain on the outer glass dome
        this.bubbles = []; // Underwater air bubbles
        this.maxParticles = 800;
    }

    add(p) {
        if (this.particles.length < this.maxParticles) {
            this.particles.push({
                x: p.x || 0,
                y: p.y || 0,
                vx: p.vx || (Math.random() * 2 - 1),
                vy: p.vy || (Math.random() * 2 - 1),
                size: p.size || 3,
                color: p.color || 'rgba(255, 255, 255, 0.8)',
                glow: p.glow || false,
                glowColor: p.glowColor || p.color,
                life: p.life || 1.0,
                maxLife: p.life || 1.0,
                decay: p.decay || (0.01 + Math.random() * 0.02),
                type: p.type || 'mote', // 'mote', 'rain', 'snow', 'petal', 'sparkle', 'note'
                rot: p.rot || Math.random() * Math.PI * 2,
                vRot: p.vRot || (Math.random() * 0.05 - 0.025),
                symbol: p.symbol || null,
                scaleX: 1.0
            });
        }
    }

    addBubble(x, y) {
        this.bubbles.push({
            x, y,
            vx: (Math.random() - 0.5) * 0.3,
            vy: -0.6 - Math.random() * 0.6,
            radius: 1.2 + Math.random() * 2.2,
            life: 1.0,
            decay: 0.018 + Math.random() * 0.01
        });
    }

    addRipple(x, y, maxRadius = 45, intensity = 1.0) {
        this.ripples.push({
            x, y,
            radius: 2,
            maxRadius,
            intensity,
            life: 1.0,
            decay: 0.022
        });
    }

    spawnShootingStar(width, height) {
        const startX = Math.random() * width * 0.8;
        const startY = Math.random() * height * 0.35;
        const length = 90 + Math.random() * 140;
        const speed = 14 + Math.random() * 8;
        const angle = Math.PI / 4 + (Math.random() * 0.2 - 0.1);

        this.shootingStars.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            length,
            life: 1.0,
            decay: 0.022,
            color: '#c2e9fb'
        });

        if (window.AudioEngine) {
            window.AudioEngine.playCelestialChime(880 + Math.random() * 440, 0.15, (startX / width) * 2 - 1);
        }
    }

    addGlassDroplet(x, y) {
        this.glassDroplets.push({
            x, y,
            radius: 2 + Math.random() * 3,
            vy: 0.2 + Math.random() * 0.6,
            life: 1.0,
            decay: 0.003 + Math.random() * 0.004
        });
    }

    burst(x, y, count = 20, color = '#ffd700', spread = 4) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (0.5 + Math.random() * 0.5) * spread;
            this.add({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.2,
                size: 2 + Math.random() * 3,
                color,
                glow: true,
                glowColor: color,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.03,
                type: 'sparkle'
            });
        }
    }

    spawnMusicNote(x, y, noteChar = '♪') {
        this.add({
            x, y,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -1.6 - Math.random() * 1.0,
            size: 16,
            color: 'rgba(230, 240, 255, 0.95)',
            glow: true,
            glowColor: '#7dd3fc',
            life: 1.0,
            decay: 0.015,
            type: 'note',
            symbol: noteChar
        });
    }

    update(dt, weather = 'clear', windStrength = 0) {
        // Ambient Weather Particle Generators
        if (weather === 'rain' && Math.random() < 0.45) {
            this.add({
                x: (Math.random() - 0.5) * 440,
                y: -240,
                vx: windStrength * 1.5 + (Math.random() - 0.5) * 0.5,
                vy: 7 + Math.random() * 3,
                size: 2.2,
                color: '#7dd3fc',
                glow: true,
                glowColor: '#38bdf8',
                life: 1.0,
                decay: 0.016,
                type: 'rain'
            });
            if (Math.random() < 0.2) {
                this.addGlassDroplet((Math.random() - 0.5) * 380, -200 + Math.random() * 100);
            }
        } else if (weather === 'snow' && Math.random() < 0.35) {
            this.add({
                x: (Math.random() - 0.5) * 440,
                y: -240,
                vx: windStrength * 0.8 + (Math.random() - 0.5) * 0.8,
                vy: 1.2 + Math.random() * 1.2,
                size: 2.5 + Math.random() * 2,
                color: '#ffffff',
                glow: true,
                glowColor: '#e0f2fe',
                life: 1.0,
                decay: 0.009,
                type: 'snow'
            });
        } else if (weather === 'blossom' && Math.random() < 0.28) {
            this.add({
                x: (Math.random() - 0.5) * 440,
                y: -230,
                vx: windStrength * 1.2 + Math.sin(Date.now() * 0.002) * 0.8,
                vy: 1.4 + Math.random() * 1.0,
                size: 3.5,
                color: 'rgba(255, 192, 203, 0.9)',
                glow: true,
                glowColor: '#f472b6',
                life: 1.0,
                decay: 0.008,
                type: 'petal',
                rot: Math.random() * Math.PI,
                vRot: 0.03 + Math.random() * 0.03
            });
        }

        // Update Regular Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx + windStrength * 0.8;
            p.y += p.vy;
            p.rot += p.vRot;
            p.life -= p.decay;

            if (p.type === 'rain') {
                p.vy += 0.25;
            } else if (p.type === 'snow') {
                p.vx += Math.sin(p.y * 0.04) * 0.3;
            } else if (p.type === 'petal') {
                p.scaleX = Math.cos(p.rot);
                p.x += Math.sin(p.rot) * 0.9;
                p.vy = 1.0 + Math.cos(p.rot) * 0.4;
            } else if (p.type === 'mote') {
                p.vx += (Math.random() - 0.5) * 0.12;
                p.vy += (Math.random() - 0.5) * 0.12;
                p.vx *= 0.98;
                p.vy *= 0.98;
            }

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update Underwater Bubbles
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const b = this.bubbles[i];
            b.x += b.vx + Math.sin(b.y * 0.1) * 0.2;
            b.y += b.vy;
            b.life -= b.decay;
            if (b.life <= 0 || b.y < 0) {
                this.bubbles.splice(i, 1);
            }
        }

        // Update Ripples
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const r = this.ripples[i];
            r.radius += 1.25;
            r.life -= r.decay;
            if (r.life <= 0 || r.radius >= r.maxRadius) {
                this.ripples.splice(i, 1);
            }
        }

        // Update Shooting Stars
        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            const s = this.shootingStars[i];
            s.x += s.vx;
            s.y += s.vy;
            s.life -= s.decay;
            if (s.life <= 0) {
                this.shootingStars.splice(i, 1);
            }
        }

        // Update Glass Droplets
        for (let i = this.glassDroplets.length - 1; i >= 0; i--) {
            const d = this.glassDroplets[i];
            d.y += d.vy;
            d.life -= d.decay;
            if (Math.random() < 0.08) {
                d.vy = 0.2 + Math.random() * 0.9;
            }
            if (d.life <= 0 || d.y > 800) {
                this.glassDroplets.splice(i, 1);
            }
        }
    }

    render(ctx) {
        ctx.save();

        // Render Shooting Stars
        for (const s of this.shootingStars) {
            const tailX = s.x - (s.vx / 10) * s.length;
            const tailY = s.y - (s.vy / 10) * s.length;
            const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            grad.addColorStop(1, `rgba(255, 255, 255, ${s.life * 0.95})`);

            ctx.strokeStyle = grad;
            ctx.lineWidth = 2.8;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(s.x, s.y);
            ctx.stroke();

            ctx.fillStyle = `rgba(255, 255, 255, ${s.life})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Render Ripples
        for (const r of this.ripples) {
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.45, 0, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(180, 230, 255, ${r.life * 0.65 * r.intensity})`;
            ctx.lineWidth = 1.8 * r.life;
            ctx.stroke();
            ctx.restore();
        }

        // Render Underwater Bubbles
        for (const b of this.bubbles) {
            ctx.save();
            ctx.strokeStyle = `rgba(224, 242, 254, ${b.life * 0.8})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = `rgba(255, 255, 255, ${b.life * 0.5})`;
            ctx.beginPath();
            ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Render Particles
        for (const p of this.particles) {
            const alpha = Math.max(0, p.life / p.maxLife);

            if (p.type === 'note' && p.symbol) {
                ctx.save();
                ctx.font = `${p.size}px sans-serif`;
                ctx.fillStyle = `rgba(220, 240, 255, ${alpha})`;
                ctx.shadowColor = p.glowColor;
                ctx.shadowBlur = 10;
                ctx.fillText(p.symbol, p.x, p.y);
                ctx.restore();
                continue;
            }

            if (p.type === 'petal') {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.scale(Math.max(0.1, Math.abs(p.scaleX || 1)), 1.0);
                ctx.fillStyle = `rgba(255, 192, 203, ${alpha * 0.9})`;
                ctx.shadowColor = '#f472b6';
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size * 1.5, p.size * 0.8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                continue;
            }

            ctx.save();
            if (p.glow) {
                ctx.shadowColor = p.glowColor;
                ctx.shadowBlur = 10;
            }
            ctx.fillStyle = p.color.includes('rgba') 
                ? p.color.replace(/[\d\.]+\)$/, `${alpha})`)
                : p.color;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (0.4 + 0.6 * alpha), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.restore();
    }

    renderGlassDroplets(ctx) {
        if (this.glassDroplets.length === 0) return;
        ctx.save();
        for (const d of this.glassDroplets) {
            const alpha = d.life * 0.7;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.65})`;
            ctx.shadowColor = 'rgba(200, 230, 255, 0.85)';
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
            ctx.fill();

            // Specular highlight
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
            ctx.beginPath();
            ctx.arc(d.x - d.radius * 0.3, d.y - d.radius * 0.3, d.radius * 0.35, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

window.ParticleEngine = ParticleEngine;
