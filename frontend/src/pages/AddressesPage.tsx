import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MapPin, Edit2, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  type Address,
  type AddressInput,
} from '../api/addresses.js';

export const AddressesPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const token = localStorage.getItem('ithihasa_access_token');
    if (!token) {
      navigate('/login?redirect=/account/addresses', { replace: true });
    }
  }, [navigate]);

  // View mode: 'list' for viewing saved addresses, 'form' for adding/editing inline in-page
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [formData, setFormData] = useState<AddressInput>({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefaultShipping: true,
  });

  const { data: addresses = [], isLoading } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: fetchAddresses,
  });

  const createMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setViewMode('list');
      toast.success('Address saved successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save address');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AddressInput> }) =>
      updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setViewMode('list');
      setEditingAddress(null);
      toast.success('Address updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update address');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address removed');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to remove address');
    },
  });

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFormData({
      name: '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      isDefaultShipping: addresses.length === 0,
    });
    setViewMode('form');
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingAddress(addr);
    setFormData({
      name: addr.name,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      isDefaultShipping: addr.isDefaultShipping,
    });
    setViewMode('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddress) {
      updateMutation.mutate({ id: editingAddress.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors pb-24 md:pb-16 relative">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-b border-[var(--border-color)] flex justify-between items-center px-5 md:px-20 h-16 transition-colors">
        <button
          onClick={() => {
            if (viewMode === 'form') {
              setViewMode('list');
            } else {
              navigate('/account');
            }
          }}
          className="p-2 -ml-2 text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors flex items-center gap-1.5 cursor-pointer"
          aria-label="Go Back"
        >
          <ArrowLeft size={20} />
          <span className="text-[11px] label-caps uppercase tracking-widest hidden sm:inline">
            {viewMode === 'form' ? 'Back to Addresses' : 'Account'}
          </span>
        </button>

        <h1
          className="text-[18px] md:text-[22px] font-normal tracking-[0.15em] uppercase text-[var(--gold)]"
          style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
        >
          {viewMode === 'form'
            ? editingAddress
              ? 'Edit Address'
              : 'New Address'
            : 'Saved Addresses'}
        </h1>

        <div className="w-8">
          {viewMode === 'list' && (
            <button
              onClick={handleOpenAdd}
              className="p-2 text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors cursor-pointer"
              aria-label="Add New Address"
            >
              <Plus size={22} />
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[760px] mx-auto px-5 md:px-8 py-8 animate-in fade-in duration-300">
        {viewMode === 'list' ? (
          /* ================= LIST VIEW ================= */
          <div>
            <div className="flex justify-end items-center mb-6">
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 border border-[var(--text-primary)] px-4 py-2 text-[11px] label-caps tracking-widest uppercase hover:bg-[var(--gold)] hover:border-[var(--gold)] hover:text-[#0A0A0A] transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Address</span>
              </button>
            </div>

            {/* Addresses List */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-32 bg-[var(--bg-card)] border border-[var(--border-color)] animate-pulse rounded-lg"
                  />
                ))}
              </div>
            ) : addresses.length === 0 ? (
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-10 text-center flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)]">
                  <MapPin size={24} />
                </div>
                <div>
                  <h2
                    className="text-[22px] font-normal text-[var(--text-primary)] mb-1"
                    style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                  >
                    No addresses saved yet
                  </h2>
                  <p className="body-sm text-[13px] text-[var(--text-secondary)]">
                    Add your shipping address for effortless purchases.
                  </p>
                </div>
                <button
                  onClick={handleOpenAdd}
                  className="bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] px-6 py-3 label-caps text-[11px] uppercase tracking-[0.15em] hover:bg-[var(--gold)] hover:text-[#0A0A0A] transition-colors font-semibold cursor-pointer"
                >
                  Add First Address
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-5 md:p-6 transition-all hover:border-[var(--gold)] flex flex-col sm:flex-row justify-between sm:items-start gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-[16px] font-semibold text-[var(--text-primary)] tracking-wide">
                          {addr.name}
                        </h3>
                        {addr.isDefaultShipping && (
                          <span className="label-caps text-[9px] uppercase tracking-widest bg-[var(--gold)]/15 text-[var(--gold)] px-2.5 py-0.5 rounded border border-[var(--gold)]/30 font-semibold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="body-sm text-[13px] text-[var(--text-secondary)] leading-relaxed">
                        {addr.line1}
                        {addr.line2 ? `, ${addr.line2}` : ''}
                        <br />
                        {addr.city}, {addr.state} {addr.postalCode}
                        <br />
                        {addr.country}
                      </p>
                      <p className="body-sm text-[12px] text-[var(--text-secondary)]/80">
                        Phone: {addr.phone}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-start pt-2 sm:pt-0">
                      <button
                        onClick={() => handleOpenEdit(addr)}
                        className="p-2 text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors border border-[var(--border-color)] hover:border-[var(--gold)] rounded cursor-pointer"
                        aria-label="Edit Address"
                        title="Edit Address"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to remove this address?')) {
                            deleteMutation.mutate(addr.id);
                          }
                        }}
                        className="p-2 text-[var(--text-secondary)] hover:text-rose-500 transition-colors border border-[var(--border-color)] hover:border-rose-500/50 rounded cursor-pointer"
                        aria-label="Delete Address"
                        title="Delete Address"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ================= IN-PAGE FULL FORM VIEW ================= */
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 sm:p-10 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
            <div className="border-b border-[var(--border-color)] pb-5 mb-6">
              <h2
                className="text-[24px] sm:text-[28px] font-normal text-[var(--text-primary)] mb-1"
                style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
              >
                {editingAddress ? 'Edit Atelier Address' : 'New Atelier Address'}
              </h2>
              <p className="text-[13px] text-[var(--text-secondary)]">
                Provide your precise delivery details for safe, courier-tracked heritage consignments.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="label-caps text-[11px] uppercase tracking-wider text-[var(--text-secondary)] block mb-1.5 font-semibold">
                    Full Recipient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-3 text-[14px] text-[var(--text-primary)] focus:border-[var(--gold)] outline-none rounded transition-colors"
                  />
                </div>

                <div>
                  <label className="label-caps text-[11px] uppercase tracking-wider text-[var(--text-secondary)] block mb-1.5 font-semibold">
                    Mobile Contact Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-3 text-[14px] text-[var(--text-primary)] focus:border-[var(--gold)] outline-none rounded transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="label-caps text-[11px] uppercase tracking-wider text-[var(--text-secondary)] block mb-1.5 font-semibold">
                  Street Address & Door No. *
                </label>
                <input
                  type="text"
                  required
                  value={formData.line1}
                  onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                  placeholder="e.g. 124 Heritage Boulevard"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-3 text-[14px] text-[var(--text-primary)] focus:border-[var(--gold)] outline-none rounded transition-colors"
                />
              </div>

              <div>
                <label className="label-caps text-[11px] uppercase tracking-wider text-[var(--text-secondary)] block mb-1.5 font-semibold">
                  Apartment, Suite, Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={formData.line2 || ''}
                  onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
                  placeholder="e.g. Suite 4B, 2nd Floor"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-3 text-[14px] text-[var(--text-primary)] focus:border-[var(--gold)] outline-none rounded transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="label-caps text-[11px] uppercase tracking-wider text-[var(--text-secondary)] block mb-1.5 font-semibold">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-3 text-[14px] text-[var(--text-primary)] focus:border-[var(--gold)] outline-none rounded transition-colors"
                  />
                </div>

                <div>
                  <label className="label-caps text-[11px] uppercase tracking-wider text-[var(--text-secondary)] block mb-1.5 font-semibold">
                    State / Province *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Maharashtra"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-3 text-[14px] text-[var(--text-primary)] focus:border-[var(--gold)] outline-none rounded transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="label-caps text-[11px] uppercase tracking-wider text-[var(--text-secondary)] block mb-1.5 font-semibold">
                    PIN / Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="e.g. 400001"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-3 text-[14px] text-[var(--text-primary)] focus:border-[var(--gold)] outline-none rounded transition-colors"
                  />
                </div>

                <div>
                  <label className="label-caps text-[11px] uppercase tracking-wider text-[var(--text-secondary)] block mb-1.5 font-semibold">
                    Country
                  </label>
                  <input
                    type="text"
                    disabled
                    value={formData.country || 'India'}
                    className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] px-4 py-3 text-[14px] text-[var(--text-secondary)] rounded opacity-80 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-2 text-[12px] text-[var(--gold)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--gold)]"></span>
                  <span className="font-medium tracking-wide">
                    Default Address for Delivery & Billing Invoices
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-[var(--border-color)]">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-full sm:w-auto flex-1 bg-[var(--gold)] text-[#0A0A0A] hover:bg-[var(--gold-bright)] py-3.5 px-8 label-caps text-[12px] uppercase tracking-widest font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer text-center"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving Address...'
                    : editingAddress
                    ? 'Update Address'
                    : 'Save Address to Atelier'}
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="w-full sm:w-auto px-6 py-3.5 border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] label-caps text-[11px] uppercase tracking-wider transition-colors cursor-pointer text-center"
                >
                  Cancel & Return
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
