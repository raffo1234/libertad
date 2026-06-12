import useSWR from "swr";
import { supabase } from "../lib/supabase";
import type { Permission } from "../types/permission";

export const PERMISSIONS_KEY = "permissions";

export const fetcher = async (): Promise<Permission[]> => {
  const { data, error } = await supabase
    .from("permission")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
};

export function usePermissionsList() {
  return useSWR<Permission[]>(PERMISSIONS_KEY, fetcher);
}
