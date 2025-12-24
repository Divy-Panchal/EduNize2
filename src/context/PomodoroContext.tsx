import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useDailyStats } from './DailyStatsContext';
import toast from 'react-hot-toast';

export type PomodoroMode = 'work' | 'short' | 'long';

interface PomodoroDurations {
    work: number;
    short: number;
    long: number;
}

interface PomodoroContextType {
    // Timer state
    mode: PomodoroMode;
    timeLeft: number;
    isActive: boolean;
    isAlarmPlaying: boolean;

    // Session tracking
    sessions: number;
    totalMinutes: number;

    // Durations
    durations: PomodoroDurations;

    // Control functions
    toggleTimer: () => void;
    resetTimer: () => void;
    switchMode: (newMode: PomodoroMode, showToast?: boolean) => void;
    setTimeLeft: (time: number) => void;
    setDurations: (durations: PomodoroDurations) => void;
    stopAlarm: () => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

const STORAGE_KEYS = {
    DURATIONS: 'pomodoroDurations',
    SESSIONS: 'pomodoroSessions',
    TOTAL_MINUTES: 'pomodoroTotalMinutes'
};

const DEFAULT_DURATIONS = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
const MAX_SECONDS = 60 * 60;

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
    useAuth();
    const { addStudyTime, incrementFocusSession } = useDailyStats();
    const alarmRef = useRef<HTMLAudioElement | null>(null);

    // Load durations from localStorage
    const [durations, setDurations] = useState<PomodoroDurations>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.DURATIONS);
            if (!saved) return DEFAULT_DURATIONS;

            const parsed = JSON.parse(saved);

            const isValid =
                parsed.work &&
                parsed.short &&
                parsed.long &&
                Number.isInteger(parsed.work) &&
                Number.isInteger(parsed.short) &&
                Number.isInteger(parsed.long) &&
                parsed.work >= 60 &&
                parsed.short >= 60 &&
                parsed.long >= 60 &&
                parsed.work <= MAX_SECONDS &&
                parsed.short <= MAX_SECONDS &&
                parsed.long <= MAX_SECONDS;

            if (isValid) {
                return parsed;
            }

            localStorage.removeItem(STORAGE_KEYS.DURATIONS);
            return DEFAULT_DURATIONS;
        } catch (error) {
            localStorage.removeItem(STORAGE_KEYS.DURATIONS);
            return DEFAULT_DURATIONS;
        }
    });

    const [mode, setMode] = useState<PomodoroMode>('work');
    const [timeLeft, setTimeLeft] = useState(() => durations.work);
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

    // Persist durations to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEYS.DURATIONS, JSON.stringify(durations));
        } catch (error) {
            console.error('Failed to save Pomodoro durations:', error);
        }
    }, [durations]);

    // Sync timeLeft with durations when mode changes (only if not active)
    useEffect(() => {
        if (!isActive) {
            setTimeLeft(durations[mode]);
        }
    }, [durations, mode, isActive]);

    // Persist sessions
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEYS.SESSIONS, sessions.toString());
        } catch (error) {
            console.error('Failed to save Pomodoro sessions:', error);
        }
    }, [sessions]);

    // Persist total minutes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEYS.TOTAL_MINUTES, totalMinutes.toString());
        } catch (error) {
            console.error('Failed to save Pomodoro total minutes:', error);
        }
    }, [totalMinutes]);

    // Play alarm sound
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

            // Create pleasant bell chord
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
        }
    }, []);

    const stopAlarm = useCallback(() => {
        if (alarmRef.current) {
            alarmRef.current.pause();
            alarmRef.current.currentTime = 0;
        }
        setIsAlarmPlaying(false);
    }, []);

    const switchMode = useCallback((newMode: PomodoroMode, showToast = false) => {
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
            setTimeLeft((prev) => prev - 1);
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
            const newSessions = sessions + 1;
            setSessions(newSessions);

            // Add study time to daily stats
            const studyMinutes = Math.floor(durations.work / 60);
            addStudyTime(studyMinutes);

            // Increment focus session count
            incrementFocusSession();

            switchMode(newSessions % 4 === 0 ? 'long' : 'short', true);
        } else {
            switchMode('work', true);
        }
    }, [isActive, timeLeft, mode, sessions, switchMode, playAlarm, durations.work, addStudyTime, incrementFocusSession]);

    const toggleTimer = () => {
        setIsActive(!isActive);
        if (isActive) stopAlarm();
    };

    const resetTimer = () => {
        stopAlarm();
        setIsActive(false);
        setTimeLeft(durations[mode]);
    };

    return (
        <PomodoroContext.Provider
            value={{
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
            }}
        >
            {children}
        </PomodoroContext.Provider>
    );
}

export function usePomodoro() {
    const context = useContext(PomodoroContext);
    if (!context) {
        throw new Error('usePomodoro must be used within PomodoroProvider');
    }
    return context;
}
