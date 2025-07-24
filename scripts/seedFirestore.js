// seedFirestore.js

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const serviceAccount = require('./seedKey.json'); // 👈 Make sure this file exists and is correct

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function seedData() {
  // 🔤 Unit: The Magic E
  const unitRef = db.collection('units').doc('magic-e');
  await unitRef.set({
    title: 'The Magic E',
    description: "Learn how silent 'e' changes the meaning of words.",
    estimatedDuration: 12,
    unlockable: true,
    coverImage: 'https://example.com/magic-e.png',
    components: [
      { type: 'story', ref: 'components/story-bake-sale' },
      { type: 'game', ref: 'components/game-syllable-tap' },
      { type: 'ruleCard', ref: 'components/card-magic-e' },
      { type: 'spelling', ref: 'components/game-spell-cape' },
      { type: 'scenario', ref: 'components/scenario-bakery-menu' },
    ],
  });

  // 🧩 Components
  const components = [
    {
      id: 'story-bake-sale',
      type: 'story',
      title: 'Bake Sale at School',
      text: [
        'Sara is baking cakes for the school event.',
        'She puts the cakes in a big tray.',
        "She writes: 'Cake Sale Today!'"
      ],
      audioUrls: [
        'https://example.com/audio/bake1.mp3',
        'https://example.com/audio/bake2.mp3',
        'https://example.com/audio/bake3.mp3'
      ],
      illustrations: [
        'https://example.com/images/img1.png',
        'https://example.com/images/img2.png'
      ]
    },
    {
      id: 'game-syllable-tap',
      type: 'game',
      gameType: 'syllableTap',
      prompt: 'Tap to hear the word. Break it into parts.',
      words: ['bake', 'cape', 'late'],
      phonemes: [
        { onset: 'b', rime: 'ake' },
        { onset: 'c', rime: 'ape' },
        { onset: 'l', rime: 'ate' }
      ],
      audioMap: {
        bake: 'https://example.com/audio/bake.mp3',
        cape: 'https://example.com/audio/cape.mp3'
      }
    },
    {
      id: 'card-magic-e',
      type: 'ruleCard',
      title: 'What is the Magic E?',
      body: "When a word ends in a silent 'e', it can change the vowel sound.",
      visual: 'https://example.com/images/magic-e-visual.png',
      examplePairs: [
        { before: 'cap', after: 'cape' },
        { before: 'tap', after: 'tape' }
      ]
    },
    {
      id: 'scenario-bakery-menu',
      type: 'scenario',
      situation: "You're making a school menu. What should it say?",
      options: [
        { text: 'bak a cake', correct: false },
        { text: 'bake a cake', correct: true },
        { text: 'cake a bak', correct: false }
      ],
      feedback: {
        correct: "Great job! 'Bake a cake' is the right choice.",
        incorrect: "Oops! Try again. Remember the Magic E!"
      }
    },
    {
      id: 'game-spell-cape',
      type: 'game',
      gameType: 'dragSpelling',
      prompt: 'Drag letters to spell the word shown in the picture.',
      word: 'cape',
      correctSpelling: ['c', 'a', 'p', 'e'],
      image: 'https://example.com/images/cape.png'
    }
  ];

  // 🧠 Batch write components
  const batch = db.batch();
  components.forEach((comp) => {
    const ref = db.collection('components').doc(comp.id);
    batch.set(ref, comp);
  });

  await batch.commit();
  console.log('✅ Firestore seeded successfully!');
}

seedData().catch((err) => {
  console.error('❌ Seeding failed:', err);
});
