"use client";

import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/features/auth/supabaseClient";
import { useCartStore } from "@/features/cart/cartStore";

interface UseUserResult {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

export function useUser(): UseUserResult {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
      useCartStore.getState().syncUser(data.session?.user.id ?? null);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      useCartStore.getState().syncUser(newSession?.user.id ?? null);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  return { user: session?.user ?? null, session, isLoading };
}
