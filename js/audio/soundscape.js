/**
 * AETHERIA - Soundscape & Mixer Controller
 * Manages ambient layering, volume controls, audio presets, and soundscapes
 */

class SoundscapeManager {
    constructor(audio) {
        this.audio = audio;
        this.presets = {
            'celestial': {
                name: '星穹秘境 (Celestial Twilight)',
                master: 0.7,
                pad: 0.5,
                wind: 0.25,
                rain: 0.0,
                fauna: 0.4,
                binaural: false
            },
            'rainy': {
                name: '雨夜温室 (Rainy Terrarium)',
                master: 0.75,
                pad: 0.35,
                wind: 0.3,
                rain: 0.65,
                fauna: 0.1,
                binaural: false
            },
            'sunlit': {
                name: '晨光微风 (Sunlit Meadow)',
                master: 0.7,
                pad: 0.4,
                wind: 0.2,
                rain: 0.0,
                fauna: 0.7, // birds
                binaural: false
            },
            'meditation': {
                name: '阿尔法冥想 (Alpha Focus 10Hz)',
                master: 0.65,
                pad: 0.45,
                wind: 0.15,
                rain: 0.1,
                fauna: 0.0,
                binaural: true
            }
        };
        this.currentPreset = 'celestial';
    }

    applyPreset(presetKey) {
        const p = this.presets[presetKey];
        if (!p) return;
        this.currentPreset = presetKey;
        this.audio.setMasterVolume(p.master);

        if (this.audio.padGain) {
            this.audio.padGain.gain.setTargetAtTime(p.pad, this.audio.ctx.currentTime, 0.5);
        }
        if (this.audio.windGain) {
            this.audio.windGain.gain.setTargetAtTime(p.wind * 0.25, this.audio.ctx.currentTime, 0.5);
        }
        if (this.audio.rainGain) {
            this.audio.layers.rain.volume = p.rain;
            this.audio.rainGain.gain.setTargetAtTime(p.rain * 0.4, this.audio.ctx.currentTime, 0.5);
        }
        this.audio.layers.birds.volume = p.fauna;
        this.audio.layers.crickets.volume = p.fauna;
        this.audio.toggleBinauralBeat(p.binaural);
    }
}

window.SoundscapeManager = SoundscapeManager;
