class AudioManager {
  private audioContext: AudioContext | null = null;
  private soundCache: Map<string, AudioBuffer> = new Map();
  private isEnabled: boolean = true;

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported', error);
    }
  }

  async loadSound(url: string): Promise<AudioBuffer | null> {
    if (!this.audioContext) return null;

    // Check cache first
    if (this.soundCache.has(url)) {
      return this.soundCache.get(url)!;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.soundCache.set(url, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.warn(`Failed to load sound: ${url}`, error);
      return null;
    }
  }

  async playSound(url: string, options: { volume?: number; loop?: boolean } = {}): Promise<void> {
    if (!this.isEnabled || !this.audioContext) return;

    const audioBuffer = await this.loadSound(url);
    if (!audioBuffer) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = audioBuffer;
    source.loop = options.loop || false;
    gainNode.gain.setValueAtTime(options.volume || 0.5, this.audioContext.currentTime);

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start();
  }

  async playPhonemeSound(phoneme: string): Promise<void> {
    const phonemeUrls: Record<string, string> = {
      'A': '/sounds/phonemes/a.mp3',
      'B': '/sounds/phonemes/b.mp3',
      'C': '/sounds/phonemes/c.mp3',
      'D': '/sounds/phonemes/d.mp3',
      'E': '/sounds/phonemes/e.mp3',
      'F': '/sounds/phonemes/f.mp3',
      'G': '/sounds/phonemes/g.mp3',
      'H': '/sounds/phonemes/h.mp3',
      'I': '/sounds/phonemes/i.mp3',
      'J': '/sounds/phonemes/j.mp3',
      'K': '/sounds/phonemes/k.mp3',
      'L': '/sounds/phonemes/l.mp3',
      'M': '/sounds/phonemes/m.mp3',
      'N': '/sounds/phonemes/n.mp3',
      'O': '/sounds/phonemes/o.mp3',
      'P': '/sounds/phonemes/p.mp3',
      'Q': '/sounds/phonemes/q.mp3',
      'R': '/sounds/phonemes/r.mp3',
      'S': '/sounds/phonemes/s.mp3',
      'T': '/sounds/phonemes/t.mp3',
      'U': '/sounds/phonemes/u.mp3',
      'V': '/sounds/phonemes/v.mp3',
      'W': '/sounds/phonemes/w.mp3',
      'X': '/sounds/phonemes/x.mp3',
      'Y': '/sounds/phonemes/y.mp3',
      'Z': '/sounds/phonemes/z.mp3'
    };

    const url = phonemeUrls[phoneme.toUpperCase()];
    if (url) {
      await this.playSound(url);
    }
  }

  async playSuccessSound(): Promise<void> {
    await this.playSound('/sounds/success.mp3', { volume: 0.6 });
  }

  async playErrorSound(): Promise<void> {
    await this.playSound('/sounds/error.mp3', { volume: 0.3 });
  }

  async playWelcomeSound(): Promise<void> {
    await this.playSound('/sounds/welcome.mp3', { volume: 0.5 });
  }

  async playBackgroundMusic(loop: boolean = true): Promise<void> {
    await this.playSound('/sounds/background.mp3', { volume: 0.2, loop });
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  isAudioEnabled(): boolean {
    return this.isEnabled;
  }

  // Resume audio context on user interaction (required by many browsers)
  async resumeAudioContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Preload commonly used sounds
  async preloadSounds(): Promise<void> {
    const soundsToPreload = [
      '/sounds/success.mp3',
      '/sounds/error.mp3',
      '/sounds/welcome.mp3',
      '/sounds/phonemes/a.mp3',
      '/sounds/phonemes/b.mp3',
      '/sounds/phonemes/c.mp3'
    ];

    await Promise.all(soundsToPreload.map(url => this.loadSound(url)));
  }
}

export const audioManager = new AudioManager();