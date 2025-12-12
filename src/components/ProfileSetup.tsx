import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, School, GraduationCap, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

interface ProfileSetupProps {
    onComplete: (data: ProfileData) => void;
}

interface ProfileData {
    fullName: string;
    class: string;
    institution: string;
}

export function ProfileSetup({ onComplete }: ProfileSetupProps) {
    const { themeConfig } = useTheme();
    const [formData, setFormData] = useState<ProfileData>({
        fullName: '',
        class: '',
        institution: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fullName.trim() || !formData.class.trim() || !formData.institution.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        onComplete(formData);
    };

    return (
        <div className={`min-h-screen ${themeConfig.background} flex items-center justify-center p-4`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`w-full max-w-md ${themeConfig.card} p-8 rounded-2xl shadow-xl border dark:border-gray-700`}
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className={`w-16 h-16 ${themeConfig.primary} rounded-full flex items-center justify-center mx-auto mb-4`}
                    >
                        <User className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className={`text-2xl md:text-3xl font-bold ${themeConfig.text} mb-2`}>
                        Welcome to EduNize! 👋
                    </h1>
                    <p className={`${themeConfig.textSecondary} text-sm md:text-base`}>
                        Let's set up your profile to get started
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <label className={`flex items-center gap-2 text-sm font-medium ${themeConfig.text} mb-2`}>
                            <User size={18} className={themeConfig.primary.replace('bg-', 'text-')} />
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            className={`w-full px-4 py-3 rounded-lg border-2 ${themeConfig.background} ${themeConfig.text} border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none transition-colors`}
                            required
                        />
                    </motion.div>

                    {/* Class/Grade */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <label className={`flex items-center gap-2 text-sm font-medium ${themeConfig.text} mb-2`}>
                            <GraduationCap size={18} className={themeConfig.primary.replace('bg-', 'text-')} />
                            Class / Year
                        </label>
                        <input
                            type="text"
                            name="class"
                            value={formData.class}
                            onChange={handleInputChange}
                            placeholder="e.g., 10th Grade, 2nd Year, etc."
                            className={`w-full px-4 py-3 rounded-lg border-2 ${themeConfig.background} ${themeConfig.text} border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none transition-colors`}
                            required
                        />
                    </motion.div>

                    {/* University/School */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <label className={`flex items-center gap-2 text-sm font-medium ${themeConfig.text} mb-2`}>
                            <School size={18} className={themeConfig.primary.replace('bg-', 'text-')} />
                            University / School Name
                        </label>
                        <input
                            type="text"
                            name="institution"
                            value={formData.institution}
                            onChange={handleInputChange}
                            placeholder="Enter your institution name"
                            className={`w-full px-4 py-3 rounded-lg border-2 ${themeConfig.background} ${themeConfig.text} border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none transition-colors`}
                            required
                        />
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className={`w-full ${themeConfig.primary} hover:opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2`}
                    >
                        Continue
                        <ArrowRight size={20} />
                    </motion.button>
                </form>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className={`text-center text-xs ${themeConfig.textSecondary} mt-6`}
                >
                    You can update this information later in your profile settings
                </motion.p>
            </motion.div>
        </div>
    );
}
