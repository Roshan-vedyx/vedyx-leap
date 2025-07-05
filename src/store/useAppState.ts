import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // User data
  childName: string;
  selectedAvatar: string;
  soundEnabled: boolean;
  accent: 'us' | 'uk' | 'in';
  
  // Game state
  currentLevel: number;
  progress: number;
  errors: number;
  streak: number;
  
  // Mood tracking
  frustrationLevel: number;
  lastInteraction: Date | null;
  
  // Settings
  theme: 'light' | 'dark';
  difficulty: 'easy' | 'medium' | 'hard';
  
  // Actions
  setChildName: (name: string) => void;
  setSelectedAvatar: (avatar: string) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setAccent: (accent: 'us' | 'uk' | 'in') => void;
  setCurrentLevel: (level: number) => void;
  incrementProgress: () => void;
  logError: () => void;
  resetStreak: () => void;
  incrementStreak: () => void;
  setFrustrationLevel: (level: number) => void;
  updateLastInteraction: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  resetGameState: () => void;
}

export const useAppState = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      childName: '',
      selectedAvatar: '',
      soundEnabled: true,
      accent: 'us',
      currentLevel: 1,
      progress: 0,
      errors: 0,
      streak: 0,
      frustrationLevel: 0,
      lastInteraction: null,
      theme: 'light',
      difficulty: 'easy',
      
      // Actions
      setChildName: (name) => set({ childName: name }),
      setSelectedAvatar: (avatar) => set({ selectedAvatar: avatar }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setAccent: (accent) => set({ accent }),
      setCurrentLevel: (level) => set({ currentLevel: level }),
      
      incrementProgress: () => set((state) => ({ 
        progress: state.progress + 1,
        errors: 0, // Reset errors on success
        lastInteraction: new Date()
      })),
      
      logError: () => set((state) => ({ 
        errors: state.errors + 1,
        frustrationLevel: Math.min(state.frustrationLevel + 1, 5),
        lastInteraction: new Date()
      })),
      
      resetStreak: () => set({ streak: 0 }),
      incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
      
      setFrustrationLevel: (level) => set({ frustrationLevel: level }),
      updateLastInteraction: () => set({ lastInteraction: new Date() }),
      
      setTheme: (theme) => set({ theme }),
      setDifficulty: (difficulty) => set({ difficulty }),
      
      resetGameState: () => set({
        currentLevel: 1,
        progress: 0,
        errors: 0,
        streak: 0,
        frustrationLevel: 0,
        lastInteraction: null,
      }),
    }),
    {
      name: 'vedyx-leap-storage',
      partialize: (state) => ({
        childName: state.childName,
        selectedAvatar: state.selectedAvatar,
        soundEnabled: state.soundEnabled,
        accent: state.accent,
        currentLevel: state.currentLevel,
        progress: state.progress,
        streak: state.streak,
        theme: state.theme,
        difficulty: state.difficulty,
      }),
    }
  )
);