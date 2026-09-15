import { ArrowLeft, Shield, Mail, Lock, UserCheck, Eye, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-manrope selection:bg-[var(--gold)] selection:text-[#0A0A0A]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors text-[13px] label-caps tracking-widest uppercase cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <span className="font-garamond text-xl text-[var(--gold)] font-medium tracking-wider uppercase">
            Ithihasa
          </span>
          <Link
            to="/terms"
            className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors label-caps uppercase tracking-wider"
          >
            Terms of Service
          </Link>
        </div>
      </header>

      {/* Content Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
        {/* Title */}
        <div className="border-b border-[var(--border-color)] pb-6 space-y-2">
          <div className="flex items-center gap-2 text-[var(--gold)] text-[12px] label-caps uppercase tracking-widest font-semibold">
            <Shield size={15} />
            <span>Legal & Data Protection</span>
          </div>
          <h1 className="font-garamond text-3xl sm:text-4xl md:text-5xl font-normal text-[var(--text-primary)] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[var(--text-secondary)]">
            Effective Date: September 16, 2026 | Brand Entity: Ithihasa
          </p>
        </div>

        {/* Introduction */}
        <section className="space-y-4 text-[14px] sm:text-[15px] leading-relaxed text-[var(--text-secondary)]">
          <p>
            Welcome to <strong className="text-[var(--text-primary)]">Ithihasa</strong> ("we," "our," or "us"). We craft royal heritage clothing, silk silhouettes, and bespoke artisanal garments. We honor your personal privacy with the same meticulous care and discretion that guides our ateliers.
          </p>
          <p>
            This Privacy Policy governs our web application (<strong className="text-[var(--text-primary)]">https://ithihasa.co.in</strong>), our mobile applications, and concierge services. It describes what information we collect, how it is safeguarded, and your rights in compliance with applicable laws, including the Indian Information Technology Act, 2000, and the Digital Personal Data Protection (DPDP) Act, 2023.
          </p>
        </section>

        {/* 1. Information We Collect */}
        <section className="space-y-4">
          <h2 className="font-garamond text-2xl font-normal text-[var(--text-primary)] flex items-center gap-2">
            <UserCheck size={20} className="text-[var(--gold)]" />
            <span>1. Information We Collect</span>
          </h2>
          <div className="space-y-3 text-[14px] leading-relaxed text-[var(--text-secondary)]">
            <p>We collect only necessary information to deliver our bespoke commerce and concierge experience:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-[var(--text-primary)]">Identity & Contact Data:</strong> Your name, email address, telephone number, and delivery/shipping addresses for fulfilling atelier orders.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Google OAuth Account Data:</strong> When signing in using Google, we access only your basic profile information—specifically your <span className="text-[var(--gold)]">name</span>, <span className="text-[var(--gold)]">email address</span>, and <span className="text-[var(--gold)]">profile picture</span>. We never request access to your contacts, Google Drive, calendar, or private emails.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Order & Transactional Data:</strong> Garment selections, measurements, tailoring requests, order numbers, and communication history with our Concierge.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Payment Information:</strong> All payment transactions are securely processed directly through authorized, PCI-DSS certified payment gateways (e.g., PhonePe). We do not store complete credit/debit card numbers or UPI PINs on our servers.
              </li>
            </ul>
          </div>
        </section>

        {/* 2. How We Use Your Information */}
        <section className="space-y-4">
          <h2 className="font-garamond text-2xl font-normal text-[var(--text-primary)] flex items-center gap-2">
            <Eye size={20} className="text-[var(--gold)]" />
            <span>2. Purpose & Use of Data</span>
          </h2>
          <div className="space-y-2 text-[14px] leading-relaxed text-[var(--text-secondary)]">
            <p>Your information is used strictly to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Create and administer your Ithihasa patron account.</li>
              <li>Process, tailor, and dispatch your heritage garments and orders.</li>
              <li>Provide customer support, bespoke order assistance, and live concierge dialogues.</li>
              <li>Notify you of order updates, shipment tracking, and dispatch timelines.</li>
              <li>Comply with statutory tax, accounting, and legal requirements.</li>
            </ul>
            <p className="pt-2 font-medium text-[var(--text-primary)]">
              We do not sell, rent, or monetize your personal data to any third-party marketing brokers.
            </p>
          </div>
        </section>

        {/* 3. Google API Services User Data Policy */}
        <section className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 sm:p-6 space-y-3">
          <h2 className="font-garamond text-xl font-normal text-[var(--gold)] flex items-center gap-2">
            <Lock size={18} />
            <span>3. Google User Data & OAuth Compliance</span>
          </h2>
          <p className="text-[13.5px] leading-relaxed text-[var(--text-secondary)]">
            Ithihasa's use and transfer of information received from Google APIs adheres to the{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--gold)] underline hover:opacity-80"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
          <p className="text-[13.5px] leading-relaxed text-[var(--text-secondary)]">
            Google user data is solely utilized to authenticate the patron and provide instant, passwordless sign-in. We do not transfer or share your Google user data with external advertisers or AI foundation training systems.
          </p>
        </section>

        {/* 4. Data Security & Retention */}
        <section className="space-y-4">
          <h2 className="font-garamond text-2xl font-normal text-[var(--text-primary)] flex items-center gap-2">
            <Shield size={20} className="text-[var(--gold)]" />
            <span>4. Security & Data Retention</span>
          </h2>
          <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
            We employ industry-standard encryption protocols (TLS/HTTPS in transit and secure hashed tokens at rest). Your order records are retained as mandated by Indian GST and commercial legislation. Patron profile details remain until an explicit account deletion request is made.
          </p>
        </section>

        {/* 5. Your Rights & Data Deletion */}
        <section className="space-y-4">
          <h2 className="font-garamond text-2xl font-normal text-[var(--text-primary)] flex items-center gap-2">
            <RefreshCw size={20} className="text-[var(--gold)]" />
            <span>5. Patron Rights & Account Deletion</span>
          </h2>
          <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
            You hold the right to access, rectify, or request the deletion of your personal account data at any time. To request data deletion or an export of your information, simply message our Concierge or email{' '}
            <a href="mailto:help@ithihasa.co.in" className="text-[var(--gold)] underline font-medium">
              help@ithihasa.co.in
            </a>
            . We process legitimate deletion requests within 30 business days.
          </p>
        </section>

        {/* 6. Grievance Officer & Contact Information */}
        <section className="border-t border-[var(--border-color)] pt-6 space-y-3">
          <h2 className="font-garamond text-2xl font-normal text-[var(--text-primary)] flex items-center gap-2">
            <Mail size={20} className="text-[var(--gold)]" />
            <span>6. Grievance Redressal & Contact</span>
          </h2>
          <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
            In accordance with the Information Technology Act, 2000, and Rules made thereunder:
          </p>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 sm:p-5 text-[13.5px] space-y-1.5 text-[var(--text-secondary)]">
            <p><strong className="text-[var(--text-primary)]">Grievance & Legal Officer:</strong> Ithihasa Legal Secretariat</p>
            <p><strong className="text-[var(--text-primary)]">Brand Entity:</strong> Ithihasa</p>
            <p><strong className="text-[var(--text-primary)]">Official Email:</strong> <a href="mailto:help@ithihasa.co.in" className="text-[var(--gold)] underline">help@ithihasa.co.in</a></p>
            <p><strong className="text-[var(--text-primary)]">Website:</strong> <a href="https://ithihasa.co.in" className="text-[var(--gold)] underline">https://ithihasa.co.in</a></p>
          </div>
        </section>
      </main>
    </div>
  );
}
