import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  BookOpen, 
  CheckSquare, 
  Calendar, 
  Timer, 
  BarChart3, 
  Settings,
  Award,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navigationItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/subjects', icon: BookOpen, label: 'Subjects' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/timetable', icon: Calendar, label: 'Timetable' },
  { path: '/pomodoro', icon: Timer, label: 'Pomodoro' },
  { path: '/results', icon: BarChart3, label: 'Results' },
  { path: '/achievements', icon: Award, label: 'Badges' },
  { path: '/profile', icon: User, label: 'Profile' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function Navigation() {
  const location = useLocation();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      toast.error('Error signing out');
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:left-0 md:bottom-auto md:w-64 bg-white border-t md:border-r md:border-t-0 border-gray-200 z-50">
      <div className="flex md:flex-col h-16 md:h-full">
        <div className="hidden md:block p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800 mb-2">EduOrganize</h1>
          {user && (
            <p className="text-sm text-gray-600 truncate">{user.email}</p>
          )}
        </div>
        
        <div className="flex md:flex-col flex-1 overflow-x-auto md:overflow-x-visible md:overflow-y-auto md:pb-20">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col md:flex-row items-center justify-center md:justify-start
                  px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium
                  transition-colors duration-200 min-w-0 flex-1 md:flex-none
                  ${isActive 
                    ? 'text-blue-600 bg-blue-50 border-r-2 md:border-r-2 border-blue-600' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="w-5 h-5 md:mr-3 mb-1 md:mb-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
        
        {/* Sign Out Button (Desktop) */}
        <div className="hidden md:block p-4 border-t border-gray-200">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </motion.button>
        </div>
      </div>
    </nav>
  );
}