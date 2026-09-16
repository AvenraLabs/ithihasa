import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { X, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { sendRegistrationOtp, loginWithGoogle } from '../api/auth.js';
import { syncGuestWishlistToBackend } from '../api/wishlist.js';
import { useAvatar } from '../context/AvatarContext.js';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setProfileData } = useAvatar();

  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect') || (location.state as any)?.from || '/account';

  const GOOGLE_CLIENT_ID =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '683901924088-1t92grkteqpjn7n5sb07vsuo2n3pv915.apps.googleusercontent.com';

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initGoogle = () => {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response: any) => {
              if (!response?.credential) return;
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
                setError(err.message || 'Google registration failed');
              } finally {
                setIsLoading(false);
              }
            },
            auto_select: false,
          });

          const btnContainer = document.getElementById('google-reg-btn');
          if (btnContainer && !btnContainer.hasChildNodes()) {
            (window as any).google.accounts.id.renderButton(btnContainer, {
              type: 'standard',
              theme: document.documentElement.classList.contains('dark') ? 'filled_black' : 'outline',
              size: 'large',
              text: 'signup_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: Math.min(window.innerWidth - 48, 380),
            });
          }
        } catch (e) {
          console.warn('Google GSI reg notice:', e);
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

  const handleDismiss = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = mobileNumber.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await sendRegistrationOtp(cleanPhone);

      setToastMessage('Verification code sent');
      setTimeout(() => {
        setToastMessage(null);
        navigate('/verify-otp', {
          state: {
            phone: cleanPhone,
            flow: 'register',
            otp: response?.otp,
            registrationData: {
              name: fullName.trim(),
              phone: cleanPhone,
              password,
            },
            redirect: redirectTarget,
          },
        });
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors flex flex-col md:flex-row antialiased selection:bg-[var(--gold)] selection:text-[#0A0A0A]">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[70] bg-[var(--bg-card)] border border-[var(--border-color)] px-6 py-3.5 shadow-2xl flex items-center gap-3 whitespace-nowrap max-w-[90vw]">
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
        aria-label="Close and return"
      >
        <X size={20} strokeWidth={1.75} />
      </button>

      {/* Left Section: Editorial Image (Desktop only) */}
      <div className="hidden md:block w-1/2 relative bg-[var(--bg-secondary)] min-h-screen overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-90"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85')`,
          }}
        />
        <div className="absolute inset-0 bg-[#0A0A0A]/10" />
        <div className="absolute top-16 left-16 z-10">
          <h1
            className="text-[24px] tracking-[0.2em] text-white uppercase font-medium"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            ITHIHASA
          </h1>
        </div>
      </div>

      {/* Right Section: Registration Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-20 py-16">
        {/* Mobile Logo */}
        <div className="md:hidden flex justify-center mb-10">
          <Link to="/">
            <h1
              className="text-[28px] tracking-[0.2em] text-[var(--gold)] uppercase font-normal"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              ITHIHASA
            </h1>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="mb-8 text-center md:text-left">
            <h2
              className="text-[32px] md:text-[40px] font-normal text-[var(--text-primary)] leading-tight mb-1"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              Create Account
            </h2>
            <p className="body-md text-[14px] sm:text-[15px] text-[var(--text-secondary)]">
              Join our exclusive atelier community.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 text-[13px] rounded">
              {error}
            </div>
          )}

          {/* Google Sign Up Button Container matching Ithihasa Theme */}
          <div className="w-full flex flex-col items-center justify-center mb-6">
            <div
              className="relative w-full overflow-hidden group cursor-pointer"
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
                  try {
                    (window as any).google.accounts.id.prompt();
                  } catch {
                    // Fallback handled
                  }
                }
              }}
            >
              {/* Custom Ithihasa Luxury Theme Button */}
              <div
                className="w-full h-12 flex items-center justify-center gap-3 bg-transparent border border-[var(--border-color)] group-hover:border-[var(--gold)] group-hover:bg-[var(--bg-card)] transition-colors duration-300 label-caps text-[11px] text-[var(--text-primary)] uppercase tracking-widest select-none"
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
              </div>

              {/* Invisible Google native iframe overlay to capture user gesture */}
              <div
                id="google-reg-btn"
                className="absolute inset-0 z-10 opacity-[0.001] cursor-pointer flex items-center justify-center overflow-hidden"
                style={{ transform: 'scale(1.5)', transformOrigin: 'center' }}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] flex-grow bg-[var(--border-color)]" />
            <span className="label-caps text-[11px] text-[var(--text-secondary)] uppercase tracking-widest">
              Or with mobile
            </span>
            <div className="h-[1px] flex-grow bg-[var(--border-color)]" />
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            {/* Full Name */}
            <div className="flex flex-col border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1">
              <label
                htmlFor="reg-fullName"
                className="label-caps text-[11px] tracking-widest text-[var(--text-secondary)] uppercase mb-1"
              >
                FULL NAME
              </label>
              <input
                id="reg-fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Eleanor Vance"
                required
                className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40"
              />
            </div>

            {/* Mobile Number - Plain 10 Digits Only */}
            <div className="flex flex-col border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1">
              <label
                htmlFor="reg-mobile"
                className="label-caps text-[11px] tracking-widest text-[var(--text-secondary)] uppercase mb-1"
              >
                MOBILE NUMBER (10 DIGITS)
              </label>
              <input
                id="reg-mobile"
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

            {/* Password with Eye Icon */}
            <div className="flex flex-col border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1 relative">
              <label
                htmlFor="reg-password"
                className="label-caps text-[11px] tracking-widest text-[var(--text-secondary)] uppercase mb-1"
              >
                PASSWORD
              </label>
              <div className="flex items-center justify-between">
                <input
                  id="reg-password"
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

            {/* Confirm Password with Eye Icon */}
            <div className="flex flex-col border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1 relative">
              <label
                htmlFor="reg-confirm"
                className="label-caps text-[11px] tracking-widest text-[var(--text-secondary)] uppercase mb-1"
              >
                CONFIRM PASSWORD
              </label>
              <div className="flex items-center justify-between">
                <input
                  id="reg-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40 pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-1 text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] label-caps text-[12px] uppercase tracking-[0.2em] hover:bg-[var(--gold)] hover:text-[#0A0A0A] transition-colors duration-300 font-semibold shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <span>Verify Mobile & Register</span>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center space-y-3">
            <p className="body-sm text-[13px] text-[var(--text-secondary)]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="label-caps text-[11px] text-[var(--text-primary)] hover:text-[var(--gold)] uppercase tracking-widest hover:underline decoration-1 underline-offset-4 ml-1 font-semibold"
              >
                Login
              </Link>
            </p>
            <p className="text-[11.5px] text-[var(--text-secondary)]/80 leading-relaxed">
              By creating an account, you agree to Ithihasa's{' '}
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
      </div>
    </div>
  );
};
