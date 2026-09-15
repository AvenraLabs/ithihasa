import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Check,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  User,
  ShieldCheck,
  MapPin,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { fetchOrderById, updateOrderStatus } from '../api/orders.js';
import { CustomSelect } from './CustomSelect.jsx';
import { toast } from 'sonner';

export function OrderDetailView({ order, onBack }) {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [orderData, setOrderData] = useState(order || null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleBack = onBack || (() => navigate('/orders'));

  const loadOrderDetail = async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetchOrderById(orderId);
      setOrderData(res);
    } catch (err) {
      console.error('Failed to load order detail:', err);
      setError(err.message || 'Unable to retrieve order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  const handleStatusChange = async (newStatus, reason) => {
    if (!orderData?.id || updatingStatus) return;
    try {
      setUpdatingStatus(true);
      const updated = await updateOrderStatus(
        orderData.id,
        newStatus,
        reason || `Status manually changed to ${newStatus} via Atelier Administration`
      );

      // Refresh order to obtain updated status_history timestamps from DB
      try {
        const fresh = await fetchOrderById(orderData.id);
        setOrderData(fresh);
      } catch {
        setOrderData((prev) => ({
          ...prev,
          status: newStatus,
          updated_at: new Date().toISOString(),
        }));
      }

      toast.success(`Order status updated to ${newStatus.replace(/_/g, ' ')}.`);
    } catch (err) {
      toast.error(err.message || 'Failed to update order status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const resolveImageUrl = (url) => {
    if (!url) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuCp2MY-i6FVyIWxqy0BivV4xT41MJJ9908qDTJIXx2JR2ZGU914DIv91Q0lLzgs-12T500ACSURod9mxu09pXYGiH230imPT-nC_Kivu20DwqYqsDZlIEg9CMHPNtuNWuhO1Rr3SOX0nuJjj9ZjSmuX-_u8mjt-aklkmwuk1gpy4yTYGzotBiAJ8_JriQOcnKtr1zO-h1YwFSuJSQTqJ7HPQA8T9HUf3RfeI_yKEjM-kzDW-e-j47BCcQ';
    }
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000'
        : '';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(dateStr);
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'PENDING_PAYMENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full label-caps text-[11px] uppercase tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Pending Payment
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full label-caps text-[11px] uppercase tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Paid & Confirmed
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30 rounded-full label-caps text-[11px] uppercase tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-[var(--gold)] animate-pulse" />
            Processing
          </span>
        );
      case 'PACKED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 rounded-full label-caps text-[11px] uppercase tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            Packed
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 text-sky-600 border border-sky-500/20 rounded-full label-caps text-[11px] uppercase tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            Shipped
          </span>
        );
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 text-teal-600 border border-teal-500/20 rounded-full label-caps text-[11px] uppercase tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            Out for Delivery
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full label-caps text-[11px] uppercase tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Delivered
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-full label-caps text-[11px] uppercase tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-full label-caps text-[11px] uppercase tracking-wider font-semibold">
            {s || 'PROCESSING'}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-8 sm:p-16 max-w-[1440px] w-full mx-auto flex flex-col items-center justify-center min-h-[400px] gap-3 font-manrope">
        <div className="w-9 h-9 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
        <span className="label-caps text-[11px] uppercase tracking-widest text-[var(--text-secondary)]">
          Retrieving Atelier Order Details...
        </span>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="p-8 sm:p-12 max-w-[1440px] w-full mx-auto text-center space-y-4">
        <AlertCircle size={40} className="mx-auto text-rose-500 opacity-80" />
        <h2 className="font-garamond text-[26px] text-[var(--text-primary)]">
          Order Not Found
        </h2>
        <p className="text-[13.5px] text-[var(--text-secondary)] max-w-md mx-auto">
          {error || `Unable to locate order record with identifier ${orderId}.`}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={loadOrderDetail}
            className="px-5 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] label-caps text-[11px] uppercase tracking-wider hover:border-[var(--gold)] cursor-pointer"
          >
            Retry Fetch
          </button>
          <button
            onClick={handleBack}
            className="px-5 py-2.5 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] label-caps text-[11px] uppercase tracking-wider hover:opacity-90 cursor-pointer"
          >
            Return to Orders
          </button>
        </div>
      </div>
    );
  }

  const history = orderData.status_history || [];
  const findHistory = (toStatus) => history.find((h) => h.to_status === toStatus);

  const placedHistory = findHistory('PENDING_PAYMENT') || history[0];
  const paidHistory = findHistory('PAID');
  const processingHistory = findHistory('PROCESSING');
  const packedHistory = findHistory('PACKED');
  const shippedHistory = findHistory('SHIPPED');
  const outForDeliveryHistory = findHistory('OUT_FOR_DELIVERY');
  const deliveredHistory = findHistory('DELIVERED');
  const cancelledHistory = findHistory('CANCELLED');

  const statusOrder = [
    'PENDING_PAYMENT',
    'PAID',
    'PROCESSING',
    'PACKED',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
  ];

  const currentStatusIndex = statusOrder.indexOf(orderData.status);

  // Address normalization
  const addr =
    typeof orderData.shipping_address === 'string'
      ? (() => {
          try {
            return JSON.parse(orderData.shipping_address);
          } catch {
            return { line1: orderData.shipping_address };
          }
        })()
      : orderData.shipping_address || {};

  const customerName =
    orderData.user?.name || addr.name || 'Atelier Patron';
  const customerEmail =
    orderData.user?.email || addr.email || 'No email registered';
  const customerPhone =
    orderData.user?.phone || addr.phone || 'No phone registered';
  const customerTier = orderData.user?.tier
    ? `${orderData.user.tier} Tier Patron`
    : orderData.user?.role === 'ADMIN'
    ? 'Atelier Administrator'
    : 'Heritage Patron';

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-[1440px] w-full mx-auto space-y-6 md:space-y-8 flex-1 font-manrope">
      {/* Back to Orders Link */}
      <div>
        <button
          onClick={handleBack}
          className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors flex items-center gap-2 label-caps text-[11px] tracking-widest uppercase pb-1 cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Back to Orders</span>
        </button>
      </div>

      {/* Order Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-4 border-b border-[var(--border-color)]">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="font-garamond text-[28px] sm:text-[36px] md:text-[42px] text-[var(--text-primary)] font-normal tracking-tight leading-tight m-0">
              #{orderData.order_number || orderData.id.slice(0, 8)}
            </h1>
            {getStatusBadge(orderData.status)}
          </div>
          <p className="text-[13px] sm:text-[14px] text-[var(--text-secondary)]">
            Placed on{' '}
            <span className="text-[var(--text-primary)] font-medium">
              {formatDateTime(orderData.created_at)}
            </span>
          </p>
        </div>

        {/* Manual Status Transition Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Advancement Action */}
          {orderData.status !== 'DELIVERED' && orderData.status !== 'CANCELLED' && (
            <>
              {(orderData.status === 'PENDING_PAYMENT' || orderData.status === 'PAID') && (
                <button
                  onClick={() => handleStatusChange('PROCESSING', 'Moved to Atelier Tailoring')}
                  disabled={updatingStatus}
                  className="px-4 py-2.5 bg-[var(--gold)] text-black font-semibold label-caps text-[11px] uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Package size={14} />
                  <span>Advance to Processing</span>
                </button>
              )}

              {(orderData.status === 'PROCESSING' || orderData.status === 'PACKED') && (
                <button
                  onClick={() => handleStatusChange('SHIPPED', 'Handed over to courier partner')}
                  disabled={updatingStatus}
                  className="px-4 py-2.5 bg-sky-600 text-white font-semibold label-caps text-[11px] uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Truck size={14} />
                  <span>Dispatch & Mark Shipped</span>
                </button>
              )}

              {(orderData.status === 'SHIPPED' || orderData.status === 'OUT_FOR_DELIVERY') && (
                <button
                  onClick={() => handleStatusChange('DELIVERED', 'Delivered to recipient')}
                  disabled={updatingStatus}
                  className="px-4 py-2.5 bg-emerald-600 text-white font-semibold label-caps text-[11px] uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 size={14} />
                  <span>Confirm Delivery</span>
                </button>
              )}
            </>
          )}          {/* Direct Manual Status Selector */}
          <div className="flex items-center gap-1.5 border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1">
            <span className="label-caps text-[10px] text-[var(--text-secondary)] uppercase tracking-wider shrink-0">
              Change Status:
            </span>
            <CustomSelect
              variant="bordered"
              size="sm"
              value={orderData.status}
              disabled={updatingStatus}
              onChange={(val) => handleStatusChange(val)}
              options={[
                { value: 'PENDING_PAYMENT', label: 'Pending Payment' },
                { value: 'PAID', label: 'Paid & Confirmed' },
                { value: 'PROCESSING', label: 'Processing' },
                { value: 'PACKED', label: 'Packed' },
                { value: 'SHIPPED', label: 'Shipped' },
                { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
                { value: 'DELIVERED', label: 'Delivered' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
              buttonClassName="border-0 bg-transparent py-0.5 px-1 hover:border-0"
              menuClassName="right-0 left-auto"
            />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        {/* Left Column: Order Items & Live Timeline */}
        <div className="lg:col-span-8 space-y-8 lg:space-y-10">
          {/* Order Items Section */}
          <section className="space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2">
              <h2 className="font-garamond text-[20px] sm:text-[22px] font-normal text-[var(--text-primary)] m-0">
                Order Items ({orderData.items?.length || 0})
              </h2>
              <span className="label-caps text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
                Currency: {orderData.currency || 'INR'}
              </span>
            </div>

            <div className="space-y-3.5">
              {(orderData.items || []).map((item, idx) => {
                const unitPrice = Number(item.unit_price || 0);
                const itemTotal = Number(item.total || unitPrice * (item.quantity || 1));

                return (
                  <div
                    key={item.id || idx}
                    className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 p-4 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs group hover:border-[var(--gold)] transition-colors"
                  >
                    <div className="w-full sm:w-24 h-48 sm:h-28 shrink-0 bg-[var(--bg-secondary)] overflow-hidden border border-[var(--border-color)]">
                      <img
                        src={resolveImageUrl(item.image_url)}
                        alt={item.product_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://lh3.googleusercontent.com/aida-public/AB6AXuCp2MY-i6FVyIWxqy0BivV4xT41MJJ9908qDTJIXx2JR2ZGU914DIv91Q0lLzgs-12T500ACSURod9mxu09pXYGiH230imPT-nC_Kivu20DwqYqsDZlIEg9CMHPNtuNWuhO1Rr3SOX0nuJjj9ZjSmuX-_u8mjt-aklkmwuk1gpy4yTYGzotBiAJ8_JriQOcnKtr1zO-h1YwFSuJSQTqJ7HPQA8T9HUf3RfeI_yKEjM-kzDW-e-j47BCcQ';
                        }}
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between h-full w-full py-0.5">
                      <div>
                        <div className="flex justify-between items-start gap-3">
                          <h3 className="font-garamond text-[19px] sm:text-[20px] text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors leading-snug m-0">
                            {item.product_name}
                          </h3>
                          <span className="font-semibold text-[15px] sm:text-[16px] text-[var(--text-primary)] tabular-nums shrink-0">
                            ₹{itemTotal.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <p className="text-[12.5px] text-[var(--text-secondary)] mt-1">
                          {item.variant_name || 'Standard Piece'}
                        </p>

                        {item.sku && (
                          <span className="inline-block mt-1 font-mono text-[10.5px] text-[var(--text-muted)] bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded-xs">
                            SKU: {item.sku}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-end mt-4 pt-2.5 border-t border-[var(--border-color)]/60 text-[12.5px] text-[var(--text-secondary)]">
                        <span>Quantity: <strong className="text-[var(--text-primary)]">{item.quantity}</strong></span>
                        <span className="tabular-nums">
                          Unit Price: ₹{unitPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Real-time Order Timeline Section */}
          <section className="space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2">
              <h2 className="font-garamond text-[20px] sm:text-[22px] font-normal text-[var(--text-primary)] m-0">
                Order Lifecycle Timeline
              </h2>
              <span className="text-[11px] text-[var(--text-secondary)]">
                Manual admin control active (3rd-party webhook ready)
              </span>
            </div>

            <div className="pl-3 sm:pl-4 relative pt-2">
              {/* Timeline Connector Line */}
              <div className="absolute left-[19px] sm:left-[23px] top-4 bottom-4 w-[2px] bg-[var(--border-color)]" />

              <div className="space-y-6 relative">
                {/* Step 1: Order Delivered */}
                {(() => {
                  const isDelivered = orderData.status === 'DELIVERED';
                  const isCancelled = orderData.status === 'CANCELLED';

                  return (
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                          isDelivered
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)]'
                        }`}
                      >
                        {isDelivered ? (
                          <Check size={13} strokeWidth={2.5} />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <h4
                            className={`text-[14px] font-medium leading-tight ${
                              isDelivered
                                ? 'text-emerald-500 font-semibold'
                                : 'text-[var(--text-secondary)]'
                            }`}
                          >
                            Order Delivered
                          </h4>
                          {deliveredHistory && (
                            <span className="text-[11px] text-[var(--text-muted)] font-mono">
                              {formatDateTime(deliveredHistory.created_at)}
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
                          {isDelivered
                            ? 'Handed over and verified by patron'
                            : isCancelled
                            ? 'Cancelled before delivery'
                            : 'Pending courier delivery handover'}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Step 2: Shipped / Dispatched */}
                {(() => {
                  const isShippedOrBeyond =
                    ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(orderData.status);
                  const isCurrentShipped =
                    orderData.status === 'SHIPPED' || orderData.status === 'OUT_FOR_DELIVERY';

                  return (
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                          isShippedOrBeyond
                            ? isCurrentShipped
                              ? 'bg-sky-500 text-white shadow-sm ring-4 ring-sky-500/20'
                              : 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)]'
                        }`}
                      >
                        {isShippedOrBeyond ? (
                          <Check size={13} strokeWidth={2.5} />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <h4
                            className={`text-[14px] leading-tight ${
                              isCurrentShipped
                                ? 'text-sky-500 font-bold'
                                : isShippedOrBeyond
                                ? 'text-[var(--text-primary)] font-semibold'
                                : 'text-[var(--text-secondary)] font-medium'
                            }`}
                          >
                            Shipped & In Transit
                          </h4>
                          {shippedHistory && (
                            <span className="text-[11px] text-[var(--text-muted)] font-mono">
                              {formatDateTime(shippedHistory.created_at)}
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
                          {isShippedOrBeyond
                            ? 'Consignment picked up by premium express courier'
                            : 'Pending dispatch from atelier logistics center'}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Step 3: Processing (Atelier Tailoring) */}
                {(() => {
                  const isProcessingOrBeyond =
                    ['PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(
                      orderData.status
                    );
                  const isCurrentProcessing =
                    orderData.status === 'PROCESSING' || orderData.status === 'PACKED';

                  return (
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                          isProcessingOrBeyond
                            ? isCurrentProcessing
                              ? 'bg-[var(--gold)] text-black shadow-sm ring-4 ring-[var(--gold)]/20'
                              : 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)]'
                        }`}
                      >
                        {isProcessingOrBeyond ? (
                          <Check size={13} strokeWidth={2.5} />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <h4
                            className={`text-[14px] leading-tight ${
                              isCurrentProcessing
                                ? 'text-[var(--gold)] font-bold'
                                : isProcessingOrBeyond
                                ? 'text-[var(--text-primary)] font-semibold'
                                : 'text-[var(--text-secondary)] font-medium'
                            }`}
                          >
                            Atelier Tailoring & Quality Inspection
                          </h4>
                          {processingHistory && (
                            <span className="text-[11px] text-[var(--text-muted)] font-mono">
                              {formatDateTime(processingHistory.created_at)}
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                          {isProcessingOrBeyond
                            ? 'Bespoke finishing, iron-steaming, and heritage signature packaging'
                            : 'Scheduled for artisan workshop'}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Step 4: Payment Confirmed */}
                {(() => {
                  const isPaidOrBeyond =
                    orderData.status !== 'PENDING_PAYMENT' && orderData.status !== 'CANCELLED';

                  return (
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                          isPaidOrBeyond
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'
                        }`}
                      >
                        {isPaidOrBeyond ? (
                          <Check size={13} strokeWidth={2.5} />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <h4
                            className={`text-[14px] leading-tight ${
                              isPaidOrBeyond
                                ? 'font-semibold text-[var(--text-primary)]'
                                : 'font-medium text-amber-500'
                            }`}
                          >
                            Payment Authorization
                          </h4>
                          {paidHistory && (
                            <span className="text-[11px] text-[var(--text-muted)] font-mono">
                              {formatDateTime(paidHistory.created_at)}
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                          {isPaidOrBeyond
                            ? `PhonePe Gateway settlement verified (₹${Number(
                                orderData.total_amount || 0
                              ).toLocaleString('en-IN')})`
                            : 'Awaiting patron transaction confirmation'}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Step 5: Order Placed */}
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10">
                    <Check size={13} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <h4 className="text-[14px] font-semibold text-[var(--text-primary)] leading-tight">
                        Order Initiated & Confirmed
                      </h4>
                      <span className="text-[11px] text-[var(--text-muted)] font-mono">
                        {formatDateTime(orderData.created_at)}
                      </span>
                    </div>
                    <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                      Order record created via web checkout ({orderData.order_number})
                    </p>
                  </div>
                </div>

                {/* Cancelled Notice if applicable */}
                {orderData.status === 'CANCELLED' && (
                  <div className="flex items-start gap-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xs">
                    <XCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[13.5px] font-semibold text-rose-500 m-0">
                        Order Cancelled
                      </h4>
                      <p className="text-[12px] text-[var(--text-secondary)] mt-1">
                        {cancelledHistory?.reason || 'Order voided by patron or administrator.'}
                      </p>
                      {cancelledHistory && (
                        <span className="text-[10.5px] text-[var(--text-muted)] font-mono block mt-1">
                          Action taken on {formatDateTime(cancelledHistory.created_at)} by{' '}
                          {cancelledHistory.actor || 'System'}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Customer Profile, Shipping, and Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer Profile Card */}
          <div className="p-5 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs space-y-4">
            <h3 className="label-caps text-[11px] uppercase tracking-widest text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-2">
              Customer Profile
            </h3>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/30 flex items-center justify-center shrink-0 font-semibold text-[15px]">
                {customerName ? customerName.charAt(0).toUpperCase() : <User size={18} />}
              </div>
              <div className="min-w-0">
                <h4 className="font-garamond text-[19px] text-[var(--text-primary)] leading-tight truncate m-0">
                  {customerName}
                </h4>
                <span className="label-caps text-[10px] text-[var(--gold)] uppercase tracking-wider block mt-0.5">
                  {customerTier}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-[var(--border-color)] text-[13px] text-[var(--text-secondary)]">
              <div className="flex items-center gap-2.5 truncate">
                <Mail size={14} className="shrink-0 text-[var(--text-muted)]" />
                <span className="truncate select-all">{customerEmail}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={14} className="shrink-0 text-[var(--text-muted)]" />
                <span className="select-all tabular-nums">{customerPhone}</span>
              </div>
              {orderData.user_id && (
                <div className="flex items-center gap-2.5 text-[11px] font-mono text-[var(--text-muted)] pt-1">
                  <span>User ID:</span>
                  <span className="truncate select-all">{orderData.user_id}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Details Card */}
          <div className="p-5 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
              <h3 className="label-caps text-[11px] uppercase tracking-widest text-[var(--text-secondary)] m-0">
                Shipping Destination
              </h3>
              <MapPin size={14} className="text-[var(--gold)]" />
            </div>

            <div className="text-[13px] text-[var(--text-primary)] space-y-1 leading-relaxed">
              <p className="font-semibold text-[var(--text-primary)] m-0">
                {addr.name || customerName}
              </p>
              <p className="m-0 text-[var(--text-secondary)]">
                {[addr.line1 || addr.street1, addr.line2 || addr.street2]
                  .filter(Boolean)
                  .join(', ') || 'No street address specified'}
              </p>
              <p className="m-0 text-[var(--text-secondary)]">
                {[addr.city, addr.state, addr.postal_code].filter(Boolean).join(', ')}
              </p>
              <p className="m-0 text-[var(--text-secondary)] font-medium">
                {addr.country || 'India'}
              </p>
              {addr.phone && (
                <p className="m-0 text-[12px] text-[var(--text-muted)] pt-1">
                  Contact Phone: <span className="tabular-nums select-all">{addr.phone}</span>
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-[var(--border-color)]">
              <span className="label-caps text-[10px] uppercase text-[var(--text-secondary)] block mb-1">
                DELIVERY METHOD
              </span>
              <p className="text-[13px] text-[var(--gold)] font-medium m-0">
                Express Insured Heritage Courier (2-3 Days)
              </p>
            </div>
          </div>

          {/* Order Summary & Financials Card */}
          <div className="p-5 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs space-y-3">
            <h3 className="label-caps text-[11px] uppercase tracking-widest text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-2">
              Order Financials
            </h3>

            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal</span>
                <span className="text-[var(--text-primary)] tabular-nums">
                  ₹{Number(orderData.subtotal || 0).toLocaleString('en-IN')}
                </span>
              </div>

              {Number(orderData.discount_amount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount {orderData.coupon_code ? `(${orderData.coupon_code})` : ''}</span>
                  <span className="tabular-nums">
                    -₹{Number(orderData.discount_amount).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Shipping</span>
                <span className="text-[var(--text-primary)] tabular-nums">
                  {Number(orderData.shipping_amount || 0) === 0
                    ? 'Complimentary'
                    : `₹${Number(orderData.shipping_amount).toLocaleString('en-IN')}`}
                </span>
              </div>

              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Estimated Tax</span>
                <span className="text-[var(--text-primary)] tabular-nums">
                  {Number(orderData.tax_amount || 0) === 0
                    ? 'Included'
                    : `₹${Number(orderData.tax_amount).toLocaleString('en-IN')}`}
                </span>
              </div>

              <div className="flex justify-between pt-3 border-t border-[var(--border-color)] text-[16px] font-semibold text-[var(--text-primary)]">
                <span className="font-garamond text-[18px]">Total Charged</span>
                <span className="text-[var(--gold)] tabular-nums font-garamond text-[22px]">
                  ₹{Number(orderData.total_amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Payment Details */}
            {orderData.payments?.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[var(--border-color)]/60 text-[11.5px] text-[var(--text-secondary)] space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                  <ShieldCheck size={13} className="text-emerald-500" />
                  <span>Payment Information</span>
                </div>
                {orderData.payments.map((p, idx) => (
                  <div key={p.id || idx} className="flex justify-between text-[11px] text-[var(--text-muted)] font-mono">
                    <span>{p.provider || 'PhonePe'} ({p.status})</span>
                    <span>₹{Number(p.amount || orderData.total_amount).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
