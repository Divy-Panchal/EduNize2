import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface Subject {
    id: string;
    name: string;
    color: string;
}

interface SubjectContextType {
    subjects: Subject[];
    addSubject: (subject: Omit<Subject, 'id'>) => void;
    deleteSubject: (id: string) => void;
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

export function SubjectProvider({ children }: { children: React.ReactNode }) {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const isInitialMount = useRef(true);

    // Load subjects from localStorage on mount
    useEffect(() => {
        const savedSubjects = localStorage.getItem('edunize-subjects');
        if (savedSubjects) {
            setSubjects(JSON.parse(savedSubjects));
        }
    }, []);

    // Save subjects to localStorage whenever they change (but not on initial mount)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        localStorage.setItem('edunize-subjects', JSON.stringify(subjects));
    }, [subjects]);

    const addSubject = (subjectData: Omit<Subject, 'id'>) => {
        const newSubject: Subject = {
            ...subjectData,
            id: Date.now().toString(),
        };
        setSubjects(prev => [...prev, newSubject]);
    };

    const deleteSubject = (id: string) => {
        setSubjects(prev => prev.filter(subject => subject.id !== id));
    };

    return (
        <SubjectContext.Provider value={{
            subjects,
            addSubject,
            deleteSubject
        }}>
            {children}
        </SubjectContext.Provider>
    );
}

export function useSubject() {
    const context = useContext(SubjectContext);
    if (!context) {
        throw new Error('useSubject must be used within SubjectProvider');
    }
    return context;
}
