import React, { createContext, useContext, useState, useEffect } from 'react';

export interface TimetableClass {
    id?: string;
    day: number;
    time: string;
    duration: number;
    subject: string;
    type: string;
    color: string;
}

interface TimetableContextType {
    classes: TimetableClass[];
    addClass: (classData: TimetableClass) => void;
    deleteClass: (id: string) => void;
    updateClass: (id: string, updates: Partial<TimetableClass>) => void;
    getTodayClasses: () => TimetableClass[];
}

const TimetableContext = createContext<TimetableContextType | undefined>(undefined);

export function TimetableProvider({ children }: { children: React.ReactNode }) {
    const [classes, setClasses] = useState<TimetableClass[]>([]);

    // Load classes from localStorage on mount
    useEffect(() => {
        const savedClasses = localStorage.getItem('edunize-timetable');
        if (savedClasses) {
            try {
                const parsed = JSON.parse(savedClasses);
                // Validate data structure
                if (Array.isArray(parsed) && parsed.every(cls =>
                    cls.day !== undefined && cls.time && cls.subject
                )) {
                    // Ensure all classes have IDs (migration for old data)
                    const classesWithIds = parsed.map((cls: TimetableClass, index: number) => ({
                        ...cls,
                        id: cls.id || `${Date.now()}-${index}`
                    }));
                    setClasses(classesWithIds);
                } else {
                    if (import.meta.env.DEV) {
                        console.error('Invalid timetable data structure');
                    }
                    setClasses([]);
                }
            } catch (error) {
                if (import.meta.env.DEV) {
                    console.error('Error loading timetable:', error);
                }
                setClasses([]);
            }
        }
    }, []);

    // Save classes to localStorage whenever they change
    useEffect(() => {
        if (classes.length > 0) {
            try {
                localStorage.setItem('edunize-timetable', JSON.stringify(classes));
            } catch (error) {
                if (import.meta.env.DEV) {
                    console.error('Failed to save timetable to localStorage:', error);
                }
                if (error instanceof DOMException && (
                    error.name === 'QuotaExceededError' ||
                    error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
                )) {
                    alert('Storage quota exceeded. Please delete some old classes to free up space.');
                }
            }
        } else {
            // Clear localStorage if no classes remain
            localStorage.removeItem('edunize-timetable');
        }
    }, [classes]);

    const addClass = (classData: TimetableClass) => {
        const newClass: TimetableClass = {
            ...classData,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        setClasses(prev => [...prev, newClass]);
    };

    const deleteClass = (id: string) => {
        setClasses(prev => prev.filter(cls => cls.id !== id));
    };

    const updateClass = (id: string, updates: Partial<TimetableClass>) => {
        setClasses(prev => prev.map(cls =>
            cls.id === id ? { ...cls, ...updates } : cls
        ));
    };

    const getTodayClasses = () => {
        const today = new Date().getDay();
        // Convert Sunday (0) to 6, and shift Monday-Saturday to 0-5
        const dayIndex = today === 0 ? 6 : today - 1;

        return classes
            .filter(cls => cls.day === dayIndex)
            .sort((a, b) => a.time.localeCompare(b.time));
    };

    return (
        <TimetableContext.Provider value={{
            classes,
            addClass,
            deleteClass,
            updateClass,
            getTodayClasses,
        }}>
            {children}
        </TimetableContext.Provider>
    );
}

export function useTimetable() {
    const context = useContext(TimetableContext);
    if (!context) {
        throw new Error('useTimetable must be used within TimetableProvider');
    }
    return context;
}
