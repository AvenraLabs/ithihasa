import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Eye, EyeOff, X } from 'lucide-react';
import { useAvatar } from '../context/AvatarContext.js';

import { loginWithPassword, loginWithGoogle } from '../api/auth.js';
import { syncGuestWishlistToBackend } from '../api/wishlist.js';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setProfileData } = useAvatar();

  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect') || (location.state as any)?.from || '/account';

  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDismiss = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await loginWithPassword({
        identifier: mobileNumber,
        password,
      });

      setProfileData({
        fullName: response.user.name,
        email: response.user.email,
        phone: response.user.phone || mobileNumber,
      });

      await syncGuestWishlistToBackend().catch(() => {});

      setToastMessage('Welcome back to the atelier');
      setTimeout(() => {
        setToastMessage(null);
        navigate(redirectTarget);
      }, 700);
    } catch (err: any) {
      // If backend error, show clean error message or graceful local session
      setError(err.message || 'Invalid email/mobile or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const GOOGLE_CLIENT_ID =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '683901924088-1t92grkteqpjn7n5sb07vsuo2n3pv915.apps.googleusercontent.com';

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response?.credential) {
      setError('Google sign-in was cancelled or produced no credential.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await loginWithGoogle(response.credential);
      if (res.user) {
        setProfileData({
          fullName: res.user.name || '',
          email: res.user.email || '',
          phone: res.user.phone || '',
        });
      }
      await syncGuestWishlistToBackend().catch(() => {});
      setToastMessage(`Welcome to the atelier, ${res.user?.name || 'Patron'}`);
      setTimeout(() => {
        setToastMessage(null);
        navigate(redirectTarget);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Google sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const initGoogle = () => {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          const btnContainer = document.getElementById('google-login-btn');
          if (btnContainer && !btnContainer.hasChildNodes()) {
            (window as any).google.accounts.id.renderButton(btnContainer, {
              type: 'standard',
              theme: document.documentElement.classList.contains('dark') ? 'filled_black' : 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: Math.min(window.innerWidth - 48, 380),
            });
          }
        } catch (e) {
          console.warn('Google GSI initialization notice:', e);
        }
      }
    };

    initGoogle();
    const timer = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        initGoogle();
        clearInterval(timer);
      }
    }, 250);
    const timeout = setTimeout(() => clearInterval(timer), 4000);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors flex flex-col md:flex-row antialiased selection:bg-[var(--gold)] selection:text-[#0A0A0A]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[70] bg-[var(--bg-card)] border border-[var(--border-color)] px-6 py-3.5 shadow-2xl flex items-center gap-3 whitespace-nowrap max-w-[90vw] animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={18} className="text-[var(--gold)] shrink-0" />
          <span
            className="text-[17px] tracking-wide text-[var(--gold)] font-medium"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            {toastMessage}
          </span>
        </div>
      )}

      {/* Dismiss / Close Button */}
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-5 left-5 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-[var(--bg-primary)]/80 text-[var(--text-primary)] hover:text-[var(--gold)] border border-[var(--border-color)] hover:border-[var(--gold)] transition-all duration-200 backdrop-blur-md shadow-sm active:scale-95"
        aria-label="Close and return to store"
      >
        <X size={20} strokeWidth={1.75} />
      </button>

      {/* Left Section: Brand & Imagery (Split layout on desktop >= 768px matching Stitch) */}
      <div className="hidden md:flex w-1/2 relative bg-[var(--bg-secondary)] items-center justify-center overflow-hidden min-h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-85 mix-blend-multiply dark:mix-blend-luminosity dark:opacity-40"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85')`,
          }}
        />
        <div className="z-10 text-center px-8">
          <h1
            className="text-[44px] lg:text-[54px] tracking-[0.25em] text-[var(--gold)] uppercase font-normal mb-2"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            ITHIHASA
          </h1>
          <p className="body-md text-[16px] text-[var(--text-primary)]/80 tracking-wide">
            Heritage in every thread.
          </p>
        </div>
      </div>

      {/* Right Section: Login Form Canvas */}
      <main className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 py-8 md:p-16 min-h-screen bg-[var(--bg-primary)]">
        <div className="w-full max-w-[400px] flex flex-col gap-6 md:gap-8">
          {/* Login Title & Subtitle */}
          <div className="flex flex-col gap-1 text-center md:text-left">
            <h2
              className="text-[32px] md:text-[40px] font-normal text-[var(--text-primary)] leading-tight"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              Login
            </h2>
            <p className="body-md text-[14px] sm:text-[15px] text-[var(--text-secondary)]">
              Welcome back to the atelier.
            </p>
          </div>

          {/* Google Login Button Container */}
          <div className="w-full flex flex-col items-center justify-center min-h-[44px]">
            <div id="google-login-btn" className="w-full flex justify-center items-center" />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="h-[1px] flex-grow bg-[var(--border-color)]" />
            <span className="label-caps text-[11px] text-[var(--text-secondary)] uppercase tracking-widest">
              Or
            </span>
            <div className="h-[1px] flex-grow bg-[var(--border-color)]" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-4 py-3 bg-red-950/20 border border-red-800/40 text-red-400 text-[13px] rounded">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            {/* Mobile Number Input */}
            <div className="flex flex-col border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1">
              <label
                htmlFor="mobile"
                className="label-caps text-[11px] tracking-widest text-[var(--text-secondary)] uppercase mb-1"
              >
                ENTER MOBILE NUMBER (10 DIGITS)
              </label>
              <input
                id="mobile"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                required
                className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40 tabular-nums"
              />
            </div>

            {/* Password Input with Eye Icon */}
            <div className="flex flex-col border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1 relative">
              <label
                htmlFor="password"
                className="label-caps text-[11px] tracking-widest text-[var(--text-secondary)] uppercase mb-1"
              >
                PASSWORD
              </label>
              <div className="flex items-center justify-between">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40 pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-between items-center -mt-2">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="label-caps text-[11px] text-[var(--gold)] uppercase tracking-widest hover:underline decoration-1 underline-offset-4 transition-all"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] label-caps text-[12px] uppercase tracking-[0.2em] hover:bg-[var(--gold)] hover:text-[#0A0A0A] transition-colors duration-300 font-semibold shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Registration Footer */}
          <div className="text-center">
            <p className="body-sm text-[13px] text-[var(--text-secondary)]">
              Don't have an account?{' '}
              <Link
                to={redirectTarget && redirectTarget !== '/account' ? `/register?redirect=${encodeURIComponent(redirectTarget)}` : '/register'}
                className="label-caps text-[11px] text-[var(--text-primary)] hover:text-[var(--gold)] uppercase tracking-widest hover:underline decoration-1 underline-offset-4 ml-1 font-semibold"
              >
                Register
              </Link>
            </p>
            <p className="text-[11.5px] text-[var(--text-secondary)]/80 mt-4 leading-relaxed">
              By continuing, you agree to Ithihasa's{' '}
              <Link to="/terms" className="text-[var(--gold)] underline hover:opacity-80">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-[var(--gold)] underline hover:opacity-80">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
