import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { ChevronDown } from 'lucide-react';

const getStoredUserData = () => {
  const storedData = localStorage.getItem('userData');
  if (storedData) {
    return JSON.parse(storedData);
  } 
  return {
    fullName: 'User',
    profilePhoto: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
  };
};

export function DashboardProfile() {
  const { themeConfig } = useTheme();
  const [userData, setUserData] = useState(getStoredUserData);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key === 'userData') {
        setUserData(getStoredUserData());
      }
    };

    setUserData(getStoredUserData());
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  return (
    <div className="relative">
      <motion.div
        className="flex items-center gap-3 cursor-pointer p-2 rounded-lg"
        whileHover={{ backgroundColor: themeConfig.hover, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setDropdownOpen(!isDropdownOpen)}
      >
        <img 
          src={userData.profilePhoto} 
          alt="Profile" 
          className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-blue-400"
        />
        <div className='hidden md:block'>
          <h4 className={`font-semibold ${themeConfig.text}`}>{userData.fullName}</h4>
          <div className="flex items-center">
            <p className={`text-sm ${themeConfig.textSecondary}`}>View Options</p>
            <ChevronDown size={16} className={`${themeConfig.textSecondary} ml-1`} />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50"
          >
            <div className="py-1">
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                Profile
              </Link>
              <Link
                to="/settings"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                Settings
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
