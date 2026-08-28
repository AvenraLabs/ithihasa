import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

const OTP_LENGTH = 4;

export const VerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const flow = (location.state as { flow?: string })?.flow || 'register';

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Resend cooldown timer
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

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < OTP_LENGTH) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setToastMessage('Verified successfully');
      setTimeout(() => {
        setToastMessage(null);
        if (flow === 'forgot') {
          navigate('/login');
        } else {
          navigate('/account');
        }
      }, 1000);
    }, 800);
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    setToastMessage('Code resent to your mobile');
    setTimeout(() => setToastMessage(null), 2000);
  };

  const isComplete = otp.every((d) => d !== '');

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors flex flex-col antialiased selection:bg-[var(--gold)] selection:text-[#0A0A0A]">
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

      {/* Header Bar */}
      <header className="flex items-center justify-between px-5 h-14 border-b border-[var(--border-color)]">
        <button
          onClick={() => navigate(-1)}
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
          <p className="body-md text-[14px] text-[var(--text-secondary)] mb-12">
            Enter the 4-digit code sent to your mobile.
          </p>

          {/* OTP Input Grid */}
          <form onSubmit={handleVerify}>
            <div className="flex justify-center gap-4 mb-12" onPaste={handlePaste}>
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

            {/* Verify Button */}
            <button
              type="submit"
              disabled={!isComplete || isLoading}
              className="w-full h-12 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] label-caps text-[12px] uppercase tracking-[0.15em] hover:bg-[var(--gold)] hover:text-[#0A0A0A] transition-colors duration-300 font-semibold shadow-md disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify & Continue</span>
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
