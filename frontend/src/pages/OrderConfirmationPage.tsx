import React from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowRight, RotateCcw, ShoppingBag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchOrderById, type OrderData } from '../api/orders.js';

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();

  const isFailedParam = searchParams.get('status') === 'failed' || searchParams.get('payment') === 'failed';

  const { data: order, isLoading, isError } = useQuery<OrderData>({
    queryKey: ['order-confirmation', orderId],
    queryFn: () => fetchOrderById(orderId!),
    enabled: !!orderId,
  });

  const isOrderFailed = isFailedParam || (order && ['CANCELLED', 'FAILED'].includes((order.status || '').toUpperCase()));

  const getDeliveryStatusLabel = (status?: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'PAID') return 'Payment Verified';
    if (s === 'PROCESSING') return 'Atelier Processing';
    if (s === 'DISPATCHED') return 'Dispatched';
    if (s === 'DELIVERED') return 'Delivered';
    if (s === 'CONFIRMED') return 'Order Confirmed';
    if (s === 'PENDING_PAYMENT') return 'Awaiting Confirmation';
    return status || 'Order Placed';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 text-center antialiased">
        <div className="max-w-md w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 md:p-10 shadow-2xl space-y-6 animate-pulse">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] mx-auto" />
          <div className="h-8 bg-[var(--bg-secondary)] rounded w-3/4 mx-auto" />
          <div className="h-4 bg-[var(--bg-secondary)] rounded w-1/2 mx-auto" />
          <div className="h-32 bg-[var(--bg-secondary)] rounded-xl" />
          <div className="h-12 bg-[var(--bg-secondary)] rounded" />
        </div>
      </div>
    );
  }

  // Fallback if order couldn't be loaded and status wasn't explicit
  if ((isError || !order) && !isOrderFailed) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 text-center antialiased">
        <div className="max-w-md w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 md:p-10 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-900/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
            <AlertCircle size={36} strokeWidth={1.75} />
          </div>
          <div>
            <h1
              className="text-[26px] md:text-[32px] font-normal text-[var(--text-primary)] mb-2"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              Order Details Unavailable
            </h1>
            <p className="body-md text-[14px] text-[var(--text-secondary)]">
              We couldn't retrieve the details for order reference #{orderId?.slice(0, 8).toUpperCase()}.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Link
              to="/account/orders"
              className="w-full h-12 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] label-caps text-[12px] uppercase tracking-[0.15em] hover:bg-[var(--gold)] hover:text-[#0A0A0A] transition-colors font-semibold flex items-center justify-center gap-2 rounded"
            >
              <span>View Order History</span>
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
  }

  // 1. PAYMENT FAILED / ORDER CANCELLED STATE
  if (isOrderFailed) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 text-center antialiased">
        <div className="max-w-md w-full bg-[var(--bg-card)] border border-red-900/40 rounded-2xl p-8 md:p-10 shadow-2xl space-y-6 animate-in zoom-in-95">
          {/* Failed / Alert Icon */}
          <div className="w-16 h-16 rounded-full bg-red-950/40 border border-red-600/50 flex items-center justify-center text-red-400 mx-auto">
            <AlertCircle size={36} strokeWidth={1.75} />
          </div>

          <div>
            <h1
              className="text-[28px] md:text-[34px] font-normal text-[var(--text-primary)] mb-2"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              Payment Unsuccessful
            </h1>
            <p className="body-md text-[14px] text-[var(--text-secondary)]">
              We were unable to process your payment. If any funds were deducted, they will be automatically refunded within 3–5 business days.
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
              <span className="text-[var(--text-secondary)]">Payment Status</span>
              <span className="text-red-400 font-medium bg-red-950/40 px-2 py-0.5 rounded text-[11px] uppercase tracking-wider border border-red-800/40">
                Payment Failed
              </span>
            </div>

            {order?.totalAmount !== undefined && order.totalAmount > 0 && (
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-[var(--text-secondary)]">Order Total</span>
                <span className="font-semibold text-[var(--text-primary)] tabular-nums">
                  ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Link
              to="/checkout"
              className="w-full h-12 bg-[var(--gold)] text-[#0A0A0A] label-caps text-[12px] uppercase tracking-[0.15em] hover:bg-[var(--gold-bright)] transition-colors font-semibold flex items-center justify-center gap-2 rounded"
            >
              <RotateCcw size={16} />
              <span>Retry Payment</span>
            </Link>

            <Link
              to="/cart"
              className="w-full h-12 border border-[var(--border-color)] text-[var(--text-primary)] label-caps text-[11px] uppercase tracking-wider hover:border-[var(--gold)] transition-colors flex items-center justify-center gap-2 rounded"
            >
              <ShoppingBag size={15} />
              <span>Return to Bag</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. ORDER CONFIRMED STATE (Payment Succeeded / Placed)
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
            <span className="text-[var(--gold)] font-medium">
              {getDeliveryStatusLabel(order?.status)}
            </span>
          </div>

          <div className="flex justify-between items-center text-[13px]">
            <span className="text-[var(--text-secondary)]">Total Paid</span>
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              ₹{Number(order?.totalAmount ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <Link
            to={order?.id ? `/account/orders/${order.id}` : (orderId ? `/account/orders/${orderId}` : '/account/orders')}
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
