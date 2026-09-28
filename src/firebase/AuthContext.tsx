import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './config';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, phone?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync or create user profile in Firestore
  const syncUserProfile = async (firebaseUser: User, extraData?: { name?: string; phone?: string }) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    try {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const profile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: data.displayName || firebaseUser.displayName || extraData?.name || 'Guest',
          phoneNumber: data.phoneNumber || firebaseUser.phoneNumber || extraData?.phone || '',
          photoURL: firebaseUser.photoURL || data.photoURL || null,
          createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : new Date().toISOString(),
          totalBookings: data.totalBookings || 0,
          totalOrders: data.totalOrders || 0,
        };
        setUserProfile(profile);

        // Update photoURL or displayName if changed by Google auth
        if (firebaseUser.photoURL && firebaseUser.photoURL !== data.photoURL) {
          await setDoc(userRef, { photoURL: firebaseUser.photoURL }, { merge: true }).catch(() => {});
        }
      } else {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: extraData?.name || firebaseUser.displayName || 'Guest',
          phoneNumber: extraData?.phone || firebaseUser.phoneNumber || '',
          photoURL: firebaseUser.photoURL || null,
          createdAt: new Date().toISOString(),
          totalBookings: 0,
          totalOrders: 0,
        };
        await setDoc(userRef, {
          uid: newProfile.uid,
          email: newProfile.email,
          displayName: newProfile.displayName,
          phoneNumber: newProfile.phoneNumber,
          photoURL: newProfile.photoURL,
          createdAt: serverTimestamp(),
          totalBookings: 0,
          totalOrders: 0,
        });
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.warn('Could not sync user profile with Firestore (rules/network):', err);
      // Fallback local profile state so user can proceed
      setUserProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: extraData?.name || firebaseUser.displayName || 'Guest',
        phoneNumber: extraData?.phone || firebaseUser.phoneNumber || '',
        photoURL: firebaseUser.photoURL || null,
        createdAt: new Date().toISOString(),
        totalBookings: 0,
        totalOrders: 0,
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim();
    const cleanPass = pass.trim();

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      await syncUserProfile(cred.user);
    } catch (err: any) {
      // If user is attempting login with the configured admin credentials and it doesn't exist in Firebase yet, auto-bootstrap it!
      if (
        cleanEmail.toLowerCase() === 'admin@gmail.com' &&
        cleanPass === 'jujharsingh' &&
        (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found')
      ) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
          try {
            await updateProfile(cred.user, { displayName: 'Admin Manager' });
          } catch {}
          await syncUserProfile(cred.user, { name: 'Admin Manager', phone: '+91 98765 00000' });
          return;
        } catch {
          // If creation also has restriction, throw original err
        }
      }
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, phone?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (name) {
      try {
        await updateProfile(cred.user, { displayName: name });
      } catch (e) {
        console.warn('Error updating auth profile:', e);
      }
    }
    await syncUserProfile(cred.user, { name, phone });
  };

  const signInWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(cred.user);
  };

  const logOut = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
