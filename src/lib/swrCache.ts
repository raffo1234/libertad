import type { Cache, State } from "swr";

export const STORAGE_KEY = "swr-cache";

function readStorage(): Record<string, State<unknown, unknown>> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeEntry(key: string, value: State<unknown, unknown>) {
  try {
    // Only persist resolved data — skip in-flight promises/errors.
    if (!value || !("data" in value) || value.data === undefined) return;
    const all = readStorage();
    all[key] = { data: value.data };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // sessionStorage unavailable (privacy mode, quota, etc.) — skip persistence.
  }
}

function hasEntry(key: string): boolean {
  try {
    return readStorage()[key]?.data !== undefined;
  } catch {
    return false;
  }
}

// SWR cache provider backed by sessionStorage, so cached responses survive
// full page navigations between CRM pages within the same browser tab.
//
// Astro's view-transition navigations don't reliably fire `beforeunload`,
// so each cache write is persisted immediately (write-through) instead of
// batching on unload.
export function sessionStorageProvider(): Cache {
  const map = new Map<string, State<unknown, unknown>>(Object.entries(readStorage()));
  const originalSet = map.set.bind(map);

  map.set = (key, value) => {
    writeEntry(key, value);
    return originalSet(key, value);
  };

  return map;
}

const inFlight = new Set<string>();

// Eagerly run a fetcher and stash its result in the sessionStorage cache, so
// that when the destination page's SWR hook mounts (with the same key) it
// finds the data already there. Used to preload data on link hover.
export function preload<T>(key: string, fetcher: () => Promise<T>) {
  if (typeof window === "undefined") return;
  if (hasEntry(key) || inFlight.has(key)) return;

  inFlight.add(key);
  fetcher()
    .then((data) => writeEntry(key, { data }))
    .catch(() => {
      // Ignore preload errors — the destination page will fetch normally.
    })
    .finally(() => inFlight.delete(key));
}
