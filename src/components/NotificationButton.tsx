import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { NotificationPanel } from './NotificationPanel';

export function NotificationButton() {
    const { themeConfig } = useTheme();
    const { unreadCount } = useNotification();
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                buttonRef.current &&
                panelRef.current &&
                !buttonRef.current.contains(event.target as Node) &&
                !panelRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={buttonRef}>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-lg transition-colors duration-200 ${isOpen
                    ? 'bg-blue-100 dark:bg-blue-900/50'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
            >
                <Bell
                    className={`w-6 h-6 ${isOpen
                        ? 'text-blue-600 dark:text-blue-400'
                        : themeConfig.textSecondary
                        }`}
                />

                {/* Unread badge */}
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Notification Panel */}
            <AnimatePresence>
                {isOpen && (
                    <div ref={panelRef}>
                        <NotificationPanel onClose={() => setIsOpen(false)} />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
