import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { supabaseAvailable } from "@/integrations/supabase/availability";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // A browser build published without its Supabase variables must degrade
    // to a signed-out, read-only state. It must never white-screen a page.
    if (!supabaseAvailable()) {
      setUser(null);
      setLoading(false);
      return;
    }
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
    signOut: () =>
      supabaseAvailable()
        ? supabase.auth.signOut()
        : Promise.resolve({ data: null, error: null }),
  };
}
