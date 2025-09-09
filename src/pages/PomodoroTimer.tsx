import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, BookOpen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

// AnimatedDigit remains the same as it's a great component
const AnimatedDigit = ({ value }) => (
  <div className="relative h-16 md:h-24 w-12 md:w-16 overflow-hidden flex items-center justify-center">
    <AnimatePresence initial={false}>
      <motion.span
        key={value}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        exit={{ y: "-100%", opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 flex items-center justify-center text-4xl md:text-6xl font-bold"
      >
        {String(value).padStart(2, '0')}
      </motion.span>
    </AnimatePresence>
  </div>
);

export function PomodoroTimer() {
  const { themeConfig } = useTheme();
  const [durations, setDurations] = useState({ work: 25 * 60, short: 5 * 60, long: 15 * 60 });
  const [timeLeft, setTimeLeft] = useState(durations.work);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work');
  const [sessions, setSessions] = useState(0);
  const circleRef = useRef<HTMLDivElement>(null);

  const switchMode = useCallback((newMode: 'work' | 'short' | 'long', showToast = false) => {
    setIsActive(false);
    setMode(newMode);
    const newTime = durations[newMode];
    setTimeLeft(newTime);

    if (showToast) {
      const messages = {
        work: 'Break over! Ready for another work session?',
        short: 'Work session complete! Take a short break.',
        long: 'Great work! Time for a long break!',
      };
      toast.success(messages[newMode]);
    }
  }, [durations]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      if (mode === 'work') {
        const newSessions = sessions + 1;
        setSessions(newSessions);
        if (newSessions > 0 && newSessions % 4 === 0) switchMode('long', true);
        else switchMode('short', true);
      } else {
        switchMode('work', true);
      }
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, timeLeft, mode, sessions, switchMode]);

  const handlePan = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isActive || !circleRef.current) return;

    const circle = circleRef.current.getBoundingClientRect();
    const centerX = circle.left + circle.width / 2;
    const centerY = circle.top + circle.height / 2;

    const angle = Math.atan2(info.point.y - centerY, info.point.x - centerX) * (180 / Math.PI);
    const normalizedAngle = (angle + 360 + 90) % 360; // Offset by 90 to start at the top

    // Map angle to time (e.g., 360 degrees = 60 minutes)
    const newMinutes = Math.round((normalizedAngle / 360) * 60);
    const newTime = newMinutes * 60;
    
    setTimeLeft(newTime);
    setDurations(prev => ({...prev, [mode]: newTime}));
  };
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalTime = durations[mode];
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(durations[mode]);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl md:text-3xl font-bold ${themeConfig.text} mb-2`}>Pomodoro Timer</h1>
          <p className={themeConfig.textSecondary}>{isActive ? 'Focus...' : 'Drag circle to set time'}</p>
        </div>
      </motion.div>

      <motion.div
        ref={circleRef}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center select-none touch-none mx-auto"
        onPan={handlePan}
        style={{ cursor: isActive ? 'default' : 'grab' }}
      >
        <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-gray-200 dark:text-gray-700" />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${(2 * Math.PI * 45) * (1 - progress / 100)}`}
            className={mode === 'work' ? 'text-blue-500' : 'text-green-500'}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center z-10">
          <div className={`flex items-center justify-center ${themeConfig.text}`}>
            <AnimatedDigit value={minutes} />
            <span className="text-4xl md:text-6xl font-bold pb-2">:</span>
            <AnimatedDigit value={seconds} />
          </div>
          <div className="flex items-center gap-2 mt-2">
            {mode === 'work' ? <BookOpen className="w-5 h-5 text-blue-500" /> : <Coffee className="w-5 h-5 text-green-500" />}
            <span className={`text-xs md:text-sm font-medium ${themeConfig.textSecondary} uppercase tracking-wide`}>
              {mode.replace('_', ' ')}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex justify-center gap-4">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleTimer} className={`${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white p-3 md:p-4 rounded-full shadow-lg`}>{isActive ? <Pause className="w-6 md:w-8 h-6 md:h-8" /> : <Play className="w-6 md:w-8 h-6 md:h-8" />}</motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={resetTimer} className="bg-gray-500 hover:bg-gray-600 text-white p-3 md:p-4 rounded-full shadow-lg"><RotateCcw className="w-6 md:w-8 h-6 md:h-8" /></motion.button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex justify-center">
        <div className={`${themeConfig.card} p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex`}>
          <motion.button onClick={() => switchMode('work')} className={`px-4 md:px-6 py-2 rounded-lg font-medium transition-all duration-200 text-sm md:text-base ${mode === 'work' ? `bg-blue-500 text-white` : `${themeConfig.text} hover:bg-gray-200 dark:hover:bg-gray-700`}`}>
            Work
          </motion.button>
          <motion.button onClick={() => switchMode('short')} className={`px-4 md:px-6 py-2 rounded-lg font-medium transition-all duration-200 text-sm md:text-base ${mode === 'short' ? `bg-green-500 text-white` : `${themeConfig.text} hover:bg-gray-200 dark:hover:bg-gray-700`}`}>
            Short Break
          </motion.button>
          <motion.button onClick={() => switchMode('long')} className={`px-4 md:px-6 py-2 rounded-lg font-medium transition-all duration-200 text-sm md:text-base ${mode === 'long' ? `bg-indigo-500 text-white` : `${themeConfig.text} hover:bg-gray-200 dark:hover:bg-gray-700`}`}>
            Long Break
          </motion.button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800`}>
        <h3 className={`text-base md:text-lg font-semibold ${themeConfig.text} mb-4`}>Today's Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: "spring", stiffness: 200 }} className={`text-2xl md:text-3xl font-bold text-blue-500 mb-2`}>{sessions}</motion.div>
            <p className={`text-xs md:text-sm ${themeConfig.textSecondary}`}>Sessions Completed</p>
          </div>
          <div className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7, type: "spring", stiffness: 200 }} className={`text-2xl md:text-3xl font-bold text-green-500 mb-2`}>{Math.floor((sessions * durations.work) / 60)}h {(sessions * durations.work) % 60}m</motion.div>
            <p className={`text-xs md:text-sm ${themeConfig.textSecondary}`}>Study Time</p>
          </div>
          <div className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: "spring", stiffness: 200 }} className={`text-2xl md:text-3xl font-bold text-indigo-500 mb-2`}>{sessions > 0 ? '100%' : '0%'}</motion.div>
            <p className={`text-xs md:text-sm ${themeConfig.textSecondary}`}>Focus Rate</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
