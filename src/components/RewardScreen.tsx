import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Trophy, Heart, Sparkles } from 'lucide-react';

interface RewardScreenProps {
  onClose: () => void;
  type?: 'success' | 'effort' | 'milestone';
  message?: string;
}

const RewardScreen: React.FC<RewardScreenProps> = ({ 
  onClose, 
  type = 'success', 
  message 
}) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Auto-close after 3 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    // Hide confetti after 2 seconds
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(confettiTimer);
    };
  }, [onClose]);

  const getRewardContent = () => {
    switch (type) {
      case 'success':
        return {
          icon: <Star className="w-16 h-16 text-yellow-500" />,
          title: "Amazing! 🌟",
          message: message || "You got it right!",
          color: 'from-yellow-400 to-orange-400'
        };
      case 'effort':
        return {
          icon: <Heart className="w-16 h-16 text-red-500" />,
          title: "Great Try! ❤️",
          message: message || "You're doing your best!",
          color: 'from-red-400 to-pink-400'
        };
      case 'milestone':
        return {
          icon: <Trophy className="w-16 h-16 text-purple-500" />,
          title: "Milestone! 🏆",
          message: message || "You've reached a new level!",
          color: 'from-purple-400 to-indigo-400'
        };
      default:
        return {
          icon: <Star className="w-16 h-16 text-yellow-500" />,
          title: "Well Done! ✨",
          message: message || "Keep going!",
          color: 'from-mint-400 to-blue-400'
        };
    }
  };

  const content = getRewardContent();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center relative overflow-hidden"
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 10 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 20 
        }}
      >
        {/* Confetti Background */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full"
                initial={{ 
                  x: Math.random() * 300 - 150,
                  y: -10,
                  scale: 0
                }}
                animate={{ 
                  y: 400,
                  scale: [0, 1, 0],
                  rotate: 360
                }}
                transition={{ 
                  duration: 2,
                  delay: Math.random() * 0.5,
                  ease: "easeOut"
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`
                }}
              />
            ))}
          </div>
        )}

        {/* Reward Icon */}
        <motion.div 
          className={`w-24 h-24 mx-auto mb-4 bg-gradient-to-r ${content.color} rounded-full flex items-center justify-center shadow-lg`}
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ 
            duration: 0.6,
            times: [0, 0.6, 1],
            ease: "easeOut"
          }}
        >
          {content.icon}
        </motion.div>

        {/* Title */}
        <motion.h2 
          className="text-2xl font-bold text-gray-800 mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {content.title}
        </motion.h2>

        {/* Message */}
        <motion.p 
          className="text-lg text-gray-600 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {content.message}
        </motion.p>

        {/* Sparkles */}
        <div className="absolute top-4 right-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </motion.div>
        </div>

        <div className="absolute bottom-4 left-4">
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-4 h-4 text-pink-400" />
          </motion.div>
        </div>

        {/* Close Button */}
        <motion.button
          onClick={onClose}
          className="bg-gradient-to-r from-mint-500 to-mint-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Continue
        </motion.button>
      </motion.div>
    </div>
  );
};

export default RewardScreen;