import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Star, Eye, Coffee, Calendar, Heart, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppState } from '../../store/useAppState';
import { audioManager } from '../../utils/audioManager';
import Day1Intro from './days/Day1Intro';
import Day2Discrimination from './days/Day2Discrimination';
import Day3MouthMovement from './days/Day3MouthMovement';
import Day4GraphemeMatch from './days/Day4GraphemeMatch';
import Day5BlendingPractice from './days/Day5BlendingPractice';
import Day6SoundSorting from './days/Day6SoundSorting';
import Day7WritingPractice from './days/Day7WritingPractice';
import ProgressIndicator from './shared/ProgressIndicator';
import CalmBreak from '../CalmBreak';

interface Phoneme {
  id: string;
  phoneme: string;
  grapheme: string;
  words: PhonemeWord[];
}

interface PhonemeWord {
  word: string;
  emoji: string;
  emojiName: string;
  audio: {
    us: string;
    uk: string;
    in: string;
  };
  image: string;
}

interface DayActivity {
  day: number;
  title: string;
  subtitle: string;
  type: 'introduction' | 'discrimination' | 'production' | 'matching' | 'blending' | 'sorting' | 'writing';
  icon: string;
  color: string;
  completed?: boolean;
}

interface DayComponentProps {
  phoneme: Phoneme;
  phonemes: Phoneme[];
  audioManager: typeof audioManager;
  onComplete: () => void;
  onNeedBreak?: () => void;
  childName: string;
  accent: 'us' | 'uk' | 'in';
  calmMode?: boolean;
}

const WeeklyPhonemeScreen: React.FC<{ selectedPhonemes?: string[] }> = ({ selectedPhonemes }) => {
  const navigate = useNavigate();
  const { id: selectedPhonemeId } = useParams<{ id: string }>();
  const { childName, selectedAvatar, accent } = useAppState();
  
  const [phonemes, setPhonemes] = useState<Phoneme[]>([]);
  const [currentPhonemeIndex, setCurrentPhonemeIndex] = useState(0);
  const [currentDay, setCurrentDay] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showCalmMode, setShowCalmMode] = useState(false);
  const [showBreak, setShowBreak] = useState(false);
  const [starsCollected, setStarsCollected] = useState(0);
  const [weekProgress, setWeekProgress] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const weeklyActivities: DayActivity[] = [
    { day: 1, title: "Meet the Sound", subtitle: "Introduction to /phoneme/", type: 'introduction', icon: '👋', color: 'from-pink-300 to-rose-300' },
    { day: 2, title: "Can You Hear It?", subtitle: "Sound discrimination", type: 'discrimination', icon: '👂', color: 'from-blue-300 to-cyan-300' },
    { day: 3, title: "Say It With Me!", subtitle: "Mouth movement practice", type: 'production', icon: '👄', color: 'from-green-300 to-emerald-300' },
    { day: 4, title: "Find the Letter", subtitle: "Grapheme matching", type: 'matching', icon: '🔤', color: 'from-purple-300 to-violet-300' },
    { day: 5, title: "Mix the Sounds", subtitle: "Blending practice", type: 'blending', icon: '🎵', color: 'from-yellow-300 to-amber-300' },
    { day: 6, title: "Let's Sort!", subtitle: "Sound sorting game", type: 'sorting', icon: '📦', color: 'from-orange-300 to-red-300' },
    { day: 7, title: "Draw & Celebrate", subtitle: "Writing practice", type: 'writing', icon: '✏️', color: 'from-indigo-300 to-blue-300' }
  ];

  useEffect(() => {
    const loadPhonemes = async () => {
      try {
        // Use phonemes_cleaned.json to match PhonemeSelect.tsx
        const response = await fetch('/src/assets/content/phonemes_cleaned.json');
        const data = await response.json();
  
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('Phoneme data is empty or invalid');
        }

        let filteredPhonemes = data;
        if (selectedPhonemes && selectedPhonemes.length > 0) {
          filteredPhonemes = data.filter((p: Phoneme) => selectedPhonemes.includes(p.id));
          if (filteredPhonemes.length === 0) {
            console.warn('No phonemes found matching selectedPhonemes:', selectedPhonemes);
            setError('No phonemes available for the selected criteria.');
          }
        }

        // Log loaded phonemes for debugging
        console.log('Loaded phonemes:', filteredPhonemes.map(p => p.id));
  
        setPhonemes(filteredPhonemes);
        audioManager.setAccent(accent);
  
        const index = filteredPhonemes.findIndex((p: Phoneme) => p.id === selectedPhonemeId);
        if (index === -1) {
          console.warn(`Phoneme with ID ${selectedPhonemeId} not found`);
          setError(`Phoneme ${selectedPhonemeId} not found.`);
        }
        setCurrentPhonemeIndex(index >= 0 ? index : 0);
  
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load phonemes:', error);
        setError('Failed to load phonemes. Please try again.');
        setIsLoading(false);
      }
    };
  
    loadPhonemes();
  }, [selectedPhonemeId, selectedPhonemes, accent]);

  const completeDay = () => {
    setWeekProgress(prev => ({ ...prev, [currentDay]: true }));
    setStarsCollected(prev => prev + 1);
    
    setTimeout(() => {
      if (currentDay < 7) {
        setCurrentDay(prev => prev + 1);
      } else {
        if (currentPhonemeIndex < phonemes.length - 1) {
          setCurrentPhonemeIndex(prev => prev + 1);
          setCurrentDay(1);
          setWeekProgress({});
        } else {
          navigate('/');
        }
      }
    }, 2000);
  };

  const currentPhoneme = phonemes[currentPhonemeIndex];
  const currentActivity = weeklyActivities[currentDay - 1];

  const renderDayComponent = () => {
    if (!currentPhoneme || !currentActivity) return null;

    const props: DayComponentProps = {
      phoneme: currentPhoneme,
      phonemes,
      audioManager,
      onComplete: completeDay,
      onNeedBreak: () => setShowBreak(true),
      childName,
      accent,
      calmMode: showCalmMode
    };

    switch (currentActivity.type) {
      case 'introduction': return <Day1Intro {...props} />;
      case 'discrimination': return <Day2Discrimination {...props} />;
      case 'production': return <Day3MouthMovement {...props} />;
      case 'matching': return <Day4GraphemeMatch {...props} />;
      case 'blending': return <Day5BlendingPractice {...props} />;
      case 'sorting': return <Day6SoundSorting {...props} />;
      case 'writing': return <Day7WritingPractice {...props} />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            🌟
          </motion.div>
          <p className="text-xl font-medium text-gray-600">Loading your learning journey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-xl font-medium text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/phonemes')}
            className="mt-4 px-6 py-3 bg-mint-500 text-white rounded-full hover:bg-mint-600 transition-colors"
          >
            Choose Another Phoneme
          </button>
        </div>
      </div>
    );
  }

  if (!currentPhoneme) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-xl font-medium text-gray-600">Great job! You've completed all phonemes!</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-3 bg-mint-500 text-white rounded-full hover:bg-mint-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-1000 ${showCalmMode 
      ? 'bg-gradient-to-br from-blue-50 to-purple-50' 
      : 'bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50'
    } p-4`}>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <Home className="w-6 h-6 text-gray-600" />
        </button>
        
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-lg">
          <span className="text-2xl">{selectedAvatar}</span>
          <span className="font-semibold text-gray-800">{childName}</span>
          <div className="flex items-center gap-1 ml-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">{starsCollected}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowCalmMode(!showCalmMode)}
            className={`p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 ${
              showCalmMode ? 'bg-blue-200' : 'bg-white'
            }`}
            title="Calm mode"
          >
            <Eye className={`w-6 h-6 ${showCalmMode ? 'text-blue-600' : 'text-gray-600'}`} />
          </button>
          
          <button
            onClick={() => setShowBreak(true)}
            className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
            title="Take a break"
          >
            <Coffee className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mb-8">
        <ProgressIndicator
          currentDay={currentDay}
          weekProgress={weekProgress}
          weeklyActivities={weeklyActivities}
          phoneme={currentPhoneme.phoneme}
          weekNumber={currentPhonemeIndex + 1}
        />
      </div>

      <div className="max-w-4xl mx-auto">
        <motion.div
          className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-gray-100 min-h-96"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className={`text-center mb-8 p-4 rounded-2xl bg-gradient-to-r ${currentActivity.color}`}>
            <div className="text-4xl mb-2">{currentActivity.icon}</div>
            <h2 className="text-2xl font-bold text-gray-800">{currentActivity.title}</h2>
            <p className="text-gray-700">{currentActivity.subtitle.replace('/phoneme/', currentPhoneme.phoneme)}</p>
          </div>

          <AnimatePresence mode="wait">
            {renderDayComponent()}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {showBreak && <CalmBreak />}
      </AnimatePresence>

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-4 py-2 shadow-lg">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Heart className="w-4 h-4 text-pink-500" />
          <span>You're doing wonderfully!</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyPhonemeScreen;