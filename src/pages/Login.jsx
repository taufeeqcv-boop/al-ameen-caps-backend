import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function Login() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  // After successful admin login, wait for AuthContext to have user before navigating (avoids redirect loop)
  const [pendingRedirectToAdmin, setPendingRedirectToAdmin] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }
    if (!supabase) {
      setError("Sign-in is not configured.");
      return;
    }
    setSubmitting(true);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);

    if (signInError) {
      setError(signInError.message || "Invalid login credentials.");
      return;
    }

    if (!data?.user?.id) {
      setError("Sign-in failed. Please try again.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      setError("Login succeeded but could not load your profile. Check Supabase RLS and that a profile row exists for your user.");
      return;
    }

    if (profile?.is_admin) {
      // Don't navigate yet — wait for AuthContext to get the user from onAuthStateChange, then redirect in useEffect
      setPendingRedirectToAdmin(true);
    } else {
      setError("This account does not have admin access. Set is_admin = true for your user in Supabase → Table Editor → profiles.");
      return;
    }
  };

  const from = location.state?.from?.pathname || "/";

  // Redirect when we have a user: either already logged in (from) or just logged in (pendingRedirectToAdmin)
  useEffect(() => {
    if (authLoading || !user) return;
    const state = { justLoggedIn: true };
    if (pendingRedirectToAdmin) {
      setPendingRedirectToAdmin(false);
      // Brief delay so React commits auth state before we mount AdminRoute (reduces redirect loop)
      const t = setTimeout(() => {
        navigate("/admin/dashboard", { replace: true, state });
      }, 150);
      return () => clearTimeout(t);
    }
    if (from.includes("/admin")) {
      const t = setTimeout(() => {
        navigate("/admin/dashboard", { replace: true, state });
      }, 150);
      return () => clearTimeout(t);
    }
    navigate("/", { replace: true });
  }, [authLoading, user, navigate, from, pendingRedirectToAdmin]);

  if (authLoading || pendingRedirectToAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6 py-24">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 text-accent animate-spin" aria-hidden />
            {pendingRedirectToAdmin && (
              <p className="text-primary/70 text-sm">Redirecting to admin…</p>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-premium border border-secondary/30 p-8">
            <h1 className="font-serif text-2xl font-bold text-primary text-center mb-6">
              Admin Login
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-primary mb-1">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-secondary/40 rounded-lg px-3 py-2.5 text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                  placeholder="admin@alameencaps.co.za"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-primary mb-1">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-secondary/40 rounded-lg px-3 py-2.5 text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                  placeholder="••••••••"
                />
              </div>
              {error && (
                <div className="rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2 border border-red-200">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-lg font-medium bg-accent text-primary hover:bg-accent-light focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
                    Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
