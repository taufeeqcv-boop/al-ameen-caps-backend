import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-primary mb-2">Privacy Policy</h1>
          <p className="text-primary/60 text-sm mb-10">Last updated: {new Date().toLocaleDateString("en-ZA")}</p>

          <div className="space-y-8 text-primary/90 leading-relaxed">
            <section>
              <h2 className="font-serif text-xl font-semibold text-primary mb-2">1. Who we are</h2>
              <p>Al-Ameen Caps (“we”, “us”) operates this website and sells premium Islamic headwear. We are committed to protecting your privacy.</p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-primary mb-2">2. Information we collect</h2>
              <p>When you place an order or contact us, we may collect:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Name and contact details (email, phone number)</li>
                <li>Delivery address</li>
                <li>Payment is processed by PayFast; we do not store your card details on our servers.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-primary mb-2">3. How we use it</h2>
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Process and fulfil your order</li>
                <li>Contact you about your order or delivery</li>
                <li>Respond to enquiries sent via our contact form or email</li>
                <li>Send occasional updates about our products or services, if you have agreed to this</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-primary mb-2">4. We do not sell your data</h2>
              <p>We do not sell, rent, or trade your personal information to third parties for marketing.</p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-primary mb-2">5. Data retention</h2>
              <p>We keep order and contact information for as long as needed to fulfil orders, handle support, and comply with legal obligations.</p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-primary mb-2">6. Your rights</h2>
              <p>You may ask us what data we hold about you and request correction or deletion, subject to legal requirements. Contact us via the Contact page.</p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-primary mb-2">7. Changes</h2>
              <p>We may update this policy from time to time. The “Last updated” date at the top will be revised when we do.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
