import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';

interface StoryPlayerProps {
  id: string;
  title: string;
  text: string[];
  audioUrls?: string[];
  illustrations?: string[];
  onComplete?: () => void;
}

const StoryPlayer: React.FC<StoryPlayerProps> = ({ 
  title, 
  text, 
  audioUrls = [], 
  illustrations = [],
  onComplete 
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const hasAudio = audioUrls.length > 0;
  const hasIllustrations = illustrations.length > 0;
  const currentAudio = audioUrls[currentPage];
  const currentIllustration = hasIllustrations ? illustrations[Math.min(currentPage, illustrations.length - 1)] : null;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        setIsPlaying(false);
        if (isAutoPlay && currentPage < text.length - 1) {
          setTimeout(() => {
            setCurrentPage(prev => prev + 1);
          }, 1000);
        }
      };
    }
  }, [currentPage, isAutoPlay, text.length]);

  const playAudio = async () => {
    if (!hasAudio || !currentAudio || !audioRef.current) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.src = currentAudio;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const nextPage = () => {
    if (currentPage < text.length - 1) {
      setCurrentPage(prev => prev + 1);
      setIsPlaying(false);
    } else if (onComplete) {
      onComplete();
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      setIsPlaying(false);
    }
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay(prev => !prev);
    if (!isAutoPlay && hasAudio) {
      playAudio();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gradient-to-br from-purple-50 via-blue-50 to-mint-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{title}</h1>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <span>Page {currentPage + 1} of {text.length}</span>
          <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-mint-400 to-blue-400"
              initial={{ width: 0 }}
              animate={{ width: `${((currentPage + 1) / text.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 100 }}
            />
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-6">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Illustration */}
          {currentIllustration && (
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="order-1 md:order-1"
            >
              <img
                src={currentIllustration}
                alt={`Story illustration ${currentPage + 1}`}
                className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-lg"
              />
            </motion.div>
          )}

          {/* Text Content */}
          <div className={`order-2 md:order-2 ${!currentIllustration ? 'md:col-span-2' : ''}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="text-center"
              >
                <p className="text-xl md:text-2xl leading-relaxed text-gray-800 font-medium mb-6">
                  {text[currentPage]}
                </p>
                
                {/* Audio Controls */}
                {hasAudio && currentAudio && (
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <button
                      onClick={playAudio}
                      className={`p-3 rounded-full transition-all transform hover:scale-110 active:scale-95 ${
                        isPlaying 
                          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      }`}
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </button>
                    
                    <button
                      onClick={toggleAutoPlay}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isAutoPlay 
                          ? 'bg-mint-100 text-mint-700 border-2 border-mint-300' 
                          : 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      <Volume2 className="w-4 h-4 inline mr-1" />
                      Auto-read {isAutoPlay ? 'ON' : 'OFF'}
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all transform hover:scale-105 active:scale-95 ${
            currentPage === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 shadow-lg hover:shadow-xl'
          }`}
        >
          <SkipBack className="w-5 h-5" />
          Previous
        </button>

        {/* Page Dots */}
        <div className="flex gap-2">
          {text.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentPage(index);
                setIsPlaying(false);
              }}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentPage
                  ? 'bg-mint-500 scale-125'
                  : index <= currentPage
                    ? 'bg-mint-300'
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextPage}
          className="flex items-center gap-2 px-6 py-3 bg-mint-500 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl hover:bg-mint-600 transition-all transform hover:scale-105 active:scale-95"
        >
          {currentPage === text.length - 1 ? 'Continue' : 'Next'}
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Hidden Audio Element */}
      {hasAudio && <audio ref={audioRef} preload="metadata" />}
    </div>
  );
};

export default StoryPlayer;