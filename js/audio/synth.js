/**
 * AETHERIA - Procedural Web Audio Engine
 * 100% Synthesized - Stereo Spatial Panning, Harmonic Series, Organic Acoustics & Celestial Choirs
 */

class AudioSynthesizer {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.masterVolume = 0.7;
        this.layers = {
            ambient: { gain: null, node: null, volume: 0.5 },
            rain: { gain: null, node: null, volume: 0.0 },
            wind: { gain: null, node: null, volume: 0.2 },
            crickets: { gain: null, node: null, volume: 0.0 },
            birds: { gain: null, node: null, volume: 0.0 },
            binaural: { gain: null, node: null, volume: 0.0, active: false }
        };
        this.initialized = false;
        this.currentScale = [
            146.83, // D3
            164.81, // E3
            185.00, // F#3
            220.00, // A3
            246.94, // B3
            293.66, // D4
            329.63, // E4
            369.99, // F#4
            440.00, // A4
            493.88, // B4
            587.33  // D5
        ];
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);

            this.compressor = this.ctx.createDynamicsCompressor();
            this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
            this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
            this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
            this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
            this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

            this.reverbNode = this.createSyntheticReverb(2.8, 1.8);
            this.reverbGain = this.ctx.createGain();
            this.reverbGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

            this.reverbNode.connect(this.reverbGain);
            this.reverbGain.connect(this.compressor);

            this.masterGain.connect(this.compressor);
            this.compressor.connect(this.ctx.destination);

            this.setupAmbientPad();
            this.setupWindGenerator();
            this.setupRainGenerator();
            this.setupFaunaGenerators();

            this.initialized = true;

            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    if (this.ctx.state === 'running') this.ctx.suspend();
                } else {
                    if (this.ctx.state === 'suspended' && !this.isMuted) this.ctx.resume();
                }
            });
        } catch (e) {
            console.warn('Web Audio API not supported or blocked:', e);
        }
    }

    resume() {
        if (!this.initialized) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    createSyntheticReverb(duration, decay) {
        const rate = this.ctx.sampleRate;
        const length = Math.floor(rate * duration);
        const impulse = this.ctx.createBuffer(2, length, rate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const n = i / length;
            const factor = Math.exp(-n * decay) * (1 - n);
            left[i] = (Math.random() * 2 - 1) * factor;
            right[i] = (Math.random() * 2 - 1) * factor;
        }

        const convolver = this.ctx.createConvolver();
        convolver.buffer = impulse;
        return convolver;
    }

    createPanner(pan = 0.0) {
        if (!this.ctx) return null;
        if (this.ctx.createStereoPanner) {
            const panner = this.ctx.createStereoPanner();
            panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), this.ctx.currentTime);
            return panner;
        }
        return null;
    }

    setupAmbientPad() {
        this.padGain = this.ctx.createGain();
        this.padGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        this.padGain.connect(this.masterGain);

        this.padFilter = this.ctx.createBiquadFilter();
        this.padFilter.type = 'lowpass';
        this.padFilter.frequency.setValueAtTime(380, this.ctx.currentTime);
        this.padFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);
        this.padFilter.connect(this.padGain);
        this.padFilter.connect(this.reverbNode);

        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);
        lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(this.padFilter.frequency);
        lfo.start();

        this.startPadDroneCycle();
    }

    startPadDroneCycle() {
        const chordProgressions = [
            [146.83, 220.00, 293.66, 369.99], // D maj9
            [123.47, 185.00, 246.94, 329.63], // B min7
            [98.00, 146.83, 246.94, 293.66],  // G maj7
            [110.00, 164.81, 220.00, 329.63]  // A sus
        ];

        let chordIndex = 0;
        const playNextChord = () => {
            if (!this.initialized || this.isMuted) {
                setTimeout(playNextChord, 8000);
                return;
            }

            const chord = chordProgressions[chordIndex];
            chordIndex = (chordIndex + 1) % chordProgressions.length;
            const now = this.ctx.currentTime;
            const chordDuration = 9.0;
            const fadeIn = 3.5;
            const fadeOut = 4.0;

            chord.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const oscGain = this.ctx.createGain();
                
                osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
                const detune = (idx - 1.5) * 6;
                osc.frequency.setValueAtTime(freq, now);
                osc.detune.setValueAtTime(detune, now);

                oscGain.gain.setValueAtTime(0.001, now);
                oscGain.gain.linearRampToValueAtTime(0.06 / chord.length, now + fadeIn);
                oscGain.gain.setValueAtTime(0.06 / chord.length, now + chordDuration - fadeOut);
                oscGain.gain.exponentialRampToValueAtTime(0.0001, now + chordDuration);

                osc.connect(oscGain);
                oscGain.connect(this.padFilter);

                osc.start(now);
                osc.stop(now + chordDuration + 0.1);
            });

            if (Math.random() > 0.3) {
                setTimeout(() => {
                    this.playCelestialChime(this.currentScale[Math.floor(Math.random() * this.currentScale.length)] * 2, 0.15, (Math.random() - 0.5) * 0.8);
                }, 2000 + Math.random() * 4000);
            }

            setTimeout(playNextChord, (chordDuration - fadeOut + 0.8) * 1000);
        };

        playNextChord();
    }

    setupWindGenerator() {
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99 * b0 + white * 0.05;
            b1 = 0.96 * b1 + white * 0.11;
            b2 = 0.86 * b2 + white * 0.25;
            output[i] = (b0 + b1 + b2) * 0.2;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        this.windFilter = this.ctx.createBiquadFilter();
        this.windFilter.type = 'bandpass';
        this.windFilter.frequency.setValueAtTime(260, this.ctx.currentTime);
        this.windFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

        this.windGain = this.ctx.createGain();
        this.windGain.gain.setValueAtTime(this.layers.wind.volume * 0.18, this.ctx.currentTime);

        whiteNoise.connect(this.windFilter);
        this.windFilter.connect(this.windGain);
        this.windGain.connect(this.masterGain);
        this.windGain.connect(this.reverbNode);

        whiteNoise.start();

        setInterval(() => {
            if (!this.initialized || !this.ctx) return;
            const now = this.ctx.currentTime;
            const targetFreq = 180 + Math.random() * 280;
            this.windFilter.frequency.setTargetAtTime(targetFreq, now, 2.5);
        }, 3500);
    }

    setupRainGenerator() {
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.3;
        }

        const rainSource = this.ctx.createBufferSource();
        rainSource.buffer = noiseBuffer;
        rainSource.loop = true;

        this.rainFilter = this.ctx.createBiquadFilter();
        this.rainFilter.type = 'lowpass';
        this.rainFilter.frequency.setValueAtTime(900, this.ctx.currentTime);

        this.rainGain = this.ctx.createGain();
        this.rainGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

        rainSource.connect(this.rainFilter);
        this.rainFilter.connect(this.rainGain);
        this.rainGain.connect(this.masterGain);

        rainSource.start();

        setInterval(() => {
            if (this.layers.rain.volume > 0.05 && Math.random() < this.layers.rain.volume * 1.5) {
                this.playWaterDrip(600 + Math.random() * 700, 0.25, (Math.random() - 0.5) * 0.8);
            }
        }, 220);
    }

    setupFaunaGenerators() {
        setInterval(() => {
            if (this.layers.crickets.volume > 0.05 && Math.random() < 0.7) {
                this.playCricketChirp();
            }
        }, 800);

        setInterval(() => {
            if (this.layers.birds.volume > 0.05 && Math.random() < 0.4) {
                this.playBirdSong();
            }
        }, 3200);
    }

    playCricketChirp() {
        if (!this.initialized || this.isMuted) return;
        const now = this.ctx.currentTime;
        const freq = 4400 + (Math.random() * 300 - 150);
        const panner = this.createPanner((Math.random() - 0.5) * 0.9);
        
        for (let i = 0; i < 3; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.06);

            gain.gain.setValueAtTime(0, now + i * 0.06);
            gain.gain.linearRampToValueAtTime(0.03 * this.layers.crickets.volume, now + i * 0.06 + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.045);

            osc.connect(gain);
            if (panner) {
                gain.connect(panner);
                panner.connect(this.masterGain);
            } else {
                gain.connect(this.masterGain);
            }
            osc.start(now + i * 0.06);
            osc.stop(now + i * 0.06 + 0.05);
        }
    }

    playBirdSong() {
        if (!this.initialized || this.isMuted) return;
        const now = this.ctx.currentTime;
        const baseFreq = 2200 + Math.random() * 800;
        const notes = [0, 4, 7, 12, 16];
        const numNotes = 2 + Math.floor(Math.random() * 3);
        const panner = this.createPanner((Math.random() - 0.5) * 0.8);

        for (let i = 0; i < numNotes; i++) {
            const noteStart = now + i * 0.12;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteInterval = notes[Math.floor(Math.random() * notes.length)];
            const noteFreq = baseFreq * Math.pow(2, noteInterval / 12);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(noteFreq, noteStart);
            osc.frequency.exponentialRampToValueAtTime(noteFreq * (0.95 + Math.random() * 0.2), noteStart + 0.1);

            gain.gain.setValueAtTime(0.001, noteStart);
            gain.gain.linearRampToValueAtTime(0.04 * this.layers.birds.volume, noteStart + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.09);

            osc.connect(gain);
            if (panner) {
                gain.connect(panner);
                panner.connect(this.reverbNode);
                panner.connect(this.masterGain);
            } else {
                gain.connect(this.reverbNode);
                gain.connect(this.masterGain);
            }

            osc.start(noteStart);
            osc.stop(noteStart + 0.1);
        }
    }

    playWaterDrip(freq = 600 + Math.random() * 700, vol = 0.25, pan = 0.0) {
        if (!this.initialized || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const panner = this.createPanner(pan);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.45, now + 0.09);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(vol * 0.3, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

        osc.connect(gain);
        if (panner) {
            gain.connect(panner);
            panner.connect(this.reverbNode);
            panner.connect(this.masterGain);
        } else {
            gain.connect(this.reverbNode);
            gain.connect(this.masterGain);
        }

        osc.start(now);
        osc.stop(now + 0.15);
    }

    playCelestialChime(freq = 440, vol = 0.3, pan = 0.0) {
        if (!this.initialized || this.isMuted) return;
        const now = this.ctx.currentTime;
        const panner = this.createPanner(pan);
        
        const harmonics = [
            { mult: 1.0, gain: 1.0, decay: 2.2 },
            { mult: 2.76, gain: 0.35, decay: 1.4 },
            { mult: 5.40, gain: 0.15, decay: 0.8 },
            { mult: 8.93, gain: 0.08, decay: 0.4 }
        ];

        harmonics.forEach(h => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq * h.mult, now);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(vol * h.gain * 0.3, now + 0.008);
            gain.gain.exponentialRampToValueAtTime(0.00001, now + h.decay);

            osc.connect(gain);
            if (panner) {
                gain.connect(panner);
                panner.connect(this.reverbNode);
                panner.connect(this.masterGain);
            } else {
                gain.connect(this.reverbNode);
                gain.connect(this.masterGain);
            }

            osc.start(now);
            osc.stop(now + h.decay + 0.05);
        });
    }

    playBloomArpeggio() {
        if (!this.initialized || this.isMuted) return;
        const arpeggio = [293.66, 369.99, 440.00, 587.33, 739.99, 880.00];
        arpeggio.forEach((note, index) => {
            setTimeout(() => {
                const pan = (index / (arpeggio.length - 1)) * 1.2 - 0.6;
                this.playCelestialChime(note, 0.18 + index * 0.03, pan);
            }, index * 85);
        });
    }

    // Sacred Symphony / Celestial Choir chord for easter eggs & blessings
    playSacredChoirChord() {
        if (!this.initialized || this.isMuted) return;
        const now = this.ctx.currentTime;
        const chord = [220.00, 277.18, 329.63, 440.00, 554.37, 659.25]; // A maj9
        const duration = 5.5;

        chord.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const panner = this.createPanner((idx / (chord.length - 1)) * 1.6 - 0.8);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.05, now + 1.2);
            gain.gain.setValueAtTime(0.05, now + 3.2);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(gain);
            if (panner) {
                gain.connect(panner);
                panner.connect(this.reverbNode);
                panner.connect(this.masterGain);
            } else {
                gain.connect(this.reverbNode);
                gain.connect(this.masterGain);
            }

            osc.start(now);
            osc.stop(now + duration + 0.1);
        });
    }

    playGlassTap(pitch = 900, pan = 0.0) {
        if (!this.initialized || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const panner = this.createPanner(pan);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(pitch, now);
        osc.frequency.exponentialRampToValueAtTime(pitch * 0.6, now + 0.04);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

        osc.connect(gain);
        if (panner) {
            gain.connect(panner);
            panner.connect(this.masterGain);
        } else {
            gain.connect(this.masterGain);
        }

        osc.start(now);
        osc.stop(now + 0.06);
    }

    playStarLink(index = 0) {
        const starNotes = [329.63, 369.99, 440.00, 493.88, 587.33, 659.25, 739.99, 880.00];
        const freq = starNotes[index % starNotes.length];
        this.playCelestialChime(freq, 0.35, (index % 2 === 0 ? -0.3 : 0.3));
    }

    playConstellationComplete() {
        if (!this.initialized || this.isMuted) return;
        const chord = [293.66, 369.99, 440.00, 587.33, 880.00];
        chord.forEach((note, idx) => {
            setTimeout(() => {
                this.playCelestialChime(note, 0.4, (idx - 2) * 0.3);
            }, idx * 120);
        });
        setTimeout(() => {
            this.playSacredChoirChord();
            this.playBloomArpeggio();
        }, 600);
    }

    playCameraShutter() {
        if (!this.initialized || this.isMuted) return;
        const now = this.ctx.currentTime;
        
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(1400, now);
        gain1.gain.setValueAtTime(0.18, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc1.connect(gain1);
        gain1.connect(this.masterGain);
        osc1.start(now);
        osc1.stop(now + 0.035);

        setTimeout(() => {
            if (!this.ctx) return;
            const t = this.ctx.currentTime;
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(900, t);
            gain2.gain.setValueAtTime(0.15, t);
            gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
            osc2.connect(gain2);
            gain2.connect(this.masterGain);
            osc2.start(t);
            osc2.stop(t + 0.06);
        }, 60);
    }

    setWeatherAudio(weatherType, intensity = 1.0) {
        if (!this.initialized || !this.ctx) return;
        const now = this.ctx.currentTime;

        if (weatherType === 'rain' || weatherType === 'storm') {
            this.layers.rain.volume = Math.min(1.0, 0.3 * intensity);
            this.rainGain.gain.setTargetAtTime(this.layers.rain.volume * 0.4, now, 1.5);
            this.rainFilter.frequency.setTargetAtTime(800 + intensity * 600, now, 1.5);
        } else {
            this.layers.rain.volume = 0.0;
            this.rainGain.gain.setTargetAtTime(0.0, now, 1.2);
        }

        if (weatherType === 'wind' || weatherType === 'storm') {
            this.layers.wind.volume = 0.5 * intensity;
            this.windGain.gain.setTargetAtTime(0.25 * intensity, now, 1.5);
        } else {
            this.layers.wind.volume = 0.15;
            this.windGain.gain.setTargetAtTime(0.08, now, 1.5);
        }
    }

    setTimeOfDayAudio(timeOfDay) {
        if (!this.initialized || !this.ctx) return;
        const now = this.ctx.currentTime;

        if (timeOfDay === 'day' || timeOfDay === 'dawn') {
            this.layers.birds.volume = 0.8;
            this.layers.crickets.volume = 0.0;
        } else if (timeOfDay === 'night' || timeOfDay === 'dusk') {
            this.layers.birds.volume = 0.0;
            this.layers.crickets.volume = 0.85;
        }
    }

    toggleBinauralBeat(enabled = true, beatFreq = 10.0, carrierFreq = 216.0) {
        if (!this.initialized || !this.ctx) return;
        const now = this.ctx.currentTime;

        if (!enabled) {
            if (this.binauralLeft) {
                this.binauralGain.gain.setTargetAtTime(0.0, now, 1.0);
                setTimeout(() => {
                    try {
                        this.binauralLeft.stop();
                        this.binauralRight.stop();
                    } catch(e){}
                    this.binauralLeft = null;
                    this.binauralRight = null;
                }, 1200);
            }
            this.layers.binaural.active = false;
            return;
        }

        if (this.binauralLeft) return;

        this.binauralGain = this.ctx.createGain();
        this.binauralGain.gain.setValueAtTime(0.001, now);
        this.binauralGain.gain.linearRampToValueAtTime(0.09, now + 3.0);

        const merger = this.ctx.createChannelMerger(2);
        this.binauralLeft = this.ctx.createOscillator();
        this.binauralLeft.type = 'sine';
        this.binauralLeft.frequency.setValueAtTime(carrierFreq, now);

        this.binauralRight = this.ctx.createOscillator();
        this.binauralRight.type = 'sine';
        this.binauralRight.frequency.setValueAtTime(carrierFreq + beatFreq, now);

        this.binauralLeft.connect(merger, 0, 0);
        this.binauralRight.connect(merger, 0, 1);
        merger.connect(this.binauralGain);
        this.binauralGain.connect(this.masterGain);

        this.binauralLeft.start();
        this.binauralRight.start();
        this.layers.binaural.active = true;
    }

    setMasterVolume(val) {
        this.masterVolume = Math.max(0, Math.min(1, val));
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime, 0.05);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime, 0.05);
        }
        return this.isMuted;
    }
}

window.AudioEngine = new AudioSynthesizer();
