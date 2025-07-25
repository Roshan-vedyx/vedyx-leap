import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DayComponentProps } from '../WeeklyPhonemeScreen';
import PhonemeDisplay from '../shared/PhonemeDisplay';

const Day1Intro: React.FC<DayComponentProps> = ({ phoneme, audioManager, onComplete, accent }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const playIntroductionSentence = useCallback(async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
      await audioManager.resumeAudioContext();
      const phonemeAudioPath = `/sounds/phonemes/${accent}_${phoneme.id}.mp3`;
      await audioManager.playSound(phonemeAudioPath);
      await new Promise(resolve => setTimeout(resolve, 500));
      const exampleWord = phoneme.words[0];
      if (exampleWord) {
        await audioManager.playPhonemeSound(exampleWord.audio[accent]);
      }
    } catch (error) {
      console.error('Failed to play introduction:', error);
    } finally {
      setTimeout(() => setIsPlaying(false), 100);
    }
  }, [phoneme, isPlaying, accent, audioManager]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-8"
    >
      <PhonemeDisplay phoneme={phoneme} audioManager={audioManager} accent={accent} playIntroduction={playIntroductionSentence} />
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

export default Day1Intro;