import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Check, CheckCircle2, Lock, KeyRound, Eye, EyeOff, X, RefreshCw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAvatar } from '../context/AvatarContext.js';
import {
  updateUserProfile,
  sendOtpToPhone,
  sendEmailOtp,
  changePassword,
  verifyPhoneOtp,
  verifyEmailOtp,
} from '../api/auth.js';

interface VerificationModalState {
  isOpen: boolean;
  type: 'phone' | 'email';
  target: string;
  activeOtp: string | null;
}

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedAvatar, setAvatar, avatarOptions, profileData, setProfileData } = useAvatar();

  const draft = (location.state as any)?.draftProfile;

  const isGoogleAuth = Boolean(profileData.is_google_auth);
  const hasPassword = Boolean(profileData.has_password);

  const [chosenAvatar, setChosenAvatar] = useState<string>(
    draft?.chosenAvatar || selectedAvatar
  );
  const [fullName, setFullName] = useState<string>(
    draft?.fullName ?? profileData.fullName
  );
  const [email, setEmail] = useState<string>(
    draft?.email ?? profileData.email
  );
  const [phone, setPhone] = useState<string>(
    draft?.phone ?? profileData.phone
  );

  // Track verified phone and email in state
  const initialVerifiedPhone = draft?.phone_verified
    ? draft.phone
    : profileData.phone_verified
    ? profileData.phone
    : null;
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(initialVerifiedPhone);

  const initialVerifiedEmail = draft?.email_verified
    ? draft.email
    : profileData.email || null;
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(initialVerifiedEmail);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState<boolean>(false);

  // In-page OTP Verification Modal state
  const [verifyModal, setVerifyModal] = useState<VerificationModalState>({
    isOpen: false,
    type: 'phone',
    target: '',
    activeOtp: null,
  });
  const [modalOtpDigits, setModalOtpDigits] = useState<string[]>(['', '', '', '']);
  const [modalCooldown, setModalCooldown] = useState<number>(20);
  const [isModalVerifying, setIsModalVerifying] = useState<boolean>(false);
  const modalInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 20-second countdown timer for in-page modal resend
  useEffect(() => {
    if (!verifyModal.isOpen || modalCooldown <= 0) return;
    const timer = setTimeout(() => setModalCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [verifyModal.isOpen, modalCooldown]);

  const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';
  const cleanVerifiedPhone = verifiedPhone ? verifiedPhone.replace(/\D/g, '').slice(-10) : null;
  const isPhoneVerified = Boolean(cleanPhone && cleanVerifiedPhone && cleanPhone === cleanVerifiedPhone);

  const cleanEmail = email.trim().toLowerCase();
  const cleanVerifiedEmail = verifiedEmail ? verifiedEmail.trim().toLowerCase() : null;
  const isEmailVerified = Boolean(
    isGoogleAuth ||
    !cleanEmail ||
    (cleanEmail && cleanVerifiedEmail && cleanEmail === cleanVerifiedEmail)
  );

  const hasUnverifiedPhone = Boolean(cleanPhone.length > 0 && !isPhoneVerified);
  const hasUnverifiedEmail = Boolean(cleanEmail.length > 0 && !isEmailVerified);
  const canSave = !isSaving && !hasUnverifiedPhone && !hasUnverifiedEmail;

  const handleVerifyPhone = async () => {
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setToastMessage('Please enter a valid 10-digit mobile number');
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }
    setIsSendingOtp(true);
    try {
      const res = await sendOtpToPhone(cleanPhone);
      setModalOtpDigits(['', '', '', '']);
      setModalCooldown(20);
      setVerifyModal({
        isOpen: true,
        type: 'phone',
        target: cleanPhone,
        activeOtp: res?.otp || null,
      });
      setTimeout(() => {
        modalInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to send verification code');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setToastMessage('Please enter a valid email address');
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }
    setIsSendingEmailOtp(true);
    try {
      const res = await sendEmailOtp(cleanEmail);
      setModalOtpDigits(['', '', '', '']);
      setModalCooldown(20);
      setVerifyModal({
        isOpen: true,
        type: 'email',
        target: cleanEmail,
        activeOtp: res?.otp || null,
      });
      setTimeout(() => {
        modalInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to send email verification code');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  const handleConfirmModalOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = modalOtpDigits.join('');
    if (code.length < 4) {
      setToastMessage('Please enter the complete 4-digit code');
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }

    setIsModalVerifying(true);
    try {
      if (verifyModal.type === 'phone') {
        const res = await verifyPhoneOtp(verifyModal.target, code);
        setVerifiedPhone(res.phone || verifyModal.target);
        setProfileData({
          phone: res.phone || verifyModal.target,
          phone_verified: true,
        });
        setToastMessage('Mobile number verified successfully');
      } else {
        const res = await verifyEmailOtp(verifyModal.target, code);
        setVerifiedEmail(res.email || verifyModal.target);
        setProfileData({
          email: res.email || verifyModal.target,
        });
        setToastMessage('Email address verified successfully');
      }
      setVerifyModal({ isOpen: false, type: 'phone', target: '', activeOtp: null });
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      setToastMessage(err.message || 'Invalid or expired code. Please try again.');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsModalVerifying(false);
    }
  };

  const handleModalResend = async () => {
    if (modalCooldown > 0) return;
    try {
      let res;
      if (verifyModal.type === 'phone') {
        res = await sendOtpToPhone(verifyModal.target);
      } else {
        res = await sendEmailOtp(verifyModal.target);
      }
      if (res?.otp) {
        setVerifyModal((prev) => ({ ...prev, activeOtp: res?.otp || null }));
      }
      setModalCooldown(20);
      setToastMessage('New verification code sent');
      setTimeout(() => setToastMessage(null), 2500);
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to resend code');
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const digit = val.slice(-1);
    const updated = [...modalOtpDigits];
    updated[index] = digit;
    setModalOtpDigits(updated);

    if (digit && index < 3) {
      modalInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !modalOtpDigits[index] && index > 0) {
      modalInputRefs.current[index - 1]?.focus();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cleanPhone.length > 0 && !isPhoneVerified) {
      setToastMessage('Please verify your mobile number via OTP before saving');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    if (cleanEmail.length > 0 && !isEmailVerified) {
      setToastMessage('Please verify your email address via OTP before saving');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsSaving(true);

    try {
      setAvatar(chosenAvatar);
      setProfileData({
        fullName,
        email: cleanEmail,
        phone: cleanPhone || '',
        phone_verified: isPhoneVerified,
      });

      await updateUserProfile({
        name: fullName,
        email: cleanEmail || undefined,
        phone: cleanPhone || null,
      });

      setToastMessage('Profile Updated Successfully');
      setTimeout(() => {
        setToastMessage(null);
        navigate('/account');
      }, 1000);
    } catch (err: any) {
      setToastMessage(err.message || 'Profile Updated');
      setTimeout(() => {
        setToastMessage(null);
      }, 3500);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setToastMessage('New password must be at least 6 characters');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    if (newPassword !== confirmPassword) {
      setToastMessage('Passwords do not match');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    if (hasPassword && !currentPassword) {
      setToastMessage('Please enter your current password');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await changePassword({
        currentPassword: hasPassword ? currentPassword : undefined,
        newPassword,
      });
      setProfileData({ has_password: true });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setToastMessage(res.message || 'Password saved successfully');
      setTimeout(() => setToastMessage(null), 2500);
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to update password');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleDiscard = () => {
    setChosenAvatar(selectedAvatar);
    setFullName(profileData.fullName);
    setEmail(profileData.email);
    setPhone(profileData.phone);
    navigate('/account');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] bg-[var(--bg-card)] border border-[var(--border-color)] px-6 py-3.5 shadow-2xl flex items-center gap-3 whitespace-nowrap max-w-[90vw] transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={18} className="text-[var(--gold)] shrink-0" />
          <span
            className="text-[17px] tracking-wide text-[var(--gold)] font-medium"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            {toastMessage}
          </span>
        </div>
      )}

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-b border-[var(--border-color)] flex justify-between items-center px-4 md:px-20 h-16 transition-all duration-300 ease-in-out">
        <button
          onClick={handleDiscard}
          className="text-[var(--text-primary)] hover:opacity-70 transition-opacity flex items-center justify-center p-2"
          aria-label="Go Back"
        >
          <ArrowLeft size={22} />
        </button>

        <h1
          className="text-[20px] md:text-[24px] tracking-widest uppercase font-medium"
          style={{ color: 'var(--gold)', fontFamily: "'EB Garamond', Georgia, serif" }}
        >
          EDIT PROFILE
        </h1>

        <div className="w-8" />
      </header>

      {/* Main Content */}
      <main className="pt-28 pb-24 px-4 md:px-20 max-w-md mx-auto space-y-12">
        <div className="space-y-8">
          {/* Avatar Selector */}
          <div>
            <div className="flex justify-center items-center gap-6 overflow-x-auto py-2">
              {avatarOptions.map((opt) => {
                const isSelected = chosenAvatar === opt.src;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setChosenAvatar(opt.src)}
                    className={`relative rounded-xl p-1 transition-all duration-300 ${
                      isSelected
                        ? 'border-2 border-[var(--gold)] scale-105 shadow-md shadow-[var(--gold)]/20'
                        : 'border border-[var(--border-color)] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-[var(--bg-secondary)] flex items-center justify-center">
                      <img
                        src={opt.src}
                        alt={opt.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 bg-[var(--gold)] text-black rounded-full p-0.5">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* Full Name */}
            <div className="relative border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-2">
              <label
                htmlFor="fullName"
                className="block text-[11px] label-caps tracking-widest text-[var(--text-secondary)] uppercase mb-1"
              >
                FULL NAME
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40"
              />
            </div>

            {/* Email Address with Google Lock and Verification */}
            <div className="relative border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-2">
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="email"
                  className="block text-[11px] label-caps tracking-widest text-[var(--text-secondary)] uppercase"
                >
                  EMAIL ADDRESS
                </label>

                {isGoogleAuth ? (
                  <div className="flex items-center gap-1.5 text-[var(--gold)]">
                    <Lock size={12} className="shrink-0" />
                    <span className="label-caps text-[10px] uppercase tracking-wider font-semibold">
                      Linked with Google
                    </span>
                  </div>
                ) : cleanEmail ? (
                  isEmailVerified ? (
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 size={13} className="shrink-0" />
                      <span className="label-caps text-[10px] uppercase tracking-wider font-semibold">
                        Verified
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleVerifyEmail}
                      disabled={isSendingEmailOtp}
                      className="label-caps text-[11px] uppercase tracking-wider text-[var(--gold)] hover:text-[var(--gold-bright)] underline font-semibold cursor-pointer disabled:opacity-40"
                    >
                      {isSendingEmailOtp ? 'Sending code...' : 'Verify Email'}
                    </button>
                  )
                ) : null}
              </div>

              <input
                id="email"
                type="email"
                disabled={isGoogleAuth}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required={isGoogleAuth}
                className={`w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40 ${
                  isGoogleAuth ? 'opacity-60 cursor-not-allowed select-none' : ''
                }`}
              />

              {isGoogleAuth ? (
                <p className="text-[11px] text-[var(--text-secondary)]/80 mt-1.5 flex items-center gap-1.5 leading-tight">
                  Email is locked to your authenticated Google account and cannot be modified.
                </p>
              ) : (
                cleanEmail && !isEmailVerified && (
                  <p className="text-[11px] text-amber-500/90 mt-1.5 flex items-center gap-1.5 leading-tight">
                    Please verify this email via OTP before saving changes.
                  </p>
                )
              )}
            </div>

            {/* Phone Number with Verification Badge & Logic */}
            <div className="relative border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-2">
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="phone"
                  className="block text-[11px] label-caps tracking-widest text-[var(--text-secondary)] uppercase"
                >
                  PHONE NUMBER (10 DIGITS)
                </label>

                {cleanPhone.length === 10 ? (
                  isPhoneVerified ? (
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 size={13} className="shrink-0" />
                      <span className="label-caps text-[10px] uppercase tracking-wider font-semibold">
                        Verified
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleVerifyPhone}
                      disabled={isSendingOtp}
                      className="label-caps text-[11px] uppercase tracking-wider text-[var(--gold)] hover:text-[var(--gold-bright)] underline font-semibold cursor-pointer disabled:opacity-40"
                    >
                      {isSendingOtp ? 'Sending code...' : 'Verify Phone'}
                    </button>
                  )
                ) : null}
              </div>

              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40 tabular-nums"
              />

              {cleanPhone.length > 0 && !isPhoneVerified && (
                <p className="text-[11px] text-amber-500/90 mt-1.5 flex items-center gap-1.5 leading-tight">
                  Please verify this mobile number via OTP before saving changes.
                </p>
              )}
            </div>

            {/* Save Profile Button */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={!canSave}
                className="w-full bg-[var(--gold)] text-[#0A0A0A] py-3.5 label-caps tracking-[0.2em] uppercase hover:bg-[var(--gold-bright)] transition-all duration-300 font-bold shadow-[0_4px_24px_rgba(201,162,75,0.25)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? 'SAVING CHANGES...' : 'SAVE CHANGES'}
              </button>

              {(hasUnverifiedPhone || hasUnverifiedEmail) && (
                <button
                  type="button"
                  onClick={() => {
                    setPhone(profileData.phone || '');
                    setEmail(profileData.email || '');
                    setVerifiedPhone(profileData.phone_verified ? profileData.phone : null);
                    setVerifiedEmail(profileData.email || null);
                    setToastMessage('Reverted unverified edits to current profile');
                    setTimeout(() => setToastMessage(null), 2500);
                  }}
                  className="w-full text-center py-2 text-[11px] label-caps tracking-wider text-amber-500/90 hover:text-amber-400 underline uppercase transition-colors"
                >
                  Discard Unverified Changes
                </button>
              )}
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleDiscard}
                className="label-caps text-[12px] tracking-wider text-[var(--text-secondary)] underline hover:text-[var(--text-primary)] transition-colors uppercase"
              >
                DISCARD ALL & EXIT
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 pt-4">
            <div className="h-[1px] flex-grow bg-[var(--border-color)]" />
            <span className="label-caps text-[11px] text-[var(--gold)] uppercase tracking-widest flex items-center gap-1.5">
              <KeyRound size={13} />
              {hasPassword ? 'Security & Password' : 'Set Account Password'}
            </span>
            <div className="h-[1px] flex-grow bg-[var(--border-color)]" />
          </div>

          {/* Set / Change Password Section */}
          <form onSubmit={handlePasswordSubmit} className="space-y-6 pt-2">
            <div className="text-center sm:text-left">
              <p className="body-md text-[13px] text-[var(--text-secondary)]">
                {hasPassword
                  ? 'Update your atelier password with your current credentials.'
                  : 'Add a password so you can also sign in with your mobile number.'}
              </p>
            </div>

            {/* Current Password (only if user already has a password) */}
            {hasPassword && (
              <div className="relative border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-2">
                <label
                  htmlFor="currentPassword"
                  className="block text-[11px] label-caps tracking-widest text-[var(--text-secondary)] uppercase mb-1"
                >
                  CURRENT PASSWORD
                </label>
                <div className="flex items-center justify-between">
                  <input
                    id="currentPassword"
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40 pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="p-1 text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors"
                    aria-label={showCurrentPass ? 'Hide current password' : 'Show current password'}
                  >
                    {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* New Password */}
            <div className="relative border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-2">
              <label
                htmlFor="newPassword"
                className="block text-[11px] label-caps tracking-widest text-[var(--text-secondary)] uppercase mb-1"
              >
                {hasPassword ? 'NEW PASSWORD' : 'CREATE PASSWORD'}
              </label>
              <div className="flex items-center justify-between">
                <input
                  id="newPassword"
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="•••••••• (min. 6 characters)"
                  required
                  className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40 pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="p-1 text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors"
                  aria-label={showNewPass ? 'Hide new password' : 'Show new password'}
                >
                  {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="relative border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-2">
              <label
                htmlFor="confirmPassword"
                className="block text-[11px] label-caps tracking-widest text-[var(--text-secondary)] uppercase mb-1"
              >
                CONFIRM PASSWORD
              </label>
              <div className="flex items-center justify-between">
                <input
                  id="confirmPassword"
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40 pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="p-1 text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors"
                  aria-label={showConfirmPass ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Password Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isChangingPass || !newPassword || !confirmPassword || (hasPassword && !currentPassword)}
                className="w-full bg-transparent border border-[var(--border-color)] hover:border-[var(--gold)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] hover:text-[var(--gold)] py-3.5 label-caps tracking-[0.2em] uppercase transition-all duration-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isChangingPass ? 'UPDATING PASSWORD...' : hasPassword ? 'UPDATE PASSWORD' : 'SET PASSWORD'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* In-Page OTP Verification Modal */}
      {verifyModal.isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-[#0A0A0A]/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            {/* Close Modal */}
            <button
              type="button"
              onClick={() => setVerifyModal({ isOpen: false, type: 'phone', target: '', activeOtp: null })}
              className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Modal Title */}
            <div className="text-center space-y-1 pt-1">
              <h3
                className="text-[22px] font-normal text-[var(--text-primary)] tracking-wide"
                style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
              >
                {verifyModal.type === 'phone' ? 'Verify Mobile Number' : 'Verify Email Address'}
              </h3>
              <p className="body-md text-[13px] text-[var(--text-secondary)]">
                Enter the 4-digit verification code sent to{' '}
                <span className="text-[var(--gold)] font-medium">
                  {verifyModal.type === 'phone' ? `+91 ${verifyModal.target}` : verifyModal.target}
                </span>
              </p>
            </div>

            {/* OTP Preview Banner */}
            {verifyModal.activeOtp && (
              <div className="p-3 bg-[var(--gold)]/10 border border-[var(--gold)]/40 rounded text-center">
                <span className="label-caps text-[10px] tracking-widest text-[var(--gold)] font-semibold uppercase block mb-0.5">
                  Verification Code (Live Preview)
                </span>
                <span className="text-[26px] tracking-[0.3em] font-mono font-bold text-[var(--gold)] block">
                  {verifyModal.activeOtp}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const digits = verifyModal.activeOtp!.split('').slice(0, 4);
                    setModalOtpDigits(digits);
                    modalInputRefs.current[3]?.focus();
                  }}
                  className="mt-1 text-[10.5px] font-semibold text-[var(--gold)] hover:underline uppercase tracking-wider block mx-auto cursor-pointer"
                >
                  1-Tap Auto-Fill Code
                </button>
              </div>
            )}

            {/* 4 Digit Inputs */}
            <form onSubmit={handleConfirmModalOtp} className="space-y-6">
              <div className="flex justify-center gap-3">
                {modalOtpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      modalInputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-[22px] font-mono font-bold bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] focus:outline-none rounded transition-colors text-[var(--text-primary)]"
                  />
                ))}
              </div>

              {/* Cooldown & Resend */}
              <div className="text-center">
                {modalCooldown > 0 ? (
                  <span className="label-caps text-[11px] tracking-wider text-[var(--text-secondary)]">
                    Resend code in <span className="text-[var(--gold)] font-semibold">{modalCooldown}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleModalResend}
                    className="label-caps text-[11px] tracking-wider text-[var(--gold)] hover:underline uppercase font-semibold cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <RefreshCw size={12} />
                    Resend Code
                  </button>
                )}
              </div>

              {/* Submit Verification */}
              <button
                type="submit"
                disabled={isModalVerifying || modalOtpDigits.join('').length < 4}
                className="w-full bg-[var(--gold)] text-[#0A0A0A] py-3 label-caps tracking-[0.2em] uppercase hover:bg-[var(--gold-bright)] transition-all duration-300 font-bold shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isModalVerifying ? 'Verifying...' : 'Confirm Verification'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
