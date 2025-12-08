 import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Import the auth instance
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes with Firebase
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Account created successfully!');
    } catch (error: any) {
      // Handle Firebase specific errors
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists. Please try logging in instead.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('The password is too weak. Please choose a stronger password.');
      }
      throw new Error(error.message || 'Failed to create account.');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!');
    } catch (error: any) {
      // Handle Firebase specific errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password. Please check your credentials or create an account.');
      }
      throw new Error(error.message || 'Failed to sign in.');
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success('Signed out successfully');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out.');
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success('Signed in with Google successfully!');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in with Google.');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut,
      signInWithGoogle
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
