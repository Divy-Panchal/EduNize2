import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Notification {
    id: string;
    type: 'task' | 'pomodoro' | 'achievement' | 'progress' | 'general';
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    icon?: string;
}

export interface NotificationSettings {
    taskReminders: boolean;
    pomodoroBreaks: boolean;
    weeklyProgress: boolean;
    achievementUnlocked: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    settings: NotificationSettings;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
    updateSettings: (settings: Partial<NotificationSettings>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>(() => {
        try {
            const stored = localStorage.getItem('notifications');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const [settings, setSettings] = useState<NotificationSettings>(() => {
        try {
            const stored = localStorage.getItem('notificationSettings');
            return stored ? JSON.parse(stored) : {
                taskReminders: true,
                pomodoroBreaks: true,
                weeklyProgress: false,
                achievementUnlocked: true,
            };
        } catch {
            return {
                taskReminders: true,
                pomodoroBreaks: true,
                weeklyProgress: false,
                achievementUnlocked: true,
            };
        }
    });

    // Persist notifications to localStorage
    useEffect(() => {
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }, [notifications]);

    // Persist settings to localStorage
    useEffect(() => {
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
    }, [settings]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        // Check if notification type is enabled in settings
        const settingKey = {
            task: 'taskReminders',
            pomodoro: 'pomodoroBreaks',
            progress: 'weeklyProgress',
            achievement: 'achievementUnlocked',
            general: 'taskReminders', // Default to taskReminders for general notifications
        }[notification.type] as keyof NotificationSettings;

        if (!settings[settingKey]) {
            return; // Don't add notification if this type is disabled
        }

        const newNotification: Notification = {
            ...notification,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            read: false,
        };

        setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep max 50 notifications
    };

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const updateSettings = (newSettings: Partial<NotificationSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                settings,
                addNotification,
                markAsRead,
                markAllAsRead,
                removeNotification,
                clearAll,
                updateSettings,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        // Return a safe default when context is not available
        return {
            notifications: [],
            unreadCount: 0,
            settings: {
                taskReminders: true,
                pomodoroBreaks: true,
                weeklyProgress: false,
                achievementUnlocked: true,
            },
            addNotification: () => { },
            markAsRead: () => { },
            markAllAsRead: () => { },
            removeNotification: () => { },
            clearAll: () => { },
            updateSettings: () => { },
        };
    }
    return context;
}
