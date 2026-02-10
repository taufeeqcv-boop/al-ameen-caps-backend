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
    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        setLoading(false);
      }
    }, 2500);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    }).catch((err) => {
      if (err?.name !== "AbortError") console.error("getSession:", err);
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        upsertProfile(session.user).catch((err) => {
          if (err?.name !== "AbortError") console.error("upsertProfile:", err);
        });
      }
    });
    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!supabase) return;
    // Use current origin so localhost vs production is correct (matches Supabase Redirect URLs)
    const origin = typeof window !== "undefined" ? window.location.origin : (import.meta.env.VITE_SITE_URL || "https://www.alameencaps.com").replace(/\/$/, "");
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
    setUser(null);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
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
