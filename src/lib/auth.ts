import { supabase } from "./supabase";
import { STORAGE_KEY as SWR_STORAGE_KEY } from "./swrCache";

export async function signOut() {
  try {
    // `scope: "local"` still makes a server call to revoke the session;
    // if that call is blocked (e.g. by an ad blocker), signOut() returns
    // an error without clearing local storage, leaving a stale session
    // that silently logs the user back in on /crm/login.
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // ignore — fall through to the manual cleanup below
  }
  try {
    const ref = new URL(import.meta.env.PUBLIC_SUPABASE_URL).hostname.split(".")[0];
    localStorage.removeItem(`sb-${ref}-auth-token`);
    // Drop cached data (permissions, users, etc.) so a different account
    // logging in afterwards doesn't see this user's cached results.
    sessionStorage.removeItem(SWR_STORAGE_KEY);
  } catch {
    // ignore
  }
  window.location.href = "/crm/login";
}
