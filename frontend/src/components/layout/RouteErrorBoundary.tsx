import React from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { RotateCw, Home } from 'lucide-react';

export const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError();

  let errorMessage = 'An unexpected error occurred while loading this view.';
  let errorStatus: number | null = null;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-between px-6 py-12 md:py-20 selection:bg-[var(--gold)]/20">
      {/* Top Brand Header */}
      <div className="max-w-xl mx-auto w-full text-center">
        <span
          className="text-[20px] md:text-[24px] tracking-[0.25em] uppercase font-normal text-[var(--gold)] block"
          style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
        >
          ITHIHASA
        </span>
        <span className="text-[10px] tracking-[0.3em] uppercase text-[var(--text-secondary)] block mt-1">
          Wear Your Legacy
        </span>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto w-full text-center my-auto py-12">
        <div className="w-12 h-0.5 bg-[var(--gold)] mx-auto mb-8 opacity-60" />

        {errorStatus && (
          <span className="text-[12px] font-semibold tracking-[0.2em] uppercase text-[var(--gold)] block mb-3">
            Status {errorStatus}
          </span>
        )}

        <h1
          className="text-[28px] md:text-[34px] font-normal text-[var(--text-primary)] mb-4 tracking-wide leading-tight"
          style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
        >
          An Unexpected Pause
        </h1>

        <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed mb-8 max-w-sm mx-auto font-light">
          We encountered an interruption while curating this experience. Your session and saved items remain secure.
        </p>

        {import.meta.env.DEV && (
          <div className="mb-8 p-3 bg-red-950/20 border border-red-900/30 text-red-400 text-left text-xs font-mono overflow-auto max-h-36 rounded">
            {errorMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleReload}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--gold)] text-[#0A0A0A] text-[12px] font-semibold tracking-[0.18em] uppercase hover:bg-[var(--gold-bright)] transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <RotateCw size={14} />
            <span>Reload Page</span>
          </button>

          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-[var(--border-color)] text-[var(--text-primary)] text-[12px] font-medium tracking-[0.18em] uppercase hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all active:scale-95"
          >
            <Home size={14} />
            <span>Return to Atelier</span>
          </Link>
        </div>
      </div>

      {/* Footer Safe Area */}
      <div className="max-w-xl mx-auto w-full text-center text-[11px] text-[var(--text-secondary)] tracking-wider">
        <span>Need assistance? Contact our Concierge at care@ithihasa.co.in</span>
      </div>
    </div>
  );
};
