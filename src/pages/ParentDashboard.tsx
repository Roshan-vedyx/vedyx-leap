import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, Home, TrendingUp, Calendar, Star, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../store/useAppState';
import html2pdf from 'html2pdf.js';

const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { childName, selectedAvatar, progress, errors } = useAppState();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Sample data - replace with actual data from Firebase
  const progressData = [
    { day: 'Mon', phonemes: 5, time: 12 },
    { day: 'Tue', phonemes: 8, time: 18 },
    { day: 'Wed', phonemes: 6, time: 15 },
    { day: 'Thu', phonemes: 10, time: 22 },
    { day: 'Fri', phonemes: 7, time: 16 },
    { day: 'Sat', phonemes: 12, time: 25 },
    { day: 'Sun', phonemes: 9, time: 20 },
  ];

  const masteryData = [
    { letter: 'A', mastery: 95, attempts: 20 },
    { letter: 'B', mastery: 87, attempts: 15 },
    { letter: 'C', mastery: 92, attempts: 18 },
    { letter: 'D', mastery: 78, attempts: 12 },
    { letter: 'E', mastery: 85, attempts: 16 },
  ];

  const generateReport = () => {
    const element = document.getElementById('report-content');
    const opt = {
      margin: 1,
      filename: `${childName}_phonics_report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 to-blue-50 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <Home className="w-6 h-6 text-gray-600" />
        </button>
        
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-white rounded-lg border-2 border-gray-200 focus:border-mint-500 focus:outline-none"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
          
          <button
            onClick={generateReport}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>
      </div>

      <div id="report-content" className="max-w-6xl mx-auto">
        {/* Child Info */}
        <motion.div 
          className="bg-white rounded-2xl p-6 mb-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-mint-400 to-blue-400 rounded-full flex items-center justify-center text-2xl">
              {selectedAvatar}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{childName}'s Progress</h1>
              <p className="text-gray-600">Learning phonics with Vedyx Leap</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-mint-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-mint-600 mb-1">{progress}</div>
              <div className="text-sm text-gray-600">Phonemes Learned</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">7</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">92%</div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">18</div>
              <div className="text-sm text-gray-600">Minutes/Day</div>
            </div>
          </div>
        </motion.div>

        {/* Progress Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-mint-500" />
              Daily Progress
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="phonemes" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Learning Time
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="time" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Mastery Breakdown */}
        <motion.div 
          className="bg-white rounded-2xl p-6 mb-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Phoneme Mastery
          </h2>
          <div className="space-y-4">
            {masteryData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-mint-400 to-blue-400 rounded-lg flex items-center justify-center text-white font-bold">
                    {item.letter}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Letter {item.letter}</div>
                    <div className="text-sm text-gray-600">{item.attempts} attempts</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-mint-400 to-mint-500 transition-all duration-1000"
                      style={{ width: `${item.mastery}%` }}
                    />
                  </div>
                  <div className="text-sm font-semibold text-gray-700 w-12">
                    {item.mastery}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Recommendations
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-mint-50 rounded-lg border-l-4 border-mint-500">
              <div className="font-semibold text-gray-800">Great Progress!</div>
              <div className="text-sm text-gray-600">
                {childName} is showing excellent consistency. Keep up the daily practice routine.
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="font-semibold text-gray-800">Focus Area</div>
              <div className="text-sm text-gray-600">
                Letter D could use more practice. Consider spending extra time on similar sounds.
              </div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <div className="font-semibold text-gray-800">Optimal Learning Time</div>
              <div className="text-sm text-gray-600">
                Best performance observed between 10-15 minutes per session.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ParentDashboard;