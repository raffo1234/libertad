import useSWR from "swr";
import { supabase } from "../lib/supabase";
import type { BitacoraEntry } from "../types/bitacora";

export const bitacoraKey = (projectSlug: string) => `bitacora:${projectSlug}`;

export const fetcher = async (projectSlug: string): Promise<BitacoraEntry[]> => {
  const { data, error } = await supabase
    .from("bitacora_entry")
    .select("*, files:bitacora_file(*)")
    .eq("project_slug", projectSlug)
    .order("date", { ascending: false });

  if (error) throw error;
  return data ?? [];
};

export function useBitacora(projectSlug: string) {
  return useSWR<BitacoraEntry[]>(bitacoraKey(projectSlug), () => fetcher(projectSlug));
}
