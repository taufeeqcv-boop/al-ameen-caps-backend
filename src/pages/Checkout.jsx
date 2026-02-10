import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SuccessModal from '../components/SuccessModal';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../lib/format';
import { generateSignature } from '../utils/payfast';
import { supabase } from '../lib/supabase';

const DELIVERY_FEE = Number(import.meta.env.VITE_DELIVERY_FEE) || 99;
const enableEcommerce = import.meta.env.VITE_ENABLE_ECOMMERCE === 'true';
// Base URL for Netlify functions. If VITE_SITE_URL is localhost, use relative so the request goes to current origin (avoids ERR_CONNECTION_REFUSED to wrong port).
const rawBase = (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '');
const functionsBase = /localhost/i.test(rawBase) ? '' : rawBase;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_MIN_DIGITS = 9;

function validateCheckoutForm(formData, requireAddress = true) {
  const first = (formData.name_first ?? '').trim();
  const last = (formData.name_last ?? '').trim();
  const email = (formData.email_address ?? '').trim();
  const phone = (formData.cell_number ?? '').trim();
  if (!first) return { valid: false, message: 'Please enter your first name.' };
  if (!last) return { valid: false, message: 'Please enter your last name.' };
  if (!email) return { valid: false, message: 'Please enter your email address.' };
  if (!EMAIL_REGEX.test(email)) return { valid: false, message: 'Please enter a valid email address.' };
  if (!phone) return { valid: false, message: 'Please enter your phone number.' };
  const digits = phone.replace(/\D/g, '');
  if (digits.length < PHONE_MIN_DIGITS) return { valid: false, message: 'Please enter a valid phone number (at least 9 digits).' };
  if (requireAddress) {
    if (!(formData.address_line_1 ?? '').trim()) return { valid: false, message: 'Please enter your address.' };
    if (!(formData.city ?? '').trim()) return { valid: false, message: 'Please enter your city.' };
    if (!(formData.postal_code ?? '').trim()) return { valid: false, message: 'Please enter your postal code.' };
  }
  return { valid: true, message: '' };
}

const Checkout = () => {
  const { cart, cartTotal, clearCart, getItemPrice } = useCart();
  const { user, loading: authLoading, signInWithGoogle, signOut, isConfigured: authConfigured } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isPreOrder, setIsPreOrder] = useState(false);
  const [preOrderName, setPreOrderName] = useState('');
  const [preOrderPhone, setPreOrderPhone] = useState('');
  const [error, setError] = useState('');
  const subtotal = cartTotal;
  const delivery = cart.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;

  const hasOutOfStockItems = useMemo(
    () => cart.some((item) => item?.isPreOrder || (item?.quantityAvailable ?? 0) <= 0),
    [cart]
  );

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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    const validation = validateCheckoutForm(formData, true);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }
    if (!user?.id) {
      setError('Please sign in to pay with PayFast. You can use Pre-Order Now without signing in.');
      return;
    }

    if (!supabase) {
      setError('Checkout is not fully configured. Please use Pre-Order Now.');
      return;
    }

    setLoading(true);
    try {
      const isSandbox = import.meta.env.VITE_PAYFAST_SANDBOX === 'true';
      const merchantId = import.meta.env.VITE_PAYFAST_MERCHANT_ID;
      const merchantKey = import.meta.env.VITE_PAYFAST_MERCHANT_KEY;
      const passPhrase = import.meta.env.VITE_PAYFAST_PASSPHRASE || (isSandbox ? 'jt7NOE43FZPn' : '');

      if (!merchantId || !merchantKey) {
        setError('PayFast is not configured. Please use Pre-Order Now.');
        return;
      }

      // Create order (and order_items) so Admin Orders page and PayFast ITN can use it
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'PENDING',
          total_amount: total,
        })
        .select('id')
        .single();

      if (orderError || !order?.id) {
        setError(orderError?.message || 'Could not create order. Try Pre-Order Now or sign in and try again.');
        return;
      }

      // Add order_items for cart items that have a numeric product id (from products table)
      for (const item of cart) {
        const productId = typeof item.id === 'number' ? item.id : parseInt(item.id, 10);
        if (Number.isNaN(productId)) continue;
        const unitPrice = getItemPrice(item);
        await supabase.from('order_items').insert({
          order_id: order.id,
          product_id: productId,
          quantity: item.quantity || 1,
          unit_price: unitPrice,
          product_name: item.name || 'Item',
        });
      }

      const origin = window.location.origin;
      const data = {
        merchant_id: merchantId,
        merchant_key: merchantKey,
        return_url: `${origin}/success`,
        cancel_url: `${origin}/checkout`,
        notify_url: `${origin}/.netlify/functions/itn-listener`,
        name_first: formData.name_first?.trim() || 'Guest',
        name_last: formData.name_last?.trim() || 'User',
        email_address: formData.email_address?.trim() || '',
        m_payment_id: order.id,
        amount: total.toFixed(2),
        item_name: `Al-Ameen Caps Order #${order.id.slice(0, 8)}`,
      };

      const signature = generateSignature(data, passPhrase || null);
      data.signature = signature;

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = isSandbox
        ? 'https://sandbox.payfast.co.za/eng/process'
        : 'https://www.payfast.co.za/eng/process';

      Object.keys(data).forEach((key) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(data[key]);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } catch (err) {
      console.error('PayFast handlePayment error:', err);
      setError(err?.message || 'Payment submission failed. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreOrder = async (e) => {
    e.preventDefault();
    setError('');
    const validation = validateCheckoutForm(formData, true);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`${functionsBase}/.netlify/functions/reservation`, {
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
      setPreOrderPhone(formData.cell_number?.trim() || '');
      setIsPreOrder(true);
      clearCart();
    } catch (err) {
      const msg = err?.message || '';
      const isNetwork = /failed to fetch|network error|load failed/i.test(msg) || err?.name === 'TypeError';
      setError(isNetwork
        ? 'Could not reach the server. Check your connection and try again, or contact us to place your pre-order.'
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
          <main className="flex-1 pt-32 pb-24" />
          <Footer />
        </div>
        <SuccessModal customerName={preOrderName} preOrderPhone={preOrderPhone} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 text-primary pt-32 pb-24">
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
                {authLoading && enableEcommerce && !hasOutOfStockItems ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-4">
                    <Loader2 className="w-10 h-10 text-accent animate-spin" aria-hidden />
                    <p className="font-sans text-sm text-primary/80">Checking sign-in…</p>
                  </div>
                ) : user ? (
                  <div className="flex items-center justify-center gap-2">
                    {user.user_metadata?.avatar_url && (
                      <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full" />
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
            <form onSubmit={handlePreOrder} className="space-y-4">
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
              <input
                name="cell_number"
                placeholder="Phone Number"
                value={formData.cell_number}
                onChange={handleInputChange}
                required
                className="font-sans w-full p-3 border border-black/20 rounded focus:border-accent focus:ring-1 focus:ring-accent outline-none"
              />
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

              {error && <p className="font-sans text-red-600 text-sm text-center">{error}</p>}

              {!enableEcommerce || hasOutOfStockItems ? (
                <>
                  {enableEcommerce && (
                    <p className="font-sans text-primary/70 text-sm mt-4">Contains pre-order items. Pay when stock arrives.</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading || cart.length === 0}
                    className="btn-primary font-sans w-full py-4 text-base mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {loading ? 'Placing Pre-Order...' : 'Pre-Order Now'}
                  </button>
                </>
              ) : (
                <>
                  {!user && (
                    <p className="font-sans text-primary/70 text-sm mt-4">Sign in above to pay with PayFast. Your order will appear in Admin → Orders once payment is complete.</p>
                  )}
                  <button
                    type="button"
                    onClick={handlePayment}
                    disabled={loading || cart.length === 0 || !user}
                    className="btn-primary font-sans w-full py-4 text-base mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    Pay with PayFast
                  </button>
                </>
              )}
              <p className="font-sans mt-3 text-center text-xs text-primary/60">
                {!enableEcommerce
                  ? 'No payment now. We will contact you when your pre-order items arrive.'
                  : hasOutOfStockItems
                    ? 'Pre-order now. We will contact you when stock arrives to arrange payment and delivery.'
                    : 'Secure payment via PayFast. We will ship your order after payment confirmation.'}
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
