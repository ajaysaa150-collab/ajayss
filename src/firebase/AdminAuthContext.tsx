import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from './config';

interface AdminAuthContextType {
  isAdmin: boolean;
  adminEmail: string | null;
  adminLogin: (email: string, pass: string) => Promise<boolean>;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'jujharsingh',
};

const SESSION_KEY = 'brew_bloom_admin_session_active';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [adminEmail, setAdminEmail] = useState<string | null>(() => {
    return isAdmin ? ADMIN_CREDENTIALS.email : null;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser?.email?.toLowerCase() === ADMIN_CREDENTIALS.email) {
        setIsAdmin(true);
        setAdminEmail(ADMIN_CREDENTIALS.email);
        try {
          sessionStorage.setItem(SESSION_KEY, 'true');
        } catch {}
      } else {
        // If a normal user logs in or someone logs out, revoke admin privilege
        setIsAdmin(false);
        setAdminEmail(null);
        try {
          sessionStorage.removeItem(SESSION_KEY);
        } catch {}
      }
    });

    return () => unsubscribe();
  }, []);

  const adminLogin = async (email: string, pass: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (cleanEmail === ADMIN_CREDENTIALS.email && cleanPass === ADMIN_CREDENTIALS.password) {
      // Authenticate with Firebase Auth as well
      try {
        await signInWithEmailAndPassword(auth, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
      } catch (signInErr: any) {
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
          } catch (createErr) {
            console.warn('Firebase admin account sync (create):', createErr);
          }
        }
      }

      setIsAdmin(true);
      setAdminEmail(ADMIN_CREDENTIALS.email);
      try {
        sessionStorage.setItem(SESSION_KEY, 'true');
      } catch {}
      return true;
    }

    return false;
  };

  const adminLogout = () => {
    setIsAdmin(false);
    setAdminEmail(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
    signOut(auth).catch(() => {});
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdmin,
        adminEmail,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
