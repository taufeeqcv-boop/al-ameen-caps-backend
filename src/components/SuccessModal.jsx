import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function SuccessModal({ customerName, reservationPhone, onClose }) {
  const navigate = useNavigate();
  const firstName = (customerName || "").trim().split(/\s+/)[0] || "Valued Customer";
  const isReservation = reservationPhone !== undefined && reservationPhone !== null;

  const handleDismiss = () => {
    onClose?.();
    navigate("/");
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
        className="relative w-full max-w-md bg-[#1a1a1a] border-2 border-accent rounded-xl shadow-2xl p-8 text-center"
      >
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-accent" strokeWidth={1.5} />
        </div>
        <h2 id="success-modal-title" className="font-serif text-2xl font-bold text-white mb-2">
          {isReservation ? "Reservation Received!" : "Reservation Confirmed"}
        </h2>
        <p className="font-sans text-primary/90 text-base leading-relaxed mb-8">
          {isReservation ? (
            <>
              We have your details and will contact you on{" "}
              <strong className="text-accent">{reservationPhone || "your provided number"}</strong> shortly to
              finalize your order.
            </>
          ) : (
            <>Jazakallah khair, {firstName}. We have added you to the priority queue.</>
          )}
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          className="btn-primary w-full py-3 px-6 font-sans font-semibold"
        >
          Great, thank you
        </button>
      </div>
    </div>
  );
}
