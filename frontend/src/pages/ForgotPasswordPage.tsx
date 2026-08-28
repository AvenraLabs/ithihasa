import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

import { requestPasswordReset } from '../api/auth.js';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber.trim()) return;

    setIsLoading(true);
    try {
      await requestPasswordReset(mobileNumber);
      setToastMessage('OTP sent to your mobile');
      setTimeout(() => {
        setToastMessage(null);
        navigate('/verify-otp', { state: { phone: mobileNumber, flow: 'forgot' } });
      }, 800);
    } catch (err: any) {
      setToastMessage(err.message || 'OTP sent to your mobile');
      setTimeout(() => {
        setToastMessage(null);
        navigate('/verify-otp', { state: { phone: mobileNumber, flow: 'forgot' } });
      }, 800);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors flex flex-col items-center justify-center antialiased selection:bg-[var(--gold)] selection:text-[#0A0A0A] px-6">
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

      {/* Card Container — matching the warm parchment card in the screenshot */}
      <div className="w-full max-w-sm bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-8 shadow-lg">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1
              className="text-[22px] tracking-[0.25em] text-[var(--text-primary)] uppercase font-normal"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              ITHIHASA
            </h1>
          </Link>
        </div>

        {/* Title */}
        <h2
          className="text-[28px] md:text-[32px] font-normal text-[var(--text-primary)] text-center mb-2"
          style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
        >
          Forgot Password
        </h2>
        <p className="body-md text-[14px] text-[var(--text-secondary)] text-center mb-10 leading-relaxed">
          Enter your registered mobile number<br />to reset your password.
        </p>

        {/* Form */}
        <form onSubmit={handleSendOtp} className="flex flex-col gap-6">
          {/* Mobile Number */}
          <div className="flex flex-col border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1">
            <label
              htmlFor="forgot-mobile"
              className="label-caps text-[11px] tracking-widest text-[var(--text-secondary)] uppercase mb-1"
            >
              MOBILE NUMBER (10 DIGITS)
            </label>
            <input
              id="forgot-mobile"
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

          {/* Send OTP Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] label-caps text-[12px] uppercase tracking-[0.15em] hover:bg-[var(--gold)] hover:text-[#0A0A0A] transition-colors duration-300 font-semibold shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>Send OTP</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-1.5 body-sm text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};
