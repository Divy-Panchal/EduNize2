import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Achievement type definition
export interface Achievement {
    id: string;
    name: string;
    icon: string;
    description: string;
    unlocked: boolean;
    claimed: boolean;
    progress: number;
    maxProgress: number;
    category?: string;
    points?: number;
}

interface AchievementContextType {
    achievements: Achievement[];
    checkAchievements: () => void;
    claimAchievement: (achievementId: string) => void;
    updateAchievementProgress: (achievementId: string, progress: number) => void;
    getTotalPoints: () => number;
    getUnlockedCount: () => number;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

// Default achievements
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'early_bird',
        name: 'Early Bird',
        icon: '🌅',
        description: 'Study before 8 AM',
        unlocked: false,
        claimed: false,
        progress: 0,
        maxProgress: 1,
        category: 'time',
        points: 50
    },
    {
        id: 'night_owl',
        name: 'Night Owl',
        icon: '🦉',
        description: 'Study after 10 PM',
        unlocked: false,
        claimed: false,
        progress: 0,
        maxProgress: 1,
        category: 'time',
        points: 50
    },
    {
        id: 'streak_master',
        name: 'Streak Master',
        icon: '🔥',
        description: '7 day study streak',
        unlocked: false,
        claimed: false,
        progress: 0,
        maxProgress: 7,
        category: 'consistency',
        points: 100
    },
    {
        id: 'task_crusher',
        name: 'Task Crusher',
        icon: '✅',
        description: 'Complete 50 tasks',
        unlocked: false,
        claimed: false,
        progress: 0,
        maxProgress: 50,
        category: 'productivity',
        points: 150
    },
    {
        id: 'focus_master',
        name: 'Focus Master',
        icon: '🎯',
        description: 'Complete 100 Pomodoro sessions',
        unlocked: false,
        claimed: false,
        progress: 0,
        maxProgress: 100,
        category: 'focus',
        points: 200
    }
];

export function AchievementProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [achievements, setAchievements] = useState<Achievement[]>([]);

    // Load achievements from localStorage
    useEffect(() => {
        if (!user) {
            setAchievements([]);
            return;
        }

        const storageKey = `achievements_${user.uid}`;
        const saved = localStorage.getItem(storageKey);

        if (saved) {
            try {
                setAchievements(JSON.parse(saved));
            } catch (error) {
                console.error('Failed to parse achievements:', error);
                setAchievements(DEFAULT_ACHIEVEMENTS);
            }
        } else {
            setAchievements(DEFAULT_ACHIEVEMENTS);
        }
    }, [user]);

    // Save achievements to localStorage
    useEffect(() => {
        if (!user || achievements.length === 0) return;

        const storageKey = `achievements_${user.uid}`;
        try {
            localStorage.setItem(storageKey, JSON.stringify(achievements));
        } catch (error) {
            console.error('Failed to save achievements:', error);
        }
    }, [achievements, user]);

    // Check and update achievements based on current stats
    const checkAchievements = useCallback(() => {
        if (!user) return;

        const now = new Date();
        const hour = now.getHours();

        // Get stats from localStorage
        const completedTasks = parseInt(localStorage.getItem(`completedTasksCount_${user.uid}`) || '0');
        const studyStreak = parseInt(localStorage.getItem(`studyStreak_${user.uid}`) || '0');
        const pomodoroSessions = parseInt(localStorage.getItem('pomodoroSessions') || '0');

        setAchievements(prev => {
            const updated = [...prev];
            let hasChanges = false;

            // Early Bird - Study before 8 AM
            if (hour < 8) {
                const earlyBird = updated.find(a => a.id === 'early_bird');
                if (earlyBird && !earlyBird.unlocked) {
                    earlyBird.progress = 1;
                    earlyBird.unlocked = true;
                    hasChanges = true;
                }
            }

            // Night Owl - Study after 10 PM
            if (hour >= 22) {
                const nightOwl = updated.find(a => a.id === 'night_owl');
                if (nightOwl && !nightOwl.unlocked) {
                    nightOwl.progress = 1;
                    nightOwl.unlocked = true;
                    hasChanges = true;
                }
            }

            // Streak Master - 7 day streak
            const streakMaster = updated.find(a => a.id === 'streak_master');
            if (streakMaster) {
                const newProgress = Math.min(studyStreak, 7);
                if (streakMaster.progress !== newProgress) {
                    streakMaster.progress = newProgress;
                    hasChanges = true;
                }
                if (studyStreak >= 7 && !streakMaster.unlocked) {
                    streakMaster.unlocked = true;
                    hasChanges = true;
                }
            }

            // Task Crusher - Complete 50 tasks
            const taskCrusher = updated.find(a => a.id === 'task_crusher');
            if (taskCrusher) {
                const newProgress = Math.min(completedTasks, 50);
                if (taskCrusher.progress !== newProgress) {
                    taskCrusher.progress = newProgress;
                    hasChanges = true;
                }
                if (completedTasks >= 50 && !taskCrusher.unlocked) {
                    taskCrusher.unlocked = true;
                    hasChanges = true;
                }
            }

            // Focus Master - 100 Pomodoro sessions
            const focusMaster = updated.find(a => a.id === 'focus_master');
            if (focusMaster) {
                const newProgress = Math.min(pomodoroSessions, 100);
                if (focusMaster.progress !== newProgress) {
                    focusMaster.progress = newProgress;
                    hasChanges = true;
                }
                if (pomodoroSessions >= 100 && !focusMaster.unlocked) {
                    focusMaster.unlocked = true;
                    hasChanges = true;
                }
            }

            return hasChanges ? updated : prev;
        });
    }, [user]);

    // Listen for achievement check events
    useEffect(() => {
        const handleCheckAchievements = () => {
            checkAchievements();
        };

        window.addEventListener('checkAchievements', handleCheckAchievements);
        return () => window.removeEventListener('checkAchievements', handleCheckAchievements);
    }, [checkAchievements]);

    // Claim achievement
    const claimAchievement = useCallback((achievementId: string) => {
        setAchievements(prev =>
            prev.map(a =>
                a.id === achievementId && a.unlocked && !a.claimed
                    ? { ...a, claimed: true }
                    : a
            )
        );
    }, []);

    // Update achievement progress manually
    const updateAchievementProgress = useCallback((achievementId: string, progress: number) => {
        setAchievements(prev =>
            prev.map(a => {
                if (a.id === achievementId) {
                    const newProgress = Math.min(progress, a.maxProgress);
                    const unlocked = newProgress >= a.maxProgress;
                    return { ...a, progress: newProgress, unlocked };
                }
                return a;
            })
        );
    }, []);

    // Get total points from claimed achievements
    const getTotalPoints = useCallback(() => {
        return achievements
            .filter(a => a.claimed)
            .reduce((sum, a) => sum + (a.points || 0), 0);
    }, [achievements]);

    // Get count of unlocked achievements
    const getUnlockedCount = useCallback(() => {
        return achievements.filter(a => a.unlocked).length;
    }, [achievements]);

    const value: AchievementContextType = {
        achievements,
        checkAchievements,
        claimAchievement,
        updateAchievementProgress,
        getTotalPoints,
        getUnlockedCount
    };

    return (
        <AchievementContext.Provider value={value}>
            {children}
        </AchievementContext.Provider>
    );
}

export function useAchievement() {
    const context = useContext(AchievementContext);
    if (context === undefined) {
        throw new Error('useAchievement must be used within an AchievementProvider');
    }
    return context;
}
