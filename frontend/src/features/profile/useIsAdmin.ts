"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/features/auth/supabaseClient";

export function useIsAdmin(user: User | null): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    let isMounted = true;

    supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (isMounted) setIsAdmin(Boolean(data?.is_admin));
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  return isAdmin;
}
