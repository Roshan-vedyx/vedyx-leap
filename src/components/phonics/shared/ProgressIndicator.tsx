import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle } from 'lucide-react';

interface ProgressIndicatorProps {
  currentDay: number;
  weekProgress: Record<number, boolean>;
  weeklyActivities: { day: number; icon: string; color: string }[];
  phoneme: string;
  weekNumber: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentDay, weekProgress, weeklyActivities, phoneme, weekNumber }) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Week {weekNumber}: Learning {phoneme}
        </h3>
        <div className="text-sm text-gray-500">
          Day {currentDay} of 7
        </div>
      </div>
      
      <div className="flex gap-2 justify-center">
        {weeklyActivities.map((activity) => (
          <motion.div
            key={activity.day}
            className={`flex-1 max-w-16 p-2 rounded-lg text-center transition-all ${
              activity.day === currentDay 
                ? `bg-gradient-to-r ${activity.color} shadow-lg scale-105` 
                : weekProgress[activity.day]
                  ? 'bg-green-100 shadow-md'
                  : 'bg-gray-100'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl mb-1">{activity.icon}</div>
            <div className="text-xs font-medium text-gray-700">Day {activity.day}</div>
            {weekProgress[activity.day] && (
              <CheckCircle className="w-3 h-3 text-green-600 mx-auto mt-1" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;