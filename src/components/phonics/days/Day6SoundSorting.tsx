import React from 'react';
import { motion } from 'framer-motion';
import { DayComponentProps } from '../WeeklyPhonemeScreen';

const Day6SoundSorting: React.FC<DayComponentProps> = ({ phoneme, onComplete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-8"
    >
      <div className="text-6xl">📦</div>
      <h3 className="text-2xl font-bold text-gray-700">Let's Sort!</h3>
      <p className="text-gray-600">Sound sorting game for {phoneme.phoneme}</p>
      <p className="text-gray-500">More activities coming soon!</p>
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

export default Day6SoundSorting;