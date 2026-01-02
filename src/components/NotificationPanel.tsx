import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Timer,
    Trophy,
    TrendingUp,
    X,
    CheckCheck,
    Trash2,
    Bell,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNotification, Notification } from '../context/NotificationContext';

interface NotificationPanelProps {
    onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
    const { theme, themeConfig } = useTheme();
    const { notifications, markAsRead, markAllAsRead, removeNotification, clearAll } =
        useNotification();

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'task':
                return CheckCircle2;
            case 'pomodoro':
                return Timer;
            case 'achievement':
                return Trophy;
            case 'progress':
                return TrendingUp;
            default:
                return Bell;
        }
    };

    const getNotificationColor = (type: Notification['type']) => {
        switch (type) {
            case 'task':
                return 'text-green-500';
            case 'pomodoro':
                return 'text-purple-500';
            case 'achievement':
                return 'text-yellow-500';
            case 'progress':
                return 'text-blue-500';
            default:
                return 'text-gray-500';
        }
    };

    const formatTimestamp = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 mt-2 w-80 md:w-96 ${themeConfig.card} rounded-xl shadow-2xl border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                } overflow-hidden z-50`}
        >
            {/* Header */}
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-lg font-semibold ${themeConfig.text}`}>Notifications</h3>
                    <button
                        onClick={onClose}
                        className={`p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${themeConfig.textSecondary}`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Action buttons */}
                {notifications.length > 0 && (
                    <div className="flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={markAllAsRead}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${theme === 'dark'
                                ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-900'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                }`}
                        >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark all read
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={clearAll}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${theme === 'dark'
                                ? 'bg-red-900/50 text-red-300 hover:bg-red-900'
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                                }`}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear all
                        </motion.button>
                    </div>
                )}
            </div>

            {/* Notification list */}
            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                        >
                            <Bell className={`w-12 h-12 mx-auto mb-3 ${themeConfig.textSecondary} opacity-50`} />
                        </motion.div>
                        <p className={`text-sm font-medium ${themeConfig.text} mb-1`}>
                            No notifications
                        </p>
                        <p className={`text-xs ${themeConfig.textSecondary}`}>
                            You're all caught up!
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {notifications.map((notification, index) => {
                            const Icon = getNotificationIcon(notification.type);
                            const iconColor = getNotificationColor(notification.type);

                            return (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => !notification.read && markAsRead(notification.id)}
                                    className={`p-4 cursor-pointer transition-colors ${notification.read
                                        ? 'opacity-60'
                                        : theme === 'dark'
                                            ? 'bg-blue-900/20 hover:bg-blue-900/30'
                                            : 'bg-blue-50/50 hover:bg-blue-50'
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <div className={`flex-shrink-0 ${iconColor}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4
                                                    className={`text-sm font-semibold ${themeConfig.text} ${!notification.read ? 'font-bold' : ''
                                                        }`}
                                                >
                                                    {notification.title}
                                                </h4>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeNotification(notification.id);
                                                    }}
                                                    className={`flex-shrink-0 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${themeConfig.textSecondary}`}
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <p className={`text-xs ${themeConfig.textSecondary} mt-1`}>
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`text-xs ${themeConfig.textSecondary}`}>
                                                    {formatTimestamp(notification.timestamp)}
                                                </span>
                                                {!notification.read && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
