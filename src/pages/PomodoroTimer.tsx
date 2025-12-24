import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, BookOpen, VolumeX, TrendingUp, Target, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { usePomodoro } from '../context/PomodoroContext';

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

const MAX_MINUTES = 60;
const MAX_SECONDS = 60 * 60;

export function PomodoroTimer() {
  const { themeConfig, theme } = useTheme();
  const {
    mode,
    timeLeft,
    isActive,
    isAlarmPlaying,
    sessions,
    totalMinutes,
    durations,
    toggleTimer,
    resetTimer,
    switchMode,
    setTimeLeft,
    setDurations,
    stopAlarm,
  } = usePomodoro();

  const circleRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [radius, setRadius] = useState(140);
  const isDragging = useRef(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (circleRef.current) {
        setRadius(circleRef.current.offsetWidth / 2 - 16);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePan = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isActive || !circleRef.current) return;

    const circle = circleRef.current.getBoundingClientRect();
    const centerX = circle.left + circle.width / 2;
    const centerY = circle.top + circle.height / 2;

    const angle = Math.atan2(info.point.y - centerY, info.point.x - centerX) + Math.PI / 2;
    const normalizedDegrees = ((angle * (180 / Math.PI)) + 360) % 360;
    const newTime = Math.round((normalizedDegrees / 360) * MAX_MINUTES * 60);

    setTimeLeft(newTime);

    // Update dot position immediately during drag
    const progress = newTime / MAX_SECONDS;
    const dragAngle = (progress * 360 - 90) * (Math.PI / 180);
    controls.set({
      x: radius * Math.cos(dragAngle),
      y: radius * Math.sin(dragAngle)
    });
  }, [isActive, radius, controls, setTimeLeft]);

  const onPanStart = useCallback(() => {
    if (isActive) return;
    stopAlarm();
    isDragging.current = true;
    controls.stop();
  }, [isActive, stopAlarm, controls]);

  const onPanEnd = useCallback(() => {
    if (isActive) return;
    isDragging.current = false;
    setDurations({ ...durations, [mode]: timeLeft });
  }, [isActive, mode, timeLeft, durations, setDurations]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = timeLeft / MAX_SECONDS;

  const minutesStr = String(minutes).padStart(2, '0');
  const secondsStr = String(seconds).padStart(2, '0');

  // Animate dot position when not dragging
  useEffect(() => {
    if (isDragging.current) return;

    const angle = (progress * 360 - 90) * (Math.PI / 180);
    controls.start({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    });
  }, [progress, radius, controls]);

  const getModeColor = () => {
    if (isAlarmPlaying) return 'from-red-500 to-red-600';
    const colors = {
      work: 'from-blue-500 to-blue-600',
      short: 'from-green-500 to-green-600',
      long: 'from-purple-500 to-purple-600'
    };
    return colors[mode];
  };

  const getModeRingColor = () => {
    if (isAlarmPlaying) return 'text-red-500';
    const colors = {
      work: 'text-blue-500',
      short: 'text-green-500',
      long: 'text-purple-500'
    };
    return colors[mode];
  };

  const ModeButton = ({
    modeType,
    icon: Icon,
    label,
    gradientColor
  }: {
    modeType: 'work' | 'short' | 'long';
    icon: any;
    label: string;
    gradientColor: string;
  }) => {
    const getIconBg = () => {
      if (mode === modeType) return 'bg-white/20';

      if (theme === 'dark') {
        if (modeType === 'work') return 'bg-blue-900/30';
        if (modeType === 'short') return 'bg-green-900/30';
        return 'bg-purple-900/30';
      } else {
        if (modeType === 'work') return 'bg-blue-100';
        if (modeType === 'short') return 'bg-green-100';
        return 'bg-purple-100';
      }
    };

    const getIconColor = () => {
      if (mode === modeType) return 'text-white';

      if (theme === 'dark') {
        if (modeType === 'work') return 'text-blue-400';
        if (modeType === 'short') return 'text-green-400';
        return 'text-purple-400';
      } else {
        if (modeType === 'work') return 'text-blue-600';
        if (modeType === 'short') return 'text-green-600';
        return 'text-purple-600';
      }
    };

    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => switchMode(modeType)}
        className={`w-full p-6 rounded-2xl shadow-lg border transition-all ${mode === modeType
          ? `bg-gradient-to-br ${gradientColor} text-white border-${gradientColor.split('-')[1]}-600`
          : `${themeConfig.card} border-gray-200 dark:border-gray-700 hover:border-${gradientColor.split('-')[1]}-500`
          }`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${getIconBg()}`}>
            <Icon className={`w-6 h-6 ${getIconColor()}`} />
          </div>
          <div className="text-left">
            <p className={`font-bold text-lg ${mode === modeType ? 'text-white' : themeConfig.text}`}>
              {label}
            </p>
            <p className={`text-sm ${mode === modeType ? 'text-white/80' : themeConfig.textSecondary}`}>
              {durations[modeType] / 60} minutes
            </p>
          </div>
        </div>
      </motion.button>
    );
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
          <div className={`${themeConfig.card} p-6 rounded-2xl shadow-lg border dark:border-gray-700`}>
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
            {/* Background Circle */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getModeColor()} opacity-10`} />

            {/* SVG Progress Ring */}
            <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
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
                strokeDashoffset={`${(2 * Math.PI * 45) * (1 - progress)}`}
                className={getModeRingColor()}
                strokeLinecap="round"
                transition={{ duration: 0.1 }}
                style={{ filter: `drop-shadow(0 0 8px currentColor)` }}
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
                    {mode === 'work' ? (
                      <BookOpen className={`w-6 h-6 ${getModeRingColor()}`} />
                    ) : (
                      <Coffee className={`w-6 h-6 ${getModeRingColor()}`} />
                    )}
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
              className={`${isActive
                ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                : 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                } text-white p-5 rounded-2xl shadow-xl`}
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

          <ModeButton
            modeType="work"
            icon={BookOpen}
            label="Work Session"
            gradientColor="from-blue-500 to-blue-600"
          />

          <ModeButton
            modeType="short"
            icon={Coffee}
            label="Short Break"
            gradientColor="from-green-500 to-green-600"
          />

          <ModeButton
            modeType="long"
            icon={Coffee}
            label="Long Break"
            gradientColor="from-purple-500 to-purple-600"
          />
        </motion.div>
      </div>
    </div>
  );
}
