import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, RefreshCw, CheckCircle, XCircle, Star, Timer, Zap } from 'lucide-react';

interface GamePlayerProps {
  id: string;
  gameType: 'syllableTap' | 'dragSpelling' | 'phonemeMatch' | 'audioDiscrimination' | 'patternMatching' | 'speedReading' | 'guidedReading';
  prompt: string;
  words: string[];
  phonemes?: string[][];
  audioMap?: Record<string, string>;
  // New props for enhanced games
  wordPairs?: Array<{
    pair: string[];
    audioUrls: string[];
    correct: number;
  }>;
  categories?: Array<{
    name: string;
    pattern: RegExp;
  }>;
  timeLimit?: number;
  onComplete?: (score: number) => void;
}

// Audio Discrimination Game - Listen and choose between two words
const AudioDiscriminationGame: React.FC<{
  wordPairs: Array<{
    pair: string[];
    audioUrls: string[];
    correct: number;
  }>;
  onComplete?: (score: number) => void;
}> = ({ wordPairs, onComplete }) => {
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hasPlayedAudio, setHasPlayedAudio] = useState([false, false]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentPair = wordPairs[currentPairIndex];

  const playAudio = async (index: number) => {
    if (!audioRef.current) return;
    
    try {
      audioRef.current.src = currentPair.audioUrls[index];
      await audioRef.current.play();
      
      setHasPlayedAudio(prev => {
        const newState = [...prev];
        newState[index] = true;
        return newState;
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleSelection = (selection: number) => {
    if (showFeedback) return;

    setSelectedOption(selection);
    const correct = selection === currentPair.correct;
    setIsCorrect(correct);
    if (correct) setScore(prev => prev + 1);
    setShowFeedback(true);

    setTimeout(() => {
      if (currentPairIndex < wordPairs.length - 1) {
        setCurrentPairIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
        setShowFeedback(false);
        setHasPlayedAudio([false, false]);
      } else {
        onComplete?.(score + (correct ? 1 : 0));
      }
    }, 2000);
  };

  return (
    <div className="text-center">
      <h3 className="text-2xl font-bold mb-6">Which word has the LONG vowel sound?</h3>
      
      <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto mb-8">
        {currentPair.pair.map((word, index) => (
          <div key={index} className="space-y-4">
            {/* Audio Button */}
            <button
              onClick={() => playAudio(index)}
              className={`w-full p-6 rounded-2xl transition-all transform hover:scale-105 ${
                hasPlayedAudio[index] 
                  ? 'bg-blue-100 border-2 border-blue-300' 
                  : 'bg-gray-100 border-2 border-gray-300 hover:bg-blue-50'
              }`}
            >
              <Volume2 className={`w-8 h-8 mx-auto ${hasPlayedAudio[index] ? 'text-blue-600' : 'text-gray-600'}`} />
              <div className="mt-2 text-sm font-medium text-gray-700">
                Listen to Word {index + 1}
              </div>
            </button>

            {/* Selection Button */}
            <motion.button
              onClick={() => handleSelection(index)}
              disabled={!hasPlayedAudio[0] || !hasPlayedAudio[1] || showFeedback}
              className={`w-full p-4 rounded-2xl text-xl font-bold transition-all transform hover:scale-105 ${
                selectedOption === index
                  ? isCorrect
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                  : showFeedback && index === currentPair.correct
                    ? 'bg-green-300 text-green-800'
                    : hasPlayedAudio[0] && hasPlayedAudio[1] && !showFeedback
                      ? 'bg-white text-gray-700 shadow-md hover:shadow-lg cursor-pointer'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {word}
            </motion.button>
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-600 mb-4">
        Listen to both words first, then choose!
      </div>

      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-2xl ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}
          >
            <div className="flex items-center justify-center gap-2 text-lg font-bold">
              {isCorrect ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-green-800">Perfect! "{currentPair.pair[currentPair.correct]}" has the long vowel! 🎉</span>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-600" />
                  <span className="text-red-800">Good try! "{currentPair.pair[currentPair.correct]}" has the long vowel. 💪</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 text-sm text-gray-600">
        Pair {currentPairIndex + 1} of {wordPairs.length} • Score: {score}/{wordPairs.length}
      </div>

      <audio ref={audioRef} preload="metadata" />
    </div>
  );
};

// Pattern Matching Game - Sort words into categories
const PatternMatchingGame: React.FC<{
  words: string[];
  categories: Array<{
    name: string;
    pattern: RegExp;
  }>;
  onComplete?: (score: number) => void;
}> = ({ words, categories, onComplete }) => {
  const [sortedWords, setSortedWords] = useState<{[key: string]: string[]}>({});
  const [availableWords, setAvailableWords] = useState<string[]>([...words]);
  const [draggedWord, setDraggedWord] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Initialize categories
    const initial: {[key: string]: string[]} = {};
    categories.forEach(cat => {
      initial[cat.name] = [];
    });
    setSortedWords(initial);
  }, [categories]);

  const handleDrop = (categoryName: string, word: string) => {
    // Remove word from available words
    setAvailableWords(prev => prev.filter(w => w !== word));
    
    // Add word to category
    setSortedWords(prev => ({
      ...prev,
      [categoryName]: [...prev[categoryName], word]
    }));

    // Check if all words are sorted
    if (availableWords.length === 1) { // Will be 0 after this drop
      checkAnswers();
    }
  };

  const removeFromCategory = (categoryName: string, word: string) => {
    setSortedWords(prev => ({
      ...prev,
      [categoryName]: prev[categoryName].filter(w => w !== word)
    }));
    setAvailableWords(prev => [...prev, word]);
  };

  const checkAnswers = () => {
    let correctCount = 0;
    
    categories.forEach(category => {
      const wordsInCategory = sortedWords[category.name] || [];
      wordsInCategory.forEach(word => {
        if (category.pattern.test(word)) {
          correctCount++;
        }
      });
    });

    setScore(correctCount);
    setIsComplete(true);
    
    setTimeout(() => {
      onComplete?.(correctCount);
    }, 3000);
  };

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          {score === words.length ? 'Perfect Sort!' : 'Good Job!'}
        </h2>
        <p className="text-xl text-gray-600 mb-6">
          You sorted {score} out of {words.length} words correctly!
        </p>
        <div className="text-6xl">
          {score === words.length ? '🏆' : score >= words.length * 0.7 ? '🌟' : '💪'}
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 text-center">Drag words to the correct group!</h3>
      
      {/* Available Words */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-4 text-center">Words to Sort:</h4>
        <div className="flex flex-wrap justify-center gap-3">
          {availableWords.map(word => (
            <motion.div
              key={word}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              whileDrag={{ scale: 1.1, zIndex: 10 }}
              className="px-4 py-2 bg-yellow-200 text-yellow-800 rounded-2xl font-bold cursor-grab active:cursor-grabbing shadow-md"
              onDragEnd={(event, info) => {
                const element = document.elementFromPoint(
                  info.point.x, 
                  info.point.y
                );
                const dropZone = element?.closest('[data-category]');
                if (dropZone) {
                  const categoryName = dropZone.getAttribute('data-category');
                  if (categoryName) {
                    handleDrop(categoryName, word);
                  }
                }
              }}
            >
              {word}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="grid md:grid-cols-2 gap-6">
        {categories.map(category => (
          <div
            key={category.name}
            data-category={category.name}
            className="border-3 border-dashed border-gray-300 rounded-3xl p-6 min-h-[200px] bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <h4 className="text-xl font-bold text-center mb-4 text-gray-700">
              {category.name}
            </h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {(sortedWords[category.name] || []).map(word => (
                <motion.button
                  key={word}
                  onClick={() => removeFromCategory(category.name, word)}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-2 bg-mint-200 text-mint-800 rounded-xl font-semibold hover:bg-mint-300 transition-colors"
                >
                  {word} ✕
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-6 text-sm text-gray-600">
        Drag and drop words into the correct categories. Click words to remove them.
      </div>
    </div>
  );
};

// Speed Reading Game - Flash words for automatic recognition
const SpeedReadingGame: React.FC<{
  words: string[];
  timeLimit?: number;
  onComplete?: (score: number) => void;
}> = ({ words, timeLimit = 3, onComplete }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showWord, setShowWord] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [flashDuration, setFlashDuration] = useState(2000); // Start with 2 seconds
  const [score, setScore] = useState(0);
  const [responses, setResponses] = useState<{word: string, input: string, correct: boolean}[]>([]);
  
  const currentWord = words[currentWordIndex];

  useEffect(() => {
    if (showWord) {
      const timer = setTimeout(() => {
        setShowWord(false);
        setShowInput(true);
      }, flashDuration);
      
      return () => clearTimeout(timer);
    }
  }, [showWord, flashDuration, currentWordIndex]);

  const handleSubmit = () => {
    const correct = userInput.toLowerCase().trim() === currentWord.toLowerCase();
    if (correct) setScore(prev => prev + 1);
    
    setResponses(prev => [...prev, {
      word: currentWord,
      input: userInput,
      correct
    }]);

    if (currentWordIndex < words.length - 1) {
      // Next word - speed up slightly
      setFlashDuration(prev => Math.max(800, prev - 100));
      setCurrentWordIndex(prev => prev + 1);
      setUserInput('');
      setShowWord(true);
      setShowInput(false);
    } else {
      onComplete?.(score + (correct ? 1 : 0));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="text-center">
      <h3 className="text-2xl font-bold mb-6">Read the word quickly!</h3>
      
      <div className="mb-8">
        <div className="text-sm text-gray-600 mb-4">
          Speed Level: {Math.round((2000 - flashDuration) / 200) + 1}/7
        </div>
        
        <motion.div 
          className="bg-white rounded-3xl shadow-lg p-8 min-h-[200px] flex items-center justify-center mb-6"
          animate={{ scale: showWord ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {showWord ? (
              <motion.div
                key={`word-${currentWordIndex}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="text-6xl font-bold text-gray-800"
              >
                {currentWord}
              </motion.div>
            ) : showInput ? (
              <motion.div
                key={`input-${currentWordIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <p className="text-xl text-gray-700 mb-4">What word did you see?</p>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type the word..."
                  className="px-6 py-3 text-2xl text-center border-2 border-gray-300 rounded-2xl focus:border-mint-500 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSubmit}
                  disabled={!userInput.trim()}
                  className={`px-8 py-3 rounded-2xl font-bold transition-all ${
                    userInput.trim() 
                      ? 'bg-mint-500 text-white hover:bg-mint-600 transform hover:scale-105' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Submit
                </button>
              </motion.div>
            ) : (
              <div className="text-2xl text-gray-400">Get ready...</div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="text-sm text-gray-600">
        Word {currentWordIndex + 1} of {words.length} • Score: {score}/{words.length}
      </div>
    </div>
  );
};

// Guided Reading Game - Build words step by step
const GuidedReadingGame: React.FC<{
  words: string[];
  onComplete?: (score: number) => void;
}> = ({ words, onComplete }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState<'base' | 'add-e' | 'read'>('base');
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const currentWord = words[currentWordIndex];
  const baseWord = currentWord.slice(0, -1); // Remove the 'e'
  
  const nextStep = () => {
    if (currentStep === 'base') {
      setCurrentStep('add-e');
    } else if (currentStep === 'add-e') {
      setCurrentStep('read');
    } else {
      // Move to next word or complete
      setScore(prev => prev + 1);
      setShowFeedback(true);
      
      setTimeout(() => {
        if (currentWordIndex < words.length - 1) {
          setCurrentWordIndex(prev => prev + 1);
          setCurrentStep('base');
          setShowFeedback(false);
        } else {
          onComplete?.(score + 1);
        }
      }, 2000);
    }
  };

  return (
    <div className="text-center">
      <h3 className="text-2xl font-bold mb-6">Watch how the Magic E changes the word!</h3>
      
      <div className="space-y-8">
        {/* Step 1: Base word */}
        <motion.div
          className={`p-6 rounded-2xl ${currentStep === 'base' ? 'bg-red-100 border-3 border-red-300' : 'bg-gray-100'}`}
          animate={{ scale: currentStep === 'base' ? 1.05 : 1 }}
        >
          <h4 className="text-lg font-semibold mb-2 text-gray-700">Step 1: Read the base word</h4>
          <div className="text-4xl font-bold text-red-600 mb-2">{baseWord}</div>
          <div className="text-sm text-gray-600">This has a SHORT vowel sound</div>
        </motion.div>

        {/* Step 2: Add e */}
        <motion.div
          className={`p-6 rounded-2xl ${currentStep === 'add-e' ? 'bg-blue-100 border-3 border-blue-300' : 'bg-gray-100'}`}
          animate={{ scale: currentStep === 'add-e' ? 1.05 : 1 }}
        >
          <h4 className="text-lg font-semibold mb-2 text-gray-700">Step 2: Add the Magic E</h4>
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {baseWord}<span className="text-blue-500 animate-pulse">e</span>
          </div>
          <div className="text-sm text-gray-600">Now the 'e' is silent but magic!</div>
        </motion.div>

        {/* Step 3: Read new word */}
        <motion.div
          className={`p-6 rounded-2xl ${currentStep === 'read' ? 'bg-green-100 border-3 border-green-300' : 'bg-gray-100'}`}
          animate={{ scale: currentStep === 'read' ? 1.05 : 1 }}
        >
          <h4 className="text-lg font-semibold mb-2 text-gray-700">Step 3: Read the new word</h4>
          <div className="text-4xl font-bold text-green-600 mb-2">{currentWord}</div>
          <div className="text-sm text-gray-600">Now the vowel says its NAME (long sound)!</div>
        </motion.div>

        {!showFeedback && (
          <button
            onClick={nextStep}
            className="px-8 py-4 bg-mint-500 text-white rounded-2xl font-bold text-xl hover:bg-mint-600 transition-all transform hover:scale-105"
          >
            {currentStep === 'base' ? 'Add Magic E!' : currentStep === 'add-e' ? 'Read New Word!' : 'I understand! ✨'}
          </button>
        )}

        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-center gap-2 text-lg font-bold text-green-600 bg-green-100 p-4 rounded-2xl"
            >
              <CheckCircle className="w-6 h-6" />
              <span>Perfect! You see how Magic E works! 🎉</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 text-sm text-gray-600">
        Word {currentWordIndex + 1} of {words.length}
      </div>
    </div>
  );
};

// Main Enhanced Game Player Component
const EnhancedGamePlayer: React.FC<GamePlayerProps> = ({ 
  gameType, 
  prompt, 
  words, 
  phonemes, 
  audioMap, 
  wordPairs,
  categories,
  timeLimit,
  onComplete 
}) => {
  const [gameComplete, setGameComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const handleGameComplete = (score: number) => {
    setFinalScore(score);
    setGameComplete(true);
    onComplete?.(score);
  };

  if (gameComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center bg-white rounded-3xl p-8 shadow-xl"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Amazing Work!</h2>
        <p className="text-xl text-gray-600 mb-6">
          You scored {finalScore} out of {words?.length || wordPairs?.length || 0}!
        </p>
        <div className="text-6xl mb-4">
          {finalScore === (words?.length || wordPairs?.length || 0) ? '🏆' : 
           finalScore >= (words?.length || wordPairs?.length || 0) * 0.7 ? '🌟' : '💪'}
        </div>
        <p className="text-lg text-gray-700">
          {finalScore === (words?.length || wordPairs?.length || 0)
            ? 'Perfect score! You\'re a literacy champion!' 
            : finalScore >= (words?.length || wordPairs?.length || 0) * 0.7
              ? 'Great job! Keep up the excellent work!'
              : 'Good effort! Practice makes perfect!'}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gradient-to-br from-mint-50 via-blue-50 to-purple-50 min-h-screen">
      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{prompt}</h2>
        </div>

        {/* Existing game types */}
        {gameType === 'syllableTap' && (
          <SyllableTapGame
            words={words}
            phonemes={phonemes}
            audioMap={audioMap}
            onComplete={handleGameComplete}
          />
        )}

        {gameType === 'dragSpelling' && (
          <DragSpellingGame
            words={words}
            onComplete={handleGameComplete}
          />
        )}

        {gameType === 'phonemeMatch' && (
          <PhonemeMatchGame
            words={words}
            audioMap={audioMap}
            onComplete={handleGameComplete}
          />
        )}

        {/* New game types */}
        {gameType === 'audioDiscrimination' && wordPairs && (
          <AudioDiscriminationGame
            wordPairs={wordPairs}
            onComplete={handleGameComplete}
          />
        )}

        {gameType === 'patternMatching' && categories && (
          <PatternMatchingGame
            words={words}
            categories={categories}
            onComplete={handleGameComplete}
          />
        )}

        {gameType === 'speedReading' && (
          <SpeedReadingGame
            words={words}
            timeLimit={timeLimit}
            onComplete={handleGameComplete}
          />
        )}

        {gameType === 'guidedReading' && (
          <GuidedReadingGame
            words={words}
            onComplete={handleGameComplete}
          />
        )}
      </div>
    </div>
  );
};

// Re-export existing game components for backward compatibility
const SyllableTapGame: React.FC<{
  words: string[];
  phonemes?: string[][];
  audioMap?: Record<string, string>;
  onComplete?: (score: number) => void;
}> = ({ words, phonemes = [], audioMap = {}, onComplete }) => {
  // [Previous SyllableTapGame implementation - keeping it the same]
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedSyllables, setSelectedSyllables] = useState<number[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentWord = words[currentWordIndex];
  const currentPhonemes = phonemes[currentWordIndex] || [currentWord];
  const correctCount = currentPhonemes.length;

  const playWordAudio = async () => {
    const audioUrl = audioMap[currentWord];
    if (!audioUrl || !audioRef.current) return;

    try {
      audioRef.current.src = audioUrl;
      await audioRef.current.play();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleSyllableClick = (index: number) => {
    if (isCorrect !== null) return;

    const newSelected = selectedSyllables.includes(index)
      ? selectedSyllables.filter(i => i !== index)
      : [...selectedSyllables, index];

    setSelectedSyllables(newSelected);

    if (newSelected.length === correctCount) {
      const correct = newSelected.length === correctCount;
      setIsCorrect(correct);
      if (correct) setScore(prev => prev + 1);
      setShowFeedback(true);

      setTimeout(() => {
        if (currentWordIndex < words.length - 1) {
          setCurrentWordIndex(prev => prev + 1);
          setSelectedSyllables([]);
          setIsCorrect(null);
          setShowFeedback(false);
        } else {
          onComplete?.(score + (correct ? 1 : 0));
        }
      }, 2000);
    }
  };

  useEffect(() => {
    playWordAudio();
  }, [currentWordIndex]);

  return (
    <div className="text-center">
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4">Tap the syllables you hear!</h3>
        <div className="flex items-center justify-center gap-4 mb-6">
          <motion.div
            className="text-4xl font-bold text-gray-800 bg-white p-6 rounded-3xl shadow-lg"
            animate={showFeedback ? { scale: [1, 1.1, 1] } : {}}
          >
            {currentWord}
          </motion.div>
          <button
            onClick={playWordAudio}
            className="p-4 bg-blue-100 rounded-full hover:bg-blue-200 transition-all hover:scale-110"
          >
            <Volume2 className="w-6 h-6 text-blue-600" />
          </button>
        </div>
      </div>

      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        {currentPhonemes.map((syllable, index) => (
          <motion.button
            key={index}
            onClick={() => handleSyllableClick(index)}
            className={`px-6 py-4 rounded-2xl text-xl font-bold transition-all transform hover:scale-105 ${
              selectedSyllables.includes(index)
                ? 'bg-mint-500 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
            }`}
            animate={{
              scale: selectedSyllables.includes(index) ? 1.05 : 1,
              rotateZ: selectedSyllables.includes(index) ? [-5, 5, 0] : 0,
            }}
            whileTap={{ scale: 0.95 }}
          >
            {syllable}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-2xl ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}
          >
            <div className="flex items-center justify-center gap-2 text-lg font-bold">
              {isCorrect ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-green-800">Perfect! 🎉</span>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-600" />
                  <span className="text-red-800">Try again! 💪</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 text-sm text-gray-600">
        Word {currentWordIndex + 1} of {words.length} • Score: {score}/{words.length}
      </div>

      <audio ref={audioRef} preload="metadata" />
    </div>
  );
};

const DragSpellingGame: React.FC<{
  words: string[];
  onComplete?: (score: number) => void;
}> = ({ words, onComplete }) => {
  // [Previous DragSpellingGame implementation - keeping it the same]
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userSpelling, setUserSpelling] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentWord = words[currentWordIndex];
  const targetLetters = currentWord.split('');

  useEffect(() => {
    const wordLetters = currentWord.split('');
    const extraLetters = ['a', 'e', 'i', 'o', 'u', 'b', 'c', 'd', 'f', 'g']
      .filter(letter => !wordLetters.includes(letter))
      .slice(0, Math.max(2, 6 - wordLetters.length));
    
    const allLetters = [...wordLetters, ...extraLetters];
    setAvailableLetters(allLetters.sort(() => Math.random() - 0.5));
    setUserSpelling([]);
    setIsCorrect(null);
    setShowFeedback(false);
  }, [currentWord]);

  const addLetter = (letter: string, index: number) => {
    setUserSpelling(prev => [...prev, letter]);
    setAvailableLetters(prev => prev.filter((_, i) => i !== index));
  };

  const removeLetter = (index: number) => {
    const letter = userSpelling[index];
    setUserSpelling(prev => prev.filter((_, i) => i !== index));
    setAvailableLetters(prev => [...prev, letter]);
  };

  const checkSpelling = () => {
    const correct = userSpelling.join('') === currentWord;
    setIsCorrect(correct);
    if (correct) setScore(prev => prev + 1);
    setShowFeedback(true);

    setTimeout(() => {
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(prev => prev + 1);
      } else {
        onComplete?.(score + (correct ? 1 : 0));
      }
    }, 2000);
  };

  const resetWord = () => {
    setUserSpelling([]);
    const wordLetters = currentWord.split('');
    const extraLetters = ['a', 'e', 'i', 'o', 'u', 'b', 'c', 'd', 'f', 'g']
      .filter(letter => !wordLetters.includes(letter))
      .slice(0, Math.max(2, 6 - wordLetters.length));
    
    const allLetters = [...wordLetters, ...extraLetters];
    setAvailableLetters(allLetters.sort(() => Math.random() - 0.5));
    setIsCorrect(null);
    setShowFeedback(false);
  };

  return (
    <div className="text-center">
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4">Spell the word!</h3>
        <div className="text-3xl font-bold text-gray-800 mb-6">{currentWord}</div>
      </div>

      <div className="mb-8">
        <div className="flex justify-center gap-2 mb-4 min-h-[60px] items-center">
          {targetLetters.map((_, index) => (
            <motion.div
              key={index}
              className="w-12 h-12 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center bg-white"
              whileHover={{ scale: 1.05 }}
            >
              {userSpelling[index] && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => removeLetter(index)}
                  className="text-xl font-bold text-mint-600 hover:text-mint-800 transition-colors"
                >
                  {userSpelling[index]}
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={checkSpelling}
            disabled={userSpelling.length !== targetLetters.length || showFeedback}
            className={`px-6 py-3 rounded-2xl font-bold transition-all ${
              userSpelling.length === targetLetters.length && !showFeedback
                ? 'bg-mint-500 text-white hover:bg-mint-600 transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Check Spelling
          </button>
          <button
            onClick={resetWord}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all transform hover:scale-105"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex justify-center gap-2 flex-wrap mb-8">
        {availableLetters.map((letter, index) => (
          <motion.button
            key={`${letter}-${index}`}
            onClick={() => addLetter(letter, index)}
            className="w-12 h-12 bg-blue-100 text-blue-800 rounded-lg font-bold hover:bg-blue-200 transition-all transform hover:scale-110"
            whileTap={{ scale: 0.95 }}
            layout
          >
            {letter}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-2xl ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}
          >
            <div className="flex items-center justify-center gap-2 text-lg font-bold">
              {isCorrect ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-green-800">Excellent spelling! 🎉</span>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-600" />
                  <span className="text-red-800">Keep trying! 💪</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 text-sm text-gray-600">
        Word {currentWordIndex + 1} of {words.length} • Score: {score}/{words.length}
      </div>
    </div>
  );
};

const PhonemeMatchGame: React.FC<{
  words: string[];
  audioMap?: Record<string, string>;
  onComplete?: (score: number) => void;
}> = ({ words, audioMap = {}, onComplete }) => {
  // [Previous PhonemeMatchGame implementation - keeping it the same]
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentWord = words[currentWordIndex];

  useEffect(() => {
    const otherWords = words.filter(w => w !== currentWord);
    const distractors = otherWords.slice(0, 3);
    const allOptions = [currentWord, ...distractors].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowFeedback(false);
  }, [currentWord, words]);

  const playWordAudio = async () => {
    const audioUrl = audioMap[currentWord];
    if (!audioUrl || !audioRef.current) return;

    try {
      audioRef.current.src = audioUrl;
      await audioRef.current.play();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (showFeedback) return;
    
    setSelectedOption(option);
    const correct = option === currentWord;
    setIsCorrect(correct);
    if (correct) setScore(prev => prev + 1);
    setShowFeedback(true);

    setTimeout(() => {
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(prev => prev + 1);
      } else {
        onComplete?.(score + (correct ? 1 : 0));
      }
    }, 2000);
  };

  useEffect(() => {
    playWordAudio();
  }, [currentWordIndex]);

  return (
    <div className="text-center">
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-6">Listen and choose the word you hear!</h3>
        
        <button
          onClick={playWordAudio}
          className="p-6 bg-blue-100 rounded-full hover:bg-blue-200 transition-all transform hover:scale-110 active:scale-95 mb-8"
        >
          <Volume2 className="w-8 h-8 text-blue-600" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
        {options.map((option, index) => (
          <motion.button
            key={option}
            onClick={() => handleOptionSelect(option)}
            className={`p-4 rounded-2xl text-xl font-bold transition-all transform hover:scale-105 ${
              selectedOption === option
                ? isCorrect
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
                : showFeedback && option === currentWord
                  ? 'bg-green-300 text-green-800'
                  : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
            }`}
            whileTap={{ scale: 0.95 }}
            disabled={showFeedback}
          >
            {option}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-2xl ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}
          >
            <div className="flex items-center justify-center gap-2 text-lg font-bold">
              {isCorrect ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-green-800">Great listening! 🎉</span>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-600" />
                  <span className="text-red-800">Good try! The answer was "{currentWord}" 💪</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 text-sm text-gray-600">
        Word {currentWordIndex + 1} of {words.length} • Score: {score}/{words.length}
      </div>

      <audio ref={audioRef} preload="metadata" />
    </div>
  );
};

export default EnhancedGamePlayer;