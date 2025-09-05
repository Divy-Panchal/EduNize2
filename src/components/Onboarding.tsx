import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle, GraduationCap, Target, Timer, BarChart3 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface OnboardingProps {
  onComplete: () => void;
}

const onboardingSteps = [
  {
    icon: GraduationCap,
    title: 'Welcome to EduOrganize',
    description: 'Your personal study companion designed to make learning more engaging and effective.',
    illustration: 'https://images.pexels.com/photos/159844/books-school-study-education-159844.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    icon: Target,
    title: 'Manage Your Tasks',
    description: 'Create, organize, and track your assignments with beautiful visual feedback and progress tracking.',
    illustration: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    icon: Timer,
    title: 'Focus with Pomodoro',
    description: 'Use the built-in Pomodoro timer to maintain focus and take productive breaks during study sessions.',
    illustration: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    icon: BarChart3,
    title: 'Track Your Progress',
    description: 'Visualize your academic journey with detailed analytics, grade tracking, and study time insights.',
    illustration: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const { themeConfig } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isLastStep = currentStep === onboardingSteps.length - 1;
  const step = onboardingSteps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center z-50"
    >
      <div className="max-w-4xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-6"
            >
              <step.icon className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-white mb-4"
            >
              {step.title}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-blue-100 mb-8 leading-relaxed"
            >
              {step.description}
            </motion.p>

            {/* Progress Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center lg:justify-start gap-2 mb-8"
            >
              {onboardingSteps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index <= currentStep ? 'bg-white' : 'bg-white bg-opacity-30'
                  }`}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </motion.div>

            {/* Navigation */}
            <div className="flex justify-center lg:justify-start gap-4">
              {currentStep > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={prevStep}
                  className="flex items-center gap-2 px-6 py-3 bg-white bg-opacity-20 text-white rounded-lg font-medium hover:bg-opacity-30 transition-all duration-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-lg"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Illustration */}
          <motion.div
            key={`illustration-${currentStep}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={step.illustration}
                alt={step.title}
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black bg-opacity-20 to-transparent" />
              
              {/* Floating animation elements */}
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-4 right-4 w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg"
              >
                <step.icon className="w-6 h-6 text-blue-600" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}