import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { Home, Volume2, Heart, RefreshCw, HelpCircle, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../store/useAppState';
import { contentManager } from '../utils/contentManager';
import { audioManager } from '../utils/audioManager';
import RewardScreen from '../components/RewardScreen';
import CalmBreak from '../components/CalmBreak';

interface PhonemeCard {
  id: string;
  phoneme: string;
  grapheme: string;
  word: string;
  emoji: string;
  audio: { us: string; uk: string; in: string };
}

const GameScreen: React.FC = () => {
  const navigate = useNavigate();
  const { childName, selectedAvatar, accent, incrementProgress, logError } = useAppState();
  const [currentLevel, setCurrentLevel] = useState<PhonemeCard[]>([]);
  const [dropZones, setDropZones] = useState<{ id: string; phoneme: string }[]>([]);
  const [correctMatches, setCorrectMatches] = useState<string[]>([]);
  const [showReward, setShowReward] = useState(false);
  const [showCalmBreak, setShowCalmBreak] = useState(false);
  const [errors, setErrors] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [showEncouragement, setShowEncouragement] = useState(false);

  // Encouragement messages for different scenarios
  const encouragementMessages = {
    start: "Let's match the sounds! You've got this! 🌟",
    progress: ["Great job! Keep going! 💪", "You're doing amazing! 🎉", "Way to go! 🚀"],
    struggle: ["Take your time, there's no rush! 😊", "Every try helps you learn! 🌱", "You're being so brave! 🦁"],
    success: ["Incredible work! You're a star! ⭐", "Look how much you've learned! 🎯", "You should be proud! 🏆"]
  };

  useEffect(() => {
    audioManager.setAccent(accent);
    const level = contentManager.getLevel('level-1');
    if (level) {
      const phonemes = level.phonemes
        .map(phoneme => {
          const phonemeData = contentManager.getPhoneme(phoneme);
          const randomWord = contentManager.getRandomWord(phoneme, accent);
          if (!phonemeData || !randomWord) {
            console.warn(`Missing data for phoneme: ${phoneme}`);
            return null;
          }
          return {
            id: phonemeData.id,
            phoneme: phonemeData.phoneme,
            grapheme: phonemeData.grapheme,
            word: randomWord.word,
            emoji: randomWord.emoji,
            audio: phonemeData.words.find(w => w.word === randomWord.word)?.audio || { us: '', uk: '', in: '' }
          };
        })
        .filter((p): p is PhonemeCard => p !== null);
      
      setCurrentLevel(phonemes);
      setDropZones(phonemes.map(p => ({ id: p.id, phoneme: p.phoneme })));
      audioManager.preloadSounds(phonemes.map(p => p.audio));
      
      // Show initial encouragement
      setEncouragementMessage(encouragementMessages.start);
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 3000);
    } else {
      console.error('Level 1 not found');
    }
  }, [accent]);

  const showEncouragementMessage = useCallback((type: 'progress' | 'struggle' | 'success') => {
    const messages = encouragementMessages[type];
    const message = Array.isArray(messages) 
      ? messages[Math.floor(Math.random() * messages.length)]
      : messages;
    
    setEncouragementMessage(message);
    setShowEncouragement(true);
    setTimeout(() => setShowEncouragement(false), 2500);
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const draggedPhoneme = currentLevel.find(p => p.id === active.id);
    const targetPhoneme = dropZones.find(d => d.id === over.id)?.phoneme;

    setAttempts(prev => prev + 1);

    if (draggedPhoneme && targetPhoneme && draggedPhoneme.phoneme === targetPhoneme) {
      // Correct match!
      setCorrectMatches(prev => [...prev, draggedPhoneme.id]);
      
      try {
        await audioManager.resumeAudioContext();
        await audioManager.playPhonemeSound(draggedPhoneme.audio);
        await audioManager.playSuccessSound();
      } catch (error) {
        console.error('Failed to play success sounds:', error);
      }
      
      incrementProgress();
      
      // Show progress encouragement
      if (correctMatches.length + 1 < currentLevel.length) {
        showEncouragementMessage('progress');
      }
      
      // Check if level complete
      if (correctMatches.length + 1 === currentLevel.length) {
        showEncouragementMessage('success');
        setTimeout(() => setShowReward(true), 1000);
      }
      
      // Reset error state on success
      setErrors(0);
    } else {
      // Incorrect match
      setErrors(prev => prev + 1);
      
      try {
        await audioManager.resumeAudioContext();
        await audioManager.playErrorSound();
      } catch (error) {
        console.error('Failed to play error sound:', error);
      }
      
      logError();
      
      // Show hint after 2 attempts
      if (attempts >= 1) {
        setShowHint(true);
        setTimeout(() => setShowHint(false), 4000);
      }
      
      // Show encouragement for struggling
      if (errors === 0) {
        showEncouragementMessage('struggle');
      }
      
      // Calm break after 3 errors
      if (errors >= 2) {
        setShowCalmBreak(true);
        setErrors(0);
      }
    }
  };

  const playAllSounds = useCallback(async () => {
    try {
      await audioManager.resumeAudioContext();
      currentLevel.forEach((phoneme, index) => {
        if (!correctMatches.includes(phoneme.id)) {
          setTimeout(() => {
            audioManager.playPhonemeSound(phoneme.audio);
          }, index * 800);
        }
      });
    } catch (error) {
      console.error('Failed to play all sounds:', error);
    }
  }, [currentLevel, correctMatches]);

  const resetLevel = useCallback(() => {
    setCorrectMatches([]);
    setErrors(0);
    setAttempts(0);
    setShowHint(false);
    setEncouragementMessage("Let's try again! You've got this! 🌟");
    setShowEncouragement(true);
    setTimeout(() => setShowEncouragement(false), 3000);
  }, []);

  const playPhonemeAudio = useCallback(async (phoneme: PhonemeCard) => {
    try {
      // Resume audio context if suspended
      await audioManager.resumeAudioContext();
      await audioManager.playPhonemeSound(phoneme.audio);
    } catch (error) {
      console.error('Failed to play phoneme sound:', error);
    }
  }, []);

  const DraggablePhoneme: React.FC<{ phoneme: PhonemeCard }> = ({ phoneme }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: phoneme.id,
    });

    // Create modified listeners that exclude the speaker button
    const dragListeners = {
      ...listeners,
      onPointerDown: (e: any) => {
        // Don't start drag if clicking on speaker button or its children
        if (e.target.closest('.speaker-button')) {
          return;
        }
        listeners?.onPointerDown?.(e);
      }
    };

    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
    } : undefined;

    if (correctMatches.includes(phoneme.id)) {
      return (
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 0, opacity: 0 }}
          exit={{ scale: 0, opacity: 0 }}
          className="bg-green-100 rounded-2xl p-4 border-2 border-green-300"
        >
          <div className="text-center">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-lg font-bold text-green-600">Matched!</div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={setNodeRef}
        style={style}
        {...dragListeners}
        {...attributes}
        className={`bg-white rounded-2xl p-6 shadow-lg border-3 border-gray-200 cursor-grab active:cursor-grabbing transition-all ${
          isDragging ? 'opacity-50 rotate-3 scale-105 shadow-2xl' : 'hover:shadow-xl hover:-translate-y-2 hover:scale-105'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        layout
      >
        <div className="text-center">
          <div className="text-5xl mb-3">{phoneme.emoji}</div>
          <div className="text-3xl font-bold text-gray-800 mb-2">{phoneme.phoneme}</div>
          <div className="text-lg text-gray-600 mb-1">{phoneme.word}</div>
          <div className="text-sm text-gray-500 mb-3">{phoneme.grapheme}</div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              playPhonemeAudio(phoneme);
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            style={{ touchAction: 'none' }}
            className="speaker-button p-3 bg-blue-100 rounded-full hover:bg-blue-200 transition-all hover:scale-110 active:scale-95 relative z-10"
          >
            <Volume2 className="w-5 h-5 text-blue-600 pointer-events-none" />
          </button>
        </div>
      </motion.div>
    );
  };

  const DropZone: React.FC<{ id: string; phoneme: string }> = ({ id, phoneme }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: id,
    });

    const isMatched = correctMatches.includes(id);

    return (
      <motion.div
        ref={setNodeRef}
        className={`w-24 h-24 rounded-2xl border-4 border-dashed flex items-center justify-center text-3xl font-bold transition-all ${
          isMatched 
            ? 'border-green-500 bg-green-100 text-green-700' 
            : isOver 
              ? 'border-mint-500 bg-mint-50 scale-110 shadow-lg' 
              : 'border-gray-300 hover:border-gray-400 hover:scale-105'
        }`}
        animate={{
          scale: isOver ? 1.1 : 1,
          rotateZ: isOver ? 5 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {isMatched ? '✅' : phoneme}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-blue-50 to-purple-50 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <Home className="w-6 h-6 text-gray-600" />
        </button>
        
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-lg">
          <span className="text-2xl">{selectedAvatar}</span>
          <span className="font-semibold text-gray-800">{childName}</span>
          <div className="flex items-center gap-1 ml-2">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium">5</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={playAllSounds}
            className="p-3 bg-yellow-100 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
            title="Play all sounds"
          >
            <Volume2 className="w-6 h-6 text-yellow-600" />
          </button>
          
          <button
            onClick={() => setShowHint(true)}
            className="p-3 bg-purple-100 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
            title="Show hint"
          >
            <HelpCircle className="w-6 h-6 text-purple-600" />
          </button>
          
          <button
            onClick={resetLevel}
            className="p-3 bg-gray-100 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
            title="Start over"
          >
            <RefreshCw className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white rounded-full p-2 shadow-lg">
          <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-mint-400 to-blue-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(correctMatches.length / currentLevel.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            />
          </div>
          <div className="text-center mt-2 text-sm font-medium text-gray-600">
            {correctMatches.length} of {currentLevel.length} matched! 🎯
          </div>
        </div>
      </div>

      {/* Encouragement Message */}
      <AnimatePresence>
        {showEncouragement && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-20 bg-white rounded-2xl p-4 shadow-xl border-2 border-mint-300"
          >
            <div className="text-center">
              <Zap className="w-6 h-6 text-mint-500 mx-auto mb-2" />
              <p className="text-lg font-medium text-gray-800">{encouragementMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint Overlay */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30"
            onClick={() => setShowHint(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl"
            >
              <div className="text-center">
                <div className="text-4xl mb-3">💡</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Hint!</h3>
                <p className="text-gray-600 mb-4">
                  Listen to the sounds by tapping the 🔊 button, then match each card to the same letter!
                </p>
                <button
                  onClick={() => setShowHint(false)}
                  className="px-6 py-2 bg-mint-500 text-white rounded-full hover:bg-mint-600 transition-colors"
                >
                  Got it! 👍
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DndContext onDragEnd={handleDragEnd} onDragStart={({ active }) => setActiveId(active.id as string)}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Match the letters! 🎯</h2>
            <p className="text-lg text-gray-600">Drag each card to its matching letter sound</p>
          </div>
          
          {/* Drop Zones */}
          <div className="flex justify-center gap-8 mb-12">
            {dropZones.map(zone => (
              <DropZone key={zone.id} id={zone.id} phoneme={zone.phoneme} />
            ))}
          </div>
          
          {/* Draggable Cards */}
          <div className="flex justify-center gap-6 flex-wrap">
            <AnimatePresence>
              {currentLevel.map(phoneme => (
                <DraggablePhoneme key={phoneme.id} phoneme={phoneme} />
              ))}
            </AnimatePresence>
          </div>
        </div>
        
        <DragOverlay>
          {activeId ? (
            <div className="bg-white rounded-2xl p-6 shadow-2xl border-3 border-mint-500 rotate-3 scale-105">
              <div className="text-center">
                <div className="text-5xl mb-3">
                  {currentLevel.find(p => p.id === activeId)?.emoji}
                </div>
                <div className="text-3xl font-bold text-gray-800">
                  {currentLevel.find(p => p.id === activeId)?.phoneme}
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showReward && (
        <RewardScreen
          onClose={() => {
            setShowReward(false);
            // Load next level or navigate
          }}
        />
      )}
      
      {showCalmBreak && (
        <CalmBreak
          onClose={() => setShowCalmBreak(false)}
        />
      )}
    </div>
  );
};

export default GameScreen;