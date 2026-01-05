import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Grade, SubjectGrade, GradeStats, getLetterGrade } from '../types/grade';
import { warnIfStorageNearLimit } from '../utils/storageUtils';
import toast from 'react-hot-toast';

interface GradeContextType {
    grades: Grade[];
    addGrade: (grade: Omit<Grade, 'id'>) => void;
    updateGrade: (id: string, grade: Partial<Grade>) => void;
    deleteGrade: (id: string) => void;
    getGradeStats: () => GradeStats;
    getSubjectGrades: (subjectId: string) => Grade[];
}

const GradeContext = createContext<GradeContextType | undefined>(undefined);

export function GradeProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [grades, setGrades] = useState<Grade[]>([]);

    // Load grades from localStorage on mount
    useEffect(() => {
        if (user) {
            const storageKey = `grades_${user.uid}`;
            const savedGrades = localStorage.getItem(storageKey);
            if (savedGrades) {
                try {
                    setGrades(JSON.parse(savedGrades));
                } catch (error) {
                    console.error('Failed to parse grades:', error);
                    setGrades([]);
                }
            }
        }
    }, [user]);

    // Save grades to localStorage whenever they change
    useEffect(() => {
        if (user && grades.length >= 0) {
            const storageKey = `grades_${user.uid}`;
            try {
                localStorage.setItem(storageKey, JSON.stringify(grades));

                // Warn if storage is getting full
                if (warnIfStorageNearLimit()) {
                    toast.error('Storage is getting full! Consider deleting old grades to free up space.', {
                        duration: 5000,
                    });
                }
            } catch (error) {
                console.error('Failed to save grades to localStorage:', error);
                // Handle quota exceeded or other localStorage errors
                if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                    toast.error('Storage quota exceeded! Please delete some old grades to free up space.', {
                        duration: 6000,
                    });
                } else {
                    console.warn('Could not save grades. Data may not persist.');
                }
            }
        }
    }, [grades, user]);

    const addGrade = (gradeData: Omit<Grade, 'id'>) => {
        const newGrade: Grade = {
            ...gradeData,
            id: `grade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
        setGrades(prev => [...prev, newGrade]);
    };

    const updateGrade = (id: string, gradeData: Partial<Grade>) => {
        setGrades(prev =>
            prev.map(grade => (grade.id === id ? { ...grade, ...gradeData } : grade))
        );
    };

    const deleteGrade = (id: string) => {
        setGrades(prev => prev.filter(grade => grade.id !== id));
    };

    const getSubjectGrades = (subjectId: string): Grade[] => {
        return grades.filter(grade => grade.subjectId === subjectId);
    };

    const calculateSubjectAverage = (subjectGrades: Grade[]): number => {
        if (subjectGrades.length === 0) return 0;

        const totalWeight = subjectGrades.reduce((sum, grade) => sum + grade.weight, 0);

        if (totalWeight === 0) {
            // If no weights, use simple average
            const totalPercentage = subjectGrades.reduce(
                (sum, grade) => {
                    // Prevent division by zero
                    if (grade.maxScore === 0) {
                        console.warn('Grade with maxScore of 0 detected, skipping');
                        return sum;
                    }
                    return sum + (grade.score / grade.maxScore) * 100;
                },
                0
            );
            const validGrades = subjectGrades.filter(g => g.maxScore > 0).length;
            return validGrades > 0 ? totalPercentage / validGrades : 0;
        }

        // Weighted average
        const weightedSum = subjectGrades.reduce(
            (sum, grade) => {
                // Prevent division by zero
                if (grade.maxScore === 0) {
                    console.warn('Grade with maxScore of 0 detected, skipping');
                    return sum;
                }
                return sum + ((grade.score / grade.maxScore) * 100 * grade.weight);
            },
            0
        );
        return weightedSum / totalWeight;
    };

    const getGradeStats = (): GradeStats => {
        // Group grades by subject
        const subjectMap = new Map<string, Grade[]>();
        grades.forEach(grade => {
            const existing = subjectMap.get(grade.subjectId) || [];
            subjectMap.set(grade.subjectId, [...existing, grade]);
        });

        // Calculate subject grades
        const subjectGrades: SubjectGrade[] = Array.from(subjectMap.entries()).map(
            ([subjectId, subjectGradesList]) => {
                const average = calculateSubjectAverage(subjectGradesList);
                return {
                    subjectId,
                    subjectName: subjectGradesList[0]?.subjectName || 'Unknown',
                    grades: subjectGradesList,
                    average,
                    letterGrade: getLetterGrade(average),
                    color: getSubjectColor(average),
                };
            }
        );

        // Calculate overall stats
        const overallPercentage =
            subjectGrades.length > 0
                ? subjectGrades.reduce((sum, sg) => sum + sg.average, 0) / subjectGrades.length
                : 0;

        const overallGPA = percentageToGPA(overallPercentage);
        const letterGrade = getLetterGrade(overallPercentage);

        // Calculate trend (simple: compare last 5 grades to previous 5)
        const sortedGrades = [...grades].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const recentGrades = sortedGrades.slice(0, 5);
        const olderGrades = sortedGrades.slice(5, 10);

        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        if (recentGrades.length > 0 && olderGrades.length > 0) {
            const recentAvg =
                recentGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) /
                recentGrades.length;
            const olderAvg =
                olderGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) /
                olderGrades.length;

            if (recentAvg > olderAvg + 2) trend = 'improving';
            else if (recentAvg < olderAvg - 2) trend = 'declining';
        }

        return {
            overallGPA,
            overallPercentage,
            letterGrade,
            subjectGrades,
            trend,
        };
    };

    return (
        <GradeContext.Provider
            value={{
                grades,
                addGrade,
                updateGrade,
                deleteGrade,
                getGradeStats,
                getSubjectGrades,
            }}
        >
            {children}
        </GradeContext.Provider>
    );
}

export function useGrade() {
    const context = useContext(GradeContext);
    if (!context) {
        throw new Error('useGrade must be used within GradeProvider');
    }
    return context;
}

// Helper functions
function percentageToGPA(percentage: number): number {
    // More accurate GPA conversion using standard 4.0 scale
    if (percentage >= 93) return 4.0;  // A (93-100)
    if (percentage >= 90) return 3.7;  // A- (90-92)
    if (percentage >= 87) return 3.3;  // B+ (87-89)
    if (percentage >= 83) return 3.0;  // B (83-86)
    if (percentage >= 80) return 2.7;  // B- (80-82)
    if (percentage >= 77) return 2.3;  // C+ (77-79)
    if (percentage >= 73) return 2.0;  // C (73-76)
    if (percentage >= 70) return 1.7;  // C- (70-72)
    if (percentage >= 67) return 1.3;  // D+ (67-69)
    if (percentage >= 65) return 1.0;  // D (65-66)
    if (percentage >= 60) return 0.7;  // D- (60-64)
    return 0.0;  // F (below 60)
}

function getSubjectColor(average: number): string {
    if (average >= 90) return 'emerald';
    if (average >= 80) return 'blue';
    if (average >= 70) return 'amber';
    return 'red';
}
