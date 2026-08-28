import React, { useState } from 'react';
import { ArrowLeft, Check, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAvatar } from '../context/AvatarContext.js';

import { updateUserProfile } from '../api/auth.js';

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedAvatar, setAvatar, avatarOptions, profileData, setProfileData } = useAvatar();

  const [chosenAvatar, setChosenAvatar] = useState<string>(selectedAvatar);
  const [fullName, setFullName] = useState<string>(profileData.fullName);
  const [email, setEmail] = useState<string>(profileData.email);
  const [phone, setPhone] = useState<string>(profileData.phone);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      setAvatar(chosenAvatar);
      setProfileData({
        fullName,
        email,
        phone,
      });

      await updateUserProfile({
        name: fullName,
        email,
        phone,
      }).catch(() => {}); // Graceful if offline/guest

      setToastMessage('Profile Updated Successfully');
      setTimeout(() => {
        setToastMessage(null);
        navigate('/account');
      }, 1200);
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
          onClick={() => navigate('/account')}
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

        <div className="w-8 h-8" /> {/* Spacer for balanced center alignment */}
      </header>

      {/* Main Content Canvas with minimal top gap */}
      <main className="pt-20 pb-20 px-4 md:px-20 max-w-[1440px] mx-auto min-h-screen flex flex-col items-center">
        <div className="w-full max-w-md mt-2">
          {/* Avatar Selection Section */}
          <div className="flex flex-col items-center mb-8 w-full">
            <h2 className="label-caps tracking-widest text-[12px] text-[var(--text-secondary)] uppercase mb-5">
              CHOOSE YOUR AVATAR
            </h2>

            <div className="flex flex-wrap justify-center gap-5 w-full">
              {avatarOptions.map((option) => {
                const isSelected = chosenAvatar === option.src;

                return (
                  <div
                    key={option.id}
                    onClick={() => setChosenAvatar(option.src)}
                    className="relative group cursor-pointer select-none"
                  >
                    {/* Golden Selection Ring */}
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center p-1 transition-all duration-300 ${
                        isSelected
                          ? 'border-2 border-[var(--gold)] scale-105 shadow-[0_0_15px_rgba(201,162,75,0.35)] ring-2 ring-[var(--gold)]/30'
                          : 'border border-[var(--border-color)] hover:border-[var(--gold)]/60 opacity-80 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ borderRadius: '9999px' }}
                    >
                      <div
                        className="w-full h-full rounded-full overflow-hidden"
                        style={{ borderRadius: '9999px' }}
                      >
                        <img
                          alt={option.name}
                          className="w-full h-full object-cover"
                          style={{ borderRadius: '9999px' }}
                          src={option.src}
                        />
                      </div>
                    </div>

                    {/* Floating Gold Badge */}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 bg-[var(--gold)] text-[#0A0A0A] rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-in zoom-in-75 duration-200 z-10">
                        <Check size={14} strokeWidth={3.5} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSave} className="w-full space-y-6">
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

            {/* Phone Number */}
            <div className="relative border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-2">
              <label
                htmlFor="phone"
                className="block text-[11px] label-caps tracking-widest text-[var(--text-secondary)] uppercase mb-1"
              >
                PHONE NUMBER (10 DIGITS)
              </label>
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
            </div>

            {/* Actions */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] py-4 label-caps tracking-widest uppercase hover:bg-[var(--gold)] hover:text-[#0A0A0A] transition-colors duration-300 font-semibold disabled:opacity-60"
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
