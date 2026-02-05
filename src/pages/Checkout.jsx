import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

const DELIVERY_FEE = Number(import.meta.env.VITE_DELIVERY_FEE) || 99;

const Checkout = () => {
  const { cart, cartTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const subtotal = cartTotal;
  const delivery = cart.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;

  // 1. Get Environment Variables
  const isSandbox = import.meta.env.VITE_PAYFAST_SANDBOX === 'true';
  const merchantId = import.meta.env.VITE_PAYFAST_MERCHANT_ID;
  const merchantKey = import.meta.env.VITE_PAYFAST_MERCHANT_KEY;
  const appUrl = import.meta.env.VITE_APP_URL;

  // 2. Determine PayFast URL (Sandbox vs Live)
  const payfastUrl = isSandbox
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process';

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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = (e) => {
    e.preventDefault();
    setLoading(true);

    // 3. Create the Hidden Form programmatically
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = payfastUrl;

    // 4. Data to send to PayFast (amount includes delivery)
    const data = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      amount: total.toFixed(2),
      item_name: 'Al-Ameen Caps Order',

      // Buyer & shipping (PayFast passes through for your records / ITN)
      name_first: formData.name_first,
      name_last: formData.name_last,
      email_address: formData.email_address,
      cell_number: formData.cell_number,
      address_line_1: formData.address_line_1 || undefined,
      address_line_2: formData.address_line_2 || undefined,
      city: formData.city || undefined,
      postal_code: formData.postal_code || undefined,

      // Return URLs
      return_url: `${appUrl}/success`,
      cancel_url: `${appUrl}/cancel`,
      notify_url: `${appUrl}/.netlify/functions/itn-listener`,

      // Tracking
      m_payment_id: `Order-${Date.now()}`
    };
    // Remove undefined so we don't send empty strings to PayFast
    Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);

    // 5. Append inputs to form
    for (const key in data) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = data[key];
      form.appendChild(input);
    }

    // 6. Submit!
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto p-6 text-primary py-24">
        <h1 className="text-3xl font-serif font-bold text-accent mb-8">Secure Checkout</h1>

        {cart.length === 0 && (
          <div className="mb-6 p-4 bg-primary/5 border border-accent/30 rounded-lg text-center">
            <p className="text-primary font-medium">Your cart is empty.</p>
            <p className="mt-1 text-primary/70 text-sm">Add items from the shop to checkout.</p>
            <Link to="/shop" className="inline-block mt-3 text-accent font-semibold hover:underline">Go to Shop →</Link>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-8">
          {/* LEFT: Shipping Form */}
          <div className="bg-secondary p-6 shadow-premium rounded-lg border border-accent/20">
            <h2 className="text-xl font-serif font-semibold text-primary mb-4">Shipping Details</h2>
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="name_first"
                  placeholder="First Name"
                  value={formData.name_first}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-black/20 rounded focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                />
                <input
                  name="name_last"
                  placeholder="Last Name"
                  value={formData.name_last}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-black/20 rounded focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                />
              </div>
              <input
                name="email_address"
                type="email"
                placeholder="Email Address"
                value={formData.email_address}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-black/20 rounded focus:border-accent focus:ring-1 focus:ring-accent outline-none"
              />
              <input
                name="cell_number"
                placeholder="Phone Number"
                value={formData.cell_number}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-black/20 rounded focus:border-accent focus:ring-1 focus:ring-accent outline-none"
              />
              <input
                name="address_line_1"
                placeholder="Address (street, suburb)"
                value={formData.address_line_1}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-black/20 rounded focus:border-accent focus:ring-1 focus:ring-accent outline-none"
              />
              <input
                name="address_line_2"
                placeholder="Address line 2 (optional)"
                value={formData.address_line_2}
                onChange={handleInputChange}
                className="w-full p-3 border border-black/20 rounded focus:border-accent focus:ring-1 focus:ring-accent outline-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-black/20 rounded focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                />
                <input
                  name="postal_code"
                  placeholder="Postal Code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-black/20 rounded focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || cart.length === 0}
                className="btn-primary w-full py-4 text-base mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? 'Redirecting to PayFast...' : `Pay R${total.toFixed(2)}`}
              </button>
              <p className="mt-3 text-center text-xs text-primary/60">Secure payment via PayFast. You will be redirected to complete payment.</p>
            </form>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="bg-primary/5 p-6 rounded-lg h-fit border border-black/5">
            <h2 className="text-xl font-serif font-semibold text-primary mb-4">Order Summary</h2>
            {cart.length === 0 ? (
              <p className="text-primary/70">Your cart is empty.</p>
            ) : (
              <>
                {cart.map((item, i) => (
                  <div key={item.id ?? i} className="flex justify-between py-2 border-b border-black/10">
                    <span className="text-primary">{item.name} (x{item.quantity || 1})</span>
                    <span className="font-semibold text-primary">R{(item.price * (item.quantity || 1)).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-b border-black/10">
                  <span className="text-primary">Subtotal</span>
                  <span className="font-semibold text-primary">R{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-black/10">
                  <span className="text-primary">Delivery</span>
                  <span className="font-semibold text-primary">R{delivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-4 text-xl font-bold border-t border-black/10 pt-4">
                  <span className="text-primary">Total</span>
                  <span className="text-accent">R{total.toFixed(2)}</span>
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
