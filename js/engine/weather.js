/**
 * AETHERIA - Weather & Celestial Lighting Engine
 * Dynamic Day-Night cycle, Aurora Borealis, sun/moon trajectories, and atmospheric weather
 */

class WeatherEngine {
    constructor() {
        this.time = 14.0; // 24-hour decimal clock (default 14:00)
        this.realTimeSync = false;
        this.timeSpeed = 0.05; // speed when auto-advancing
        this.isAutoAdvancing = false;
        this.currentWeather = 'clear'; // 'clear', 'rain', 'snow', 'blossom', 'stardust'
        this.weatherIntensity = 1.0;
        this.auroraPhase = 0;

        // Static stars in the background sky
        this.backgroundStars = [];
        this.initStarfield();
    }

    initStarfield() {
        this.backgroundStars = [];
        for (let i = 0; i < 180; i++) {
            this.backgroundStars.push({
                x: Math.random(),
                y: Math.random() * 0.7, // top 70% of sky
                radius: 0.6 + Math.random() * 1.6,
                baseAlpha: 0.3 + Math.random() * 0.7,
                twinkleSpeed: 0.02 + Math.random() * 0.04,
                twinklePhase: Math.random() * Math.PI * 2,
                color: Math.random() > 0.8 ? '#fed7aa' : (Math.random() > 0.4 ? '#bae6fd' : '#ffffff')
            });
        }
    }

    update(dt) {
        if (this.realTimeSync) {
            const now = new Date();
            this.time = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
        } else if (this.isAutoAdvancing) {
            this.time = (this.time + this.timeSpeed * dt) % 24;
        }

        this.auroraPhase += 0.015;

        // Sync Audio with time of day
        if (window.AudioEngine) {
            const timeOfDay = this.getTimeOfDay();
            window.AudioEngine.setTimeOfDayAudio(timeOfDay);
        }
    }

    getTimeOfDay() {
        if (this.time >= 5 && this.time < 8) return 'dawn';
        if (this.time >= 8 && this.time < 17) return 'day';
        if (this.time >= 17 && this.time < 20) return 'dusk';
        return 'night';
    }

    // Returns current primary ambient lighting color and intensity
    getAmbientLighting() {
        const tod = this.getTimeOfDay();
        const t = this.time;

        if (tod === 'dawn') {
            const progress = (t - 5) / 3;
            return {
                skyTop: '#1e1b4b',
                skyBottom: '#fdba74',
                islandLight: '#fed7aa',
                shadowColor: 'rgba(30, 27, 75, 0.4)',
                ambientIntensity: 0.65 + progress * 0.25,
                sunProgress: progress
            };
        } else if (tod === 'day') {
            const progress = (t - 8) / 9;
            return {
                skyTop: '#0284c7',
                skyBottom: '#e0f2fe',
                islandLight: '#ffffff',
                shadowColor: 'rgba(12, 74, 110, 0.25)',
                ambientIntensity: 0.95,
                sunProgress: progress
            };
        } else if (tod === 'dusk') {
            const progress = (t - 17) / 3;
            return {
                skyTop: '#312e81',
                skyBottom: '#f43f5e',
                islandLight: '#fbcfe8',
                shadowColor: 'rgba(49, 46, 129, 0.45)',
                ambientIntensity: 0.85 - progress * 0.35,
                sunProgress: progress
            };
        } else {
            // Night
            return {
                skyTop: '#030712',
                skyBottom: '#0f172a',
                islandLight: '#93c5fd',
                shadowColor: 'rgba(2, 6, 23, 0.65)',
                ambientIntensity: 0.45,
                sunProgress: 0
            };
        }
    }

    renderSky(ctx, width, height) {
        const light = this.getAmbientLighting();
        const tod = this.getTimeOfDay();

        // Sky Gradient
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, light.skyTop);
        grad.addColorStop(0.7, light.skyBottom);
        grad.addColorStop(1, light.skyBottom);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Render Starfield during dusk/night/dawn
        const starAlpha = tod === 'night' ? 1.0 : (tod === 'dusk' ? 0.6 : (tod === 'dawn' ? 0.3 : 0.0));
        if (starAlpha > 0.05) {
            ctx.save();
            for (const s of this.backgroundStars) {
                const twinkle = Math.sin(this.auroraPhase * 2 + s.twinklePhase) * 0.3 + 0.7;
                const alpha = s.baseAlpha * starAlpha * twinkle;
                ctx.fillStyle = s.color;
                ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
                ctx.beginPath();
                ctx.arc(s.x * width, s.y * height, s.radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // Render Aurora Borealis at night or stardust weather
        if (tod === 'night' || this.currentWeather === 'stardust') {
            this.renderAurora(ctx, width, height);
        }

        // Render Sun or Moon
        this.renderCelestialBody(ctx, width, height, tod);

        // Distant atmospheric mist/clouds
        this.renderDistantClouds(ctx, width, height, light);
    }

    renderCelestialBody(ctx, width, height, tod) {
        ctx.save();
        const cx = width * 0.5;
        const cy = height * 0.45;
        const orbitRadiusX = width * 0.38;
        const orbitRadiusY = height * 0.28;

        // Angle based on 24h: 12:00 = top (angle = -PI/2)
        const hourAngle = ((this.time - 6) / 24) * Math.PI * 2;
        const sunX = cx + Math.cos(hourAngle) * orbitRadiusX;
        const sunY = cy + Math.sin(hourAngle) * orbitRadiusY;

        // Moon is opposite to the sun
        const moonX = cx - Math.cos(hourAngle) * orbitRadiusX;
        const moonY = cy - Math.sin(hourAngle) * orbitRadiusY;

        if (tod === 'day' || tod === 'dawn' || tod === 'dusk') {
            // Sun
            if (sunY < height * 0.75) {
                // Volumetric sun flare
                const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 180);
                sunGlow.addColorStop(0, 'rgba(255, 248, 220, 0.9)');
                sunGlow.addColorStop(0.2, 'rgba(254, 215, 170, 0.45)');
                sunGlow.addColorStop(1, 'rgba(254, 215, 170, 0)');

                ctx.fillStyle = sunGlow;
                ctx.beginPath();
                ctx.arc(sunX, sunY, 180, 0, Math.PI * 2);
                ctx.fill();

                // Sun Core
                ctx.fillStyle = '#fffdf0';
                ctx.beginPath();
                ctx.arc(sunX, sunY, 22, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // Moon
            if (moonY < height * 0.75) {
                // Lunar Halo
                const moonGlow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 140);
                moonGlow.addColorStop(0, 'rgba(224, 242, 254, 0.8)');
                moonGlow.addColorStop(0.3, 'rgba(186, 230, 253, 0.25)');
                moonGlow.addColorStop(1, 'rgba(186, 230, 253, 0)');

                ctx.fillStyle = moonGlow;
                ctx.beginPath();
                ctx.arc(moonX, moonY, 140, 0, Math.PI * 2);
                ctx.fill();

                // Silver Moon Body with craters
                ctx.fillStyle = '#f8fafc';
                ctx.beginPath();
                ctx.arc(moonX, moonY, 20, 0, Math.PI * 2);
                ctx.fill();

                // Subtle lunar shading / maria
                ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
                ctx.beginPath();
                ctx.arc(moonX - 5, moonY - 3, 7, 0, Math.PI * 2);
                ctx.arc(moonX + 6, moonY + 4, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    }

    renderAurora(ctx, width, height) {
        ctx.save();
        const numRibbons = 3;
        const colors = [
            'rgba(52, 211, 153, 0.25)',  // Emerald green
            'rgba(56, 189, 248, 0.22)',  // Cyan starlight
            'rgba(192, 132, 252, 0.20)'  // Amethyst purple
        ];

        for (let r = 0; r < numRibbons; r++) {
            ctx.beginPath();
            ctx.moveTo(0, height * 0.15 + r * 30);

            for (let x = 0; x <= width; x += 30) {
                const wave1 = Math.sin(x * 0.003 + this.auroraPhase + r * 1.5) * 45;
                const wave2 = Math.cos(x * 0.007 - this.auroraPhase * 0.8) * 25;
                const y = height * 0.18 + r * 40 + wave1 + wave2;
                ctx.lineTo(x, y);
            }

            ctx.lineTo(width, 0);
            ctx.lineTo(0, 0);
            ctx.closePath();

            const grad = ctx.createLinearGradient(0, 0, 0, height * 0.4);
            grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
            grad.addColorStop(0.5, colors[r]);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = grad;
            ctx.fill();
        }
        ctx.restore();
    }

    renderDistantClouds(ctx, width, height, light) {
        ctx.save();
        const baseColor = light.islandLight;
        ctx.fillStyle = `rgba(255, 255, 255, 0.08)`;

        for (let i = 0; i < 4; i++) {
            const cx = ((i * 350 + this.auroraPhase * 8) % (width + 400)) - 200;
            const cy = height * 0.5 + Math.sin(i + this.auroraPhase * 0.2) * 30;
            ctx.beginPath();
            ctx.arc(cx, cy, 140, 0, Math.PI * 2);
            ctx.arc(cx + 80, cy - 20, 110, 0, Math.PI * 2);
            ctx.arc(cx - 70, cy - 10, 90, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    setWeather(type) {
        this.currentWeather = type;
        if (window.AudioEngine) {
            window.AudioEngine.setWeatherAudio(type, this.weatherIntensity);
        }
    }
}

window.WeatherEngine = WeatherEngine;
