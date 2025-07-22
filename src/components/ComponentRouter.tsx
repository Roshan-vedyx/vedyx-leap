// /src/components/ComponentRouter.tsx
import React from 'react';
// Your existing components
import StoryPlayer from './players/StoryPlayer';
import RuleCard from './players/RuleCard';
import GamePlayer from './players/GamePlayer';
import ScenarioPlayer from './players/ScenarioPlayer';
// Your new enhanced components
import AssessmentPlayer from './players/AssessmentPlayer';
import EnhancedGamePlayer from './players/EnhancedGamePlayer';
import EnhancedStoryPlayer from './players/EnhancedStoryPlayer';
import EnhancedScenarioPlayer from './players/EnhancedScenarioPlayer';

interface ComponentRouterProps {
  component: any; // Your component data from Firestore
  onComplete?: (score?: number) => void;
}

const ComponentRouter: React.FC<ComponentRouterProps> = ({ component, onComplete }) => {
  // Route to the correct player based on component type
  switch (component.type) {
    case 'story':
      // Check if it has comprehension questions - use enhanced version
      if (component.comprehensionQuestions && component.comprehensionQuestions.length > 0) {
        return (
          <EnhancedStoryPlayer
            id={component.id}
            title={component.title}
            text={component.text}
            audioUrls={component.audioUrls}
            illustrations={component.illustrations}
            comprehensionQuestions={component.comprehensionQuestions}
            onComplete={onComplete}
          />
        );
      }
      // Use original story player
      return (
        <StoryPlayer
          id={component.id}
          title={component.title}
          text={component.text}
          audioUrls={component.audioUrls}
          illustrations={component.illustrations}
          onComplete={onComplete}
        />
      );

    case 'ruleCard':
      return (
        <RuleCard
          id={component.id}
          title={component.title}
          body={component.body}
          visual={component.visual}
          examplePairs={component.examplePairs}
          onComplete={onComplete}
        />
      );

    case 'game':
      // Check if it's one of the new game types
      const newGameTypes = ['audioDiscrimination', 'patternMatching', 'speedReading', 'guidedReading'];
      if (newGameTypes.includes(component.gameType)) {
        return (
          <EnhancedGamePlayer
            id={component.id}
            gameType={component.gameType}
            prompt={component.prompt}
            words={component.words}
            phonemes={component.phonemes}
            audioMap={component.audioMap}
            wordPairs={component.wordPairs}
            categories={component.categories}
            timeLimit={component.timeLimit}
            onComplete={onComplete}
          />
        );
      }
      // Use original game player for existing game types
      return (
        <GamePlayer
          id={component.id}
          gameType={component.gameType}
          prompt={component.prompt}
          words={component.words}
          phonemes={component.phonemes}
          audioMap={component.audioMap}
          onComplete={onComplete}
        />
      );

    case 'scenario':
      // Check if it has enhanced scenario features (difficulty, hints, etc.)
      if (component.difficulty || component.hints || component.context) {
        return (
          <EnhancedScenarioPlayer
            id={component.id}
            situation={component.situation}
            context={component.context}
            options={component.options}
            feedback={component.feedback}
            difficulty={component.difficulty}
            hints={component.hints}
            illustration={component.illustration}
            onComplete={onComplete}
          />
        );
      }
      // Use original scenario player
      return (
        <ScenarioPlayer
          id={component.id}
          situation={component.situation}
          options={component.options}
          feedback={component.feedback}
          onComplete={onComplete}
        />
      );

    case 'assessment':
      // New component type - always use AssessmentPlayer
      return (
        <AssessmentPlayer
          id={component.id}
          title={component.title}
          instructions={component.instructions}
          tasks={component.tasks}
          passingScore={component.passingScore}
          feedback={component.feedback}
          onComplete={onComplete}
        />
      );

    default:
      return (
        <div className="max-w-4xl mx-auto p-4 bg-red-50 min-h-screen flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Unknown Component Type</h2>
            <p className="text-gray-700">
              Component type "{component.type}" is not supported yet.
            </p>
          </div>
        </div>
      );
  }
};

export default ComponentRouter;