import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, CheckCircle, XCircle, Clock, AlertCircle, Star } from 'lucide-react';

interface AssessmentTask {
  id: string;
  type: 'wordReading' | 'soundIdentification' | 'comprehension';
  prompt: string;
  word?: string;
  audioUrl?: string;
  options?: string[];
  correct?: number;
  timeLimit?: number;
}

interface AssessmentPlayerProps {
  id: string;
  title: string;
  instructions: string;
  tasks: AssessmentTask[];
  passingScore: number;
  feedback: {
    pass: string;
    fail: string;
  };
  onComplete?: (passed: boolean, score: number, results: any[]) => void;
}

const AssessmentPlayer: React.FC<AssessmentPlayerProps> = ({
  title,
  instructions,
  tasks,
  passingScore,
  feedback,
  onComplete
}) => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [responses, setResponses] = useState<any[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showTaskFeedback, setShowTaskFeedback] = useState(false);
  const [finalResults, setFinalResults] = useState<{
    score: number;
    passed: boolean;
    totalTasks: number;
  } | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentTask = tasks[currentTaskIndex];
  const isLastTask = currentTaskIndex === tasks.length - 1;

  // Timer management
  useEffect(() => {
    if (currentTask?.timeLimit && timeRemaining === null) {
      setTimeRemaining(currentTask.timeLimit);
    }

    if (timeRemaining !== null && timeRemaining > 0 && !showTaskFeedback) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev! - 1);
      }, 1000);
    } else if (timeRemaining === 0 && !showTaskFeedback) {
      // Time up - auto-submit
      handleTaskResponse(null);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeRemaining, showTaskFeedback, currentTask]);

  const playAudio = async () => {
    if (!currentTask.audioUrl || !audioRef.current) return;
    
    try {
      audioRef.current.src = currentTask.audioUrl;
      await audioRef.current.play();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleTaskResponse = (response: any) => {
    if (showTaskFeedback) return;

    const isCorrect = currentTask.type === 'soundIdentification' || currentTask.type === 'comprehension'
      ? response === currentTask.correct
      : true; // For word reading, we assume they can read it if they respond

    const taskResult = {
      taskId: currentTask.id,
      response,
      correct: isCorrect,
      timeSpent: currentTask.timeLimit ? (currentTask.timeLimit - (timeRemaining || 0)) : null,
      timedOut: timeRemaining === 0
    };

    setResponses(prev => [...prev, taskResult]);
    setShowTaskFeedback(true);

    // Clear timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setTimeout(() => {
      if (isLastTask) {
        // Calculate final results
        const allResponses = [...responses, taskResult];
        const correctCount = allResponses.filter(r => r.correct).length;
        const score = correctCount / tasks.length;
        const passed = score >= passingScore;

        setFinalResults({
          score: Math.round(score * 100),
          passed,
          totalTasks: tasks.length
        });
        setIsComplete(true);
        onComplete?.(passed, score, allResponses);
      } else {
        // Move to next task
        setCurrentTaskIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowTaskFeedback(false);
        setTimeRemaining(null);
      }
    }, 2000);
  };

  const renderTask = () => {
    switch (currentTask.type) {
      case 'wordReading':
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-6">{currentTask.prompt}</h3>
            
            {/* Word Display */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-8 rounded-3xl shadow-lg mb-6 inline-block"
            >
              <div className="text-6xl font-bold text-gray-800 mb-4">
                {currentTask.word}
              </div>
            </motion.div>

            {/* Audio Button */}
            {currentTask.audioUrl && (
              <button
                onClick={playAudio}
                className="p-4 bg-blue-100 rounded-full hover:bg-blue-200 transition-all hover:scale-110 mb-6"
              >
                <Volume2 className="w-6 h-6 text-blue-600" />
              </button>
            )}

            {!showTaskFeedback && (
              <div className="space-y-4">
                <button
                  onClick={() => handleTaskResponse('read')}
                  className="px-8 py-4 bg-mint-500 text-white rounded-2xl font-bold text-xl hover:bg-mint-600 transition-all transform hover:scale-105"
                >
                  I can read this word! ✅
                </button>
                <div>
                  <button
                    onClick={() => handleTaskResponse('skip')}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl font-medium hover:bg-gray-300 transition-all"
                  >
                    Skip this word
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'soundIdentification':
      case 'comprehension':
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-6">{currentTask.prompt}</h3>
            
            {currentTask.word && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-6 rounded-3xl shadow-lg mb-6 inline-block"
              >
                <div className="text-4xl font-bold text-gray-800">
                  {currentTask.word}
                </div>
              </motion.div>
            )}

            {/* Audio Button */}
            {currentTask.audioUrl && (
              <button
                onClick={playAudio}
                className="p-4 bg-blue-100 rounded-full hover:bg-blue-200 transition-all hover:scale-110 mb-6"
              >
                <Volume2 className="w-6 h-6 text-blue-600" />
              </button>
            )}

            {/* Multiple Choice Options */}
            {!showTaskFeedback && currentTask.options && (
              <div className="grid gap-4 max-w-md mx-auto">
                {currentTask.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setSelectedAnswer(index);
                      handleTaskResponse(index);
                    }}
                    className={`p-4 rounded-2xl text-lg font-medium transition-all transform hover:scale-105 ${
                      selectedAnswer === index
                        ? 'bg-mint-500 text-white scale-105'
                        : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return <div>Unknown task type</div>;
    }
  };

  if (isComplete && finalResults) {
    return (
      <div className="max-w-4xl mx-auto p-4 bg-gradient-to-br from-purple-50 via-blue-50 to-mint-50 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-lg"
        >
          <motion.div
            animate={{ 
              rotate: finalResults.passed ? [0, 10, -10, 0] : 0,
              scale: finalResults.passed ? [1, 1.1, 1] : 1
            }}
            transition={{ repeat: finalResults.passed ? Infinity : 0, duration: 2 }}
            className="mb-6"
          >
            {finalResults.passed ? (
              <Star className="w-16 h-16 text-yellow-500 mx-auto" />
            ) : (
              <AlertCircle className="w-16 h-16 text-orange-500 mx-auto" />
            )}
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {finalResults.passed ? 'Great Job!' : 'Keep Practicing!'}
          </h2>

          <div className="text-6xl mb-4">
            {finalResults.passed ? '🎉' : '💪'}
          </div>

          <p className="text-xl text-gray-700 mb-6">
            You scored {finalResults.score}% ({Math.round(finalResults.score * finalResults.totalTasks / 100)} out of {finalResults.totalTasks})
          </p>

          <div className={`p-4 rounded-2xl ${finalResults.passed ? 'bg-green-100' : 'bg-orange-100'}`}>
            <p className={`text-lg font-medium ${finalResults.passed ? 'text-green-800' : 'text-orange-800'}`}>
              {finalResults.passed ? feedback.pass : feedback.fail}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gradient-to-br from-purple-50 via-blue-50 to-mint-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{title}</h1>
        <p className="text-lg text-gray-600 mb-4">{instructions}</p>
        
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
          <span>Question {currentTaskIndex + 1} of {tasks.length}</span>
          <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-400 to-mint-400"
              initial={{ width: 0 }}
              animate={{ width: `${((currentTaskIndex + 1) / tasks.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 100 }}
            />
          </div>
        </div>

        {/* Timer */}
        {timeRemaining !== null && (
          <motion.div
            animate={{ scale: timeRemaining <= 3 ? [1, 1.1, 1] : 1 }}
            transition={{ repeat: timeRemaining <= 3 ? Infinity : 0, duration: 1 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              timeRemaining <= 3 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="font-bold">{timeRemaining}s</span>
          </motion.div>
        )}
      </div>

      {/* Task Content */}
      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 min-h-[400px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTaskIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full"
          >
            {renderTask()}

            {/* Task Feedback */}
            <AnimatePresence>
              {showTaskFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-8"
                >
                  {responses[responses.length - 1]?.correct ? (
                    <div className="flex items-center justify-center gap-2 text-lg font-bold text-green-600 bg-green-100 p-4 rounded-2xl">
                      <CheckCircle className="w-6 h-6" />
                      <span>Excellent! 🌟</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-lg font-bold text-orange-600 bg-orange-100 p-4 rounded-2xl">
                      <XCircle className="w-6 h-6" />
                      <span>{responses[responses.length - 1]?.timedOut ? 'Time\'s up!' : 'Good try!'} 💪</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="metadata" />
    </div>
  );
};

export default AssessmentPlayer;