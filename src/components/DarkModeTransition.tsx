import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Leaf, Sparkles } from 'lucide-react';

interface DarkModeTransitionProps {
  isTransitioning: boolean;
  transitionTheme: 'default' | 'dark' | 'purple' | 'green';
}

const themeIcons = {
  default: <Sun fill="currentColor" size={48} />,
  dark: <Moon fill="currentColor" size={48} />,
  purple: <Sparkles fill="currentColor" size={48} />,
  green: <Leaf fill="currentColor" size={48} />,
};

const themeColors = {
    default: 'text-yellow-500',
    dark: 'text-white',
    purple: 'text-purple-400',
    green: 'text-green-500',
}

export function DarkModeTransition({ isTransitioning, transitionTheme }: DarkModeTransitionProps) {
  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{}}
          exit={{ opacity: 0, transition: { delay: 1, duration: 0.2 } }}
        >
          <motion.div
            initial={{ scale: 1, rotate: 0 }}
            animate={{
              scale: [1, 1.2, 1, 60],
              rotate: [0, 0, 180, 180],
            }}
            transition={{
              duration: 1.2,
              ease: 'easeInOut',
              times: [0, 0.2, 0.5, 1],
            }}
            className={themeColors[transitionTheme]}
          >
            {themeIcons[transitionTheme]}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
