import React, { useState } from 'react';
import { ArrowLeft, Check, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAvatar } from '../context/AvatarContext.js';
import { updateUserProfile, sendOtpToPhone } from '../api/auth.js';

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedAvatar, setAvatar, avatarOptions, profileData, setProfileData } = useAvatar();

  const draft = (location.state as any)?.draftProfile;

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

  // Track the authoritative verified phone (from returning OTP verification or existing verified profile)
  const initialVerifiedPhone = draft?.phone_verified
    ? draft.phone
    : profileData.phone_verified
    ? profileData.phone
    : null;

  const [verifiedPhone] = useState<string | null>(initialVerifiedPhone);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);

  const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';
  const cleanVerified = verifiedPhone ? verifiedPhone.replace(/\D/g, '').slice(-10) : null;
  const isPhoneVerified = Boolean(cleanPhone && cleanVerified && cleanPhone === cleanVerified);

  const canSave = !isSaving && (cleanPhone.length === 0 || isPhoneVerified);

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
              email,
              phone: cleanPhone,
              chosenAvatar,
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cleanPhone.length > 0 && !isPhoneVerified) {
      setToastMessage('Please verify your mobile number via OTP before saving');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsSaving(true);

    try {
      setAvatar(chosenAvatar);
      setProfileData({
        fullName,
        email,
        phone: cleanPhone || '',
        phone_verified: isPhoneVerified,
      });

      await updateUserProfile({
        name: fullName,
        email,
        phone: cleanPhone || null,
      }).catch(() => {});

      setToastMessage('Profile Updated Successfully');
      setTimeout(() => {
        setToastMessage(null);
        navigate('/account');
      }, 1000);
    } catch (err: any) {
      setToastMessage(err.message || 'Profile Updated');
      setTimeout(() => {
        setToastMessage(null);
        navigate('/account');
      }, 1200);
    } finally {
      setIsSaving(false);
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
      {/* Stitch Toast Notification */}
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

      {/* TopAppBar matching Stitch */}
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
      <main className="pt-28 pb-16 px-4 md:px-20 max-w-md mx-auto">
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

            {/* Email Address */}
            <div className="relative border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-2">
              <label
                htmlFor="email"
                className="block text-[11px] label-caps tracking-widest text-[var(--text-secondary)] uppercase mb-1"
              >
                EMAIL ADDRESS
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40"
              />
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

            {/* Actions */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={!canSave}
                className="w-full bg-[var(--gold)] text-[#0A0A0A] py-4 label-caps tracking-[0.2em] uppercase hover:bg-[var(--gold-bright)] transition-all duration-300 font-bold shadow-[0_4px_24px_rgba(201,162,75,0.25)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? 'SAVING CHANGES...' : 'SAVE CHANGES'}
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleDiscard}
                className="label-caps text-[12px] tracking-wider text-[var(--text-secondary)] underline hover:text-[var(--text-primary)] transition-colors uppercase"
              >
                DISCARD CHANGES
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
