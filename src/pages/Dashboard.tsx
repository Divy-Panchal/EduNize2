import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Target,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle2,
  Users,
  Brain,
  Zap,
  TrendingUp,
  Plus,
  Sparkles,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTask } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { useTimetable } from '../context/TimetableContext';
import { useGrade } from '../context/GradeContext';
import { DashboardProfile } from '../components/DashboardProfile';
import { format, startOfWeek, addDays } from 'date-fns';

export function Dashboard() {
  const { tasks } = useTask();
  const { theme, themeConfig } = useTheme();
  const { getTodayClasses, addClass } = useTimetable();
  const { getGradeStats } = useGrade();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClass, setNewClass] = useState({
    subject: '',
    type: '',
    day: 0,
    time: '09:00',
    duration: 1,
    color: 'bg-blue-500'
  });

  const gradeStats = getGradeStats();
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const stats = [
    {
      title: 'Tasks Completed',
      value: `${completedTasks}/${totalTasks}`,
      icon: CheckCircle2,
      color: 'bg-green-500',
      progress: completionRate
    },
    {
      title: 'Study Hours',
      value: '24.5h',
      icon: BookOpen,
      color: 'bg-blue-500',
      progress: 82
    },
    {
      title: 'Focus Sessions',
      value: '18',
      icon: Target,
      color: 'bg-purple-500',
      progress: 90
    },
    {
      title: 'Average Grade',
      value: gradeStats.overallPercentage > 0 ? `${Math.round(gradeStats.overallPercentage)}%` : 'N/A',
      icon: Award,
      color: 'bg-orange-500',
      progress: gradeStats.overallPercentage || 0
    }
  ];

  const upcomingTasks = React.useMemo(() => {
    return tasks
      .filter(task => !task.completed)
      .sort((a, b) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        if (isNaN(dateA)) return 1; // move invalid dates to end
        if (isNaN(dateB)) return -1;
        return dateA - dateB;
      })
      .slice(0, 3);
  }, [tasks]);

  const { classes } = useTimetable();
  const todayClasses = React.useMemo(() => getTodayClasses(), [classes, getTodayClasses]);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const colorOptions = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
    'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
  ];

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.subject || !newClass.type) return;

    addClass(newClass);
    setNewClass({
      subject: '',
      type: '',
      day: 0,
      time: '09:00',
      duration: 1,
      color: 'bg-blue-500'
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <motion.div
        className="flex justify-between items-start"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className={`text-2xl md:text-3xl font-bold ${themeConfig.text} mb-2`}>
            Welcome back! 👋
          </h1>
          <p className={themeConfig.textSecondary}>
            Here's what's happening with your studies today
          </p>
        </div>
        <DashboardProfile />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`${themeConfig.card} p-6 rounded-xl shadow-sm border dark:border-gray-700`}
      >
        <h2 className={`text-base md:text-lg font-semibold ${themeConfig.text} mb-4`}>Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Users,
              label: 'Subjects',
              path: '/subjects',
              lightBg: 'bg-blue-50',
              darkBg: 'bg-blue-900',
              lightIcon: 'text-blue-600',
              darkIcon: 'text-blue-200',
              lightHover: 'hover:bg-blue-100',
              darkHover: 'hover:bg-blue-800'
            },
            {
              icon: Brain,
              label: 'Start Timer',
              path: '/pomodoro',
              lightBg: 'bg-purple-50',
              darkBg: 'bg-purple-900',
              lightIcon: 'text-purple-600',
              darkIcon: 'text-purple-200',
              lightHover: 'hover:bg-purple-100',
              darkHover: 'hover:bg-purple-800'
            },
            {
              icon: TrendingUp,
              label: 'Grades',
              path: '/grades',
              lightBg: 'bg-green-50',
              darkBg: 'bg-green-900',
              lightIcon: 'text-green-600',
              darkIcon: 'text-green-200',
              lightHover: 'hover:bg-green-100',
              darkHover: 'hover:bg-green-800'
            },
            {
              icon: Zap,
              label: 'Add Task',
              path: '/tasks',
              lightBg: 'bg-orange-50',
              darkBg: 'bg-orange-900',
              lightIcon: 'text-orange-600',
              darkIcon: 'text-orange-200',
              lightHover: 'hover:bg-orange-100',
              darkHover: 'hover:bg-orange-800'
            }
          ].map((action) => {
            const isDark = theme === 'dark';
            const bgColor = isDark ? action.darkBg : action.lightBg;
            const iconColor = isDark ? action.darkIcon : action.lightIcon;
            const hoverBg = isDark ? action.darkHover : action.lightHover;

            return (
              <Link
                key={action.label}
                to={action.path}
                className="block"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center gap-3 p-4 ${bgColor} ${hoverBg} rounded-xl transition-all duration-200 shadow-sm`}
                >
                  <div className={`p-2 rounded-lg ${iconColor}`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <span className={`text-sm font-medium ${themeConfig.text} text-center`}>
                    {action.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className={`${themeConfig.card} p-6 rounded-xl shadow-sm border dark:border-gray-700`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className={`text-2xl font-bold ${themeConfig.text}`}>
                {stat.value}
              </span>
            </div>
            <h3 className={`text-sm font-medium ${themeConfig.textSecondary} mb-3`}>
              {stat.title}
            </h3>
            <div className="flex items-center gap-2">
              <div className={`flex-1 ${themeConfig.background} rounded-full h-2.5`}>
                <motion.div
                  className={`h-2.5 ${stat.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.progress}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                />
              </div>
              <span className={`text-xs font-semibold ${themeConfig.textSecondary} min-w-[2.5rem] text-right`}>
                {Math.round(stat.progress)}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`lg:col-span-2 ${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border dark:border-gray-700`}
        >
          <div className="flex items-center gap-3 mb-4">
            <Calendar className={`w-5 h-5 ${themeConfig.primary.replace('bg-', 'text-')}`} />
            <h2 className={`text-base md:text-lg font-semibold ${themeConfig.text}`}>Today's Schedule</h2>
          </div>

          <div className="space-y-3">
            {todayClasses.length === 0 ? (
              <div className="relative text-center py-12 px-6">
                {/* Glassmorphism background */}
                <div className={`absolute inset-0 rounded-xl border ${theme === 'dark'
                  ? 'bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border-gray-700/50'
                  : 'bg-gradient-to-br from-blue-50/50 to-purple-50/50 backdrop-blur-sm border-gray-200/50'
                  }`} />

                {/* Content */}
                <div className="relative z-10">
                  {/* 3D Coffee Cup Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="mb-6"
                  >
                    <div className="relative inline-block">
                      {/* Glow effect */}
                      <div className={`absolute inset-0 ${themeConfig.primary.replace('bg-', 'bg-')} opacity-20 blur-2xl rounded-full`} />
                      {/* Coffee cup SVG */}
                      <svg className="w-20 h-20 mx-auto relative" viewBox="0 0 64 64" fill="none">
                        <path d="M12 20h36v24c0 6.627-5.373 12-12 12h-12c-6.627 0-12-5.373-12-12V20z"
                          className={themeConfig.primary.replace('bg-', 'fill-')} opacity="0.2" />
                        <path d="M12 20h36v24c0 6.627-5.373 12-12 12h-12c-6.627 0-12-5.373-12-12V20z"
                          className={themeConfig.primary.replace('bg-', 'stroke-')} strokeWidth="2" fill="none" />
                        <path d="M48 28h4c2.21 0 4 1.79 4 4s-1.79 4-4 4h-4"
                          className={themeConfig.primary.replace('bg-', 'stroke-')} strokeWidth="2" fill="none" />
                        <path d="M16 16c0-2 2-4 4-4h20c2 0 4 2 4 4"
                          className={themeConfig.primary.replace('bg-', 'stroke-')} strokeWidth="2" strokeLinecap="round" />
                        {/* Steam */}
                        <motion.path
                          d="M24 12c0-2 1-4 2-4"
                          className={themeConfig.primary.replace('bg-', 'stroke-')}
                          strokeWidth="2"
                          strokeLinecap="round"
                          animate={{ opacity: [0.3, 0.7, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.path
                          d="M32 10c0-2 1-4 2-4"
                          className={themeConfig.primary.replace('bg-', 'stroke-')}
                          strokeWidth="2"
                          strokeLinecap="round"
                          animate={{ opacity: [0.5, 0.9, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                        />
                        <motion.path
                          d="M40 12c0-2 1-4 2-4"
                          className={themeConfig.primary.replace('bg-', 'stroke-')}
                          strokeWidth="2"
                          strokeLinecap="round"
                          animate={{ opacity: [0.4, 0.8, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                        />
                      </svg>
                    </div>
                  </motion.div>

                  {/* Main heading */}
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`text-xl font-bold ${themeConfig.text} mb-2`}
                  >
                    All Clear for Today! ✨
                  </motion.h3>

                  {/* Sub-text */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`text-sm ${themeConfig.textSecondary} max-w-md mx-auto`}
                  >
                    No classes scheduled. It's a perfect time to crush your personal goals.
                  </motion.p>
                </div>
              </div>
            ) : (
              todayClasses.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`flex items-center gap-3 md:gap-4 p-3 ${themeConfig.background} rounded-lg`}
                >
                  <div className={`text-xs md:text-sm font-medium ${themeConfig.textSecondary} w-10 md:w-12`}>
                    {item.time}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-medium ${themeConfig.text} text-sm md:text-base`}>{item.subject}</h3>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${item.color}`}>
                      {item.type}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border dark:border-gray-700`}
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className={`w-5 h-5 ${themeConfig.secondary.replace('bg-', 'text-')}`} />
            <h2 className={`text-base md:text-lg font-semibold ${themeConfig.text}`}>Upcoming Tasks</h2>
          </div>

          <div className="space-y-3">
            {upcomingTasks.length === 0 ? (
              <div className="text-center py-8">
                <Sparkles className={`w-12 h-12 mx-auto mb-3 ${themeConfig.primary.replace('bg-', 'text-')} opacity-70`} />
                <p className={`text-sm font-semibold ${themeConfig.text} mb-1`}>You're all caught up! 🎉</p>
                <p className={`text-xs ${themeConfig.textSecondary}`}>No pending tasks at the moment</p>
              </div>
            ) : (
              upcomingTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`p-3 ${themeConfig.background} rounded-lg`}
                >
                  <h3 className={`font-medium ${themeConfig.text} text-xs md:text-sm mb-1`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${themeConfig.textSecondary}`}>
                      {task.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                      {task.priority}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Add Class Modal */}
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg md:text-xl font-semibold ${themeConfig.text}`}>Add New Class</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <X className={`w-5 h-5 ${themeConfig.textSecondary}`} />
              </button>
            </div>

            <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                  Subject *
                </label>
                <input
                  type="text"
                  value={newClass.subject}
                  onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base ${themeConfig.background} ${themeConfig.text} dark:border-gray-600`}
                  placeholder="e.g., Mathematics"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                  Type *
                </label>
                <input
                  type="text"
                  value={newClass.type}
                  onChange={(e) => setNewClass({ ...newClass, type: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base ${themeConfig.background} ${themeConfig.text} dark:border-gray-600`}
                  placeholder="e.g., Lecture, Lab, Tutorial"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                    Day
                  </label>
                  <select
                    value={newClass.day}
                    onChange={(e) => setNewClass({ ...newClass, day: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base ${themeConfig.background} ${themeConfig.text} dark:border-gray-600`}
                  >
                    {weekDays.map((day, index) => (
                      <option key={index} value={index} className="text-gray-900 bg-white">
                        {format(day, 'EEEE')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                    Time
                  </label>
                  <select
                    value={newClass.time}
                    onChange={(e) => setNewClass({ ...newClass, time: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base ${themeConfig.background} ${themeConfig.text} dark:border-gray-600`}
                  >
                    {timeSlots.map(time => (
                      <option key={time} value={time} className="text-gray-900 bg-white">{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                  Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewClass({ ...newClass, color })}
                      className={`w-8 h-8 ${color} rounded-lg border-2 ${newClass.color === color ? 'border-gray-800 dark:border-gray-200' : 'border-gray-200 dark:border-gray-600'
                        } transition-all duration-200`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className={`flex-1 ${themeConfig.primary} ${themeConfig.primaryHover} text-white py-2 md:py-3 rounded-lg font-medium transition-colors duration-200 text-sm md:text-base`}
                >
                  Add Class
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`${themeConfig.card} px-4 md:px-6 py-2 md:py-3 border dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-sm md:text-base`}
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
