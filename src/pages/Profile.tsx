import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Save, BookOpen, Award, BarChart2, Plus, Upload } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// Mock user data
const initialUserData = {
  fullName: 'Alex Doe',
  role: 'Student',
  profilePhoto: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
  education: {
    institution: 'University of Innovation',
    grade: '3rd Year',
  },
  achievements: [
    'Dean\'s List 2023',
    'Top Project Award',
  ],
  profileCompleteness: 75,
};

// Function to get data from localStorage
const getStoredUserData = () => {
    const storedData = localStorage.getItem('userData');
    if (storedData) {
      return JSON.parse(storedData);
    }
    // If no data, store initial data and return it
    localStorage.setItem('userData', JSON.stringify(initialUserData));
    return initialUserData;
  };

const ProgressCircle = ({ progress }: { progress: number }) => {
  const { themeConfig } = useTheme();
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} strokeWidth="10" className="stroke-gray-200 dark:stroke-gray-700" fill="transparent" />
        <motion.circle
          cx="60" cy="60" r={radius} strokeWidth="10" className="stroke-blue-500"
          fill="transparent" strokeLinecap="round" transform="rotate(-90 60 60)"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <motion.div
        className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${themeConfig.text}`}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
      >
        {progress}%
      </motion.div>
    </div>
  );
};

export function Profile() {
  const { themeConfig } = useTheme();
  const { signOut } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(getStoredUserData);
  const [newAchievement, setNewAchievement] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // On initial load, sync state with localStorage
    setUserData(getStoredUserData());
  }, []);

  const handleSave = () => {
    localStorage.setItem('userData', JSON.stringify(userData));
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');

    if (section === 'education') {
      setUserData(prev => ({ ...prev, education: { ...prev.education, [field]: value } }));
    } else {
      setUserData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddAchievement = () => {
    if (newAchievement.trim()) {
      const updatedAchievements = [...userData.achievements, newAchievement.trim()];
      setUserData(prev => ({ ...prev, achievements: updatedAchievements }));
      setNewAchievement('');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserData(prev => ({ ...prev, profilePhoto: event.target?.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const animationVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  return (
    <motion.div
      className={`p-4 sm:p-6 ${themeConfig.background} min-h-screen`}
      variants={animationVariants} initial="initial" animate="animate"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <h1 className={`text-3xl font-bold ${themeConfig.text}`}>My Profile</h1>
          <div className="flex gap-4">
            <motion.button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${isEditing ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}
              whileTap={{ scale: 0.95 }}
            >
              {isEditing ? <Save size={18} /> : <Edit size={18} />}
              {isEditing ? 'Save' : 'Edit'}
            </motion.button>
            <motion.button
              onClick={signOut}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors bg-red-500 text-white`}
              whileTap={{ scale: 0.95 }}
            >
              Sign Out
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <motion.div className="lg:col-span-1" variants={animationVariants}>
            <div className="w-full h-80 [perspective:1000px]" onClick={() => !isEditing && setIsFlipped(!isFlipped)}>
              <motion.div
                className="relative w-full h-full text-center [transform-style:preserve-3d] transition-transform duration-700"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
              >
                {/* Front Side */}
                <div className={`absolute w-full h-full p-6 rounded-2xl shadow-lg ${themeConfig.card} [backface-visibility:hidden] flex flex-col items-center justify-center`}>
                  <div className="relative">
                    <img src={userData.profilePhoto} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 dark:border-blue-800" />
                    {isEditing && (
                      <motion.button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full"
                        whileTap={{ scale: 0.9 }}
                      >
                        <Upload size={16} />
                      </motion.button>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                  </div>
                  <input type="text" name="fullName" value={userData.fullName} onChange={handleInputChange} disabled={!isEditing} className={`mt-4 text-2xl font-bold text-center w-full bg-transparent ${themeConfig.text}`} />
                  <input type="text" name="role" value={userData.role} onChange={handleInputChange} disabled={!isEditing} className={`text-md text-center w-full bg-transparent ${themeConfig.textSecondary}`} />
                  <p className={`mt-4 text-xs ${themeConfig.textSecondary}`}>{isEditing ? 'Click save to apply' : 'Click to flip for more details'}</p>
                </div>
                {/* Back Side */}
                <div className={`absolute w-full h-full p-6 rounded-2xl shadow-lg ${themeConfig.card} [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-center`}>
                  <h3 className={`text-xl font-bold mb-4 ${themeConfig.text} flex items-center gap-2`}><BookOpen size={20} />Education</h3>
                  <div className="text-left">
                    <p className={`text-sm ${themeConfig.textSecondary}`}>Institution:</p>
                    <input type="text" name="education.institution" value={userData.education.institution} onChange={handleInputChange} disabled={!isEditing} className={`font-semibold w-full bg-transparent ${themeConfig.text}`} />
                    <p className={`text-sm mt-2 ${themeConfig.textSecondary}`}>Grade/Year:</p>
                    <input type="text" name="education.grade" value={userData.education.grade} onChange={handleInputChange} disabled={!isEditing} className={`font-semibold w-full bg-transparent ${themeConfig.text}`} />
                  </div>
                  <p className={`mt-4 text-xs text-center ${themeConfig.textSecondary}`}>{isEditing ? 'Click save to apply' : 'Click to flip back'}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div className={`lg:col-span-2 p-6 rounded-2xl shadow-lg ${themeConfig.card}`} variants={animationVariants}>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="text-center">
                <p className={`font-semibold mb-2 ${themeConfig.textSecondary}`}>Profile Completeness</p>
                <ProgressCircle progress={userData.profileCompleteness} />
              </div>
              <div className="flex-1 w-full">
                <h4 className={`text-lg font-bold ${themeConfig.text} mb-2 flex items-center gap-2`}><Award size={18} />Achievements</h4>
                <div className="overflow-auto max-h-40 pr-2">
                    <ul className="space-y-2">
                        {userData.achievements.map((ach, index) => (
                        <motion.li
                            key={index} className={`flex items-center gap-2 p-2 rounded-md ${themeConfig.background}`}
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Award size={16} className="text-yellow-500" />
                            <span className={themeConfig.text}>{ach}</span>
                        </motion.li>
                        ))}
                    </ul>
                </div>
                {isEditing && (
                  <div className="flex gap-2 mt-4">
                    <input
                      type="text" value={newAchievement} onChange={(e) => setNewAchievement(e.target.value)}
                      placeholder="New Achievement" className={`flex-grow p-2 rounded-md ${themeConfig.background} ${themeConfig.text}`}
                    />
                    <motion.button onClick={handleAddAchievement} className="bg-blue-500 text-white p-2 rounded-md" whileTap={{ scale: 0.95 }}>
                      <Plus size={20} />
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
