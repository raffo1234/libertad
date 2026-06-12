import useSWR from "swr";
import { supabase } from "../lib/supabase";
import type { User } from "../types/user";

export const USERS_KEY = "users";

export const fetcher = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from("user")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
};

export function useUsers() {
  return useSWR<User[]>(USERS_KEY, fetcher);
}
