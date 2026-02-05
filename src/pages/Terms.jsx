import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-primary mb-2">Terms of Sale</h1>
          <p className="text-primary/60 text-sm mb-10">Last updated: {new Date().toLocaleDateString("en-ZA")}</p>

          <div className="space-y-8 text-primary/90 leading-relaxed">
            <section>
              <h2 className="font-serif text-xl font-semibold text-primary mb-2">1. Agreement</h2>
              <p>By placing an order on this website, you agree to these Terms of Sale. If you do not agree, please do not place an order.</p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-primary mb-2">2. Products & pricing</h2>
              <p>All prices are in South African Rand (ZAR) and are as displayed at checkout. We reserve the right to correct pricing errors. Product images are for illustration; actual items may vary slightly within the nature of handcrafted goods.</p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-primary mb-2">3. Payment</h2>
              <p>Payment is processed securely via PayFast. You will be redirected to PayFast to complete payment. We do not store your card details. Your order is confirmed once payment has been successfully received.</p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-primary mb-2">4. Delivery</h2>
              <p>We dispatch orders within the time frame stated on our Shipping page (or as communicated to you). Delivery times depend on the courier and your location. Risk passes to you upon delivery. We are not liable for delays caused by the courier or events outside our control.</p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-primary mb-2">5. Refunds & returns</h2>
              <p>If you receive a faulty or incorrect item, please contact us within 14 days. We will arrange a replacement or refund as appropriate. For change-of-mind returns, please contact us; we may accept unused items in original condition at our discretion. Refunds will be processed via the original payment method where possible.</p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-primary mb-2">6. Contact</h2>
              <p>For orders, returns, or any questions about these terms, use our <Link to="/contact" className="text-accent hover:underline">Contact</Link> page.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
