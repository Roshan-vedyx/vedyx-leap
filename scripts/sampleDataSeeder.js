// workingSeeder.js - Clean version that should work
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseService.js';

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
  {
    id: 'story-bake-sale',
    type: 'story',
    title: 'Bake Sale at School',
    text: [
      'Sara is baking cakes for the school event.',
      'She puts the cakes in a big tray.',
      'She writes Cake Sale Today',
      'Many students come to buy her delicious cakes.'
    ],
    audioUrls: [
      'https://example.com/audio/bake1.mp3',
      'https://example.com/audio/bake2.mp3',
      'https://example.com/audio/bake3.mp3',
      'https://example.com/audio/bake4.mp3'
    ],
    illustrations: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
      'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400'
    ]
  },
  {
    id: 'story-lunch-time',
    type: 'story',
    title: 'Lunch Time at School',
    text: [
      'The bell rings and its time for lunch',
      'Emma walks to the school canteen with her friends.',
      'She looks at the menu board carefully.',
      'Today they have pizza salad and fruit'
    ],
    audioUrls: [
      'https://example.com/audio/lunch1.mp3',
      'https://example.com/audio/lunch2.mp3',
      'https://example.com/audio/lunch3.mp3',
      'https://example.com/audio/lunch4.mp3'
    ],
    illustrations: [
      'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400',
      'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'
    ]
  },
  {
    id: 'story-polite-requests',
    type: 'story',
    title: 'Asking Nicely Gets Results',
    text: [
      'Tom wants to borrow his friend pencil.',
      'He says Can I please borrow your pencil',
      'His friend smiles and says Of course',
      'Being polite always works better than demanding.'
    ],
    audioUrls: [
      'https://example.com/audio/polite1.mp3',
      'https://example.com/audio/polite2.mp3',
      'https://example.com/audio/polite3.mp3',
      'https://example.com/audio/polite4.mp3'
    ],
    illustrations: [
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
      'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400'
    ]
  },
  {
    id: 'card-magic-e',
    type: 'ruleCard',
    title: 'What is the Magic E',
    body: 'When a word ends in a silent e it can change the vowel sound from short to long. The e is silent but very powerful',
    visual: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    examplePairs: [
      { before: 'cap', after: 'cape' },
      { before: 'tap', after: 'tape' },
      { before: 'bit', after: 'bite' },
      { before: 'cut', after: 'cute' }
    ]
  },
  {
    id: 'card-ing-rules',
    type: 'ruleCard',
    title: 'Adding ING to Words',
    body: 'We add ing to action words to show something is happening right now. Sometimes we need to change the spelling slightly.',
    visual: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
    examplePairs: [
      { before: 'run', after: 'running' },
      { before: 'jump', after: 'jumping' },
      { before: 'read', after: 'reading' },
      { before: 'write', after: 'writing' }
    ]
  },
  {
    id: 'card-polite-language',
    type: 'ruleCard',
    title: 'Using Polite Words',
    body: 'When we ask for something using please and can I makes people want to help us. It shows we are respectful and kind.',
    visual: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=400',
    examplePairs: [
      { before: 'Give me that', after: 'Can I please have that' },
      { before: 'I want water', after: 'Can I please have some water' }
    ]
  },
  {
    id: 'game-syllable-tap',
    type: 'game',
    gameType: 'syllableTap',
    prompt: 'Listen to each word and tap the syllables you hear',
    words: ['bake', 'cape', 'late', 'cute', 'bike'],
    phonemes: {
      'bake': ['b', 'ake'],
      'cape': ['c', 'ape'], 
      'late': ['l', 'ate'],
      'cute': ['c', 'ute'],
      'bike': ['b', 'ike']
    },
    audioMap: {
      'bake': 'https://example.com/audio/bake.mp3',
      'cape': 'https://example.com/audio/cape.mp3',
      'late': 'https://example.com/audio/late.mp3',
      'cute': 'https://example.com/audio/cute.mp3',
      'bike': 'https://example.com/audio/bike.mp3'
    }
  },
  {
    id: 'game-spell-magic-e',
    type: 'game',
    gameType: 'dragSpelling',
    prompt: 'Spell these Magic E words correctly',
    words: ['cake', 'tape', 'bike', 'cute', 'hope'],
    audioMap: {
      'cake': 'https://example.com/audio/cake.mp3',
      'tape': 'https://example.com/audio/tape.mp3',
      'bike': 'https://example.com/audio/bike2.mp3',
      'cute': 'https://example.com/audio/cute2.mp3',
      'hope': 'https://example.com/audio/hope.mp3'
    }
  },
  {
    id: 'game-menu-reading',
    type: 'game',
    gameType: 'phonemeMatch',
    prompt: 'Listen and choose the food item you hear',
    words: ['pizza', 'salad', 'apple', 'sandwich', 'juice'],
    audioMap: {
      'pizza': 'https://example.com/audio/pizza.mp3',
      'salad': 'https://example.com/audio/salad.mp3',
      'apple': 'https://example.com/audio/apple.mp3',
      'sandwich': 'https://example.com/audio/sandwich.mp3',
      'juice': 'https://example.com/audio/juice.mp3'
    }
  },
  {
    id: 'game-ing-match',
    type: 'game',
    gameType: 'syllableTap',
    prompt: 'Tap the ING words you hear',
    words: ['running', 'jumping', 'reading', 'writing', 'playing'],
    phonemes: {
      'running': ['run', 'ning'],
      'jumping': ['jump', 'ing'],
      'reading': ['read', 'ing'], 
      'writing': ['writ', 'ing'],
      'playing': ['play', 'ing']
    },
    audioMap: {
      'running': 'https://example.com/audio/running.mp3',
      'jumping': 'https://example.com/audio/jumping.mp3',
      'reading': 'https://example.com/audio/reading.mp3',
      'writing': 'https://example.com/audio/writing.mp3',
      'playing': 'https://example.com/audio/playing.mp3'
    }
  },
  {
    id: 'scenario-bakery-menu',
    type: 'scenario',
    situation: 'You are making a school menu for the bake sale. What should it say',
    options: [
      { text: 'bak a cake', correct: false },
      { text: 'bake a cake', correct: true },
      { text: 'cake a bak', correct: false }
    ],
    feedback: {
      correct: 'Great job. Bake a cake is the right choice. The Magic E makes the a say its name',
      incorrect: 'Oops. Try again. Remember the Magic E rule it makes the vowel say its name'
    }
  },
  {
    id: 'scenario-ordering-lunch',
    type: 'scenario',
    situation: 'You are at the school canteen and want to order lunch. What is the best way to ask',
    options: [
      { text: 'I want pizza now', correct: false },
      { text: 'Can I please have a slice of pizza', correct: true },
      { text: 'Give me pizza', correct: false }
    ],
    feedback: {
      correct: 'Perfect. Using Can I please is polite and respectful. People love helping when you ask nicely',
      incorrect: 'That does not sound very polite. Try using Can I please it works much better'
    }
  },
  {
    id: 'scenario-ing-usage',
    type: 'scenario',
    situation: 'Your friend asks what you are doing right now. You are currently reading a book. What do you say',
    options: [
      { text: 'I read a book', correct: false },
      { text: 'I am reading a book', correct: true },
      { text: 'I will read a book', correct: false }
    ],
    feedback: {
      correct: 'Excellent. I am reading shows you are doing it right now. That is what ING words are for',
      incorrect: 'Not quite. When something is happening right now we use ING words like reading'
    }
  },
  {
    id: 'scenario-asking-nicely',
    type: 'scenario',
    situation: 'You want to borrow your classmate eraser. What is the best way to ask',
    options: [
      { text: 'Give me your eraser', correct: false },
      { text: 'Can I please borrow your eraser', correct: true },
      { text: 'I need that eraser now', correct: false }
    ],
    feedback: {
      correct: 'Wonderful. Can I please borrow is the perfect polite way to ask. Your classmate will be happy to help',
      incorrect: 'That sounds a bit demanding. Try asking with Can I please it is much more polite'
    }
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting to seed the database...');
    console.log(`Will add ${sampleUnits.length} units and ${sampleComponents.length} components.`);

    // Add units
    console.log('📚 Adding units...');
    for (let i = 0; i < sampleUnits.length; i++) {
      const unit = sampleUnits[i];
      console.log(`Adding unit ${i + 1}/${sampleUnits.length}: ${unit.id}`);
      await setDoc(doc(db, 'units', unit.id), unit);
      console.log(`✅ Added unit: ${unit.title}`);
    }

    // Add components
    console.log('🧩 Adding components...');
    for (let i = 0; i < sampleComponents.length; i++) {
      const component = sampleComponents[i];
      console.log(`Adding component ${i + 1}/${sampleComponents.length}: ${component.id}`);
      await setDoc(doc(db, 'components', component.id), component);
      console.log(`✅ Added component: ${component.id} (${component.type})`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`Added ${sampleUnits.length} units and ${sampleComponents.length} components.`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

seedDatabase()
  .then(() => {
    console.log('✅ Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });