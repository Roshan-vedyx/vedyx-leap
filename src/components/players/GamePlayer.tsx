import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, RefreshCw, CheckCircle, XCircle, Star } from 'lucide-react';

interface GamePlayerProps {
  id: string;
  gameType: 'syllableTap' | 'dragSpelling' | 'phonemeMatch';
  prompt: string;
  words: string[];
  phonemes?: string[][];
  audioMap?: Record<string, string>;
  onComplete?: (score: number) => void;
}

// Syllable Tap Game
const SyllableTapGame: React.FC<{
  words: string[];
  phonemes?: string[][];
  audioMap?: Record<string, string>;
  onComplete?: (score: number) => void;
}> = ({ words, phonemes = [], audioMap = {}, onComplete }) => {
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

// Drag Spelling Game
const DragSpellingGame: React.FC<{
  words: string[];
  onComplete?: (score: number) => void;
}> = ({ words, onComplete }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userSpelling, setUserSpelling] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentWord = words[currentWordIndex];
  const targetLetters = currentWord.split('');

  useEffect(() => {
    // Shuffle letters and add some extras
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

      {/* Spelling Area */}
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

      {/* Available Letters */}
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

// Simple Phoneme Match Game
const PhonemeMatchGame: React.FC<{
  words: string[];
  audioMap?: Record<string, string>;
  onComplete?: (score: number) => void;
}> = ({ words, audioMap = {}, onComplete }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentWord = words[currentWordIndex];

  useEffect(() => {
    // Generate options (correct word + 2-3 distractors)
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

const GamePlayer: React.FC<GamePlayerProps> = ({ 
  gameType, 
  prompt, 
  words, 
  phonemes, 
  audioMap, 
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
          You scored {finalScore} out of {words.length}!
        </p>
        <div className="text-6xl mb-4">
          {finalScore === words.length ? '🏆' : finalScore >= words.length * 0.7 ? '🌟' : '💪'}
        </div>
        <p className="text-lg text-gray-700">
          {finalScore === words.length 
            ? 'Perfect score! You\'re a literacy champion!' 
            : finalScore >= words.length * 0.7
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
      </div>
    </div>
  );
};

export default GamePlayer;