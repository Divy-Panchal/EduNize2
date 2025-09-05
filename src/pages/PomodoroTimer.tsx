import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, BookOpen, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export function PomodoroTimer() {
  const { themeConfig } = useTheme();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [sessions, setSessions] = useState(0);

  const workTime = 25 * 60;
  const breakTime = 5 * 60;
  const longBreakTime = 15 * 60;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (mode === 'work') {
        setSessions(prev => prev + 1);
        const newSessions = sessions + 1;
        if (newSessions % 4 === 0) {
          setTimeLeft(longBreakTime);
          toast.success('Great work! Time for a long break!');
        } else {
          setTimeLeft(breakTime);
          toast.success('Work session complete! Take a short break.');
        }
        setMode('break');
      } else {
        setTimeLeft(workTime);
        setMode('work');
        toast.success('Break over! Ready for another work session?');
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, sessions]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = mode === 'work' 
    ? ((workTime - timeLeft) / workTime) * 100 
    : ((breakTime - timeLeft) / breakTime) * 100;

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? workTime : breakTime);
  };

  const switchMode = (newMode: 'work' | 'break') => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(newMode === 'work' ? workTime : breakTime);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className={`text-2xl md:text-3xl font-bold ${themeConfig.text} mb-2`}>Pomodoro Timer</h1>
        <p className={themeConfig.textSecondary}>
          Stay focused with the Pomodoro Technique
        </p>
      </motion.div>

      {/* Timer Circle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center"
      >
        <div className="relative w-64 md:w-80 h-64 md:h-80">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-gray-200"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className={mode === 'work' ? 'text-blue-500' : 'text-green-500'}
              initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - progress / 100) }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              key={`${minutes}-${seconds}`}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className={`text-4xl md:text-6xl font-bold ${themeConfig.text} mb-2`}
            >
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </motion.div>
            <div className="flex items-center gap-2">
              {mode === 'work' ? (
                <BookOpen className="w-5 h-5 text-blue-500" />
              ) : (
                <Coffee className="w-5 h-5 text-green-500" />
              )}
              <span className={`text-xs md:text-sm font-medium ${themeConfig.textSecondary} uppercase tracking-wide`}>
                {mode === 'work' ? 'Work Time' : 'Break Time'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTimer}
          className={`${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white p-3 md:p-4 rounded-full shadow-lg`}
        >
          {isActive ? <Pause className="w-6 md:w-8 h-6 md:h-8" /> : <Play className="w-6 md:w-8 h-6 md:h-8" />}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetTimer}
          className="bg-gray-500 hover:bg-gray-600 text-white p-3 md:p-4 rounded-full shadow-lg"
        >
          <RotateCcw className="w-6 md:w-8 h-6 md:h-8" />
        </motion.button>
      </motion.div>

      {/* Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center"
      >
        <div className={`${themeConfig.card} p-2 rounded-xl shadow-sm border border-gray-100 flex`}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => switchMode('work')}
            className={`px-4 md:px-6 py-2 rounded-lg font-medium transition-all duration-200 text-sm md:text-base ${
              mode === 'work' 
                ? `${themeConfig.primary} text-white` 
                : `${themeConfig.text} hover:bg-gray-100`
            }`}
          >
            Work
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => switchMode('break')}
            className={`px-4 md:px-6 py-2 rounded-lg font-medium transition-all duration-200 text-sm md:text-base ${
              mode === 'break' 
                ? `${themeConfig.primary} text-white` 
                : `${themeConfig.text} hover:bg-gray-100`
            }`}
          >
            Break
          </motion.button>
        </div>
      </motion.div>

      {/* Session Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border border-gray-100`}
      >
        <h3 className={`text-base md:text-lg font-semibold ${themeConfig.text} mb-4`}>Today's Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
              className={`text-2xl md:text-3xl font-bold ${themeConfig.primary.replace('bg-', 'text-')} mb-2`}
            >
              {sessions}
            </motion.div>
            <p className={`text-xs md:text-sm ${themeConfig.textSecondary}`}>Sessions Completed</p>
          </div>
          
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
              className={`text-2xl md:text-3xl font-bold ${themeConfig.secondary.replace('bg-', 'text-')} mb-2`}
            >
              {Math.floor(sessions * 25 / 60)}h {(sessions * 25) % 60}m
            </motion.div>
            <p className={`text-xs md:text-sm ${themeConfig.textSecondary}`}>Study Time</p>
          </div>
          
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
              className={`text-2xl md:text-3xl font-bold ${themeConfig.accent.replace('bg-', 'text-')} mb-2`}
            >
              92%
            </motion.div>
            <p className={`text-xs md:text-sm ${themeConfig.textSecondary}`}>Focus Rate</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}