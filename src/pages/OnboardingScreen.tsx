import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, ArrowRight, User, Star } from 'lucide-react';
import { useAppState } from '../store/useAppState';

const OnboardingScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setChildName, setSelectedAvatar } = useAppState();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [step, setStep] = useState(1);

  const avatars = ['🦊', '🐻', '🦁', '🐼', '🦄', '🐸'];

  const playTestSound = () => {
    if (soundEnabled) {
      const audio = new Audio('/sounds/welcome.mp3');
      audio.play().catch(() => {
        // Fallback for browsers that don't support audio
        console.log('Audio not supported');
      });
    }
  };

  const handleComplete = () => {
    setChildName(name);
    setSelectedAvatar(avatar);
    navigate('/game');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-mint-400 to-blue-400 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">What's your name?</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-mint-500 focus:outline-none mb-6"
              autoFocus
            />
            <button
              onClick={() => setStep(2)}
              disabled={!name.trim()}
              className="w-full bg-gradient-to-r from-mint-500 to-mint-600 text-white py-3 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        );

      case 2:
        return (
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-mint-400 to-blue-400 rounded-full flex items-center justify-center">
              <Star className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Choose your buddy!</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {avatars.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => setAvatar(emoji)}
                  className={`w-16 h-16 rounded-2xl text-3xl border-4 transition-all ${
                    avatar === emoji 
                      ? 'border-mint-500 bg-mint-50 scale-110 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(3)}
              disabled={!avatar}
              className="w-full bg-gradient-to-r from-mint-500 to-mint-600 text-white py-3 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        );

      case 3:
        return (
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-mint-400 to-blue-400 rounded-full flex items-center justify-center">
              {soundEnabled ? <Volume2 className="w-12 h-12 text-white" /> : <VolumeX className="w-12 h-12 text-white" />}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Sound check!</h2>
            <p className="text-gray-600 mb-6">Let's make sure you can hear us clearly</p>
            
            <div className="space-y-4 mb-6">
              <button
                onClick={playTestSound}
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <Volume2 className="w-5 h-5" />
                Test Sound
              </button>
              
              <div className="flex items-center justify-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-mint-500 focus:ring-mint-500"
                  />
                  <span className="text-gray-700">Sound enabled</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-mint-500 to-mint-600 text-white py-3 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Start Playing!
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-8 bg-gradient-to-br from-mint-50 to-blue-50">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i <= step ? 'bg-mint-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {renderStep()}
      </div>
    </div>
  );
};

export default OnboardingScreen;