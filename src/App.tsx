import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { Subjects } from './pages/Subjects';
import { SubjectDetail } from './pages/SubjectDetail';
import { Tasks } from './pages/Tasks';
import { Timetable } from './pages/Timetable';
import { PomodoroTimer } from './pages/PomodoroTimer';
import { Results } from './pages/Results';
import { Settings } from './pages/Settings';
import { Achievements } from './pages/Achievements';
import { Profile } from './pages/Profile';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import { SubjectProvider } from './context/SubjectContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Auth } from './components/Auth';
import { DarkModeTransition } from './components/DarkModeTransition';
import { Onboarding } from './components/Onboarding';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

function AppContent() {
  const { user, loading } = useAuth();
  const { themeConfig, isTransitioning, transitionTheme } = useTheme();
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setShowOnboarding(false);
  };


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
      <AnimatePresence mode="wait">
        {showOnboarding && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Onboarding onComplete={handleOnboardingComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      {!showOnboarding && (
        <div className="md:flex-row">
          <Navigation />
          <main className="flex-1 p-4 md:p-6 pb-28">
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
                  <Route path="/subjects/:id" element={<SubjectDetail />} />
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
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TaskProvider>
          <SubjectProvider>
            <Router>
              <Toaster position="top-right" />
              <AppContent />
            </Router>
          </SubjectProvider>
        </TaskProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;