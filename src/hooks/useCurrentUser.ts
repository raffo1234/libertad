import useSWR from "swr";
import { supabase } from "../lib/supabase";

export const CURRENT_USER_KEY = "current-user";

interface CurrentUser {
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: string | null;
}

export const fetcher = async (): Promise<CurrentUser | null> => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const authUser = sessionData.session?.user;
  if (!authUser) return null;

  const { data, error } = await supabase
    .from("user")
    .select("role:role_id(name)")
    .eq("id", authUser.id)
    .single();
  if (error) throw error;

  // Google OAuth populates these on the auth user, no extra query needed.
  const metadata = authUser.user_metadata ?? {};
  return {
    email: authUser.email ?? "",
    name: metadata.full_name ?? metadata.name ?? null,
    avatarUrl: metadata.avatar_url ?? metadata.picture ?? null,
    role: (data?.role as any)?.name ?? null,
  };
};

export function useCurrentUser() {
  return useSWR<CurrentUser | null>(CURRENT_USER_KEY, fetcher);
}
