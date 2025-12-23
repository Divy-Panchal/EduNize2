import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: string;
}

export interface Topic {
    id: string;
    name: string;
    completed: boolean;
}

export interface Resource {
    id: string;
    title: string;
    url: string;
    type: 'link' | 'file' | 'video';
    fileName?: string;
    fileData?: string; // base64 encoded file data
}

export interface Subject {
    id: string;
    name: string;
    color: string;
    notes: Note[];
    topics: Topic[];
    resources: Resource[];
}

interface SubjectContextType {
    subjects: Subject[];
    addSubject: (subject: Omit<Subject, 'id' | 'notes' | 'topics' | 'resources'>) => void;
    deleteSubject: (id: string) => void;
    addNote: (subjectId: string, note: Omit<Note, 'id' | 'createdAt'>) => void;
    deleteNote: (subjectId: string, noteId: string) => void;
    addTopic: (subjectId: string, topic: Omit<Topic, 'id'>) => void;
    deleteTopic: (subjectId: string, topicId: string) => void;
    toggleTopic: (subjectId: string, topicId: string) => void;
    addResource: (subjectId: string, resource: Omit<Resource, 'id'>) => void;
    deleteResource: (subjectId: string, resourceId: string) => void;
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

export function SubjectProvider({ children }: { children: React.ReactNode }) {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const isInitialMount = useRef(true);


    // Load subjects from localStorage on mount
    useEffect(() => {
        const savedSubjects = localStorage.getItem('edunize-subjects');
        if (savedSubjects) {
            try {
                const parsed = JSON.parse(savedSubjects);
                // Migrate old data format to new format
                const migratedSubjects = parsed.map((subject: any) => ({
                    ...subject,
                    notes: subject.notes || [],
                    topics: subject.topics || [],
                    resources: subject.resources || [],
                }));
                setSubjects(migratedSubjects);
            } catch (error) {
                console.error('Error loading subjects:', error);
                // If there's an error, start fresh
                setSubjects([]);
            }
        }
    }, []);

    // Save subjects to localStorage whenever they change (but not on initial mount)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        try {
            localStorage.setItem('edunize-subjects', JSON.stringify(subjects));
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Error saving to localStorage:', error);
            }
            // Check if it's a quota exceeded error
            if (error instanceof DOMException && (
                error.name === 'QuotaExceededError' ||
                error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
            )) {
                // Silently fail - the data is still in memory
                // User will see error when trying to add more files
                console.warn('localStorage quota exceeded');
            }
        }
    }, [subjects]);

    const addSubject = (subjectData: Omit<Subject, 'id' | 'notes' | 'topics' | 'resources'>) => {
        const newSubject: Subject = {
            ...subjectData,
            id: `subject_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            notes: [],
            topics: [],
            resources: [],
        };
        setSubjects(prev => [...prev, newSubject]);
    };

    const deleteSubject = (id: string) => {
        setSubjects(prev => prev.filter(subject => subject.id !== id));
    };

    // Note operations
    const addNote = (subjectId: string, noteData: Omit<Note, 'id' | 'createdAt'>) => {
        setSubjects(prev => prev.map(subject => {
            if (subject.id === subjectId) {
                const newNote: Note = {
                    ...noteData,
                    id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    createdAt: new Date().toISOString(),
                };
                return { ...subject, notes: [...subject.notes, newNote] };
            }
            return subject;
        }));
    };

    const deleteNote = (subjectId: string, noteId: string) => {
        setSubjects(prev => prev.map(subject => {
            if (subject.id === subjectId) {
                return { ...subject, notes: subject.notes.filter(note => note.id !== noteId) };
            }
            return subject;
        }));
    };

    // Topic operations
    const addTopic = (subjectId: string, topicData: Omit<Topic, 'id'>) => {
        setSubjects(prev => prev.map(subject => {
            if (subject.id === subjectId) {
                const newTopic: Topic = {
                    ...topicData,
                    id: `topic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                };
                return { ...subject, topics: [...subject.topics, newTopic] };
            }
            return subject;
        }));
    };

    const deleteTopic = (subjectId: string, topicId: string) => {
        setSubjects(prev => prev.map(subject => {
            if (subject.id === subjectId) {
                return { ...subject, topics: subject.topics.filter(topic => topic.id !== topicId) };
            }
            return subject;
        }));
    };

    const toggleTopic = (subjectId: string, topicId: string) => {
        setSubjects(prev => prev.map(subject => {
            if (subject.id === subjectId) {
                return {
                    ...subject,
                    topics: subject.topics.map(topic =>
                        topic.id === topicId ? { ...topic, completed: !topic.completed } : topic
                    ),
                };
            }
            return subject;
        }));
    };

    // Resource operations
    const addResource = (subjectId: string, resourceData: Omit<Resource, 'id'>) => {
        setSubjects(prev => prev.map(subject => {
            if (subject.id === subjectId) {
                const newResource: Resource = {
                    ...resourceData,
                    id: `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                };
                return { ...subject, resources: [...subject.resources, newResource] };
            }
            return subject;
        }));
    };

    const deleteResource = (subjectId: string, resourceId: string) => {
        setSubjects(prev => prev.map(subject => {
            if (subject.id === subjectId) {
                return { ...subject, resources: subject.resources.filter(resource => resource.id !== resourceId) };
            }
            return subject;
        }));
    };

    return (
        <SubjectContext.Provider value={{
            subjects,
            addSubject,
            deleteSubject,
            addNote,
            deleteNote,
            addTopic,
            deleteTopic,
            toggleTopic,
            addResource,
            deleteResource,
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
