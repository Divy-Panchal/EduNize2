import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    fullName: 'Student',
    class: '',
    institution: '', // Top-level institution field
    phone: '',       // Top-level phone field
    email: '',       // Top-level email field
    address: '',
    dateOfBirth: '',
    gender: '',
    profilePhoto: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23e0e0e0"/%3E%3Ccircle cx="50" cy="40" r="18" fill="%23999"/%3E%3Cpath d="M 20 85 Q 20 60 50 60 Q 80 60 80 85 Z" fill="%23999"/%3E%3C/svg%3E',
    education: {
        institution: 'University of Innovation',
        grade: '3rd Year',
    },
    contact: {
        email: 'alex.doe@example.com',
        phone: '+1 234 567 8900',
    },
    bio: '',
    achievements: [],
    sectionVisibility: {
        contact: true,
        bio: true,
        achievements: true,
    },
    profileCompleteness: 0,
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

// Function to calculate profile completeness percentage
const calculateProfileCompleteness = (userData: typeof initialUserData): number => {
    const fields = [
        // Check if full name is filled and not default
        !!(userData.fullName && userData.fullName.trim() !== '' && userData.fullName !== 'Student'),

        // Check if email is filled (usually auto-filled from Firebase)
        !!(userData.contact?.email && userData.contact.email.trim() !== '' && userData.contact.email !== 'alex.doe@example.com'),

        // Check if phone is filled
        !!(userData.contact?.phone && userData.contact.phone.trim() !== '' && userData.contact.phone !== '+1 234 567 8900'),

        // Check if institution is filled
        !!(userData.education?.institution && userData.education.institution.trim() !== '' && userData.education.institution !== 'University of Innovation'),

        // Check if grade is filled
        !!(userData.education?.grade && userData.education.grade.trim() !== '' && userData.education.grade !== '3rd Year'),

        // Check if bio is filled
        !!(userData.bio && userData.bio.trim() !== ''),

        // Check if at least one achievement exists
        !!(userData.achievements && userData.achievements.length > 0),

        // Check if custom profile photo is uploaded
        !!(userData.profilePhoto && userData.profilePhoto !== initialUserData.profilePhoto),
    ];

    const filledFields = fields.filter(field => field === true).length;
    const totalFields = fields.length;

    return Math.round((filledFields / totalFields) * 100);
};


const ProgressCircle = ({ progress }: { progress: number }) => {
    const { themeConfig } = useTheme();
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    strokeWidth="10"
                    className="stroke-gray-200 dark:stroke-gray-700"
                    fill="transparent"
                />
                {/* Progress circle */}
                <motion.circle
                    cx="60"
                    cy="60"
                    r={radius}
                    strokeWidth="10"
                    className="stroke-blue-500"
                    fill="transparent"
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>
            <motion.div
                className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${themeConfig.text}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
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
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isFlipped, setIsFlipped] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showPhotoZoom, setShowPhotoZoom] = useState(false);
    const [userData, setUserData] = useState(() => getStoredUserData(user));
    const [newAchievement, setNewAchievement] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Achievement state
    const [achievements, setAchievements] = useState(() => {
        if (!user) return [];
        const saved = localStorage.getItem(`achievements_${user.uid}`);
        return saved ? JSON.parse(saved) : [
            { id: 'early_bird', name: 'Early Bird', icon: '🌅', description: 'Study before 8 AM', unlocked: false, claimed: false, progress: 0, maxProgress: 1 },
            { id: 'night_owl', name: 'Night Owl', icon: '🦉', description: 'Study after 10 PM', unlocked: false, claimed: false, progress: 0, maxProgress: 1 },
            { id: 'streak_master', name: 'Streak Master', icon: '🔥', description: '7 day study streak', unlocked: false, claimed: false, progress: 0, maxProgress: 7 },
            { id: 'task_crusher', name: 'Task Crusher', icon: '✅', description: 'Complete 50 tasks', unlocked: false, claimed: false, progress: 0, maxProgress: 50 },
        ];
    });

    useEffect(() => {
        setUserData(getStoredUserData(user));
        // Check achievements on mount
        if (user) {
            checkAchievements();
        }
    }, [user]);

    // Recalculate profile completeness when userData changes
    useEffect(() => {
        const newCompleteness = calculateProfileCompleteness(userData);
        if (newCompleteness !== userData.profileCompleteness) {
            setUserData(prev => ({ ...prev, profileCompleteness: newCompleteness }));
        }
    }, [userData.fullName, userData.contact, userData.education, userData.bio, userData.achievements, userData.profilePhoto]);

    const handleSave = () => {
        if (!user) return;
        const userDataKey = `userData_${user.uid}`;
        // Calculate profile completeness before saving
        const updatedData = {
            ...userData,
            profileCompleteness: calculateProfileCompleteness(userData)
        };
        localStorage.setItem(userDataKey, JSON.stringify(updatedData));
        setUserData(updatedData);
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

    const handleRemovePhoto = useCallback(() => {
        // Reset to default profile photo
        const defaultPhoto = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23e0e0e0"/%3E%3Ccircle cx="50" cy="40" r="18" fill="%23999"/%3E%3Cpath d="M 20 85 Q 20 60 50 60 Q 80 60 80 85 Z" fill="%23999"/%3E%3C/svg%3E';
        setUserData(prev => ({ ...prev, profilePhoto: defaultPhoto }));
    }, []);

    // Check and update achievements
    const checkAchievements = useCallback(() => {
        if (!user) return;

        const now = new Date();
        const hour = now.getHours();

        // Get stats from localStorage
        const completedTasks = parseInt(localStorage.getItem(`completedTasksCount_${user.uid}`) || '0');
        const studyStreak = parseInt(localStorage.getItem(`studyStreak_${user.uid}`) || '0');

        setAchievements((prev: any) => {
            const updated = [...prev];
            let hasChanges = false;

            // Early Bird - Study before 8 AM
            if (hour < 8) {
                const earlyBird = updated.find((a: any) => a.id === 'early_bird');
                if (earlyBird && !earlyBird.unlocked) {
                    earlyBird.progress = 1;
                    earlyBird.unlocked = true;
                    hasChanges = true;
                }
            }

            // Night Owl - Study after 10 PM
            if (hour >= 22) {
                const nightOwl = updated.find((a: any) => a.id === 'night_owl');
                if (nightOwl && !nightOwl.unlocked) {
                    nightOwl.progress = 1;
                    nightOwl.unlocked = true;
                    hasChanges = true;
                }
            }

            // Streak Master - 7 day streak
            const streakMaster = updated.find((a: any) => a.id === 'streak_master');
            if (streakMaster) {
                streakMaster.progress = Math.min(studyStreak, 7);
                if (studyStreak >= 7 && !streakMaster.unlocked) {
                    streakMaster.unlocked = true;
                    hasChanges = true;
                }
            }

            // Task Crusher - Complete 50 tasks
            const taskCrusher = updated.find((a: any) => a.id === 'task_crusher');
            if (taskCrusher) {
                taskCrusher.progress = Math.min(completedTasks, 50);
                if (completedTasks >= 50 && !taskCrusher.unlocked) {
                    taskCrusher.unlocked = true;
                    hasChanges = true;
                }
            }

            if (hasChanges) {
                localStorage.setItem(`achievements_${user.uid}`, JSON.stringify(updated));
            }
            return hasChanges ? updated : prev;
        });
    }, [user]);

    // Claim achievement
    const claimAchievement = useCallback((achievementId: string) => {
        if (!user) return;

        setAchievements((prev: any) => {
            const updated = prev.map((a: any) =>
                a.id === achievementId && a.unlocked && !a.claimed
                    ? { ...a, claimed: true }
                    : a
            );
            localStorage.setItem(`achievements_${user.uid}`, JSON.stringify(updated));
            return updated;
        });
    }, [user]);

    const animationVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
    };

    return (
        <motion.div
            className={`p-4 sm:p-6 pb-4 md:pb-28 ${themeConfig.background} min-h-screen`}
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
                                        <img
                                            src={userData.profilePhoto}
                                            alt="Profile"
                                            className={`w-32 h-32 rounded-full object-cover border-4 border-blue-200 dark:border-blue-800 ${!isEditing ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
                                            onClick={(e) => {
                                                if (!isEditing) {
                                                    e.stopPropagation();
                                                    setShowPhotoZoom(true);
                                                }
                                            }}
                                        />
                                        {isEditing && (
                                            <>
                                                <motion.button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                                                    whileTap={{ scale: 0.9 }}
                                                    title="Upload Photo"
                                                >
                                                    <Upload size={16} />
                                                </motion.button>
                                                {userData.profilePhoto !== initialUserData.profilePhoto && (
                                                    <motion.button
                                                        onClick={handleRemovePhoto}
                                                        className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                                        whileTap={{ scale: 0.9 }}
                                                        title="Remove Photo"
                                                    >
                                                        <X size={16} />
                                                    </motion.button>
                                                )}
                                            </>
                                        )}
                                        <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                                    </div>
                                    <input type="text" name="fullName" value={userData.fullName} onChange={handleInputChange} disabled={!isEditing} className={`mt-4 text-2xl font-bold text-center w-full bg-transparent ${themeConfig.text} ${isEditing ? 'border-b-2 border-blue-500' : ''}`} />
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
                                    <div className="p-3 rounded-lg bg-transparent border border-gray-200 dark:border-gray-700">
                                        <p className={`text-2xl font-bold ${themeConfig.text}`}>{userData.achievements.length}</p>
                                        <p className={`text-sm ${themeConfig.textSecondary}`}>Achievements</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-transparent border border-gray-200 dark:border-gray-700">
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
                                className={`w-full p-3 rounded-lg bg-transparent ${themeConfig.text} ${isEditing ? 'border-2 border-blue-500' : 'border border-gray-300 dark:border-gray-600'}`}
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
                                className={`w-full p-3 rounded-lg bg-transparent ${themeConfig.text} ${isEditing ? 'border-2 border-blue-500' : 'border border-gray-300 dark:border-gray-600'}`}
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

                {/* Achievements & Badges */}
                <SectionCard
                    title="Achievements & Badges 🏆"
                    icon={Award}
                    sectionKey="badges"
                    isVisible={true}
                    onToggleVisibility={() => { }}
                    themeConfig={themeConfig}
                >
                    <div className="space-y-3">
                        {achievements.map((achievement: any, index: number) => {
                            const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;

                            return (
                                <motion.div
                                    key={achievement.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`p-4 rounded-xl border-2 ${achievement.claimed
                                        ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-400 dark:border-yellow-600'
                                        : achievement.unlocked
                                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-400 dark:border-blue-600'
                                            : `${themeConfig.background} border-gray-300 dark:border-gray-600 opacity-60`
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-4xl">{achievement.icon}</span>
                                            <div>
                                                <h4 className={`font-bold ${themeConfig.text}`}>
                                                    {achievement.name}
                                                    {achievement.claimed && <span className="ml-2 text-yellow-500">✓</span>}
                                                </h4>
                                                <p className={`text-sm ${themeConfig.textSecondary}`}>
                                                    {achievement.description}
                                                </p>
                                            </div>
                                        </div>
                                        {achievement.unlocked && !achievement.claimed && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => claimAchievement(achievement.id)}
                                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium text-sm"
                                            >
                                                Claim
                                            </motion.button>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className={themeConfig.textSecondary}>Progress</span>
                                            <span className={`font-semibold ${achievement.unlocked ? 'text-green-600 dark:text-green-400' : themeConfig.textSecondary}`}>
                                                {achievement.progress}/{achievement.maxProgress}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <motion.div
                                                className={`h-2 rounded-full ${achievement.claimed
                                                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                                                    : achievement.unlocked
                                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                                                        : 'bg-gray-400 dark:bg-gray-600'
                                                    }`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressPercentage}%` }}
                                                transition={{ duration: 1, delay: index * 0.1 }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                    <div className={`mt-4 p-3 rounded-lg ${themeConfig.background} text-center`}>
                        <p className={`text-sm ${themeConfig.textSecondary}`}>
                            {achievements.filter((a: any) => a.claimed).length} / {achievements.length} Claimed
                        </p>
                    </div>
                </SectionCard>
            </div>

            {/* Photo Zoom Modal */}
            <AnimatePresence>
                {showPhotoZoom && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowPhotoZoom(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: "spring", damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-w-4xl max-h-[90vh] w-full"
                        >
                            <img
                                src={userData.profilePhoto}
                                alt="Profile Zoomed"
                                className="w-full h-full object-contain rounded-2xl shadow-2xl"
                            />
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowPhotoZoom(false)}
                                className="absolute top-4 right-4 bg-red-500 text-white p-3 rounded-full hover:bg-red-600 shadow-lg"
                            >
                                <X size={24} />
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}