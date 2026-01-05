// Loading state component
// Fixes BUG-026: Add loading states

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
    fullScreen?: boolean;
}

export function LoadingSpinner({ size = 'md', message, fullScreen = false }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4'
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <motion.div
                className={`${sizeClasses[size]} border-blue-500 border-t-transparent rounded-full`}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear'
                }}
            />
            {message && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {message}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
}

interface LoadingOverlayProps {
    isLoading: boolean;
    message?: string;
    children: React.ReactNode;
}

export function LoadingOverlay({ isLoading, message, children }: LoadingOverlayProps) {
    return (
        <div className="relative">
            {children}
            {isLoading && (
                <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                    <LoadingSpinner message={message} />
                </div>
            )}
        </div>
    );
}

interface SkeletonProps {
    className?: string;
    count?: number;
}

export function Skeleton({ className = '', count = 1 }: SkeletonProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
                />
            ))}
        </>
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
        </div>
    );
}
