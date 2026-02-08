import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Loader2 } from "lucide-react";

export default function AdminRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!user || !supabase) {
      setProfileLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      if (!cancelled) {
        setProfile(data ?? { is_admin: false });
        setProfileLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <Loader2 className="w-12 h-12 text-accent animate-spin" aria-hidden />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profile?.is_admin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
