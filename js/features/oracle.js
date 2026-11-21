/**
 * AETHERIA - Daily Celestial Oracle & Morning Wisdom
 * Generates personalized daily prophecy cards with celestial guidance
 */

class OracleManager {
    constructor() {
        this.cards = [
            {
                id: 'dawn_genesis',
                title: '【破晓生机 · Dawn Genesis】',
                sign: '🌅 晨光破晓 · 乙木向荣',
                tod: 'dawn',
                guidance: '沉睡的种子在长夜中积蓄的力量，终将在第一缕晨曦拂晓时破土而出。新的灵感正在萌芽，无需畏惧起点微小。',
                advice: '今日宜：开启新计划、专注创作、饮清晨第一杯温水。',
                luckySign: '灵植：星辉幼蕨 · 幸运频段：432Hz · 幸运色：晨曦天青'
            },
            {
                id: 'solar_radiance',
                title: '【日华丰饶 · Solar Radiance】',
                sign: '☀️ 盛昼明曜 · 万物自生',
                tod: 'day',
                guidance: '以饱满的以太之光拥抱世界。向阳生长，生命本身就是一场无需刻意证明的丰盛奇迹。',
                advice: '今日宜：自信前行、舒展筋骨、与身边人分享喜悦。',
                luckySign: '灵植：金芒垂柳 · 幸运频段：528Hz · 幸运色：日光琥珀'
            },
            {
                id: 'twilight_serenity',
                title: '【静水深流 · Twilight Serenity】',
                sign: '🌇 暮霞流金 · 浮生暂歇',
                tod: 'dusk',
                guidance: '夕阳熔金，洗尽铅华。生活不仅有向前奔跑的脚步，更需要驻足片刻，倾听心底最温柔的呢喃。',
                advice: '今日宜：反思自省、整理心绪、放下白日的焦躁。',
                luckySign: '灵植：时轮彩兰 · 幸运频段：396Hz · 幸运色：暮云绯紫'
            },
            {
                id: 'nocturnal_echo',
                title: '【星河守望 · Nocturnal Echo】',
                sign: '🌌 极夜微澜 · 暗夜明灯',
                tod: 'night',
                guidance: '即使在最深沉的黑夜里，群星也在永恒闪耀。黑暗从来不是终点，而是让微光得以被看见的幕布。',
                advice: '今日宜：阿尔法波深度放松、记录灵感、静心安眠。',
                luckySign: '灵植：月影幽莲 · 幸运频段：639Hz · 幸运色：深空以太蓝'
            },
            {
                id: 'astral_journey',
                title: '【灵鳐漫游 · The Astral Journey】',
                sign: '✨ 云海逍遥 · 灵台开朗',
                tod: 'all',
                guidance: '跳出方寸之地的拘束，在更广阔的精神云海中振翅遨游。相信自己的直觉与敏锐。',
                advice: '今日宜：阅读未知领域、尝试新的路径、拓宽视野。',
                luckySign: '灵兽：星海幻鳐 · 幸运频段：741Hz · 幸运色：荧光冰晶'
            },
            {
                id: 'primal_bloom',
                title: '【原初奇迹 · Primal Bloom】',
                sign: '🌸 春风化雨 · 花开有时',
                tod: 'all',
                guidance: '不疾不徐，不急于求成。每朵花都有自己的时节，只要根扎在泥土深处，花期自会如约而至。',
                advice: '今日宜：保持耐心、专注于当下的呼吸与细节。',
                luckySign: '灵植：虹彩棱花 · 幸运频段：852Hz · 幸运色：棱光彩虹'
            }
        ];
    }

    getDailyCard(timeOfDay) {
        // Filter by matching time of day or general
        const matched = this.cards.filter(c => c.tod === timeOfDay || c.tod === 'all');
        const daySeed = new Date().getDate() + new Date().getMonth() * 31;
        const index = daySeed % matched.length;
        return matched[index];
    }

    getRandomCard() {
        return this.cards[Math.floor(Math.random() * this.cards.length)];
    }
}

window.OracleManager = OracleManager;
