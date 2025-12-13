import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Edit, Save, BookOpen, Award, Upload, X,
    Mail, Phone, User as UserIcon,
    Eye, EyeOff, Settings
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { User } from 'firebase/auth';

// User data structure (without skills and interests)
const initialUserData = {
    fullName: 'Alex Doe',
    role: 'Student',
    profilePhoto: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
    education: {
        institution: 'University of Innovation',
        grade: '3rd Year',
    },
    contact: {
        email: 'alex.doe@example.com',
        phone: '+1 234 567 8900',
    },
    bio: 'Passionate student focused on learning and growth. Always eager to take on new challenges and expand my knowledge.',
    achievements: [
        'Dean\'s List 2023',
        'Top Project Award',
    ],
    sectionVisibility: {
        contact: true,
        bio: true,
        achievements: true,
    },
    profileCompleteness: 85,
};

// Function to get data from localStorage
const getStoredUserData = (user: User | null) => {
    if (!user) return initialUserData;

    const userDataKey = `userData_${user.uid}`;
    const storedData = localStorage.getItem(userDataKey);
    if (storedData) {
        const parsed = JSON.parse(storedData);
        // Merge with initial data to ensure all new fields exist
        // But always use the Firebase user's email
        return {
            ...initialUserData,
            ...parsed,
            contact: {
                ...initialUserData.contact,
                ...parsed.contact,
                email: user.email || parsed.contact?.email || initialUserData.contact.email
            },
            sectionVisibility: { ...initialUserData.sectionVisibility, ...parsed.sectionVisibility },
        };
    }

    // For new users, create initial data with their Firebase email
    const newUserData = {
        ...initialUserData,
        contact: {
            ...initialUserData.contact,
            email: user.email || initialUserData.contact.email,
        }
    };
    localStorage.setItem(userDataKey, JSON.stringify(newUserData));
    return newUserData;
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

// SectionCard component moved outside to prevent recreation on every render
const SectionCard = React.memo(({
    title,
    icon: Icon,
    children,
    sectionKey,
    isVisible,
    onToggleVisibility,
    themeConfig
}: {
    title: string;
    icon: any;
    children: React.ReactNode;
    sectionKey?: string;
    isVisible: boolean;
    onToggleVisibility?: () => void;
    themeConfig: any;
}) => {
    const animationVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
    };

    return (
        <motion.div
            className={`${themeConfig.card} p-6 rounded-xl shadow-sm border dark:border-gray-700`}
            variants={animationVariants}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${themeConfig.primary.replace('bg-', 'text-')}`} />
                    <h3 className={`text-lg font-semibold ${themeConfig.text}`}>{title}</h3>
                </div>
                {sectionKey && onToggleVisibility && (
                    <motion.button
                        onClick={onToggleVisibility}
                        className={`p-2 rounded-lg ${themeConfig.background} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
                        whileTap={{ scale: 0.95 }}
                    >
                        {isVisible ? <Eye size={18} className={themeConfig.text} /> : <EyeOff size={18} className={themeConfig.textSecondary} />}
                    </motion.button>
                )}
            </div>
            {isVisible && (
                <div>
                    {children}
                </div>
            )}
        </motion.div>
    );
});

SectionCard.displayName = 'SectionCard';

export function Profile() {
    const { themeConfig } = useTheme();
    const { signOut, user } = useAuth();
    const navigate = useNavigate();
    const [isFlipped, setIsFlipped] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState(() => getStoredUserData(user));
    const [newAchievement, setNewAchievement] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setUserData(getStoredUserData(user));
    }, [user]);

    const handleSave = () => {
        if (!user) return;
        const userDataKey = `userData_${user.uid}`;
        localStorage.setItem(userDataKey, JSON.stringify(userData));
        setIsEditing(false);
    };

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const [section, field] = name.split('.');

        if (section === 'education') {
            setUserData(prev => ({ ...prev, education: { ...prev.education, [field]: value } }));
        } else if (section === 'contact') {
            setUserData(prev => ({
                ...prev,
                contact: {
                    ...(prev.contact || { email: '', phone: '' }),
                    [field]: value
                }
            }));
        } else {
            setUserData(prev => ({ ...prev, [name]: value }));
        }
    }, []);

    const handleAddAchievement = useCallback(() => {
        if (newAchievement.trim()) {
            setUserData(prev => ({ ...prev, achievements: [...prev.achievements, newAchievement.trim()] }));
            setNewAchievement('');
        }
    }, [newAchievement]);

    const handleRemoveAchievement = useCallback((index: number) => {
        setUserData(prev => ({
            ...prev,
            achievements: prev.achievements.filter((_: any, i: number) => i !== index)
        }));
    }, []);

    const toggleSectionVisibility = useCallback((section: keyof typeof userData.sectionVisibility) => {
        setUserData(prev => ({
            ...prev,
            sectionVisibility: {
                ...prev.sectionVisibility,
                [section]: !prev.sectionVisibility[section]
            }
        }));
    }, []);

    const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUserData(prev => ({ ...prev, profilePhoto: event.target?.result as string }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    }, []);

    const animationVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
    };

    return (
        <motion.div
            className={`p-4 sm:p-6 ${themeConfig.background} min-h-screen`}
            variants={animationVariants} initial="initial" animate="animate"
        >
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                    <h1 className={`text-3xl font-bold ${themeConfig.text}`}>My Profile</h1>
                    <div className="flex gap-3">
                        <motion.button
                            onClick={() => navigate('/settings')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${themeConfig.background} hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600`}
                            whileTap={{ scale: 0.95 }}
                            title="Settings"
                        >
                            <Settings size={18} className={themeConfig.text} />
                        </motion.button>
                        <motion.button
                            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${isEditing ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isEditing ? <Save size={18} /> : <Edit size={18} />}
                            {isEditing ? 'Save' : 'Edit'}
                        </motion.button>
                        <motion.button
                            onClick={signOut}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors bg-red-500 text-white hover:bg-red-600`}
                            whileTap={{ scale: 0.95 }}
                        >
                            Sign Out
                        </motion.button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Profile Card */}
                    <motion.div className="lg:col-span-1" variants={animationVariants}>
                        <div className="w-full h-80 [perspective:1000px]" onClick={() => !isEditing && setIsFlipped(!isFlipped)}>
                            <motion.div
                                className="relative w-full h-full text-center [transform-style:preserve-3d] transition-transform duration-700"
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                            >
                                {/* Front Side */}
                                <div className={`absolute w-full h-full p-6 rounded-2xl shadow-lg ${themeConfig.card} border dark:border-gray-700 [backface-visibility:hidden] flex flex-col items-center justify-center`}>
                                    <div className="relative">
                                        <img src={userData.profilePhoto} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 dark:border-blue-800" />
                                        {isEditing && (
                                            <motion.button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <Upload size={16} />
                                            </motion.button>
                                        )}
                                        <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                                    </div>
                                    <input type="text" name="fullName" value={userData.fullName} onChange={handleInputChange} disabled={!isEditing} className={`mt-4 text-2xl font-bold text-center w-full bg-transparent ${themeConfig.text} ${isEditing ? 'border-b-2 border-blue-500' : ''}`} />
                                    <input type="text" name="role" value={userData.role} onChange={handleInputChange} disabled={!isEditing} className={`text-md text-center w-full bg-transparent ${themeConfig.textSecondary} ${isEditing ? 'border-b-2 border-blue-500' : ''}`} />
                                    <p className={`mt-4 text-xs ${themeConfig.textSecondary}`}>{isEditing ? 'Click save to apply' : 'Click to flip for more details'}</p>
                                </div>
                                {/* Back Side */}
                                <div className={`absolute w-full h-full p-6 rounded-2xl shadow-lg ${themeConfig.card} border dark:border-gray-700 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-center`}>
                                    <h3 className={`text-xl font-bold mb-4 ${themeConfig.text} flex items-center gap-2`}><BookOpen size={20} />Education</h3>
                                    <div className="text-left">
                                        <p className={`text-sm ${themeConfig.textSecondary}`}>Institution:</p>
                                        <input type="text" name="education.institution" value={userData.education.institution} onChange={handleInputChange} disabled={!isEditing} className={`font-semibold w-full bg-transparent ${themeConfig.text} ${isEditing ? 'border-b-2 border-blue-500' : ''}`} />
                                        <p className={`text-sm mt-2 ${themeConfig.textSecondary}`}>Grade/Year:</p>
                                        <input type="text" name="education.grade" value={userData.education.grade} onChange={handleInputChange} disabled={!isEditing} className={`font-semibold w-full bg-transparent ${themeConfig.text} ${isEditing ? 'border-b-2 border-blue-500' : ''}`} />
                                    </div>
                                    <p className={`mt-4 text-xs text-center ${themeConfig.textSecondary}`}>{isEditing ? 'Click save to apply' : 'Click to flip back'}</p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Profile Completeness */}
                    <motion.div className={`lg:col-span-2 ${themeConfig.card} p-6 rounded-2xl shadow-lg border dark:border-gray-700`} variants={animationVariants}>
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="text-center">
                                <p className={`font-semibold mb-2 ${themeConfig.textSecondary}`}>Profile Completeness</p>
                                <ProgressCircle progress={userData.profileCompleteness} />
                            </div>
                            <div className="flex-1 w-full">
                                <h4 className={`text-lg font-bold ${themeConfig.text} mb-3`}>Quick Stats</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`p-3 rounded-lg ${themeConfig.background}`}>
                                        <p className={`text-2xl font-bold ${themeConfig.text}`}>{userData.achievements.length}</p>
                                        <p className={`text-sm ${themeConfig.textSecondary}`}>Achievements</p>
                                    </div>
                                    <div className={`p-3 rounded-lg ${themeConfig.background}`}>
                                        <p className={`text-2xl font-bold ${themeConfig.text}`}>
                                            {Object.values(userData.sectionVisibility).filter(v => v).length}
                                        </p>
                                        <p className={`text-sm ${themeConfig.textSecondary}`}>Active Sections</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>


                {/* Contact Information */}
                <SectionCard
                    title="Contact Information"
                    icon={Mail}
                    sectionKey="contact"
                    isVisible={userData.sectionVisibility.contact}
                    onToggleVisibility={() => toggleSectionVisibility('contact')}
                    themeConfig={themeConfig}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={`text-sm ${themeConfig.textSecondary} flex items-center gap-2 mb-2`}>
                                <Mail size={16} /> Email
                            </label>
                            <input
                                type="email"
                                name="contact.email"
                                value={userData.contact?.email || ''}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className={`w-full p-3 rounded-lg ${themeConfig.background} ${themeConfig.text} ${isEditing ? 'border-2 border-blue-500' : 'border border-gray-300 dark:border-gray-600'}`}
                            />
                        </div>
                        <div>
                            <label className={`text-sm ${themeConfig.textSecondary} flex items-center gap-2 mb-2`}>
                                <Phone size={16} /> Phone
                            </label>
                            <input
                                type="tel"
                                name="contact.phone"
                                value={userData.contact?.phone || ''}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className={`w-full p-3 rounded-lg ${themeConfig.background} ${themeConfig.text} ${isEditing ? 'border-2 border-blue-500' : 'border border-gray-300 dark:border-gray-600'}`}
                            />
                        </div>
                    </div>
                </SectionCard>

                {/* About Me */}
                <SectionCard
                    title="About Me"
                    icon={UserIcon}
                    sectionKey="bio"
                    isVisible={userData.sectionVisibility.bio}
                    onToggleVisibility={() => toggleSectionVisibility('bio')}
                    themeConfig={themeConfig}
                >
                    <textarea
                        name="bio"
                        value={userData.bio || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        rows={4}
                        className={`w-full p-3 rounded-lg ${themeConfig.background} ${themeConfig.text} ${isEditing ? 'border-2 border-blue-500' : 'border border-gray-300 dark:border-gray-600'} resize-none`}
                        placeholder="Tell us about yourself..."
                    />
                </SectionCard>

                {/* Achievements */}
                <SectionCard
                    title="Achievements"
                    icon={Award}
                    sectionKey="achievements"
                    isVisible={userData.sectionVisibility.achievements}
                    onToggleVisibility={() => toggleSectionVisibility('achievements')}
                    themeConfig={themeConfig}
                >
                    <div className="space-y-2 mb-4">
                        {userData.achievements.map((achievement, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`flex items-center justify-between gap-2 p-3 rounded-lg ${themeConfig.background}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Award size={16} className="text-yellow-500" />
                                    <span className={themeConfig.text}>{achievement}</span>
                                </div>
                                {isEditing && (
                                    <button
                                        onClick={() => handleRemoveAchievement(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </div>
                    {isEditing && (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newAchievement}
                                onChange={(e) => setNewAchievement(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddAchievement()}
                                placeholder="Add an achievement"
                                className={`flex-grow p-3 rounded-lg ${themeConfig.background} ${themeConfig.text} border-2 border-blue-500`}
                            />
                            <motion.button
                                onClick={handleAddAchievement}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                whileTap={{ scale: 0.95 }}
                            >
                                <Award size={20} />
                            </motion.button>
                        </div>
                    )}
                </SectionCard>
            </div>
        </motion.div>
    );
}