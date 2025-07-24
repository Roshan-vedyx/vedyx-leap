import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, ArrowLeft, ArrowRight, Home, RotateCcw, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

interface PhonemePlayerProps {
  onComplete?: () => void;
  selectedPhonemes?: string[]; // Optional: specific phonemes to practice
}

const PhonemePlayer: React.FC<PhonemePlayerProps> = ({ 
  onComplete,
  selectedPhonemes 
}) => {
  const navigate = useNavigate();
  const { childName, selectedAvatar, accent } = useAppState();
  
  const [phonemes, setPhonemes] = useState<Phoneme[]>([]);
  const [currentPhonemeIndex, setCurrentPhonemeIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPhonemeSymbol, setShowPhonemeSymbol] = useState(false);

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
        setIsLoading(false);
        
        // Set accent for audio manager
        audioManager.setAccent(accent);
      } catch (error) {
        console.error('Failed to load phonemes:', error);
        setIsLoading(false);
      }
    };

    loadPhonemes();
  }, [selectedPhonemes, accent]);

  const currentPhoneme = phonemes[currentPhonemeIndex];
  const currentWord = currentPhoneme?.words[currentWordIndex];

  // Play current word audio
  const playWordAudio = useCallback(async () => {
    if (!currentWord || isPlaying) return;
    
    setIsPlaying(true);
    try {
      await audioManager.resumeAudioContext();
      // Stop any currently playing sounds first
      audioManager.stopAllSounds?.();
      await audioManager.playPhonemeSound(currentWord.audio);
    } catch (error) {
      console.error('Failed to play word audio:', error);
    } finally {
      // Add a small delay before allowing next play
      setTimeout(() => {
        setIsPlaying(false);
      }, 100);
    }
  }, [currentWord]); // Removed isPlaying from dependencies

  // Auto-play on word change
  useEffect(() => {
    if (currentWord && !isLoading) {
      // Delay auto-play slightly for smooth transitions
      const timer = setTimeout(() => {
        playWordAudio();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentWord, isLoading]); // Removed playWordAudio from dependencies to prevent extra calls

  // Navigation functions
  const goToNextWord = useCallback(() => {
    if (!currentPhoneme) return;
    
    if (currentWordIndex < currentPhoneme.words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else if (currentPhonemeIndex < phonemes.length - 1) {
      setCurrentPhonemeIndex(prev => prev + 1);
      setCurrentWordIndex(0);
    } else {
      // Completed all phonemes
      onComplete?.();
    }
  }, [currentPhoneme, currentWordIndex, currentPhonemeIndex, phonemes.length, onComplete]);

  const goToPreviousWord = useCallback(() => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(prev => prev - 1);
    } else if (currentPhonemeIndex > 0) {
      setCurrentPhonemeIndex(prev => prev - 1);
      setCurrentWordIndex(phonemes[currentPhonemeIndex - 1]?.words.length - 1 || 0);
    }
  }, [currentWordIndex, currentPhonemeIndex, phonemes]);

  const resetToBeginning = useCallback(() => {
    setCurrentPhonemeIndex(0);
    setCurrentWordIndex(0);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
        case ' ':
          event.preventDefault();
          goToNextWord();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          goToPreviousWord();
          break;
        case 'r':
        case 'R':
          event.preventDefault();
          playWordAudio();
          break;
        case 'p':
        case 'P':
          event.preventDefault();
          setShowPhonemeSymbol(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToNextWord, goToPreviousWord, playWordAudio]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-xl font-medium text-gray-600">Loading phonemes...</p>
        </div>
      </div>
    );
  }

  if (!currentPhoneme || !currentWord) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl font-medium text-gray-600">No phonemes available</p>
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

  const totalWords = phonemes.reduce((total, phoneme) => total + phoneme.words.length, 0);
  const currentPosition = phonemes.slice(0, currentPhonemeIndex).reduce((total, phoneme) => total + phoneme.words.length, 0) + currentWordIndex + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-blue-50 to-purple-50 p-4">
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
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowPhonemeSymbol(!showPhonemeSymbol)}
            className={`p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 ${
              showPhonemeSymbol ? 'bg-purple-100' : 'bg-white'
            }`}
            title="Toggle phoneme symbol"
          >
            <BookOpen className={`w-6 h-6 ${showPhonemeSymbol ? 'text-purple-600' : 'text-gray-600'}`} />
          </button>
          
          <button
            onClick={resetToBeginning}
            className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
            title="Reset to beginning"
          >
            <RotateCcw className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white rounded-full p-2 shadow-lg">
          <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-mint-400 to-blue-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentPosition / totalWords) * 100}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            />
          </div>
          <div className="text-center mt-2 text-sm font-medium text-gray-600">
            Word {currentPosition} of {totalWords} • Phoneme {currentPhonemeIndex + 1} of {phonemes.length}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentPhonemeIndex}-${currentWordIndex}`}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-gray-100"
          >
            {/* Phoneme Info */}
            <div className="text-center mb-8">
              <AnimatePresence>
                {showPhonemeSymbol && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="mb-4"
                  >
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      {currentPhoneme.phoneme}
                    </div>
                    <div className="text-lg text-gray-600">
                      Letters: <span className="font-semibold">{currentPhoneme.grapheme}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Word Display */}
            <div className="text-center mb-8">
              <motion.div
                className="text-8xl mb-6"
                animate={{ 
                  scale: isPlaying ? 1.1 : 1,
                  rotate: isPlaying ? [0, -5, 5, 0] : 0
                }}
                transition={{ duration: 0.3 }}
              >
                {currentWord.emoji}
              </motion.div>
              
              <motion.h2
                className="text-4xl font-bold text-gray-800 mb-4"
                animate={{ scale: isPlaying ? 1.05 : 1 }}
                transition={{ duration: 0.3 }}
              >
                {currentWord.word}
              </motion.h2>

              {/* Play Button */}
              <motion.button
                onClick={playWordAudio}
                disabled={isPlaying}
                className={`p-4 rounded-full shadow-lg transition-all ${
                  isPlaying 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 hover:scale-110 active:scale-95'
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <Volume2 className={`w-8 h-8 ${isPlaying ? 'text-gray-500' : 'text-white'}`} />
              </motion.button>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center">
              <button
                onClick={goToPreviousWord}
                disabled={currentPhonemeIndex === 0 && currentWordIndex === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                  currentPhonemeIndex === 0 && currentWordIndex === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
                Previous
              </button>

              <div className="flex gap-2">
                {currentPhoneme.words.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentWordIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentWordIndex
                        ? 'bg-mint-500 scale-125'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={goToNextWord}
                className="flex items-center gap-2 px-6 py-3 bg-mint-500 text-white rounded-full font-medium hover:bg-mint-600 transition-all hover:scale-105"
              >
                {currentPhonemeIndex === phonemes.length - 1 && 
                 currentWordIndex === currentPhoneme.words.length - 1 ? 'Finish' : 'Next'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 right-4 bg-white rounded-lg p-3 shadow-lg text-xs text-gray-600 max-w-xs">
        <div className="font-semibold mb-1">Keyboard Shortcuts:</div>
        <div>→ or Space: Next word</div>
        <div>← : Previous word</div>
        <div>R: Repeat audio</div>
        <div>P: Toggle phoneme symbol</div>
      </div>
    </div>
  );
};

export default PhonemePlayer;