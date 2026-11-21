/**
 * AETHERIA - Local Storage & State Persistence Manager
 */

class StorageManager {
    static STORAGE_KEY = 'aetheria_save_v1';

    static save(ecosystem, codex, audioEngine, weatherEngine) {
        try {
            const data = {
                timestamp: Date.now(),
                shards: ecosystem.starlightShards,
                plants: ecosystem.plants.map(p => ({
                    speciesId: p.species.id,
                    x: p.x,
                    y: p.y,
                    isWater: p.isWater,
                    stage: p.stage,
                    growth: p.growth,
                    hydration: p.hydration,
                    bloomProgress: p.bloomProgress
                })),
                codex: {
                    entries: Object.entries(codex.entries).map(([k, v]) => ({ id: k, unlocked: v.unlocked })),
                    achievements: codex.achievements.map(a => ({ id: a.id, unlocked: a.unlocked }))
                },
                audio: {
                    masterVolume: audioEngine.masterVolume,
                    isMuted: audioEngine.isMuted
                },
                weather: {
                    time: weatherEngine.time,
                    realTimeSync: weatherEngine.realTimeSync,
                    currentWeather: weatherEngine.currentWeather
                }
            };
            localStorage.setItem(StorageManager.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Storage save failed:', e);
        }
    }

    static load(ecosystem, codex, audioEngine, weatherEngine) {
        try {
            const raw = localStorage.getItem(StorageManager.STORAGE_KEY);
            if (!raw) return false;
            const data = JSON.parse(raw);

            // Restore Shards
            if (typeof data.shards === 'number') {
                ecosystem.starlightShards = data.shards;
            }

            // Restore Plants
            if (Array.isArray(data.plants) && data.plants.length > 0) {
                ecosystem.plants = data.plants.map(sp => {
                    const plant = new Plant(sp.speciesId, sp.x, sp.y, sp.isWater);
                    plant.stage = sp.stage || 1;
                    plant.growth = sp.growth || 0.4;
                    plant.hydration = sp.hydration || 0.8;
                    plant.bloomProgress = sp.bloomProgress || 0.0;
                    return plant;
                });
            } else {
                ecosystem.initDefaultSanctuary();
            }

            // Restore Codex
            if (data.codex) {
                if (Array.isArray(data.codex.entries)) {
                    for (const e of data.codex.entries) {
                        if (codex.entries[e.id]) codex.entries[e.id].unlocked = e.unlocked;
                    }
                }
                if (Array.isArray(data.codex.achievements)) {
                    for (const a of data.codex.achievements) {
                        const target = codex.achievements.find(item => item.id === a.id);
                        if (target) target.unlocked = a.unlocked;
                    }
                }
            }

            // Restore Audio
            if (data.audio) {
                audioEngine.setMasterVolume(data.audio.masterVolume ?? 0.7);
                if (data.audio.isMuted) audioEngine.toggleMute();
            }

            // Restore Weather
            if (data.weather) {
                weatherEngine.time = data.weather.time ?? 14.0;
                weatherEngine.realTimeSync = data.weather.realTimeSync ?? false;
                weatherEngine.setWeather(data.weather.currentWeather ?? 'clear');
            }

            return true;
        } catch (e) {
            console.warn('Storage load failed, using default:', e);
            ecosystem.initDefaultSanctuary();
            return false;
        }
    }
}

window.StorageManager = StorageManager;
