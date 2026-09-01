import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, Sparkles, Check } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // 1. Check if already installed / running in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      return;
    }

    // 2. Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('ithihasa_pwa_dismissed') === '1';
    if (isDismissed) {
      return;
    }

    // 3. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // 4. Capture beforeinstallprompt event for Android / Chromium / Desktop
    const promptHandler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', promptHandler);

    // On iOS, show banner after a gentle 2-second engagement delay
    let timer: any;
    if (isAppleDevice) {
      timer = setTimeout(() => {
        setIsVisible(true);
      }, 1800);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', promptHandler);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsVisible(false);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.warn('PWA prompt interaction:', err);
      }
    } else {
      // Fallback for Android browsers without immediate deferred prompt
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('ithihasa_pwa_dismissed', '1');
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Top Banner */}
      <aside aria-label="Install App Banner" className="relative z-[110] bg-[#141210] text-[#F4EFE6] border-b border-[#C9A24B]/30 shadow-md py-2.5 px-3 sm:px-6 transition-all duration-300 font-sans">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3">
          {/* Brand & Value Proposition */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#C9A24B]/15 border border-[#C9A24B]/40 text-[#C9A24B] flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-serif text-[13.5px] sm:text-[15px] font-normal tracking-wide text-[#F4EFE6] truncate" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
                  Ithihasa Mobile Atelier
                </span>
                <span className="hidden sm:inline-block label-caps text-[9px] uppercase bg-[#C9A24B]/20 text-[#C9A24B] border border-[#C9A24B]/30 px-1.5 py-0.5 tracking-wider font-semibold">
                  Official PWA
                </span>
              </div>
              <p className="text-[11px] sm:text-[12px] text-[#B8B0A2] truncate leading-tight mt-0.5">
                {isIOS
                  ? 'Install to your Home Screen for faster access & seamless experience.'
                  : 'Install our mobile app for faster checkout & bespoke notifications.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-[#C9A24B] hover:bg-[#D8B35C] active:scale-95 text-[#0A0A0A] font-semibold text-[10.5px] sm:text-[11.5px] uppercase tracking-wider px-3 sm:px-4 py-1.5 sm:py-2 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              {isIOS ? (
                <>
                  <Share size={13} strokeWidth={2} />
                  <span>How to Install</span>
                </>
              ) : (
                <>
                  <Download size={13} strokeWidth={2} />
                  <span>Install App</span>
                </>
              )}
            </button>

            <button
              onClick={handleDismiss}
              aria-label="Dismiss app install banner"
              className="text-[#B8B0A2] hover:text-[#F4EFE6] p-1.5 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* iOS / Fallback Installation Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-[420px] bg-[#141210] border border-[#C9A24B]/30 text-[#F4EFE6] p-6 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(#C9A24B_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#262220] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C9A24B]/15 border border-[#C9A24B]/40 text-[#C9A24B] flex items-center justify-center">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-[20px] text-[#F4EFE6] font-normal leading-tight" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
                    Install Ithihasa
                  </h3>
                  <span className="label-caps text-[10px] text-[#C9A24B] uppercase tracking-widest block mt-0.5">
                    {isIOS ? 'iOS Safari Guide' : 'Home Screen Setup'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-[#B8B0A2] hover:text-[#F4EFE6] p-1 cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-4 font-sans text-[13px]">
              <div className="flex items-start gap-3.5 p-3 bg-[#1A1714] border border-[#262220]">
                <div className="w-6 h-6 rounded-full bg-[#C9A24B] text-[#0A0A0A] font-bold text-[11px] flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="text-[#B8B0A2] leading-relaxed">
                  Tap the <strong className="text-[#F4EFE6] font-semibold inline-flex items-center gap-1 mx-1">Share <Share size={13} className="text-[#C9A24B]" /></strong> button in your browser toolbar (bottom on iPhone, top on iPad).
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 bg-[#1A1714] border border-[#262220]">
                <div className="w-6 h-6 rounded-full bg-[#C9A24B] text-[#0A0A0A] font-bold text-[11px] flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="text-[#B8B0A2] leading-relaxed">
                  Scroll down and tap <strong className="text-[#F4EFE6] font-semibold inline-flex items-center gap-1 mx-1">"Add to Home Screen" <PlusSquare size={13} className="text-[#C9A24B]" /></strong>.
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 bg-[#1A1714] border border-[#262220]">
                <div className="w-6 h-6 rounded-full bg-[#C9A24B] text-[#0A0A0A] font-bold text-[11px] flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="text-[#B8B0A2] leading-relaxed">
                  Tap <strong className="text-[#F4EFE6] font-semibold mx-1">"Add"</strong> in the top right to launch Ithihasa as a full-screen luxury app.
                </div>
              </div>
            </div>

            {/* Footer Close CTA */}
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full bg-[#C9A24B] text-[#0A0A0A] font-semibold label-caps text-[11px] uppercase tracking-widest py-3 hover:bg-[#D8B35C] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check size={14} strokeWidth={2.5} />
              <span>Understood</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
