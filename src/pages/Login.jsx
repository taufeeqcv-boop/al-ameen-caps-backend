import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, loading: authLoading, signInWithGoogle, isConfigured } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // If already signed in, redirect to shop
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/shop", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSignIn = async () => {
    setIsRedirecting(true);
    await signInWithGoogle();
    // Browser redirects to Google; if it doesn't (e.g. popup blocked), allow retry
    setTimeout(() => setIsRedirecting(false), 3000);
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-md mx-auto px-6 pt-32 pb-24 text-center">
          <p className="font-sans text-primary/80">Sign-in is not configured.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-md mx-auto px-6 pt-32 pb-24 flex flex-col items-center justify-center">
        <h1 className="font-serif text-2xl font-bold text-accent mb-2 text-center">Sign In</h1>
        <p className="font-sans text-primary/80 text-sm text-center mb-8">
          Sign in with Google to continue to checkout or manage your account.
        </p>
        <button
          type="button"
          onClick={handleSignIn}
          disabled={authLoading || isRedirecting}
          className="font-sans w-full max-w-xs py-3.5 px-6 rounded-lg border-2 border-black/20 hover:border-accent hover:bg-accent/10 transition-colors text-base font-medium disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
        >
          {(authLoading || isRedirecting) ? (
            <>
              <Loader2 className="w-5 h-5 text-accent animate-spin" aria-hidden />
              <span>{isRedirecting ? "Redirecting to Google…" : "Loading…"}</span>
            </>
          ) : (
            "Sign in with Google"
          )}
        </button>
      </main>
      <Footer />
    </div>
  );
}
