import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2, Truck } from "lucide-react";
import { getFunctionUrl } from "../lib/config";
import logoImg from "../assets/logo.png";

export default function OrderTracking() {
  const { orderId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setError("No order specified.");
      setLoading(false);
      return;
    }

    const url = getFunctionUrl(`get-order-tracking?orderId=${encodeURIComponent(orderId)}`);
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
          setData(null);
        } else {
          setData(json);
          setError(null);
        }
      })
      .catch(() => setError("Failed to load order."))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="mt-4 text-primary/70">Loading order details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <h1 className="font-serif text-2xl font-semibold text-primary">Order not found</h1>
          <p className="mt-2 text-primary/70">{error || "This order could not be found."}</p>
          <Link to="/" className="mt-6 inline-block text-accent font-medium hover:underline">
            Return to Al-Ameen Caps
          </Link>
        </div>
      </div>
    );
  }

  const orderDate = data.order_date
    ? new Date(data.order_date).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "2-digit" })
    : "—";
  const displayName = (data.customer_name || "Valued Customer").toUpperCase();
  const trackingUrl = data.tracking_url || null;
  const isShipped = data.status === "SHIPPED";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="py-8 px-4 border-b border-secondary/20">
        <Link to="/" className="flex justify-center">
          <img src={logoImg} alt="Al-Ameen Caps" width={80} height={80} className="h-20 w-20 object-contain" loading="lazy" decoding="async" />
        </Link>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full px-6 py-12 text-center">
        {isShipped ? (
          <>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-accent uppercase tracking-wide">
              Your order is on its way!
            </h1>
            <p className="mt-4 text-primary/80 text-lg">
              Hello {displayName},
            </p>
            <p className="mt-4 text-primary/80 leading-relaxed">
              Great news! Your Al-Ameen Caps order has been picked, packed and dispatched. It is now on its way via Fastway Couriers.
            </p>
            <p className="mt-4 text-primary/80 leading-relaxed">
              You can track your parcel using the link below. If you have any questions, visit{" "}
              <a href={import.meta.env.VITE_SITE_URL || window.location.origin} className="text-accent hover:underline">
                {import.meta.env.VITE_SITE_URL?.replace(/^https?:\/\//, "") || "alameencaps.com"}
              </a>{" "}
              or contact us.
            </p>

            <div className="mt-10 p-6 bg-secondary/10 rounded-xl text-left max-w-sm mx-auto space-y-3">
              <div>
                <span className="block text-xs font-medium text-primary/60 uppercase tracking-wide">Order #</span>
                <span className="text-primary font-medium">{data.order_id}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-primary/60 uppercase tracking-wide">Order Date</span>
                <span className="text-primary">{orderDate}</span>
              </div>
              {data.tracking_number && (
                <div>
                  <span className="block text-xs font-medium text-primary/60 uppercase tracking-wide">Tracking #</span>
                  {trackingUrl ? (
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent font-medium hover:underline"
                    >
                      {data.tracking_number}
                    </a>
                  ) : (
                    <span className="text-primary">{data.tracking_number}</span>
                  )}
                </div>
              )}
              <div>
                <span className="block text-xs font-medium text-primary/60 uppercase tracking-wide">Number of Boxes</span>
                <span className="text-primary">{data.number_of_boxes ?? 1}</span>
              </div>
            </div>

            {trackingUrl && (
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 btn-primary py-3 px-8"
              >
                <Truck className="w-5 h-5" />
                Track your parcel
              </a>
            )}
          </>
        ) : (
          <>
            <h1 className="font-serif text-2xl font-semibold text-primary">Order status</h1>
            <p className="mt-4 text-primary/80">
              Hello {displayName},
            </p>
            <p className="mt-4 text-primary/80">
              Your order status: <strong>{data.status}</strong>
            </p>
            <div className="mt-8 p-6 bg-secondary/10 rounded-xl text-left max-w-sm mx-auto space-y-3">
              <div>
                <span className="block text-xs font-medium text-primary/60 uppercase tracking-wide">Order #</span>
                <span className="text-primary font-medium">{data.order_id}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-primary/60 uppercase tracking-wide">Order Date</span>
                <span className="text-primary">{orderDate}</span>
              </div>
            </div>
            {data.status === "PAID" && (
              <p className="mt-6 text-primary/70 text-sm">
                We will send you tracking details by email once your order has been dispatched.
              </p>
            )}
          </>
        )}

        <p className="mt-12 text-xs text-primary/50">
          © {new Date().getFullYear()} Al-Ameen Caps. All rights reserved.
        </p>
      </main>
    </div>
  );
}
