import useSWR from "swr";
import { supabase } from "../lib/supabase";

export const GLOBAL_SETTINGS_KEY = "global-settings";

interface GlobalSetting {
  key: string;
  value: string | null;
}

export const fetcher = async (): Promise<Record<string, string | null>> => {
  const { data, error } = await supabase.from("global_settings").select("key, value");
  if (error) throw error;
  const map: Record<string, string | null> = {};
  (data as GlobalSetting[]).forEach((row) => {
    map[row.key] = row.value;
  });
  return map;
};

export function useGlobalSettings() {
  return useSWR<Record<string, string | null>>(GLOBAL_SETTINGS_KEY, fetcher);
}
