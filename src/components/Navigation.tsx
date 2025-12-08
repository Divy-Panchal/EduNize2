
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BookOpen, CheckSquare, Timer, User } from 'lucide-react';

const navigationItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/subjects', icon: BookOpen, label: 'Subjects' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/pomodoro', icon: Timer, label: 'Pomodoro' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-4 left-0 right-0 h-20 flex justify-center z-50">
      <div
        className="flex justify-around items-center w-full max-w-sm bg-gray-900/80 backdrop-blur-lg rounded-full shadow-lg border border-gray-700/50 p-2"
      >
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative w-16 h-16 flex flex-col items-center justify-center rounded-full text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none"
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-white rounded-full"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center">
                <Icon className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-black' : ''}`} />
                <span className={`text-xs font-bold mt-1 transition-colors duration-300 ${isActive ? 'text-black' : 'text-transparent'}`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
