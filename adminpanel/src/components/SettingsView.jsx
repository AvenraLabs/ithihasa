import React, { useState, useEffect } from 'react';
import {
  Store,
  CreditCard,
  Users,
  Shield,
  Save,
  CheckCircle2,
  Lock,
  Mail,
  UserPlus,
  Trash2,
  Eye,
  EyeOff,
  Smartphone
} from 'lucide-react';
import {
  fetchSettings,
  updateSettings,
  fetchTeamMembers,
  inviteTeamMember,
  removeTeamMember
} from '../api/settings.js';
import { toast } from 'sonner';

export function SettingsView() {
  const [activeSection, setActiveSection] = useState('general');
  const [isSaved, setIsSaved] = useState(false);

  // General Settings State
  const [storeName, setStoreName] = useState('Ithihasa Atelier');
  const [storeTagline, setStoreTagline] = useState('Wear Your Legacy');
  const [contactEmail, setContactEmail] = useState('concierge@ithihasa.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // PhonePe Payment Gateway State
  const [phonepeMerchantId, setPhonepeMerchantId] = useState('PGTESTPAYUAT');
  const [phonepeSaltKey, setPhonepeSaltKey] = useState('••••••••••••••••••••••••');
  const [phonepeSaltIndex, setPhonepeSaltIndex] = useState('1');
  const [phonepeEnv, setPhonepeEnv] = useState('SANDBOX');
  const [showSecret, setShowSecret] = useState(false);

  // Team State
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true);
        const [settingsData, teamData] = await Promise.all([
          fetchSettings().catch(() => null),
          fetchTeamMembers().catch(() => null),
        ]);
        if (settingsData) {
          if (settingsData.storeName) setStoreName(settingsData.storeName);
          if (settingsData.storeTagline) setStoreTagline(settingsData.storeTagline);
          if (settingsData.contactEmail) setContactEmail(settingsData.contactEmail);
          if (settingsData.maintenanceMode !== undefined) setMaintenanceMode(settingsData.maintenanceMode);
          if (settingsData.phonepeMerchantId) setPhonepeMerchantId(settingsData.phonepeMerchantId);
          if (settingsData.phonepeSaltKey) setPhonepeSaltKey(settingsData.phonepeSaltKey);
          if (settingsData.phonepeSaltIndex) setPhonepeSaltIndex(settingsData.phonepeSaltIndex);
          if (settingsData.phonepeEnv) setPhonepeEnv(settingsData.phonepeEnv);
        }
        if (teamData && Array.isArray(teamData)) {
          setTeam(teamData);
        }
      } catch (err) {
        console.error('Settings load note:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaved(true);
    try {
      await updateSettings({
        storeName,
        storeTagline,
        contactEmail,
        currency: 'INR (₹)',
        maintenanceMode,
        phonepeMerchantId,
        phonepeSaltKey,
        phonepeSaltIndex,
        phonepeEnv,
      });
      toast.success('Boutique settings saved successfully.');
    } catch (err) {
      toast.error('Failed to sync settings.');
    }
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleRemoveMember = async (id) => {
    setTeam(team.filter((m) => m.id !== id));
    try {
      await removeTeamMember(id).catch(() => null);
      toast.success('Administrator removed.');
    } catch {}
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-[1440px] w-full mx-auto space-y-6 md:space-y-8 flex-1 min-w-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-5 pb-2 border-b border-[var(--border-color)]">
        <div>
          <h1
            className="font-garamond text-[26px] sm:text-[34px] md:text-[44px] text-[var(--text-primary)] font-normal tracking-tight leading-tight m-0"
          >
            Settings
          </h1>
          <p className="body-md text-[13px] sm:text-[14px] md:text-[15px] text-[var(--text-secondary)] mt-1">
            Configure boutique identity, PhonePe payment gateway, and administrator access.
          </p>
        </div>

        {/* Save Status & Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {isSaved && (
            <span className="text-[12.5px] sm:text-[13px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-1.5 animate-in fade-in">
              <CheckCircle2 size={16} />
              <span>Saved successfully</span>
            </span>
          )}
          <button
            onClick={handleSave}
            className="w-full sm:w-auto bg-[var(--gold)] text-[#0A0A0A] font-semibold label-caps text-[11px] px-6 py-3 uppercase tracking-widest hover:brightness-110 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save size={15} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 sm:gap-6 border-b border-[var(--border-color)] overflow-x-auto no-scrollbar font-manrope text-[13px] sm:text-[13.5px] whitespace-nowrap">
        <button
          onClick={() => setActiveSection('general')}
          className={`pb-2.5 sm:pb-3 transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
            activeSection === 'general'
              ? 'text-[var(--text-primary)] border-[var(--gold)] font-bold'
              : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] font-medium'
          }`}
        >
          <Store size={15} />
          <span>General Settings</span>
        </button>

        <button
          onClick={() => setActiveSection('payments')}
          className={`pb-2.5 sm:pb-3 transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
            activeSection === 'payments'
              ? 'text-[var(--text-primary)] border-[var(--gold)] font-bold'
              : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] font-medium'
          }`}
        >
          <Smartphone size={15} />
          <span>PhonePe Payment Gateway</span>
        </button>

        <button
          onClick={() => setActiveSection('team')}
          className={`pb-2.5 sm:pb-3 transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
            activeSection === 'team'
              ? 'text-[var(--text-primary)] border-[var(--gold)] font-bold'
              : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] font-medium'
          }`}
        >
          <Users size={15} />
          <span>Team & Administrators</span>
        </button>
      </div>

      {/* SECTION 1: General Settings */}
      {activeSection === 'general' && (
        <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
          <div className="border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-7 shadow-sm space-y-5 sm:space-y-6">
            <h3 className="font-garamond text-[20px] sm:text-[22px] font-normal text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3">
              Boutique Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 font-manrope text-[13px]">
              <div>
                <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1.5 font-semibold">
                  STORE NAME
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none"
                />
              </div>

              <div>
                <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1.5 font-semibold">
                  BRAND MOTTO / TAGLINE
                </label>
                <input
                  type="text"
                  value={storeTagline}
                  onChange={(e) => setStoreTagline(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1.5 font-semibold">
                  PRIMARY CONCIERGE EMAIL
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none"
                />
                <p className="text-[11.5px] text-[var(--text-secondary)] mt-1">
                  Customer support inquiries and bespoke garment consultation notes route to this email.
                </p>
              </div>
            </div>

            {/* Maintenance Mode Toggle */}
            <div className="pt-4 border-t border-[var(--border-color)] flex justify-between items-center gap-4">
              <div className="pr-2">
                <h4 className="font-semibold text-[13.5px] sm:text-[14px] text-[var(--text-primary)]">
                  Maintenance / Private Salon Mode
                </h4>
                <p className="body-sm text-[12px] sm:text-[12.5px] text-[var(--text-secondary)]">
                  Temporarily gate customer storefront during atelier maintenance or private catalog updates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  maintenanceMode ? 'bg-[var(--gold)]' : 'bg-[var(--border-color)]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </form>
      )}

      {/* SECTION 2: PhonePe Payment Gateway */}
      {activeSection === 'payments' && (
        <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
          <div className="border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-7 shadow-sm space-y-5 sm:space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div>
                <h3 className="font-garamond text-[20px] sm:text-[22px] font-normal text-[var(--text-primary)]">
                  PhonePe Payment Gateway (INR)
                </h3>
                <p className="text-[12px] text-[var(--text-secondary)]">
                  Powers UPI, QR, NetBanking, and Card payments in Indian Rupees (₹).
                </p>
              </div>
              <span className="label-caps text-[10px] bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/30 px-2.5 py-1 uppercase tracking-widest font-bold">
                UPI / INR Active
              </span>
            </div>

            <div className="space-y-4 font-manrope text-[13px]">
              <div>
                <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1.5 font-semibold">
                  PHONEPE MERCHANT ID
                </label>
                <input
                  type="text"
                  value={phonepeMerchantId}
                  onChange={(e) => setPhonepeMerchantId(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] font-mono outline-none"
                  placeholder="e.g. PGTESTPAYUAT"
                />
              </div>

              <div>
                <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1.5 font-semibold">
                  PHONEPE SALT KEY / SECRET
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={phonepeSaltKey}
                    onChange={(e) => setPhonepeSaltKey(e.target.value)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] font-mono outline-none pr-10"
                    placeholder="Enter salt key"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1.5 font-semibold">
                    PHONEPE SALT INDEX
                  </label>
                  <input
                    type="text"
                    value={phonepeSaltIndex}
                    onChange={(e) => setPhonepeSaltIndex(e.target.value)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] font-mono outline-none"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1.5 font-semibold">
                    ENVIRONMENT
                  </label>
                  <select
                    value={phonepeEnv}
                    onChange={(e) => setPhonepeEnv(e.target.value)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[var(--text-primary)] outline-none cursor-pointer"
                  >
                    <option value="SANDBOX">Sandbox / UAT (Test Mode)</option>
                    <option value="PRODUCTION">Production (Live Mode)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* SECTION 3: Team & Administrators */}
      {activeSection === 'team' && (
        <div className="space-y-5 sm:space-y-6 max-w-4xl">
          {/* Members Table */}
          <div className="border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30 flex justify-between items-center">
              <div>
                <h3 className="font-garamond text-[19px] sm:text-[20px] font-normal text-[var(--text-primary)]">
                  Active Administrators ({team.length})
                </h3>
                <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                  Authenticated accounts with administrative atelier access.
                </p>
              </div>
              <span className="label-caps text-[10px] text-[var(--gold)] border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-2.5 py-1 font-semibold">
                Role: Administrator
              </span>
            </div>

            <div className="divide-y divide-[var(--border-color)]">
              {team.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-secondary)]">
                  <Shield size={24} className="mx-auto opacity-40 text-[var(--gold)] mb-2" />
                  <p className="font-garamond text-[16px] text-[var(--text-primary)]">Active Administrator</p>
                  <p className="text-[12px]">The primary owner account is currently active.</p>
                </div>
              ) : (
                team.map((member) => (
                  <div
                    key={member.id}
                    className="p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-[var(--bg-secondary)]/30 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--gold)]/30 text-[var(--gold)] font-bold flex items-center justify-center text-[13px] shrink-0">
                        {(member.name || member.email || 'A')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-[13.5px] sm:text-[14px] text-[var(--text-primary)] truncate">
                          {member.name || 'Administrator'}
                        </h4>
                        <span className="text-[12px] text-[var(--text-secondary)] block truncate">{member.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-color)]/60">
                      <span className="label-caps text-[9.5px] sm:text-[10px] px-3 py-1 uppercase bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30 font-semibold">
                        Administrator
                      </span>

                      {team.length > 1 && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-[var(--text-secondary)] hover:text-rose-500 p-1.5 transition-colors cursor-pointer"
                          title="Remove Access"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
