interface PhonemeData {
  id: string;
  phoneme: string;
  grapheme: string;
  words: { word: string; emoji: string; emojiName: string; audio: { us: string; uk: string; in: string } }[];
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

import phonemes from '../assets/content/phonemes.json';

class ContentManager {
  private phonemes: PhonemeData[] = [];
  private levels: Level[] = [];

  constructor() {
    this.initializeContent();
  }

  private initializeContent() {
    this.phonemes = phonemes.map(phoneme => ({
      ...phoneme,
      difficulty: phoneme.phoneme.length <= 3 ? 'easy' : phoneme.phoneme.length <= 5 ? 'medium' : 'hard',
      prerequisites: []
    }));

    this.levels = [
      {
        id: 'level-1',
        name: 'First Letters',
        phonemes: ['1', '2', '3', '4', '5'], // Use phoneme IDs
        objective: 'Learn basic consonant sounds',
        difficulty: 'easy',
        minAccuracy: 70,
        unlockCriteria: []
      },
      {
        id: 'level-2',
        name: 'More Consonants',
        phonemes: ['6', '7', '8', '9', '10'],
        objective: 'Learn additional consonant sounds',
        difficulty: 'easy',
        minAccuracy: 75,
        unlockCriteria: ['level-1']
      },
      {
        id: 'level-3',
        name: 'Vowel Introduction',
        phonemes: ['11', '12', '13', '14', '15'],
        objective: 'Learn basic vowel sounds',
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
    return this.levels.filter(level =>
      level.unlockCriteria.every(criteria => completedLevels.includes(criteria))
    );
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
    
    if (difficulty === 'hard') {
      candidates = candidates.filter(p => !masteredPhonemes.includes(p.phoneme));
    }
    
    if (strugglingPhonemes.length > 0) {
      const strugglingContent = candidates.filter(p => strugglingPhonemes.includes(p.phoneme));
      if (strugglingContent.length > 0) {
        return strugglingContent.slice(0, 3);
      }
    }
    
    const newContent = candidates.filter(p => 
      !masteredPhonemes.includes(p.phoneme) && !strugglingPhonemes.includes(p.phoneme)
    );
    
    const reviewContent = candidates.filter(p => masteredPhonemes.includes(p.phoneme));
    
    return [...newContent.slice(0, 2), ...reviewContent.slice(0, 1)].slice(0, 3);
  }

  getRandomWord(phonemeId: string, accent: 'us' | 'uk' | 'in'): { word: string; emoji: string; audio: string } | undefined {
    const phoneme = this.getPhoneme(phonemeId);
    if (!phoneme || phoneme.words.length === 0) {
      console.warn(`No phoneme or words found for ID: ${phonemeId}`);
      return undefined;
    }
    const randomIndex = Math.floor(Math.random() * phoneme.words.length);
    return {
      word: phoneme.words[randomIndex].word,
      emoji: phoneme.words[randomIndex].emoji,
      audio: phoneme.words[randomIndex].audio[accent]
    };
  }

  validatePrerequisites(phonemeId: string, completedPhonemes: string[]): boolean {
    const phoneme = this.getPhoneme(phonemeId);
    if (!phoneme) return false;
    
    return phoneme.prerequisites.every(req => completedPhonemes.includes(req));
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