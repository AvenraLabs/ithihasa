import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Edit,
  Mail,
  Phone,
  Check,
  Package,
  Truck,
  CheckCircle2
} from 'lucide-react';
import { INITIAL_ORDERS } from './OrdersView.jsx';
import { fetchOrders } from '../api/orders.js';
import { toast } from 'sonner';

export function OrderDetailView({ order, onBack }) {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [liveOrder, setLiveOrder] = useState(null);

  const handleBack = onBack || (() => navigate('/orders'));

  useEffect(() => {
    async function loadDetail() {
      if (!orderId) return;
      try {
        const res = await fetchOrders({ search: orderId, limit: 1 }).catch(() => null);
        if (res && res.orders && res.orders.length > 0) {
          const o = res.orders[0];
          setLiveOrder({
            id: o.id,
            orderNumber: `#ITH-${o.order_number || o.id.slice(0, 4)}`,
            status: (o.status || 'processing').toLowerCase(),
            date: new Date(o.created_at || Date.now()).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            }),
            customerName: o.user ? `${o.user.first_name || ''} ${o.user.last_name || ''}`.trim() : 'Atelier Patron',
            customerEmail: o.user?.email || 'patron@ithihasa.com',
            customerPhone: o.user?.phone || '+1 (555) 019-2834',
            customerType: 'Noir Tier Patron',
            avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIPq79k1lT0TGctsHI8ikHkC5NLjPhlFKoJmR7F1zwS5vr7m9RfMD99OIzsfwdfScS7PT_nfC0KGrfUa8rh3xCuOH4DvFGWalM4ku7bD7-JLvCSm_dMPor_i6WxSg2vUcR_QZxNboblIWkv-8U3fTM-O6LEmv2uOaolC3PnpB5urqo1upPLtb-JtJwGGM-TwFRNF6qsX10jeFHq0dnEUStFtjyKBnsYdztl17zay3IdYCOXxPg9C8PAw',
            shippingAddress: {
              name: o.user ? `${o.user.first_name || ''} ${o.user.last_name || ''}`.trim() : 'Eleanor Vance',
              street1: '1042 Heritage Lane',
              street2: 'Suite 3B',
              cityStateZip: 'San Francisco, CA 94109',
              country: 'United States',
              method: 'Premium Atelier Delivery (2-3 Days)'
            },
            items: o.items?.length > 0 ? o.items.map((it, idx) => ({
              id: String(idx + 1),
              name: it.product_variant?.product?.name || 'Heritage Atelier Garment',
              spec: `Size: ${it.product_variant?.size || 'Standard'} • Color: ${it.product_variant?.color || 'Heirloom'}`,
              quantity: it.quantity || 1,
              price: Number(it.unit_price || 850),
              image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCp2MY-i6FVyIWxqy0BivV4xT41MJJ9908qDTJIXx2JR2ZGU914DIv91Q0lLzgs-12T500ACSURod9mxu09pXYGiH230imPT-nC_Kivu20DwqYqsDZlIEg9CMHPNtuNWuhO1Rr3SOX0nuJjj9ZjSmuX-_u8mjt-aklkmwuk1gpy4yTYGzotBiAJ8_JriQOcnKtr1zO-h1YwFSuJSQTqJ7HPQA8T9HUf3RfeI_yKEjM-kzDW-e-j47BCcQ'
            })) : [
              {
                id: '1',
                name: 'Kanchipuram Heirloom Saree',
                spec: 'Color: Crimson & Gold • Size: Standard',
                quantity: 1,
                price: 850.00,
                image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCp2MY-i6FVyIWxqy0BivV4xT41MJJ9908qDTJIXx2JR2ZGU914DIv91Q0lLzgs-12T500ACSURod9mxu09pXYGiH230imPT-nC_Kivu20DwqYqsDZlIEg9CMHPNtuNWuhO1Rr3SOX0nuJjj9ZjSmuX-_u8mjt-aklkmwuk1gpy4yTYGzotBiAJ8_JriQOcnKtr1zO-h1YwFSuJSQTqJ7HPQA8T9HUf3RfeI_yKEjM-kzDW-e-j47BCcQ'
              }
            ]
          });
        }
      } catch (err) {
        console.warn('Order detail fetch note:', err.message);
      }
    }
    loadDetail();
  }, [orderId]);

  // Lookup order by ID or orderNumber from URL, or use passed order prop, or fallback
  const foundOrder = orderId
    ? INITIAL_ORDERS.find(
        (o) =>
          o.id === orderId ||
          o.orderNumber.replace('#', '').toLowerCase() === orderId.replace('#', '').toLowerCase()
      )
    : null;

  const currentOrder = liveOrder || order || foundOrder || {
    orderNumber: '#ITH-4920',
    status: 'processing',
    date: 'October 24, 2023 at 10:42 AM',
    customerName: 'Eleanor Vance',
    customerEmail: 'e.vance@example.com',
    customerPhone: '+1 (555) 019-2834',
    customerType: 'Returning Client',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIPq79k1lT0TGctsHI8ikHkC5NLjPhlFKoJmR7F1zwS5vr7m9RfMD99OIzsfwdfScS7PT_nfC0KGrfUa8rh3xCuOH4DvFGWalM4ku7bD7-JLvCSm_dMPor_i6WxSg2vUcR_QZxNboblIWkv-8U3fTM-O6LEmv2uOaolC3PnpB5urqo1upPLtb-JtJwGGM-TwFRNF6qsX10jeFHq0dnEUStFtjyKBnsYdztl17zay3IdYCOXxPg9C8PAw',
    shippingAddress: {
      name: 'Eleanor Vance',
      street1: '1042 Heritage Lane',
      street2: 'Suite 3B',
      cityStateZip: 'San Francisco, CA 94109',
      country: 'United States',
      method: 'Premium Atelier Delivery (2-3 Days)'
    },
    items: [
      {
        id: '1',
        name: 'Kanchipuram Heirloom Saree',
        spec: 'Color: Crimson & Gold • Size: Standard',
        quantity: 1,
        price: 850.00,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCp2MY-i6FVyIWxqy0BivV4xT41MJJ9908qDTJIXx2JR2ZGU914DIv91Q0lLzgs-12T500ACSURod9mxu09pXYGiH230imPT-nC_Kivu20DwqYqsDZlIEg9CMHPNtuNWuhO1Rr3SOX0nuJjj9ZjSmuX-_u8mjt-aklkmwuk1gpy4yTYGzotBiAJ8_JriQOcnKtr1zO-h1YwFSuJSQTqJ7HPQA8T9HUf3RfeI_yKEjM-kzDW-e-j47BCcQ'
      },
      {
        id: '2',
        name: 'Banarasi Silk Dupatta',
        spec: 'Color: Ivory & Silver • Size: Standard',
        quantity: 1,
        price: 350.00,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChGPEW4JwxYYRiybHsS-xDf4jBYLJ3wC01QcXZpvzDppzHBh0sreoHltNCMjc4KSVwiL0E6zgwxQlZk-NtobJXtnx7JlSaoMooxLKskanJ0-jWuFL2CiNu8GLa5f71hcTC3C6yTV_NMkvpIUJN4PwZ5dzej2MmpS2ASUF1YSYmBu0763NoIlWC1BQ0DMdJ66eDXW8yT8E02O-gAXhjiQzc6mDELn72_NapGl1IqfkazBv43sdfse3FIQ'
      }
    ],
    subtotal: 1200.00,
    shipping: 40.00,
    tax: 0.00,
    total: 1240.00
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-full label-caps text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Processing
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 rounded-full label-caps text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            Shipped
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 rounded-full label-caps text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 rounded-full label-caps text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-full label-caps text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Processing
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-[1440px] w-full mx-auto space-y-6 md:space-y-8 flex-1">
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-3 border-b border-[var(--border-color)]">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1
              className="font-garamond text-[28px] sm:text-[36px] md:text-[44px] text-[var(--text-primary)] font-normal tracking-tight leading-tight m-0"
            >
              {currentOrder.orderNumber || '#ITH-4920'}
            </h1>
            {getStatusBadge(currentOrder.status || 'processing')}
          </div>
          <p className="body-md text-[13px] sm:text-[14px] text-[var(--text-secondary)]">
            Placed on {currentOrder.date || 'October 24, 2023 at 10:42 AM'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => toast.success(`Invoice for ${currentOrder.orderNumber} generated & downloaded.`)}
            className="flex-1 sm:flex-none justify-center px-4 sm:px-5 py-2.5 border border-[var(--border-color)] text-[var(--text-primary)] bg-[var(--bg-card)] hover:border-[var(--gold)] hover:text-[var(--gold)] label-caps text-[11px] uppercase tracking-widest transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Download size={14} />
            <span>Download Invoice</span>
          </button>
          <button
            onClick={() => toast.info(`Order parameters for ${currentOrder.orderNumber} unlocked for editing.`)}
            className="flex-1 sm:flex-none justify-center px-4 sm:px-5 py-2.5 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] label-caps text-[11px] uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Edit size={14} />
            <span>Edit Order</span>
          </button>
        </div>
      </div>

      {/* Main Content 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        {/* Left Column (8 cols): Items & Timeline */}
        <div className="lg:col-span-8 space-y-8 lg:space-y-10">
          {/* Order Items Section */}
          <section className="space-y-4">
            <h2 className="font-garamond text-[20px] sm:text-[22px] font-normal text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2">
              Order Items
            </h2>

            <div className="space-y-4">
              {(currentOrder.items || []).map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 p-4 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm group hover:border-[var(--gold)] transition-colors"
                >
                  <div className="w-full sm:w-24 h-48 sm:h-32 shrink-0 bg-[var(--bg-secondary)] overflow-hidden border border-[var(--border-color)]">
                    <img
                      src={item.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCp2MY-i6FVyIWxqy0BivV4xT41MJJ9908qDTJIXx2JR2ZGU914DIv91Q0lLzgs-12T500ACSURod9mxu09pXYGiH230imPT-nC_Kivu20DwqYqsDZlIEg9CMHPNtuNWuhO1Rr3SOX0nuJjj9ZjSmuX-_u8mjt-aklkmwuk1gpy4yTYGzotBiAJ8_JriQOcnKtr1zO-h1YwFSuJSQTqJ7HPQA8T9HUf3RfeI_yKEjM-kzDW-e-j47BCcQ'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between h-full w-full py-1">
                    <div>
                      <h3 className="font-garamond text-[18px] sm:text-[19px] text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors">
                        {item.name}
                      </h3>
                      <p className="body-sm text-[12.5px] sm:text-[13px] text-[var(--text-secondary)] mt-0.5">
                        {item.spec || item.variant || 'Standard Edition'}
                      </p>
                    </div>

                    <div className="flex justify-between items-end mt-4 pt-3 border-t border-[var(--border-color)]">
                      <span className="body-sm text-[13px] text-[var(--text-secondary)]">
                        Qty: {item.quantity}
                      </span>
                      <span className="font-manrope text-[16px] font-semibold text-[var(--text-primary)] tabular-nums">
                        ${(item.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Timeline Section */}
          <section className="space-y-4">
            <h2 className="font-garamond text-[20px] sm:text-[22px] font-normal text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2">
              Timeline
            </h2>

            <div className="pl-3 sm:pl-4 relative pt-2">
              {/* Vertical line connecting steps */}
              <div className="absolute left-[19px] sm:left-[23px] top-4 bottom-4 w-[2px] bg-[var(--border-color)]" />

              <div className="space-y-6 relative">
                {/* Step 1: Delivered */}
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center shrink-0 z-10">
                    <span className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
                  </div>
                  <div>
                    <h4 className="font-manrope text-[14px] font-medium text-[var(--text-secondary)]">
                      Order Delivered
                    </h4>
                    <p className="body-sm text-[12px] text-[var(--text-muted)]">
                      Pending courier delivery confirmation
                    </p>
                  </div>
                </div>

                {/* Step 2: Shipped */}
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center shrink-0 z-10">
                    <span className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
                  </div>
                  <div>
                    <h4 className="font-manrope text-[14px] font-medium text-[var(--text-secondary)]">
                      Shipped
                    </h4>
                    <p className="body-sm text-[12px] text-[var(--text-muted)]">
                      Pending courier handover
                    </p>
                  </div>
                </div>

                {/* Step 3: Processing (Current Active) */}
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-[var(--gold)] text-black flex items-center justify-center shrink-0 z-10 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                  </div>
                  <div>
                    <h4 className="font-manrope text-[14px] font-bold text-[var(--gold)]">
                      Processing
                    </h4>
                    <p className="body-sm text-[12px] text-[var(--text-secondary)]">
                      October 24, 2023 - 11:15 AM
                    </p>
                  </div>
                </div>

                {/* Step 4: Order Placed */}
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10">
                    <Check size={13} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="font-manrope text-[14px] font-semibold text-[var(--text-primary)]">
                      Order Placed
                    </h4>
                    <p className="body-sm text-[12px] text-[var(--text-secondary)]">
                      October 24, 2023 - 10:42 AM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (4 cols): Customer, Shipping, Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer Card */}
          <div className="p-5 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-4">
            <h3 className="label-caps text-[11px] uppercase tracking-widest text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-2">
              Customer Profile
            </h3>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full overflow-hidden border border-[var(--border-color)] shrink-0 bg-[var(--bg-secondary)]">
                <img
                  src={currentOrder.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIPq79k1lT0TGctsHI8ikHkC5NLjPhlFKoJmR7F1zwS5vr7m9RfMD99OIzsfwdfScS7PT_nfC0KGrfUa8rh3xCuOH4DvFGWalM4ku7bD7-JLvCSm_dMPor_i6WxSg2vUcR_QZxNboblIWkv-8U3fTM-O6LEmv2uOaolC3PnpB5urqo1upPLtb-JtJwGGM-TwFRNF6qsX10jeFHq0dnEUStFtjyKBnsYdztl17zay3IdYCOXxPg9C8PAw'}
                  alt={currentOrder.customerName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-garamond text-[18px] text-[var(--text-primary)] leading-tight">
                  {currentOrder.customerName}
                </h4>
                <span className="label-caps text-[10px] text-[var(--gold)] uppercase tracking-wider block mt-0.5">
                  {currentOrder.customerType || 'Returning Client'}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--border-color)] text-[13px] text-[var(--text-secondary)] font-manrope">
              <div className="flex items-center gap-2 truncate">
                <Mail size={14} className="shrink-0 text-[var(--text-muted)]" />
                <span className="truncate">{currentOrder.customerEmail || 'e.vance@example.com'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="shrink-0 text-[var(--text-muted)]" />
                <span>{currentOrder.customerPhone || '+1 (555) 019-2834'}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="p-5 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-3">
            <h3 className="label-caps text-[11px] uppercase tracking-widest text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-2">
              Shipping Details
            </h3>

            <div className="font-manrope text-[13px] text-[var(--text-primary)] space-y-0.5 leading-relaxed">
              <p className="font-semibold text-[var(--text-primary)]">
                {typeof currentOrder.shippingAddress === 'string'
                  ? currentOrder.shippingAddress
                  : currentOrder.shippingAddress?.street1 || '1042 Heritage Lane, Suite 3B'}
              </p>
              {typeof currentOrder.shippingAddress === 'object' && (
                <>
                  <p>{currentOrder.shippingAddress?.cityStateZip || 'San Francisco, CA 94109'}</p>
                  <p>{currentOrder.shippingAddress?.country || 'United States'}</p>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-[var(--border-color)]">
              <span className="label-caps text-[10px] uppercase text-[var(--text-secondary)] block mb-1">
                DELIVERY METHOD
              </span>
              <p className="font-manrope text-[13px] text-[var(--gold)] font-medium">
                {currentOrder.shippingAddress?.method || 'Premium Atelier Delivery (2-3 Days)'}
              </p>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="p-5 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-3">
            <h3 className="label-caps text-[11px] uppercase tracking-widest text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-2">
              Order Summary
            </h3>

            <div className="space-y-2 font-manrope text-[13px]">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal</span>
                <span className="text-[var(--text-primary)] tabular-nums">
                  ${(currentOrder.subtotal || 1200).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Shipping</span>
                <span className="text-[var(--text-primary)] tabular-nums">
                  ${(currentOrder.shipping || 40).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Tax</span>
                <span className="text-[var(--text-primary)] tabular-nums">
                  ${(currentOrder.tax || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between pt-3 border-t border-[var(--border-color)] text-[16px] font-semibold text-[var(--text-primary)]">
                <span className="font-garamond text-[18px]">Total</span>
                <span className="text-[var(--gold)] tabular-nums font-garamond text-[20px]">
                  ${(currentOrder.total || 1240).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
