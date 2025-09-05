import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Medal, 
  BookOpen, 
  Target, 
  Zap, 
  Crown, 
  Award,
  Flame,
  Brain,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const achievements = [
  {
    id: 'math-master',
    title: 'Math Master',
    description: 'Complete 50 math problems',
    icon: Trophy,
    gradient: 'from-yellow-400 via-yellow-500 to-orange-500',
    progress: 85,
    unlocked: true,
    points: 500
  },
  {
    id: 'quiz-champion',
    title: 'Quiz Champion',
    description: 'Score 90% on 5 quizzes',
    icon: Crown,
    gradient: 'from-purple-400 via-purple-500 to-indigo-500',
    progress: 100,
    unlocked: true,
    points: 750
  },
  {
    id: 'streak-saver',
    title: 'Streak Saver',
    description: 'Study for 7 days straight',
    icon: Flame,
    gradient: 'from-red-400 via-red-500 to-pink-500',
    progress: 71,
    unlocked: false,
    points: 300
  },
  {
    id: 'speed-reader',
    title: 'Speed Reader',
    description: 'Read 10 chapters this week',
    icon: BookOpen,
    gradient: 'from-green-400 via-green-500 to-emerald-500',
    progress: 60,
    unlocked: false,
    points: 400
  },
  {
    id: 'focus-master',
    title: 'Focus Master',
    description: 'Complete 25 Pomodoro sessions',
    icon: Brain,
    gradient: 'from-blue-400 via-blue-500 to-cyan-500',
    progress: 92,
    unlocked: true,
    points: 600
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Study before 8 AM for 5 days',
    icon: Clock,
    gradient: 'from-orange-400 via-orange-500 to-red-500',
    progress: 40,
    unlocked: false,
    points: 250
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Get 100% on any test',
    icon: Star,
    gradient: 'from-pink-400 via-pink-500 to-rose-500',
    progress: 100,
    unlocked: true,
    points: 1000
  },
  {
    id: 'task-crusher',
    title: 'Task Crusher',
    description: 'Complete 100 tasks',
    icon: CheckCircle,
    gradient: 'from-teal-400 via-teal-500 to-green-500',
    progress: 78,
    unlocked: false,
    points: 800
  }
];

const levels = [
  { name: 'Beginner', min: 0, max: 999, color: 'text-gray-600' },
  { name: 'Student', min: 1000, max: 2999, color: 'text-blue-600' },
  { name: 'Scholar', min: 3000, max: 5999, color: 'text-purple-600' },
  { name: 'Expert', min: 6000, max: 9999, color: 'text-orange-600' },
  { name: 'Master', min: 10000, max: Infinity, color: 'text-gold-600' }
];

export function Achievements() {
  const { themeConfig } = useTheme();
  
  const totalPoints = achievements
    .filter(achievement => achievement.unlocked)
    .reduce((sum, achievement) => sum + achievement.points, 0);
  
  const currentLevel = levels.find(level => totalPoints >= level.min && totalPoints <= level.max) || levels[0];
  const nextLevel = levels[levels.indexOf(currentLevel) + 1];
  const levelProgress = nextLevel 
    ? ((totalPoints - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
    : 100;

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-4 pt-2"
      >
        <h1 className={`text-2xl font-bold ${themeConfig.text} mb-1`}>
          Achievements
        </h1>
        <p className={`${themeConfig.textSecondary} text-sm`}>
          Unlock badges and track your progress
        </p>
      </motion.div>

      {/* Level Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-4"
      >
        <div className={`${themeConfig.card} p-4 rounded-2xl shadow-sm border border-gray-100`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className={`text-lg font-bold ${currentLevel.color}`}>
                {currentLevel.name}
              </h3>
              <p className={`text-sm ${themeConfig.textSecondary}`}>
                {totalPoints.toLocaleString()} points
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-500">⭐</div>
              <p className="text-xs text-gray-500">Level {levels.indexOf(currentLevel) + 1}</p>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <motion.div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          
          {nextLevel && (
            <p className="text-xs text-gray-500 text-center">
              {nextLevel.min - totalPoints} points to {nextLevel.name}
            </p>
          )}
        </div>
      </motion.div>

      {/* Achievements Grid */}
      <div className="px-4 space-y-4">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden"
          >
            <div className={`bg-gradient-to-r ${achievement.gradient} rounded-2xl p-1 shadow-lg ${
              !achievement.unlocked ? 'opacity-60' : ''
            }`}>
              <div className="bg-white rounded-xl p-4 relative overflow-hidden">
                {/* Shimmer effect for unlocked badges */}
                {achievement.unlocked && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut"
                    }}
                  />
                )}

                <div className="flex items-center justify-between relative z-10">
                  {/* Left side - Text content */}
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-800">
                        {achievement.title}
                      </h3>
                      {achievement.unlocked && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 + 0.5, type: "spring", stiffness: 200 }}
                        >
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </motion.div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {achievement.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-yellow-600">
                        {achievement.points} pts
                      </span>
                      <span className="text-xs text-gray-500">
                        {achievement.progress}% complete
                      </span>
                    </div>
                  </div>

                  {/* Right side - Icon */}
                  <div className="relative">
                    <motion.div
                      className={`bg-gradient-to-br ${achievement.gradient} p-4 rounded-2xl shadow-lg relative`}
                      whileHover={{ rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <achievement.icon className="w-8 h-8 text-white" />
                      
                      {/* Sparkle effects for unlocked badges */}
                      {achievement.unlocked && (
                        <>
                          <motion.div
                            className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full"
                            animate={{ 
                              scale: [0, 1, 0],
                              opacity: [0, 1, 0]
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              delay: index * 0.3
                            }}
                          />
                          <motion.div
                            className="absolute -bottom-1 -left-1 w-2 h-2 bg-white rounded-full"
                            animate={{ 
                              scale: [0, 1, 0],
                              opacity: [0, 1, 0]
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              delay: index * 0.3 + 0.5
                            }}
                          />
                        </>
                      )}
                    </motion.div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 relative z-10">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className={`h-2 bg-gradient-to-r ${achievement.gradient} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${achievement.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.2 + 0.3 }}
                    />
                  </div>
                </div>

                {/* Lock overlay for locked achievements */}
                {!achievement.unlocked && (
                  <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-xl flex items-center justify-center">
                    <div className="text-4xl opacity-30">🔒</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mx-4"
      >
        <div className={`${themeConfig.card} rounded-2xl p-4 shadow-sm border border-gray-100`}>
          <h3 className={`text-lg font-semibold ${themeConfig.text} mb-3 text-center`}>
            Achievement Stats
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring", stiffness: 200 }}
                className="text-2xl font-bold text-yellow-600 mb-1"
              >
                {achievements.filter(a => a.unlocked).length}
              </motion.div>
              <p className="text-xs text-gray-600">Unlocked</p>
            </div>
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
                className="text-2xl font-bold text-blue-600 mb-1"
              >
                {totalPoints.toLocaleString()}
              </motion.div>
              <p className="text-xs text-gray-600">Total Points</p>
            </div>
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
                className="text-2xl font-bold text-green-600 mb-1"
              >
                {Math.round(achievements.reduce((sum, a) => sum + a.progress, 0) / achievements.length)}%
              </motion.div>
              <p className="text-xs text-gray-600">Avg Progress</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mx-4"
      >
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 text-white text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-3xl mb-2"
          >
            🎯
          </motion.div>
          <h3 className="font-bold text-lg mb-1">Keep Going!</h3>
          <p className="text-sm opacity-90">
            You're doing amazing! Complete more tasks to unlock new badges.
          </p>
        </div>
      </motion.div>
    </div>
  );
}