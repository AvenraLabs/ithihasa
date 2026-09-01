import React, { useState } from 'react';
import { X, Ruler, Sparkles } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MEASUREMENTS = {
  kurtas: [
    { size: '38 (S)', chest: '40"', shoulder: '17.5"', length: '42"', sleeve: '24.5"' },
    { size: '40 (M)', chest: '42"', shoulder: '18.0"', length: '43"', sleeve: '25.0"' },
    { size: '42 (L)', chest: '44"', shoulder: '18.5"', length: '44"', sleeve: '25.5"' },
    { size: '44 (XL)', chest: '46"', shoulder: '19.0"', length: '44.5"', sleeve: '26.0"' },
    { size: 'Free Size', chest: '42-44"', shoulder: '18.0-18.5"', length: '43"', sleeve: '25.0"' },
  ],
  bandhgalas: [
    { size: '38 (S)', chest: '40"', shoulder: '17.5"', length: '29"', waist: '36"' },
    { size: '40 (M)', chest: '42"', shoulder: '18.0"', length: '30"', waist: '38"' },
    { size: '42 (L)', chest: '44"', shoulder: '18.5"', length: '30.5"', waist: '40"' },
    { size: '44 (XL)', chest: '46"', shoulder: '19.0"', length: '31"', waist: '42"' },
    { size: 'Free Size', chest: '42-44"', shoulder: '18.5"', length: '30"', waist: '38"' },
  ],
  sarees: [
    { size: 'Standard (Free Size)', length: '5.5 Metres', blouse: '0.8 Metre Included', width: '45 Inches' },
  ],
};

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'kurtas' | 'bandhgalas' | 'sarees'>('kurtas');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-[var(--bg-card)] border border-[var(--border-color)] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 text-[var(--text-primary)] rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Ruler size={16} className="text-[var(--gold)]" />
              <span className="label-caps text-[10px] text-[var(--gold)] tracking-widest uppercase font-bold">
                Atelier Sizing Guide
              </span>
            </div>
            <h2
              className="text-[24px] sm:text-[28px] font-normal uppercase"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              Heritage Measurement Chart
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label="Close Size Guide"
          >
            <X size={22} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {[
              { id: 'kurtas', label: 'Kurtas' },
              { id: 'bandhgalas', label: 'Bandhgalas & Jackets' },
              { id: 'sarees', label: 'Sarees & Drapes' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`label-caps text-[11px] uppercase tracking-wider px-3.5 py-2 border transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[var(--gold)] text-black border-[var(--gold)] font-bold shadow-sm'
                    : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--gold)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-semibold text-[var(--text-secondary)] label-caps">
            All sizes in inches
          </div>
        </div>

        {/* Measurements Table */}
        <div className="border border-[var(--border-color)] overflow-x-auto">
          {activeTab === 'kurtas' && (
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] label-caps text-[10px] text-[var(--gold)] tracking-widest">
                  <th className="p-3">Size (Standard)</th>
                  <th className="p-3">Garment Chest</th>
                  <th className="p-3">Shoulder</th>
                  <th className="p-3">Kurta Length</th>
                  <th className="p-3">Sleeve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {MEASUREMENTS.kurtas.map((row) => (
                  <tr key={row.size} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{row.size}</td>
                    <td className="p-3 tabular-nums">{row.chest}</td>
                    <td className="p-3 tabular-nums">{row.shoulder}</td>
                    <td className="p-3 tabular-nums">{row.length}</td>
                    <td className="p-3 tabular-nums">{row.sleeve}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'bandhgalas' && (
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] label-caps text-[10px] text-[var(--gold)] tracking-widest">
                  <th className="p-3">Size (Standard)</th>
                  <th className="p-3">Garment Chest</th>
                  <th className="p-3">Shoulder</th>
                  <th className="p-3">Jacket Length</th>
                  <th className="p-3">Waist</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {MEASUREMENTS.bandhgalas.map((row) => (
                  <tr key={row.size} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{row.size}</td>
                    <td className="p-3 tabular-nums">{row.chest}</td>
                    <td className="p-3 tabular-nums">{row.shoulder}</td>
                    <td className="p-3 tabular-nums">{row.length}</td>
                    <td className="p-3 tabular-nums">{row.waist}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'sarees' && (
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] label-caps text-[10px] text-[var(--gold)] tracking-widest">
                  <th className="p-3">Silhouette Type</th>
                  <th className="p-3">Drape Length</th>
                  <th className="p-3">Blouse Piece</th>
                  <th className="p-3">Width</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {MEASUREMENTS.sarees.map((row) => (
                  <tr key={row.size} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{row.size}</td>
                    <td className="p-3">{row.length}</td>
                    <td className="p-3">{row.blouse}</td>
                    <td className="p-3">{row.width}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Sizing Advice Note */}
        <div className="bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] p-4 rounded text-[12px] space-y-1.5 leading-relaxed text-[var(--text-secondary)]">
          <div className="flex items-center gap-1.5 text-[var(--gold)] font-bold label-caps text-[10px] uppercase">
            <Sparkles size={13} />
            <span>Atelier Tailoring Note</span>
          </div>
          <p>
            All Ithihasa silhouettes are cut with heritage ease (typically 3–4 inches above body chest measurement) for regal drape and comfort. For bespoke tailoring, connect with our concierge.
          </p>
        </div>

        {/* Close Action */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-[var(--gold)] text-[#0A0A0A] font-semibold label-caps text-[11px] tracking-widest uppercase hover:opacity-90 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
