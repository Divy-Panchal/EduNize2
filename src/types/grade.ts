export interface Grade {
    id: string;
    subjectId: string;
    subjectName: string;
    category: 'test' | 'assignment' | 'exam' | 'quiz';
    score: number;
    maxScore: number;
    weight: number; // percentage weight in final grade
    date: string;
    notes?: string;
}

export interface SubjectGrade {
    subjectId: string;
    subjectName: string;
    grades: Grade[];
    average: number;
    letterGrade: string;
    color: string;
}

export interface GradeStats {
    overallGPA: number;
    overallPercentage: number;
    letterGrade: string;
    subjectGrades: SubjectGrade[];
    trend: 'improving' | 'declining' | 'stable';
}

export const GRADE_CATEGORIES = [
    { value: 'test', label: 'Test', color: 'bg-blue-500' },
    { value: 'assignment', label: 'Assignment', color: 'bg-purple-500' },
    { value: 'exam', label: 'Exam', color: 'bg-red-500' },
    { value: 'quiz', label: 'Quiz', color: 'bg-green-500' },
] as const;

export const getLetterGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
};

export const getGradeColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-emerald-500';
    if (percentage >= 80) return 'text-blue-500';
    if (percentage >= 70) return 'text-amber-500';
    return 'text-red-500';
};

export const getGradeBgColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-emerald-500';
    if (percentage >= 80) return 'bg-blue-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-red-500';
};
