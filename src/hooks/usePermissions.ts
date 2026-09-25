import useSWR from "swr";
import { supabase } from "../lib/supabase";

export const MY_PERMISSIONS_KEY = "my-permissions";

export const fetcher = async (): Promise<string[]> => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const userId = sessionData.session?.user.id;
  if (!userId) return [];

  const { data: userRow, error: userError } = await supabase
    .from("user")
    .select("role:role_id(role_permission(permission(name)))")
    .eq("id", userId)
    .single();
  if (userError) throw userError;

  const rolePermissions = (userRow?.role as any)?.role_permission ?? [];
  return rolePermissions.map((row: any) => row.permission.name as string);
};

export function usePermissions() {
  return useSWR<string[]>(MY_PERMISSIONS_KEY, fetcher);
}
