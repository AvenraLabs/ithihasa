import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchOrderById, type OrderData } from '../api/orders.js';

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order } = useQuery<OrderData>({
    queryKey: ['order-confirmation', orderId],
    queryFn: () => fetchOrderById(orderId!),
    enabled: !!orderId,
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 text-center antialiased">
      <div className="max-w-md w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 md:p-10 shadow-2xl space-y-6 animate-in zoom-in-95">
        {/* Gold Success Icon */}
        <div className="w-16 h-16 rounded-full bg-[var(--gold)]/20 border border-[var(--gold)] flex items-center justify-center text-[var(--gold)] mx-auto">
          <CheckCircle2 size={36} strokeWidth={1.75} />
        </div>

        <div>
          <h1
            className="text-[30px] md:text-[36px] font-normal text-[var(--text-primary)] mb-2"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            Order Confirmed
          </h1>
          <p className="body-md text-[14px] text-[var(--text-secondary)]">
            Thank you for curating your heritage with Ithihasa.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5 text-left space-y-3">
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-[var(--text-secondary)]">Order Reference</span>
            <span className="font-semibold text-[var(--text-primary)]">
              #{order?.orderNumber || orderId?.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <div className="flex justify-between items-center text-[13px]">
            <span className="text-[var(--text-secondary)]">Delivery Status</span>
            <span className="text-[var(--gold)] font-medium">Atelier Processing</span>
          </div>

          <div className="flex justify-between items-center text-[13px]">
            <span className="text-[var(--text-secondary)]">Total Paid</span>
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              ₹{order?.totalAmount?.toLocaleString() || '12,500'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <Link
            to={orderId ? `/account/orders/${orderId}` : '/account/orders'}
            className="w-full h-12 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] label-caps text-[12px] uppercase tracking-[0.15em] hover:bg-[var(--gold)] hover:text-[#0A0A0A] transition-colors font-semibold flex items-center justify-center gap-2 rounded"
          >
            <span>Track Order Timeline</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            to="/shop"
            className="w-full h-12 border border-[var(--border-color)] text-[var(--text-primary)] label-caps text-[11px] uppercase tracking-wider hover:border-[var(--gold)] transition-colors flex items-center justify-center rounded"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};
