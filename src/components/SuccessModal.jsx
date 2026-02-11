import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function SuccessModal({ customerName, preOrderPhone, onClose }) {
  const navigate = useNavigate();
  const firstName = (customerName || "").trim().split(/\s+/)[0] || "Valued Customer";
  const isPreOrder = preOrderPhone !== undefined && preOrderPhone !== null;

  const handleDismiss = () => {
    onClose?.();
    navigate("/");
  };

  const handleContinueShopping = () => {
    onClose?.();
    navigate("/shop");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleDismiss}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
        className="relative w-full max-w-md bg-zinc-950 border border-yellow-600/50 rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Gold top bar — high-end ticket style */}
        <div className="h-2 w-full bg-yellow-600 rounded-t-xl" />

        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-3 text-yellow-500" strokeWidth={1.5} />
          <h2 id="success-modal-title" className="font-serif text-3xl text-white font-bold">
            Reservation Confirmed
          </h2>
          <p className="text-xs tracking-[0.3em] text-zinc-400 uppercase mt-2">
            Al-Ameen Caps
          </p>
        </div>

        {/* Receipt body */}
        <div className="px-6 pb-6">
          <p className="text-zinc-300 text-sm leading-relaxed mb-4 text-center">
            {isPreOrder ? (
              <>Jazakallah khair, <span className="text-white font-medium">{firstName}</span>. We have received your pre-order.</>
            ) : (
              <>Jazakallah khair, {firstName}. We have added you to the priority queue.</>
            )}
          </p>

          {/* Details box */}
          {isPreOrder && preOrderPhone && (
            <div className="bg-zinc-900/50 p-4 rounded-lg border border-white/5 mx-auto max-w-sm mb-5">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">
                Contact Number
              </p>
              <p className="font-mono text-xl text-yellow-500">
                {preOrderPhone}
              </p>
            </div>
          )}

          {/* Footer / actions */}
          <p className="text-zinc-500 text-sm text-center mb-5">
            Our team will contact you shortly to finalize your custom fitting.
          </p>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleContinueShopping}
              className="w-full py-3.5 px-6 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-black font-semibold transition-colors"
            >
              Continue Shopping
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-2.5 text-zinc-500 hover:text-white font-medium text-sm transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
