import useSWR from "swr";
import { supabase } from "../lib/supabase";
import type { Role } from "../types/role";

const fetcher = async (): Promise<Role[]> => {
  const { data, error } = await supabase
    .from("role")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
};

export function useRoles() {
  return useSWR<Role[]>("roles", fetcher);
}
