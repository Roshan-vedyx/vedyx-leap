import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, ArrowLeft, ArrowRight, Home, RotateCcw, BookOpen, 
  Pause, Heart, Star, Calendar, Sparkles, Mic, Eye, Hand,
  Coffee, Smile, CheckCircle, Play, Check, X
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppState } from '../../store/useAppState';
import { audioManager } from '../../utils/audioManager';

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

interface Phoneme {
  id: string;
  phoneme: string;
  grapheme: string;
  words: PhonemeWord[];
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

interface PhonemePlayerProps {
  onComplete?: () => void;
  selectedPhonemes?: string[];
}

const PhonemePlayer: React.FC<PhonemePlayerProps> = ({ 
  onComplete,
  selectedPhonemes 
}) => {
  const navigate = useNavigate();
  const { id: selectedPhonemeId } = useParams<{ id: string }>();
  const { childName, selectedAvatar, accent } = useAppState();
  
  const [phonemes, setPhonemes] = useState<Phoneme[]>([]);
  const [currentPhonemeIndex, setCurrentPhonemeIndex] = useState(0);
  const [currentDay, setCurrentDay] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCalmMode, setShowCalmMode] = useState(false);
  const [showBreak, setShowBreak] = useState(false);
  const [starsCollected, setStarsCollected] = useState(0);
  const [weekProgress, setWeekProgress] = useState<Record<number, boolean>>({});
  
  // Discrimination game state
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [showDiscriminationFeedback, setShowDiscriminationFeedback] = useState(false);
  const [discriminationWords, setDiscriminationWords] = useState<PhonemeWord[]>([]);
  const [correctWords, setCorrectWords] = useState<Set<string>>(new Set());

  // Weekly activity structure
  const weeklyActivities: DayActivity[] = [
    { day: 1, title: "Meet the Sound", subtitle: "Introduction to /phoneme/", type: 'introduction', icon: '👋', color: 'from-pink-300 to-rose-300' },
    { day: 2, title: "Can You Hear It?", subtitle: "Sound discrimination", type: 'discrimination', icon: '👂', color: 'from-blue-300 to-cyan-300' },
    { day: 3, title: "Say It With Me!", subtitle: "Mouth movement practice", type: 'production', icon: '👄', color: 'from-green-300 to-emerald-300' },
    { day: 4, title: "Find the Letter", subtitle: "Grapheme matching", type: 'matching', icon: '🔤', color: 'from-purple-300 to-violet-300' },
    { day: 5, title: "Mix the Sounds", subtitle: "Blending practice", type: 'blending', icon: '🎵', color: 'from-yellow-300 to-amber-300' },
    { day: 6, title: "Let's Sort!", subtitle: "Sound sorting game", type: 'sorting', icon: '📦', color: 'from-orange-300 to-red-300' },
    { day: 7, title: "Draw & Celebrate", subtitle: "Writing practice", type: 'writing', icon: '✏️', color: 'from-indigo-300 to-blue-300' }
  ];

  // Load phonemes data
  useEffect(() => {
    const loadPhonemes = async () => {
      try {
        const response = await fetch('/src/assets/content/phonemes.json');
        const data = await response.json();
  
        let filteredPhonemes = data;
        if (selectedPhonemes && selectedPhonemes.length > 0) {
          filteredPhonemes = data.filter((p: Phoneme) =>
            selectedPhonemes.includes(p.id)
          );
        }
  
        setPhonemes(filteredPhonemes);
        audioManager.setAccent(accent);
  
        // Use selectedPhonemeId passed from the route
        const index = filteredPhonemes.findIndex((p: Phoneme) => p.id === selectedPhonemeId);
        setCurrentPhonemeIndex(index >= 0 ? index : 0);
  
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load phonemes:', error);
        setIsLoading(false);
      }
    };
  
    loadPhonemes();
  }, [selectedPhonemeId, selectedPhonemes, accent]);

  // Setup discrimination game when day changes to 2
  useEffect(() => {
    if (currentDay === 2 && currentPhoneme) {
      setupDiscriminationGame();
    }
  }, [currentDay, currentPhonemeIndex]);

  const currentPhoneme = phonemes[currentPhonemeIndex];
  const currentActivity = weeklyActivities[currentDay - 1];

  // Setup discrimination game with mix of correct and incorrect words
  const setupDiscriminationGame = useCallback(() => {
    if (!currentPhoneme || !phonemes) return;

    // Get words from current phoneme (correct answers)
    const currentPhonemeWords = currentPhoneme.words.slice(0, 3);
    
    // Get words from other phonemes (incorrect answers)
    const otherPhonemes = phonemes.filter(p => p.id !== currentPhoneme.id);
    const incorrectWords: PhonemeWord[] = [];
    
    // Randomly select words from other phonemes
    while (incorrectWords.length < 3 && otherPhonemes.length > 0) {
      const randomPhoneme = otherPhonemes[Math.floor(Math.random() * otherPhonemes.length)];
      const randomWord = randomPhoneme.words[Math.floor(Math.random() * randomPhoneme.words.length)];
      
      // Make sure we don't duplicate words
      if (!incorrectWords.some(w => w.word === randomWord.word) && 
          !currentPhonemeWords.some(w => w.word === randomWord.word)) {
        incorrectWords.push(randomWord);
      }
    }

    // Combine and shuffle
    const allWords = [...currentPhonemeWords, ...incorrectWords];
    const shuffledWords = allWords.sort(() => Math.random() - 0.5);
    
    setDiscriminationWords(shuffledWords);
    setCorrectWords(new Set(currentPhonemeWords.map(w => w.word)));
    setSelectedWords(new Set());
    setShowDiscriminationFeedback(false);
  }, [currentPhoneme, phonemes]);

  // Play phoneme sound only (not word)
  const playPhonemeSound = useCallback(async () => {
    if (!currentPhoneme || isPlaying) return;
    
    setIsPlaying(true);
    try {
      await audioManager.resumeAudioContext();
      // Play the pure phoneme sound
      const phonemeAudioPath = `/sounds/phonemes/${accent}_${currentPhoneme.id}.mp3`;
      await audioManager.playSound(phonemeAudioPath);
    } catch (error) {
      console.error('Failed to play phoneme sound:', error);
    } finally {
      setTimeout(() => setIsPlaying(false), 100);
    }
  }, [currentPhoneme, isPlaying, accent]);

  // Play introduction sentence
  const playIntroductionSentence = useCallback(async () => {
    if (!currentPhoneme || isPlaying) return;
    
    setIsPlaying(true);
    try {
      await audioManager.resumeAudioContext();
      
      // First play the phoneme sound
      const phonemeAudioPath = `/sounds/phonemes/${accent}_${currentPhoneme.id}.mp3`;
      await audioManager.playSound(phonemeAudioPath);
      
      // Small pause
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Then play the example word
      const exampleWord = currentPhoneme.words[0];
      if (exampleWord) {
        await audioManager.playPhonemeSound(exampleWord.audio);
      }
      
    } catch (error) {
      console.error('Failed to play introduction:', error);
    } finally {
      setTimeout(() => setIsPlaying(false), 100);
    }
  }, [currentPhoneme, isPlaying, accent]);

  // Play word audio
  const playWordAudio = useCallback(async (word: PhonemeWord) => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
      await audioManager.resumeAudioContext();
      await audioManager.playPhonemeSound(word.audio);
    } catch (error) {
      console.error('Failed to play word audio:', error);
    } finally {
      setTimeout(() => setIsPlaying(false), 100);
    }
  }, [isPlaying]);

  // Handle word selection in discrimination game
  const handleWordSelection = useCallback((word: PhonemeWord) => {
    const newSelectedWords = new Set(selectedWords);
    
    if (newSelectedWords.has(word.word)) {
      newSelectedWords.delete(word.word);
    } else {
      newSelectedWords.add(word.word);
    }
    
    setSelectedWords(newSelectedWords);
    
    // Play the word audio when selected
    playWordAudio(word);
  }, [selectedWords, playWordAudio]);

  // Check discrimination answers
  const checkDiscriminationAnswers = useCallback(() => {
    setShowDiscriminationFeedback(true);
    
    // Check if all correct words are selected and no incorrect words
    const allCorrectSelected = Array.from(correctWords).every(word => selectedWords.has(word));
    const noIncorrectSelected = Array.from(selectedWords).every(word => correctWords.has(word));
    
    if (allCorrectSelected && noIncorrectSelected) {
      // Correct! Play success sound
      setTimeout(() => {
        audioManager.playSound('/sounds/success.mp3').catch(console.error);
        setStarsCollected(prev => prev + 1);
      }, 500);
    } else {
      // Incorrect, play encouragement sound
      setTimeout(() => {
        audioManager.playSound('/sounds/try-again.mp3').catch(console.error);
      }, 500);
    }
  }, [selectedWords, correctWords]);

  // Complete day activity
  const completeDay = useCallback(() => {
    setWeekProgress(prev => ({ ...prev, [currentDay]: true }));
    setStarsCollected(prev => prev + 1);
    
    // Gentle celebration
    const celebration = setTimeout(() => {
      if (currentDay < 7) {
        setCurrentDay(prev => prev + 1);
      } else {
        // Week completed, move to next phoneme or finish
        if (currentPhonemeIndex < phonemes.length - 1) {
          setCurrentPhonemeIndex(prev => prev + 1);
          setCurrentDay(1);
          setWeekProgress({});
        } else {
          onComplete?.();
        }
      }
    }, 2000);

    return () => clearTimeout(celebration);
  }, [currentDay, currentPhonemeIndex, phonemes.length, onComplete]);

  // Calm break component
  const CalmBreak = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center z-50"
    >
      <div className="text-center p-8">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-8xl mb-6"
        >
          🌸
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Take a gentle breath</h2>
        <p className="text-gray-600 mb-6">In... and out... You're doing great!</p>
        <motion.button
          onClick={() => setShowBreak(false)}
          className="px-6 py-3 bg-white text-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          I'm ready to continue 😊
        </motion.button>
      </div>
    </motion.div>
  );

  // Render activity content based on day
  const renderDayActivity = () => {
    if (!currentPhoneme || !currentActivity) return null;

    const commonProps = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.5 }
    };

    switch (currentActivity.type) {
      case 'introduction':
        return (
          <motion.div {...commonProps} className="text-center space-y-8">
            {/* Big friendly letter */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative"
            >
              <div className="text-9xl font-bold text-gray-700 mb-4">
                {currentPhoneme.grapheme.split(',')[0].trim().toUpperCase()}
              </div>
              <div className="text-6xl font-bold text-gray-600">
                {currentPhoneme.grapheme.split(',')[0].trim().toLowerCase()}
              </div>
              <div className="text-3xl text-purple-600 mt-4 font-mono">
                {currentPhoneme.phoneme}
              </div>
            </motion.div>

            {/* Animated character */}
            <motion.div
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-8xl"
            >
              {currentPhoneme.words[0]?.emoji || '🐵'}
            </motion.div>

            {/* Play button for phoneme + intro */}
            <motion.button
              onClick={playIntroductionSentence}
              disabled={isPlaying}
              className="px-8 py-4 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full shadow-lg text-xl font-medium hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Volume2 className="w-6 h-6 inline mr-2" />
              {isPlaying ? 'Playing...' : 'Hear the sound!'}
            </motion.button>

            {/* Just phoneme sound button */}
            <motion.button
              onClick={playPhonemeSound}
              disabled={isPlaying}
              className="px-6 py-3 bg-gradient-to-r from-purple-400 to-indigo-400 text-white rounded-full shadow-lg font-medium hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-5 h-5 inline mr-2" />
              Just the {currentPhoneme.phoneme} sound
            </motion.button>

            <div className="text-lg text-gray-600">
              This is the sound {currentPhoneme.phoneme} – like in {currentPhoneme.words[0]?.word}!
            </div>
          </motion.div>
        );

      case 'discrimination':
        return (
          <motion.div {...commonProps} className="text-center space-y-8">
            <h3 className="text-3xl font-bold text-gray-700">
              Can you hear {currentPhoneme.phoneme}?
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {discriminationWords.map((word, index) => {
                const isSelected = selectedWords.has(word.word);
                const isCorrect = correctWords.has(word.word);
                const showFeedback = showDiscriminationFeedback;
                
                let buttonClass = "bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border-4 ";
                
                if (showFeedback) {
                  if (isCorrect && isSelected) {
                    buttonClass += "border-green-400 bg-green-50"; // Correct and selected
                  } else if (isCorrect && !isSelected) {
                    buttonClass += "border-yellow-400 bg-yellow-50"; // Correct but not selected
                  } else if (!isCorrect && isSelected) {
                    buttonClass += "border-red-400 bg-red-50"; // Incorrect but selected
                  } else {
                    buttonClass += "border-gray-200"; // Incorrect and not selected
                  }
                } else {
                  buttonClass += isSelected ? "border-blue-400 bg-blue-50" : "border-gray-200";
                }

                return (
                  <motion.button
                    key={word.word}
                    onClick={() => !showFeedback && handleWordSelection(word)}
                    className={buttonClass}
                    whileHover={!showFeedback ? { scale: 1.05, y: -5 } : {}}
                    whileTap={!showFeedback ? { scale: 0.95 } : {}}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    disabled={showFeedback}
                  >
                    <div className="text-5xl mb-3">{word.emoji}</div>
                    <div className="text-xl font-medium text-gray-700">{word.word}</div>
                    <div className="text-sm text-gray-500 mt-2">
                      {showFeedback ? (
                        isCorrect && isSelected ? (
                          <div className="flex items-center justify-center gap-1 text-green-600">
                            <Check className="w-4 h-4" />
                            Correct!
                          </div>
                        ) : isCorrect && !isSelected ? (
                          <div className="text-yellow-600">You missed this one</div>
                        ) : !isCorrect && isSelected ? (
                          <div className="flex items-center justify-center gap-1 text-red-600">
                            <X className="w-4 h-4" />
                            Not this one
                          </div>
                        ) : (
                          <div className="text-gray-400">Not selected</div>
                        )
                      ) : (
                        isSelected ? "Selected!" : "Tap to select"
                      )}
                    </div>
                    
                    {showFeedback && isCorrect && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2"
                      >
                        <div className="bg-green-500 text-white rounded-full p-1">
                          <Check className="w-4 h-4" />
                        </div>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Listen carefully and tap the words that start with {currentPhoneme.phoneme}!
              </p>
              
              {!showDiscriminationFeedback && selectedWords.size > 0 && (
                <motion.button
                  onClick={checkDiscriminationAnswers}
                  className="px-6 py-3 bg-gradient-to-r from-blue-400 to-indigo-400 text-white rounded-full shadow-lg font-medium hover:shadow-xl transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Check My Answers ({selectedWords.size} selected)
                </motion.button>
              )}
              
              {showDiscriminationFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="text-lg font-medium text-gray-700">
                    {Array.from(correctWords).every(word => selectedWords.has(word)) && 
                     Array.from(selectedWords).every(word => correctWords.has(word)) ? (
                      <div className="text-green-600 flex items-center justify-center gap-2">
                        <CheckCircle className="w-6 h-6" />
                        Perfect! You found all the {currentPhoneme.phoneme} words!
                      </div>
                    ) : (
                      <div className="text-blue-600">
                        Good try! The {currentPhoneme.phoneme} words were highlighted in green.
                      </div>
                    )}
                  </div>
                  
                  <motion.button
                    onClick={() => {
                      setShowDiscriminationFeedback(false);
                      setupDiscriminationGame();
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full shadow-lg font-medium hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw className="w-5 h-5 inline mr-2" />
                    Try Again
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        );

      case 'production':
        return (
          <motion.div {...commonProps} className="text-center space-y-8">
            <h3 className="text-3xl font-bold text-gray-700">Say it with me!</h3>
            
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative"
            >
              <div className="text-8xl">👄</div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-2xl font-bold text-purple-600"
                >
                  {currentPhoneme.phoneme}
                </motion.div>
              </div>
            </motion.div>

            <div className="bg-yellow-100 p-6 rounded-2xl max-w-md mx-auto">
              <p className="text-lg text-gray-700">
                Say "{currentPhoneme.phoneme}" – like when you taste something yummy! "Mmm!"
              </p>
            </div>

            <motion.button
              onClick={playPhonemeSound}
              className="px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-full shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mic className="w-5 h-5 inline mr-2" />
              Practice with me!
            </motion.button>
          </motion.div>
        );

      default:
        return (
          <motion.div {...commonProps} className="text-center space-y-8">
            <div className="text-6xl">{currentActivity.icon}</div>
            <h3 className="text-2xl font-bold text-gray-700">{currentActivity.title}</h3>
            <p className="text-gray-600">{currentActivity.subtitle}</p>
            <p className="text-gray-500">More activities coming soon!</p>
          </motion.div>
        );
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
      
      {/* Header */}
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

      {/* Week Progress */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Week {currentPhonemeIndex + 1}: Learning {currentPhoneme.phoneme}
            </h3>
            <div className="text-sm text-gray-500">
              Day {currentDay} of 7
            </div>
          </div>
          
          <div className="flex gap-2 justify-center">
            {weeklyActivities.map((activity) => (
              <motion.div
                key={activity.day}
                className={`flex-1 max-w-16 p-2 rounded-lg text-center transition-all ${
                  activity.day === currentDay 
                    ? `bg-gradient-to-r ${activity.color} shadow-lg scale-105` 
                    : weekProgress[activity.day]
                      ? 'bg-green-100 shadow-md'
                      : 'bg-gray-100'
                }`}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl mb-1">{activity.icon}</div>
                <div className="text-xs font-medium text-gray-700">Day {activity.day}</div>
                {weekProgress[activity.day] && (
                  <CheckCircle className="w-3 h-3 text-green-600 mx-auto mt-1" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Current Activity */}
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-gray-100 min-h-96"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Activity Header */}
          <div className={`text-center mb-8 p-4 rounded-2xl bg-gradient-to-r ${currentActivity.color}`}>
            <div className="text-4xl mb-2">{currentActivity.icon}</div>
            <h2 className="text-2xl font-bold text-gray-800">{currentActivity.title}</h2>
            <p className="text-gray-700">{currentActivity.subtitle.replace('/phoneme/', currentPhoneme.phoneme)}</p>
          </div>

          {/* Activity Content */}
          <AnimatePresence mode="wait">
            {renderDayActivity()}
          </AnimatePresence>

          {/* Continue Button */}
          <div className="text-center mt-8">
            <motion.button
              onClick={completeDay}
              className="px-8 py-4 bg-gradient-to-r from-mint-400 to-blue-400 text-white rounded-full shadow-lg text-lg font-medium hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-5 h-5 inline mr-2" />
              {currentDay === 7 ? 'Complete Week!' : 'Continue to Tomorrow'}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Calm Break Overlay */}
      <AnimatePresence>
        {showBreak && <CalmBreak />}
      </AnimatePresence>

      {/* Gentle reminder */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-4 py-2 shadow-lg">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Heart className="w-4 h-4 text-pink-500" />
          <span>You're doing wonderfully!</span>
        </div>
      </div>
    </div>
  );
};

export default PhonemePlayer;