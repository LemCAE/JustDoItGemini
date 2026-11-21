/**
 * AETHERIA - Botanical & Ecosystem Simulation Engine
 * Procedural L-systems, organic plant growth, circadian flowering, botanical genetics, and cosmic blessings
 */

class Plant {
    constructor(speciesId, x, y, isWater = false) {
        this.id = 'plant_' + Math.random().toString(36).substr(2, 9);
        this.species = Plant.SPECIES[speciesId] || Plant.SPECIES['starlight_sprout'];
        this.x = x;
        this.y = y;
        this.isWater = isWater;
        this.stage = 1; // 1: Seed/Sprout, 2: Growing, 3: Mature, 4: Blooming
        this.growth = 0.3; // 0.0 to 1.0
        this.hydration = 0.8;
        this.health = 1.0;
        this.bloomProgress = 0.0;
        this.swayAngle = 0;
        this.swayVelocity = 0;
        this.stardustHarvestable = 0;
        this.seedRNG = Math.random() * 1000;
        this.branches = this.generateBranchStructure();
    }

    static SPECIES = {
        'starlight_sprout': {
            id: 'starlight_sprout',
            name: '星辉幼蕨',
            latin: 'Filix Stellaris',
            cost: 0,
            color: '#38bdf8',
            glowColor: '#0284c7',
            maxHeight: 45,
            waterPlant: false,
            desc: '在星光中孕育的微光蕨类，会持续释放悬浮的荧光孢子。'
        },
        'moon_lotus': {
            id: 'moon_lotus',
            name: '月影幽莲',
            latin: 'Nelumbo Lunaris',
            cost: 0,
            color: '#e0e7ff',
            glowColor: '#818cf8',
            maxHeight: 28,
            waterPlant: true,
            desc: '依水而生的月神睡莲。白日含苞待放，唯在星月交辉时舒展幽光花瓣。'
        },
        'whispering_willow': {
            id: 'whispering_willow',
            name: '金芒垂柳',
            latin: 'Salix Aurum',
            cost: 8,
            color: '#fde047',
            glowColor: '#eab308',
            maxHeight: 65,
            waterPlant: false,
            desc: '古老的流光树，修长的金色枝条随风摇曳，清风拂过时发出如风铃般的共鸣。'
        },
        'chrono_orchid': {
            id: 'chrono_orchid',
            name: '时轮彩兰',
            latin: 'Orchis Temporis',
            cost: 12,
            color: '#f472b6',
            glowColor: '#ec4899',
            maxHeight: 38,
            waterPlant: false,
            desc: '感应时空潮汐的奇迹兰花，花瓣会随晨曦、午阳、暮色与长夜变换色彩。'
        },
        'crystal_bonsai': {
            id: 'crystal_bonsai',
            name: '晶棱微木',
            latin: 'Bonsai Crystallum',
            cost: 15,
            color: '#a7f3d0',
            glowColor: '#10b981',
            maxHeight: 52,
            waterPlant: false,
            desc: '由星尘矿石结晶化而成的盆景，枝杈呈几何棱面折射，晶莹剔透。'
        },
        'prism_blossom': {
            id: 'prism_blossom',
            name: '虹彩棱花',
            latin: 'Flos Iris',
            cost: 20,
            color: '#fca5a5',
            glowColor: '#f43f5e',
            maxHeight: 34,
            waterPlant: false,
            desc: '沐浴晨露后绽开的多重棱光花，能将光束分解成绚丽的彩虹微粒。'
        }
    };

    generateBranchStructure() {
        const branches = [];
        const count = 3 + Math.floor((this.seedRNG % 3));
        for (let i = 0; i < count; i++) {
            const angle = -Math.PI / 2 + ((i - (count - 1) / 2) * 0.45) + ((this.seedRNG * (i + 1)) % 0.2 - 0.1);
            const length = 0.5 + 0.5 * ((this.seedRNG * (i + 3)) % 1);
            branches.push({ angle, length });
        }
        return branches;
    }

    update(dt, weather, timeOfDay, windStrength, blessings = {}) {
        // Hydration consumption (slowed if Chronos blessing active)
        const drainMult = blessings.chronos ? 0.4 : 1.0;
        this.hydration = Math.max(0, this.hydration - dt * 0.003 * drainMult);

        // Natural growth
        if (this.hydration > 0.1) {
            const growthRate = (weather === 'rain' ? 0.04 : 0.015) * dt;
            this.growth = Math.min(1.0, this.growth + growthRate);

            if (this.growth > 0.25) this.stage = 2;
            if (this.growth > 0.65) this.stage = 3;
            if (this.growth >= 0.95) {
                this.stage = 4;
            }
        }

        // Blooming condition
        if (this.stage === 4) {
            if (this.species.id === 'moon_lotus') {
                const isNight = timeOfDay === 'night' || timeOfDay === 'dusk';
                this.bloomProgress = Math.min(1.0, Math.max(0.1, this.bloomProgress + (isNight ? 0.04 : -0.04)));
            } else {
                this.bloomProgress = Math.min(1.0, this.bloomProgress + 0.02);
            }

            if (this.bloomProgress > 0.8 && Math.random() < 0.006) {
                this.stardustHarvestable = Math.min(3, this.stardustHarvestable + 1);
            }
        }

        // Wind spring physics
        const targetAngle = windStrength * 0.35;
        const springForce = (targetAngle - this.swayAngle) * 0.12;
        this.swayVelocity += springForce;
        this.swayVelocity *= 0.88;
        this.swayAngle += this.swayVelocity;
    }

    water(amount = 0.35) {
        const wasLow = this.hydration < 0.3;
        this.hydration = Math.min(1.0, this.hydration + amount);
        this.growth = Math.min(1.0, this.growth + 0.06);

        if (this.growth >= 0.95 && this.stage < 4) {
            this.stage = 4;
            if (window.AudioEngine) window.AudioEngine.playBloomArpeggio();
        }

        if (wasLow && window.AudioEngine) {
            window.AudioEngine.playWaterDrip();
        }
    }

    getCurrentColor(timeOfDay) {
        if (this.species.id === 'chrono_orchid') {
            if (timeOfDay === 'dawn') return '#fb7185';
            if (timeOfDay === 'day') return '#38bdf8';
            if (timeOfDay === 'dusk') return '#f59e0b';
            return '#c084fc';
        }
        return this.species.color;
    }

    render(ctx, timeOfDay = 'day') {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.swayAngle);

        const currentScale = 0.3 + 0.7 * this.growth;
        const color = this.getCurrentColor(timeOfDay);

        if (this.species.waterPlant) {
            this.renderLotus(ctx, currentScale, color);
        } else if (this.species.id === 'whispering_willow') {
            this.renderWillow(ctx, currentScale, color);
        } else if (this.species.id === 'crystal_bonsai') {
            this.renderCrystalBonsai(ctx, currentScale, color);
        } else {
            this.renderStandardFlora(ctx, currentScale, color);
        }

        if (this.stardustHarvestable > 0) {
            this.renderHarvestableShards(ctx, currentScale);
        }

        ctx.restore();
    }

    renderStandardFlora(ctx, scale, color) {
        const height = this.species.maxHeight * scale;

        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = Math.max(1.8, 3.5 * scale);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(5 * scale, -height * 0.5, 0, -height);
        ctx.stroke();

        for (let i = 0; i < this.branches.length; i++) {
            const b = this.branches[i];
            const branchLen = height * 0.5 * b.length;
            const attachY = -height * (0.3 + i * 0.2);

            ctx.save();
            ctx.translate(0, attachY);
            ctx.rotate(b.angle + Math.PI / 2);

            ctx.fillStyle = color;
            ctx.shadowColor = this.species.glowColor;
            ctx.shadowBlur = this.stage >= 3 ? 12 : 4;

            ctx.beginPath();
            ctx.ellipse(branchLen * 0.5, 0, branchLen * 0.5, branchLen * 0.22, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(branchLen, 0);
            ctx.stroke();

            ctx.restore();
        }

        if (this.stage === 4 && this.bloomProgress > 0.1) {
            ctx.save();
            ctx.translate(0, -height);
            this.renderFlowerHead(ctx, scale * this.bloomProgress, color);
            ctx.restore();
        }
    }

    renderLotus(ctx, scale, color) {
        ctx.fillStyle = '#059669';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.ellipse(0, 0, 18 * scale, 9 * scale, 0, 0.2, Math.PI * 1.8);
        ctx.fill();

        const openFactor = Math.max(0.15, this.bloomProgress);
        ctx.save();
        ctx.translate(0, -3 * scale);

        const petals = 6;
        for (let i = 0; i < petals; i++) {
            const angle = (i / petals) * Math.PI * 2;
            const spread = openFactor * 10 * scale;
            const px = Math.cos(angle) * spread;
            const py = Math.sin(angle) * spread * 0.5 - (1 - openFactor) * 8 * scale;

            ctx.fillStyle = color;
            ctx.shadowColor = this.species.glowColor;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.ellipse(px, py, 6 * scale, 3 * scale, angle, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, -2 * scale, 3.5 * scale * openFactor, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    renderWillow(ctx, scale, color) {
        const height = this.species.maxHeight * scale;

        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 4 * scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-6 * scale, -height * 0.6, 0, -height);
        ctx.stroke();

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5 * scale;
        ctx.shadowColor = this.species.glowColor;
        ctx.shadowBlur = 8;

        const branchCount = 7;
        for (let i = 0; i < branchCount; i++) {
            const spread = (i - branchCount / 2) * 5 * scale;
            const wave = Math.sin(this.swayAngle * 2 + i) * 8 * scale;

            ctx.beginPath();
            ctx.moveTo(0, -height);
            ctx.quadraticCurveTo(spread * 1.8 + wave, -height * 0.5, spread * 1.2 + wave, -height * 0.1);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(spread * 1.2 + wave, -height * 0.1, 1.8 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    renderCrystalBonsai(ctx, scale, color) {
        const height = this.species.maxHeight * scale;

        ctx.fillStyle = 'rgba(167, 243, 208, 0.7)';
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1.2;
        ctx.shadowColor = '#6ee7b7';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.moveTo(-4 * scale, 0);
        ctx.lineTo(-2 * scale, -height * 0.5);
        ctx.lineTo(-8 * scale, -height * 0.75);
        ctx.lineTo(0, -height);
        ctx.lineTo(6 * scale, -height * 0.65);
        ctx.lineTo(4 * scale, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const clusters = [
            { x: -8 * scale, y: -height * 0.75, r: 5 * scale },
            { x: 0, y: -height, r: 7 * scale },
            { x: 6 * scale, y: -height * 0.65, r: 4.5 * scale }
        ];

        for (const c of clusters) {
            ctx.fillStyle = '#ecfdf5';
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    renderFlowerHead(ctx, scale, color) {
        const petalCount = 5;
        const radius = 9 * scale;

        ctx.shadowColor = this.species.glowColor;
        ctx.shadowBlur = 15;

        for (let i = 0; i < petalCount; i++) {
            const angle = (i / petalCount) * Math.PI * 2;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.ellipse(
                Math.cos(angle) * radius * 0.6,
                Math.sin(angle) * radius * 0.6,
                radius * 0.5,
                radius * 0.28,
                angle,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
    }

    renderHarvestableShards(ctx, scale) {
        ctx.save();
        ctx.translate(0, -this.species.maxHeight * scale - 12);
        const floatY = Math.sin(Date.now() * 0.005) * 3;

        ctx.fillStyle = '#fde047';
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 14;

        ctx.beginPath();
        ctx.moveTo(0, floatY - 6);
        ctx.lineTo(5, floatY);
        ctx.lineTo(0, floatY + 6);
        ctx.lineTo(-5, floatY);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

class EcosystemManager {
    constructor() {
        this.plants = [];
        this.starlightShards = 15;
        this.blessings = {
            astralRay: false, // Koi speed & sparkles
            chronos: false,   // 50% hydration preservation
            genesis: false    // instant bloom surge
        };
    }

    initDefaultSanctuary() {
        this.plants = [];
        this.addPlant('starlight_sprout', -90, -10, false, 0.85);
        this.addPlant('whispering_willow', -30, -35, false, 0.95);
        this.addPlant('crystal_bonsai', 80, -25, false, 0.9);
        this.addPlant('chrono_orchid', 40, -10, false, 0.8);
        this.addPlant('prism_blossom', -60, 20, false, 0.75);
        this.addPlant('moon_lotus', 15, 30, true, 0.9);
    }

    addPlant(speciesId, x, y, isWater = false, initialGrowth = 0.4) {
        const plant = new Plant(speciesId, x, y, isWater);
        plant.growth = initialGrowth;
        if (initialGrowth >= 0.9) {
            plant.stage = 4;
            plant.bloomProgress = 1.0;
        }
        this.plants.push(plant);
        return plant;
    }

    harvestAt(x, y, radius = 35) {
        let collected = 0;
        for (const p of this.plants) {
            const dx = p.x - x;
            const dy = (p.y - p.species.maxHeight * (0.3 + 0.7 * p.growth)) - y;
            const dist = Math.hypot(dx, dy);
            if (dist < radius && p.stardustHarvestable > 0) {
                collected += p.stardustHarvestable * 2;
                p.stardustHarvestable = 0;
            }
        }
        if (collected > 0) {
            this.starlightShards += collected;
            if (window.AudioEngine) window.AudioEngine.playCelestialChime(987.77, 0.4);
        }
        return collected;
    }

    applyBlessing(type) {
        this.blessings[type] = true;
        if (type === 'genesis') {
            for (const p of this.plants) {
                p.growth = 1.0;
                p.stage = 4;
                p.bloomProgress = 1.0;
                p.stardustHarvestable = 3;
            }
        }
    }

    update(dt, weather, timeOfDay, windStrength) {
        for (const p of this.plants) {
            p.update(dt, weather, timeOfDay, windStrength, this.blessings);
        }
    }

    render(ctx, timeOfDay) {
        const sorted = [...this.plants].sort((a, b) => a.y - b.y);
        for (const p of sorted) {
            p.render(ctx, timeOfDay);
        }
    }
}

window.Plant = Plant;
window.EcosystemManager = EcosystemManager;
