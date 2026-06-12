import useSWR from "swr";
import { supabase } from "../lib/supabase";
import type { Lead } from "../types/lead";

export const LEADS_KEY = "leads";

export const fetcher = async (): Promise<Lead[]> => {
  const { data, error } = await supabase
    .from("lead")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
};

export function useLeads() {
  return useSWR<Lead[]>(LEADS_KEY, fetcher);
}
