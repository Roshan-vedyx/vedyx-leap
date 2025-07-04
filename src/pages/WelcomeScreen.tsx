import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Heart, Settings } from 'lucide-react';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 bg-gradient-to-br from-mint-50 to-blue-50">
      {/* Logo and Title */}
      <motion.div 
        className="text-center mb-12"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-mint-400 to-blue-400 rounded-3xl flex items-center justify-center shadow-xl">
          <Heart className="w-16 h-16 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Vedyx Leap</h1>
        <p className="text-lg text-gray-600">Fun phonics for every learner 🌟</p>
      </motion.div>

      {/* Main Action Buttons */}
      <motion.div 
        className="w-full max-w-sm space-y-4"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <button
          onClick={() => navigate('/onboarding')}
          className="w-full bg-gradient-to-r from-mint-500 to-mint-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 focus-visible:ring-offset-2"
        >
          <Play className="w-6 h-6" />
          Start Learning
        </button>
        
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-white text-gray-700 py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <Settings className="w-6 h-6" />
          Parent Dashboard
        </button>
      </motion.div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-bounce-gentle">
        <div className="w-8 h-8 bg-mint-300 rounded-full opacity-60"></div>
      </div>
      <div className="absolute bottom-32 right-12 animate-pulse-soft">
        <div className="w-12 h-12 bg-blue-300 rounded-full opacity-40"></div>
      </div>
      <div className="absolute top-1/3 right-8 animate-bounce-gentle" style={{ animationDelay: '1s' }}>
        <div className="w-6 h-6 bg-mint-400 rounded-full opacity-70"></div>
      </div>
    </div>
  );
};

export default WelcomeScreen;