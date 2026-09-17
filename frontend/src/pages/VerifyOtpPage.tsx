import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import {
  verifyPhoneOtp,
  sendOtpToPhone,
  resetPassword,
  sendRegistrationOtp,
  registerWithOtp,
  sendEmailOtp,
  verifyEmailOtp,
} from '../api/auth.js';
import { useAvatar } from '../context/AvatarContext.js';

const OTP_LENGTH = 4;

export const VerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setProfileData } = useAvatar();

  const flow = (location.state as { flow?: string })?.flow || 'register';
  const phone = (location.state as { phone?: string })?.phone || '+91 9876543210';
  const initialOtp = (location.state as { otp?: string })?.otp || null;

  const [activeOtp, setActiveOtp] = useState<string | null>(initialOtp);
  const [otp, setOtp] = useState<string[]>(
    initialOtp && initialOtp.length === OTP_LENGTH ? initialOtp.split('') : Array(OTP_LENGTH).fill('')
  );
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(20);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus input
  useEffect(() => {
    if (initialOtp && initialOtp.length === OTP_LENGTH) {
      inputRefs.current[OTP_LENGTH - 1]?.focus();
    } else {
      inputRefs.current[0]?.focus();
    }
  }, [initialOtp]);

  // Resend cooldown timer (20 seconds)
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const digit = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance to next input
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < OTP_LENGTH) return;

    if (flow === 'forgot' && newPassword.length < 6) {
      setIsError(true);
      setToastMessage('New password must be at least 6 characters');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsLoading(true);
    setIsError(false);

    try {
      if (flow === 'forgot') {
        const res = await resetPassword({
          identifier: phone,
          otp: code,
          newPassword,
        });
        setToastMessage(res.message || 'Password updated successfully');
        setTimeout(() => {
          setToastMessage(null);
          navigate('/login');
        }, 1200);
      } else if (flow === 'register') {
        const regData = (location.state as any)?.registrationData;
        if (!regData?.password || !regData?.name) {
          throw new Error('Registration details missing. Please start registration again.');
        }
        const res = await registerWithOtp({
          name: regData.name,
          phone: regData.phone || phone,
          password: regData.password,
          otp: code,
        });

        setProfileData({
          fullName: res.user.name,
          email: res.user.email || '',
          phone: res.user.phone || phone,
          phone_verified: true,
          is_google_auth: false,
          has_password: true,
        });

        setToastMessage('Account created and phone verified!');
        setTimeout(() => {
          setToastMessage(null);
          const redirect = (location.state as any)?.redirect || '/account';
          navigate(redirect);
        }, 800);
      } else if (flow === 'email') {
        const res = await verifyEmailOtp(phone, code);
        const draft = (location.state as any)?.draftProfile || {};
        setProfileData({
          email: res.email || phone,
        });
        setToastMessage('Email verified successfully');
        setTimeout(() => {
          setToastMessage(null);
          navigate('/account/edit', {
            state: {
              draftProfile: {
                ...draft,
                email: res.email || phone,
                email_verified: true,
              },
            },
          });
        }, 700);
      } else if (flow === 'profile') {
        const res = await verifyPhoneOtp(phone, code);
        const draft = (location.state as any)?.draftProfile || {};
        setProfileData({
          phone: res.phone || phone,
          phone_verified: true,
        });
        setToastMessage('Phone verified successfully');
        setTimeout(() => {
          setToastMessage(null);
          navigate('/account/edit', {
            state: {
              draftProfile: {
                ...draft,
                phone: res.phone || phone,
                phone_verified: true,
              },
            },
          });
        }, 700);
      } else {
        const res = await verifyPhoneOtp(phone, code);
        setProfileData({
          phone: res.phone || phone,
          phone_verified: true,
        });
        setToastMessage('Phone verified successfully');
        setTimeout(() => {
          setToastMessage(null);
          navigate('/account');
        }, 1000);
      }
    } catch (err: any) {
      setIsError(true);
      const msg = err.message || 'Invalid or expired code. Please try again.';
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      let res;
      if (flow === 'register') {
        res = await sendRegistrationOtp(phone);
      } else if (flow === 'email') {
        res = await sendEmailOtp(phone);
      } else {
        res = await sendOtpToPhone(phone);
      }

      if (res?.otp) {
        setActiveOtp(res.otp);
        if (res.otp.length === OTP_LENGTH) {
          setOtp(res.otp.split(''));
        }
      }
      setResendCooldown(20);
      setIsError(false);
      setToastMessage('New verification code sent');
      setTimeout(() => setToastMessage(null), 2500);
    } catch (err: any) {
      setIsError(true);
      setToastMessage(err.message || 'Failed to send code. Please wait.');
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const isComplete = otp.every((d) => d !== '');

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors flex flex-col antialiased selection:bg-[var(--gold)] selection:text-[#0A0A0A]">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[70] bg-[var(--bg-card)] border border-[var(--border-color)] px-6 py-3.5 shadow-2xl flex items-center gap-3 whitespace-nowrap max-w-[90vw]">
          {isError ? (
            <AlertCircle size={18} className="text-red-500 shrink-0" />
          ) : (
            <CheckCircle2 size={18} className="text-[var(--gold)] shrink-0" />
          )}
          <span
            className={`text-[17px] tracking-wide font-medium ${isError ? 'text-red-400' : 'text-[var(--gold)]'}`}
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            {toastMessage}
          </span>
        </div>
      )}

      {/* Header Bar */}
      <header className="flex items-center justify-between px-5 h-14 border-b border-[var(--border-color)]">
        <button
          onClick={() => {
            if (flow === 'profile') {
              const draft = (location.state as any)?.draftProfile;
              navigate('/account/edit', { state: { draftProfile: draft } });
            } else {
              navigate(-1);
            }
          }}
          className="p-2 -ml-2 text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors"
          aria-label="Go Back"
        >
          <ArrowLeft size={22} />
        </button>
        <Link to="/">
          <span
            className="text-[20px] tracking-[0.2em] font-normal uppercase text-[var(--text-primary)]"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            ITHIHASA
          </span>
        </Link>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* Gold accent line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-40" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm text-center">
          {/* Title */}
          <h1
            className="text-[32px] md:text-[36px] font-normal text-[var(--text-primary)] mb-3"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            Verification
          </h1>
          <p className="body-md text-[14px] text-[var(--text-secondary)] mb-10">
            {flow === 'register'
              ? 'Your verification code is displayed on screen below for instant registration.'
              : 'Your verification code is displayed on screen below.'}
          </p>

          {/* OTP In-UI Display Banner */}
          {activeOtp && (
            <div className="mb-8 p-4 bg-[var(--gold)]/10 border border-[var(--gold)]/40 rounded text-center">
              <span className="label-caps text-[11px] tracking-widest text-[var(--gold)] font-semibold uppercase block mb-1">
                Verification Code (Displaying on screen)
              </span>
              <span className="text-[32px] tracking-[0.35em] font-mono font-bold text-[var(--gold)] block">
                {activeOtp}
              </span>
              <button
                type="button"
                onClick={() => {
                  const digits = activeOtp.split('').slice(0, 4);
                  setOtp(digits);
                  inputRefs.current[3]?.focus();
                }}
                className="mt-2 text-[11px] font-semibold text-[var(--gold)] hover:underline uppercase tracking-wider block mx-auto cursor-pointer"
              >
                Auto-Fill Code
              </button>
            </div>
          )}

          {/* OTP Input Grid */}
          <form onSubmit={handleVerify}>
            <div className="flex justify-center gap-4 mb-8" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  aria-label={`Digit ${i + 1}`}
                  className={`w-16 h-14 text-center text-[24px] font-medium bg-transparent border-b-2 focus:outline-none transition-colors ${
                    digit
                      ? 'border-[var(--text-primary)]'
                      : 'border-[var(--border-color)] focus:border-[var(--gold)]'
                  }`}
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                />
              ))}
            </div>

            {/* If Forgot Password flow, prompt for New Password */}
            {flow === 'forgot' && (
              <div className="mb-8 text-left border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1 relative">
                <label
                  htmlFor="new-password"
                  className="label-caps text-[11px] tracking-widest text-[var(--text-secondary)] uppercase mb-1 block"
                >
                  NEW PASSWORD (MIN. 6 CHARACTERS)
                </label>
                <div className="flex items-center justify-between">
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
            )}

            {/* Verify Button */}
            <button
              type="submit"
              disabled={!isComplete || isLoading}
              className="w-full h-12 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] label-caps text-[12px] uppercase tracking-[0.15em] hover:bg-[var(--gold)] hover:text-[#0A0A0A] transition-colors duration-300 font-semibold shadow-md disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>{flow === 'forgot' ? 'Update Password' : 'Verify & Continue'}</span>
              )}
            </button>
          </form>

          {/* Resend Code */}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="mt-6 label-caps text-[11px] tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] uppercase transition-colors disabled:opacity-50"
          >
            {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
          </button>
        </div>
      </main>
    </div>
  );
};
