import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { DayComponentProps } from '../WeeklyPhonemeScreen';

interface WordCardProps extends DayComponentProps {
  word: { word: string; emoji: string; audio: { us: string; uk: string; in: string } };
  isSelected: boolean;
  isCorrect: boolean;
  showFeedback: boolean;
  onSelect: () => void;
  index: number;
}

const WordCard: React.FC<WordCardProps> = ({ word, isSelected, isCorrect, showFeedback, onSelect, index, audioManager, accent }) => {
  const playWordAudio = async () => {
    try {
      await audioManager.resumeAudioContext();
      await audioManager.playPhonemeSound(word.audio[accent]);
    } catch (error) {
      console.error('Failed to play word audio:', error);
    }
  };

  let buttonClass = "bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border-4 ";
  if (showFeedback) {
    if (isCorrect && isSelected) {
      buttonClass += "border-green-400 bg-green-50";
    } else if (isCorrect && !isSelected) {
      buttonClass += "border-yellow-400 bg-yellow-50";
    } else if (!isCorrect && isSelected) {
      buttonClass += "border-red-400 bg-red-50";
    } else {
      buttonClass += "border-gray-200";
    }
  } else {
    buttonClass += isSelected ? "border-blue-400 bg-blue-50" : "border-gray-200";
  }

  return (
    <motion.button
      onClick={() => {
        if (!showFeedback) {
          onSelect();
          playWordAudio();
        }
      }}
      className={buttonClass}
      whileHover={!showFeedback ? { scale: 1.05, y: -5 } : {}}
      whileTap={!showFeedback ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2 }}
      disabled={showFeedback}
    >
      <div className="text-5xl mb-3">{word.emoji}</div>
      <div className="text-xl font-medium text-gray-700">{word.word}</div>
      <div className="text-sm text-gray-500 mt-2">
        {showFeedback ? (
          isCorrect && isSelected ? (
            <div className="flex items-center justify-center gap-1 text-green-600">
              <Check className="w-4 h-4" />
              Correct!
            </div>
          ) : isCorrect && !isSelected ? (
            <div className="text-yellow-600">You missed this one</div>
          ) : !isCorrect && isSelected ? (
            <div className="flex items-center justify-center gap-1 text-red-600">
              <X className="w-4 h-4" />
              Not this one
            </div>
          ) : (
            <div className="text-gray-400">Not selected</div>
          )
        ) : (
          isSelected ? "Selected!" : "Tap to select"
        )}
      </div>
      
      {showFeedback && isCorrect && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2"
        >
          <div className="bg-green-500 text-white rounded-full p-1">
            <Check className="w-4 h-4" />
          </div>
        </motion.div>
      )}
    </motion.button>
  );
};

export default WordCard;