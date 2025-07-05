class AudioManager {
  private audioContext: AudioContext | null = null;
  private soundCache: Map<string, AudioBuffer> = new Map();
  private isEnabled: boolean = true;
  private currentAccent: 'us' | 'uk' | 'in' = 'us';

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

  setAccent(accent: 'us' | 'uk' | 'in') {
    this.currentAccent = accent;
  }

  async loadSound(url: string): Promise<AudioBuffer | null> {
    if (!this.audioContext) {
      console.warn('AudioContext not initialized');
      return null;
    }

    if (this.soundCache.has(url)) {
      return this.soundCache.get(url)!;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Failed to fetch audio file: ${url}, status: ${response.status}`);
        return null;
      }
      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength === 0) {
        console.error(`Empty audio file: ${url}`);
        return null;
      }
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.soundCache.set(url, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.error(`Failed to load sound: ${url}`, error);
      return null;
    }
  }

  async playSound(audioPaths: { us: string; uk: string; in: string } | string, options: { volume?: number; loop?: boolean } = {}): Promise<void> {
    if (!this.isEnabled || !this.audioContext) return;

    const url = typeof audioPaths === 'string' ? audioPaths : audioPaths[this.currentAccent];
    if (!url) {
      console.error(`No audio URL for ${typeof audioPaths === 'string' ? 'sound' : 'accent ' + this.currentAccent}`);
      return;
    }

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

  async playPhonemeSound(audioPaths: { us: string; uk: string; in: string }): Promise<void> {
    await this.playSound(audioPaths);
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

  async resumeAudioContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  async preloadSounds(audioPaths: { us: string; uk: string; in: string }[]): Promise<void> {
    const soundsToPreload = audioPaths
      .map(paths => paths[this.currentAccent])
      .filter(url => url && url !== '/sounds/success.mp3' && url !== '/sounds/error.mp3');
    await Promise.all(soundsToPreload.map(url => this.loadSound(url)));
  }
}

export const audioManager = new AudioManager();