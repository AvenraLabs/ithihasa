import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Eye, EyeOff, X } from 'lucide-react';
import { useAvatar } from '../context/AvatarContext.js';

import { loginWithPassword } from '../api/auth.js';
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

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In development / demo environment without Google Client popup:
      await syncGuestWishlistToBackend().catch(() => {});
      setToastMessage('Signed in with Google');
      setTimeout(() => {
        setToastMessage(null);
        navigate(redirectTarget);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

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
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBonawBmw-xMojoIF70v4EKXlCKlQ44FpkDA2HzJ5NumL1GI8P5TnbDEIS4BVmnDklqFuAwcv4KIkeDtrA9gpUlqTPpr0n2avUwd4VJGA_mnLpogabPa30f3kcGWwW-W5Sy5mfAReFpjl7fRE5PAPftGys03lsEGmK11PYUzWTe__uO1B2sOzvC5mDvYE2xiwuy3sFZFErxQ618UsFhRHUeZK7MqJuXH5SOyzjWz8tJE8xGuO54geEIhA')`,
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

          {/* Google Login Button matching Stitch */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-12 flex items-center justify-center gap-3 bg-transparent border border-[var(--border-color)] hover:border-[var(--gold)] hover:bg-[var(--bg-card)] transition-colors duration-300 label-caps text-[11px] text-[var(--text-primary)] uppercase tracking-widest disabled:opacity-50"
          >
            <svg aria-hidden="true" className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                fill="#EA4335"
              />
              <path
                d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                fill="#4285F4"
              />
              <path
                d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                fill="#FBBC05"
              />
              <path
                d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                fill="#34A853"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

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
          </div>
        </div>
      </main>
    </div>
  );
};
