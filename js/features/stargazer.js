/**
 * AETHERIA - Celestial Stargazer & Constellation Puzzle
 * Connected with Cosmic Ecosystem Blessings & Atmospheric Shimmers
 */

class Stargazer {
    constructor(codex, particles, ecosystem) {
        this.codex = codex;
        this.particles = particles;
        this.ecosystem = ecosystem;
        this.active = false;
        this.currentConstellationIndex = 0;
        this.connectedEdges = new Set();
        this.selectedStar = null;

        this.constellations = [
            {
                id: 'whale',
                name: '星海幻鳐座 (The Astral Ray)',
                desc: '巡游于深空以太的巨灵，象征自由与深邃之梦。点亮后获得「灵鳐之赐」：锦鲤通体散发璀璨流光。',
                blessing: 'astralRay',
                stars: [
                    { id: 0, x: 200, y: 140 },
                    { id: 1, x: 280, y: 110 },
                    { id: 2, x: 360, y: 140 },
                    { id: 3, x: 280, y: 220 },
                    { id: 4, x: 280, y: 280 },
                    { id: 5, x: 240, y: 340 }
                ],
                edges: [
                    [0, 1], [1, 2], [2, 3], [3, 0], [1, 3], [3, 4], [4, 5]
                ],
                completed: false
            },
            {
                id: 'hourglass',
                name: '时空沙漏座 (The Chronos Hourglass)',
                desc: '昼夜流转与岁月流逝的星穹守护者。点亮后获得「时轮结界」：悬岛草木水分蒸发减少50%。',
                blessing: 'chronos',
                stars: [
                    { id: 0, x: 220, y: 120 },
                    { id: 1, x: 340, y: 120 },
                    { id: 2, x: 280, y: 220 },
                    { id: 3, x: 220, y: 320 },
                    { id: 4, x: 340, y: 320 }
                ],
                edges: [
                    [0, 1], [1, 2], [2, 0], [2, 3], [2, 4], [3, 4]
                ],
                completed: false
            },
            {
                id: 'genesis',
                name: '原初之种座 (The Seed of Genesis)',
                desc: '孕育悬岛百草与微光生灵的生命源星。点亮后获得「创生神恩」：悬岛所有草木瞬间繁盛绽放！',
                blessing: 'genesis',
                stars: [
                    { id: 0, x: 280, y: 130 },
                    { id: 1, x: 350, y: 180 },
                    { id: 2, x: 350, y: 270 },
                    { id: 3, x: 280, y: 320 },
                    { id: 4, x: 210, y: 270 },
                    { id: 5, x: 210, y: 180 },
                    { id: 6, x: 280, y: 225 }
                ],
                edges: [
                    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
                    [0, 6], [2, 6], [4, 6]
                ],
                completed: false
            }
        ];
    }

    getCurrent() {
        return this.constellations[this.currentConstellationIndex];
    }

    selectStar(starId) {
        if (this.selectedStar === null) {
            this.selectedStar = starId;
            if (window.AudioEngine) window.AudioEngine.playStarLink(starId);
            return;
        }

        if (this.selectedStar === starId) {
            this.selectedStar = null;
            return;
        }

        const cur = this.getCurrent();
        const a = Math.min(this.selectedStar, starId);
        const b = Math.max(this.selectedStar, starId);
        const edgeKey = `${a}-${b}`;

        const validEdge = cur.edges.some(e => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a));

        if (validEdge) {
            this.connectedEdges.add(edgeKey);
            if (window.AudioEngine) window.AudioEngine.playStarLink(starId);

            if (this.connectedEdges.size >= cur.edges.length) {
                this.completeCurrent();
            }
        }

        this.selectedStar = starId;
    }

    completeCurrent() {
        const cur = this.getCurrent();
        if (cur.completed) return;
        cur.completed = true;

        if (window.AudioEngine) {
            window.AudioEngine.playConstellationComplete();
        }

        if (this.ecosystem && cur.blessing) {
            this.ecosystem.applyBlessing(cur.blessing);
        }

        this.codex.unlock('astrolabe');
        this.codex.unlockAchievement('stargazer');

        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                if (this.particles) this.particles.spawnShootingStar(window.innerWidth, window.innerHeight);
            }, i * 300);
        }
    }

    nextConstellation() {
        this.currentConstellationIndex = (this.currentConstellationIndex + 1) % this.constellations.length;
        this.connectedEdges.clear();
        this.selectedStar = null;
    }

    prevConstellation() {
        this.currentConstellationIndex = (this.currentConstellationIndex - 1 + this.constellations.length) % this.constellations.length;
        this.connectedEdges.clear();
        this.selectedStar = null;
    }
}

window.Stargazer = Stargazer;
