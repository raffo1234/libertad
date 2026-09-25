import useSWR from "swr";
import { supabase } from "../lib/supabase";

export const CURRENT_USER_KEY = "current-user";

interface CurrentUser {
  email: string;
  role: string | null;
}

export const fetcher = async (): Promise<CurrentUser | null> => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const userId = sessionData.session?.user.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from("user")
    .select("email, role:role_id(name)")
    .eq("id", userId)
    .single();
  if (error) throw error;

  return { email: data.email, role: (data.role as any)?.name ?? null };
};

export function useCurrentUser() {
  return useSWR<CurrentUser | null>(CURRENT_USER_KEY, fetcher);
}
