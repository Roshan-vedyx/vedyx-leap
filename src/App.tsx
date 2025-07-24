import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import WelcomeScreen from './pages/WelcomeScreen';
import GameScreen from './pages/GameScreen';
import ParentDashboard from './pages/ParentDashboard';
import OnboardingScreen from './pages/OnboardingScreen';
import UnitLoader from "./pages/UnitLoader";
import UnitPlayer from "./pages/UnitPlayer";
import PhonemePlayer from './components/players/PhonemePlayer';
import PhonemeSelect from "./pages/PhonemeSelect";
import './App.css';

function App() {
  return (
    <Router>
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-mint-50 to-blue-50 font-inter"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/game" element={<GameScreen />} />
          <Route path="/dashboard" element={<ParentDashboard />} />
          <Route path="/units" element={<UnitLoader />} />
          <Route path="/unit/:unitId" element={<UnitPlayer />} />
          <Route path="/phonemes" element={<PhonemeSelect />}  />
          <Route path="/phoneme/:id" element={<PhonemePlayer />} />
        </Routes>
      </motion.div>
    </Router>
  );
}

export default App;