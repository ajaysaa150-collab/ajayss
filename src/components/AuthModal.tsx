import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, AlertCircle, ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { useAuth } from '../firebase/AuthContext';
import { useAdminAuth, ADMIN_CREDENTIALS } from '../firebase/AdminAuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onAdminSuccess?: () => void;
  initialMode?: 'signin' | 'signup';
  customTitle?: string;
  customSubtitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onAdminSuccess,
  initialMode = 'signin',
  customTitle,
  customSubtitle,
}) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const { adminLogin } = useAdminAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // Check if admin credentials were typed into the sign-in details
    if (cleanEmail === ADMIN_CREDENTIALS.email && cleanPass === ADMIN_CREDENTIALS.password) {
      try {
        const isAdminLoggedIn = await adminLogin(cleanEmail, cleanPass);
        if (isAdminLoggedIn) {
          setLoading(false);
          onClose();
          onAdminSuccess?.();
          return;
        }
      } catch (err: any) {
        console.warn('Admin sign-in fallback:', err);
      }
    }

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        if (!name.trim()) {
          setError('Please provide your name.');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, name, phone);
      }
      setLoading(false);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setLoading(false);
      // Log as info/warning rather than error so validation issues don't trigger fatal error monitor
      console.warn('Auth validation:', err?.code || err?.message);

      let msg = 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        msg = mode === 'signin'
          ? "Invalid email or password. If you haven't registered yet, please create a new account."
          : 'Invalid credentials. Please verify your information.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      setLoading(false);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setLoading(false);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign in failed.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFF8EE] rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#3B241A]/15 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#3B241A]/60 hover:text-[#3B241A] rounded-full hover:bg-[#F5ECD9] transition-colors cursor-pointer"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <span className="text-xs font-semibold text-[#C96F4A] uppercase tracking-wider block mb-1">
            Brew & Bloom Community
          </span>
          <h3 className="font-serif text-2xl font-bold text-[#3B241A]">
            {customTitle || (mode === 'signin' ? 'Welcome Back' : 'Create an Account')}
          </h3>
          <p className="text-xs text-[#3B241A]/70 mt-1">
            {customSubtitle ||
              (mode === 'signin'
                ? 'Sign in to confirm table reservations and track your visits.'
                : 'Join our Gomti Nagar café circle to save bookings & enjoy fresh perks.')}
          </p>
        </div>

        {/* Segmented Switcher */}
        <div className="flex bg-[#F5ECD9] p-1 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'signin' ? 'bg-[#3B241A] text-white shadow-xs' : 'text-[#3B241A]/70 hover:text-[#3B241A]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'signup' ? 'bg-[#3B241A] text-white shadow-xs' : 'text-[#3B241A]/70 hover:text-[#3B241A]'
            }`}
          >
            New Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col gap-1.5">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {mode === 'signin' && error.includes('create a new account') && (
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className="text-left text-xs font-semibold text-[#C96F4A] hover:underline pl-6 cursor-pointer"
              >
                Create a new account with this email →
              </button>
            )}
            {mode === 'signup' && error.includes('sign in instead') && (
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className="text-left text-xs font-semibold text-[#3B241A] hover:underline pl-6 cursor-pointer"
              >
                Sign in to your existing account →
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3B241A]/40" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aditi Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3B241A] mb-1">
                  Phone Number (for SMS & table confirmation)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3B241A]/40" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#3B241A] mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3B241A]/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3B241A] mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3B241A]/40" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white rounded-xl border border-[#3B241A]/20 focus:outline-hidden focus:border-[#3B241A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 text-xs font-semibold text-white bg-[#3B241A] hover:bg-[#2A1810] rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In & Continue' : 'Create Account & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#3B241A]/10" />
          </div>
          <div className="relative flex justify-center text-[11px] text-[#3B241A]/50 uppercase">
            <span className="bg-[#FFF8EE] px-2">or quick continue with</span>
          </div>
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-white hover:bg-[#F5ECD9] border border-[#3B241A]/20 text-[#3B241A] text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <p className="text-[11px] text-[#3B241A]/60 text-center mt-4">
          Your profile & reservations are securely stored in your personal account.
        </p>
      </div>
    </div>
  );
};
