import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';

export const AtelierPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors antialiased">
      <main className="flex-grow pt-8 md:pt-12 pb-24 md:pb-20 px-5 md:px-20 max-w-[1440px] mx-auto w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-[var(--text-secondary)] label-caps mb-8 text-[11px]">
          <Link to="/" className="hover:text-[var(--text-primary)] transition-colors">
            HOME
          </Link>
          <span>/</span>
          <span className="text-[var(--gold)] uppercase">THE ATELIER</span>
        </nav>

        {/* Hero Section */}
        <section className="mb-16 md:mb-24 text-center max-w-3xl mx-auto">
          <h1
            className="text-[36px] sm:text-[44px] md:text-[56px] text-[var(--text-primary)] mb-4 font-normal tracking-tight"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            The Atelier
          </h1>
          <p className="body-md text-[15px] md:text-[17px] text-[var(--text-secondary)] leading-relaxed">
            Where heritage techniques meet modern editorial excellence. A dedication to the art of the weave.
          </p>
        </section>

        {/* The Art of the Weave - Hero Image */}
        <section className="mb-16 md:mb-24">
          <div className="w-full aspect-[4/3] md:aspect-[21/9] bg-[var(--bg-secondary)] overflow-hidden relative border border-[var(--border-color)]">
            <img
              alt="The Art of the Weave"
              className="w-full h-full object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-700 ease-in-out"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3DSAT-cRFCBXGCmSJdykHPsJTlOjYfA7q6BNk132bGp64eJ2iqtwCTuoyNFKlQMVD2dilkewOkHydj7r2AtugSp47sYzqBv-vTp9PCmI8cgiRi4lbjEC3DQeNpGVVPu2MTKW0RiDYTWR6BWc1lr0OGJquK-huajg7w5maPjNE1ksPP7aABz7-68o7pKmQC1_f9G8F_ZEmjXD6wTuesdKZsvhO_NQrAArkoKXFeefgjbeDBBz-8KVhkQ"
              loading="eager"
            />
          </div>
          <div className="mt-8 md:w-2/3 mx-auto text-center">
            <h2
              className="text-[26px] md:text-[34px] text-[var(--text-primary)] mb-3 font-normal"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              The Art of the Weave
            </h2>
            <p className="body-md text-[14px] md:text-[16px] text-[var(--text-secondary)] leading-relaxed">
              Every thread tells a story of patience and precision. Our master artisans dedicate weeks to a single piece, honoring centuries of tradition while crafting the heirlooms of tomorrow.
            </p>
          </div>
        </section>

        {/* Asymmetric Layout: Heritage Techniques & Master Artisans */}
        <section className="mb-16 md:mb-24 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          <div className="md:col-span-6 md:col-start-2 order-2 md:order-1 flex flex-col items-start">
            <span className="label-caps text-[11px] text-[var(--gold)] tracking-[0.2em] uppercase mb-2 font-bold">
              Heritage Techniques
            </span>
            <h2
              className="text-[28px] md:text-[36px] text-[var(--text-primary)] mb-4 font-normal"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              Master Artisans
            </h2>
            <p className="body-md text-[14px] md:text-[15px] text-[var(--text-secondary)] mb-6 leading-relaxed">
              Our atelier is home to generations of skill. Each master artisan brings a nuanced understanding of tension, texture, and natural dyes, ensuring every garment possesses a unique soul and unparalleled structural grace.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 label-caps text-[12px] text-[var(--text-primary)] hover:text-[var(--gold)] border-b border-[var(--gold)] hover:border-[var(--text-primary)] transition-all pb-1 tracking-widest uppercase group"
            >
              <span>Discover the Silhouettes</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-[var(--gold)]" />
            </Link>
          </div>
          <div className="md:col-span-5 order-1 md:order-2">
            <div className="w-full aspect-[3/4] bg-[var(--bg-secondary)] overflow-hidden relative border border-[var(--border-color)] shadow-sm">
              <img
                alt="Master Artisans at work"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzH61Elm4aq2E3GntOGntpLhHB8Gex2r_qzabt_8pUDraDBYQzmxM-M_RqAZqCVSR2ZftTpYnUGeWqNC71q_jXpBc72l2HVa3Y3-eq00z6ExHSs0Gj0Zf3MNxv2wwDUunZ-3fF4Lwhss938k7GXxAsKbYUC7u89Xzur_T0PjbJxmtSqrTZrv2v_pqhoCTDkFxGMSNbykpSdthHLXmrdmkfkaYM9xaiJNLxVxO18lR-yKTcaiHvWhJyjA"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* Bento Grid: Process & Sourcing */}
        <section className="mb-12 md:mb-16">
          <div className="text-center mb-10">
            <h2
              className="text-[28px] md:text-[36px] text-[var(--text-primary)] uppercase tracking-wide font-normal"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              The Process
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {/* Sourcing */}
            <div className="relative aspect-square md:aspect-auto md:row-span-2 group overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <img
                alt="Sourcing Silks"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1j2TOix2U37txjviP76IOsmZFysi0H5CTJ42f2QQIkDnz6sBNpmg9BW6rhUye9DiXgTg_AU7xTsuiTzhKDclIzwYFc2iev3fS7pp7qPg-qtB7lxnagOr2rlFK1NpdARSau6rooDC9WQ4iU1o9MOpjG3P7qrrrZ70Ggyl4PxUMvLs5asSqAXhkm2rPLsXbzYQDSUTqcGnwPJ-GJt5stTK4nCXiSJit68mwls-7ATzd8WRrPpowg7pimw"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-8">
                <h3
                  className="text-[22px] md:text-[26px] text-white font-normal mb-1"
                  style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                >
                  Sourcing the Finest Silks
                </h3>
                <p className="body-sm text-[13px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-2 group-hover:translate-y-0">
                  Selecting only pristine, ethically harvested mulberry fibers.
                </p>
              </div>
            </div>

            {/* Loom */}
            <div className="relative aspect-square group overflow-hidden bg-[var(--bg-secondary)] md:col-span-2 border border-[var(--border-color)]">
              <img
                alt="The Handloom"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoRSHUE5xyO1XcsWEcbqQZ-8osfHJeYVP04Loirs9yeqbXT0q8losZPgxd6D9ePcKiiuDQa99LcAZobEKhiYGOyJIsVY07Ijphh_kZH0Em7jaCIqH__eX3x5cFS8ZeAt2rxcZuZP007ytPw0CsEYaRP0uSozhau0Z0WlpVVwcBBwkXuHNafyHNNEscHPTr4LbruCsxuitOpHn0brMmCE-WgKJclhiEwFp5IyE0am37K8PhwUfTQWlg5g"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-6 md:p-8">
                <h3
                  className="text-[22px] md:text-[26px] text-white font-normal"
                  style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                >
                  The Handloom Process
                </h3>
              </div>
            </div>

            {/* Finishing */}
            <div className="relative aspect-square group overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <img
                alt="Finishing Touches"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC222nhZznFsJUK_yeLw4YEaojloZpBpdZEZnT1Y6NgCsVaLwRofY2fsBcErvi7ELvOLBwkTBIOi6QQycho-xchhmx9l2-ed2NJ39MX4B3RbNBNGMuz_GFRvlb6cTA7KbXqsGG94VZWJD5MPFZMlFfu3m1qbyxQy2U367sU0Wf38R5J4ZMwIMywxHwE00y-qmIeFBpgAYuDXKDW6r39S-lFW2dpH_sU3hDtRkPWZVEZVVUsqdA93_nzyQ"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-6 md:p-8">
                <h3
                  className="text-[20px] md:text-[24px] text-white font-normal"
                  style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                >
                  Finishing
                </h3>
              </div>
            </div>

            {/* Structural Grace Card */}
            <div className="relative aspect-square group overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--gold)] mb-3">
                <Compass size={24} strokeWidth={1.5} />
              </div>
              <h3
                className="text-[20px] md:text-[22px] text-[var(--text-primary)] font-normal mb-1"
                style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
              >
                Structural Grace
              </h3>
              <p className="body-sm text-[13px] text-[var(--text-secondary)]">
                Design rooted in minimalist philosophy and timeless proportion.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
