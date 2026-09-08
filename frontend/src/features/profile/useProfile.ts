"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/features/auth/supabaseClient";

export interface Profile {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address_line: string | null;
  postal_code: string | null;
  city: string | null;
  canton: string | null;
  avs_number: string | null;
}

interface UseProfileResult {
  profile: Profile | null;
  isLoading: boolean;
}

export function useProfile(user: User | null): UseProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    supabase
      .from("profiles")
      .select("first_name, last_name, phone, address_line, postal_code, city, canton, avs_number")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (isMounted) {
          setProfile(data);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  return { profile, isLoading };
}
