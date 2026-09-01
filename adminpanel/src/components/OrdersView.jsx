import React, { useState, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Eye,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  Package,
  Calendar,
  Filter
} from 'lucide-react';
import { fetchOrders } from '../api/orders.js';

import { toast } from 'sonner';

export function OrdersView({ onSelectOrder }) {
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const data = await fetchOrders({
          status: statusFilter !== 'all' ? statusFilter.toUpperCase() : undefined,
          search: searchQuery || undefined,
        });
        if (data && Array.isArray(data)) {
          const formatted = data.map((o) => ({
            id: o.id,
            orderNumber: o.order_number || `#ITH-${o.id.slice(0, 4)}`,
            customerName: o.user?.name || 'Patron',
            customerEmail: o.user?.email || 'patron@example.com',
            date: new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: (o.status || 'processing').toLowerCase(),
            total: Number(o.total_amount || 0),
            itemsCount: o.items?.length || 1,
            items: o.items || [],
            shippingAddress: 'Mayfair, London',
            paymentMethod: o.payment_method || 'Online Payment',
          }));
          setOrders(formatted);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error('Orders live sync error:', err);
        toast.error('Unable to fetch atelier orders. Please check network connection.');
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [statusFilter, searchQuery]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const startIndex = filteredOrders.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredOrders.length);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 rounded-full label-caps text-[10px] uppercase tracking-wider font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Processing
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 rounded-full label-caps text-[10px] uppercase tracking-wider font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Shipped
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 rounded-full label-caps text-[10px] uppercase tracking-wider font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Delivered
          </span>
        );
      case 'cancelled':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 rounded-full label-caps text-[10px] uppercase tracking-wider font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-[1440px] w-full mx-auto space-y-6 md:space-y-8 flex-1">
      {/* Page Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 pb-2">
        <div>
          <h1
            className="font-garamond text-[28px] sm:text-[34px] md:text-[44px] text-[var(--text-primary)] font-normal tracking-tight leading-tight"
          >
            Orders
          </h1>
          <p className="body-md text-[13px] sm:text-[14px] md:text-[15px] text-[var(--text-secondary)] mt-1">
            Manage and track atelier dispatches.
          </p>
        </div>

        {/* Filters Group */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          {/* Status Filter */}
          <div className="relative group flex-1 sm:flex-none">
            <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1">
              STATUS
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-transparent border-b border-[var(--border-color)] focus:border-[var(--gold)] text-[var(--text-primary)] font-manrope text-[14px] py-1.5 pr-8 pl-0 outline-none w-full sm:w-44 transition-colors cursor-pointer rounded-none"
              >
                <option value="all" className="bg-[var(--bg-card)] text-[var(--text-primary)]">All Statuses</option>
                <option value="processing" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Processing</option>
                <option value="shipped" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Shipped</option>
                <option value="delivered" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Delivered</option>
                <option value="cancelled" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Cancelled</option>
              </select>
              <ChevronDown size={15} className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
            </div>
          </div>

          {/* Date Range */}
          <div className="relative group flex-1 sm:flex-none">
            <label className="block label-caps text-[10px] uppercase text-[var(--text-secondary)] mb-1">
              DATE RANGE
            </label>
            <div className="flex items-center justify-between sm:justify-start border-b border-[var(--border-color)] group-focus-within:border-[var(--gold)] transition-colors py-1.5">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none text-[var(--text-primary)] font-manrope text-[12px] sm:text-[13px] p-0 outline-none w-28 focus:ring-0 cursor-pointer"
              />
              <span className="text-[var(--text-secondary)] mx-1 sm:mx-2">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none text-[var(--text-primary)] font-manrope text-[12px] sm:text-[13px] p-0 outline-none w-28 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card List View (< 640px) */}
      <div className="block sm:hidden space-y-3">
        {paginatedOrders.length === 0 ? (
          <div className="p-8 text-center bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] text-[14px]">
            No orders found matching the selected filters.
          </div>
        ) : (
          paginatedOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => onSelectOrder?.(order)}
              className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-3 cursor-pointer active:bg-[var(--bg-secondary)]/50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-[15px] text-[var(--text-primary)] font-mono">
                    {order.orderNumber}
                  </span>
                  <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                    {order.date} • {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
                {getStatusBadge(order.status)}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]/60">
                <div className="flex items-center gap-2.5">
                  {order.avatarUrl ? (
                    <img
                      src={order.avatarUrl}
                      alt={order.customerName}
                      className="w-7 h-7 rounded-full object-cover border border-[var(--border-color)]"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[10px] font-bold text-[var(--text-secondary)]">
                      {order.initials}
                    </div>
                  )}
                  <span className="font-manrope text-[13px] font-medium text-[var(--text-primary)]">
                    {order.customerName}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-semibold text-[15px] text-[var(--text-primary)] tabular-nums block">
                    ₹{order.total.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-[var(--gold)] font-medium flex items-center gap-0.5 justify-end">
                    View <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop / Tablet Table View (>= 640px) */}
      <div className="hidden sm:block w-full overflow-x-auto border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] label-caps text-[11px] uppercase tracking-widest bg-[var(--bg-secondary)]/50">
              <th className="py-4 px-5 font-medium">Order ID</th>
              <th className="py-4 px-5 font-medium">Customer</th>
              <th className="py-4 px-5 font-medium">Date</th>
              <th className="py-4 px-5 font-medium">Status</th>
              <th className="py-4 px-5 font-medium text-right">Total</th>
              <th className="py-4 px-5 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)] font-manrope text-[14px]">
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[var(--text-secondary)]">
                  No orders found matching the selected filters.
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-[var(--bg-secondary)]/40 transition-colors group cursor-pointer"
                  onClick={() => onSelectOrder?.(order)}
                >
                  <td className="py-4 px-5 font-semibold text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors">
                    {order.orderNumber}
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      {order.avatarUrl ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--border-color)] shrink-0">
                          <img
                            src={order.avatarUrl}
                            alt={order.customerName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center label-caps text-[11px] font-bold text-[var(--text-secondary)] shrink-0">
                          {order.initials}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-[var(--text-primary)] leading-snug">
                          {order.customerName}
                        </p>
                        <p className="text-[12px] text-[var(--text-secondary)] leading-tight">
                          {order.customerEmail}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-[var(--text-secondary)] text-[13px]">
                    {order.date}
                  </td>
                  <td className="py-4 px-5">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="py-4 px-5 text-right font-semibold text-[var(--text-primary)] tabular-nums">
                    ₹{order.total.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOrder?.(order);
                      }}
                      className="label-caps text-[11px] uppercase tracking-wider text-[var(--text-secondary)] group-hover:text-[var(--gold)] inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Details</span>
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[var(--border-color)] flex flex-col sm:flex-row justify-between items-center gap-3 bg-[var(--bg-secondary)]/20 text-[13px] text-[var(--text-secondary)]">
          <span>{filteredOrders.length > 0 ? `Showing ${startIndex} to ${endIndex} of ${filteredOrders.length} orders` : 'Showing 0 orders'}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className={`p-1.5 border border-[var(--border-color)] rounded transition-colors ${
                currentPage <= 1 ? 'opacity-40 cursor-not-allowed' : 'hover:border-[var(--gold)] text-[var(--text-primary)] cursor-pointer'
              }`}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`w-8 h-8 flex items-center justify-center font-semibold rounded text-[12px] transition-all cursor-pointer ${
                  currentPage === num
                    ? 'bg-[var(--gold)] text-black shadow-sm'
                    : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--gold)]'
                }`}
              >
                {num}
              </button>
            ))}

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className={`p-1.5 border border-[var(--border-color)] rounded transition-colors ${
                currentPage >= totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:border-[var(--gold)] text-[var(--text-primary)] cursor-pointer'
              }`}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
