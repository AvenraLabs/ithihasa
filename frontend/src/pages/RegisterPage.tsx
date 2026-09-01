import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { X, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { registerWithPassword } from '../api/auth.js';
import { syncGuestWishlistToBackend } from '../api/wishlist.js';
import { useAvatar } from '../context/AvatarContext.js';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setProfileData } = useAvatar();

  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect') || (location.state as any)?.from || '/account';

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      const email = `${cleanPhone}_${Date.now()}@ithihasa.atelier`;
      
      const response = await registerWithPassword({
        name: fullName,
        email,
        phone: cleanPhone,
        password,
      });

      setProfileData({
        fullName: response.user.name,
        email: response.user.email,
        phone: response.user.phone || cleanPhone,
      });

      await syncGuestWishlistToBackend().catch(() => {});

      setToastMessage('Account created successfully');
      setTimeout(() => {
        setToastMessage(null);
        navigate(redirectTarget);
      }, 700);
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register</span>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="body-sm text-[13px] text-[var(--text-secondary)]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="label-caps text-[11px] text-[var(--text-primary)] hover:text-[var(--gold)] uppercase tracking-widest hover:underline decoration-1 underline-offset-4 ml-1 font-semibold"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
