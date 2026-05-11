import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Session } from "@supabase/supabase-js";

export default function Dashboard() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (!session) return <Login />;
  return <Leads />;
}

function Login() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/crm`,
      },
    });
  };

  return (
    <div>
      <button onClick={handleLogin}>Iniciar con Google</button>
    </div>
  );
}

function Leads() {
  return (
    <div>
      <p>Dashboard</p>
      <button onClick={() => supabase.auth.signOut()}>Sign out</button>
    </div>
  );
}
