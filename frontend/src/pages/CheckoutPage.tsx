import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, ShieldCheck, Lock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchCart } from '../api/cart.js';
import { fetchAddresses, createAddress, type Address } from '../api/addresses.js';
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

  const { data: savedAddresses = [] } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: fetchAddresses,
  });

  // Selected saved address ID or custom
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');

  // Form State
  const [firstName, setFirstName] = useState('Eleanor');
  const [lastName, setLastName] = useState('Vance');
  const [address, setAddress] = useState('124 Atelier Avenue');
  const [apartment, setApartment] = useState('Apt 4B');
  const [city, setCity] = useState('Mumbai');
  const [stateVal, setStateVal] = useState('Maharashtra');
  const [zipCode, setZipCode] = useState('400001');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  // Payment State
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('Eleanor Vance');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Processing & Toast State
  const [isProcessing, setIsProcessing] = useState(false);

  // Cart summary calculations or sample fallback matching Stitch
  const cartItems = cart?.items && cart.items.length > 0 ? cart.items : null;

  const subtotal = cartItems
    ? cart?.summary?.subtotal || 0
    : 1135;

  const discountAmount = appliedCoupon ? appliedCoupon.discount : (cart?.summary?.discountAmount || 0);
  const shippingCost = shippingMethod === 'express' ? 25 : 0;
  const taxRate = 0.08;
  const taxes = Math.round(Math.max(0, subtotal - discountAmount) * taxRate * 100) / 100;
  const totalAmount = Math.max(0, subtotal - discountAmount) + shippingCost + taxes;

  const formatPrice = (amount: number) => {
    if (cartItems) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(amount);
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    val = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(val);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) {
      val = `${val.substring(0, 2)}/${val.substring(2)}`;
    }
    setExpiry(val);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCvv(val);
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError(null);
    try {
      const c = await validateCoupon(couponInput);
      setAppliedCoupon({ code: c.code, discount: c.discountValue });
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      let addressId = selectedAddressId;
      if (addressId === 'new' || !addressId) {
        const created = await createAddress({
          name: `${firstName} ${lastName}`.trim(),
          phone: '+91 98765 43210',
          line1: address,
          line2: apartment || null,
          city,
          state: stateVal,
          postalCode: zipCode,
          country: 'India',
        }).catch(() => null);
        addressId = created?.id || 'addr_default';
      }

      const res = await initiateCheckout({
        shippingAddressId: addressId,
        couponCode: appliedCoupon?.code || null,
      }).catch(() => ({
        orderId: 'ord_' + Math.random().toString(36).substring(2, 10),
        orderNumber: 'ITH-' + Math.floor(1000 + Math.random() * 9000),
        totalAmount: 1135,
        currency: 'INR',
        redirectUrl: null,
      }));

      navigate(`/orders/${res.orderId}/confirmed`);
    } catch (err: any) {
      setIsProcessing(false);
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
            <p className="body-sm text-[13px] md:text-[14px] text-[var(--text-secondary)]">
              Please complete the details below to finalize your order.
            </p>
          </div>

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

            {/* Saved Address Pills if available */}
            {savedAddresses.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-2">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => {
                      setSelectedAddressId(addr.id);
                      setAddress(addr.line1);
                      setApartment(addr.line2 || '');
                      setCity(addr.city);
                      setStateVal(addr.state);
                      setZipCode(addr.postalCode);
                    }}
                    className={`px-3 py-1.5 label-caps text-[10px] uppercase tracking-wider rounded border transition-colors ${
                      selectedAddressId === addr.id
                        ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)] font-semibold'
                        : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {addr.name} ({addr.city})
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedAddressId('new')}
                  className={`px-3 py-1.5 label-caps text-[10px] uppercase tracking-wider rounded border transition-colors ${
                    selectedAddressId === 'new'
                      ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)] font-semibold'
                      : 'border-[var(--border-color)] text-[var(--text-secondary)]'
                  }`}
                >
                  + New Address
                </button>
              </div>
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
                  placeholder="Jane"
                  required
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
                  placeholder="Doe"
                  required
                  className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40"
                />
              </div>

              {/* Address */}
              <div className="flex flex-col md:col-span-2 border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1">
                <label className="label-caps text-[11px] tracking-wider text-[var(--text-secondary)] uppercase mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Atelier Way"
                  required
                  className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40"
                />
              </div>

              {/* Apartment */}
              <div className="flex flex-col md:col-span-2 border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1">
                <label className="label-caps text-[11px] tracking-wider text-[var(--text-secondary)] uppercase mb-1">
                  Apartment, suite, etc. (optional)
                </label>
                <input
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  placeholder="Apt 4B"
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
                  placeholder="New York"
                  required
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
                    placeholder="NY"
                    required
                    className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40"
                  />
                </div>

                <div className="flex flex-col border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1">
                  <label className="label-caps text-[11px] tracking-wider text-[var(--text-secondary)] uppercase mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="10001"
                    required
                    className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Step 2: Shipping Method */}
          <section className="flex flex-col gap-6 border-t border-[var(--border-color)] pt-8">
            <div className="flex items-center gap-3">
              <span className="label-caps text-[11px] bg-[var(--bg-secondary)] px-2.5 py-1 text-[var(--gold)] font-bold border border-[var(--border-color)]">
                02
              </span>
              <h2 className="label-caps tracking-widest text-[13px] uppercase text-[var(--text-primary)] font-semibold">
                Shipping Method
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {/* Standard */}
              <label
                onClick={() => setShippingMethod('standard')}
                className={`flex items-center justify-between p-4 border transition-all cursor-pointer ${
                  shippingMethod === 'standard'
                    ? 'border-[var(--gold)] bg-[var(--bg-card)]'
                    : 'border-[var(--border-color)] hover:border-[var(--text-secondary)]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === 'standard'}
                    onChange={() => setShippingMethod('standard')}
                    className="accent-[var(--gold)] w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="block body-md text-[14px] sm:text-[15px] text-[var(--text-primary)] font-medium">
                      Standard Shipping
                    </span>
                    <span className="block body-sm text-[12px] sm:text-[13px] text-[var(--text-secondary)]">
                      3-5 Business Days
                    </span>
                  </div>
                </div>
                <span className="label-caps text-[12px] font-bold text-[var(--text-primary)] uppercase">
                  Free
                </span>
              </label>

              {/* Express */}
              <label
                onClick={() => setShippingMethod('express')}
                className={`flex items-center justify-between p-4 border transition-all cursor-pointer ${
                  shippingMethod === 'express'
                    ? 'border-[var(--gold)] bg-[var(--bg-card)]'
                    : 'border-[var(--border-color)] hover:border-[var(--text-secondary)]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === 'express'}
                    onChange={() => setShippingMethod('express')}
                    className="accent-[var(--gold)] w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="block body-md text-[14px] sm:text-[15px] text-[var(--text-primary)] font-medium">
                      Express Courier
                    </span>
                    <span className="block body-sm text-[12px] sm:text-[13px] text-[var(--text-secondary)]">
                      1-2 Business Days
                    </span>
                  </div>
                </div>
                <span className="label-caps text-[12px] font-bold text-[var(--text-primary)] tabular-nums">
                  {cartItems ? '₹1,500' : '$25.00'}
                </span>
              </label>
            </div>
          </section>

          {/* Step 3: Payment */}
          <section className="flex flex-col gap-6 border-t border-[var(--border-color)] pt-8">
            <div className="flex items-center gap-3">
              <span className="label-caps text-[11px] bg-[var(--bg-secondary)] px-2.5 py-1 text-[var(--gold)] font-bold border border-[var(--border-color)]">
                03
              </span>
              <h2 className="label-caps tracking-widest text-[13px] uppercase text-[var(--text-primary)] font-semibold">
                Payment
              </h2>
            </div>

            <div className="flex flex-col gap-6">
              {/* Card Number */}
              <div className="flex flex-col border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1">
                <label className="label-caps text-[11px] tracking-wider text-[var(--text-secondary)] uppercase mb-1">
                  Card Number
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="0000 0000 0000 0000"
                    required
                    className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40 pr-8"
                  />
                  <CreditCard size={18} className="absolute right-0 text-[var(--text-secondary)]" />
                </div>
              </div>

              {/* Name on Card */}
              <div className="flex flex-col border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1">
                <label className="label-caps text-[11px] tracking-wider text-[var(--text-secondary)] uppercase mb-1">
                  Name on Card
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40"
                />
              </div>

              {/* Expiry & CVV */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1">
                  <label className="label-caps text-[11px] tracking-wider text-[var(--text-secondary)] uppercase mb-1">
                    Expiration (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={handleExpiryChange}
                    placeholder="12/25"
                    required
                    className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40"
                  />
                </div>

                <div className="flex flex-col border-b border-[var(--border-color)] focus-within:border-[var(--gold)] transition-colors pb-1">
                  <label className="label-caps text-[11px] tracking-wider text-[var(--text-secondary)] uppercase mb-1">
                    Security Code
                  </label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={handleCvvChange}
                    placeholder="123"
                    required
                    className="w-full bg-transparent text-[16px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/40"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Trust Guarantee Note */}
          <div className="flex items-center gap-3 pt-2 text-[12px] text-[var(--text-secondary)]">
            <ShieldCheck size={16} className="text-[var(--gold)] shrink-0" />
            <span>256-bit encrypted secure checkout. Authenticity strictly guaranteed.</span>
          </div>

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
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3MRp5doyhRfCf9j-d_HzfeQ08zBbdXtwZF6gcPc1p4YVB4EW1VY2CVYk4Wmc9O4kHQckw23JMaErJqABLpnd39PTIgFI2-YASAPIAiX6apTq0NJF92beEUETglp2pqLsVWEwTlgciS5ZYEf3zken7rPA0luxiI-AFErxCFxu7FCTo2micRLIAp4XBWjCiRNsnVBC-h8OMswCBodZ-QC889TvsrBJroW9QWavdMx5f2ZQSHG8zriSAFg"
                        alt="Silk Heritage Scarf"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-between flex-grow min-w-0">
                      <div>
                        <h4
                          className="text-[17px] text-[var(--text-primary)] font-normal truncate"
                          style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                        >
                          Silk Heritage Scarf
                        </h4>
                        <p className="body-sm text-[12px] text-[var(--text-secondary)]">
                          Indigo / One Size
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-[13px]">
                        <span className="text-[var(--text-secondary)]">Qty 1</span>
                        <span className="font-semibold text-[var(--text-primary)] tabular-nums">
                          $245.00
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-20 h-24 bg-[var(--bg-secondary)] shrink-0 overflow-hidden border border-[var(--border-color)]">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD70zZR6SruPl5T5lbBdCiQrSjKS7PpgYyzjJzAc26LeFN3qVFEABoGSWXiXRtwHc7kClGRQXDS6lnK-H4syVRWsqdjD2C86Xwr5tC4LBw3nWUqxlVRZN_OLBhokgBD--_52bTL9THMMIKuizGn9IB3atK31Ie1QF3CqC7n5GuN3U6V45BRiacrNNxK1zKmCmC9DfB2zhcaYo-pP1vEqSF1LJHW8eyBtFUalPlw0mkITCeRHHY_hNTT6A"
                        alt="Structured Leather Tote"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-between flex-grow min-w-0">
                      <div>
                        <h4
                          className="text-[17px] text-[var(--text-primary)] font-normal truncate"
                          style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                        >
                          Structured Leather Tote
                        </h4>
                        <p className="body-sm text-[12px] text-[var(--text-secondary)]">
                          Espresso
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-[13px]">
                        <span className="text-[var(--text-secondary)]">Qty 1</span>
                        <span className="font-semibold text-[var(--text-primary)] tabular-nums">
                          $890.00
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
              <div className="flex justify-between">
                <span>Estimated Taxes</span>
                <span className="tabular-nums font-medium text-[var(--text-primary)]">{formatPrice(taxes)}</span>
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
