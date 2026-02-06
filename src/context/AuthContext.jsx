import { createContext, useContext, useEffect, useState } from "react";
import { supabase, upsertProfile } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) await upsertProfile(session.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!supabase) return;
    // Use current origin so localhost vs production is correct (matches Supabase Redirect URLs)
    const origin = typeof window !== "undefined" ? window.location.origin : (import.meta.env.VITE_SITE_URL || "https://al-ameen-caps.netlify.app").replace(/\/$/, "");
    const baseUrl = origin.replace(/\/$/, "");
    // After login: /checkout if they came from cart, otherwise /shop
    const returnPath = typeof window !== "undefined" && window.location?.pathname === "/checkout" ? "/checkout" : "/shop";
    const redirectTo = `${baseUrl}${returnPath}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, isConfigured: !!supabase }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
