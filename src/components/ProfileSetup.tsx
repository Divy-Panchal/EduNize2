import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, School, GraduationCap, ArrowRight, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileSetupProps {
    onComplete: (data: ProfileData) => void;
}

interface ProfileData {
    fullName: string;
    class: string;
    institution: string;
    phone: string;
}

export function ProfileSetup({ onComplete }: ProfileSetupProps) {
    const [formData, setFormData] = useState<ProfileData>({
        fullName: '',
        class: '',
        institution: '',
        phone: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fullName.trim() || !formData.class.trim() || !formData.institution.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        onComplete(formData);
    };

    const handleSkip = () => {
        // Pass minimal data when skipping
        onComplete({
            fullName: 'User',
            class: 'Not specified',
            institution: 'Not specified',
            phone: '',
        });
        toast.success('Profile setup skipped. You can update your profile anytime!');
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background with layered mountains */}
            <div className="absolute inset-0">
                {/* Sky gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-200 via-blue-100 to-blue-200" />

                {/* Mountain layers */}
                <div className="absolute inset-0">
                    {/* Back mountains */}
                    <div className="absolute bottom-0 w-full h-3/4 bg-gradient-to-t from-blue-300 to-blue-200 opacity-60"
                        style={{
                            clipPath: 'polygon(0% 100%, 0% 60%, 15% 45%, 30% 55%, 45% 40%, 60% 50%, 75% 35%, 90% 45%, 100% 40%, 100% 100%)'
                        }} />

                    {/* Middle mountains */}
                    <div className="absolute bottom-0 w-full h-2/3 bg-gradient-to-t from-blue-400 to-blue-300 opacity-70"
                        style={{
                            clipPath: 'polygon(0% 100%, 0% 70%, 20% 55%, 35% 65%, 50% 50%, 65% 60%, 80% 45%, 95% 55%, 100% 50%, 100% 100%)'
                        }} />

                    {/* Front mountains */}
                    <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-blue-500 to-blue-400 opacity-80"
                        style={{
                            clipPath: 'polygon(0% 100%, 0% 80%, 25% 65%, 40% 75%, 55% 60%, 70% 70%, 85% 55%, 100% 65%, 100% 100%)'
                        }} />
                </div>

                {/* Floating elements */}
                <motion.div
                    animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 left-20 w-8 h-8 bg-white bg-opacity-30 rounded-full"
                />
                <motion.div
                    animate={{ y: [0, -15, 0], x: [0, -8, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute top-32 right-32 w-6 h-6 bg-white bg-opacity-20 rounded-full"
                />
                <motion.div
                    animate={{ y: [0, -25, 0], x: [0, 15, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                    className="absolute top-40 left-1/3 w-4 h-4 bg-white bg-opacity-25 rounded-full"
                />

                {/* Decorative plants/trees */}
                <div className="absolute bottom-0 left-8 w-16 h-32 bg-gradient-to-t from-blue-800 to-blue-600 opacity-40"
                    style={{ clipPath: 'polygon(40% 100%, 45% 20%, 50% 0%, 55% 20%, 60% 100%)' }} />
                <div className="absolute bottom-0 right-12 w-20 h-28 bg-gradient-to-t from-blue-700 to-blue-500 opacity-50"
                    style={{ clipPath: 'polygon(35% 100%, 40% 30%, 45% 10%, 50% 0%, 55% 10%, 60% 30%, 65% 100%)' }} />
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md bg-white bg-opacity-20 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white border-opacity-30"
                >
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            <User className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                            Welcome to EduNize! 👋
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base">
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
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-2">
                                <User size={18} className="text-blue-600" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                                required
                            />
                        </motion.div>

                        {/* Class/Grade */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-2">
                                <GraduationCap size={18} className="text-blue-600" />
                                Class / Year
                            </label>
                            <input
                                type="text"
                                name="class"
                                value={formData.class}
                                onChange={handleInputChange}
                                placeholder="e.g., 10th Grade, 2nd Year, etc."
                                className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                                required
                            />
                        </motion.div>

                        {/* University/School */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-2">
                                <School size={18} className="text-blue-600" />
                                University / School Name
                            </label>
                            <input
                                type="text"
                                name="institution"
                                value={formData.institution}
                                onChange={handleInputChange}
                                placeholder="Enter your institution name"
                                className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                                required
                            />
                        </motion.div>

                        {/* Phone Number (Optional) */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-2">
                                <Phone size={18} className="text-blue-600" />
                                Phone Number <span className="text-xs text-gray-600">(Optional)</span>
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="e.g., +91 98765 43210"
                                className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                            />
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                        >
                            Continue
                            <ArrowRight size={20} />
                        </motion.button>

                        {/* Skip Button */}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.75 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={handleSkip}
                            className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg border border-gray-300"
                        >
                            Skip for now
                        </motion.button>
                    </form>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-center text-xs text-gray-600 mt-6"
                    >
                        You can update this information later in your profile settings
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
}
