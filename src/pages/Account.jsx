import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import { useAuth } from "../context/AuthContext";

function getFirstName(user) {
  const full = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
  return full.trim().split(/\s+/)[0] || "there";
}

export default function Account() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Seo noindex title="Account" url="/account" />
        <Navbar />
        <main className="flex-1 max-w-md mx-auto px-6 pt-32 pb-24 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-accent animate-spin" aria-hidden />
          <p className="font-sans text-primary/80">Loading…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Seo noindex title="Account" url="/account" />
        <Navbar />
        <main className="flex-1 max-w-md mx-auto px-6 pt-32 pb-24 text-center">
          <p className="font-sans text-primary/80">Please sign in to view your account.</p>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="inline-block mt-4 btn-primary px-6 py-2"
          >
            Sign in with Google
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const firstName = getFirstName(user);

  return (
    <div className="min-h-screen flex flex-col">
      <Seo noindex title="Account" url="/account" />
      <Navbar />
      <main className="flex-1 max-w-md mx-auto px-6 pt-32 pb-24">
        <h1 className="font-serif text-2xl font-bold text-accent mb-6 text-center">
          Assalamu alaikum, {firstName}
        </h1>
        <div className="bg-secondary p-6 rounded-lg border border-accent/20">
          <div className="flex items-center gap-4 mb-6">
            {user.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt=""
                className="w-16 h-16 rounded-full border-2 border-accent/50"
              />
            )}
            <div>
              <p className="font-sans font-semibold text-primary">{user.user_metadata?.full_name || "Customer"}</p>
              <p className="font-sans text-sm text-primary/70">{user.email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Link
              to="/checkout"
              className="block w-full py-3 text-center font-sans font-medium rounded border-2 border-accent text-accent hover:bg-accent hover:text-primary transition-colors"
            >
              Place a Pre-Order
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="block w-full py-3 text-center font-sans font-medium rounded border border-black/20 text-primary hover:bg-primary/5 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
