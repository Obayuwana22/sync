// Client-side Web Audio API ambient sound generator
// Zero external audio files required, works 100% offline with zero latency

export type AmbientSoundMode =
  | 'off'
  | 'lofi'
  | 'rain-thunder'
  | 'ambient'
  | 'nature'
  | 'piano'
  | 'alpha';

export interface SoundOptionMeta {
  id: AmbientSoundMode;
  name: string;
  category: string;
  description: string;
  icon: string;
  youtubeUrl: string;
}

export const AMBIENT_SOUND_OPTIONS: SoundOptionMeta[] = [
  {
    id: 'off',
    name: 'Off',
    category: 'Mute',
    description: 'Silence ambient background audio',
    icon: 'VolumeX',
    youtubeUrl: '',
  },
  {
    id: 'lofi',
    name: 'Lo-fi hip hop',
    category: 'Beats & Focus',
    description: 'Relaxed beats, soft drums and gentle melodies. Great for everyday coding.',
    icon: 'Coffee',
    youtubeUrl: 'https://www.youtube.com/results?search_query=lofi+coding+beats',
  },
  {
    id: 'rain-thunder',
    name: 'Rain & thunder',
    category: 'Natural Ambience',
    description: 'Gentle rainfall & rolling thunder creates a peaceful atmosphere for debugging.',
    icon: 'CloudRain',
    youtubeUrl: 'https://www.youtube.com/results?search_query=rain+sounds+for+programming+10+hours',
  },
  {
    id: 'ambient',
    name: 'Ambient electronic',
    category: 'Atmospheric Synths',
    description: 'Soft synths and atmospheric soundscapes. Excellent for long concentration.',
    icon: 'Sparkles',
    youtubeUrl: 'https://www.youtube.com/results?search_query=ambient+music+for+deep+focus',
  },
  {
    id: 'nature',
    name: 'Nature sounds',
    category: 'Forest & Water',
    description: 'Flowing water, birds, wind and forest ambience when you want natural calm.',
    icon: 'Trees',
    youtubeUrl: 'https://www.youtube.com/results?search_query=nature+sounds+for+focus+work',
  },
  {
    id: 'piano',
    name: 'Soft piano music',
    category: 'Neoclassical Acoustic',
    description: 'Calm instrumental piano for thinking through complex problems & architecture.',
    icon: 'Music',
    youtubeUrl: 'https://www.youtube.com/results?search_query=soft+piano+music+for+coding',
  },
  {
    id: 'alpha',
    name: 'Binaural Alpha (10Hz)',
    category: 'Brainwave Entrainment',
    description: '10Hz alpha frequency beat tuned for deep focus, flow state and calm alertness.',
    icon: 'Brain',
    youtubeUrl: 'https://www.youtube.com/results?search_query=10hz+alpha+binaural+beats+study',
  },
];

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private currentMode: AmbientSoundMode = 'off';
  private masterGain: GainNode | null = null;
  private volumeLevel: number = 0.65; // Default master ambient volume 0.0 - 1.0
  private cleanupFns: (() => void)[] = [];
  private fadeTimer: ReturnType<typeof setTimeout> | null = null;

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volumeLevel = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.linearRampToValueAtTime(this.volumeLevel, now + 0.1);
      } catch {}
    }
  }

  public getVolume(): number {
    return this.volumeLevel;
  }

  public setMode(mode: AmbientSoundMode) {
    if (this.currentMode === mode) return;

    this.stopCurrent();
    this.currentMode = mode;

    switch (mode) {
      case 'lofi':
        this.startLofi();
        break;
      case 'rain-thunder':
        this.startRainThunder();
        break;
      case 'ambient':
        this.startAmbientElectronic();
        break;
      case 'nature':
        this.startNature();
        break;
      case 'piano':
        this.startPiano();
        break;
      case 'alpha':
        this.startAlpha();
        break;
      case 'off':
      default:
        break;
    }
  }

  public getMode(): AmbientSoundMode {
    return this.currentMode;
  }

  public stop() {
    this.setMode('off');
  }

  private stopCurrent() {
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }

    const currentGain = this.masterGain;
    const currentCleanups = [...this.cleanupFns];
    this.cleanupFns = [];

    if (currentGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        currentGain.gain.cancelScheduledValues(now);
        currentGain.gain.setValueAtTime(currentGain.gain.value, now);
        currentGain.gain.linearRampToValueAtTime(0.0001, now + 0.35);
      } catch {}
    }

    this.fadeTimer = setTimeout(() => {
      currentCleanups.forEach((fn) => {
        try {
          fn();
        } catch {}
      });
      if (currentGain) {
        try {
          currentGain.disconnect();
        } catch {}
      }
    }, 380);
  }

  private createMasterNode(ctx: AudioContext, targetGain: number = 1.0): GainNode {
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.linearRampToValueAtTime(this.volumeLevel * targetGain, now + 0.5);
    master.connect(ctx.destination);
    this.masterGain = master;
    return master;
  }

  private createPinkNoiseBuffer(ctx: AudioContext, seconds: number = 4): AudioBuffer {
    const bufferSize = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    let b0L = 0, b1L = 0, b2L = 0, b3L = 0, b4L = 0, b5L = 0, b6L = 0;
    let b0R = 0, b1R = 0, b2R = 0, b3R = 0, b4R = 0, b5R = 0, b6R = 0;

    for (let i = 0; i < bufferSize; i++) {
      const whiteL = Math.random() * 2 - 1;
      b0L = 0.99886 * b0L + whiteL * 0.0555179;
      b1L = 0.99332 * b1L + whiteL * 0.0750759;
      b2L = 0.96900 * b2L + whiteL * 0.1538520;
      b3L = 0.86650 * b3L + whiteL * 0.3104856;
      b4L = 0.55000 * b4L + whiteL * 0.5329522;
      b5L = -0.7616 * b5L - whiteL * 0.0168980;
      left[i] = (b0L + b1L + b2L + b3L + b4L + b5L + b6L + whiteL * 0.5362) * 0.08;
      b6L = whiteL * 0.115926;

      const whiteR = Math.random() * 2 - 1;
      b0R = 0.99886 * b0R + whiteR * 0.0555179;
      b1R = 0.99332 * b1R + whiteR * 0.0750759;
      b2R = 0.96900 * b2R + whiteR * 0.1538520;
      b3R = 0.86650 * b3R + whiteR * 0.3104856;
      b4R = 0.55000 * b4R + whiteR * 0.5329522;
      b5R = -0.7616 * b5R - whiteR * 0.0168980;
      right[i] = (b0R + b1R + b2R + b3R + b4R + b5R + b6R + whiteR * 0.5362) * 0.08;
      b6R = whiteR * 0.115926;
    }

    return buffer;
  }

  // 1. Rain and Thunder
  private startRainThunder() {
    const ctx = this.initContext();
    if (!ctx) return;

    const master = this.createMasterNode(ctx, 0.28);
    const now = ctx.currentTime;

    // Rain bed
    const noiseBuffer = this.createPinkNoiseBuffer(ctx, 4);
    const rainSource = ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(950, now);

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(140, now);

    rainSource.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(master);

    // Droplets texture
    const dropsFilter = ctx.createBiquadFilter();
    dropsFilter.type = 'bandpass';
    dropsFilter.frequency.setValueAtTime(2600, now);
    dropsFilter.Q.setValueAtTime(1.4, now);

    const dropsGain = ctx.createGain();
    dropsGain.gain.setValueAtTime(0.06, now);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, now);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.025, now);
    lfo.connect(lfoGain);
    lfoGain.connect(dropsGain.gain);

    rainSource.connect(dropsFilter);
    dropsFilter.connect(dropsGain);
    dropsGain.connect(master);

    rainSource.start();
    lfo.start();

    // Thunder generator
    let thunderTimer: ReturnType<typeof setTimeout> | null = null;
    let isRunning = true;

    const triggerThunder = () => {
      if (!isRunning || !this.ctx) return;
      const tNow = this.ctx.currentTime;

      // Deep rumble oscillator & noise
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(55, tNow);
      osc.frequency.exponentialRampToValueAtTime(32, tNow + 3.5);

      const thunderFilter = this.ctx.createBiquadFilter();
      thunderFilter.type = 'lowpass';
      thunderFilter.frequency.setValueAtTime(160, tNow);

      const thunderGain = this.ctx.createGain();
      thunderGain.gain.setValueAtTime(0.0001, tNow);
      thunderGain.gain.linearRampToValueAtTime(0.18, tNow + 0.4);
      thunderGain.gain.exponentialRampToValueAtTime(0.0001, tNow + 4.2);

      osc.connect(thunderFilter);
      thunderFilter.connect(thunderGain);
      thunderGain.connect(master);

      osc.start(tNow);
      osc.stop(tNow + 4.5);

      // Schedule next thunder between 18s and 30s
      const nextDelay = 18000 + Math.random() * 14000;
      thunderTimer = setTimeout(triggerThunder, nextDelay);
    };

    // First thunder in 8 seconds
    thunderTimer = setTimeout(triggerThunder, 8000);

    this.cleanupFns.push(() => {
      isRunning = false;
      if (thunderTimer) clearTimeout(thunderTimer);
      try {
        rainSource.stop();
        lfo.stop();
        rainSource.disconnect();
        lfo.disconnect();
        lfoGain.disconnect();
        dropsFilter.disconnect();
        dropsGain.disconnect();
        highpass.disconnect();
        lowpass.disconnect();
      } catch {}
    });
  }

  // 2. Lo-fi Hip Hop Beats
  private startLofi() {
    const ctx = this.initContext();
    if (!ctx) return;

    const master = this.createMasterNode(ctx, 0.22);
    let isRunning = true;
    let step = 0;
    const tempo = 72; // BPM
    const stepDuration = 60 / tempo / 4; // 16th note (~0.208s)

    // Gentle vinyl crackle
    const crackleBuffer = this.createPinkNoiseBuffer(ctx, 3);
    const crackleSource = ctx.createBufferSource();
    crackleSource.buffer = crackleBuffer;
    crackleSource.loop = true;

    const crackleFilter = ctx.createBiquadFilter();
    crackleFilter.type = 'bandpass';
    crackleFilter.frequency.setValueAtTime(1800, ctx.currentTime);
    crackleFilter.Q.setValueAtTime(1.0, ctx.currentTime);

    const crackleGain = ctx.createGain();
    crackleGain.gain.setValueAtTime(0.015, ctx.currentTime);

    crackleSource.connect(crackleFilter);
    crackleFilter.connect(crackleGain);
    crackleGain.connect(master);
    crackleSource.start();

    // Rhodes / Electric Piano jazzy chords (Dm9 -> G13 -> Cmaj9 -> Am9)
    const chords = [
      [146.83, 174.61, 220.0, 261.63, 329.63], // Dm9: D3, F3, A3, C4, E4
      [98.0, 174.61, 246.94, 329.63],          // G13: G2, F3, B3, E4
      [130.81, 164.81, 196.0, 246.94, 293.66], // Cmaj9: C3, E3, G3, B3, D4
      [110.0, 196.0, 261.63, 329.63, 493.88],  // Am9: A2, G3, C4, E4, B4
    ];

    let chordIndex = 0;

    const playRhodesChord = (notes: number[], time: number) => {
      notes.forEach((freq) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        // Soft chorus vibrato
        const vibrato = ctx.createOscillator();
        vibrato.frequency.setValueAtTime(0.35, time);
        const vibratoGain = ctx.createGain();
        vibratoGain.gain.setValueAtTime(0.8, time);
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        vibrato.start(time);
        vibrato.stop(time + stepDuration * 16);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, time);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.linearRampToValueAtTime(0.045, time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + stepDuration * 15.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(master);

        osc.start(time);
        osc.stop(time + stepDuration * 16);
      });
    };

    const playKick = (time: number, vol = 0.16) => {
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(125, time);
      osc.frequency.exponentialRampToValueAtTime(38, time + 0.11);
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
      osc.connect(gain);
      gain.connect(master);
      osc.start(time);
      osc.stop(time + 0.25);
    };

    const playSnare = (time: number) => {
      if (!ctx) return;
      // Soft lofi rim/snare
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.025));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1750, time);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.07, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.11);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      noise.start(time);
    };

    const playHihat = (time: number, vol = 0.015) => {
      if (!ctx) return;
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.01));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7000, time);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      noise.start(time);
    };

    const beatInterval = setInterval(() => {
      if (!isRunning || !ctx) return;
      const nowTime = ctx.currentTime;

      // Every 16 steps (1 bar), play chord
      if (step % 16 === 0) {
        playRhodesChord(chords[chordIndex % chords.length], nowTime);
        chordIndex++;
      }

      // Drum pattern (72 BPM chill boom bap)
      const barStep = step % 16;
      if (barStep === 0) playKick(nowTime, 0.18);
      if (barStep === 4) playSnare(nowTime);
      if (barStep === 8) playKick(nowTime, 0.13);
      if (barStep === 10) playKick(nowTime, 0.08); // Ghost kick
      if (barStep === 12) playSnare(nowTime);

      // Hihats on 8th notes
      if (barStep % 2 === 0) {
        playHihat(nowTime, barStep % 4 === 0 ? 0.022 : 0.012);
      }

      step++;
    }, stepDuration * 1000);

    this.cleanupFns.push(() => {
      isRunning = false;
      clearInterval(beatInterval);
      try {
        crackleSource.stop();
        crackleSource.disconnect();
        crackleFilter.disconnect();
        crackleGain.disconnect();
      } catch {}
    });
  }

  // 3. Ambient Electronic Music
  private startAmbientElectronic() {
    const ctx = this.initContext();
    if (!ctx) return;

    const master = this.createMasterNode(ctx, 0.18);
    let isRunning = true;

    // Atmospheric warm pad chords
    const padChords = [
      [87.31, 130.81, 164.81, 220.0, 261.63], // Fmaj7
      [110.0, 164.81, 196.0, 261.63, 329.63], // Am7
      [98.0, 146.83, 196.0, 261.63],          // Gsus4
      [82.41, 123.47, 164.81, 196.0, 293.66], // Em7
    ];

    let currentChordIdx = 0;

    const playPadVoice = () => {
      if (!isRunning || !ctx) return;
      const tNow = ctx.currentTime;
      const chord = padChords[currentChordIdx % padChords.length];
      currentChordIdx++;

      chord.forEach((freq, idx) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        // Gentle analog detuning
        osc.frequency.setValueAtTime(freq * (1 + (idx - 2) * 0.0015), tNow);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, tNow);
        filter.frequency.linearRampToValueAtTime(1400, tNow + 3.5);
        filter.frequency.linearRampToValueAtTime(600, tNow + 7.5);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, tNow);
        gain.gain.linearRampToValueAtTime(0.035, tNow + 2.0);
        gain.gain.linearRampToValueAtTime(0.0001, tNow + 7.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(master);

        osc.start(tNow);
        osc.stop(tNow + 8.0);
      });
    };

    // Shimmer chime notes (pentatonic bells)
    const pentatonic = [523.25, 659.25, 783.99, 880.0, 1046.5];
    const playShimmer = () => {
      if (!isRunning || !ctx) return;
      const sNow = ctx.currentTime;
      const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, sNow);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, sNow);
      gain.gain.linearRampToValueAtTime(0.02, sNow + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, sNow + 2.8);

      osc.connect(gain);
      gain.connect(master);
      osc.start(sNow);
      osc.stop(sNow + 3.0);
    };

    playPadVoice();
    const padInterval = setInterval(playPadVoice, 6800);
    const chimeInterval = setInterval(playShimmer, 3400);

    this.cleanupFns.push(() => {
      isRunning = false;
      clearInterval(padInterval);
      clearInterval(chimeInterval);
    });
  }

  // 4. Nature Sounds (Flowing Water, Forest Wind, Distant Birds)
  private startNature() {
    const ctx = this.initContext();
    if (!ctx) return;

    const master = this.createMasterNode(ctx, 0.22);
    const now = ctx.currentTime;
    let isRunning = true;

    // Stream noise buffer
    const streamBuffer = this.createPinkNoiseBuffer(ctx, 4);
    const streamSource = ctx.createBufferSource();
    streamSource.buffer = streamBuffer;
    streamSource.loop = true;

    // Water flow filter
    const flowFilter = ctx.createBiquadFilter();
    flowFilter.type = 'bandpass';
    flowFilter.frequency.setValueAtTime(750, now);
    flowFilter.Q.setValueAtTime(0.8, now);

    // Flowing water ripple modulation
    const lfo1 = ctx.createOscillator();
    lfo1.frequency.setValueAtTime(0.38, now);
    const lfo1Gain = ctx.createGain();
    lfo1Gain.gain.setValueAtTime(180, now);
    lfo1.connect(lfo1Gain);
    lfo1Gain.connect(flowFilter.frequency);

    const streamGain = ctx.createGain();
    streamGain.gain.setValueAtTime(0.12, now);

    streamSource.connect(flowFilter);
    flowFilter.connect(streamGain);
    streamGain.connect(master);

    streamSource.start();
    lfo1.start();

    // Gentle wind breeze
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(320, now);

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.07, now);

    const windLfo = ctx.createOscillator();
    windLfo.frequency.setValueAtTime(0.12, now);
    const windLfoGain = ctx.createGain();
    windLfoGain.gain.setValueAtTime(140, now);
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windFilter.frequency);

    streamSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(master);
    windLfo.start();

    // Bird song chirper
    let birdTimer: ReturnType<typeof setTimeout> | null = null;
    const chirpBird = () => {
      if (!isRunning || !this.ctx) return;
      const bNow = this.ctx.currentTime;
      const baseFreq = 2400 + Math.random() * 800;

      // Two quick chirps
      for (let i = 0; i < 2; i++) {
        const offset = i * 0.12;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, bNow + offset);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, bNow + offset + 0.04);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, bNow + offset + 0.08);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.0001, bNow + offset);
        gain.gain.linearRampToValueAtTime(0.022, bNow + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, bNow + offset + 0.09);

        osc.connect(gain);
        gain.connect(master);
        osc.start(bNow + offset);
        osc.stop(bNow + offset + 0.1);
      }

      // Next bird chirp in 5s - 11s
      birdTimer = setTimeout(chirpBird, 5000 + Math.random() * 6000);
    };

    birdTimer = setTimeout(chirpBird, 3500);

    this.cleanupFns.push(() => {
      isRunning = false;
      if (birdTimer) clearTimeout(birdTimer);
      try {
        streamSource.stop();
        lfo1.stop();
        windLfo.stop();
        streamSource.disconnect();
        lfo1.disconnect();
        windLfo.disconnect();
        flowFilter.disconnect();
        windFilter.disconnect();
        streamGain.disconnect();
        windGain.disconnect();
      } catch {}
    });
  }

  // 5. Soft Piano Music
  private startPiano() {
    const ctx = this.initContext();
    if (!ctx) return;

    const master = this.createMasterNode(ctx, 0.22);
    let isRunning = true;

    // Neoclassical calm piano notes & chords (C, G/B, Am, F)
    const progression = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [246.94, 293.66, 392.0, 440.0],  // G/B
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [174.61, 261.63, 329.63, 349.23], // Fmaj7
    ];

    const playPianoNote = (freq: number, time: number, vol = 0.06) => {
      if (!ctx) return;

      // Layered partials for acoustic piano timbre
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, time);
      osc2.frequency.setValueAtTime(freq * 2, time);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, time);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(vol, time + 0.008); // Acoustic hammer strike
      gain.gain.exponentialRampToValueAtTime(vol * 0.35, time + 0.3); // Decay
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 2.8); // Resonance ring

      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(vol * 0.3, time);
      gain2.gain.exponentialRampToValueAtTime(0.0001, time + 1.2);

      osc1.connect(filter);
      osc2.connect(gain2);
      gain2.connect(filter);
      filter.connect(gain);
      gain.connect(master);

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + 3.0);
      osc2.stop(time + 1.4);
    };

    let pChordIdx = 0;
    let pNoteIdx = 0;

    const pianoInterval = setInterval(() => {
      if (!isRunning || !ctx) return;
      const tNow = ctx.currentTime;
      const chord = progression[pChordIdx % progression.length];

      // Arpeggiate through chord notes
      const noteFreq = chord[pNoteIdx % chord.length];
      playPianoNote(noteFreq, tNow, pNoteIdx === 0 ? 0.075 : 0.045);

      pNoteIdx++;
      if (pNoteIdx % chord.length === 0) {
        pChordIdx++;
      }
    }, 1400);

    this.cleanupFns.push(() => {
      isRunning = false;
      clearInterval(pianoInterval);
    });
  }

  // 6. Binaural Alpha Waves (10Hz focus beat)
  private startAlpha() {
    const ctx = this.initContext();
    if (!ctx) return;

    const master = this.createMasterNode(ctx, 0.16);
    const now = ctx.currentTime;

    const carrier = 200;
    const beat = 10;

    const oscLeft = ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(carrier, now);

    const oscRight = ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(carrier + beat, now);

    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(carrier / 2, now);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.035, now);
    subOsc.connect(subGain);
    subGain.connect(master);

    if (typeof ctx.createStereoPanner === 'function') {
      const pannerLeft = ctx.createStereoPanner();
      pannerLeft.pan.setValueAtTime(-1, now);
      const gainLeft = ctx.createGain();
      gainLeft.gain.setValueAtTime(0.08, now);
      oscLeft.connect(gainLeft);
      gainLeft.connect(pannerLeft);
      pannerLeft.connect(master);

      const pannerRight = ctx.createStereoPanner();
      pannerRight.pan.setValueAtTime(1, now);
      const gainRight = ctx.createGain();
      gainRight.gain.setValueAtTime(0.08, now);
      oscRight.connect(gainRight);
      gainRight.connect(pannerRight);
      pannerRight.connect(master);
    } else {
      const merger = ctx.createChannelMerger(2);
      const gainLeft = ctx.createGain();
      gainLeft.gain.setValueAtTime(0.08, now);
      oscLeft.connect(gainLeft);
      gainLeft.connect(merger, 0, 0);

      const gainRight = ctx.createGain();
      gainRight.gain.setValueAtTime(0.08, now);
      oscRight.connect(gainRight);
      gainRight.connect(merger, 0, 1);

      merger.connect(master);
    }

    const noiseBuffer = this.createPinkNoiseBuffer(ctx, 3);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(320, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.018, now);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);

    oscLeft.start();
    oscRight.start();
    subOsc.start();
    noiseSource.start();

    this.cleanupFns.push(() => {
      try {
        oscLeft.stop();
        oscRight.stop();
        subOsc.stop();
        noiseSource.stop();
        oscLeft.disconnect();
        oscRight.disconnect();
        subOsc.disconnect();
        subGain.disconnect();
        noiseSource.disconnect();
        noiseFilter.disconnect();
        noiseGain.disconnect();
      } catch {}
    });
  }
}

// Singleton instance
export const ambientSound = new AmbientSoundEngine();
