/**
 * AETHERIA - Discovery Codex & Botanical Archive
 * Track unlocked flora, celestial phenomena, mythical creatures, and achievements
 */

class CodexManager {
    constructor() {
        this.entries = {
            // Flora
            'starlight_sprout': {
                id: 'starlight_sprout',
                category: 'flora',
                name: '星辉幼蕨',
                latin: 'Filix Stellaris',
                unlocked: true,
                icon: '🌱',
                desc: '在悬岛微光中自然孕育的荧光蕨类。夜间会释放悬浮的淡蓝孢子，是浮空生态的重要基石。'
            },
            'moon_lotus': {
                id: 'moon_lotus',
                category: 'flora',
                name: '月影幽莲',
                latin: 'Nelumbo Lunaris',
                unlocked: true,
                icon: '🪷',
                desc: '生于中心灵泉中的神圣睡莲。唯有在月色与黄昏映照下方能怒放，吐露璀璨金蕊。'
            },
            'whispering_willow': {
                id: 'whispering_willow',
                category: 'flora',
                name: '金芒垂柳',
                latin: 'Salix Aurum',
                unlocked: true,
                icon: '🌾',
                desc: '古老的流光树种。修长金黄的枝条富含共鸣晶体，清风掠过时可奏响自然的风铃清音。'
            },
            'chrono_orchid': {
                id: 'chrono_orchid',
                category: 'flora',
                name: '时轮彩兰',
                latin: 'Orchis Temporis',
                unlocked: true,
                icon: '🌸',
                desc: '与昼夜潮汐同频共振的奇迹花卉。晨曦泛粉，午日湛蓝，暮霞若金，长夜作紫。'
            },
            'crystal_bonsai': {
                id: 'crystal_bonsai',
                category: 'flora',
                name: '晶棱微木',
                latin: 'Bonsai Crystallum',
                unlocked: true,
                icon: '💎',
                desc: '由星尘矿石与古木根须共生结晶而成的盆景。几何棱面能将任何光束折射为梦幻光斑。'
            },
            'prism_blossom': {
                id: 'prism_blossom',
                category: 'flora',
                name: '虹彩棱花',
                latin: 'Flos Iris',
                unlocked: true,
                icon: '🌺',
                desc: '在甘露润泽下盛放的多棱奇花。每次浇灌均能激发一圈七彩虹光粒子。'
            },

            // Fauna
            'spirit_koi': {
                id: 'spirit_koi',
                category: 'fauna',
                name: '幻光锦鲤',
                latin: 'Cyprinus Astra',
                unlocked: true,
                icon: '🐟',
                desc: '穿行于倒悬灵泉中的灵性鱼种。对水纹极具感应，受惊时会如流星般迅捷遁走。'
            },
            'guardian_spirit': {
                id: 'guardian_spirit',
                category: 'fauna',
                name: '星境守护灵 · 猎户',
                latin: 'Genius Loci Orion',
                unlocked: true,
                icon: '🦉',
                desc: '栖息在石门之上的古老守护生灵。双目灵动机警，喜欢旅人的抚触，常带来温暖的星空箴言。'
            },
            'sky_ray': {
                id: 'sky_ray',
                category: 'fauna',
                name: '星海幻鳐',
                latin: 'Batoidea Aether',
                unlocked: false,
                icon: '✨',
                desc: '远古天际的巨型半透明浮空鳐鱼。仅在云海最宁静的时刻偶尔划过天穹深处。'
            },
            'luminous_moth': {
                id: 'luminous_moth',
                category: 'fauna',
                name: '星辉彩蝶',
                latin: 'Papilio Lux',
                unlocked: true,
                icon: '🦋',
                desc: '伴花而生的微光鳞翅目。翅膀由纯净的以太凝聚，夜间会追逐光源飞舞。'
            },

            // Celestial Weather
            'aurora': {
                id: 'aurora',
                category: 'celestial',
                name: '极光幻幔',
                latin: 'Aurora Borealis',
                unlocked: false,
                icon: '🌌',
                desc: '深夜出现的大气磁层光幕，如轻纱般在夜空翻卷涌动，具有舒缓心神的神奇共鸣。'
            },
            'shooting_star': {
                id: 'shooting_star',
                category: 'celestial',
                name: '许愿流星雨',
                latin: 'Pluvia Meteorica',
                unlocked: false,
                icon: '🌠',
                desc: '划破天幕的瞬逝星尘。当它划过时，庭园中的所有植株都会吸收微量的星核能量。'
            },
            'celestial_rain': {
                id: 'celestial_rain',
                category: 'celestial',
                name: '空灵甘霖',
                latin: 'Imber Caelestis',
                unlocked: false,
                icon: '🌧️',
                desc: '滴落在生态瓶琉璃穹顶上的天界细雨，水珠会顺着曲面缓缓滑落，发出清脆的音节。'
            },

            // Ancient Relics
            'astrolabe': {
                id: 'astrolabe',
                category: 'relic',
                name: '星位司南仪',
                latin: 'Astrolabium Antiquum',
                unlocked: false,
                icon: '🧭',
                desc: '悬浮于生态瓶顶端的青铜黄道环，用于校准时空潮汐与观测未知的星象坐标。'
            },
            'resonance_chimes': {
                id: 'resonance_chimes',
                category: 'relic',
                name: '五音天籁磬',
                latin: 'Campanae Harmonicae',
                unlocked: true,
                icon: '🔔',
                desc: '挂于悬岛古木之上的五音风铃，依五度相生律调准，迎风自鸣，能抚慰凡世焦躁。'
            }
        };

        this.achievements = [
            { id: 'first_bloom', title: '初绽之华', desc: '成功培育一株植物至完全盛开', unlocked: false },
            { id: 'rain_maker', title: '唤雨之神', desc: '召唤一场湿润生灵的天界甘霖', unlocked: false },
            { id: 'night_owl', title: '夜幕观测者', desc: '在深夜时分聆听虫鸣与极光', unlocked: false },
            { id: 'stargazer', title: '星图连线者', desc: '成功绘制并点亮一张远古星图', unlocked: false },
            { id: 'spirit_friend', title: '星灵挚友', desc: '与守护灵猎户进行三次心意交流', unlocked: false },
            { id: 'polaroid_master', title: '瞬刻永恒', desc: '在留影机中定格一张生态庭园的照片', unlocked: false }
        ];

        this.onUnlockCallback = null;
    }

    unlock(entryId) {
        if (this.entries[entryId] && !this.entries[entryId].unlocked) {
            this.entries[entryId].unlocked = true;
            if (window.AudioEngine) window.AudioEngine.playCelestialChime(880, 0.4);
            if (this.onUnlockCallback) {
                this.onUnlockCallback(this.entries[entryId]);
            }
            return true;
        }
        return false;
    }

    unlockAchievement(achId) {
        const a = this.achievements.find(item => item.id === achId);
        if (a && !a.unlocked) {
            a.unlocked = true;
            if (window.AudioEngine) window.AudioEngine.playBloomArpeggio();
            if (this.onUnlockCallback) {
                this.onUnlockCallback({ name: a.title, desc: a.desc, isAchievement: true });
            }
            return true;
        }
        return false;
    }

    getStats() {
        const totalEntries = Object.keys(this.entries).length;
        const unlockedEntries = Object.values(this.entries).filter(e => e.unlocked).length;
        const totalAch = this.achievements.length;
        const unlockedAch = this.achievements.filter(a => a.unlocked).length;
        return {
            entriesUnlocked: unlockedEntries,
            entriesTotal: totalEntries,
            achUnlocked: unlockedAch,
            achTotal: totalAch,
            percent: Math.round(((unlockedEntries + unlockedAch) / (totalEntries + totalAch)) * 100)
        };
    }
}

window.CodexManager = CodexManager;
