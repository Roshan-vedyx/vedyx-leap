import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { Home, Volume2, Heart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../store/useAppState';
import RewardScreen from '../components/RewardScreen';
import CalmBreak from '../components/CalmBreak';

interface PhonemeCard {
  id: string;
  phoneme: string;
  word: string;
  image: string;
  audio: string;
}

const GameScreen: React.FC = () => {
  const navigate = useNavigate();
  const { childName, selectedAvatar, incrementProgress, logError } = useAppState();
  const [currentLevel, setCurrentLevel] = useState<PhonemeCard[]>([]);
  const [dropZones, setDropZones] = useState<string[]>([]);
  const [correctMatches, setCorrectMatches] = useState<string[]>([]);
  const [showReward, setShowReward] = useState(false);
  const [showCalmBreak, setShowCalmBreak] = useState(false);
  const [errors, setErrors] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sample phoneme data - replace with actual content
  const samplePhonemes: PhonemeCard[] = [
    { id: '1', phoneme: 'A', word: 'Apple', image: '🍎', audio: '/sounds/a.mp3' },
    { id: '2', phoneme: 'B', word: 'Ball', image: '⚽', audio: '/sounds/b.mp3' },
    { id: '3', phoneme: 'C', word: 'Cat', image: '🐱', audio: '/sounds/c.mp3' },
  ];

  useEffect(() => {
    setCurrentLevel(samplePhonemes);
    setDropZones(samplePhonemes.map(p => p.phoneme));
  }, []);

  const playSound = (audioPath: string) => {
    const audio = new Audio(audioPath);
    audio.play().catch(() => console.log('Audio not supported'));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const draggedPhoneme = currentLevel.find(p => p.id === active.id);
    const targetPhoneme = over.id as string;

    if (draggedPhoneme && draggedPhoneme.phoneme === targetPhoneme) {
      // Correct match
      setCorrectMatches(prev => [...prev, draggedPhoneme.id]);
      playSound(draggedPhoneme.audio);
      incrementProgress();
      
      // Check if level is complete
      if (correctMatches.length + 1 === currentLevel.length) {
        setShowReward(true);
      }
    } else {
      // Incorrect match
      setErrors(prev => prev + 1);
      logError();
      
      // Show calm break after 3 errors
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
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    if (correctMatches.includes(phoneme.id)) {
      return null; // Hide completed cards
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
          <div className="text-4xl mb-2">{phoneme.image}</div>
          <div className="text-2xl font-bold text-gray-800 mb-1">{phoneme.phoneme}</div>
          <div className="text-sm text-gray-600">{phoneme.word}</div>
          <button
            onClick={() => playSound(phoneme.audio)}
            className="mt-2 p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
          >
            <Volume2 className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>
    );
  };

  const DropZone: React.FC<{ phoneme: string }> = ({ phoneme }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: phoneme,
    });

    return (
      <div
        ref={setNodeRef}
        className={`w-20 h-20 rounded-2xl border-4 border-dashed flex items-center justify-center text-2xl font-bold transition-all ${
          isOver 
            ? 'border-mint-500 bg-mint-50 scale-110' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {phoneme}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 to-blue-50 p-4">
      {/* Header */}
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

      {/* Game Area */}
      <DndContext onDragEnd={handleDragEnd} onDragStart={({ active }) => setActiveId(active.id as string)}>
        <div className="max-w-4xl mx-auto">
          {/* Instructions */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Match the letters! 🎯
            </h2>
            <p className="text-gray-600">Drag each card to its matching letter</p>
          </div>

          {/* Drop Zones */}
          <div className="flex justify-center gap-6 mb-12">
            {dropZones.map((phoneme) => (
              <DropZone key={phoneme} phoneme={phoneme} />
            ))}
          </div>

          {/* Draggable Cards */}
          <div className="flex justify-center gap-4 flex-wrap">
            {currentLevel.map((phoneme) => (
              <DraggablePhoneme key={phoneme.id} phoneme={phoneme} />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="bg-white rounded-2xl p-4 shadow-xl border-2 border-mint-500 rotate-3 scale-105">
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {currentLevel.find(p => p.id === activeId)?.image}
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {currentLevel.find(p => p.id === activeId)?.phoneme}
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modals */}
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