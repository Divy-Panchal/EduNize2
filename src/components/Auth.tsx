import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, GraduationCap, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function Auth() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }
        await signUp(formData.email, formData.password);
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(resetEmail);
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while sending the reset email.');
    } finally {
      setLoading(false);
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with layered mountains */}
      <div className="absolute inset-0">
        {/* Sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-200 via-blue-100 to-blue-200" />
        
        {/* Mountain layers */}
        <div className="absolute inset-0">
          {/* Back mountains */}
          <div className="absolute bottom-0 w-full h-3/4 bg-gradient-to-t from-blue-300 to-blue-200 opacity-60"
               style={{
                 clipPath: 'polygon(0% 100%, 0% 60%, 15% 45%, 30% 55%, 45% 40%, 60% 50%, 75% 35%, 90% 45%, 100% 40%, 100% 100%)'
               }} />
          
          {/* Middle mountains */}
          <div className="absolute bottom-0 w-full h-2/3 bg-gradient-to-t from-blue-400 to-blue-300 opacity-70"
               style={{
                 clipPath: 'polygon(0% 100%, 0% 70%, 20% 55%, 35% 65%, 50% 50%, 65% 60%, 80% 45%, 95% 55%, 100% 50%, 100% 100%)'
               }} />
          
          {/* Front mountains */}
          <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-blue-500 to-blue-400 opacity-80"
               style={{
                 clipPath: 'polygon(0% 100%, 0% 80%, 25% 65%, 40% 75%, 55% 60%, 70% 70%, 85% 55%, 100% 65%, 100% 100%)'
               }} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Logo/Brand */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-full mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-2" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>EduOrganize</h1>
            <p className="text-gray-600 text-sm">Your study companion</p>
          </motion.div>

          {/* Auth Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white border-opacity-30"
          >
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome 👋
              </h2>
              <p className="text-gray-600 text-sm">
                {isLogin ? 'Login to access your account' : 'Create your account to get started'}
              </p>
              {!isLogin && (
                <div className="mt-3 p-3 bg-blue-500 bg-opacity-30 rounded-lg border border-blue-300 border-opacity-40">
                  <p className="text-gray-800 text-opacity-90 text-xs">
                    💡 First time here? Create an account to get started!
                  </p>
                </div>
              )}
              {isLogin && (
                <div className="mt-3 p-3 bg-blue-500 bg-opacity-30 rounded-lg border border-blue-300 border-opacity-40">
                  <p className="text-gray-800 text-opacity-90 text-xs">
                    💡 Don't have an account? Click "Sign up here" below to create one.
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-gray-800 text-sm font-medium mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-gray-800 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign Up only) */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-gray-800 text-sm font-medium mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                        placeholder="••••••••"
                        required={!isLogin}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </div>
                ) : (
                  isLogin ? 'Login' : 'Create Account'
                )}
              </motion.button>
            </form>
            
            {isLogin && (
              <div className="text-center mt-4">
                <button 
                  onClick={() => setShowForgotPassword(true)} 
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Toggle between Login/Signup */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ email: '', password: '', confirmPassword: '' });
                }}
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors mt-1"
              >
                {isLogin ? 'Sign up here' : 'Login here'}
              </button>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-8"
          >
            <p className="text-gray-500 text-xs">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Reset Password</h3>
              <p className="text-gray-600 mb-6">Enter your email address and we'll send you a link to reset your password.</p>
              <form onSubmit={handleResetPassword}>
                <div className="relative mb-4">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </motion.button>
              </form>
              <button 
                onClick={() => setShowForgotPassword(false)} 
                className="mt-4 text-sm text-gray-600 hover:text-blue-600 transition-colors w-full"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
