import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, ChevronRight, Truck, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchOrders, type OrderData } from '../api/orders.js';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'DELIVERED'>('ALL');

  const { data: orders = [], isLoading } = useQuery<OrderData[]>({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  const filteredOrders = orders.filter((o) => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return ['CREATED', 'CONFIRMED', 'PROCESSING', 'DISPATCHED'].includes(o.status.toUpperCase());
    if (filter === 'DELIVERED') return o.status.toUpperCase() === 'DELIVERED';
    return true;
  });

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'DELIVERED') {
      return (
        <span className="inline-flex items-center gap-1 bg-green-900/20 border border-green-800/40 text-green-400 label-caps text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded">
          <CheckCircle size={10} /> Delivered
        </span>
      );
    }
    if (s === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1 bg-red-900/20 border border-red-800/40 text-red-400 label-caps text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded">
          Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-[var(--gold)]/20 border border-[var(--gold)]/40 text-[var(--gold)] label-caps text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded">
        <Truck size={10} /> {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors pb-24 md:pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-b border-[var(--border-color)] flex justify-between items-center px-5 md:px-20 h-16 transition-colors">
        <button
          onClick={() => navigate('/account')}
          className="p-2 -ml-2 text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors"
          aria-label="Back to Account"
        >
          <ArrowLeft size={22} />
        </button>

        <h1
          className="text-[20px] md:text-[24px] font-normal tracking-[0.15em] uppercase text-[var(--gold)]"
          style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
        >
          Order History
        </h1>

        <div className="w-8" />
      </header>

      <main className="max-w-[900px] mx-auto px-5 md:px-8 py-6">
        {/* Status Filters */}
        <div className="flex gap-2 mb-6 border-b border-[var(--border-color)] pb-3 overflow-x-auto">
          {(['ALL', 'ACTIVE', 'DELIVERED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 label-caps text-[11px] tracking-wider uppercase transition-colors rounded ${
                filter === tab
                  ? 'bg-[var(--gold)] text-[#0A0A0A] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 bg-[var(--bg-card)] border border-[var(--border-color)] animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-12 text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)]">
              <Package size={24} />
            </div>
            <div>
              <h2
                className="text-[22px] font-normal text-[var(--text-primary)] mb-1"
                style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
              >
                No orders found
              </h2>
              <p className="body-sm text-[13px] text-[var(--text-secondary)]">
                You haven't placed any orders in this category yet.
              </p>
            </div>
            <Link
              to="/shop"
              className="bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] px-6 py-3 label-caps text-[11px] uppercase tracking-[0.15em] hover:bg-[var(--gold)] hover:text-[#0A0A0A] transition-colors font-semibold"
            >
              Explore Atelier Collection
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Link
                key={order.id}
                to={`/account/orders/${order.id}`}
                className="block bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-5 md:p-6 transition-all hover:border-[var(--gold)] group"
              >
                <div className="flex justify-between items-start mb-4 pb-3 border-b border-[var(--border-color)]/60">
                  <div>
                    <span className="label-caps text-[10px] tracking-wider text-[var(--text-secondary)] uppercase block mb-0.5">
                      Order #{order.orderNumber}
                    </span>
                    <span className="body-sm text-[12px] text-[var(--text-secondary)]">
                      Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <span className="body-md text-[16px] font-semibold text-[var(--text-primary)] tabular-nums">
                      ₹{order.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {(order.items || []).slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        className="w-12 h-14 bg-[var(--bg-secondary)] rounded overflow-hidden border border-[var(--border-color)] shrink-0"
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)]">
                            <Package size={14} />
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="min-w-0">
                      <p className="text-[14px] text-[var(--text-primary)] font-medium truncate">
                        {order.items?.[0]?.productName || 'Heritage Garment'}
                      </p>
                      {order.items && order.items.length > 1 && (
                        <p className="body-sm text-[11px] text-[var(--text-secondary)]">
                          +{order.items.length - 1} more item{order.items.length > 2 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[var(--text-secondary)] group-hover:text-[var(--gold)] transition-colors label-caps text-[11px] tracking-wider uppercase shrink-0">
                    <span>Track</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
