import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, RotateCcw, Lightbulb, Target, Users, MapPin } from 'lucide-react';

interface ScenarioOption {
  text: string;
  correct: boolean;
  feedback?: string;
}

interface EnhancedScenarioPlayerProps {
  id: string;
  situation: string;
  context?: string; // Additional context for the scenario
  options: ScenarioOption[];
  feedback: {
    correct: string;
    incorrect: string;
  };
  difficulty?: 'guided' | 'independent' | 'challenge';
  hints?: string[]; // Available hints for guided mode
  illustration?: string;
  onComplete?: (passed: boolean, attempts: number) => void;
}

const EnhancedScenarioPlayer: React.FC<EnhancedScenarioPlayerProps> = ({
  situation,
  context,
  options,
  feedback,
  difficulty = 'independent',
  hints = [],
  illustration,
  onComplete
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const selectedAnswer = selectedOption !== null ? options[selectedOption] : null;
  const isCorrect = selectedAnswer?.correct || false;
  const maxAttempts = difficulty === 'guided' ? 3 : difficulty === 'independent' ? 2 : 1;

  const handleOptionSelect = (index: number) => {
    if (hasAnswered || isComplete) return;
    
    setSelectedOption(index);
    setHasAnswered(true);
    setAttempts(prev => prev + 1);

    const correct = options[index].correct;
    
    if (correct || attempts + 1 >= maxAttempts) {
      // Either got it right, or used all attempts
      setTimeout(() => {
        setIsComplete(true);
        onComplete?.(correct, attempts + 1);
      }, 3000);
    }
  };

  const handleRetry = () => {
    setSelectedOption(null);
    setHasAnswered(false);
    // Don't reset attempts - that's our tracking mechanism
  };

  const showNextHint = () => {
    if (currentHintIndex < hints.length - 1) {
      setCurrentHintIndex(prev => prev + 1);
    }
    setShowHint(true);
  };

  const getDifficultyInfo = () => {
    switch (difficulty) {
      case 'guided':
        return {
          icon: <Lightbulb className="w-6 h-6 text-yellow-500" />,
          label: 'Guided Practice',
          description: 'Hints available • Multiple tries',
          bgColor: 'from-yellow-50 to-orange-50'
        };
      case 'independent':
        return {
          icon: <Target className="w-6 h-6 text-blue-500" />,
          label: 'Independent Practice', 
          description: 'Limited tries • Think carefully',
          bgColor: 'from-blue-50 to-purple-50'
        };
      case 'challenge':
        return {
          icon: <Users className="w-6 h-6 text-red-500" />,
          label: 'Real-World Challenge',
          description: 'One chance • Just like real life',
          bgColor: 'from-red-50 to-pink-50'
        };
    }
  };

  const difficultyInfo = getDifficultyInfo();

  if (isComplete) {
    return (
      <div className={`max-w-4xl mx-auto p-4 bg-gradient-to-br ${difficultyInfo.bgColor} min-h-screen flex items-center justify-center`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-lg"
        >
          <motion.div
            animate={{ 
              rotate: isCorrect ? [0, 10, -10, 0] : 0,
              scale: isCorrect ? [1, 1.1, 1] : 1
            }}
            transition={{ repeat: isCorrect ? Infinity : 0, duration: 2 }}
            className="mb-6"
          >
            {isCorrect ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            ) : (
              <XCircle className="w-16 h-16 text-orange-500 mx-auto" />
            )}
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {isCorrect ? 'Perfect Choice!' : 'Good Try!'}
          </h2>

          <div className="text-6xl mb-4">
            {isCorrect ? '🎉' : attempts === 1 ? '💪' : '🤔'}
          </div>

          <p className="text-lg text-gray-700 mb-6">
            {isCorrect 
              ? `You got it ${attempts === 1 ? 'on your first try' : `in ${attempts} tries`}!`
              : `You tried ${attempts} times. That shows persistence!`}
          </p>

          <div className={`p-4 rounded-2xl ${isCorrect ? 'bg-green-100' : 'bg-blue-100'}`}>
            <p className={`text-md font-medium ${isCorrect ? 'text-green-800' : 'text-blue-800'}`}>
              {isCorrect ? feedback.correct : feedback.incorrect}
            </p>
            
            {/* Show correct answer if they didn't get it */}
            {!isCorrect && (
              <div className="mt-3 p-3 bg-white rounded-xl border-2 border-gray-200">
                <p className="text-sm text-gray-600 mb-2">The best choice was:</p>
                <p className="font-semibold text-gray-800">
                  "{options.find(opt => opt.correct)?.text}"
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-4 bg-gradient-to-br ${difficultyInfo.bgColor} min-h-screen`}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          {difficultyInfo.icon}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {difficultyInfo.label}
            </h1>
            <p className="text-sm text-gray-600">{difficultyInfo.description}</p>
          </div>
        </div>

        {/* Attempts indicator */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <span>Attempt {attempts + 1} of {maxAttempts}</span>
          <div className="flex gap-1">
            {Array.from({ length: maxAttempts }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index < attempts ? 'bg-gray-400' : 
                  index === attempts ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Illustration */}
          {illustration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="order-1 md:order-1"
            >
              <img
                src={illustration}
                alt="Scenario illustration"
                className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-lg"
              />
            </motion.div>
          )}

          {/* Content */}
          <div className={`order-2 md:order-2 ${!illustration ? 'md:col-span-2' : ''}`}>
            {/* Context */}
            {context && (
              <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <p className="text-blue-800 font-medium">{context}</p>
                </div>
              </div>
            )}

            {/* Situation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                What would you do?
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed bg-gray-50 rounded-2xl p-6">
                {situation}
              </p>
            </motion.div>

            {/* Hints (for guided mode) */}
            {difficulty === 'guided' && hints.length > 0 && (
              <div className="mb-6">
                {!showHint && !hasAnswered && (
                  <button
                    onClick={showNextHint}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-2xl font-medium hover:bg-yellow-200 transition-all"
                  >
                    <Lightbulb className="w-4 h-4" />
                    Need a hint?
                  </button>
                )}
                
                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-yellow-800 font-medium">💡 Hint:</p>
                          <p className="text-yellow-700">{hints[currentHintIndex]}</p>
                          
                          {currentHintIndex < hints.length - 1 && !hasAnswered && (
                            <button
                              onClick={showNextHint}
                              className="mt-2 text-sm text-yellow-600 hover:text-yellow-800 font-medium"
                            >
                              Need another hint? →
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Options */}
            <div className="space-y-4 mb-6">
              {options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  disabled={hasAnswered && !isComplete}
                  className={`w-full p-4 rounded-2xl text-left font-medium transition-all transform hover:scale-105 ${
                    selectedOption === index
                      ? isCorrect
                        ? 'bg-green-500 text-white shadow-lg scale-105'
                        : 'bg-red-500 text-white shadow-lg scale-105'
                      : hasAnswered && option.correct
                        ? 'bg-green-200 text-green-800 border-2 border-green-400'
                        : hasAnswered
                          ? 'bg-gray-200 text-gray-600'
                          : 'bg-white text-gray-700 shadow-md hover:shadow-lg border-2 border-gray-200 hover:border-mint-300'
                  }`}
                  whileTap={{ scale: hasAnswered ? 1 : 0.98 }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mt-1 ${
                      selectedOption === index
                        ? 'bg-white text-current opacity-90'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div className="flex-1">
                      <p>{option.text}</p>
                      {hasAnswered && option.feedback && selectedOption === index && (
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-sm opacity-90"
                        >
                          {option.feedback}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {hasAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6"
                >
                  {isCorrect ? (
                    <div className="flex items-center justify-center gap-2 text-lg font-bold text-green-600 bg-green-100 p-4 rounded-2xl">
                      <CheckCircle className="w-6 h-6" />
                      <span>Excellent choice! 🌟</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-lg font-bold text-red-600 bg-red-100 p-4 rounded-2xl">
                        <XCircle className="w-6 h-6" />
                        <span>Not the best choice this time! 💭</span>
                      </div>
                      
                      {/* Show specific feedback if available */}
                      {selectedAnswer?.feedback && (
                        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4">
                          <p className="text-orange-800 font-medium">
                            💡 {selectedAnswer.feedback}
                          </p>
                        </div>
                      )}

                      {/* Retry button if attempts remaining */}
                      {attempts < maxAttempts && (
                        <div className="text-center">
                          <button
                            onClick={handleRetry}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all transform hover:scale-105"
                          >
                            <RotateCcw className="w-5 h-5" />
                            Try Again ({maxAttempts - attempts} tries left)
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Instructions */}
            {!hasAnswered && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Think carefully and choose the best response.
                </p>
                
                {difficulty === 'guided' && (
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-full px-4 py-2">
                    <Lightbulb className="w-3 h-3" />
                    <span>Remember: You can ask for hints if you need help!</span>
                  </div>
                )}
                
                {difficulty === 'challenge' && (
                  <div className="flex items-center justify-center gap-2 text-xs text-red-600 bg-red-50 rounded-full px-4 py-2">
                    <Target className="w-3 h-3" />
                    <span>Challenge Mode: Choose wisely - you only get one chance!</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md">
          <div className={`w-3 h-3 rounded-full ${
            isComplete ? 'bg-green-500' : hasAnswered ? 'bg-yellow-500' : 'bg-blue-500'
          }`} />
          <span className="text-sm font-medium text-gray-700">
            {isComplete ? 'Complete!' : hasAnswered ? 'Answered' : 'In Progress'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedScenarioPlayer;