import { ArrowLeft, FileText, Check, AlertTriangle, ShieldCheck, Mail, RefreshCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function TermsPage() {
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
            to="/privacy"
            className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors label-caps uppercase tracking-wider"
          >
            Privacy Policy
          </Link>
        </div>
      </header>

      {/* Content Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
        {/* Title */}
        <div className="border-b border-[var(--border-color)] pb-6 space-y-2">
          <div className="flex items-center gap-2 text-[var(--gold)] text-[12px] label-caps uppercase tracking-widest font-semibold">
            <FileText size={15} />
            <span>Terms & Conditions of Service</span>
          </div>
          <h1 className="font-garamond text-3xl sm:text-4xl md:text-5xl font-normal text-[var(--text-primary)] tracking-tight">
            Terms of Service
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[var(--text-secondary)]">
            Last Updated: September 16, 2026 | Brand Entity: Ithihasa
          </p>
        </div>

        {/* Introduction */}
        <section className="space-y-4 text-[14px] sm:text-[15px] leading-relaxed text-[var(--text-secondary)]">
          <p>
            Welcome to <strong className="text-[var(--text-primary)]">Ithihasa</strong> ("we," "our," or "us"). By accessing or purchasing from our platform at <strong className="text-[var(--text-primary)]">https://ithihasa.co.in</strong> or through our mobile applications and concierge services, you agree to be bound by the following terms and conditions.
          </p>
          <p>
            Please read these terms carefully before placing orders or establishing an account. If you do not agree to these terms, please refrain from using our services.
          </p>
        </section>

        {/* 1. Atelier Services & Account Eligibility */}
        <section className="space-y-4">
          <h2 className="font-garamond text-2xl font-normal text-[var(--text-primary)] flex items-center gap-2">
            <ShieldCheck size={20} className="text-[var(--gold)]" />
            <span>1. Eligibility & Account Security</span>
          </h2>
          <div className="space-y-2 text-[14px] leading-relaxed text-[var(--text-secondary)]">
            <p>
              To create an account and place orders with Ithihasa, you must be at least 18 years of age and legally competent to enter into binding agreements.
            </p>
            <p>
              You are responsible for maintaining the confidentiality of your credentials (including your phone OTP or linked Google authentication). You agree to immediately notify our Concierge at <a href="mailto:help@ithihasa.co.in" className="text-[var(--gold)] underline">help@ithihasa.co.in</a> of any unauthorized access to your patron account.
            </p>
          </div>
        </section>

        {/* 2. Bespoke Orders, Pricing & Payment */}
        <section className="space-y-4">
          <h2 className="font-garamond text-2xl font-normal text-[var(--text-primary)] flex items-center gap-2">
            <Check size={20} className="text-[var(--gold)]" />
            <span>2. Craftsmanship, Orders & Pricing</span>
          </h2>
          <div className="space-y-3 text-[14px] leading-relaxed text-[var(--text-secondary)]">
            <p>
              Ithihasa garments are handcrafted using natural silks, pure pashminas, and traditional brocades. Slight variations in weave texture, natural dye depth, and hand embroidery are intrinsic signatures of authentic Indian heritage craftsmanship and are not considered defects.
            </p>
            <p>
              Prices are listed in Indian Rupees (₹) inclusive of applicable goods and services taxes. Payments must be rendered through our authorized payment gateways (e.g., PhonePe, credit/debit cards, UPI, or net banking) prior to dispatch or custom tailoring execution.
            </p>
          </div>
        </section>

        {/* 3. Returns, Exchanges & Refunds (User's Exact Policy) */}
        <section className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 sm:p-6 space-y-3">
          <h2 className="font-garamond text-xl font-normal text-[var(--gold)] flex items-center gap-2">
            <RefreshCcw size={18} />
            <span>3. Returns, Exchanges & Refund Policy</span>
          </h2>
          <div className="space-y-2 text-[13.5px] leading-relaxed text-[var(--text-secondary)]">
            <p>
              <strong className="text-[var(--text-primary)]">7-Day Standard Window:</strong> Ready-to-wear silhouettes and catalog pieces may be returned or exchanged within <strong className="text-[var(--text-primary)]">7 days</strong> of delivery, provided the garment is in its original unworn condition, unwashed, unaltered, and accompanied by all authentic tags and luxury packaging.
            </p>
            <p>
              <strong className="text-[var(--text-primary)]">Bespoke & Made-to-Measure Items:</strong> Pieces created with custom patron measurements, personalized embroidery, or made-to-order bespoke specifications are <strong className="text-[var(--gold)]">strictly non-refundable and non-returnable</strong>, except in the rare event of a verified manufacturing defect.
            </p>
            <p>
              To initiate a return or exchange under our 7-day policy, navigate to your Orders section or contact our Concierge team at <a href="mailto:help@ithihasa.co.in" className="text-[var(--gold)] underline font-medium">help@ithihasa.co.in</a>. Approved refunds are credited to the original payment source within 5–7 business days after physical inspection at our atelier.
            </p>
          </div>
        </section>

        {/* 4. Intellectual Property */}
        <section className="space-y-4">
          <h2 className="font-garamond text-2xl font-normal text-[var(--text-primary)] flex items-center gap-2">
            <ShieldCheck size={20} className="text-[var(--gold)]" />
            <span>4. Intellectual Property Rights</span>
          </h2>
          <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
            All textile patterns, silhouette designs, photography, lookbooks, logos, trademarks, and software code appearing on <strong className="text-[var(--text-primary)]">https://ithihasa.co.in</strong> are the exclusive intellectual property of Ithihasa. No reproduction, modification, or commercial exploitation is permitted without prior written consent.
          </p>
        </section>

        {/* 5. Limitation of Liability */}
        <section className="space-y-4">
          <h2 className="font-garamond text-2xl font-normal text-[var(--text-primary)] flex items-center gap-2">
            <AlertTriangle size={20} className="text-[var(--gold)]" />
            <span>5. Limitation of Liability</span>
          </h2>
          <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
            To the fullest extent permissible by law, Ithihasa's aggregate liability arising out of any purchase shall not exceed the total price paid by the customer for the specific item in dispute. We are not liable for incidental, indirect, or consequential delays attributable to courier disruptions or force majeure events.
          </p>
        </section>

        {/* 6. Governing Law & Dispute Resolution */}
        <section className="space-y-4">
          <h2 className="font-garamond text-2xl font-normal text-[var(--text-primary)] flex items-center gap-2">
            <FileText size={20} className="text-[var(--gold)]" />
            <span>6. Governing Law & Jurisdiction</span>
          </h2>
          <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
            These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in India.
          </p>
        </section>

        {/* 7. Contact Us */}
        <section className="border-t border-[var(--border-color)] pt-6 space-y-3">
          <h2 className="font-garamond text-2xl font-normal text-[var(--text-primary)] flex items-center gap-2">
            <Mail size={20} className="text-[var(--gold)]" />
            <span>7. Contact & Concierge Support</span>
          </h2>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 sm:p-5 text-[13.5px] space-y-1.5 text-[var(--text-secondary)]">
            <p><strong className="text-[var(--text-primary)]">Brand:</strong> Ithihasa</p>
            <p><strong className="text-[var(--text-primary)]">Patron Support:</strong> <a href="mailto:help@ithihasa.co.in" className="text-[var(--gold)] underline font-medium">help@ithihasa.co.in</a></p>
            <p><strong className="text-[var(--text-primary)]">Website:</strong> <a href="https://ithihasa.co.in" className="text-[var(--gold)] underline">https://ithihasa.co.in</a></p>
          </div>
        </section>
      </main>
    </div>
  );
}
