// /src/pages/UnitLoader.tsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Volume2, Play, Home } from 'lucide-react'
import { getUnits } from '@/services/FirebaseService'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '@/store/useAppState'

export default function UnitLoader() {
  const [units, setUnits] = useState([])
  const navigate = useNavigate()
  const { childName, selectedAvatar } = useAppState()

  useEffect(() => {
    getUnits().then(setUnits)
  }, [])

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
        </div>
        
        <div className="w-12" /> {/* Spacer for center alignment */}
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Choose Your Learning Adventure! 🚀
        </h1>
        <p className="text-lg text-gray-600">
          Pick a story unit or practice your phonemes
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Phoneme Practice Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Volume2 className="w-6 h-6 text-purple-600" />
            Phoneme Practice
          </h2>
          
          <motion.button
            onClick={() => navigate('/phonemes')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-2xl shadow-lg text-left hover:shadow-xl transition-all group"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">🔤</span>
                  <h3 className="text-2xl font-bold">Practice Letter Sounds</h3>
                </div>
                <p className="text-purple-100 text-lg">
                  Learn and practice all phoneme sounds with interactive audio
                </p>
                <div className="flex items-center gap-4 mt-3 text-purple-200">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    44 Phonemes
                  </span>
                  <span className="flex items-center gap-1">
                    <Volume2 className="w-4 h-4" />
                    Multi-accent Audio
                  </span>
                </div>
              </div>
              <div className="text-white group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8" />
              </div>
            </div>
          </motion.button>
        </div>

        {/* Story Units Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Story Units
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {units.map((unit, index) => (
              <motion.button
                key={unit.id}
                onClick={() => navigate(`/unit/${unit.id}`)}
                className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-6 rounded-2xl shadow-lg text-left hover:shadow-xl transition-all group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">📚</span>
                      <h3 className="text-xl font-bold">{unit.title}</h3>
                    </div>
                    <p className="text-blue-100 mb-3">{unit.description}</p>
                    
                    {/* Unit metadata */}
                    <div className="flex items-center gap-4 text-blue-200 text-sm">
                      {unit.estimatedDuration && (
                        <span>⏱️ {unit.estimatedDuration} min</span>
                      )}
                      {unit.components && (
                        <span>🎯 {unit.components.length} activities</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-white group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Empty State for Units */}
        {units.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">Loading Story Units...</h3>
            <p className="text-gray-500">
              Getting your learning adventures ready!
            </p>
          </motion.div>
        )}
      </div>

      {/* Quick Navigation Footer */}
      <div className="fixed bottom-4 left-4 right-4 md:relative md:bottom-auto md:left-auto md:right-auto md:mt-8">
        <div className="bg-white rounded-2xl p-4 shadow-lg max-w-2xl mx-auto">
          <div className="flex justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Volume2 className="w-4 h-4 text-purple-500" />
              <span>Phonemes for sounds</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Units for stories</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}