import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const AnimatedDigit = ({ digit }: { digit: number }) => {
  const digitHeight = 80;
  return (
    <div style={{ height: `${digitHeight}px`, overflow: 'hidden', textAlign: 'center' }}>
      <motion.div
        animate={{ y: -digit * digitHeight }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex flex-col items-center justify-start"
      >
        {[...Array(10).keys()].map(i => (
          <span
            key={i}
            className="text-6xl md:text-7xl font-light tracking-tighter tabular-nums"
            style={{ height: `${digitHeight}px`, lineHeight: `${digitHeight}px` }}
          >
            {i}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export function PomodoroTimer() {
  const { themeConfig } = useTheme();

  const [durations, setDurations] = useState(() => {
    try {
      const savedDurations = localStorage.getItem('pomodoroDurations');
      return savedDurations ? JSON.parse(savedDurations) : { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
    } catch (e) {
      return { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
    }
  });

  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work');
  const [timeLeft, setTimeLeft] = useState(durations[mode]);
  const [isActive, setIsActive] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  
  const [sessions, setSessions] = useState(() => {
    const savedSessions = localStorage.getItem('pomodoroSessions');
    return savedSessions ? parseInt(savedSessions, 10) : 0;
  });

  const circleRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [radius, setRadius] = useState(140);
  const isDragging = useRef(false);
  const alarmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    alarmRef.current = new Audio('/alarm.mp3');
    alarmRef.current.loop = true;
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (circleRef.current) {
        const circleWidth = circleRef.current.offsetWidth;
        setRadius(circleWidth / 2 - 16);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('pomodoroDurations', JSON.stringify(durations));
  }, [durations]);

  useEffect(() => {
    localStorage.setItem('pomodoroSessions', sessions.toString());
  }, [sessions]);

  const playAlarm = () => {
    if (alarmRef.current) {
        alarmRef.current.play().catch(e => console.error("Error playing alarm:", e));
        setIsAlarmPlaying(true);
    }
  };

  const stopAlarm = useCallback(() => {
    if (alarmRef.current) {
      alarmRef.current.pause();
      alarmRef.current.currentTime = 0;
      setIsAlarmPlaying(false);
    }
  }, []);

  const switchMode = useCallback((newMode: 'work' | 'short' | 'long', showToast = false) => {
    stopAlarm();
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(durations[newMode]);
    if (showToast) {
      const messages = {
        work: 'Break over! Ready for another work session?',
        short: 'Work session complete! Take a short break.',
        long: 'Great work! Time for a long break!',
      };
      toast.success(messages[newMode]);
    }
  }, [durations, stopAlarm]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      playAlarm();
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

  const toggleTimer = () => {
    setIsActive(!isActive);
    if(isActive) stopAlarm();
  };

  const resetTimer = () => {
    stopAlarm();
    setIsActive(false);
    setTimeLeft(durations[mode]);
  }

  const handlePan = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isActive || !circleRef.current) return;

    const circle = circleRef.current.getBoundingClientRect();
    const centerX = circle.left + circle.width / 2;
    const centerY = circle.top + circle.height / 2;
    
    const angle = Math.atan2(info.point.y - centerY, info.point.x - centerX);
    const normalizedAngle = (angle * (180 / Math.PI) + 450) % 360;

    const maxMinutes = mode === 'work' ? 90 : (mode === 'short' ? 15 : 30);
    const newMinutes = Math.round((normalizedAngle / 360) * maxMinutes);
    const newTime = newMinutes * 60;
    
    setTimeLeft(newTime);
    
    const dotAngle = (normalizedAngle - 90) * (Math.PI / 180);
    controls.set({ x: radius * Math.cos(dotAngle), y: radius * Math.sin(dotAngle) });
  };

  const onPanStart = () => {
    if(isActive) return;
    stopAlarm();
    isDragging.current = true;
    controls.stop();
  };
  
  const onPanEnd = () => {
    if(isActive) return;
    isDragging.current = false;
    setDurations(prev => ({ ...prev, [mode]: timeLeft }));
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalDuration = durations[mode];
  const progress = totalDuration > 0 ? timeLeft / totalDuration : 0;

  const minutesStr = String(minutes).padStart(2, '0');
  const secondsStr = String(seconds).padStart(2, '0');
  
  useEffect(() => {
    if (!isDragging.current) {
      const angle = (progress * 360 - 90) * (Math.PI / 180);
      controls.start({
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
        transition: { type: 'spring', stiffness: 300, damping: 30 }
      });
    }
  }, [progress, radius, controls, isActive, timeLeft]);

  return (
    <div className="space-y-8 flex flex-col items-center">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className={`text-3xl font-bold ${themeConfig.text}`}>Pomodoro Timer</h1>
        <p className={themeConfig.textSecondary}>{isActive ? 'Focus...' : isAlarmPlaying ? "Time's up!" : 'Drag the dot to set time'}</p>
      </motion.div>

      <motion.div
        ref={circleRef}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center select-none mx-auto"
        style={{ touchAction: 'none' }}
        onPanStart={onPanStart}
        onPan={handlePan}
        onPanEnd={onPanEnd}
      >
        <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" fill="transparent" className="text-gray-200 dark:text-gray-700" />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${(2 * Math.PI * 45) * (1 - progress)}`}
            className={isAlarmPlaying ? "text-red-500" : "text-green-500"}
            transition={{ duration: 0.1 }}
          />
        </svg>
        
        <motion.div
            className="absolute z-10 w-8 h-8 pointer-events-none"
            animate={controls}
            style={{ cursor: isActive ? 'default' : 'grab' }}
            whileTap={{ cursor: 'grabbing' }}
        >
          <div
            className={`w-full h-full bg-white dark:bg-gray-700 rounded-full border-4 ${isAlarmPlaying ? 'border-red-500' : 'border-green-500'}`}
            style={{ boxShadow: `0 0 20px 5px ${isAlarmPlaying ? 'rgba(239, 68, 68, 0.7)' : 'rgba(52, 211, 153, 0.7)'}` }}
          />
        </motion.div>

        <div className="absolute flex flex-col items-center justify-center z-0">
          {isAlarmPlaying ? (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={stopAlarm} className="bg-red-500 text-white p-4 rounded-full shadow-lg">
                <VolumeX size={48} />
            </motion.button>
          ) : (
            <div className={`flex items-baseline ${themeConfig.text}`}>
              <AnimatedDigit digit={parseInt(minutesStr[0])} />
              <AnimatedDigit digit={parseInt(minutesStr[1])} />
              <span className="text-6xl md:text-7xl font-light tracking-tighter">:</span>
              <AnimatedDigit digit={parseInt(secondsStr[0])} />
              <AnimatedDigit digit={parseInt(secondsStr[1])} />
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            {mode === 'work' ? <BookOpen className="w-5 h-5 text-green-500" /> : <Coffee className="w-5 h-5 text-green-500" />}
            <span className={`text-sm font-medium ${themeConfig.textSecondary} uppercase tracking-wider`}>
              {mode.replace('_', ' ')}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex justify-center gap-4">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleTimer} className={`${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white p-4 rounded-full shadow-lg`}>{isActive ? <Pause size={28} /> : <Play size={28} />}</motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={resetTimer} className="bg-gray-500 hover:bg-gray-600 text-white p-4 rounded-full shadow-lg"><RotateCcw size={28} /></motion.button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex justify-center">
        <div className={`${themeConfig.card} p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex`}>
          <motion.button onClick={() => switchMode('work')} className={`px-6 py-2 rounded-lg font-medium transition-colors ${mode === 'work' ? `bg-green-500 text-white` : `${themeConfig.text} hover:bg-gray-200 dark:hover:bg-gray-700`}`}>
            Work
          </motion.button>
          <motion.button onClick={() => switchMode('short')} className={`px-6 py-2 rounded-lg font-medium transition-colors ${mode === 'short' ? `bg-green-500 text-white` : `${themeConfig.text} hover:bg-gray-200 dark:hover:bg-gray-700`}`}>
            Short Break
          </motion.button>
          <motion.button onClick={() => switchMode('long')} className={`px-6 py-2 rounded-lg font-medium transition-colors ${mode === 'long' ? `bg-green-500 text-white` : `${themeConfig.text} hover:bg-gray-200 dark:hover:bg-gray-700`}`}>
            Long Break
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
