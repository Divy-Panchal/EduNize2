import React from 'react';
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
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTask } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { useTimetable } from '../context/TimetableContext';
import { useGrade } from '../context/GradeContext';
import { DashboardProfile } from '../components/DashboardProfile';

export function Dashboard() {
  const { tasks } = useTask();
  const { themeConfig } = useTheme();
  const { getTodayClasses } = useTimetable();
  const { getGradeStats } = useGrade();

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

  const todayClasses = getTodayClasses();

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
        className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border dark:border-gray-700`}
      >
        <h2 className={`text-base md:text-lg font-semibold ${themeConfig.text} mb-4`}>Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Subjects', path: '/subjects' },
            { icon: Brain, label: 'Start Timer', path: '/pomodoro' },
            { icon: TrendingUp, label: 'Grades', path: '/grades' },
            { icon: Zap, label: 'Add Task', path: '/tasks' }
          ].map((action) => (
            <Link
              key={action.label}
              to={action.path}
              className="block"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center gap-2 p-4 ${themeConfig.background} rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
              >
                <action.icon className={`w-6 h-6 ${themeConfig.primary.replace('bg-', 'text-')}`} />
                <span className={`text-sm font-medium ${themeConfig.text} text-center`}>
                  {action.label}
                </span>
              </motion.div>
            </Link>
          ))}
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
            className={`${themeConfig.card} p-3 md:p-6 rounded-xl shadow-sm border dark:border-gray-700`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-2 md:p-3 rounded-lg`}>
                <stat.icon className="w-4 md:w-6 h-4 md:h-6 text-white" />
              </div>
              <span className={`text-lg md:text-2xl font-bold ${themeConfig.text}`}>
                {stat.value}
              </span>
            </div>
            <h3 className={`text-xs md:text-sm font-medium ${themeConfig.textSecondary} mb-2`}>
              {stat.title}
            </h3>
            <div className={`w-full ${themeConfig.background} rounded-full h-2`}>
              <motion.div
                className={`h-2 ${stat.color} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${stat.progress}%` }}
                transition={{ duration: 1, delay: index * 0.2 }}
              />
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
              <p className={`text-sm ${themeConfig.textSecondary}`}>No classes scheduled for today</p>
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
              <p className={`text-xs md:text-sm ${themeConfig.textSecondary}`}>No upcoming tasks</p>
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
    </div>
  );
}
