// sampleDataSeeder.js
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup for __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------
// STEP 1: STATIC DATA
// -------------------------
const sampleUnits = [
  {
    id: 'magic-e',
    title: 'The Magic E',
    description: 'Learn how silent e changes the meaning of words.',
    estimatedDuration: 12,
    unlockable: true,
    coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    components: [
      { type: 'story', ref: 'components/story-bake-sale' },
      { type: 'ruleCard', ref: 'components/card-magic-e' },
      { type: 'game', ref: 'components/game-syllable-tap' },
      { type: 'game', ref: 'components/game-spell-magic-e' },
      { type: 'scenario', ref: 'components/scenario-bakery-menu' }
    ]
  },
  {
    id: 'school-canteen',
    title: 'At the School Canteen',
    description: 'Practice reading and ordering food at the school cafeteria.',
    estimatedDuration: 15,
    unlockable: true,
    coverImage: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400',
    components: [
      { type: 'story', ref: 'components/story-lunch-time' },
      { type: 'game', ref: 'components/game-menu-reading' },
      { type: 'scenario', ref: 'components/scenario-ordering-lunch' }
    ]
  },
  {
    id: 'ing-words',
    title: 'ING Words',
    description: 'Master words that end with ing and understand their usage.',
    estimatedDuration: 10,
    unlockable: true,
    coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
    components: [
      { type: 'ruleCard', ref: 'components/card-ing-rules' },
      { type: 'game', ref: 'components/game-ing-match' },
      { type: 'scenario', ref: 'components/scenario-ing-usage' }
    ]
  },
  {
    id: 'polite-requests',
    title: 'Polite Requests',
    description: 'Learn polite ways to ask for things and common sight words.',
    estimatedDuration: 8,
    unlockable: true,
    coverImage: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=400',
    components: [
      { type: 'story', ref: 'components/story-polite-requests' },
      { type: 'ruleCard', ref: 'components/card-polite-language' },
      { type: 'scenario', ref: 'components/scenario-asking-nicely' }
    ]
  }
];

const sampleComponents = [
  // Your full sampleComponents array here...
  // No need to modify — just paste the whole thing from your working code.
];

// -------------------------
// STEP 2: PHONEME DYNAMIC DATA
// -------------------------
const phonemeDataPath = path.join(__dirname, 'src/assets/content/phoneme.json');
let phonemeData = [];

try {
  const rawData = fs.readFileSync(phonemeDataPath, 'utf8');
  phonemeData = JSON.parse(rawData);
} catch (err) {
  console.error('❌ Error reading phoneme.json:', err);
}

const createPhonemeComponents = () => {
  return phonemeData.slice(0, 10).map((phoneme) => ({
    id: `phoneme-${phoneme.id}`,
    type: 'phoneme',
    title: `Learn the ${phoneme.grapheme || phoneme.id} sound`,
    description: `Master the ${phoneme.ipa || phoneme.id} phoneme`,
    estimatedDuration: 5,
    data: {
      phoneme: phoneme.ipa || phoneme.id,
      grapheme: phoneme.grapheme || phoneme.id,
      mouthImage: `/images/mouth-positions/${phoneme.id}.png`,
      description: `The sound in '${phoneme.words?.[0]?.word || 'words'}'`,
      exampleWords: (phoneme.words || []).slice(0, 4).map(word => ({
        word: word.word,
        audio: word.audio || `/sounds/${word.word}.mp3`,
        image: word.image || `/images/words/${word.word}.png`,
        emoji: word.emoji || '📝'
      }))
    }
  }));
};

const createPhonicsUnit = (phonemeComponents) => ({
  id: 'phonics-basics',
  title: 'Phonics Basics',
  description: 'Learn essential phoneme sounds and letter recognition',
  estimatedDuration: phonemeComponents.length * 5,
  unlockable: true,
  coverImage: '/images/units/phonics-basics.png',
  components: phonemeComponents.map(comp => ({
    type: comp.type,
    ref: `components/${comp.id}`
  })),
  metadata: {
    skillsTargeted: ['phoneme recognition', 'letter-sound correspondence', 'auditory discrimination'],
    ageRange: '4-7',
    difficulty: 'beginner'
  }
});

// -------------------------
// STEP 3: SEED FUNCTION
// -------------------------
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');

    // Static units
    for (let unit of sampleUnits) {
      await setDoc(doc(db, 'units', unit.id), unit);
      console.log(`✅ Added unit: ${unit.id}`);
    }

    // Static components
    for (let component of sampleComponents) {
      await setDoc(doc(db, 'components', component.id), component);
      console.log(`✅ Added component: ${component.id}`);
    }

    // Phoneme components
    const phonemeComponents = createPhonemeComponents();
    for (let component of phonemeComponents) {
      await setDoc(doc(db, 'components', component.id), component);
      console.log(`🧠 Added phoneme: ${component.id}`);
    }

    // Phonics Basics unit
    const phonicsUnit = createPhonicsUnit(phonemeComponents);
    await setDoc(doc(db, 'units', phonicsUnit.id), phonicsUnit);
    console.log(`📘 Added unit: ${phonicsUnit.id}`);

    console.log('🎉 Database seeding completed!');
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
}

seedDatabase()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
