import { useState, useEffect } from 'react';
import { useAppState } from '../store/useAppState';

interface AdaptiveSettings {
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  hintsEnabled: boolean;
  encouragementFrequency: number;
}

interface FrustrationSignals {
  rapidClicks: number;
  timeOnTask: number;
  consecutiveErrors: number;
  idleTime: number;
}

export const useIntelligenceEngine = () => {
  const { errors, frustrationLevel, lastInteraction, difficulty } = useAppState();
  const [adaptiveSettings, setAdaptiveSettings] = useState<AdaptiveSettings>({
    difficulty: 'easy',
    timeLimit: 30,
    hintsEnabled: true,
    encouragementFrequency: 3
  });
  
  const [frustrationSignals, setFrustrationSignals] = useState<FrustrationSignals>({
    rapidClicks: 0,
    timeOnTask: 0,
    consecutiveErrors: errors,
    idleTime: 0
  });

  const [recommendations, setRecommendations] = useState<string[]>([]);

  // Analyze frustration patterns
  useEffect(() => {
    const analyzeFrustration = () => {
      const signals = frustrationSignals;
      const newRecommendations: string[] = [];

      // Check for rapid clicking (indicates frustration)
      if (signals.rapidClicks > 5) {
        newRecommendations.push('Take a calm break');
        setAdaptiveSettings(prev => ({
          ...prev,
          hintsEnabled: true,
          encouragementFrequency: 2
        }));
      }

      // Check for consecutive errors
      if (signals.consecutiveErrors >= 3) {
        newRecommendations.push('Reduce difficulty');
        setAdaptiveSettings(prev => ({
          ...prev,
          difficulty: 'easy',
          timeLimit: 45,
          hintsEnabled: true
        }));
      }

      // Check for extended idle time
      if (signals.idleTime > 60) {
        newRecommendations.push('Re-engage with simpler task');
      }

      // Check for extended time on task
      if (signals.timeOnTask > 300) { // 5 minutes
        newRecommendations.push('Suggest break');
      }

      setRecommendations(newRecommendations);
    };

    analyzeFrustration();
  }, [frustrationSignals]);

  // Update frustration signals based on app state
  useEffect(() => {
    setFrustrationSignals(prev => ({
      ...prev,
      consecutiveErrors: errors
    }));
  }, [errors]);

  // Intelligence engine methods
  const adaptDifficulty = (performance: number) => {
    let newDifficulty = difficulty;
    
    if (performance > 0.9) {
      newDifficulty = 'hard';
    } else if (performance > 0.7) {
      newDifficulty = 'medium';
    } else {
      newDifficulty = 'easy';
    }

    setAdaptiveSettings(prev => ({
      ...prev,
      difficulty: newDifficulty,
      timeLimit: newDifficulty === 'easy' ? 45 : newDifficulty === 'medium' ? 30 : 20
    }));
  };

  const detectFrustration = (interactionType: 'click' | 'drag' | 'idle') => {
    const now = Date.now();
    const timeSinceLastInteraction = lastInteraction ? now - lastInteraction.getTime() : 0;

    switch (interactionType) {
      case 'click':
        setFrustrationSignals(prev => ({
          ...prev,
          rapidClicks: prev.rapidClicks + 1,
          idleTime: 0
        }));
        break;
      case 'drag':
        setFrustrationSignals(prev => ({
          ...prev,
          rapidClicks: 0,
          idleTime: 0
        }));
        break;
      case 'idle':
        setFrustrationSignals(prev => ({
          ...prev,
          idleTime: timeSinceLastInteraction / 1000
        }));
        break;
    }
  };

  const generateEncouragement = (): string => {
    const encouragements = [
      "You're doing great! 🌟",
      "Keep trying! 💪",
      "Almost there! 🎯",
      "You've got this! ✨",
      "Great effort! 🏆",
      "You're learning so well! 📚",
      "Fantastic progress! 🚀",
      "You're amazing! 🌈"
    ];
    
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  };

  const shouldShowCalmBreak = (): boolean => {
    return frustrationLevel >= 4 || 
           frustrationSignals.consecutiveErrors >= 3 ||
           frustrationSignals.rapidClicks > 5;
  };

  const shouldShowHint = (): boolean => {
    return adaptiveSettings.hintsEnabled && 
           (errors >= 2 || frustrationSignals.timeOnTask > 60);
  };

  const getPersonalizedContent = (childName: string) => {
    const personalizations = [
      `Great job, ${childName}! 🎉`,
      `${childName}, you're a star! ⭐`,
      `Way to go, ${childName}! 🎊`,
      `${childName}, you're amazing! 🌟`,
      `Keep it up, ${childName}! 💫`
    ];
    
    return personalizations[Math.floor(Math.random() * personalizations.length)];
  };

  return {
    adaptiveSettings,
    frustrationSignals,
    recommendations,
    adaptDifficulty,
    detectFrustration,
    generateEncouragement,
    shouldShowCalmBreak,
    shouldShowHint,
    getPersonalizedContent
  };
};