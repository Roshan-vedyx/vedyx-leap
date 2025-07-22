import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, MessageCircle, Brain, Star } from 'lucide-react';

interface ScenarioPlayerProps {
  id: string;
  situation: string;
  options: { text: string; correct: boolean; }[];
  feedback: { correct: string; incorrect: string; };
  onComplete?: (success: boolean) => void;
}

const ScenarioPlayer: React.FC<ScenarioPlayerProps> = ({ 
  situation, 
  options, 
  feedback, 
  onComplete 
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleOptionSelect = (index: number) => {
    if (showFeedback) return;

    const option = options[index];
    setSelectedOption(index);
    setIsCorrect(option.correct);
    setShowFeedback(true);
    setAttempts(prev => prev + 1);

    // Auto-advance after showing feedback
    setTimeout(() => {
      if (option.correct) {
        onComplete?.(true);
      } else {
        // Allow retry for incorrect answers
        setShowFeedback(false);
        setSelectedOption(null);
      }
    }, 3000);
  };

  const tryAgain = () => {
    setShowFeedback(false);
    setSelectedOption(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl p-6 md:p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-block mb-4"
          >
            <Brain className="w-12 h-12 text-purple-500" />
          </motion.div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Real-Life Scenario</h1>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto"></div>
        </div>

        {/* Scenario Description */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-start gap-4">
            <MessageCircle className="w-8 h-8 text-purple-500 flex-shrink-0 mt-1" />
            <p className="text-lg md:text-xl leading-relaxed text-gray-800 font-medium">
              {situation}
            </p>
          </div>
        </motion.div>

        {/* Attempt Counter */}
        {attempts > 0 && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
              <span className="text-sm text-gray-600">Attempt {attempts}</span>
              {attempts > 1 && <span className="text-sm text-gray-500">• Keep trying!</span>}
            </div>
          </div>
        )}

        {/* Options */}
        <div className="space-y-4 mb-8">
          {options.map((option, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              onClick={() => handleOptionSelect(index)}
              disabled={showFeedback}
              className={`w-full p-4 md:p-6 rounded-2xl text-left transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                selectedOption === index
                  ? isCorrect
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-red-500 text-white shadow-lg'
                  : showFeedback
                    ? option.correct
                      ? 'bg-green-100 border-2 border-green-300 text-green-800'
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg text-gray-800'
              }`}
              whileHover={!showFeedback ? { scale: 1.02 } : {}}
              whileTap={!showFeedback ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  selectedOption === index
                    ? 'bg-white bg-opacity-20 text-white'
                    : showFeedback && option.correct
                      ? 'bg-green-500 text-white'
                      : 'bg-purple-100 text-purple-600'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="text-lg md:text-xl font-medium flex-1">
                  {option.text}
                </span>
                {showFeedback && selectedOption === index && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <XCircle className="w-6 h-6 text-white" />
                    )}
                  </motion.div>
                )}
                {showFeedback && !selectedOption && option.correct && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Feedback Section */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`p-6 rounded-2xl mb-6 ${
                isCorrect 
                  ? 'bg-green-100 border-2 border-green-300' 
                  : 'bg-red-100 border-2 border-red-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  {isCorrect ? (
                    <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                  )}
                </motion.div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-2 ${
                    isCorrect ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {isCorrect ? 'Excellent Choice!' : 'Not Quite Right'}
                  </h3>
                  <p className={`text-base leading-relaxed ${
                    isCorrect ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {isCorrect ? feedback.correct : feedback.incorrect}
                  </p>
                </div>
              </div>

              {/* Encouragement for incorrect answers */}
              {!isCorrect && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-4 pt-4 border-t border-red-200"
                >
                  <p className="text-red-700 text-center font-medium">
                    💪 Don't worry! Learning takes practice. Try again!
                  </p>
                </motion.div>
              )}

              {/* Success celebration for correct answers */}
              {isCorrect && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="mt-4 pt-4 border-t border-green-200 text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-green-800 font-bold">Great thinking!</span>
                    <Star className="w-5 h-5 text-yellow-500" />
                  </div>
                  <p className="text-green-700">
                    You're getting really good at this! 🎉
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        {showFeedback && !isCorrect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="text-center"
          >
            <button
              onClick={tryAgain}
              className="px-6 py-3 bg-purple-500 text-white rounded-2xl font-bold hover:bg-purple-600 transition-all transform hover:scale-105 active:scale-95"
            >
              Try Again 🔄
            </button>
          </motion.div>
        )}

        {/* Progress Indicator */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
            <Brain className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {isCorrect ? 'Scenario Complete!' : 'Think it through...'}
            </span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-6 right-6 opacity-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <MessageCircle className="w-16 h-16 text-purple-400" />
          </motion.div>
        </div>
        
        <div className="absolute bottom-6 left-6 opacity-10">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Star className="w-12 h-12 text-pink-400" />
          </motion.div>
        </div>

        {/* Floating encouragement bubbles for multiple attempts */}
        <AnimatePresence>
          {attempts > 2 && !isCorrect && (
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0, y: -50 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-100 border-2 border-yellow-300 rounded-2xl p-4 shadow-lg z-10"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🤔</div>
                <p className="text-sm text-yellow-800 font-medium">
                  Take your time!<br />
                  Read each choice carefully.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ScenarioPlayer;