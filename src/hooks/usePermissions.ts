import useSWR from "swr";
import { supabase } from "../lib/supabase";

export const MY_PERMISSIONS_KEY = "my-permissions";

export const fetcher = async (): Promise<string[]> => {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  const authUser = authData.user;
  if (!authUser) return [];

  const { data: userRow, error: userError } = await supabase
    .from("user")
    .select("role_id")
    .eq("id", authUser.id)
    .single();
  if (userError) throw userError;
  if (!userRow.role_id) return [];

  const { data, error } = await supabase
    .from("role_permission")
    .select("permission(name)")
    .eq("role_id", userRow.role_id);
  if (error) throw error;

  return (data ?? []).map((row: any) => row.permission.name as string);
};

export function usePermissions() {
  return useSWR<string[]>(MY_PERMISSIONS_KEY, fetcher);
}
