import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { Onboarding } from './components/Onboarding';
import { Achievements } from './pages/Achievements';
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Auth } from './components/Auth';

function AppContent() {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      const hasSeenOnboarding = localStorage.getItem('eduorganize-onboarding');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('eduorganize-onboarding', 'true');
    setShowOnboarding(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 transition-colors duration-300">
      <AnimatePresence>
        {showOnboarding && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      {!showOnboarding && (
        <div className="flex flex-col md:flex-row">
          <Navigation />
          <main className="flex-1 md:ml-64 mb-16 md:mb-0 p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/subjects" element={<Subjects />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/timetable" element={<Timetable />} />
                <Route path="/pomodoro" element={<PomodoroTimer />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/results" element={<Results />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </motion.div>
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