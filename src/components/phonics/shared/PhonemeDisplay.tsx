import React from 'react';
import { motion } from 'framer-motion';
import { DayComponentProps } from '../WeeklyPhonemeScreen';

const PhonemeDisplay: React.FC<DayComponentProps & { playIntroduction: () => void }> = ({ phoneme, playIntroduction, audioManager, accent }) => {
  const playPhonemeSound = async () => {
    try {
      await audioManager.resumeAudioContext();
      const phonemeAudioPath = `/sounds/phonemes/${accent}_${phoneme.id}.mp3`;
      await audioManager.playSound(phonemeAudioPath);
    } catch (error) {
      console.error('Failed to play phoneme sound:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-8"
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="relative"
      >
        <div className="text-9xl font-bold text-gray-700 mb-4">
          {phoneme.grapheme.split(',')[0].trim().toUpperCase()}
        </div>
        <div className="text-6xl font-bold text-gray-600">
          {phoneme.grapheme.split(',')[0].trim().toLowerCase()}
        </div>
        <div className="text-3xl text-purple-600 mt-4 font-mono">
          {phoneme.phoneme}
        </div>
      </motion.div>

      <motion.div
        animate={{ rotate: [-5, 5, -5] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-8xl"
      >
        {phoneme.words[0]?.emoji || '🐵'}
      </motion.div>

      <motion.button
        onClick={playIntroduction}
        className="px-8 py-4 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full shadow-lg text-xl font-medium hover:shadow-xl transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="w-6 h-6 inline mr-2">🔊</span>
        Hear the sound!
      </motion.button>

      <motion.button
        onClick={playPhonemeSound}
        className="px-6 py-3 bg-gradient-to-r from-purple-400 to-indigo-400 text-white rounded-full shadow-lg font-medium hover:shadow-xl transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="w-5 h-5 inline mr-2">▶️</span>
        Just the {phoneme.phoneme} sound
      </motion.button>

      <div className="text-lg text-gray-600">
        This is the sound {phoneme.phoneme} – like in {phoneme.words[0]?.word}!
      </div>
    </motion.div>
  );
};

export default PhonemeDisplay;