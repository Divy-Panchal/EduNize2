import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { Subjects } from './pages/Subjects';
import { Tasks } from './pages/Tasks';
import { Timetable } from './pages/Timetable';
import { PomodoroTimer } from './pages/PomodoroTimer';
import { Results } from './pages/Results';
import { Settings } from './pages/Settings';
import { Achievements } from './pages/Achievements';
import { Profile } from './pages/Profile';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Auth } from './components/Auth';
import { DarkModeTransition } from './components/DarkModeTransition';

const pageVariants = {
  initial: {
    opacity: 0,
    x: '100vw',
    scale: 0.95,
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    x: '-100vw',
    scale: 1.05,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

function AppContent() {
  const { user, loading } = useAuth();
  const { themeConfig, isTransitioning, transitionTheme } = useTheme();
  const location = useLocation();

  if (loading) {
    return (
      <div className={`min-h-screen ${themeConfig.background} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={themeConfig.text}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className={`min-h-screen ${themeConfig.background} ${themeConfig.text} transition-colors duration-300`}>
      <DarkModeTransition
        isTransitioning={isTransitioning}
        transitionTheme={transitionTheme}
      />
      <div className="flex flex-col md:flex-row">
        <Navigation />
        <main className="flex-1 md:ml-64 mb-16 md:mb-0 p-4 md:p-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Routes location={location}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/subjects" element={<Subjects />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/timetable" element={<Timetable />} />
                <Route path="/pomodoro" element={<PomodoroTimer />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/results" element={<Results />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TaskProvider>
          <Router>
            <Toaster position="top-right" />
            <AppContent />
          </Router>
        </TaskProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
