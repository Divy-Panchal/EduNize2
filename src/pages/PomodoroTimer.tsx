import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, BookOpen, VolumeX, TrendingUp, Target, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import alarmSound from '../../public/alarm.mp3';

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

const STORAGE_KEYS = {
  DURATIONS: 'pomodoroDurations',
  SESSIONS: 'pomodoroSessions',
  TOTAL_MINUTES: 'pomodoroTotalMinutes',
  ANALYTICS: 'pomodoroAnalytics'
};

interface DailyStats {
  date: string; // YYYY-MM-DD format
  studyMinutes: number;
  breakMinutes: number;
}

const DEFAULT_DURATIONS = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
const MAX_MINUTES = 60;
const MAX_SECONDS = 60 * 60;

export function PomodoroTimer() {
  const { themeConfig, theme } = useTheme();

  const [durations, setDurations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DURATIONS);
      if (!saved) return DEFAULT_DURATIONS;

      const parsed = JSON.parse(saved);

      // Validate that parsed data has valid integer values (not 0, negative, or decimals)
      const isValid =
        parsed.work &&
        parsed.short &&
        parsed.long &&
        Number.isInteger(parsed.work) &&
        Number.isInteger(parsed.short) &&
        Number.isInteger(parsed.long) &&
        parsed.work >= 60 && // At least 1 minute
        parsed.short >= 60 &&
        parsed.long >= 60 &&
        parsed.work <= MAX_SECONDS &&
        parsed.short <= MAX_SECONDS &&
        parsed.long <= MAX_SECONDS;

      if (isValid) {
        return parsed;
      }

      // Clear corrupted data and return defaults
      if (import.meta.env.DEV) {
        console.log('Clearing corrupted Pomodoro data:', parsed);
      }
      localStorage.removeItem(STORAGE_KEYS.DURATIONS);
      return DEFAULT_DURATIONS;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error parsing Pomodoro durations:', error);
      }
      localStorage.removeItem(STORAGE_KEYS.DURATIONS);
      return DEFAULT_DURATIONS;
    }
  });

  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work');
  const [timeLeft, setTimeLeft] = useState(() => durations['work']);
  const [isActive, setIsActive] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);

  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return saved ? parseInt(saved, 10) : 0;
  });

  const [totalMinutes, setTotalMinutes] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TOTAL_MINUTES);
    return saved ? parseInt(saved, 10) : 0;
  });

  const [analyticsData, setAnalyticsData] = useState<DailyStats[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
    return saved ? JSON.parse(saved) : [];
  });

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Helper function to update analytics data
  const updateAnalytics = (isStudy: boolean, minutes: number) => {
    console.log('📊 updateAnalytics called:', { isStudy, minutes });
    const today = getTodayDate();
    setAnalyticsData(prev => {
      const existing = prev.find(d => d.date === today);
      let updated: DailyStats[];

      if (existing) {
        updated = prev.map(d =>
          d.date === today
            ? { ...d, studyMinutes: d.studyMinutes + (isStudy ? minutes : 0), breakMinutes: d.breakMinutes + (isStudy ? 0 : minutes) }
            : d
        );
      } else {
        updated = [...prev, {
          date: today,
          studyMinutes: isStudy ? minutes : 0,
          breakMinutes: isStudy ? 0 : minutes
        }];
      }

      // Keep only last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const filtered = updated.filter(d => new Date(d.date) >= sevenDaysAgo);

      console.log('📊 Updated analytics:', filtered);
      return filtered;
    });
  };

  const circleRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [radius, setRadius] = useState(140);
  const isDragging = useRef(false);
  const alarmRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    alarmRef.current = new Audio(alarmSound);
    alarmRef.current.loop = true;
    alarmRef.current.addEventListener('error', () => {
      if (import.meta.env.DEV) {
        console.warn('Alarm audio file not found, using Web Audio API fallback');
      }
    });
  }, []);

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

  // Persist data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DURATIONS, JSON.stringify(durations));
    } catch (error) {
      console.error('Failed to save Pomodoro durations:', error);
      if (error instanceof DOMException && (
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      )) {
        alert('Storage quota exceeded. Unable to save timer settings.');
      }
    }
  }, [durations]);

  // Sync timeLeft with durations when component mounts or mode changes
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(durations[mode]);
    }
  }, [durations, mode, isActive]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, sessions.toString());
    } catch (error) {
      console.error('Failed to save Pomodoro sessions:', error);
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TOTAL_MINUTES, totalMinutes.toString());
    } catch (error) {
      console.error('Failed to save Pomodoro total minutes:', error);
    }
  }, [totalMinutes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analyticsData));
  }, [analyticsData]);

  const playAlarm = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      const createBellTone = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const vibrato = audioContext.createOscillator();
        const vibratoGain = audioContext.createGain();

        vibrato.frequency.value = 5;
        vibratoGain.gain.value = 2;

        vibrato.connect(vibratoGain);
        vibratoGain.connect(oscillator.frequency);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;

        const now = audioContext.currentTime + startTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.5, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

        oscillator.start(now);
        vibrato.start(now);
        oscillator.stop(now + duration);
        vibrato.stop(now + duration);
      };

      // Create pleasant bell chord (C major)
      createBellTone(523.25, 0, 2.0);
      createBellTone(659.25, 0, 1.8);
      createBellTone(783.99, 0, 1.6);
      createBellTone(1046.50, 0, 1.2);

      setTimeout(() => {
        createBellTone(523.25, 0, 1.5);
        createBellTone(659.25, 0, 1.3);
        createBellTone(783.99, 0, 1.1);
      }, 800);

      setIsAlarmPlaying(true);
      setTimeout(() => setIsAlarmPlaying(false), 3000);
    } catch (error) {
      console.error('Error creating bell chime sound:', error);
      alarmRef.current?.play().catch(e => console.warn('Alarm playback failed:', e));
    }
  }, []);

  const stopAlarm = useCallback(() => {
    if (alarmRef.current) {
      alarmRef.current.pause();
      alarmRef.current.currentTime = 0;
    }
    setIsAlarmPlaying(false);
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

  // Timer countdown logic
  useEffect(() => {
    if (!isActive || timeLeft === 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev: number) => prev - 1);
      if (mode === 'work') {
        setTotalMinutes(prev => prev + 1 / 60);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  // Handle timer completion
  useEffect(() => {
    if (!isActive || timeLeft > 0) return;

    playAlarm();

    if (mode === 'work') {
      // Record completed work session
      const completedMinutes = durations.work / 60;
      console.log('🎯 Work session completed:', completedMinutes, 'minutes');
      updateAnalytics(true, completedMinutes);
      const newSessions = sessions + 1;
      setSessions(newSessions);
      switchMode(newSessions % 4 === 0 ? 'long' : 'short', true);
    } else {
      // Record completed break session (short or long)
      const completedMinutes = mode === 'short' ? durations.short / 60 : durations.long / 60;
      console.log(`☕ ${mode} break completed:`, completedMinutes, 'minutes');
      console.log('Current mode:', mode);
      console.log('Durations:', durations);
      updateAnalytics(false, completedMinutes);
      switchMode('work', true);
    }
  }, [isActive, timeLeft, mode, sessions, switchMode, playAlarm, durations, updateAnalytics]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    if (isActive) stopAlarm();
  };

  const resetTimer = () => {
    stopAlarm();
    setIsActive(false);
    setTimeLeft(durations[mode]);
  };

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
  }, [isActive, radius, controls]);

  const onPanStart = useCallback(() => {
    if (isActive) return;
    stopAlarm();
    isDragging.current = true;
    controls.stop();
  }, [isActive, stopAlarm, controls]);

  const onPanEnd = useCallback(() => {
    if (isActive) return;
    isDragging.current = false;
    setDurations((prev: any) => ({ ...prev, [mode]: timeLeft }));
  }, [isActive, mode, timeLeft]);

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

  // Bar Chart Component
  const BarChart = () => {
    // Get last 7 days starting from Monday
    const getLast7Days = () => {
      const days = [];
      const today = new Date();
      const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Calculate days since Monday (0 = Monday, 6 = Sunday)
      const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;

      // Start from this week's Monday
      const monday = new Date(today);
      monday.setDate(today.getDate() - daysSinceMonday);

      // Get 7 days starting from Monday
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        days.push(date.toISOString().split('T')[0]);
      }
      return days;
    };

    const last7Days = getLast7Days();
    const chartData = last7Days.map(date => {
      const data = analyticsData.find(d => d.date === date);
      return {
        date,
        studyMinutes: data?.studyMinutes || 0,
        breakMinutes: data?.breakMinutes || 0
      };
    });

    const maxValue = Math.max(...chartData.map(d => d.studyMinutes + d.breakMinutes), 60);
    const getDayLabel = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    return (
      <div className={`${themeConfig.card} p-6 rounded-2xl shadow-lg border dark:border-gray-700`}>
        <h3 className={`text-lg font-bold ${themeConfig.text} mb-6`}>📊 Weekly Study Time</h3>
        <div className="flex items-end justify-between gap-2 h-48">
          {chartData.map((day, index) => {
            const studyHeight = (day.studyMinutes / maxValue) * 100;
            const breakHeight = (day.breakMinutes / maxValue) * 100;

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col justify-end h-40 relative">
                  {/* Study time bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${studyHeight}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg relative group"
                    style={{ minHeight: day.studyMinutes > 0 ? '4px' : '0' }}
                  >
                    {day.studyMinutes > 0 && (
                      <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 text-white px-2 py-1 rounded whitespace-nowrap">
                        {Math.round(day.studyMinutes)}m
                      </span>
                    )}
                  </motion.div>
                  {/* Break time bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${breakHeight}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.05 }}
                    className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-b-lg relative group"
                    style={{ minHeight: day.breakMinutes > 0 ? '4px' : '0' }}
                  >
                    {day.breakMinutes > 0 && (
                      <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity bg-green-500 text-white px-2 py-1 rounded whitespace-nowrap">
                        {Math.round(day.breakMinutes)}m
                      </span>
                    )}
                  </motion.div>
                </div>
                <span className={`text-xs font-medium ${themeConfig.textSecondary}`}>
                  {getDayLabel(day.date)}
                </span>
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-400 rounded"></div>
            <span className={`text-xs ${themeConfig.textSecondary}`}>Study Time</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-green-400 rounded"></div>
            <span className={`text-xs ${themeConfig.textSecondary}`}>Break Time</span>
          </div>
        </div>
      </div>
    );
  };

  // Donut Chart Component
  const DonutChart = () => {
    const totalStudy = analyticsData.reduce((sum, d) => sum + d.studyMinutes, 0);
    const totalBreak = analyticsData.reduce((sum, d) => sum + d.breakMinutes, 0);
    const total = totalStudy + totalBreak;

    const studyPercentage = total > 0 ? (totalStudy / total) * 100 : 0;
    const breakPercentage = total > 0 ? (totalBreak / total) * 100 : 0;

    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const studyDashoffset = circumference - (studyPercentage / 100) * circumference;
    const breakDashoffset = circumference - (breakPercentage / 100) * circumference;

    return (
      <div className={`${themeConfig.card} p-6 rounded-2xl shadow-lg border dark:border-gray-700`}>
        <h3 className={`text-lg font-bold ${themeConfig.text} mb-6`}>⏱️ Time Distribution</h3>
        <div className="flex flex-col items-center">
          {/* Donut Chart */}
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth="20"
                className="text-gray-200 dark:text-gray-700"
              />
              {/* Study time arc */}
              <motion.circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="url(#studyGradient)"
                strokeWidth="20"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: studyDashoffset }}
                transition={{ duration: 1, ease: "easeOut" }}
                strokeLinecap="round"
              />
              {/* Break time arc */}
              <motion.circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="url(#breakGradient)"
                strokeWidth="20"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{
                  strokeDashoffset: breakDashoffset,
                  strokeDasharray: circumference,
                  transform: `rotate(${(studyPercentage / 100) * 360}deg)`
                }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                strokeLinecap="round"
                style={{ transformOrigin: '80px 80px' }}
              />
              {/* Gradients */}
              <defs>
                <linearGradient id="studyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
                <linearGradient id="breakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className={`text-3xl font-bold ${themeConfig.text}`}>
                {Math.round(total)}
              </p>
              <p className={`text-xs ${themeConfig.textSecondary}`}>minutes</p>
            </div>
          </div>

          {/* Stats */}
          <div className="w-full mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full"></div>
                <span className={`text-sm ${themeConfig.textSecondary}`}>Study Time</span>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${themeConfig.text}`}>{Math.round(totalStudy)}m</p>
                <p className={`text-xs ${themeConfig.textSecondary}`}>{Math.round(studyPercentage)}%</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-green-400 rounded-full"></div>
                <span className={`text-sm ${themeConfig.textSecondary}`}>Break Time</span>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${themeConfig.text}`}>{Math.round(totalBreak)}m</p>
                <p className={`text-xs ${themeConfig.textSecondary}`}>{Math.round(breakPercentage)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
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

      {/* Analytics Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <BarChart />
        <DonutChart />
      </motion.div>
    </div>
  );
}
