import React, { useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

// After we've verified admin once, wait this long for user to come back before redirecting to login
const AUTH_BLIP_GRACE_MS = 2000;
// Don't show spinner forever if profile check or auth never completes
const PROFILE_LOADING_TIMEOUT_MS = 8000;

const AdminRoute = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [allowRedirect, setAllowRedirect] = useState(false);
  const [gracePeriodExpired, setGracePeriodExpired] = useState(false);
  const location = useLocation();
  const graceTimerRef = useRef(null);
  const profileTimeoutRef = useRef(null);

  // WAIT 600ms before redirecting to login so auth state can settle after client-side nav
  useEffect(() => {
    const timer = setTimeout(() => {
      setAllowRedirect(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Safety: stop showing spinner if profile check takes too long (e.g. network hang)
  useEffect(() => {
    if (!profileLoading) return;
    profileTimeoutRef.current = setTimeout(() => {
      profileTimeoutRef.current = null;
      setProfileLoading(false);
    }, PROFILE_LOADING_TIMEOUT_MS);
    return () => {
      if (profileTimeoutRef.current) {
        clearTimeout(profileTimeoutRef.current);
        profileTimeoutRef.current = null;
      }
    };
  }, [profileLoading]);

  useEffect(() => {
    if (user) {
      setGracePeriodExpired(false);
      if (graceTimerRef.current) {
        clearTimeout(graceTimerRef.current);
        graceTimerRef.current = null;
      }
      checkAdmin();
    } else if (!authLoading && allowRedirect) {
      setProfileLoading(false);
    }
  }, [user, authLoading, allowRedirect]);

  // When we were verified admin and user goes null, wait AUTH_BLIP_GRACE_MS before allowing redirect to login
  useEffect(() => {
    if (user != null || isAdmin !== true) return;
    setGracePeriodExpired(false);
    graceTimerRef.current = setTimeout(() => {
      graceTimerRef.current = null;
      setGracePeriodExpired(true);
    }, AUTH_BLIP_GRACE_MS);
    return () => {
      if (graceTimerRef.current) {
        clearTimeout(graceTimerRef.current);
        graceTimerRef.current = null;
      }
    };
  }, [user, isAdmin]);

  const checkAdmin = async () => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setIsAdmin(profile?.is_admin);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    } finally {
      setProfileLoading(false);
    }
  };

  // Treat "in grace period" as still allowed: show spinner, don't redirect yet
  const inGracePeriod = isAdmin === true && user == null && !gracePeriodExpired;
  const shouldRedirectToLogin = !user && allowRedirect && !inGracePeriod;

  // SHOW SPINNER while waiting for: Auth, The 400ms Timer, or The Profile Check (or grace period)
  if (authLoading || profileLoading || (!user && !allowRedirect) || inGracePeriod) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F3EFE0]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A1A1A]"></div>
      </div>
    );
  }

  // IF NOT LOGGED IN (After waiting, and not in grace period): Send to Login
  if (shouldRedirectToLogin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // IF LOGGED IN BUT NOT ADMIN: Send to Home
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // SUCCESS: Show the Admin Page
  return children;
};

export default AdminRoute;
