import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Session } from "@supabase/supabase-js";

interface CrmAuthGuardProps {
  children: (session: Session) => React.ReactNode;
}

export default function CrmAuthGuard({ children }: CrmAuthGuardProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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
