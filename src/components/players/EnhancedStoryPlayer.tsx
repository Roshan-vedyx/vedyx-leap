import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

interface ComprehensionQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface EnhancedStoryPlayerProps {
  id: string;
  title: string;
  text: string[];
  audioUrls?: string[];
  illustrations?: string[];
  comprehensionQuestions?: ComprehensionQuestion[];
  onComplete?: (score?: number) => void;
}

const EnhancedStoryPlayer: React.FC<EnhancedStoryPlayerProps> = ({ 
  title, 
  text, 
  audioUrls = [], 
  illustrations = [],
  comprehensionQuestions = [],
  onComplete 
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [storyComplete, setStoryComplete] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [questionResults, setQuestionResults] = useState<boolean[]>([]);
  const [showQuestionFeedback, setShowQuestionFeedback] = useState(false);
  const [allQuestionsComplete, setAllQuestionsComplete] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const hasAudio = audioUrls.length > 0;
  const hasIllustrations = illustrations.length > 0;
  const hasQuestions = comprehensionQuestions.length > 0;
  const currentAudio = audioUrls[currentPage];
  const currentIllustration = hasIllustrations ? illustrations[Math.min(currentPage, illustrations.length - 1)] : null;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        setIsPlaying(false);
        if (isAutoPlay && currentPage < text.length - 1) {
          setTimeout(() => {
            setCurrentPage(prev => prev + 1);
          }, 1000);
        }
      };
    }
  }, [currentPage, isAutoPlay, text.length]);

  const playAudio = async () => {
    if (!hasAudio || !currentAudio || !audioRef.current) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.src = currentAudio;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const nextPage = () => {
    if (currentPage < text.length - 1) {
      setCurrentPage(prev => prev + 1);
      setIsPlaying(false);
    } else {
      // Story finished
      setStoryComplete(true);
      if (hasQuestions) {
        setShowQuestions(true);
      } else {
        onComplete?.();
      }
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      setIsPlaying(false);
    }
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay(prev => !prev);
    if (!isAutoPlay && hasAudio) {
      playAudio();
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showQuestionFeedback) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === comprehensionQuestions[currentQuestionIndex].correct;
    setQuestionResults(prev => [...prev, isCorrect]);
    setShowQuestionFeedback(true);

    setTimeout(() => {
      if (currentQuestionIndex < comprehensionQuestions.length - 1) {
        // Next question
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowQuestionFeedback(false);
      } else {
        // All questions complete
        setAllQuestionsComplete(true);
        const finalScore = questionResults.filter(result => result).length + (isCorrect ? 1 : 0);
        setTimeout(() => {
          onComplete?.(finalScore);
        }, 2000);
      }
    }, 2500);
  };

  // Questions Complete Screen
  if (allQuestionsComplete) {
    const correctAnswers = questionResults.filter(result => result).length;
    const totalQuestions = comprehensionQuestions.length;
    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

    return (
      <div className="max-w-4xl mx-auto p-4 bg-gradient-to-br from-purple-50 via-blue-50 to-mint-50 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-lg"
        >
          <motion.div
            animate={{ 
              rotate: scorePercentage >= 70 ? [0, 10, -10, 0] : 0,
              scale: scorePercentage >= 70 ? [1, 1.1, 1] : 1
            }}
            transition={{ repeat: scorePercentage >= 70 ? Infinity : 0, duration: 2 }}
            className="mb-6"
          >
            <CheckCircle className={`w-16 h-16 mx-auto ${scorePercentage >= 70 ? 'text-green-500' : 'text-orange-500'}`} />
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {scorePercentage >= 70 ? 'Great Reading!' : 'Good Job Reading!'}
          </h2>

          <div className="text-6xl mb-4">
            {scorePercentage >= 70 ? '🌟' : '📚'}
          </div>

          <p className="text-xl text-gray-700 mb-6">
            You answered {correctAnswers} out of {totalQuestions} questions correctly!
          </p>

          <div className={`p-4 rounded-2xl ${scorePercentage >= 70 ? 'bg-green-100' : 'bg-blue-100'}`}>
            <p className={`text-lg font-medium ${scorePercentage >= 70 ? 'text-green-800' : 'text-blue-800'}`}>
              {scorePercentage >= 70 
                ? 'Excellent understanding! You really got the story!' 
                : 'Good reading! Let\'s practice more stories to improve comprehension.'}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Questions Phase
  if (showQuestions && !allQuestionsComplete) {
    const currentQuestion = comprehensionQuestions[currentQuestionIndex];
    
    return (
      <div className="max-w-4xl mx-auto p-4 bg-gradient-to-br from-purple-50 via-blue-50 to-mint-50 min-h-screen">
        {/* Question Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Understanding "{title}"
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <span>Question {currentQuestionIndex + 1} of {comprehensionQuestions.length}</span>
            <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-400 to-mint-400"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestionIndex + 1) / comprehensionQuestions.length) * 100}%` }}
                transition={{ type: "spring", stiffness: 100 }}
              />
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <HelpCircle className="w-8 h-8 text-blue-500" />
                <h3 className="text-2xl font-bold text-gray-800">
                  {currentQuestion.question}
                </h3>
              </div>

              <div className="grid gap-4 max-w-md mx-auto mb-8">
                {currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showQuestionFeedback}
                    className={`p-4 rounded-2xl text-lg font-medium transition-all transform hover:scale-105 ${
                      selectedAnswer === index
                        ? questionResults[currentQuestionIndex] !== undefined 
                          ? questionResults[currentQuestionIndex] || (selectedAnswer === currentQuestion.correct)
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                          : 'bg-mint-500 text-white scale-105'
                        : showQuestionFeedback && index === currentQuestion.correct
                          ? 'bg-green-300 text-green-800 border-2 border-green-500'
                          : showQuestionFeedback
                            ? 'bg-gray-200 text-gray-600'
                            : 'bg-white text-gray-700 shadow-md hover:shadow-lg border-2 border-gray-200 hover:border-mint-300'
                    }`}
                    whileTap={{ scale: showQuestionFeedback ? 1 : 0.95 }}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>

              {/* Question Feedback */}
              <AnimatePresence>
                {showQuestionFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-6"
                  >
                    {(selectedAnswer === currentQuestion.correct) ? (
                      <div className="flex items-center justify-center gap-2 text-lg font-bold text-green-600 bg-green-100 p-4 rounded-2xl">
                        <CheckCircle className="w-6 h-6" />
                        <span>Correct! Great understanding! 🌟</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-lg font-bold text-red-600 bg-red-100 p-4 rounded-2xl">
                          <XCircle className="w-6 h-6" />
                          <span>Not quite! 💭</span>
                        </div>
                        <div className="text-md text-gray-700 bg-blue-50 p-3 rounded-xl">
                          The correct answer is: <strong>{currentQuestion.options[currentQuestion.correct]}</strong>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Story Reading Phase (Original + Enhanced)
  return (
    <div className="max-w-4xl mx-auto p-4 bg-gradient-to-br from-purple-50 via-blue-50 to-mint-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{title}</h1>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <span>Page {currentPage + 1} of {text.length}</span>
          <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-mint-400 to-blue-400"
              initial={{ width: 0 }}
              animate={{ width: `${((currentPage + 1) / text.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 100 }}
            />
          </div>
        </div>
        
        {hasQuestions && (
          <div className="mt-2 text-sm text-blue-600 font-medium">
            📚 Questions will follow the story
          </div>
        )}
      </div>

      {/* Story Content */}
      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-6">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Illustration */}
          {currentIllustration && (
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="order-1 md:order-1"
            >
              <img
                src={currentIllustration}
                alt={`Story illustration ${currentPage + 1}`}
                className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-lg"
              />
            </motion.div>
          )}

          {/* Text Content */}
          <div className={`order-2 md:order-2 ${!currentIllustration ? 'md:col-span-2' : ''}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="text-center"
              >
                <p className="text-xl md:text-2xl leading-relaxed text-gray-800 font-medium mb-6">
                  {text[currentPage]}
                </p>
                
                {/* Audio Controls */}
                {hasAudio && currentAudio && (
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <button
                      onClick={playAudio}
                      className={`p-3 rounded-full transition-all transform hover:scale-110 active:scale-95 ${
                        isPlaying 
                          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      }`}
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </button>
                    
                    <button
                      onClick={toggleAutoPlay}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isAutoPlay 
                          ? 'bg-mint-100 text-mint-700 border-2 border-mint-300' 
                          : 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      <Volume2 className="w-4 h-4 inline mr-1" />
                      Auto-read {isAutoPlay ? 'ON' : 'OFF'}
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all transform hover:scale-105 active:scale-95 ${
            currentPage === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 shadow-lg hover:shadow-xl'
          }`}
        >
          <SkipBack className="w-5 h-5" />
          Previous
        </button>

        {/* Page Dots */}
        <div className="flex gap-2">
          {text.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentPage(index);
                setIsPlaying(false);
              }}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentPage
                  ? 'bg-mint-500 scale-125'
                  : index <= currentPage
                    ? 'bg-mint-300'
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextPage}
          className="flex items-center gap-2 px-6 py-3 bg-mint-500 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl hover:bg-mint-600 transition-all transform hover:scale-105 active:scale-95"
        >
          {currentPage === text.length - 1 ? (hasQuestions ? 'Answer Questions' : 'Complete Story') : 'Next'}
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Hidden Audio Element */}
      {hasAudio && <audio ref={audioRef} preload="metadata" />}
    </div>
  );
};

export default EnhancedStoryPlayer;