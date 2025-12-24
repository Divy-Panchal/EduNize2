import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface DailyStats {
    date: string; // YYYY-MM-DD format
    studyMinutes: number; // Total minutes studied today
    focusSessions: number; // Number of completed Pomodoro sessions
}

interface DailyStatsContextType {
    studyMinutes: number;
    focusSessions: number;
    addStudyTime: (minutes: number) => void;
    incrementFocusSession: () => void;
    getStudyHours: () => string;
}

const DailyStatsContext = createContext<DailyStatsContextType | undefined>(undefined);

export function DailyStatsProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [dailyStats, setDailyStats] = useState<DailyStats>({
        date: getTodayDate(),
        studyMinutes: 0,
        focusSessions: 0,
    });

    // Get today's date in YYYY-MM-DD format (local timezone)
    // Note: Uses local timezone for daily reset. If user travels across timezones,
    // the reset will happen at midnight in their current timezone.
    function getTodayDate(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Load stats from localStorage on mount
    useEffect(() => {
        if (user) {
            const storageKey = `dailyStats_${user.uid}`;
            const savedStats = localStorage.getItem(storageKey);

            if (savedStats) {
                try {
                    const parsed: DailyStats = JSON.parse(savedStats);
                    const today = getTodayDate();

                    // Check if the saved date is today
                    if (parsed.date === today) {
                        // Same day, use saved stats
                        setDailyStats(parsed);
                    } else {
                        // New day, reset stats
                        const newStats: DailyStats = {
                            date: today,
                            studyMinutes: 0,
                            focusSessions: 0,
                        };
                        setDailyStats(newStats);
                        localStorage.setItem(storageKey, JSON.stringify(newStats));
                    }
                } catch (error) {
                    console.error('Failed to parse daily stats:', error);
                    resetStats();
                }
            } else {
                // No saved stats, initialize
                resetStats();
            }
        }
    }, [user]);

    // Save stats to localStorage whenever they change
    useEffect(() => {
        if (user) {
            const storageKey = `dailyStats_${user.uid}`;
            localStorage.setItem(storageKey, JSON.stringify(dailyStats));
        }
    }, [dailyStats, user]);

    // Check for date change every minute
    useEffect(() => {
        const interval = setInterval(() => {
            const today = getTodayDate();
            if (dailyStats.date !== today) {
                // Date changed, reset stats
                resetStats();
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [dailyStats.date]);

    const resetStats = () => {
        const newStats: DailyStats = {
            date: getTodayDate(),
            studyMinutes: 0,
            focusSessions: 0,
        };
        setDailyStats(newStats);
    };

    const addStudyTime = (minutes: number) => {
        setDailyStats(prev => ({
            ...prev,
            studyMinutes: prev.studyMinutes + minutes,
        }));
    };

    const incrementFocusSession = () => {
        setDailyStats(prev => ({
            ...prev,
            focusSessions: prev.focusSessions + 1,
        }));
    };

    const getStudyHours = (): string => {
        const hours = Math.floor(dailyStats.studyMinutes / 60);
        const minutes = dailyStats.studyMinutes % 60;

        if (hours === 0 && minutes === 0) {
            return '0h';
        } else if (hours === 0) {
            return `${minutes}m`;
        } else if (minutes === 0) {
            return `${hours}h`;
        } else {
            return `${hours}h ${minutes}m`;
        }
    };

    return (
        <DailyStatsContext.Provider
            value={{
                studyMinutes: dailyStats.studyMinutes,
                focusSessions: dailyStats.focusSessions,
                addStudyTime,
                incrementFocusSession,
                getStudyHours,
            }}
        >
            {children}
        </DailyStatsContext.Provider>
    );
}

export function useDailyStats() {
    const context = useContext(DailyStatsContext);
    if (!context) {
        throw new Error('useDailyStats must be used within DailyStatsProvider');
    }
    return context;
}
