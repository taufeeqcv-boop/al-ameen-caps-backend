import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SuccessModal from '../components/SuccessModal';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../lib/format';

const DELIVERY_FEE = Number(import.meta.env.VITE_DELIVERY_FEE) || 99;

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, loading: authLoading, signInWithGoogle, signOut, isConfigured: authConfigured } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reserved, setReserved] = useState(false);
  const [reservedName, setReservedName] = useState('');
  const [error, setError] = useState('');
  const subtotal = cartTotal;
  const delivery = cart.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;

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

  // Auto-fill form from signed-in user (only empty fields)
  useEffect(() => {
    if (!user) return;
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
    const parts = fullName.trim().split(/\s+/);
    setFormData((prev) => ({
      ...prev,
      name_first: prev.name_first || parts[0] || '',
      name_last: prev.name_last || parts.slice(1).join(' ') || '',
      email_address: prev.email_address || user.email || '',
    }));
  }, [user?.id]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReservation = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/.netlify/functions/reservation', {
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
        const msg = await res.text();
        throw new Error(msg || 'Reservation failed');
      }
      setReservedName([formData.name_first, formData.name_last].filter(Boolean).join(' ') || 'Valued Customer');
      setReserved(true);
      clearCart();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again or contact us.');
    } finally {
      setLoading(false);
    }
  };

  if (reserved) {
    return (
      <>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 pt-32 pb-24" />
          <Footer />
        </div>
        <SuccessModal customerName={reservedName} />
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
            <p className="mt-1 font-sans text-primary/70 text-sm">Add items from the shop to reserve.</p>
            <Link to="/shop" className="inline-block mt-3 text-accent font-semibold hover:underline font-sans">Go to Shop →</Link>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 items-start max-w-4xl mx-auto">
          <div className="bg-secondary p-6 shadow-premium rounded-lg border border-accent/20">
            {authConfigured && (
              <div className="mb-6 text-center">
                {authLoading ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-4">
                    <Loader2 className="w-10 h-10 text-accent animate-spin" aria-hidden />
                    <p className="font-sans text-sm text-primary/80">Signing you in…</p>
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
                Welcome back, {formData.name_first || (user.user_metadata?.full_name || "").trim().split(/\s+/)[0] || user.email?.split("@")[0] || "there"}. We&apos;ve pre-filled your details for a faster reservation.
              </p>
            )}
            <h2 className="font-serif text-xl font-semibold text-primary mb-4 text-center">
              {user ? "Confirming your reservation" : "Reservation Details"}
            </h2>
            <form onSubmit={handleReservation} className="space-y-4">
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

              <button
                type="submit"
                disabled={loading || cart.length === 0}
                className="btn-primary font-sans w-full py-4 text-base mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? 'Placing Reservation...' : 'Place Reservation'}
              </button>
              <p className="font-sans mt-3 text-center text-xs text-primary/60">
                No payment now. We will contact you when your reserved items arrive.
              </p>
            </form>
          </div>

          <div className="bg-primary/5 p-6 rounded-lg h-fit border border-black/5">
            <h2 className="font-serif text-xl font-semibold text-primary mb-4 text-center">Order Summary</h2>
            {cart.length === 0 ? (
              <p className="font-sans text-primary/70">Your cart is empty.</p>
            ) : (
              <>
                {cart.map((item, i) => (
                  <div key={item.id ?? i} className="flex justify-between py-2 border-b border-black/10 font-sans">
                    <span className="text-primary">{item.name} (x{item.quantity || 1})</span>
                    <span className="font-semibold text-primary">{formatPrice(item.price * (item.quantity || 1))}</span>
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
