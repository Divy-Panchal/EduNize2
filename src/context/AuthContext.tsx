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
      const code = error?.code;
      const message = error?.message;
      console.error('Signup error:', { code, message });

      if (code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists. Please try logging in instead.');
      } else if (code === 'auth/weak-password') {
        throw new Error('The password is too weak. Please choose a stronger password (at least 6 characters).');
      } else if (code === 'auth/invalid-email') {
        throw new Error('Invalid email address. Please check and try again.');
      } else if (code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password authentication is not enabled. Please contact support.');
      } else if (code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (code === 'auth/too-many-requests') {
        throw new Error('Too many attempts. Please try again later.');
      }
      throw new Error(message || 'Failed to create account. Please try again.');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!');
    } catch (error: any) {
      const code = error?.code;
      const message = error?.message;
      console.error('Login error:', { code, message });

      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password. Please check your credentials or create an account.');
      } else if (code === 'auth/invalid-email') {
        throw new Error('Invalid email address. Please check and try again.');
      } else if (code === 'auth/user-disabled') {
        throw new Error('This account has been disabled. Please contact support.');
      } else if (code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (code === 'auth/too-many-requests') {
        throw new Error('Too many failed login attempts. Please try again later or reset your password.');
      } else if (code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password authentication is not enabled. Please contact support.');
      }
      throw new Error(message || 'Failed to sign in. Please try again.');
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success('Signed out successfully');
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to sign out.');
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success('Signed in with Google successfully!');
    } catch (error: any) {
      const code = error?.code;
      const message = error?.message;
      console.error('Google sign-in error:', { code, message });

      if (code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled. Please try again.');
      } else if (code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked by your browser. Please allow popups and try again.');
      } else if (code === 'auth/operation-not-allowed') {
        throw new Error('Google Sign-In is not enabled. Please contact support.');
      } else if (code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Google Sign-In. Please contact support.');
      } else if (code === 'auth/account-exists-with-different-credential') {
        throw new Error('An account already exists with the same email but different sign-in method. Try signing in with email/password.');
      }
      throw new Error(message || 'Failed to sign in with Google. Please try again.');
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
