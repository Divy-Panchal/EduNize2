import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Bell, User, Shield, HelpCircle, LogOut, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function Settings() {
  const { theme, setTheme, themeConfig } = useTheme();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      toast.error('Error signing out');
    }
  };

  const themes = [
    { id: 'default', name: 'Ocean Blue', colors: ['#3B82F6', '#8B5CF6', '#10B981'] },
    { id: 'dark', name: 'Dark Mode', colors: ['#374151', '#4B5563', '#6B7280'] },
    { id: 'purple', name: 'Purple Dream', colors: ['#8B5CF6', '#EC4899', '#F59E0B'] },
    { id: 'green', name: 'Nature', colors: ['#10B981', '#059669', '#047857'] }
  ];

  return (
    <div className="space-y-6">
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
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                theme === themeOption.id 
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
                  className={`w-10 h-6 rounded-full cursor-pointer transition-colors duration-200 flex items-center ${
                    setting.enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
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
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors duration-200 border border-red-200 dark:border-red-800"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </motion.button>
      </motion.div>
    </div>
  );
}