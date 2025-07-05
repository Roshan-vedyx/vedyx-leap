import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { Home, Volume2, Heart } from 'lucide-react';
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

  useEffect(() => {
    audioManager.setAccent(accent);
    const level = contentManager.getLevel('level-1');
    if (level) {
      const phonemes = level.phonemes
        .map(phoneme => {
          const phonemeData = contentManager.getPhoneme(phoneme); // Use phoneme as ID
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
    } else {
      console.error('Level 1 not found');
    }
  }, [accent]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const draggedPhoneme = currentLevel.find(p => p.id === active.id);
    const targetPhoneme = dropZones.find(d => d.id === over.id)?.phoneme;

    if (draggedPhoneme && targetPhoneme && draggedPhoneme.phoneme === targetPhoneme) {
      setCorrectMatches(prev => [...prev, draggedPhoneme.id]);
      audioManager.playPhonemeSound(draggedPhoneme.audio);
      audioManager.playSuccessSound();
      incrementProgress();
      if (correctMatches.length + 1 === currentLevel.length) {
        setShowReward(true);
      }
    } else {
      setErrors(prev => prev + 1);
      audioManager.playErrorSound();
      logError();
      if (errors >= 2) {
        setShowCalmBreak(true);
        setErrors(0);
      }
    }
  };

  const DraggablePhoneme: React.FC<{ phoneme: PhonemeCard }> = ({ phoneme }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: phoneme.id,
    });

    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
    } : undefined;

    if (correctMatches.includes(phoneme.id)) {
      return null;
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`bg-white rounded-2xl p-4 shadow-lg border-2 border-gray-200 cursor-grab active:cursor-grabbing transition-all ${
          isDragging ? 'opacity-50 rotate-3 scale-105' : 'hover:shadow-xl hover:-translate-y-1'
        }`}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">{phoneme.emoji}</div>
          <div className="text-2xl font-bold text-gray-800 mb-1">{phoneme.phoneme}</div>
          <div className="text-sm text-gray-600">{phoneme.word}</div>
          <div className="text-sm text-gray-500">{phoneme.grapheme}</div>
          <button
            onClick={() => audioManager.playPhonemeSound(phoneme.audio)}
            className="mt-2 p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
          >
            <Volume2 className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>
    );
  };

  const DropZone: React.FC<{ id: string; phoneme: string }> = ({ id, phoneme }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: id,
    });

    return (
      <div
        ref={setNodeRef}
        className={`w-20 h-20 rounded-2xl border-4 border-dashed flex items-center justify-center text-2xl font-bold transition-all ${
          isOver ? 'border-mint-500 bg-mint-50 scale-110' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {phoneme}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 to-blue-50 p-4">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
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
      </div>
      <DndContext onDragEnd={handleDragEnd} onDragStart={({ active }) => setActiveId(active.id as string)}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Match the letters! 🎯</h2>
            <p className="text-gray-600">Drag each card to its matching letter</p>
          </div>
          <div className="flex justify-center gap-6 mb-12">
            {dropZones.map(zone => (
              <DropZone key={zone.id} id={zone.id} phoneme={zone.phoneme} />
            ))}
          </div>
          <div className="flex justify-center gap-4 flex-wrap">
            {currentLevel.map(phoneme => (
              <DraggablePhoneme key={phoneme.id} phoneme={phoneme} />
            ))}
          </div>
        </div>
        <DragOverlay>
          {activeId ? (
            <div className="bg-white rounded-2xl p-4 shadow-xl border-2 border-mint-500 rotate-3 scale-105">
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {currentLevel.find(p => p.id === activeId)?.emoji}
                </div>
                <div className="text-2xl font-bold text-gray-800">
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