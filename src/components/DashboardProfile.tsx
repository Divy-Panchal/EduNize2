import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const getStoredUserData = () => {
  const storedData = localStorage.getItem('userData');
  if (storedData) {
    return JSON.parse(storedData);
  } 
  // Return a default structure if nothing is in localStorage
  return {
    fullName: 'User',
    profilePhoto: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
  };
};

export function DashboardProfile() {
  const { themeConfig } = useTheme();
  const [userData, setUserData] = useState(getStoredUserData);

  useEffect(() => {
    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key === 'userData') {
        setUserData(getStoredUserData());
      }
    };

    // Set initial data
    setUserData(getStoredUserData());

    // Listen for changes in localStorage from other tabs/windows
    window.addEventListener('storage', handleStorageUpdate);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  return (
    <Link to="/profile">
      <motion.div
        className="flex items-center gap-3 cursor-pointer p-2 rounded-lg"
        whileHover={{ backgroundColor: themeConfig.hover, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <img 
          src={userData.profilePhoto} 
          alt="Profile" 
          className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-blue-400"
        />
        <div className='hidden md:block'>
          <h4 className={`font-semibold ${themeConfig.text}`}>{userData.fullName}</h4>
          <p className={`text-sm ${themeConfig.textSecondary}`}>View Profile</p>
        </div>
      </motion.div>
    </Link>
  );
}
