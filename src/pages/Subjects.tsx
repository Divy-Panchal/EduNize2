import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  Atom, 
  FlaskConical, 
  Microscope, 
  Globe, 
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const subjects = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: Calculator,
    gradient: 'from-blue-500 to-blue-600',
    lightGradient: 'from-blue-100 to-blue-200',
    description: 'Algebra, Calculus & Geometry'
  },
  {
    id: 'physics',
    name: 'Physics',
    icon: Atom,
    gradient: 'from-purple-500 to-purple-600',
    lightGradient: 'from-purple-100 to-purple-200',
    description: 'Mechanics, Waves & Energy'
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    icon: FlaskConical,
    gradient: 'from-green-500 to-green-600',
    lightGradient: 'from-green-100 to-green-200',
    description: 'Organic & Inorganic Chemistry'
  },
  {
    id: 'biology',
    name: 'Biology',
    icon: Microscope,
    gradient: 'from-emerald-500 to-emerald-600',
    lightGradient: 'from-emerald-100 to-emerald-200',
    description: 'Life Sciences & Genetics'
  },
  {
    id: 'geography',
    name: 'Geography',
    icon: Globe,
    gradient: 'from-orange-500 to-orange-600',
    lightGradient: 'from-orange-100 to-orange-200',
    description: 'Physical & Human Geography'
  },
  {
    id: 'english',
    name: 'English',
    icon: BookOpen,
    gradient: 'from-pink-500 to-pink-600',
    lightGradient: 'from-pink-100 to-pink-200',
    description: 'Literature & Language Arts'
  }
];

export function Subjects() {
  const { themeConfig } = useTheme();

  return (
    <div className="space-y-6 pb-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-4"
      >
        <h1 className={`text-2xl font-bold ${themeConfig.text} mb-2`}>
          Choose Your Subject
        </h1>
        <p className={`${themeConfig.textSecondary} text-sm`}>
          Select a subject to start studying
        </p>
      </motion.div>

      <div className="px-4 space-y-4">
        {subjects.map((subject, index) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden"
          >
            <div className={`bg-gradient-to-r ${subject.gradient} rounded-2xl p-1 shadow-lg`}>
              <div className="bg-white rounded-xl p-4 h-24 flex items-center justify-between relative overflow-hidden">
                {/* Background Pattern */}
                <div className={`absolute inset-0 bg-gradient-to-r ${subject.lightGradient} opacity-30`} />
                
                {/* Content */}
                <div className="relative z-10 flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {subject.name}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {subject.description}
                  </p>
                </div>

                {/* Icon Container */}
                <div className="relative z-10 flex items-center gap-3">
                  <div className={`bg-gradient-to-br ${subject.gradient} p-3 rounded-xl shadow-md`}>
                    <subject.icon className="w-8 h-8 text-white" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                {/* Decorative Elements */}
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className={`absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br ${subject.gradient} opacity-10 rounded-full`}
                />
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.5
                  }}
                  className={`absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-br ${subject.gradient} opacity-20 rounded-full`}
                />
              </div>
            </div>

            {/* Progress Indicator */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.random() * 40 + 60}%` }}
              transition={{ duration: 1, delay: index * 0.2 }}
              className={`h-1 bg-gradient-to-r ${subject.gradient} rounded-full mt-2 mx-1`}
            />
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="px-4"
      >
        <div className={`${themeConfig.card} rounded-2xl p-4 shadow-sm border border-gray-100`}>
          <h3 className={`text-lg font-semibold ${themeConfig.text} mb-3`}>
            Today's Progress
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring", stiffness: 200 }}
                className="text-2xl font-bold text-blue-600 mb-1"
              >
                4
              </motion.div>
              <p className="text-xs text-gray-600">Subjects</p>
            </div>
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
                className="text-2xl font-bold text-green-600 mb-1"
              >
                12
              </motion.div>
              <p className="text-xs text-gray-600">Tasks Done</p>
            </div>
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
                className="text-2xl font-bold text-purple-600 mb-1"
              >
                3.2h
              </motion.div>
              <p className="text-xs text-gray-600">Study Time</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}