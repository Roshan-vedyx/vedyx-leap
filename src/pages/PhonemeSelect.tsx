// /src/pages/PhonemeSelect.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface PhonemeWord {
  word: string;
  emoji: string;
  emojiName: string;
  audio: Record<string, string>;
  image: string;
}

interface Phoneme {
  id: string;
  phoneme: string;
  grapheme: string;
  words: PhonemeWord[];
}

const PhonemeSelect: React.FC = () => {
  const [phonemes, setPhonemes] = useState<Phoneme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPhonemes = async () => {
      try {
        const response = await fetch('/src/assets/content/phonemes_cleaned.json');
        const data = await response.json();
        setPhonemes(data);
      } catch (error) {
        console.error('Failed to load phonemes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPhonemes();
  }, []);

  const goToPhoneme = (id: string) => {
    navigate(`/phoneme/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
        <p className="text-lg text-gray-600">Loading phonemes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 p-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Choose a Sound</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
        {phonemes.map((p) => (
          <motion.button
            key={p.id}
            onClick={() => goToPhoneme(p.id)}
            className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl text-center transition-all border border-gray-100 hover:border-blue-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-5xl mb-2">
              {p.words[0]?.emoji || '🔤'}
            </div>
            <div className="text-lg font-bold text-gray-800 mb-1">{p.phoneme}</div>
            <div className="text-sm text-gray-500">{p.grapheme}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default PhonemeSelect;
