import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";

export default function ShippingReturns() {
  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Shipping & Returns"
        description="Shipping & returns for Al-Ameen Caps. R99 flat-rate courier delivery within South Africa and a 30-day return policy on unused items."
        url="/shipping-returns"
      />
      <Navbar />
      <main className="flex-1 pt-[var(--site-header-offset)] pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-primary mb-2">
            Shipping &amp; Returns
          </h1>
          <p className="text-primary/60 text-sm mb-10">
            How we ship your order and how returns work.
          </p>

          <div className="space-y-8 text-primary/90 leading-relaxed">
            <section>
              <h2 className="font-serif text-xl font-semibold text-primary mb-2">
                Shipping Fee (South Africa)
              </h2>
              <p>
                We charge a simple{" "}
                <strong className="text-primary">R99 flat-rate courier fee</strong>{" "}
                on all deliveries within South Africa. This covers packing,
                handling, and insured door-to-door delivery.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-primary mb-2">
                Dispatch &amp; Delivery Times
              </h2>
              <p>
                Orders are normally dispatched within{" "}
                <strong className="text-primary">1–2 business days</strong> after
                payment has cleared. Courier delivery usually takes{" "}
                <strong className="text-primary">2–5 business days</strong>,
                depending on whether you are in a main centre or an outlying
                area. Very remote areas may take longer; we will contact you if
                there are any expected delays.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-primary mb-2">
                Delivery Address
              </h2>
              <p>
                Please double-check your{" "}
                <strong className="text-primary">delivery address and phone number</strong>{" "}
                at checkout. We cannot be held responsible for late or failed
                delivery due to incorrect details. Additional courier charges
                may apply if the parcel has to be rerouted.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-primary mb-2">
                30-Day Return Policy
              </h2>
              <p>
                If you are not satisfied with your purchase, you may{" "}
                <strong className="text-primary">return unworn, unused items within 30 days</strong>{" "}
                of delivery for an exchange or store credit, subject to the
                conditions below.
              </p>
              <ul className="list-disc list-inside mt-3 space-y-1">
                <li>Items must be in original condition, unworn and unwashed.</li>
                <li>Original tags and packaging should be included where possible.</li>
                <li>
                  For hygiene reasons, heavily used or damaged items cannot be
                  accepted.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-primary mb-2">
                Return Shipping Costs
              </h2>
              <p>
                If the return is due to a{" "}
                <strong className="text-primary">manufacturing fault or an error on our side</strong>{" "}
                (for example, we sent the wrong item), we will cover reasonable
                return shipping costs or arrange a courier collection.
              </p>
              <p className="mt-2">
                If you are returning an item for another reason (wrong size,
                change of mind, etc.), return shipping is for your account. We
                will gladly assist with sizing advice before you purchase.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-primary mb-2">
                How to Request a Return
              </h2>
              <p>
                To arrange a return, please{" "}
                <strong className="text-primary">contact us within 30 days</strong>{" "}
                of receiving your order with your order number and details of the
                item you would like to return. We will provide the return address
                and next steps.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

