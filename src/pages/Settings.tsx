import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Bell, User, Shield, HelpCircle, LogOut, Download, Trash2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function Settings() {
  const { theme, setTheme, themeConfig } = useTheme();
  const { signOut, deleteAccount, user } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      toast.error('Error signing out');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast.error('Please enter your password to confirm deletion');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount(deletePassword);
      setShowDeleteModal(false);
      setDeletePassword('');
      setShowPassword(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setDeletePassword('');
    setShowPassword(false);
    setIsDeleting(false);
  };

  const themes = [
    { id: 'default', name: 'Ocean Blue', colors: ['#3B82F6', '#8B5CF6', '#10B981'] },
    { id: 'dark', name: 'Dark Mode', colors: ['#374151', '#4B5563', '#6B7280'] },
    { id: 'purple', name: 'Purple Dream', colors: ['#8B5CF6', '#EC4899', '#F59E0B'] },
    { id: 'green', name: 'Nature', colors: ['#10B981', '#059669', '#047857'] }
  ];

  return (
    <div className="space-y-6 pb-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={`text-2xl md:text-3xl font-bold ${themeConfig.text} mb-2`}>Settings</h1>
        <p className={themeConfig.textSecondary}>
          Customize your EduOrganize experience
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border dark:border-gray-700`}
      >
        <div className="flex items-center gap-3 mb-6">
          <Palette className={`w-6 h-6 ${themeConfig.primary.replace('bg-', 'text-')}`} />
          <h2 className={`text-lg md:text-xl font-semibold ${themeConfig.text}`}>Theme</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themes.map((themeOption, index) => (
            <motion.div
              key={themeOption.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTheme(themeOption.id as any)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${theme === themeOption.id
                ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/50'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex gap-1">
                  {themeOption.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className={`font-medium ${themeConfig.text} text-sm md:text-base`}>
                  {themeOption.name}
                </span>
              </div>
              {theme === themeOption.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-blue-600 dark:text-blue-400 font-medium"
                >
                  ✓ Currently active
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border dark:border-gray-700`}
        >
          <div className="flex items-center gap-3 mb-4">
            <Bell className={`w-5 h-5 ${themeConfig.secondary.replace('bg-', 'text-')}`} />
            <h3 className={`text-base md:text-lg font-semibold ${themeConfig.text}`}>Notifications</h3>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Task Reminders', enabled: true },
              { label: 'Pomodoro Breaks', enabled: true },
              { label: 'Weekly Progress', enabled: false },
              { label: 'Achievement Unlocked', enabled: true }
            ].map((setting) => (
              <div key={setting.label} className="flex items-center justify-between">
                <span className={`text-xs md:text-sm ${themeConfig.text}`}>{setting.label}</span>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={`w-10 h-6 rounded-full cursor-pointer transition-colors duration-200 flex items-center ${setting.enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                >
                  <motion.div
                    className="w-4 h-4 bg-white rounded-full ml-1"
                    animate={{ x: setting.enabled ? 16 : 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border dark:border-gray-700`}
        >
          <div className="flex items-center gap-3 mb-4">
            <User className={`w-5 h-5 ${themeConfig.accent.replace('bg-', 'text-')}`} />
            <h3 className={`text-base md:text-lg font-semibold ${themeConfig.text}`}>Profile</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-xs md:text-sm font-medium ${themeConfig.text} mb-2`}>
                Display Name
              </label>
              <input
                type="text"
                defaultValue={user?.email?.split('@')[0] || 'Student'}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base ${themeConfig.background} ${themeConfig.text} dark:border-gray-600`}
              />
            </div>
            <div>
              <label className={`block text-xs md:text-sm font-medium ${themeConfig.text} mb-2`}>
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className={`w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm md:text-base ${themeConfig.card} ${themeConfig.textSecondary}`}
              />
            </div>
            <div>
              <label className={`block text-xs md:text-sm font-medium ${themeConfig.text} mb-2`}>
                Study Goal (hours/day)
              </label>
              <input
                type="number"
                defaultValue="6"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base ${themeConfig.background} ${themeConfig.text} dark:border-gray-600`}
              />
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border dark:border-gray-700`}
      >
        <h3 className={`text-base md:text-lg font-semibold ${themeConfig.text} mb-4`}>More Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Shield, label: 'Privacy & Security', desc: 'Manage your data and privacy settings' },
            { icon: HelpCircle, label: 'Help & Support', desc: 'Get help and contact support' },
            { icon: Download, label: 'Export Data', desc: 'Download your study data and progress' },
          ].map((option) => (
            <motion.div
              key={option.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-200 ${themeConfig.background}`}
            >
              <option.icon className={`w-6 h-6 ${themeConfig.primary.replace('bg-', 'text-')} mb-3`} />
              <h4 className={`font-medium ${themeConfig.text} mb-1 text-sm md:text-base`}>{option.label}</h4>
              <p className={`text-xs md:text-sm ${themeConfig.textSecondary}`}>{option.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border dark:border-gray-700`}
      >
        <h3 className={`text-base md:text-lg font-semibold ${themeConfig.text} mb-4`}>Account</h3>
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors duration-200 border border-red-200 dark:border-red-800"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/70 rounded-lg transition-colors duration-200 border-2 border-red-300 dark:border-red-700"
          >
            <Trash2 className="w-5 h-5" />
            <span className="font-medium">Delete Account</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`${themeConfig.card} rounded-2xl p-6 max-w-md w-full shadow-2xl border-2 border-red-500 dark:border-red-600`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h2 className={`text-xl font-bold ${themeConfig.text}`}>
                  Delete Account?
                </h2>
              </div>

              <div className="space-y-3 mb-6">
                <p className={`${themeConfig.text} text-sm`}>
                  Are you sure you want to delete your account? This action is <strong>permanent and cannot be undone</strong>.
                </p>
                <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3`}>
                  <p className="text-red-700 dark:text-red-400 text-xs font-medium">
                    ⚠️ All your data will be permanently deleted:
                  </p>
                  <ul className="text-red-600 dark:text-red-400 text-xs mt-2 ml-4 list-disc space-y-1">
                    <li>Subjects and study materials</li>
                    <li>Tasks and schedules</li>
                    <li>Progress and achievements</li>
                    <li>All personal settings</li>
                  </ul>
                </div>
              </div>

              <div className="mb-6">
                <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                  Enter your password to confirm
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={isDeleting}
                    className={`w-full px-4 py-3 pr-12 rounded-lg border-2 ${themeConfig.background} ${themeConfig.text} ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-2 focus:ring-red-500'} transition-all`}
                    onKeyPress={(e) => e.key === 'Enter' && !isDeleting && handleDeleteAccount()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isDeleting}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${themeConfig.textSecondary} hover:${themeConfig.text} transition-colors ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={handleCloseModal}
                  disabled={isDeleting}
                  whileHover={{ scale: isDeleting ? 1 : 1.05 }}
                  whileTap={{ scale: isDeleting ? 1 : 0.95 }}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold ${themeConfig.background} ${themeConfig.text} border-2 ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  whileHover={{ scale: isDeleting ? 1 : 1.05 }}
                  whileTap={{ scale: isDeleting ? 1 : 0.95 }}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${isDeleting ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete Forever'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}