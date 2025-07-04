import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Smile, Sun, Cloud } from 'lucide-react';

interface CalmBreakProps {
  onClose: () => void;
  duration?: number; // in seconds
}

const CalmBreak: React.FC<CalmBreakProps> = ({ onClose, duration = 30 }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'exhale'>('inhale');

  useEffect(() => {
    // Breathing animation cycle
    const breathingInterval = setInterval(() => {
      setBreathingPhase(prev => prev === 'inhale' ? 'exhale' : 'inhale');
    }, 4000);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(breathingInterval);
      clearInterval(countdownInterval);
    };
  }, [onClose]);

  const breathingMessages = {
    inhale: "Breathe in slowly... 🌸",
    exhale: "Breathe out gently... 🍃"
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center z-50">
      <motion.div 
        className="bg-white/80 backdrop-blur-md rounded-3xl p-8 max-w-md mx-4 text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Take a Calm Break</h2>
          <p className="text-gray-600">Let's breathe together 🧘‍♀️</p>
        </div>

        {/* Breathing Animation */}
        <div className="mb-8">
          <motion.div
            className="w-32 h-32 mx-auto bg-gradient-to-r from-calm to-mint-300 rounded-full flex items-center justify-center shadow-xl"
            animate={{
              scale: breathingPhase === 'inhale' ? 1.2 : 0.8,
              opacity: breathingPhase === 'inhale' ? 1 : 0.7
            }}
            transition={{
              duration: 4,
              ease: "easeInOut"
            }}
          >
            <Cloud className="w-16 h-16 text-white" />
          </motion.div>
        </div>

        {/* Breathing Instructions */}
        <motion.div 
          className="mb-6"
          key={breathingPhase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-lg font-semibold text-gray-700 mb-2">
            {breathingMessages[breathingPhase]}
          </p>
          <div className="text-sm text-gray-500">
            {breathingPhase === 'inhale' ? 'Count to 4...' : 'Count to 4...'}
          </div>
        </motion.div>

        {/* Floating Elements */}
        <div className="relative mb-6">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full"
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 3,
                delay: i * 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                left: `${20 + i * 12}%`,
                top: '50%'
              }}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="mb-6">
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-mint-400 to-blue-400 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${((duration - timeLeft) / duration) * 100}%` }}
            />
          </div>
        </div>

        {/* Encouraging Messages */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Smile className="w-5 h-5" />
            <span>You're doing great!</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Sun className="w-5 h-5" />
            <span>Take your time</span>
          </div>
        </div>

        {/* Skip Button */}
        <button
          onClick={onClose}
          className="bg-gradient-to-r from-mint-500 to-mint-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all"
        >
          I'm Ready!
        </button>
      </motion.div>
    </div>
  );
};

export default CalmBreak;