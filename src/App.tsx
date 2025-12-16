import { useState, useEffect } from 'react';
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
import { Calendar } from './pages/Calendar';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import { SubjectProvider } from './context/SubjectContext';
import { TimetableProvider } from './context/TimetableContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Auth } from './components/Auth';
import { DarkModeTransition } from './components/DarkModeTransition';
import { Onboarding } from './components/Onboarding';
import { ProfileSetup } from './components/ProfileSetup';

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
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    // Check if user has completed profile setup
    if (user && !showOnboarding) {
      const hasCompletedProfileSetup = localStorage.getItem(`hasCompletedProfileSetup_${user.uid}`);
      if (!hasCompletedProfileSetup) {
        // New user hasn't completed profile setup
        setShowProfileSetup(true);
      }
    }
  }, [user, showOnboarding]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setShowOnboarding(false);
  };

  const handleProfileSetupComplete = (data: { fullName: string; class: string; institution: string; phone: string }) => {
    if (!user) return;

    // Update userData in localStorage with user-specific key
    const userDataKey = `userData_${user.uid}`;
    const existingData = localStorage.getItem(userDataKey);
    let userData = {};
    try {
      userData = existingData ? JSON.parse(existingData) : {};
    } catch (error) {
      console.error('Failed to parse userData:', error);
      userData = {};
    }

    const updatedData = {
      ...userData,
      fullName: data.fullName,
      role: 'Student',
      education: {
        institution: data.institution,
        grade: data.class,
      },
      contact: {
        email: user.email || '',
        phone: data.phone || '',
      },
    };

    localStorage.setItem(userDataKey, JSON.stringify(updatedData));
    localStorage.setItem(`hasCompletedProfileSetup_${user.uid}`, 'true');
    setShowProfileSetup(false);
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

      <AnimatePresence mode="wait">
        {!showOnboarding && showProfileSetup && (
          <motion.div
            key="profilesetup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProfileSetup onComplete={handleProfileSetupComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      {!showOnboarding && !showProfileSetup && (
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
                className="min-h-screen"
              >
                <Routes location={location} key={location.pathname}>
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
                  <Route path="/calendar" element={<Timetable />} />
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
            <TimetableProvider>
              <Router>
                <Toaster position="top-right" />
                <AppContent />
              </Router>
            </TimetableProvider>
          </SubjectProvider>
        </TaskProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;