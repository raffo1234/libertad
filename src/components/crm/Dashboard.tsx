import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { useLeads } from "../../hooks/useLeads";
import type { Lead, LeadStatus } from "../../types/lead";

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
      options: { redirectTo: `${window.location.origin}/crm` },
    });
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Galvez 1519 · CRM</h1>
        <button
          onClick={handleLogin}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Sign in with Google
        </button>
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
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Unit type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
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
