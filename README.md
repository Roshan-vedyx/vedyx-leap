# Vedyx Leap

**A neurodivergent-friendly, gamified phonics learning app built with React, Firebase, and modern web technologies.**

---

## 1. Overview

Vedyx Leap is an accessible, research-driven phonics learning platform designed for neurodivergent and neurotypical children alike. It uses Universal Design for Learning (UDL) principles, adaptive intelligence, and gamification to make early literacy engaging, supportive, and effective. The app features:

- **Stories, games, and scenarios** that teach phonics in context
- **Adaptive difficulty** and frustration detection
- **Audio-rich, multi-accent support** (US, UK, IN)
- **Parent dashboard** for progress analytics
- **Dyslexia-friendly, accessible UI**

**Who is it for?**  
Children learning to read (especially those with dyslexia, ADHD, or other learning differences), their parents, and educators.

---

## 2. Adding New Content Units (Stories, Games, etc.)

Content is organized in Firestore as **units** (collections of learning activities) and **components** (individual stories, games, rule cards, scenarios, etc.).

### To add a new unit or component:

1. **Edit or create Firestore documents**:
   - Units are stored in the `units` collection.
   - Components are stored in the `components` collection.

2. **Unit structure example**:
   ```json
   {
     "id": "magic-e",
     "title": "The Magic E",
     "description": "Learn how silent 'e' changes the meaning of words.",
     "estimatedDuration": 12,
     "unlockable": true,
     "coverImage": "https://example.com/magic-e.png",
     "components": [
       { "type": "story", "ref": "components/story-bake-sale" },
       { "type": "game", "ref": "components/game-syllable-tap" },
       { "type": "ruleCard", "ref": "components/card-magic-e" },
       { "type": "scenario", "ref": "components/scenario-bakery-menu" }
     ]
   }
   ```

3. **Component structure example** (for a story):
   ```json
   {
     "id": "story-bake-sale",
     "type": "story",
     "title": "Bake Sale at School",
     "text": [
       "Sara is baking cakes for the school event.",
       "She puts the cakes in a big tray.",
       "She writes: 'Cake Sale Today!'"
     ],
     "audioUrls": [
       "/sounds/bake1.mp3",
       "/sounds/bake2.mp3",
       "/sounds/bake3.mp3"
     ],
     "illustrations": [
       "/images/img1.png",
       "/images/img2.png"
     ]
   }
   ```

4. **Seeding content**:  
   Use `seedFirestore.js` or `sampleDataSeeder.js` to batch-upload units and components.  
   - Update or add your new units/components in the seeder script.
   - Run: `node seedFirestore.js` or `node runSeeder.js`

5. **Phoneme content**:  
   - Edit `src/assets/content/phonemes.json` to add new phonemes or words.
   - Each phoneme entry includes an ID, IPA symbol, grapheme, and a list of words (with emoji, audio, etc.).

---

## 3. Generating TTS Audio and Word Timing

### a. **Story TTS and Word Timing**

- Use `generate_tts_story.py` to generate MP3 audio and word-level timing for a story.
- **How it works:**
  - Edit the `lines` array in the script with your story text.
  - The script uses Google Cloud Text-to-Speech with SSML `<mark>` tags for word timing.
  - Outputs:
    - `bake-sale.mp3` (audio)
    - `bake-sale-timings.json` (timing data)
- **Run:**
  ```bash
  python generate_tts_story.py
  ```
  - Requires Google Cloud credentials (`tts-access-key.json`).

### b. **Phoneme/Word TTS for All Accents**

- Use `generate_tts_phonemes.py` to generate all phoneme/word audio files for US, UK, and IN accents.
- **How it works:**
  - Reads `src/assets/content/phonemes.json`.
  - For each word in each phoneme, generates `/public/sounds/{accent}_{phoneme}_{word}.mp3`.
- **Run:**
  ```bash
  python generate_tts_phonemes.py
  ```
  - Outputs are saved in `public/sounds/`.

---

## 4. What `ComponentRouter.tsx` Does

- `ComponentRouter.tsx` is the dynamic loader for all learning activities.
- It receives a component object (from Firestore) and **selects the correct React player**:
  - `StoryPlayer` or `EnhancedStoryPlayer` for stories
  - `GamePlayer` or `EnhancedGamePlayer` for games
  - `ScenarioPlayer` or `EnhancedScenarioPlayer` for scenarios
  - `RuleCard` for rule explanations
  - `AssessmentPlayer` for assessments
- **Selection logic**:  
  - Enhanced players are used if the component has extra features (e.g., comprehension questions for stories, new game types, hints/difficulty for scenarios).
  - If the type is unknown, it shows an error message.

---

## 5. Where to Plug in Audio Playback and Word Highlighting

- **Audio playback** is managed by `src/utils/audioManager.ts` (singleton `audioManager`).
  - Use `audioManager.playSound()` or `audioManager.playPhonemeSound()` in your components.
  - Accent is set via `audioManager.setAccent('us' | 'uk' | 'in')`.
  - Preload sounds with `audioManager.preloadSounds()`.

- **Word highlighting** (for synchronized reading):
  - Use the timing data from TTS (see `bake-sale-timings.json`).
  - In your player component (e.g., `StoryPlayer`), as audio plays, update the highlighted word based on the current playback time and the timing data.
  - Plug this logic into the relevant player’s render loop or effect.

---

## 6. Local Testing with Firebase Emulator

- **Recommended:** Use the Firebase Emulator Suite for local Firestore and Auth testing.
- **Setup:**
  1. Install the emulator:  
     ```bash
     npm install -g firebase-tools
     firebase init emulators
     ```
  2. Start the emulator:  
     ```bash
     firebase emulators:start
     ```
  3. Update your `.env` or Firebase config to point to the local emulator (see [Firebase docs](https://firebase.google.com/docs/emulator-suite/connect_and_prototype)).
  4. Run the app locally:  
     ```bash
     npm run dev
     ```
  5. Use the seeder scripts to populate the local Firestore instance.

---

## 7. Tech Stack Overview

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, custom CSS, accessibility enhancements
- **State Management:** Zustand (persistent, global state)
- **Backend:** Firebase (Firestore, Auth, Hosting)
- **Audio:** Web Audio API (custom manager), Google Cloud TTS
- **Animation:** Framer Motion
- **Drag & Drop:** @dnd-kit
- **Data Viz:** Recharts
- **Other:** html2pdf.js (PDF export), Lucide icons

---

## 8. Getting Started (For New Developers)

1. **Clone the repo and install dependencies:**
   ```bash
   git clone <repo-url>
   cd VedyxLeap
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in Firebase credentials.
   - Place your Google Cloud TTS key as `tts-access-key.json` in the root.

3. **Run the app locally:**
   ```bash
   npm run dev
   ```

4. **(Optional) Start Firebase Emulator:**
   ```bash
   firebase emulators:start
   ```

5. **Seed Firestore with sample data:**
   ```bash
   node seedFirestore.js
   # or
   node runSeeder.js
   ```

6. **Generate TTS audio (if adding new content):**
   ```bash
   python generate_tts_story.py
   python generate_tts_phonemes.py
   ```

7. **Explore the codebase:**
   - Main entry: `src/App.tsx`
   - Content logic: `src/utils/contentManager.ts`
   - Audio: `src/utils/audioManager.ts`
   - State: `src/store/useAppState.ts`
   - Players: `src/components/players/`
   - Routing: `src/components/ComponentRouter.tsx`

---

## Questions?

- See `processDocumentation.md` and `ProcessDocumentation_Old.md` for more details.
- For issues, open a GitHub issue or contact the maintainers.

---

**Happy hacking and thank you for supporting accessible literacy!** 