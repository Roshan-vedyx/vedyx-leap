import React from 'react';
import { motion } from 'framer-motion';
import { DayComponentProps } from '../WeeklyPhonemeScreen';

interface AudioButtonProps extends DayComponentProps {
  label: string;
  audioPath: string;
  isPlaying: boolean;
  onPlay: () => void;
}

const AudioButton: React.FC<AudioButtonProps> = ({ label, audioPath, isPlaying, onPlay, audioManager }) => {
  const playSound = async () => {
    try {
      await audioManager.resumeAudioContext();
      await audioManager.playSound(audioPath);
      onPlay();
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  };

  return (
    <motion.button
      onClick={playSound}
      disabled={isPlaying}
      className={`px-6 py-3 bg-gradient-to-r from-purple-400 to-indigo-400 text-white rounded-full shadow-lg font-medium hover:shadow-xl transition-all ${isPlaying ? 'opacity-50' : ''}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="w-5 h-5 inline mr-2">▶️</span>
      {isPlaying ? 'Playing...' : label}
    </motion.button>
  );
};

export default AudioButton;