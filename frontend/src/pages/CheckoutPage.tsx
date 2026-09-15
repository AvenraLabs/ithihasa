import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Plus, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchCart } from '../api/cart.js';
import { fetchAddresses, createAddress, type Address } from '../api/addresses.js';
import { fetchUserProfile, type UserSession } from '../api/auth.js';
import { fetchStorefrontSettings, calculateShippingFee, type StorefrontSettings } from '../api/settings.js';
import { initiateCheckout } from '../api/orders.js';
import { validateCoupon } from '../api/coupons.js';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('ithihasa_access_token');
    if (!token) {
      navigate('/login?redirect=/checkout', { replace: true });
    }
  }, [navigate]);

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: () => fetchCart(),
  });

  const { data: userProfile } = useQuery<UserSession>({
    queryKey: ['user-profile'],
    queryFn: fetchUserProfile,
  });

  const { data: storefrontSettings } = useQuery<StorefrontSettings>({
    queryKey: ['storefront-settings'],
    queryFn: fetchStorefrontSettings,
  });

  const { data: savedAddresses = [] } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: fetchAddresses,
  });

  // Selected saved address ID or 'new'
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');

  // Form State (no hardcoded sample data)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Synchronize form fields with an address
  const applyAddressToForm = (addr: Address) => {
    const parts = (addr.name || '').trim().split(/\s+/);
    setFirstName(parts[0] || '');
    setLastName(parts.slice(1).join(' ') || '');
    setPhone(addr.phone || '');
    setAddress(addr.line1 || '');
    setApartment(addr.line2 || '');
    setCity(addr.city || '');
    setStateVal(addr.state || '');
    setZipCode(addr.postalCode || '');
  };

  // Auto-select default or first address if available from profile
  React.useEffect(() => {
    if (savedAddresses.length > 0) {
      const defaultAddr = savedAddresses.find((a) => a.isDefaultShipping) || savedAddresses[0];
      if (defaultAddr && (selectedAddressId === 'new' || !savedAddresses.some((a) => a.id === selectedAddressId))) {
        setSelectedAddressId(defaultAddr.id);
        applyAddressToForm(defaultAddr);
      }
    }
  }, [savedAddresses]);

  // Pre-fill user profile name/phone if entering new address and empty
  React.useEffect(() => {
    if (userProfile?.name && selectedAddressId === 'new' && !firstName && !lastName) {
      const parts = userProfile.name.trim().split(/\s+/);
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
    if (userProfile?.phone && selectedAddressId === 'new' && !phone) {
      setPhone(userProfile.phone);
    }
  }, [userProfile]);

  const handleSelectSavedAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    applyAddressToForm(addr);
  };

  const handleSelectNewAddress = () => {
    setSelectedAddressId('new');
    setAddress('');
    setApartment('');
    setCity('');
    setStateVal('');
    setZipCode('');
    if (userProfile?.name) {
      const parts = userProfile.name.trim().split(/\s+/);
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    } else {
      setFirstName('');
      setLastName('');
    }
    setPhone(userProfile?.phone || '');
  };

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Processing & Toast State
  const [isProcessing, setIsProcessing] = useState(false);

  // Cart summary calculations or sample fallback matching Stitch
  const cartItems = cart?.items && cart.items.length > 0 ? cart.items : null;

  const subtotal = cartItems
    ? cart?.summary?.subtotal || 0
    : 34500;

  const discountAmount = appliedCoupon ? appliedCoupon.discount : (cart?.summary?.discountAmount || 0);
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  // Dynamic Shipping calculation based on Admin Panel Settings
  const shippingCost = calculateShippingFee(discountedSubtotal, storefrontSettings?.shipping);

  // Total Amount (tax removed per instructions)
  const totalAmount = discountedSubtotal + shippingCost;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError(null);
    try {
      const c = await validateCoupon(couponInput);
      if (c.minimumOrderAmount > 0 && subtotal < c.minimumOrderAmount) {
        setCouponError(`Minimum order value of ₹${c.minimumOrderAmount.toLocaleString('en-IN')} required for this coupon.`);
        return;
      }
      let calculatedDiscount = 0;
      if (c.discountType === 'PERCENTAGE') {
        calculatedDiscount = (subtotal * c.discountValue) / 100;
        if (c.maxDiscountAmount && calculatedDiscount > c.maxDiscountAmount) {
          calculatedDiscount = c.maxDiscountAmount;
        }
      } else {
        calculatedDiscount = Math.min(subtotal, c.discountValue);
      }
      calculatedDiscount = Math.round(calculatedDiscount);
      setAppliedCoupon({ code: c.code, discount: calculatedDiscount });
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setCheckoutError(null);

    try {
      let addressId = selectedAddressId;
      if (addressId === 'new' || !addressId) {
        if (!firstName.trim() || !address.trim() || !city.trim() || !stateVal.trim() || !zipCode.trim()) {
          setCheckoutError('Please fill in all required shipping address fields.');
          setIsProcessing(false);
          return;
        }

        const fullName = `${firstName} ${lastName}`.trim() || userProfile?.name || 'Valued Client';
        const contactPhone = phone.trim() || userProfile?.phone || '+91 98765 43210';
        const created = await createAddress({
          name: fullName,
          phone: contactPhone,
          line1: address,
          line2: apartment || null,
          city,
          state: stateVal,
          postalCode: zipCode,
          country: 'India',
        });
        addressId = created?.id || 'addr_default';
      }

      const res = await initiateCheckout({
        shippingAddressId: addressId,
        couponCode: appliedCoupon?.code || null,
      });

      if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
        return;
      }

      navigate(`/orders/${res.orderId}/confirmed`);
    } catch (err: any) {
      setIsProcessing(false);
      const failedOrderId = err.details?.orderId || err.orderId;
      if (failedOrderId) {
        navigate(`/orders/${failedOrderId}/confirmed?status=failed`);
      } else {
        setCheckoutError(err.message || 'Payment initiation failed. Please verify your details and try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors flex flex-col font-body-md selection:bg-[var(--gold)] selection:text-[#0A0A0A]">
      {/* Top Navigation Bar (Minimal Transactional Header matching Stitch) */}
      <header className="fixed top-0 w-full z-50 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-color)] flex justify-between items-center px-4 md:px-20 h-16 transition-all duration-300">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go Back"
          className="flex items-center text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors p-2"
        >
          <ArrowLeft size={20} />
        </button>

        <Link to="/" className="h-8 flex items-center justify-center">
          <span
            className="text-[22px] md:text-[28px] uppercase tracking-[0.2em] font-normal"
            style={{ color: 'var(--gold)', fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            ITHIHASA
          </span>
        </Link>

        <div className="w-8 flex items-center justify-end text-[var(--text-secondary)]">
          <Lock size={16} />
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow pt-24 pb-32 md:pt-28 px-4 md:px-20 max-w-[1440px] mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
        {/* Left Column: Checkout Steps */}
        <form id="checkout-form" onSubmit={handleSubmit} className="md:col-span-7 flex flex-col gap-10">
          <div className="border-b border-[var(--border-color)] pb-4">
            <h1
              className="text-[30px] md:text-[40px] font-normal text-[var(--text-primary)] mb-1"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              Checkout
            </h1>
          </div>

          {/* Checkout Error Notification */}
          {checkoutError && (
            <div className="bg-red-950/40 border border-red-800/60 text-red-200 p-4 rounded-lg flex items-start gap-3 animate-in fade-in">
              <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-[14px] font-semibold text-red-300">Checkout Notice</h4>
                <p className="text-[13px] text-red-400 mt-0.5">{checkoutError}</p>
              </div>
            </div>
          )}

          {/* Step 1: Shipping Address */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="label-caps text-[11px] bg-[var(--bg-secondary)] px-2.5 py-1 text-[var(--gold)] font-bold border border-[var(--border-color)]">
                01
              </span>
              <h2 className="label-caps tracking-widest text-[13px] uppercase text-[var(--text-primary)] font-semibold">
                Shipping Address
              </h2>
            </div>

            {/* Saved Addresses Radio Selection */}
            {savedAddresses.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="label-caps text-[11px] tracking-wider text-[var(--text-secondary)] uppercase font-medium">
                  Select Delivery Address
                </span>
                <div className="grid grid-cols-1 gap-3">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <label
                        key={addr.id}
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`group relative flex items-start gap-3.5 p-4 border transition-all cursor-pointer rounded-sm ${
                          isSelected
                            ? 'border-[var(--gold)] bg-[var(--gold)]/[0.04] shadow-sm'
                            : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--gold)]/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name="shipping_address"
                          checked={isSelected}
                          onChange={() => handleSelectSavedAddress(addr)}
                          className="mt-1 accent-[var(--gold)] w-4 h-4 cursor-pointer"
                        />
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="body-md text-[14px] font-semibold text-[var(--text-primary)]">
                              {addr.name}
                            </span>
                            {addr.isDefaultShipping && (
                              <span className="label-caps text-[9px] px-2 py-0.5 border border-[var(--gold)]/40 text-[var(--gold)] bg-[var(--gold)]/10 font-medium">
                                Default
                              </span>
                            )}
                            {addr.phone && (
                              <span className="body-sm text-[12px] text-[var(--text-secondary)]">
                                • {addr.phone}
                              </span>
                            )}
                          </div>
                          <p className="body-sm text-[13px] text-[var(--text-secondary)] leading-relaxed">
                            {addr.line1}
                            {addr.line2 ? `, ${addr.line2}` : ''}
                          </p>
                          <p className="body-sm text-[13px] text-[var(--text-secondary)]">
                            {addr.city}, {addr.state} — {addr.postalCode}
                          </p>
                        </div>
                      </label>
                    );
                  })}

                  {/* Option to Deliver to a New Address */}
                  <label
                    onClick={handleSelectNewAddress}
                    className={`group flex items-center gap-3.5 p-4 border transition-all cursor-pointer rounded-sm ${
                      selectedAddressId === 'new'
                        ? 'border-[var(--gold)] bg-[var(--gold)]/[0.04]'
                        : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--gold)]/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping_address"
                      checked={selectedAddressId === 'new'}
                      onChange={handleSelectNewAddress}
                      className="accent-[var(--gold)] w-4 h-4 cursor-pointer"
                    />
                    <div className="flex items-center gap-2">
                      <Plus size={15} className="text-[var(--gold)]" />
                      <span className="body-md text-[13px] font-medium text-[var(--text-primary)]">
                        Deliver to a new address
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Input Form for New Address or when no saved addresses exist */}
            {(selectedAddressId === 'new' || savedAddresses.length === 0) && (
              <div className="flex flex-col gap-6 pt-2 animate-in fade-in duration-200">
                {savedAddresses.length > 0 && (
                  <span className="label-caps text-[11px] tracking-wider text-[var(--text-secondary)] uppercase font-medium">
                    New Address Details
                  </span>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div className="flex flex-col border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1">
                    <label className="label-caps text-[11px] tracking-wider text-[var(--text-secondary)] uppercase mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      required={selectedAddressId === 'new'}
                      className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="flex flex-col border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1">
                    <label className="label-caps text-[11px] tracking-wider text-[var(--text-secondary)] uppercase mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      required={selectedAddressId === 'new'}
                      className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40"
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col md:col-span-2 border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1">
                    <label className="label-caps text-[11px] tracking-wider text-[var(--text-secondary)] uppercase mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      required={selectedAddressId === 'new'}
                      className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40"
                    />
                  </div>

                  {/* Address Line 1 */}
                  <div className="flex flex-col md:col-span-2 border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1">
                    <label className="label-caps text-[11px] tracking-wider text-[var(--text-secondary)] uppercase mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House / Flat no., Building, Street"
                      required={selectedAddressId === 'new'}
                      className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40"
                    />
                  </div>

                  {/* Apartment */}
                  <div className="flex flex-col md:col-span-2 border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1">
                    <label className="label-caps text-[11px] tracking-wider text-[var(--text-secondary)] uppercase mb-1">
                      Apartment, suite, unit (optional)
                    </label>
                    <input
                      type="text"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      placeholder="Apt, Suite, Floor, etc."
                      className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40"
                    />
                  </div>

                  {/* City */}
                  <div className="flex flex-col border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1">
                    <label className="label-caps text-[11px] tracking-wider text-[var(--text-secondary)] uppercase mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      required={selectedAddressId === 'new'}
                      className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40"
                    />
                  </div>

                  {/* State & ZIP */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1">
                      <label className="label-caps text-[11px] tracking-wider text-[var(--text-secondary)] uppercase mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={stateVal}
                        onChange={(e) => setStateVal(e.target.value)}
                        placeholder="State"
                        required={selectedAddressId === 'new'}
                        className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40"
                      />
                    </div>

                    <div className="flex flex-col border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1">
                      <label className="label-caps text-[11px] tracking-wider text-[var(--text-secondary)] uppercase mb-1">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="PIN Code"
                        required={selectedAddressId === 'new'}
                        className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Desktop Purchase Action */}
          <div className="hidden md:block pt-4">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--gold)] hover:text-[#0A0A0A] label-caps text-[13px] tracking-[0.18em] py-4 uppercase transition-all duration-300 font-semibold active:scale-[0.99] shadow-lg disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <span>Complete Purchase</span>
              )}
            </button>
          </div>
        </form>

        {/* Right Column: Order Summary matching Stitch */}
        <div className="md:col-span-5 relative mt-4 md:mt-0">
          <div className="sticky top-24 bg-[var(--bg-card)] border border-[var(--border-color)] p-6 md:p-8 flex flex-col gap-6 shadow-sm">
            <h3 className="label-caps tracking-widest text-[13px] uppercase text-[var(--text-primary)] font-semibold border-b border-[var(--border-color)] pb-3">
              Order Summary
            </h3>

            {/* Items List */}
            <div className="flex flex-col gap-5 max-h-[380px] overflow-y-auto pr-1">
              {cartItems ? (
                cartItems.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-18 h-22 sm:w-20 sm:h-24 bg-[var(--bg-secondary)] shrink-0 overflow-hidden border border-[var(--border-color)]">
                      <img
                        src={item.product.image || 'https://via.placeholder.com/200'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-between flex-grow min-w-0">
                      <div>
                        <h4
                          className="text-[17px] text-[var(--text-primary)] font-normal truncate"
                          style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                        >
                          {item.product.name}
                        </h4>
                        <p className="body-sm text-[12px] text-[var(--text-secondary)]">
                          Size {item.variant.size} {item.variant.color ? `• ${item.variant.color}` : ''}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-[13px]">
                        <span className="text-[var(--text-secondary)]">Qty {item.quantity}</span>
                        <span className="font-semibold text-[var(--text-primary)] tabular-nums">
                          {formatPrice(item.subtotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                /* Approved Stitch Reference Fallback Items */
                <>
                  <div className="flex gap-4">
                    <div className="w-20 h-24 bg-[var(--bg-secondary)] shrink-0 overflow-hidden border border-[var(--border-color)]">
                      <img
                        src="https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=400&q=80"
                        alt="Kashmiri Antique Pashmina Stole"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-between flex-grow min-w-0">
                      <div>
                        <h4
                          className="text-[17px] text-[var(--text-primary)] font-normal truncate"
                          style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                        >
                          Kashmiri Antique Pashmina Stole
                        </h4>
                        <p className="body-sm text-[12px] text-[var(--text-secondary)]">
                          Standard (2m x 1m) • Muted Gold & Ink
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-[13px]">
                        <span className="text-[var(--text-secondary)]">Qty 1</span>
                        <span className="font-semibold text-[var(--text-primary)] tabular-nums">
                          ₹14,500
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-20 h-24 bg-[var(--bg-secondary)] shrink-0 overflow-hidden border border-[var(--border-color)]">
                      <img
                        src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80"
                        alt="Royal Velvet Bandhgala"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-between flex-grow min-w-0">
                      <div>
                        <h4
                          className="text-[17px] text-[var(--text-primary)] font-normal truncate"
                          style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                        >
                          Royal Velvet Bandhgala
                        </h4>
                        <p className="body-sm text-[12px] text-[var(--text-secondary)]">
                          Midnight Noir / Size 42
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-[13px]">
                        <span className="text-[var(--text-secondary)]">Qty 1</span>
                        <span className="font-semibold text-[var(--text-primary)] tabular-nums">
                          ₹48,000
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Promo Code Input */}
            <div className="border-t border-[var(--border-color)] pt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="PROMO / ATELIER CODE"
                  className="w-full bg-transparent border border-[var(--border-color)] focus:border-[var(--gold)] px-3 py-2 text-[12px] uppercase label-caps focus:outline-none rounded"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--gold)] text-[11px] label-caps uppercase tracking-wider font-semibold rounded shrink-0"
                >
                  Apply
                </button>
              </div>
              {appliedCoupon && (
                <p className="text-[12px] text-[var(--gold)] mt-1.5 font-medium">
                  ✓ Code {appliedCoupon.code} applied (Save ₹{appliedCoupon.discount})
                </p>
              )}
              {couponError && (
                <p className="text-[12px] text-[var(--error)] mt-1.5">
                  {couponError}
                </p>
              )}
            </div>

            {/* Calculations */}
            <div className="flex flex-col gap-2 border-t border-[var(--border-color)] pt-4 body-sm text-[13px] text-[var(--text-secondary)]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium text-[var(--text-primary)]">{formatPrice(subtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-[var(--gold)] font-medium">
                  <span>Promo Discount</span>
                  <span className="tabular-nums">-₹{appliedCoupon.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="tabular-nums font-medium text-[var(--text-primary)]">
                  {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                </span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="flex justify-between items-end border-t border-[var(--text-primary)] pt-4">
              <span className="label-caps tracking-widest text-[13px] uppercase font-bold text-[var(--text-primary)]">
                Total
              </span>
              <span
                className="text-[24px] font-normal tabular-nums text-[var(--text-primary)]"
                style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
              >
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Action Area for Mobile with Safe-Area Padding */}
      <div className="fixed bottom-0 left-0 w-full bg-[var(--bg-primary)]/95 backdrop-blur-md border-t border-[var(--border-color)] p-4 pb-safe z-40 md:hidden">
        <button
          type="submit"
          form="checkout-form"
          disabled={isProcessing}
          className="w-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--gold)] hover:text-[#0A0A0A] label-caps tracking-[0.15em] py-4 uppercase transition-all duration-300 font-semibold active:scale-[0.98] shadow-lg disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <span>Complete Purchase</span>
          )}
        </button>
      </div>
    </div>
  );
};
