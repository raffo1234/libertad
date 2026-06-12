import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Session } from "@supabase/supabase-js";

interface CrmAuthGuardProps {
  children: (session: Session) => React.ReactNode;
}

// Supabase persists the full session under this key, so we can read it
// synchronously on first render to avoid a spinner flash while the async
// getSession() call (which CrmLayout's blocking script already guarantees
// will succeed) confirms it in the background.
function readCachedSession(): Session | null {
  try {
    const ref = new URL(import.meta.env.PUBLIC_SUPABASE_URL).hostname.split(".")[0];
    const raw = localStorage.getItem(`sb-${ref}-auth-token`);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export default function CrmAuthGuard({ children }: CrmAuthGuardProps) {
  const [session, setSession] = useState<Session | null>(() => readCachedSession());
  const [loading, setLoading] = useState(session === null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        window.location.href = "/crm/login";
        return;
      }
      setSession(session);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#e8e3db] border-t-[#c9a96e]" />
      </div>
    );
  }

  if (!session) {
    window.location.href = "/crm/login";
    return null;
  }

  return <>{children(session)}</>;
}
