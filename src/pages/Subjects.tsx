import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useSubject } from '../context/SubjectContext';

export function Subjects() {
  const { themeConfig } = useTheme();
  const { subjects, addSubject, deleteSubject } = useSubject();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-green-500 to-green-600',
    'from-pink-500 to-pink-600',
    'from-orange-500 to-orange-600',
    'from-red-500 to-red-600',
    'from-indigo-500 to-indigo-600',
    'from-teal-500 to-teal-600',
  ];

  const handleAddSubject = () => {
    if (newSubjectName.trim()) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      addSubject({
        name: newSubjectName.trim(),
        color: randomColor,
      });
      setNewSubjectName('');
      setShowAddModal(false);
    }
  };

  const handleDeleteSubject = (id: string) => {
    deleteSubject(id);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-4"
      >
        <h1 className={`text-3xl font-bold ${themeConfig.text} mb-2`}>
          My Subjects
        </h1>
        <p className={`${themeConfig.textSecondary} text-sm`}>
          Add and manage your subjects
        </p>
      </motion.div>

      {/* Add Subject Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="px-4"
      >
        <motion.button
          onClick={() => setShowAddModal(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 shadow-lg border-2 border-dashed border-white/20 hover:border-white/40 transition-all duration-300`}
        >
          <div className="flex items-center justify-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-white">Add New Subject</h3>
              <p className="text-sm text-white/80">Click to add your first subject</p>
            </div>
          </div>
        </motion.button>
      </motion.div>

      {/* Subjects List */}
      <div className="px-4 space-y-4">
        <AnimatePresence>
          {subjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`${themeConfig.card} rounded-2xl p-8 text-center border ${themeConfig.text === 'text-white' ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="mb-4"
              >
                <BookOpen className={`w-16 h-16 mx-auto ${themeConfig.textSecondary}`} />
              </motion.div>
              <h3 className={`text-lg font-semibold ${themeConfig.text} mb-2`}>
                No subjects yet
              </h3>
              <p className={`${themeConfig.textSecondary} text-sm`}>
                Add your first subject to get started with your studies
              </p>
            </motion.div>
          ) : (
            subjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                <div
                  className={`bg-gradient-to-r ${subject.color} rounded-2xl p-1 shadow-lg cursor-pointer`}
                  onClick={() => navigate(`/subjects/${subject.id}`)}
                >
                  <div className={`${themeConfig.card} rounded-xl p-4 h-20 flex items-center justify-between relative overflow-hidden`}>
                    <div className="relative z-10 flex-1">
                      <h3 className={`text-lg font-bold ${themeConfig.text}`}>
                        {subject.name}
                      </h3>
                    </div>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubject(subject.id);
                      }}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="relative z-10 bg-red-500 hover:bg-red-600 p-2 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Subject Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`${themeConfig.card} rounded-2xl p-6 max-w-md w-full shadow-2xl border ${themeConfig.text === 'text-white' ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <h2 className={`text-2xl font-bold ${themeConfig.text} mb-4`}>
                Add New Subject
              </h2>
              <input
                type="text"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
                placeholder="Enter subject name"
                className={`w-full px-4 py-3 rounded-xl border-2 ${themeConfig.background} ${themeConfig.text} ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} focus:border-blue-500 focus:outline-none transition-colors mb-4`}
                autoFocus
              />
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowAddModal(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold ${themeConfig.background} ${themeConfig.text} border-2 ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleAddSubject}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  Add Subject
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}