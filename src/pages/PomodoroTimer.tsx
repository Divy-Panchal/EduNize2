import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, BookOpen, VolumeX, TrendingUp, Target, Clock } from 'lucide-react';
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
            className="text-6xl md:text-8xl font-bold tracking-tight tabular-nums"
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

  const [totalMinutes, setTotalMinutes] = useState(() => {
    const saved = localStorage.getItem('pomodoroTotalMinutes');
    return saved ? parseInt(saved, 10) : 0;
  });

  const circleRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [radius, setRadius] = useState(140);
  const isDragging = useRef(false);
  const alarmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    alarmRef.current = new Audio('/alarm.mp3');
    alarmRef.current.loop = true;

    // Handle missing audio file
    alarmRef.current.addEventListener('error', () => {
      if (import.meta.env.DEV) {
        console.warn('Alarm audio file not found, will use Web Audio API fallback');
      }
    });
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

  useEffect(() => {
    localStorage.setItem('pomodoroTotalMinutes', totalMinutes.toString());
  }, [totalMinutes]);

  const playAlarm = () => {
    if (alarmRef.current) {
      alarmRef.current.play().catch(e => {
        if (import.meta.env.DEV) {
          console.warn("Error playing alarm audio, using fallback beep:", e);
        }
        // Fallback: Use Web Audio API to create a beep sound
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = 800; // 800 Hz beep
          oscillator.type = 'sine';

          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);

          // Repeat beep 3 times
          setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.frequency.value = 800;
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            osc2.start();
            osc2.stop(audioContext.currentTime + 0.5);
          }, 600);
        } catch (audioError) {
          if (import.meta.env.DEV) {
            console.error("Web Audio API fallback failed:", audioError);
          }
        }
      });
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
        work: '🎯 Break over! Ready for another work session?',
        short: '☕ Work session complete! Take a short break.',
        long: '🎉 Great work! Time for a long break!',
      };
      toast.success(messages[newMode]);
    }
  }, [durations, stopAlarm]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        if (mode === 'work') {
          setTotalMinutes(prev => prev + 1 / 60);
        }
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
    if (isActive) stopAlarm();
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

    // Calculate angle from cursor position
    const angle = Math.atan2(info.point.y - centerY, info.point.x - centerX);

    // Convert to degrees (0° = right, 90° = bottom, -90° = top)
    let degrees = angle * (180 / Math.PI);

    // Normalize to 0-360 starting from top (clockwise)
    // Top = 0°, Right = 90°, Bottom = 180°, Left = 270°
    let normalizedDegrees = (degrees + 90) % 360;
    if (normalizedDegrees < 0) normalizedDegrees += 360;

    // Calculate time based on angle (360° = 60 minutes)
    const maxMinutes = 60;
    const elapsedMinutes = (normalizedDegrees / 360) * maxMinutes;
    const newTime = Math.round((maxMinutes - elapsedMinutes) * 60); // Remaining time in seconds

    setTimeLeft(newTime);

    // Position dot at cursor angle (add 90° to match SVG rotation)
    const dotAngle = angle + (90 * Math.PI / 180);
    controls.set({
      x: radius * Math.cos(dotAngle),
      y: radius * Math.sin(dotAngle)
    });
  };

  const onPanStart = () => {
    if (isActive) return;
    stopAlarm();
    isDragging.current = true;
    controls.stop();
  };

  const onPanEnd = () => {
    if (isActive) return;
    isDragging.current = false;
    // Save the new duration when drag ends
    setDurations(prev => ({ ...prev, [mode]: timeLeft }));
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  // Use 60 minutes (3600 seconds) as base for progress calculation to match drag behavior
  const maxSeconds = 60 * 60; // 60 minutes in seconds
  // Progress based on elapsed time (0% at start, 100% when complete)
  const progress = maxSeconds > 0 ? (maxSeconds - timeLeft) / maxSeconds : 0;

  const minutesStr = String(minutes).padStart(2, '0');
  const secondsStr = String(seconds).padStart(2, '0');

  useEffect(() => {
    // Don't update position during drag - let handlePan control it
    if (isDragging.current) return;

    // Calculate angle for clockwise progress starting from top (matching SVG rotate-90)
    const angle = (progress * 360 + 90) * (Math.PI / 180);
    controls.start({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    });
  }, [progress, radius, controls, timeLeft]);

  const getModeColor = () => {
    if (isAlarmPlaying) return 'from-red-500 to-red-600';
    switch (mode) {
      case 'work': return 'from-blue-500 to-blue-600';
      case 'short': return 'from-green-500 to-green-600';
      case 'long': return 'from-purple-500 to-purple-600';
    }
  };

  const getModeRingColor = () => {
    if (isAlarmPlaying) return 'text-red-500';
    switch (mode) {
      case 'work': return 'text-blue-500';
      case 'short': return 'text-green-500';
      case 'long': return 'text-purple-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className={`text-4xl md:text-5xl font-bold ${themeConfig.text} mb-2`}>
          Pomodoro Timer
        </h1>
        <p className={`text-lg ${themeConfig.textSecondary}`}>
          {isActive ? '🎯 Stay focused!' : isAlarmPlaying ? "⏰ Time's up!" : '⏱️ Drag the dot to set your time'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Sessions Card */}
          <div className={`${themeConfig.card} p-6 rounded-2xl shadow-lg border dark:border-gray-700`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`text-sm ${themeConfig.textSecondary}`}>Completed Sessions</p>
                <p className={`text-3xl font-bold ${themeConfig.text}`}>{sessions}</p>
              </div>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                initial={{ width: 0 }}
                animate={{ width: `${(sessions % 4) * 25}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className={`text-xs ${themeConfig.textSecondary} mt-2`}>
              {4 - (sessions % 4)} sessions until long break
            </p>
          </div>

          {/* Total Time Card */}
          <div className={`${themeConfig.card} p-6 rounded-2xl shadow-lg border dark:border-gray-700`}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`text-sm ${themeConfig.textSecondary}`}>Total Focus Time</p>
                <p className={`text-3xl font-bold ${themeConfig.text}`}>
                  {Math.floor(totalMinutes)}<span className="text-lg">m</span>
                </p>
              </div>
            </div>
          </div>

          {/* Productivity Tip */}
          <div className={`${themeConfig.card} p-6 rounded-2xl shadow-lg border dark:border-gray-700 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20`}>
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1" />
              <div>
                <p className={`text-sm font-semibold ${themeConfig.text} mb-1`}>💡 Productivity Tip</p>
                <p className={`text-xs ${themeConfig.textSecondary}`}>
                  Take regular breaks to maintain focus and avoid burnout. The Pomodoro Technique helps you work smarter, not harder!
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Center Column - Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-center space-y-6"
        >
          {/* Timer Circle */}
          <motion.div
            ref={circleRef}
            className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center select-none"
            style={{ touchAction: 'none' }}
            onPanStart={onPanStart}
            onPan={handlePan}
            onPanEnd={onPanEnd}
          >
            {/* Background Circle with Gradient */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getModeColor()} opacity-10`} />

            {/* SVG Progress Ring */}
            <svg className="absolute w-full h-full transform rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                className="text-gray-200 dark:text-gray-700"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="3"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${(2 * Math.PI * 45) * progress}`}
                className={getModeRingColor()}
                strokeLinecap="round"
                transition={{ duration: 0.1 }}
                style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
              />
            </svg>

            {/* Draggable Dot */}
            <motion.div
              className="absolute z-10 w-10 h-10 pointer-events-none"
              animate={controls}
              style={{ cursor: isActive ? 'default' : 'grab' }}
              whileTap={{ cursor: 'grabbing' }}
            >
              <div
                className={`w-full h-full bg-white dark:bg-gray-800 rounded-full border-4 ${getModeRingColor()} shadow-xl`}
                style={{ boxShadow: `0 0 20px 5px ${isAlarmPlaying ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)'}` }}
              />
            </motion.div>

            {/* Timer Display */}
            <div className="absolute flex flex-col items-center justify-center z-0">
              {isAlarmPlaying ? (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={stopAlarm}
                  className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-full shadow-2xl"
                >
                  <VolumeX size={56} />
                </motion.button>
              ) : (
                <>
                  <div className={`flex items-baseline ${themeConfig.text}`}>
                    <AnimatedDigit digit={parseInt(minutesStr[0])} />
                    <AnimatedDigit digit={parseInt(minutesStr[1])} />
                    <span className="text-6xl md:text-8xl font-bold tracking-tight">:</span>
                    <AnimatedDigit digit={parseInt(secondsStr[0])} />
                    <AnimatedDigit digit={parseInt(secondsStr[1])} />
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    {mode === 'work' ?
                      <BookOpen className={`w-6 h-6 ${getModeRingColor()}`} /> :
                      <Coffee className={`w-6 h-6 ${getModeRingColor()}`} />
                    }
                    <span className={`text-base font-semibold ${themeConfig.text} uppercase tracking-wider`}>
                      {mode === 'work' ? 'Focus Time' : mode === 'short' ? 'Short Break' : 'Long Break'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTimer}
              className={`${isActive ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' : 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'} text-white p-5 rounded-2xl shadow-xl`}
            >
              {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetTimer}
              className="bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white p-5 rounded-2xl shadow-xl"
            >
              <RotateCcw size={32} />
            </motion.button>
          </div>
        </motion.div>

        {/* Right Column - Mode Selection */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h3 className={`text-xl font-bold ${themeConfig.text} mb-4`}>Select Mode</h3>

          {/* Work Mode */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => switchMode('work')}
            className={`w-full p-6 rounded-2xl shadow-lg border transition-all ${mode === 'work'
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600'
              : `${themeConfig.card} border-gray-200 dark:border-gray-700 hover:border-blue-500`
              }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${mode === 'work' ? 'bg-white/20' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                <BookOpen className={`w-6 h-6 ${mode === 'work' ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
              </div>
              <div className="text-left">
                <p className={`font-bold text-lg ${mode === 'work' ? 'text-white' : themeConfig.text}`}>
                  Work Session
                </p>
                <p className={`text-sm ${mode === 'work' ? 'text-white/80' : themeConfig.textSecondary}`}>
                  {durations.work / 60} minutes
                </p>
              </div>
            </div>
          </motion.button>

          {/* Short Break */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => switchMode('short')}
            className={`w-full p-6 rounded-2xl shadow-lg border transition-all ${mode === 'short'
              ? 'bg-gradient-to-br from-green-500 to-green-600 text-white border-green-600'
              : `${themeConfig.card} border-gray-200 dark:border-gray-700 hover:border-green-500`
              }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${mode === 'short' ? 'bg-white/20' : 'bg-green-100 dark:bg-green-900/30'}`}>
                <Coffee className={`w-6 h-6 ${mode === 'short' ? 'text-white' : 'text-green-600 dark:text-green-400'}`} />
              </div>
              <div className="text-left">
                <p className={`font-bold text-lg ${mode === 'short' ? 'text-white' : themeConfig.text}`}>
                  Short Break
                </p>
                <p className={`text-sm ${mode === 'short' ? 'text-white/80' : themeConfig.textSecondary}`}>
                  {durations.short / 60} minutes
                </p>
              </div>
            </div>
          </motion.button>

          {/* Long Break */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => switchMode('long')}
            className={`w-full p-6 rounded-2xl shadow-lg border transition-all ${mode === 'long'
              ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white border-purple-600'
              : `${themeConfig.card} border-gray-200 dark:border-gray-700 hover:border-purple-500`
              }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${mode === 'long' ? 'bg-white/20' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
                <Coffee className={`w-6 h-6 ${mode === 'long' ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
              </div>
              <div className="text-left">
                <p className={`font-bold text-lg ${mode === 'long' ? 'text-white' : themeConfig.text}`}>
                  Long Break
                </p>
                <p className={`text-sm ${mode === 'long' ? 'text-white/80' : themeConfig.textSecondary}`}>
                  {durations.long / 60} minutes
                </p>
              </div>
            </div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
