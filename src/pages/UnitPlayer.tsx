// /src/pages/UnitPlayer.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { firebaseService } from '@/services/FirebaseService'; // Use your existing service
import ComponentRouter from '@/components/ComponentRouter';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Lock } from 'lucide-react';

interface ComponentProgress {
  componentId: string;
  completed: boolean;
  score?: number;
  attempts: number;
  passed?: boolean; // For assessments
}

const UnitPlayer: React.FC = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();
  
  const [unit, setUnit] = useState<any>(null);
  const [currentComponentIndex, setCurrentComponentIndex] = useState(0);
  const [currentComponent, setCurrentComponent] = useState<any>(null);
  const [componentProgress, setComponentProgress] = useState<ComponentProgress[]>([]);
  const [unitComplete, setUnitComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (unitId) {
      loadUnit();
    }
  }, [unitId]);

  useEffect(() => {
    if (unit && unit.components.length > 0) {
      loadCurrentComponent();
    }
  }, [unit, currentComponentIndex]);

  const loadUnit = async () => {
    try {
      setLoading(true);
      const unitData = await firebaseService.getUnit(unitId!);
      if (!unitData) {
        throw new Error('Unit not found');
      }
      setUnit(unitData);
      
      // Initialize progress tracking
      const initialProgress = unitData.components.map((comp: any, index: number) => ({
        componentId: comp.ref,
        completed: false,
        attempts: 0,
        score: undefined,
        passed: undefined
      }));
      setComponentProgress(initialProgress);
    } catch (error) {
      console.error('Error loading unit:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentComponent = async () => {
    try {
      const componentRef = unit.components[currentComponentIndex].ref;
      // Extract component ID from ref (e.g., "components/story-bake-sale" -> "story-bake-sale")
      const componentId = componentRef.split('/')[1];
      const componentData = await firebaseService.getComponent(componentId);
      setCurrentComponent(componentData);
    } catch (error) {
      console.error('Error loading component:', error);
    }
  };

  const handleComponentComplete = (score?: number, passed?: boolean) => {
    // Update progress for current component
    setComponentProgress(prev => {
      const updated = [...prev];
      updated[currentComponentIndex] = {
        ...updated[currentComponentIndex],
        completed: true,
        score: score,
        attempts: updated[currentComponentIndex].attempts + 1,
        passed: passed
      };
      return updated;
    });

    // Check if this was an assessment that failed
    const currentComponentConfig = unit.components[currentComponentIndex];
    const isRequiredAssessment = currentComponentConfig.required;
    const isAssessment = currentComponent?.type === 'assessment';
    
    if (isRequiredAssessment && isAssessment && !passed) {
      // Assessment failed - show retry or redirect logic
      handleAssessmentFailed();
      return;
    }

    // Move to next component or complete unit
    if (currentComponentIndex < unit.components.length - 1) {
      setCurrentComponentIndex(prev => prev + 1);
    } else {
      // Unit complete!
      setUnitComplete(true);
      // Here you could save progress to Firebase, unlock next unit, etc.
    }
  };

  const handleAssessmentFailed = () => {
    // Show assessment failure message and options
    alert('Assessment not passed. You may need to review prerequisite skills.');
    // Could redirect to prerequisite units, show additional resources, etc.
  };

  const canAccessComponent = (index: number): boolean => {
    // Component is accessible if:
    // 1. It's the first component, OR
    // 2. All previous components are completed, OR  
    // 3. Previous component was a non-required assessment that can be skipped
    if (index === 0) return true;
    
    for (let i = 0; i < index; i++) {
      const progress = componentProgress[i];
      const componentConfig = unit.components[i];
      
      // If it's a required component and not completed, block access
      if (componentConfig.required && !progress.completed) {
        return false;
      }
      
      // If it's a required assessment and failed, block access
      if (componentConfig.required && progress.passed === false) {
        return false;
      }
    }
    
    return true;
  };

  const goToComponent = (index: number) => {
    if (canAccessComponent(index)) {
      setCurrentComponentIndex(index);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading unit...</p>
        </div>
      </div>
    );
  }

  if (unitComplete) {
    const totalScore = componentProgress.reduce((sum, progress) => sum + (progress.score || 0), 0);
    const avgScore = totalScore / componentProgress.filter(p => p.score !== undefined).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-lg"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Unit Complete! 🎉
          </h1>
          
          <p className="text-xl text-gray-600 mb-6">
            You've finished "{unit.title}"
          </p>
          
          {avgScore && (
            <p className="text-lg text-gray-700 mb-6">
              Average Score: {Math.round(avgScore)}%
            </p>
          )}
          
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-mint-500 text-white rounded-2xl font-bold hover:bg-mint-600 transition-all transform hover:scale-105"
          >
            Back to Units
          </button>
        </motion.div>
      </div>
    );
  }

  if (!unit || !currentComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">
          Unit or component not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with progress */}
      <div className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Units
          </button>
          
          <div className="text-center">
            <h1 className="font-bold text-lg text-gray-800">{unit.title}</h1>
            <p className="text-sm text-gray-600">
              {currentComponentIndex + 1} of {unit.components.length}
            </p>
          </div>
          
          <div className="text-sm text-gray-600">
            {Math.round(((currentComponentIndex + 1) / unit.components.length) * 100)}% Complete
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="max-w-4xl mx-auto mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-mint-400 to-blue-400"
              initial={{ width: 0 }}
              animate={{ width: `${((currentComponentIndex + 1) / unit.components.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 100 }}
            />
          </div>
        </div>
        
        {/* Component navigation dots */}
        <div className="max-w-4xl mx-auto mt-4 flex justify-center gap-2">
          {unit.components.map((_, index) => {
            const progress = componentProgress[index];
            const canAccess = canAccessComponent(index);
            
            return (
              <button
                key={index}
                onClick={() => goToComponent(index)}
                disabled={!canAccess}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentComponentIndex
                    ? 'bg-blue-500 scale-125'
                    : progress.completed
                      ? 'bg-green-500'
                      : canAccess
                        ? 'bg-gray-300 hover:bg-gray-400'
                        : 'bg-gray-200'
                }`}
                title={
                  !canAccess 
                    ? 'Locked - complete previous components first'
                    : `Component ${index + 1}`
                }
              >
                {!canAccess && (
                  <Lock className="w-2 h-2 text-gray-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current component */}
      <div className="flex-1">
        <ComponentRouter
          component={currentComponent}
          onComplete={handleComponentComplete}
        />
      </div>
    </div>
  );
};

export default UnitPlayer;