import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SuccessModal from '../components/SuccessModal';
import Seo from '../components/Seo';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../lib/format';
import { generateSignature, generateSignatureAlphabetical } from '../utils/payfast';
import { supabase } from '../lib/supabase';
import { getFunctionUrl, getFunctionUrlAbsolute } from '../lib/config';
import { validateCheckoutForm, validateSouthAfricanMobilePhone } from '../lib/validateCheckoutForm';
import { buildShippingPayload } from '../lib/checkoutShipping';
import { applyCheckoutValidationFailure } from '../lib/checkoutFormActions';
import { pushEcommerceEvent } from '../lib/analytics';

const DELIVERY_FEE = Number(import.meta.env.VITE_DELIVERY_FEE) || 99;
const enableEcommerce = import.meta.env.VITE_ENABLE_ECOMMERCE === 'true';

const Checkout = () => {
  const { cart, cartTotal, clearCart, getItemPrice } = useCart();
  const { user, loading: authLoading, signInWithGoogle, signOut, isConfigured: authConfigured } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isPreOrder, setIsPreOrder] = useState(false);
  const [preOrderName, setPreOrderName] = useState('');
  const [preOrderPhone, setPreOrderPhone] = useState('');
  const [error, setError] = useState('');
  const [deliveryType, setDeliveryType] = useState('delivery'); // 'delivery' | 'collection'
  const [paymentMethod, setPaymentMethod] = useState('payfast'); // 'payfast' | 'yoco'
  const [isProcessingYoco, setIsProcessingYoco] = useState(false);
  const [cellNumberBlurred, setCellNumberBlurred] = useState(false);
  const subtotal = cartTotal;
  const delivery = cart.length > 0 ? (deliveryType === 'collection' ? 0 : DELIVERY_FEE) : 0;
  const total = subtotal + delivery;

  const hasOutOfStockItems = useMemo(
    () => cart.some((item) => item?.isPreOrder || (item?.quantityAvailable ?? 0) <= 0),
    [cart]
  );

  // Force show payment if PayFast is configured (VITE_PAYFAST_MERCHANT_ID present) AND items are in stock
  // This ensures PayFast checkout is always shown when merchant ID is present and stock is available
  // Removed logic that defaults to Reservation for items at Glengrove Lodge
  const merchantId = import.meta.env.VITE_PAYFAST_MERCHANT_ID;
  const showPayment = useMemo(() => {
    // If PayFast merchant ID is present, show payment option when items are in stock
    if (merchantId) {
      // Check if at least one item is in stock (not pre-order and has quantity > 0)
      const hasInStockItems = cart.length > 0 && cart.some((item) => {
        // Skip pre-order items
        if (item?.isPreOrder) return false;
        // Check if quantity is available (default to true if not set, to allow manual override)
        const quantityAvailable = item?.quantityAvailable ?? 50; // Default to 50 if not set (manual override)
        return quantityAvailable > 0;
      });
      return hasInStockItems;
    }
    // If PayFast is not configured, only show if ecommerce is enabled and no out of stock items
    return enableEcommerce && !hasOutOfStockItems;
  }, [cart, merchantId, enableEcommerce]);

  const [formData, setFormData] = useState({
    name_first: '',
    name_last: '',
    email_address: '',
    cell_number: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    postal_code: ''
  });

  // Auto-fill form from signed-in user (only empty fields). Prefer Google given_name/family_name when present.
  useEffect(() => {
    if (!user) return;
    const meta = user.user_metadata || {};
    const first = meta.given_name || meta.first_name || (meta.full_name && meta.full_name.trim().split(/\s+/)[0]) || user.email?.split('@')[0] || '';
    const last = meta.family_name || meta.last_name || (meta.full_name && meta.full_name.trim().split(/\s+/).slice(1).join(' ')) || '';
    setFormData((prev) => ({
      ...prev,
      name_first: (prev.name_first || '').trim() || first,
      name_last: (prev.name_last || '').trim() || last,
      email_address: (prev.email_address || '').trim() || user.email || '',
    }));
  }, [user?.id]);

  const phoneFieldValidation = validateSouthAfricanMobilePhone(formData.cell_number);
  const showPhoneFieldError = cellNumberBlurred && !phoneFieldValidation.valid;

  /** Creates PENDING order + line items (shared by PayFast and Yoco). */
  const createPendingOrderWithItems = async () => {
    if (!supabase || !user?.id) {
      return { error: 'Checkout is not fully configured or you are not signed in.' };
    }
    const shippingPayload = buildShippingPayload(formData, deliveryType);
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'PENDING',
        total_amount: total,
        customer_email: (user.email ?? (formData.email_address || '').trim()) || null,
        shipping_data: shippingPayload,
      })
      .select('id')
      .single();

    if (orderError || !order?.id) {
      return { error: orderError?.message || 'Could not create order. Try Place Order or sign in and try again.' };
    }

    for (const item of cart) {
      const productId = item.product_id ?? (typeof item.id === 'number' ? item.id : parseInt(String(item.id || '').replace(/^collection-/, ''), 10));
      if (productId == null || Number.isNaN(productId)) continue;
      const unitPrice = getItemPrice(item);
      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: productId,
        quantity: item.quantity || 1,
        unit_price: unitPrice,
        product_name: item.name || 'Item',
      });
    }
    return { order };
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayfastPayment = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    const validation = validateCheckoutForm(formData, true);
    if (!validation.valid) {
      applyCheckoutValidationFailure(validation, { setError, setCellNumberBlurred });
      return;
    }
    if (!user?.id) {
      setError('Please sign in to pay with PayFast. You can use Place Order without signing in.');
      return;
    }

    if (!supabase) {
      setError('Checkout is not fully configured. Please use Place Order.');
      return;
    }

    setLoading(true);

    // GA4 ecommerce: begin_checkout before redirecting to PayFast
    if (cart.length > 0) {
      const items = cart.map((item) => {
        const unitPrice = getItemPrice(item);
        return {
          item_id: item.id,
          item_name: item.name,
          price: unitPrice,
          quantity: item.quantity || 1,
        };
      });
      pushEcommerceEvent("begin_checkout", {
        currency: "ZAR",
        value: total,
        items,
      });
    }
    try {
      // PayFast configuration - all must use VITE_ prefix for frontend access
      const sandboxRaw = String(import.meta.env.VITE_PAYFAST_SANDBOX ?? '').trim().toLowerCase();
      const isSandbox = sandboxRaw === 'true' || sandboxRaw === '1';
      const merchantId = String(import.meta.env.VITE_PAYFAST_MERCHANT_ID ?? '').trim();
      const merchantKey = String(import.meta.env.VITE_PAYFAST_MERCHANT_KEY ?? '').trim();
      const passPhrase = String(import.meta.env.VITE_PAYFAST_PASSPHRASE ?? '').trim();

      if (!merchantId || !merchantKey) {
        setError('PayFast is not configured. Please use Place Order.');
        setLoading(false);
        return;
      }

      // Validate passphrase is set (critical for signature generation)
      if (!passPhrase) {
        console.error('PayFast passphrase (VITE_PAYFAST_PASSPHRASE) is missing. Signature generation will fail.');
        setError('PayFast configuration incomplete. Please contact support.');
        setLoading(false);
        return;
      }

      const pending = await createPendingOrderWithItems();
      if ('error' in pending) {
        setError(pending.error);
        setLoading(false);
        return;
      }
      const { order } = pending;

      // PayFast validates return/cancel URLs against the merchant profile; prefer canonical site URL when set (see VITE_SITE_URL).
      const payfastSiteBase = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(
        /\/$/,
        ''
      );
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      const newCustomer = orderCount === 1;
      const successParams = new URLSearchParams({
        order_id: order.id,
        new_customer: newCustomer ? '1' : '0',
        amount: total.toFixed(2),
      });
      const customerEmail = (formData.email_address || user.email || '').trim();
      if (customerEmail) successParams.set('email', customerEmail);
      
      // PayFast requires a valid email address - use user email if form email is empty
      const payfastEmail = customerEmail || user.email || '';
      if (!payfastEmail) {
        setError('Email address is required for PayFast checkout. Please fill in your email address.');
        setLoading(false);
        return;
      }
      
      // Build PayFast payload in required field order:
      // merchant_id, merchant_key, return_url, cancel_url, notify_url, name_first, name_last, email_address, m_payment_id, amount, item_name
      // ITN must match PayFast dashboard exactly (same host as VITE_SITE_URL — no trailing comma, full path below).
      const notifyUrl = `${payfastSiteBase}/.netlify/functions/itn-listener`;
      const data = {
        merchant_id: merchantId,
        merchant_key: merchantKey,
        return_url: `${payfastSiteBase}/success?${successParams.toString()}`,
        cancel_url: `${payfastSiteBase}/checkout`,
        notify_url: notifyUrl,
        name_first: formData.name_first?.trim() || 'Guest',
        name_last: formData.name_last?.trim() || 'User',
        email_address: payfastEmail,
        m_payment_id: order.id,
        amount: total.toFixed(2),
        item_name: `Al-Ameen Caps Order #${order.id.slice(0, 8)}`,
      };

      // In live mode, do NOT include 'testing' parameter (PayFast requirement)
      // Only add 'testing' parameter in sandbox mode
      if (isSandbox) {
        data.testing = '1';
      }

      // Generate signature using VITE_PAYFAST_PASSPHRASE (see payfast.js).
      // Default: documented field order (Network International). Set VITE_PAYFAST_FORM_SIGNATURE_ALPHABETICAL=true for alphabetical / ksort-style if PayFast returns 500.
      const alphabeticalRaw = String(import.meta.env.VITE_PAYFAST_FORM_SIGNATURE_ALPHABETICAL ?? '').trim().toLowerCase();
      const useAlphabeticalSig = alphabeticalRaw === 'true' || alphabeticalRaw === '1';
      const signature = useAlphabeticalSig
        ? generateSignatureAlphabetical(data, passPhrase)
        : generateSignature(data, passPhrase);
      data.signature = signature;

      // Validate signature was generated (MD5 hash is 32 characters)
      if (!signature || signature.length !== 32) {
        console.error('PayFast signature generation failed:', { signature, dataKeys: Object.keys(data) });
        setError('Payment signature generation failed. Please try again or contact support.');
        setLoading(false);
        return;
      }

      // Validate required PayFast fields
      if (!data.merchant_id || !data.merchant_key || !data.amount || !data.item_name || !data.email_address) {
        console.error('Missing required PayFast fields:', data);
        setError('Payment configuration error. Please ensure all required fields are filled.');
        setLoading(false);
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email_address)) {
        console.error('Invalid email address:', data.email_address);
        setError('Please enter a valid email address.');
        setLoading(false);
        return;
      }

      // Create and submit PayFast form
      // Sandbox: https://sandbox.payfast.co.za/eng/process
      // Live default: https://www.payfast.co.za/eng/process
      // Optional (Network International): VITE_PAYFAST_LIVE_PROCESS_URL=https://payment.payfast.io/eng/process
      const liveProcessUrl =
        String(import.meta.env.VITE_PAYFAST_LIVE_PROCESS_URL ?? '').trim() ||
        'https://www.payfast.co.za/eng/process';
      const payfastUrl = isSandbox
        ? 'https://sandbox.payfast.co.za/eng/process'
        : liveProcessUrl;

      // Debug logging - ALWAYS log in production to diagnose 500 errors
      const signatureData = { ...data };
      delete signatureData.signature;
      delete signatureData.testing;
      const sortedKeys = Object.keys(signatureData).filter((k) => signatureData[k]);
      const signatureStringPreview =
        sortedKeys.map((k) => `${k}=${String(signatureData[k]).substring(0, 24)}…`).join('&') +
        (passPhrase ? '&passphrase=***' : '');

      console.log('PayFast Configuration:', {
        isSandbox,
        payfastUrl,
        merchant_id: data.merchant_id ? `${data.merchant_id.substring(0, 4)}…` : 'MISSING',
        merchant_key: data.merchant_key ? 'SET (included in signature)' : 'MISSING',
        passphrase: passPhrase ? 'SET (from VITE_PAYFAST_PASSPHRASE)' : 'MISSING - CHECK NETLIFY ENV VARS',
        passphrase_length: passPhrase ? passPhrase.length : 0,
        amount: data.amount,
        email_address: data.email_address,
        item_name: data.item_name,
        signature_length: data.signature?.length || 0,
        signature_preview: data.signature ? `${data.signature.substring(0, 8)}...` : 'MISSING',
        signature_string_preview: signatureStringPreview,
        return_url: data.return_url,
        cancel_url: data.cancel_url,
        notify_url: data.notify_url,
      });

      // Log the actual payload being sent (for debugging 500 errors)
      const payloadForLogging = { ...data };
      if (payloadForLogging.merchant_key) payloadForLogging.merchant_key = '***HIDDEN***';
      if (payloadForLogging.signature) payloadForLogging.signature = `${payloadForLogging.signature.substring(0, 8)}...`;
      console.log('PayFast Payload (sensitive data hidden):', payloadForLogging);

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payfastUrl;
      form.style.display = 'none';
      form.target = '_self'; // Submit in same window

      // Add all form fields
      // PayFast requires: merchant_id, merchant_key, amount, item_name, return_url, cancel_url, notify_url, name_first, name_last, email_address, m_payment_id, signature
      // Do NOT skip empty values - PayFast may require them even if empty
      Object.keys(data).forEach((key) => {
        const value = String(data[key]).trim();
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      // Append to body
      document.body.appendChild(form);
      
      // Log for debugging (remove in production if needed)
      if (import.meta.env.DEV) {
        console.log('Submitting to PayFast:', { url: payfastUrl, orderId: order.id, isSandbox });
      }
      
      // Submit form - use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        try {
          form.submit();
          // Don't remove form immediately - let browser handle redirect
          // Form will be removed when page unloads or redirects
        } catch (submitError) {
          console.error('PayFast form submission error:', submitError);
          setError('Failed to redirect to PayFast. Please check your connection and try again, or contact us at 081 048 7447.');
          if (document.body.contains(form)) {
            document.body.removeChild(form);
          }
          setLoading(false);
        }
      });
    } catch (err) {
      setError(err?.message || 'Payment submission failed. Please try again or use Place Order.');
    } finally {
      setLoading(false);
    }
  };

  const handleYocoPayment = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');

    const validation = validateCheckoutForm(formData, true);
    if (!validation.valid) {
      applyCheckoutValidationFailure(validation, { setError, setCellNumberBlurred });
      return;
    }
    if (!user?.id) {
      setError('Please sign in to pay with Yoco. You can use Place Order without signing in.');
      return;
    }
    if (!supabase) {
      setError('Checkout is not fully configured. Please use Place Order.');
      return;
    }

    setIsProcessingYoco(true);
    setLoading(true);

    try {
      const pending = await createPendingOrderWithItems();
      if ('error' in pending) {
        setError(pending.error);
        return;
      }
      const { order } = pending;

      const yocoSiteBase = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '');
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      const newCustomer = orderCount === 1;
      const successParams = new URLSearchParams({
        order_id: order.id,
        new_customer: newCustomer ? '1' : '0',
        amount: total.toFixed(2),
      });
      const yocoCustomerEmail = (formData.email_address || user.email || '').trim();
      if (yocoCustomerEmail) successParams.set('email', yocoCustomerEmail);

      const successUrl = `${yocoSiteBase}/success?${successParams.toString()}`;
      const cancelUrl = `${yocoSiteBase}/checkout`;

      const res = await fetch(getFunctionUrl('yoco-checkout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency: 'ZAR',
          successUrl,
          cancelUrl,
          phone: formData.cell_number,
          email: formData.email_address,
          orderId: order.id,
        }),
      });

      const data = await res.json().catch(() => ({}));

      const yocoRedirect =
        data?.redirectUrl || data?.redirect_url;
      if (!res.ok || !yocoRedirect) {
        const base =
          typeof data?.error === 'string' && data.error.trim()
            ? data.error.trim()
            : 'Could not start secure card payment. Please try again, or choose PayFast / Place Order.';
        const hint =
          !res.ok && res.status
            ? ` (${res.status})`
            : res.ok && !yocoRedirect
              ? ' (No redirect URL from gateway.)'
              : '';
        setError(`${base}${hint}`);
        return;
      }

      window.location.href = yocoRedirect;
    } catch (err) {
      setError(
        err?.message ||
          'Could not reach the card payment gateway. Please check your connection or use PayFast / Place Order.'
      );
    } finally {
      setIsProcessingYoco(false);
      setLoading(false);
    }
  };

  const handlePreOrder = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    const validation = validateCheckoutForm(formData, true);
    if (!validation.valid) {
      applyCheckoutValidationFailure(validation, { setError, setCellNumberBlurred });
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(getFunctionUrl('reservation'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          cart,
          total,
          marketing_opt_in: true,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        let msg = text || 'Pre-order failed';
        try {
          const j = JSON.parse(text);
          if (j?.error) msg = j.error;
        } catch (_) {}
        throw new Error(msg);
      }
      setPreOrderName([formData.name_first, formData.name_last].filter(Boolean).join(' ') || 'Valued Customer');
      setPreOrderPhone(phoneFieldValidation.digits);
      setIsPreOrder(true);
      clearCart();
    } catch (err) {
      const msg = err?.message || '';
      const isNetwork = /failed to fetch|network error|load failed/i.test(msg) || err?.name === 'TypeError';
      setError(isNetwork
        ? 'Could not reach the server. Check your connection and try again, or contact us to place your order.'
        : (msg || 'Something went wrong. Please try again or contact us.'));
    } finally {
      setLoading(false);
    }
  };

  if (isPreOrder) {
    return (
      <>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 pt-[var(--site-header-offset)] pb-24" />
          <Footer />
        </div>
        <SuccessModal customerName={preOrderName} preOrderPhone={preOrderPhone} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Seo noindex title="Checkout" url="/checkout" />
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 text-primary pt-[var(--site-header-offset)] pb-24">
        <h1 className="font-serif text-3xl font-bold text-accent mb-8 text-center">Secure Checkout</h1>

        {cart.length === 0 && (
          <div className="mb-6 p-6 bg-primary/5 border border-accent/30 rounded-lg text-center max-w-md mx-auto">
            <p className="font-sans text-primary font-medium">Your cart is empty.</p>
            <p className="mt-1 font-sans text-primary/70 text-sm">Add items from the shop to checkout.</p>
            <Link to="/shop" className="inline-block mt-3 text-accent font-semibold hover:underline font-sans">Go to Shop →</Link>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 items-start max-w-4xl mx-auto">
          <div className="bg-secondary p-6 shadow-premium rounded-lg border border-accent/20">
            {authConfigured && (
              <div className="mb-6 text-center">
                {user ? (
                  <div className="flex items-center justify-center gap-2">
                    {user.user_metadata?.avatar_url && (
                      <img src={user.user_metadata.avatar_url} alt="" width={32} height={32} className="w-8 h-8 rounded-full object-cover" loading="lazy" decoding="async" />
                    )}
                    <span className="font-sans text-sm text-primary/80">{user.email}</span>
                    <button
                      type="button"
                      onClick={signOut}
                      className="font-sans text-xs text-accent hover:underline"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    className="font-sans w-full py-2.5 px-4 rounded border-2 border-black/20 hover:border-accent hover:bg-accent/10 transition-colors text-sm font-medium"
                  >
                    Sign in with Google
                  </button>
                )}
              </div>
            )}
            {user && (
              <p className="font-sans text-accent font-medium text-center mb-4">
                Welcome back, {formData.name_first || (user.user_metadata?.full_name || "").trim().split(/\s+/)[0] || user.email?.split("@")[0] || "there"}. We&apos;ve pre-filled your details for a faster checkout.
              </p>
            )}
            <h2 className="font-serif text-xl font-semibold text-primary mb-4 text-center">
              Customer Details
            </h2>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                // If payment is available and user is signed in, use selected payment method
                // Otherwise, use reservation/pre-order
                if (showPayment && user?.id) {
                    if (paymentMethod === 'yoco') {
                      handleYocoPayment(e);
                    } else {
                      handlePayfastPayment(e);
                    }
                } else {
                  handlePreOrder(e);
                }
              }} 
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="name_first"
                  placeholder="First Name"
                  value={formData.name_first}
                  onChange={handleInputChange}
                  required
                  className="font-sans w-full p-3 border border-black/20 rounded focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                />
                <input
                  name="name_last"
                  placeholder="Last Name"
                  value={formData.name_last}
                  onChange={handleInputChange}
                  required
                  className="font-sans w-full p-3 border border-black/20 rounded focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                />
              </div>
              <input
                name="email_address"
                type="email"
                placeholder="Email Address"
                value={formData.email_address}
                onChange={handleInputChange}
                required
                className="font-sans w-full p-3 border border-black/20 rounded focus:border-accent focus:ring-1 focus:ring-accent outline-none"
              />
              <div>
                <input
                  id="checkout-cell-number"
                  name="cell_number"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="Phone Number (e.g. 0821234567)"
                  value={formData.cell_number}
                  onChange={handleInputChange}
                  onBlur={() => setCellNumberBlurred(true)}
                  required
                  aria-invalid={showPhoneFieldError}
                  aria-describedby={showPhoneFieldError ? 'checkout-cell-number-error' : undefined}
                  className={`font-sans w-full p-3 border rounded focus:ring-1 focus:ring-accent outline-none ${
                    showPhoneFieldError
                      ? 'border-red-500 bg-red-50/50 focus:border-red-500'
                      : 'border-black/20 focus:border-accent'
                  }`}
                />
                {showPhoneFieldError && (
                  <p id="checkout-cell-number-error" className="mt-1.5 text-sm text-red-600 font-sans" role="alert">
                    {phoneFieldValidation.message}
                  </p>
                )}
              </div>
              {showPayment && (
                <div className="font-sans space-y-2">
                  <p className="text-sm font-medium text-primary">Delivery method</p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="delivery_type"
                      checked={deliveryType === 'delivery'}
                      onChange={() => setDeliveryType('delivery')}
                      className="text-accent focus:ring-accent"
                    />
                    <span className="text-primary">Standard delivery — {formatPrice(DELIVERY_FEE)}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="delivery_type"
                      checked={deliveryType === 'collection'}
                      onChange={() => setDeliveryType('collection')}
                      className="text-accent focus:ring-accent"
                    />
                    <span className="text-primary">Collect at Glengrove Lodge — Free</span>
                  </label>
                  {deliveryType === 'collection' && (
                    <p className="text-xs text-primary/60">We will contact you to arrange collection at Glengrove Lodge.</p>
                  )}
                </div>
              )}
              <input
                name="address_line_1"
                placeholder="Address (street, suburb)"
                value={formData.address_line_1}
                onChange={handleInputChange}
                required
                className="font-sans w-full p-3 border border-black/20 rounded focus:border-accent focus:ring-1 focus:ring-accent outline-none"
              />
              <input
                name="address_line_2"
                placeholder="Address line 2 (optional)"
                value={formData.address_line_2}
                onChange={handleInputChange}
                className="font-sans w-full p-3 border border-black/20 rounded focus:border-accent focus:ring-1 focus:ring-accent outline-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="font-sans w-full p-3 border border-black/20 rounded focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                />
                <input
                  name="postal_code"
                  placeholder="Postal Code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  required
                  className="font-sans w-full p-3 border border-black/20 rounded focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-center" role="alert" aria-live="assertive">
                  <p className="font-sans text-red-700 text-sm">{error}</p>
                  <button
                    type="button"
                    onClick={() => setError('')}
                    className="font-sans text-sm text-accent font-medium mt-2 hover:underline"
                  >
                    Dismiss and try again
                  </button>
                </div>
              )}

              {!showPayment ? (
                <>
                  {enableEcommerce && (
                    <p className="font-sans text-primary/70 text-sm mt-4">Some items are currently out of stock. We will contact you when stock arrives to arrange payment and delivery.</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading || cart.length === 0}
                    className="btn-primary font-sans w-full py-4 min-h-[48px] text-base mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 touch-manipulation"
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>
                </>
              ) : (
                <>
                  {!user && (
                    <p className="font-sans text-primary/70 text-sm mt-4">Sign in above to pay with PayFast. Your order will appear in Admin → Orders once payment is complete.</p>
                  )}
                  <div className="mt-4 font-sans space-y-2">
                    <p className="text-sm font-medium text-primary text-center">Choose your payment method</p>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="payment_method"
                          value="payfast"
                          checked={paymentMethod === 'payfast'}
                          onChange={() => setPaymentMethod('payfast')}
                          className="text-accent focus:ring-accent"
                        />
                        <span className="text-primary text-sm">
                          Secure Checkout via PayFast (card, instant EFT, SnapScan & more)
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="payment_method"
                          value="yoco"
                          checked={paymentMethod === 'yoco'}
                          onChange={() => setPaymentMethod('yoco')}
                          className="text-accent focus:ring-accent"
                        />
                        <span className="text-primary text-sm">
                          Pay with Card via Yoco (secure hosted card checkout)
                        </span>
                      </label>
                    </div>
                  </div>
                  <p className="font-sans flex items-center justify-center gap-2 text-xs text-primary/60 mt-4">
                    <Lock className="w-3.5 h-3.5 text-accent" aria-hidden />
                    Cape Town based · Nationwide delivery. Secure checkout via PayFast or Yoco.
                  </p>
                  <button
                    type="submit"
                    disabled={loading || isProcessingYoco || cart.length === 0 || !user}
                    className="btn-primary font-sans w-full py-4 min-h-[48px] text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 touch-manipulation"
                  >
                    {paymentMethod === 'yoco'
                      ? isProcessingYoco
                        ? 'Processing Secure Payment...'
                        : 'Pay Securely with Card (Yoco)'
                      : loading
                        ? 'Processing...'
                        : 'Secure Checkout via PayFast'}
                  </button>
                  <div className="mt-3 flex flex-col items-center gap-2">
                    <p className="font-sans text-[11px] text-primary/60 text-center max-w-xs">
                      Your bank may show your phone number as the reference, but we always match your payment to your{" "}
                      <span className="font-semibold">Al-Ameen order number</span> for reconciliation.
                    </p>
                    <p className="font-sans text-[11px] uppercase tracking-wide text-primary/60">
                      Accepted via PayFast
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-white text-[10px] font-semibold text-black shadow-sm">
                        Visa
                      </span>
                      <span className="px-2.5 py-1 rounded bg-white text-[10px] font-semibold text-black shadow-sm">
                        Mastercard
                      </span>
                      <span className="px-2.5 py-1 rounded bg-white text-[10px] font-semibold text-black shadow-sm">
                        Apple&nbsp;Pay
                      </span>
                      <span className="px-2.5 py-1 rounded bg-white text-[10px] font-semibold text-black shadow-sm">
                        Samsung&nbsp;Pay
                      </span>
                      <span className="px-2.5 py-1 rounded bg-white text-[10px] font-semibold text-black shadow-sm">
                        SnapScan / QR
                      </span>
                    </div>
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-accent/60 bg-primary/5 px-3 py-1 text-[11px] font-semibold text-accent">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                      Authorized Heritage Retailer
                    </span>
                  </div>
                </>
              )}
              <p className="font-sans mt-3 text-center text-xs text-primary/60">
                {showPayment
                  ? 'Secure payment via PayFast. We will ship your order after payment confirmation.'
                  : !enableEcommerce
                    ? 'Payment processing available. We will contact you to confirm your order.'
                    : 'Some items are out of stock. We will contact you when stock arrives to arrange payment and delivery.'}
              </p>
            </form>
          </div>

          <div className="bg-primary/5 p-6 rounded-lg h-fit border border-black/5">
            <h2 className="font-serif text-xl font-semibold text-primary mb-4 text-center">Order Summary</h2>
            {cart.length === 0 ? (
              <>
                <p className="font-sans text-primary/70">Your cart is empty.</p>
                <Link
                  to="/shop"
                  className="block w-full py-3.5 mt-4 text-center font-sans font-medium rounded border-2 border-accent text-accent hover:bg-accent hover:text-primary transition-colors"
                >
                  Continue Shopping
                </Link>
              </>
            ) : (
              <>
                {cart.map((item, i) => (
                  <div key={item.id ?? i} className="flex justify-between py-2 border-b border-black/10 font-sans">
                    <span className="text-primary">{item.name} (x{item.quantity || 1})</span>
                    <span className="font-semibold text-primary">{formatPrice(getItemPrice(item) * (item.quantity || 1))}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-b border-black/10 font-sans">
                  <span className="text-primary">Subtotal</span>
                  <span className="font-semibold text-primary">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-black/10 font-sans">
                  <span className="text-primary">Delivery</span>
                  <span className="font-semibold text-primary">{formatPrice(delivery)}</span>
                </div>
                <div className="flex justify-between mt-4 text-xl font-bold border-t border-black/10 pt-4 font-sans">
                  <span className="text-primary">Total</span>
                  <span className="text-accent">{formatPrice(total)}</span>
                </div>
                <Link
                  to="/shop"
                  className="block w-full py-3.5 mt-4 text-center font-sans font-medium rounded border-2 border-accent text-accent hover:bg-accent hover:text-primary transition-colors"
                >
                  Continue Shopping
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
