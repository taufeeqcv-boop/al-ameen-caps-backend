import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";

export default function Shipping() {
  return (
    <div className="min-h-screen flex flex-col">
      <Seo title="Shipping & Delivery" description="Shipping for Al-Ameen Caps. Delivery to Cape Town, Durban, Johannesburg, PE. Northern and Southern suburbs, Winelands, Tableview, Bellville, Durbanville and nationwide South Africa." url="/shipping" />
      <Navbar />
      <main className="flex-1 pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-primary mb-2">Shipping & Delivery</h1>
          <p className="text-primary/60 text-sm mb-10">How we get your order to you</p>

          <div className="space-y-8 text-primary/90 leading-relaxed">
            <section>
              <h2 className="font-serif text-xl font-semibold text-primary mb-2">Dispatch</h2>
              <p>We aim to dispatch orders within <strong className="text-primary">1–2 business days</strong> after payment is confirmed. You will receive an order confirmation once payment is successful.</p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-primary mb-2">Courier</h2>
              <p>We use <strong className="text-primary">Fastway Couriers</strong> for deliveries within South Africa. Delivery times typically range from <strong className="text-primary">2–5 business days</strong> depending on your location (local, regional, or national). Remote areas may take longer; we will inform you if your address falls into a special zone.</p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-primary mb-2">Tracking</h2>
              <p>When your order is dispatched, we will send you tracking details by email so you can follow your parcel.</p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-primary mb-2">Address</h2>
              <p>Please ensure your delivery address and contact number are correct at checkout. We are not responsible for failed or delayed delivery due to incorrect details. Recovery charges may apply if the address is outside the selected area.</p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-primary mb-2">Questions</h2>
              <p>For shipping enquiries or special requests, please <Link to="/contact" className="text-accent hover:underline">contact us</Link>.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
