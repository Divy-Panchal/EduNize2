import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  category: string;
  image?: string;
  createdAt: string;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem('eduorganize-tasks');
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        // Validate data structure
        if (Array.isArray(parsed) && parsed.every(task =>
          task.id && task.title && task.priority && task.dueDate
        )) {
          setTasks(parsed);
        } else {
          console.error('Invalid task data structure');
          setTasks([]);
        }
      } catch (error) {
        console.error('Failed to parse tasks from localStorage:', error);
        setTasks([]);
      }
    } else {
      // Sample data for demo
      setTasks([
        {
          id: '1',
          title: 'Complete Math Assignment',
          description: 'Finish calculus problems chapter 5',
          completed: false,
          priority: 'high',
          dueDate: '2025-01-20',
          category: 'Mathematics',
          createdAt: '2025-01-15T10:00:00Z'
        },
        {
          id: '2',
          title: 'Read History Chapter',
          description: 'World War II section',
          completed: true,
          priority: 'medium',
          dueDate: '2025-01-18',
          category: 'History',
          createdAt: '2025-01-14T14:30:00Z'
        }
      ]);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    try {
      localStorage.setItem('eduorganize-tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks to localStorage:', error);
      if (error instanceof DOMException && (
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      )) {
        alert('Storage quota exceeded. Please delete some old tasks to free up space.');
      }
    }
  }, [tasks, isInitialized]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const toggleTask = (id: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (!task) return prev;

      const wasCompleted = task.completed;
      const willBeCompleted = !wasCompleted;

      // Update completed tasks counter when marking as complete
      if (willBeCompleted && !wasCompleted) {
        // Use user from AuthContext
        if (user?.uid) {
          try {
            const currentCount = parseInt(localStorage.getItem(`completedTasksCount_${user.uid}`) || '0');
            localStorage.setItem(`completedTasksCount_${user.uid}`, (currentCount + 1).toString());



            // Trigger achievement check after a short delay
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('checkAchievements'));
            }, 100);
          } catch (error) {
            console.error('Failed to update completed tasks count:', error);
          }
        } else {
          console.warn('⚠️ No user found, cannot track task completion');
        }
      }

      return prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );
    });
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      addTask,
      updateTask,
      deleteTask,
      toggleTask
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within TaskProvider');
  }
  return context;
}