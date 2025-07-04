interface PhonemeData {
  id: string;
  phoneme: string;
  name: string;
  words: string[];
  images: string[];
  audio: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prerequisites: string[];
}

interface Level {
  id: string;
  name: string;
  phonemes: string[];
  objective: string;
  difficulty: 'easy' | 'medium' | 'hard';
  minAccuracy: number;
  unlockCriteria: string[];
}

class ContentManager {
  private phonemes: PhonemeData[] = [];
  private levels: Level[] = [];

  constructor() {
    this.initializeContent();
  }

  private initializeContent() {
    // Initialize phoneme data
    this.phonemes = [
      {
        id: 'a',
        phoneme: 'A',
        name: 'Letter A',
        words: ['Apple', 'Ant', 'Alligator', 'Airplane'],
        images: ['🍎', '🐜', '🐊', '✈️'],
        audio: '/sounds/phonemes/a.mp3',
        difficulty: 'easy',
        prerequisites: []
      },
      {
        id: 'b',
        phoneme: 'B',
        name: 'Letter B',
        words: ['Ball', 'Bear', 'Banana', 'Butterfly'],
        images: ['⚽', '🐻', '🍌', '🦋'],
        audio: '/sounds/phonemes/b.mp3',
        difficulty: 'easy',
        prerequisites: []
      },
      {
        id: 'c',
        phoneme: 'C',
        name: 'Letter C',
        words: ['Cat', 'Car', 'Cookie', 'Castle'],
        images: ['🐱', '🚗', '🍪', '🏰'],
        audio: '/sounds/phonemes/c.mp3',
        difficulty: 'easy',
        prerequisites: []
      },
      {
        id: 'd',
        phoneme: 'D',
        name: 'Letter D',
        words: ['Dog', 'Duck', 'Drum', 'Dragon'],
        images: ['🐕', '🦆', '🥁', '🐉'],
        audio: '/sounds/phonemes/d.mp3',
        difficulty: 'easy',
        prerequisites: ['a', 'b', 'c']
      },
      {
        id: 'e',
        phoneme: 'E',
        name: 'Letter E',
        words: ['Elephant', 'Egg', 'Eagle', 'Engine'],
        images: ['🐘', '🥚', '🦅', '🚂'],
        audio: '/sounds/phonemes/e.mp3',
        difficulty: 'easy',
        prerequisites: ['a', 'b', 'c', 'd']
      },
      // Add more phonemes as needed
    ];

    // Initialize levels
    this.levels = [
      {
        id: 'level-1',
        name: 'First Letters',
        phonemes: ['a', 'b', 'c'],
        objective: 'Learn the first three letters of the alphabet',
        difficulty: 'easy',
        minAccuracy: 70,
        unlockCriteria: []
      },
      {
        id: 'level-2',
        name: 'More Letters',
        phonemes: ['d', 'e'],
        objective: 'Learn letters D and E',
        difficulty: 'easy',
        minAccuracy: 75,
        unlockCriteria: ['level-1']
      },
      {
        id: 'level-3',
        name: 'Letter Review',
        phonemes: ['a', 'b', 'c', 'd', 'e'],
        objective: 'Review all learned letters',
        difficulty: 'medium',
        minAccuracy: 80,
        unlockCriteria: ['level-2']
      }
    ];
  }

  getPhoneme(id: string): PhonemeData | undefined {
    return this.phonemes.find(p => p.id === id);
  }

  getPhonemesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): PhonemeData[] {
    return this.phonemes.filter(p => p.difficulty === difficulty);
  }

  getLevel(id: string): Level | undefined {
    return this.levels.find(l => l.id === id);
  }

  getAvailableLevels(completedLevels: string[]): Level[] {
    return this.levels.filter(level => {
      // Check if all prerequisites are met
      return level.unlockCriteria.every(criteria => 
        completedLevels.includes(criteria)
      );
    });
  }

  getNextLevel(currentLevelId: string): Level | undefined {
    const currentIndex = this.levels.findIndex(l => l.id === currentLevelId);
    if (currentIndex === -1 || currentIndex === this.levels.length - 1) {
      return undefined;
    }
    return this.levels[currentIndex + 1];
  }

  generateAdaptiveContent(
    difficulty: 'easy' | 'medium' | 'hard',
    masteredPhonemes: string[],
    strugglingPhonemes: string[]
  ): PhonemeData[] {
    let candidates = this.getPhonemesByDifficulty(difficulty);
    
    // Filter out mastered phonemes for advanced difficulty
    if (difficulty === 'hard') {
      candidates = candidates.filter(p => !masteredPhonemes.includes(p.id));
    }
    
    // Prioritize struggling phonemes
    if (strugglingPhonemes.length > 0) {
      const strugglingContent = candidates.filter(p => 
        strugglingPhonemes.includes(p.id)
      );
      if (strugglingContent.length > 0) {
        return strugglingContent.slice(0, 3);
      }
    }
    
    // Return a mix of new and review content
    const newContent = candidates.filter(p => 
      !masteredPhonemes.includes(p.id) && 
      !strugglingPhonemes.includes(p.id)
    );
    
    const reviewContent = candidates.filter(p => 
      masteredPhonemes.includes(p.id)
    );
    
    const result = [
      ...newContent.slice(0, 2),
      ...reviewContent.slice(0, 1)
    ];
    
    return result.slice(0, 3);
  }

  getRandomWord(phonemeId: string): { word: string; image: string } | undefined {
    const phoneme = this.getPhoneme(phonemeId);
    if (!phoneme || phoneme.words.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * phoneme.words.length);
    return {
      word: phoneme.words[randomIndex],
      image: phoneme.images[randomIndex] || '❓'
    };
  }

  validatePrerequisites(phonemeId: string, completedPhonemes: string[]): boolean {
    const phoneme = this.getPhoneme(phonemeId);
    if (!phoneme) return false;
    
    return phoneme.prerequisites.every(req => 
      completedPhonemes.includes(req)
    );
  }

  getProgressPercentage(completedPhonemes: string[]): number {
    if (this.phonemes.length === 0) return 0;
    return Math.round((completedPhonemes.length / this.phonemes.length) * 100);
  }

  getRecommendations(
    accuracy: number,
    completedPhonemes: string[],
    strugglingPhonemes: string[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (accuracy < 70) {
      recommendations.push('Consider reviewing basic phonemes');
      recommendations.push('Take more time with each sound');
    }
    
    if (strugglingPhonemes.length > 3) {
      recommendations.push('Focus on fewer phonemes at a time');
      recommendations.push('Practice struggling sounds more frequently');
    }
    
    if (completedPhonemes.length > 10 && accuracy > 90) {
      recommendations.push('Ready for more challenging content');
      recommendations.push('Consider blending sounds together');
    }
    
    return recommendations;
  }
}

export const contentManager = new ContentManager();