import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const clearUserData = () => {
  const keysToRemove = [
    'hasCompletedProfileSetup',
    'userData',
    'currentUserId'
  ];
  keysToRemove.forEach(key => localStorage.removeItem(key));
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (key.startsWith('hasCompletedProfileSetup_') || key.startsWith('userData_')) {
      localStorage.removeItem(key);
    }
  });
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const storedUserId = localStorage.getItem('currentUserId');
        if (storedUserId && storedUserId !== currentUser.uid) {
          clearUserData();
        }
        localStorage.setItem('currentUserId', currentUser.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      clearUserData();
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Account created successfully!');
    } catch (error: any) {
      const code = error?.code;
      const message = error?.message;
      if (code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists. Please try logging in instead.');
      } else if (code === 'auth/weak-password') {
        throw new Error('The password is too weak. Please choose a stronger password (at least 6 characters).');
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
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password. Please check your credentials or create an account.');
      }
      throw new Error(message || 'Failed to sign in. Please try again.');
    }
  };

  const signOut = async () => {
    try {
      clearUserData();
      await firebaseSignOut(auth);
      toast.success('Signed out successfully');
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to sign out.');
    }
  };

  const deleteAccount = async (password: string) => {
    try {
      if (!user || !user.email) {
        throw new Error('No user is currently logged in.');
      }

      // Reauthenticate user before deletion
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Delete the user account
      await deleteUser(user);

      // Clear all user data from localStorage
      clearUserData();

      toast.success('Account deleted successfully');
    } catch (error: any) {
      const code = error?.code;
      const message = error?.message;

      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        throw new Error('Incorrect password. Please try again.');
      } else if (code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.');
      } else if (code === 'auth/requires-recent-login') {
        throw new Error('For security reasons, please sign out and sign in again before deleting your account.');
      }

      throw new Error(message || 'Failed to delete account. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
