import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Target, BookOpen } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from '../context/ThemeContext';

export function Results() {
  const { themeConfig } = useTheme();

  const gradeData = [
    { subject: 'Mathematics', grade: 92, color: '#3B82F6' },
    { subject: 'Physics', grade: 88, color: '#8B5CF6' },
    { subject: 'Chemistry', grade: 85, color: '#10B981' },
    { subject: 'English', grade: 91, color: '#F59E0B' },
    { subject: 'History', grade: 87, color: '#EF4444' },
    { subject: 'Computer Science', grade: 95, color: '#6366F1' }
  ];

  const progressData = [
    { month: 'Sep', grade: 78 },
    { month: 'Oct', grade: 82 },
    { month: 'Nov', grade: 85 },
    { month: 'Dec', grade: 88 },
    { month: 'Jan', grade: 91 }
  ];

  const studyTimeData = [
    { name: 'Mathematics', hours: 45, color: '#3B82F6' },
    { name: 'Physics', hours: 38, color: '#8B5CF6' },
    { name: 'Chemistry', hours: 42, color: '#10B981' },
    { name: 'English', hours: 28, color: '#F59E0B' },
    { name: 'Others', hours: 35, color: '#6B7280' }
  ];

  const overallGrade = gradeData.reduce((sum, item) => sum + item.grade, 0) / gradeData.length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className={`text-2xl md:text-3xl font-bold ${themeConfig.text} mb-2`}>Academic Results</h1>
        <p className={themeConfig.textSecondary}>
          Track your progress and achievements
        </p>
      </motion.div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {[
          { title: 'Overall GPA', value: '3.7', icon: Award, color: 'bg-yellow-500' },
          { title: 'Avg. Grade', value: `${Math.round(overallGrade)}%`, icon: Target, color: 'bg-blue-500' },
          { title: 'Study Hours', value: '188h', icon: BookOpen, color: 'bg-green-500' },
          { title: 'Improvement', value: '+13%', icon: TrendingUp, color: 'bg-purple-500' }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className={`${themeConfig.card} p-3 md:p-6 rounded-xl shadow-sm border border-gray-100`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.color} p-2 md:p-3 rounded-lg`}>
                <stat.icon className="w-4 md:w-6 h-4 md:h-6 text-white" />
              </div>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.2, type: "spring", stiffness: 200 }}
                className={`text-lg md:text-2xl font-bold ${themeConfig.text}`}
              >
                {stat.value}
              </motion.span>
            </div>
            <h3 className={`text-xs md:text-sm font-medium ${themeConfig.textSecondary}`}>
              {stat.title}
            </h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Progress Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border border-gray-100`}
        >
          <h3 className={`text-base md:text-lg font-semibold ${themeConfig.text} mb-4`}>Grade Progress</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="grade" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Subject Grades */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border border-gray-100`}
        >
          <h3 className={`text-base md:text-lg font-semibold ${themeConfig.text} mb-4`}>Subject Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={gradeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="subject" 
                stroke="#6B7280"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="grade" radius={[4, 4, 0, 0]}>
                {gradeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Study Time Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border border-gray-100`}
      >
        <h3 className={`text-base md:text-lg font-semibold ${themeConfig.text} mb-4`}>Study Time Distribution</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={studyTimeData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="hours"
              >
                {studyTimeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="space-y-3">
            {studyTimeData.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={`font-medium ${themeConfig.text} text-sm md:text-base`}>{item.name}</span>
                </div>
                <span className={`font-semibold ${themeConfig.text} text-sm md:text-base`}>{item.hours}h</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}