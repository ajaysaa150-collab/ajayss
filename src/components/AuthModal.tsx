import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, AlertCircle, ArrowRight, Check, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
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
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInAsGuestPatron } = useAuth();
  const { adminLogin } = useAdminAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [providerDisabled, setProviderDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setProviderDisabled(false);
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
      console.warn('Auth validation:', err?.code || err?.message);

      let msg = 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/operation-not-allowed') {
        setProviderDisabled(true);
        msg = 'This sign-in provider is disabled in your Firebase project. To enable it: Go to Firebase Console → Authentication → Sign-in method, and toggle Email/Password or Google to Enabled. You can also continue below with Instant Patron Access without any setup.';
      } else if (err.code === 'auth/invalid-email') {
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
    setProviderDisabled(false);
    setLoading(true);
    try {
      await signInWithGoogle();
      setLoading(false);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setLoading(false);
      if (err.code === 'auth/operation-not-allowed') {
        setProviderDisabled(true);
        setError('Google Sign-In is not enabled yet in your Firebase Console. Go to Firebase Console → Authentication → Sign-in method → Add new provider → Google → Enable. Or use Instant Patron Access below.');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign in failed.');
      }
    }
  };

  const handleInstantPatron = () => {
    const patronName = name.trim() || (email ? email.split('@')[0] : 'Café Patron');
    const patronEmail = email.trim() || 'patron@brewandbloom.example';
    signInAsGuestPatron(patronName, patronEmail, phone);
    onSuccess?.();
    onClose();
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
              setProviderDisabled(false);
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
              setProviderDisabled(false);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'signup' ? 'bg-[#3B241A] text-white shadow-xs' : 'text-[#3B241A]/70 hover:text-[#3B241A]'
            }`}
          >
            New Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">
                  {providerDisabled ? 'Firebase Sign-in Method Not Enabled' : 'Notice'}
                </span>
                <span className="text-amber-800 leading-relaxed">{error}</span>
              </div>
            </div>

            {providerDisabled && (
              <div className="mt-1 pt-2 border-t border-amber-200/60 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleInstantPatron}
                  className="w-full py-2 px-3 bg-[#3B241A] hover:bg-[#2A1810] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C96F4A]" />
                  <span>Continue with Instant Patron Access</span>
                </button>
                <a
                  href="https://console.firebase.google.com/project/gen-lang-client-0826475364/authentication/providers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#C96F4A] hover:underline flex items-center justify-center gap-1 font-medium"
                >
                  <span>Open Firebase Console to enable providers</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {mode === 'signin' && !providerDisabled && error.includes('create a new account') && (
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
            {mode === 'signup' && !providerDisabled && error.includes('sign in instead') && (
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
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3B241A]/40" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#3B241A]">
                Password *
              </label>
            </div>
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
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#3B241A]/10" />
          </div>
          <div className="relative flex justify-center text-[11px] text-[#3B241A]/50 uppercase">
            <span className="bg-[#FFF8EE] px-2">or quick continue with</span>
          </div>
        </div>

        {/* Google Sign In & Instant Patron */}
        <div className="space-y-2">
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

          <button
            type="button"
            onClick={handleInstantPatron}
            className="w-full py-2 px-4 bg-[#F5ECD9]/80 hover:bg-[#F5ECD9] text-[#3B241A] text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-[#3B241A]/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C96F4A]" />
            <span>Instant Patron Access (No Password Required)</span>
          </button>
        </div>

        <p className="text-[11px] text-[#3B241A]/60 text-center mt-3">
          Your profile, table bookings & past orders will be saved.
        </p>
      </div>
    </div>
  );
};
