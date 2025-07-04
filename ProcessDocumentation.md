# Vedyx Leap - Process Documentation

## Project Overview
Vedyx Leap is a neurodivergent-friendly mobile web application designed to teach early phonics through gamified, adaptive learning. The app follows Universal Design for Learning (UDL) principles and incorporates intelligent difficulty adjustment based on user behavior and frustration detection.

## Architecture Overview

### Core Technologies
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast development and build tool
- **Zustand** - Lightweight state management
- **Firebase** - Authentication and database
- **Framer Motion** - Smooth animations
- **@dnd-kit** - Drag and drop functionality
- **Recharts** - Data visualization for dashboard

## File Structure and Functions

### Root Files
- **`package.json`** - Project dependencies and scripts
- **`tailwind.config.js`** - Tailwind CSS configuration with custom colors and animations
- **`vite.config.ts`** - Vite build configuration
- **`tsconfig.*.json`** - TypeScript configuration files
- **`index.html`** - Main HTML entry point with PWA meta tags

### Source Code Structure

#### `/src/App.tsx`
- Main application component
- Sets up React Router for navigation
- Handles global layout and theming
- Manages route transitions with Framer Motion

#### `/src/pages/`
**`WelcomeScreen.tsx`**
- Landing page with app branding
- Navigation to onboarding or parent dashboard
- Animated welcome experience with floating elements

**`OnboardingScreen.tsx`**
- 3-step child setup process
- Name input, avatar selection, sound testing
- Progressive form validation and smooth transitions

**`GameScreen.tsx`**
- Core phonics learning interface
- Drag-and-drop letter matching game
- Real-time feedback and progress tracking
- Integration with reward and calm break systems

**`ParentDashboard.tsx`**
- Comprehensive progress analytics
- Interactive charts showing learning trends
- PDF report generation
- Personalized recommendations

#### `/src/components/`
**`RewardScreen.tsx`**
- Celebration modal for successful completion
- Animated rewards with confetti effects
- Multiple reward types (success, effort, milestone)
- Auto-dismissing with manual override

**`CalmBreak.tsx`**
- Mindfulness break for frustrated users
- Breathing exercises with visual guidance
- Customizable duration and calming animations
- Gentle re-engagement prompts

#### `/src/store/`
**`useAppState.ts`**
- Zustand store for global state management
- Persistent storage for user preferences
- Game progress tracking
- Mood and frustration monitoring
- Actions for state updates

#### `/src/services/`
**`FirebaseService.ts`**
- Firebase integration layer
- User authentication management
- Game progress persistence
- Analytics data collection
- Offline-first data synchronization

#### `/src/hooks/`
**`useIntelligenceEngine.ts`**
- Adaptive difficulty adjustment
- Frustration pattern detection
- Personalized content recommendations
- Real-time behavior analysis
- Intervention trigger system

#### `/src/utils/`
**`audioManager.ts`**
- Web Audio API wrapper
- Sound effect management
- Phoneme pronunciation playback
- Volume control and audio caching
- Cross-browser compatibility

**`contentManager.ts`**
- Phonics content organization
- Level progression logic
- Adaptive content generation
- Prerequisites validation
- Progress calculation

#### `/src/App.css`
- Global styles and animations
- Dyslexia-friendly font settings
- Custom CSS animations
- Drag-and-drop styling
- Accessibility enhancements

## Key Features Implementation

### 1. Neurodivergent-Friendly Design
- **Large tap targets** (minimum 44px) for motor skill accessibility
- **High contrast colors** meeting WCAG AA standards
- **Dyslexia-friendly fonts** (Inter with OpenType features)
- **Reduced motion options** and gentle animations
- **Clear visual hierarchy** with consistent spacing

### 2. Adaptive Intelligence Engine
- **Frustration detection** through interaction patterns
- **Dynamic difficulty adjustment** based on performance
- **Personalized content delivery** matching learning pace
- **Intervention triggers** for calm breaks and hints
- **Progress pattern analysis** for optimization

### 3. Gamification Elements
- **Reward system** with multiple celebration types
- **Progress tracking** with visual indicators
- **Avatar system** for personalization
- **Streak counting** for motivation
- **Achievement unlocking** through milestones

### 4. Parent Dashboard Analytics
- **Performance visualization** with interactive charts
- **Trend analysis** showing learning patterns
- **Exportable reports** in PDF format
- **Intervention recommendations** based on data
- **Session insights** for optimization

### 5. Audio Integration
- **Phoneme pronunciation** with native audio
- **Success/error feedback** sounds
- **Background music** options
- **Sound caching** for offline capability
- **Volume controls** and muting options

## Data Flow

### User Authentication
1. Parent creates account via Firebase Auth
2. Child profile stored in Firestore
3. Session persistence via Zustand storage
4. Offline capability with local storage fallback

### Game Session
1. Content loaded from ContentManager
2. User interactions tracked by IntelligenceEngine
3. Progress saved to Firebase in real-time
4. Adaptive adjustments applied automatically
5. Interventions triggered based on behavior

### Analytics Pipeline
1. User actions logged to Firebase
2. Data aggregated for dashboard display
3. Trend analysis performed client-side
4. Recommendations generated by AI engine
5. Reports exported via html2pdf

## Performance Considerations

### Optimization Strategies
- **Code splitting** at route level
- **Lazy loading** of non-critical components
- **Audio preloading** for smooth playback
- **Image optimization** with appropriate formats
- **Bundle size monitoring** and tree shaking

### Accessibility Features
- **Keyboard navigation** support
- **Screen reader compatibility** 
- **High contrast mode** support
- **Reduced motion preferences** respect
- **Touch target sizing** for motor accessibility

## Future Extensibility

### Planned Integration Points
- **Open source phonics content** via ContentManager
- **Third-party assessment tools** through Firebase
- **Multi-language support** via i18n framework
- **Therapist dashboard** for professional insights
- **Offline-first synchronization** for rural access

### Modular Architecture Benefits
- **Component reusability** across different learning domains
- **Easy A/B testing** of different approaches
- **Plugin system** for custom interventions
- **White-label customization** for institutions
- **API-first design** for future integrations

## Development Workflow

### Local Development
1. `npm run dev` - Start development server
2. `npm run build` - Production build
3. `npm run preview` - Preview production build
4. `npm run lint` - Code quality checks

### Deployment Strategy
- **Firebase Hosting** for static assets
- **Firestore** for real-time data
- **Firebase Functions** for serverless logic
- **CDN integration** for global performance
- **Progressive Web App** capabilities

This documentation provides a comprehensive overview of the Vedyx Leap application architecture and implementation details for developers and stakeholders.