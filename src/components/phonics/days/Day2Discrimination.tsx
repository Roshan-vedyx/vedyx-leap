import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, RotateCcw } from 'lucide-react';
import { DayComponentProps } from '../WeeklyPhonemeScreen';
import WordCard from '../shared/WordCard';

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

const Day2Discrimination: React.FC<DayComponentProps> = ({ phoneme, phonemes, audioManager, onComplete, accent }) => {
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [showDiscriminationFeedback, setShowDiscriminationFeedback] = useState(false);
  const [discriminationWords, setDiscriminationWords] = useState<PhonemeWord[]>([]);
  const [correctWords, setCorrectWords] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);

  const setupDiscriminationGame = useCallback(() => {
    if (!phoneme || !phonemes || phonemes.length === 0) {
      console.error('Invalid phoneme or phonemes array', { phoneme, phonemes });
      return;
    }

    const currentPhonemeWords = phoneme.words.slice(0, 3);
    const otherPhonemes = phonemes.filter(p => p.id !== phoneme.id);
    const incorrectWords: PhonemeWord[] = [];
    
    while (incorrectWords.length < 3 && otherPhonemes.length > 0) {
      const randomPhoneme = otherPhonemes[Math.floor(Math.random() * otherPhonemes.length)];
      const randomWord = randomPhoneme.words[Math.floor(Math.random() * randomPhoneme.words.length)];
      
      if (!incorrectWords.some(w => w.word === randomWord.word) && 
          !currentPhonemeWords.some(w => w.word === randomWord.word)) {
        incorrectWords.push(randomWord);
      }
    }

    if (currentPhonemeWords.length < 3 || incorrectWords.length < 3) {
      console.warn('Insufficient words for discrimination game', {
        currentPhonemeWords: currentPhonemeWords.length,
        incorrectWords: incorrectWords.length
      });
    }

    const allWords = [...currentPhonemeWords, ...incorrectWords];
    const shuffledWords = allWords.sort(() => Math.random() - 0.5);
    
    console.log('Discrimination game setup:', {
      phoneme: phoneme.id,
      correctWords: currentPhonemeWords.map(w => w.word),
      incorrectWords: incorrectWords.map(w => w.word),
      shuffledWords: shuffledWords.map(w => w.word)
    });
    
    setDiscriminationWords(shuffledWords);
    setCorrectWords(new Set(currentPhonemeWords.map(w => w.word)));
    setSelectedWords(new Set());
    setShowDiscriminationFeedback(false);
  }, [phoneme, phonemes]);

  useEffect(() => {
    setupDiscriminationGame();
  }, [setupDiscriminationGame]);

  const handleWordSelection = useCallback((word: PhonemeWord) => {
    if (isPlaying || showDiscriminationFeedback) return;

    setIsPlaying(true);
    const newSelectedWords = new Set(selectedWords);
    if (newSelectedWords.has(word.word)) {
      newSelectedWords.delete(word.word);
    } else {
      newSelectedWords.add(word.word);
    }
    setSelectedWords(newSelectedWords);

    console.log('Word selected:', {
      word: word.word,
      selectedWords: Array.from(newSelectedWords)
    });

    audioManager.playPhonemeSound(word.audio[accent])
      .then(() => setIsPlaying(false))
      .catch((error) => {
        console.error('Failed to play word audio:', error);
        setIsPlaying(false);
      });
  }, [selectedWords, isPlaying, showDiscriminationFeedback, audioManager, accent]);

  const checkDiscriminationAnswers = useCallback(() => {
    if (isPlaying) return;

    setShowDiscriminationFeedback(true);
    const allCorrectSelected = Array.from(correctWords).every(word => selectedWords.has(word));
    const noIncorrectSelected = Array.from(selectedWords).every(word => correctWords.has(word));
    const isSuccess = allCorrectSelected && noIncorrectSelected && selectedWords.size > 0;

    console.log('Checking answers:', {
      selectedWords: Array.from(selectedWords),
      correctWords: Array.from(correctWords),
      allCorrectSelected,
      noIncorrectSelected,
      isSuccess
    });

    if (isSuccess) {
      setTimeout(() => {
        audioManager.playSound('/sounds/success.mp3')
          .catch(console.error);
      }, 500);
    } else {
      setTimeout(() => {
        audioManager.playSound('/sounds/try-again.mp3').catch(console.error);
      }, 500);
    }
  }, [selectedWords, correctWords, audioManager, isPlaying]);

  if (discriminationWords.length === 0) {
    return (
      <div className="text-center text-gray-600">
        Unable to load words for this phoneme. Please try another phoneme.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-8"
    >
      <h3 className="text-3xl font-bold text-gray-700">
        Can you hear {phoneme.phoneme}?
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        {discriminationWords.map((word, index) => (
          <WordCard
            key={word.word}
            word={word}
            isSelected={selectedWords.has(word.word)}
            isCorrect={correctWords.has(word.word)}
            showFeedback={showDiscriminationFeedback}
            onSelect={() => handleWordSelection(word)}
            index={index}
            phoneme={phoneme}
            phonemes={phonemes}
            audioManager={audioManager}
            accent={accent}
            childName=""
          />
        ))}
      </div>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          Listen carefully and tap the words that start with {phoneme.phoneme}!
        </p>
        
        {!showDiscriminationFeedback && selectedWords.size > 0 && (
          <motion.button
            onClick={checkDiscriminationAnswers}
            className="px-6 py-3 bg-gradient-to-r from-blue-400 to-indigo-400 text-white rounded-full shadow-lg font-medium hover:shadow-xl transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            disabled={isPlaying}
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
               Array.from(selectedWords).every(word => correctWords.has(word)) && 
               selectedWords.size > 0 ? (
                <div className="text-green-600 flex items-center justify-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  Perfect! You found all the {phoneme.phoneme} words!
                </div>
              ) : (
                <div className="text-blue-600">
                  Good try! The {phoneme.phoneme} words were highlighted in green.
                </div>
              )}
            </div>
            
            <motion.button
              onClick={setupDiscriminationGame}
              className="px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full shadow-lg font-medium hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-5 h-5 inline mr-2" />
              Try Again
            </motion.button>

            {Array.from(correctWords).every(word => selectedWords.has(word)) && 
             Array.from(selectedWords).every(word => correctWords.has(word)) && 
             selectedWords.size > 0 && (
              <motion.button
                onClick={() => {
                  console.log('Continue to Tomorrow clicked');
                  onComplete();
                }}
                className="px-8 py-4 bg-gradient-to-r from-mint-400 to-blue-400 text-white rounded-full shadow-lg text-lg font-medium hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="w-5 h-5 inline mr-2">✨</span>
                Continue to Tomorrow
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Day2Discrimination;