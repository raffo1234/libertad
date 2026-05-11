import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { useLeads } from "../../hooks/useLeads";
import type { Lead, LeadStatus } from "../../types/lead";

export default function Dashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        window.location.href = "/";
        return;
      }
      setSession(session);
      setLoading(false);
    });
  }, []);

  if (loading) return null;
  if (!session) return <Login />;
  return <Leads />;
}

function Login() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/crm` },
    });
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#f7f4ef]">
      {/* Grain texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full bg-[#c9a96e] opacity-[0.06] blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-[320px] w-[320px] rounded-full bg-[#c9a96e] opacity-[0.04] blur-[80px]" />

      {/* Left — branding */}
      <div className="relative hidden w-1/2 flex-col justify-between p-16 lg:flex">
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-[#c9a96e]" />
          <span className="text-[10px] tracking-[0.35em] text-[#c9a96e] uppercase">
            Galvez 1519
          </span>
        </div>

        <div>
          <p className="mb-5 text-[10px] tracking-[0.3em] text-[#b5b0a8] uppercase">
            El Tambo · Huancayo · Peru
          </p>
          <h2
            className="text-[64px] leading-[1.02] font-normal text-[#1c1a16]"
            style={{ letterSpacing: "-0.025em" }}
          >
            Live a
            <br />
            <em className="text-[#c9a96e]">unique</em>
            <br />
            experience.
          </h2>

          <p className="mt-6 max-w-xs text-sm leading-relaxed text-[#9e9890]">
            Find the perfect apartment for you in the heart of the city.
          </p>
          <div className="mt-10 flex items-center gap-5">
            <div className="h-px w-12 bg-[#c9a96e] opacity-60" />
            <div className="h-px flex-1 bg-[#dedad4]" />
          </div>
        </div>

        <div>
          <span className="text-[10px] tracking-[0.25em] text-[#c2bdb6] uppercase">
            CRM · Internal Access
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden w-px bg-[#e8e3db] lg:block" />

      {/* Right — login */}
      <div className="flex w-full flex-col items-center justify-center bg-[#faf8f5] px-8 lg:w-1/2">
        <div className="w-full max-w-[360px]">
          {/* Mobile logo */}
          <div className="mb-14 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="h-px w-6 bg-[#c9a96e]" />
              <span className="text-[10px] tracking-[0.35em] text-[#c9a96e] uppercase">
                Galvez 1519
              </span>
            </div>
          </div>

          <p className="mb-2 text-[10px] tracking-[0.3em] text-[#b5b0a8] uppercase">Access</p>
          <h1
            className="mb-2 text-[32px] leading-tight font-normal text-[#1c1a16]"
            style={{ letterSpacing: "-0.015em" }}
          >
            Welcome back
          </h1>
          <p className="mb-10 text-sm text-[#9e9890] italic">Sign in to continue</p>

          <button
            onClick={handleLogin}
            className="group relative w-full overflow-hidden border border-[#dedad4] bg-white px-6 py-4 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-[#c9a96e]/50 hover:shadow-[0_4px_16px_rgba(201,169,110,0.12)]"
          >
            <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-[#c9a96e] transition-all duration-500 group-hover:w-full" />
            <span className="flex items-center justify-between">
              <span className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-sm text-[#2a2820] transition-colors duration-200 group-hover:text-[#1c1a16]">
                  Continue with Google
                </span>
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#c2bdb6"
                strokeWidth="1.5"
                className="transition-all duration-300 group-hover:translate-x-1 group-hover:stroke-[#c9a96e]"
              >
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>

          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#ede9e3]" />
            <p className="text-[10px] tracking-[0.2em] text-[#ccc9c3] uppercase">
              Authorized personnel only
            </p>
            <div className="h-px flex-1 bg-[#ede9e3]" />
          </div>

          <p className="mt-6 text-center text-[10px] text-[#d4d0ca]">
            © 2026 Galvez 1519. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  visit: "Visit",
  reserved: "Reserved",
  lost: "Lost",
};

const STATUS_CLASSES: Record<LeadStatus, { badge: string; border: string }> = {
  new: { badge: "bg-blue-50 text-blue-600", border: "border-l-blue-500" },
  contacted: { badge: "bg-amber-50 text-amber-600", border: "border-l-amber-500" },
  visit: { badge: "bg-purple-50 text-purple-600", border: "border-l-purple-500" },
  reserved: { badge: "bg-emerald-50 text-emerald-600", border: "border-l-emerald-500" },
  lost: { badge: "bg-red-50 text-red-600", border: "border-l-red-500" },
};

const KPI_STATUSES: LeadStatus[] = ["new", "contacted", "visit", "reserved"];

function Leads() {
  const { data: leads, isLoading, error } = useLeads();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (isLoading) return <div className="p-8 text-sm text-gray-500">Loading...</div>;
  if (error) return <div className="p-8 text-sm text-red-500">Error loading leads</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Galvez 1519 · CRM</h1>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 transition-colors hover:text-gray-700"
          >
            Sign out
          </button>
        </div>

        <div className="mb-8 grid grid-cols-4 gap-4">
          {KPI_STATUSES.map((status) => (
            <div
              key={status}
              className={`rounded-lg border border-l-4 border-gray-100 bg-white p-4 ${STATUS_CLASSES[status].border}`}
            >
              <div className="mb-1 text-xs text-gray-500">{STATUS_LABEL[status]}</div>
              <div className="text-2xl font-semibold text-gray-900">
                {leads?.filter((l) => l.status === status).length ?? 0}
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Unit type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {leads?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    No leads yet
                  </td>
                </tr>
              )}
              {leads?.map((lead: Lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-gray-50 transition-colors hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.unit_type ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[lead.status].badge}`}
                    >
                      {STATUS_LABEL[lead.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(lead.created_at).toLocaleDateString("en-US")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
