import React from 'react';
import { Link } from 'react-router-dom';
import { Download, RefreshCw, Leaf } from 'lucide-react';
import { toast } from 'sonner';

export const SustainabilityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors antialiased">
      <main className="pt-8 md:pt-12 pb-24 md:pb-20 px-5 md:px-20 max-w-[1440px] mx-auto w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-[var(--text-secondary)] label-caps mb-8 text-[11px]">
          <Link to="/" className="hover:text-[var(--text-primary)] transition-colors">
            HOME
          </Link>
          <span>/</span>
          <span className="text-[var(--gold)] uppercase">SUSTAINABILITY</span>
        </nav>

        {/* Hero Section */}
        <section className="mb-16 md:mb-24 text-center max-w-3xl mx-auto">
          <h1
            className="text-[34px] sm:text-[44px] md:text-[54px] text-[var(--text-primary)] mb-4 font-normal tracking-tight leading-tight"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            Wear Your Legacy Responsibly
          </h1>
          <p className="body-md text-[15px] md:text-[17px] text-[var(--text-secondary)] mb-8 leading-relaxed">
            At Ithihasa, true luxury lies in preservation—of craft, of community, and of the environment. Our commitment to quiet luxury extends beyond the garment to the very soil from which it springs.
          </p>
          <a
            href="#report"
            onClick={(e) => {
              e.preventDefault();
              toast.success('Downloading Ithihasa 2026 Atelier Sustainability Report (PDF)...');
            }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--gold)] hover:text-[#0A0A0A] label-caps tracking-[0.2em] uppercase transition-colors duration-300 shadow-md text-[12px] font-semibold"
          >
            <span>Download Sustainability Report</span>
            <Download size={16} />
          </a>
        </section>

        {/* Bento Grid: Initiatives */}
        <section className="mb-16 md:mb-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 auto-rows-[280px] sm:auto-rows-[340px] md:auto-rows-[380px]">
            {/* Ethical Sourcing (8 Cols) */}
            <div className="md:col-span-8 relative overflow-hidden group border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-sm">
              <img
                alt="Ethical Sourcing"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfuAOnPCqC8BXeZn57yr9eiUKBdl4u3WIp81uO-yo3Z8Cof9YExTNdCx26LKQV3mroFg6i7O3cXvyDYc4UgWBhQrz3dpc__Wo22wYOJ0pOqqhqgSLgkLd-HTCKL4v4Zj0VesOcGUPq5_3Ut0JT-E1b15oYZO2iaG9Ho4cyt16ZQsIdG1bIT_X4Xgf-WMIMpDUgMq_glHSZDvTUugwwolAJvrPDVEJS5mXcwTc3Lnb5JLDCeQmnuRpayQ"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                <h2
                  className="text-[24px] md:text-[30px] text-white mb-1 font-normal"
                  style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                >
                  Ethical Sourcing
                </h2>
                <p className="body-sm text-[13px] md:text-[14px] text-white/80 max-w-md">
                  Ensuring fair wages and dignified working conditions for our master weavers across rural India.
                </p>
              </div>
            </div>

            {/* Zero-Waste (4 Cols) */}
            <div className="md:col-span-4 bg-[var(--bg-card)] p-6 md:p-8 flex flex-col justify-between border border-[var(--border-color)] shadow-sm">
              <div className="flex justify-end">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--gold)]">
                  <RefreshCw size={22} strokeWidth={1.5} />
                </div>
              </div>
              <div>
                <h2
                  className="text-[22px] md:text-[26px] text-[var(--text-primary)] mb-2 font-normal"
                  style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                >
                  Zero-Waste Initiatives
                </h2>
                <p className="body-sm text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-relaxed">
                  Every scrap of precious silk is repurposed into limited-edition accessories or textile art, ensuring nothing returns to the earth prematurely.
                </p>
              </div>
            </div>

            {/* Eco-Friendly Dyes (4 Cols) */}
            <div className="md:col-span-4 bg-[var(--bg-card)] p-6 md:p-8 flex flex-col justify-between border border-[var(--border-color)] shadow-sm">
              <div className="flex justify-end">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--gold)]">
                  <Leaf size={22} strokeWidth={1.5} />
                </div>
              </div>
              <div>
                <h2
                  className="text-[22px] md:text-[26px] text-[var(--text-primary)] mb-2 font-normal"
                  style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                >
                  Eco-Friendly Dyes
                </h2>
                <p className="body-sm text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-relaxed">
                  Transitioning to 100% natural and azo-free dyes, protecting our waterways and ensuring skin safety.
                </p>
              </div>
            </div>

            {/* Natural Dye Materials Image (8 Cols) */}
            <div className="md:col-span-8 relative overflow-hidden group border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-sm">
              <img
                alt="Natural dye materials"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuABWSNU5HRkGUrZWjeT5HVNVyNXYalmCjRT7O63MhAtIkvqSAkDWK4iQfX-vxFqRY-ChEGDVJuwzv1mUoAUucBChkamraA6cbFb8_zKa8K2YiFS_BlfHUn_x_BWfkFZ8D0PpQA-610NUxTCHG17sDg6PY1SS7x6TeFRtRO9UKYtWgV6Ij4bYWRwF0VIKk9C6z4_Gwvv8UT-3CFTGcEuEQe9g2HOj0UD3EZbF9xe38RhqmfN_135KwuGWQ"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          </div>
        </section>

        {/* Visual Timeline: Our Green Journey */}
        <section className="mb-12 md:mb-16 pt-10 border-t border-[var(--border-color)]">
          <div className="text-center mb-12">
            <h2
              className="text-[28px] md:text-[36px] text-[var(--text-primary)] uppercase tracking-wide font-normal"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              Our Green Journey
            </h2>
          </div>

          <div className="relative max-w-3xl mx-auto pl-6 md:pl-0">
            {/* Center line for desktop / left line for mobile */}
            <div className="absolute top-0 bottom-0 left-[7px] md:left-1/2 -translate-x-1/2 w-[1px] bg-[var(--border-color)]" />

            {/* Timeline Events */}
            <div className="space-y-12 md:space-y-16">
              {/* 2018 */}
              <div className="relative flex flex-col md:flex-row items-start md:items-center">
                <div className="md:w-1/2 md:pr-12 md:text-right pl-6 md:pl-0">
                  <h3
                    className="text-[20px] md:text-[22px] text-[var(--gold)] font-medium mb-1"
                    style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                  >
                    2018: The Foundation
                  </h3>
                  <p className="body-sm text-[13px] md:text-[14px] text-[var(--text-secondary)]">
                    Established direct-to-weaver partnerships, eliminating middlemen and ensuring fair trade practices.
                  </p>
                </div>
                <div className="absolute left-[7px] md:left-1/2 -translate-x-1/2 w-4 h-4 bg-[var(--bg-primary)] border-2 border-[var(--gold)] rounded-full z-10" />
                <div className="hidden md:block md:w-1/2" />
              </div>

              {/* 2020 */}
              <div className="relative flex flex-col md:flex-row items-start md:items-center">
                <div className="hidden md:block md:w-1/2" />
                <div className="absolute left-[7px] md:left-1/2 -translate-x-1/2 w-4 h-4 bg-[var(--bg-primary)] border-2 border-[var(--gold)] rounded-full z-10" />
                <div className="md:w-1/2 md:pl-12 pl-6 md:pl-0">
                  <h3
                    className="text-[20px] md:text-[22px] text-[var(--gold)] font-medium mb-1"
                    style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                  >
                    2020: Zero-Waste Protocol
                  </h3>
                  <p className="body-sm text-[13px] md:text-[14px] text-[var(--text-secondary)]">
                    Launched the 'Atelier Scraps' initiative, turning offcuts into the coveted Heritage Patchwork collection.
                  </p>
                </div>
              </div>

              {/* 2023 */}
              <div className="relative flex flex-col md:flex-row items-start md:items-center">
                <div className="md:w-1/2 md:pr-12 md:text-right pl-6 md:pl-0">
                  <h3
                    className="text-[20px] md:text-[22px] text-[var(--gold)] font-medium mb-1"
                    style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                  >
                    2023: Natural Dye Transition
                  </h3>
                  <p className="body-sm text-[13px] md:text-[14px] text-[var(--text-secondary)]">
                    Achieved 80% reliance on botanical and non-toxic dyes across our core silk collections.
                  </p>
                </div>
                <div className="absolute left-[7px] md:left-1/2 -translate-x-1/2 w-4 h-4 bg-[var(--gold)] border-2 border-[var(--gold)] rounded-full z-10" />
                <div className="hidden md:block md:w-1/2" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
