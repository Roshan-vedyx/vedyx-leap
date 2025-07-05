class AudioManager {
  private audioContext: AudioContext | null = null;
  private soundCache: Map<string, AudioBuffer> = new Map();
  private isEnabled: boolean = true;
  private currentAccent: 'us' | 'uk' | 'in' = 'us';
  private isInitialized: boolean = false;

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
      
      // Add event listeners for audio context state changes
      this.audioContext.addEventListener('statechange', () => {
        console.log('AudioContext state changed to:', this.audioContext?.state);
      });
      
    } catch (error) {
      console.warn('Web Audio API not supported', error);
      this.isInitialized = false;
    }
  }

  setAccent(accent: 'us' | 'uk' | 'in') {
    this.currentAccent = accent;
  }

  async loadSound(url: string): Promise<AudioBuffer | null> {
    if (!this.audioContext || !this.isInitialized) {
      console.warn('AudioContext not initialized');
      return null;
    }

    if (this.soundCache.has(url)) {
      return this.soundCache.get(url)!;
    }

    try {
      // Ensure audio context is running
      await this.resumeAudioContext();
      
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
    if (!this.isEnabled || !this.audioContext || !this.isInitialized) {
      console.warn('Audio not enabled or context not initialized');
      return;
    }

    try {
      // Always resume audio context before playing
      await this.resumeAudioContext();
      
      const url = typeof audioPaths === 'string' ? audioPaths : audioPaths[this.currentAccent];
      if (!url) {
        console.error(`No audio URL for ${typeof audioPaths === 'string' ? 'sound' : 'accent ' + this.currentAccent}`);
        return;
      }

      const audioBuffer = await this.loadSound(url);
      if (!audioBuffer) {
        console.error('Failed to load audio buffer for:', url);
        return;
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = audioBuffer;
      source.loop = options.loop || false;
      gainNode.gain.setValueAtTime(options.volume || 0.5, this.audioContext.currentTime);

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start();
      console.log('Audio played successfully:', url);
      
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  }

  async playPhonemeSound(audioPaths: { us: string; uk: string; in: string }): Promise<void> {
    console.log('Playing phoneme sound for accent:', this.currentAccent, 'paths:', audioPaths);
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
    console.log('Audio enabled:', enabled);
  }

  isAudioEnabled(): boolean {
    return this.isEnabled;
  }

  async resumeAudioContext(): Promise<void> {
    if (!this.audioContext) return;
    
    try {
      if (this.audioContext.state === 'suspended') {
        console.log('Resuming suspended AudioContext...');
        await this.audioContext.resume();
        console.log('AudioContext resumed, state:', this.audioContext.state);
      }
    } catch (error) {
      console.error('Failed to resume AudioContext:', error);
    }
  }

  async preloadSounds(audioPaths: { us: string; uk: string; in: string }[]): Promise<void> {
    const soundsToPreload = audioPaths
      .map(paths => paths[this.currentAccent])
      .filter(url => url && url !== '/sounds/success.mp3' && url !== '/sounds/error.mp3');
    
    console.log('Preloading sounds:', soundsToPreload);
    
    const loadPromises = soundsToPreload.map(async (url) => {
      try {
        await this.loadSound(url);
        console.log('Preloaded:', url);
      } catch (error) {
        console.error('Failed to preload:', url, error);
      }
    });
    
    await Promise.allSettled(loadPromises);
  }

  // Method to test audio functionality
  async testAudio(): Promise<boolean> {
    try {
      if (!this.audioContext) {
        console.error('AudioContext not available');
        return false;
      }
      
      await this.resumeAudioContext();
      
      // Create a simple test tone
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.1);
      
      console.log('Audio test successful');
      return true;
    } catch (error) {
      console.error('Audio test failed:', error);
      return false;
    }
  }

  // Get current audio context state
  getAudioContextState(): string {
    return this.audioContext?.state || 'not initialized';
  }

  // Debug method to check what's cached
  getCachedSounds(): string[] {
    return Array.from(this.soundCache.keys());
  }
}

export const audioManager = new AudioManager();

// Add global click handler to resume audio context on first user interaction
document.addEventListener('click', async () => {
  await audioManager.resumeAudioContext();
}, { once: true });

// Also add for touch events on mobile
document.addEventListener('touchstart', async () => {
  await audioManager.resumeAudioContext();
}, { once: true });