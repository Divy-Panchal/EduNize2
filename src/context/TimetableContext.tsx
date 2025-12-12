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
                setClasses(JSON.parse(savedClasses));
            } catch (error) {
                console.error('Error loading timetable:', error);
                setClasses([]);
            }
        }
    }, []);

    // Save classes to localStorage whenever they change
    useEffect(() => {
        if (classes.length > 0) {
            localStorage.setItem('edunize-timetable', JSON.stringify(classes));
        }
    }, [classes]);

    const addClass = (classData: TimetableClass) => {
        const newClass: TimetableClass = {
            ...classData,
            id: Date.now().toString(),
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
