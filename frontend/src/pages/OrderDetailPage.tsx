import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, CheckCircle2, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOrderById, type OrderData } from '../api/orders.js';
import { apiClient } from '../api/client.js';

export const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const { data: order, isLoading } = useQuery<OrderData>({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderById(orderId!),
    enabled: !!orderId,
  });

  const cancelMutation = useMutation({
    mutationFn: (reason: string) =>
      apiClient(`/orders/${orderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      setIsCancelModalOpen(false);
      setCancelReason('');
      setToastMessage('Order cancelled successfully');
      setTimeout(() => setToastMessage(null), 3000);
    },
    onError: (err: any) => {
      setToastMessage(err.message || 'Unable to cancel order');
      setTimeout(() => setToastMessage(null), 3000);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-[24px] font-medium mb-2" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
          Order not found
        </h2>
        <Link to="/account/orders" className="text-[var(--gold)] label-caps text-[12px] uppercase tracking-wider underline">
          Return to Orders
        </Link>
      </div>
    );
  }

  const steps = [
    { title: 'Order Placed', desc: 'Order received & verified', done: true },
    { title: 'Processing in Atelier', desc: 'Garment curated & packaged', done: ['CONFIRMED', 'PROCESSING', 'DISPATCHED', 'DELIVERED'].includes(order.status.toUpperCase()) },
    { title: 'Dispatched', desc: 'Handed to premium courier', done: ['DISPATCHED', 'DELIVERED'].includes(order.status.toUpperCase()) },
    { title: 'Delivered', desc: 'Safely delivered to your address', done: order.status.toUpperCase() === 'DELIVERED' },
  ];

  const canCancel = ['CREATED', 'CONFIRMED', 'PENDING'].includes(order.status.toUpperCase());

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors pb-24 md:pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] bg-[var(--bg-card)] border border-[var(--border-color)] px-6 py-3.5 shadow-2xl flex items-center gap-3 whitespace-nowrap max-w-[90vw] transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={18} className="text-[var(--gold)] shrink-0" />
          <span className="text-[17px] tracking-wide text-[var(--gold)] font-medium" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
            {toastMessage}
          </span>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-b border-[var(--border-color)] flex justify-between items-center px-5 md:px-20 h-16">
        <button onClick={() => navigate('/account/orders')} className="p-2 -ml-2 text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors">
          <ArrowLeft size={22} />
        </button>

        <h1 className="text-[18px] md:text-[22px] font-normal tracking-[0.15em] uppercase text-[var(--gold)]" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
          Order #{order.orderNumber}
        </h1>

        <div className="w-8" />
      </header>

      <main className="max-w-[800px] mx-auto px-5 md:px-8 py-8 space-y-6">
        {/* Status Tracker */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[20px] font-medium text-[var(--text-primary)]" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
              Tracking Timeline
            </h2>
            <span className="label-caps text-[10px] uppercase tracking-widest bg-[var(--gold)]/15 text-[var(--gold)] px-3 py-1 rounded font-semibold border border-[var(--gold)]/30">
              {order.status}
            </span>
          </div>

          {/* Timeline steps */}
          <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--border-color)]">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-4 relative">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                  step.done
                    ? 'bg-[var(--gold)] text-[#0A0A0A]'
                    : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)]'
                }`}>
                  {step.done ? <CheckCircle2 size={16} /> : <Clock size={14} />}
                </div>
                <div>
                  <h3 className={`text-[15px] font-semibold tracking-wide ${step.done ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                    {step.title}
                  </h3>
                  <p className="body-sm text-[12px] text-[var(--text-secondary)]">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
          <h2 className="text-[20px] font-medium text-[var(--text-primary)] mb-4" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
            Items in Order ({order.items?.length || 0})
          </h2>

          <div className="divide-y divide-[var(--border-color)]/60">
            {(order.items || []).map((item) => (
              <div key={item.id} className="py-4 flex gap-4 items-center">
                <div className="w-16 h-20 bg-[var(--bg-secondary)] rounded overflow-hidden border border-[var(--border-color)] shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)]">
                      <Package size={18} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-medium text-[var(--text-primary)] truncate">
                    {item.productName}
                  </h3>
                  <p className="body-sm text-[12px] text-[var(--text-secondary)]">
                    Variant: {item.variantName || 'Standard'} • Qty: {item.quantity}
                  </p>
                </div>

                <span className="body-md text-[15px] font-semibold text-[var(--text-primary)] tabular-nums shrink-0">
                  ₹{Number(item.total ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 space-y-2.5">
          <div className="flex justify-between text-[14px] text-[var(--text-secondary)]">
            <span>Subtotal</span>
            <span className="tabular-nums">₹{Number(order.subtotal ?? 0).toLocaleString('en-IN')}</span>
          </div>
          {(order.discountAmount || 0) > 0 && (
            <div className="flex justify-between text-[14px] text-[var(--gold)]">
              <span>Coupon Discount ({order.couponCode})</span>
              <span className="tabular-nums">-₹{Number(order.discountAmount ?? 0).toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between text-[14px] text-[var(--text-secondary)]">
            <span>Shipping</span>
            <span className="tabular-nums">{(order.shippingAmount ?? 0) === 0 ? 'Free' : `₹${Number(order.shippingAmount ?? 0).toLocaleString('en-IN')}`}</span>
          </div>
          {(order.taxAmount || 0) > 0 && (
            <div className="flex justify-between text-[14px] text-[var(--text-secondary)]">
              <span>Estimated Taxes</span>
              <span className="tabular-nums">₹{Number(order.taxAmount ?? 0).toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="pt-3 border-t border-[var(--border-color)] flex justify-between text-[18px] font-semibold text-[var(--text-primary)]">
            <span>Total Amount</span>
            <span className="text-[var(--gold)] tabular-nums">₹{Number(order.totalAmount ?? 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Cancel Action */}
        {canCancel && (
          <div className="text-center pt-2">
            <button
              onClick={() => setIsCancelModalOpen(true)}
              disabled={cancelMutation.isPending}
              className="label-caps text-[11px] uppercase tracking-widest text-[var(--error)] border border-[var(--error)]/40 hover:bg-[var(--error)]/10 px-6 py-2.5 rounded transition-colors cursor-pointer"
            >
              Cancel Order
            </button>
          </div>
        )}
      </main>

      {/* Custom Order Cancellation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-color)] max-w-md w-full shadow-2xl p-6 sm:p-7 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              <span className="label-caps text-[10px] text-rose-400 uppercase tracking-widest font-semibold">
                Order Cancellation
              </span>
              <h3 className="font-garamond text-[22px] font-normal text-[var(--text-primary)] leading-tight m-0">
                Cancel Order #{order.orderNumber}?
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed pt-1">
                Please provide a brief reason for cancelling your order. Reserved items will be released back to the boutique.
              </p>
            </div>

            <div>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation (e.g., changed mind, ordered incorrect size)..."
                rows={3}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--gold)] p-3 text-[13px] text-[var(--text-primary)] outline-none resize-none font-manrope"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => {
                  setIsCancelModalOpen(false);
                  setCancelReason('');
                }}
                disabled={cancelMutation.isPending}
                className="px-4 py-2.5 border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--gold)] label-caps text-[11px] uppercase tracking-wider cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!cancelReason.trim()) {
                    setToastMessage('Please enter a cancellation reason');
                    setTimeout(() => setToastMessage(null), 3000);
                    return;
                  }
                  cancelMutation.mutate(cancelReason.trim());
                }}
                disabled={cancelMutation.isPending}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white label-caps text-[11px] uppercase tracking-wider cursor-pointer shadow-sm disabled:opacity-50 font-semibold"
              >
                {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
