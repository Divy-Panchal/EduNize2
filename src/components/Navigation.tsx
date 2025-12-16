import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BookOpen, CheckSquare, Timer, User, CalendarDays } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navigationItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/subjects', icon: BookOpen, label: 'Subjects' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/timetable', icon: CalendarDays, label: 'Schedule' },
  { path: '/pomodoro', icon: Timer, label: 'Focus' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function Navigation() {
  const location = useLocation();
  const { themeConfig } = useTheme();

  return (
    <nav className="fixed bottom-6 left-0 right-0 flex justify-center z-50 px-4">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={`flex items-center gap-1 ${themeConfig.card} backdrop-blur-xl rounded-full shadow-2xl border ${themeConfig.text === 'text-white' ? 'border-gray-700/50' : 'border-gray-200/50'} px-4 py-3`}
      >
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative group"
            >
              <motion.div
                className="relative flex flex-col items-center justify-center px-4 py-2"
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                {/* Active background pill */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="navPill"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </AnimatePresence>

                {/* Hover background */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}

                {/* Icon */}
                <motion.div
                  className="relative z-10"
                  animate={{
                    y: isActive ? -2 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Icon
                    className={`w-5 h-5 transition-all duration-300 ease-out ${isActive
                      ? 'text-white'
                      : `${themeConfig.textSecondary} group-hover:${themeConfig.text}`
                      }`}
                  />
                </motion.div>

                {/* Label */}
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="relative z-10 text-[10px] font-semibold text-white mt-1"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>
    </nav>
  );
}
