import React, { useState } from 'react';
import { ArrowLeft, Check, CheckCircle2, Lock, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAvatar } from '../context/AvatarContext.js';
import { updateUserProfile, sendOtpToPhone, sendEmailOtp, changePassword } from '../api/auth.js';

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

  // Track verified phone and email
  const initialVerifiedPhone = draft?.phone_verified
    ? draft.phone
    : profileData.phone_verified
    ? profileData.phone
    : null;
  const [verifiedPhone] = useState<string | null>(initialVerifiedPhone);

  const initialVerifiedEmail = draft?.email_verified
    ? draft.email
    : profileData.email || null;
  const [verifiedEmail] = useState<string | null>(initialVerifiedEmail);

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

  const canSave = !isSaving && (cleanPhone.length === 0 || isPhoneVerified) && isEmailVerified;

  const handleVerifyPhone = async () => {
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setToastMessage('Please enter a valid 10-digit mobile number');
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }
    setIsSendingOtp(true);
    try {
      const res = await sendOtpToPhone(cleanPhone);
      setToastMessage('Verification code generated');
      setTimeout(() => {
        setToastMessage(null);
        navigate('/verify-otp', {
          state: {
            phone: cleanPhone,
            flow: 'profile',
            otp: res?.otp,
            draftProfile: {
              fullName,
              email: cleanEmail,
              phone: cleanPhone,
              chosenAvatar,
              email_verified: isEmailVerified,
            },
          },
        });
      }, 600);
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
      setToastMessage('Verification code sent to email');
      setTimeout(() => {
        setToastMessage(null);
        navigate('/verify-otp', {
          state: {
            phone: cleanEmail,
            flow: 'email',
            otp: res?.otp,
            draftProfile: {
              fullName,
              email: cleanEmail,
              phone: cleanPhone,
              chosenAvatar,
              phone_verified: isPhoneVerified,
            },
          },
        });
      }, 600);
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to send email verification code');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsSendingEmailOtp(false);
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
            <div className="pt-2">
              <button
                type="submit"
                disabled={!canSave}
                className="w-full bg-[var(--gold)] text-[#0A0A0A] py-3.5 label-caps tracking-[0.2em] uppercase hover:bg-[var(--gold-bright)] transition-all duration-300 font-bold shadow-[0_4px_24px_rgba(201,162,75,0.25)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? 'SAVING CHANGES...' : 'SAVE CHANGES'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleDiscard}
                className="label-caps text-[12px] tracking-wider text-[var(--text-secondary)] underline hover:text-[var(--text-primary)] transition-colors uppercase"
              >
                DISCARD CHANGES
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
    </div>
  );
};
