import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { DayComponentProps } from '../WeeklyPhonemeScreen';

const Day3MouthMovement: React.FC<DayComponentProps> = ({ phoneme, audioManager, onComplete, accent }) => {
  const playPhonemeSound = useCallback(async () => {
    try {
      await audioManager.resumeAudioContext();
      const phonemeAudioPath = `/sounds/phonemes/${accent}_${phoneme.id}.mp3`;
      await audioManager.playSound(phonemeAudioPath);
    } catch (error) {
      console.error('Failed to play phoneme sound:', error);
    }
  }, [phoneme, accent, audioManager]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-8"
    >
      <h3 className="text-3xl font-bold text-gray-700">Say it with me!</h3>
      
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="relative"
      >
        <div className="text-8xl">👄</div>
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-2xl font-bold text-purple-600"
          >
            {phoneme.phoneme}
          </motion.div>
        </div>
      </motion.div>

      <div className="bg-yellow-100 p-6 rounded-2xl max-w-md mx-auto">
        <p className="text-lg text-gray-700">
          Say "{phoneme.phoneme}" – like when you taste something yummy! "Mmm!"
        </p>
      </div>

      <motion.button
        onClick={playPhonemeSound}
        className="px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-full shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Mic className="w-5 h-5 inline mr-2" />
        Practice with me!
      </motion.button>

      <motion.button
        onClick={onComplete}
        className="px-8 py-4 bg-gradient-to-r from-mint-400 to-blue-400 text-white rounded-full shadow-lg text-lg font-medium hover:shadow-xl transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="w-5 h-5 inline mr-2">✨</span>
        Continue to Tomorrow
      </motion.button>
    </motion.div>
  );
};

export default Day3MouthMovement;