import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { useLeads } from "../../hooks/useLeads";
import type { Lead, LeadStatus } from "../../types/lead";
import LogoLink from "../LogoLink";
import { Icon } from "@iconify/react";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE_KEY = "crm_leads_page_size";
const PAGE_SIZES = [10, 20, 50];

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  visit: "Visit",
  reserved: "Reserved",
  lost: "Lost",
};

const STATUS_CLASSES: Record<LeadStatus, { badge: string; border: string }> = {
  new: { badge: "bg-[#eef1f6] text-[#5a6b86]", border: "border-l-[#8da2c0]" },
  contacted: { badge: "bg-[#f4ece0] text-[#a07d4a]", border: "border-l-[#c9a96e]" },
  visit: { badge: "bg-[#efeaf2] text-[#7a6890]", border: "border-l-[#a892bf]" },
  reserved: { badge: "bg-[#e8efe8] text-[#5d7d5d]", border: "border-l-[#7ba07b]" },
  lost: { badge: "bg-[#f3e8e6] text-[#a06658]", border: "border-l-[#c08878]" },
};

const KPI_STATUSES: LeadStatus[] = ["new", "contacted", "visit", "reserved"];

type Page = "home" | "leads";

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  activePage,
  onNavigate,
  onSignOut,
}: {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onSignOut: () => void;
}) {
  const navItem = (page: Page, label: string, icon: string) => {
    const isActive = activePage === page;
    return (
      <button
        key={page}
        onClick={() => onNavigate(page)}
        className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 ${
          isActive
            ? "border-l-2 border-[#1c1a16] bg-[#f0ede8] pl-[10px] font-medium text-[#1c1a16]"
            : "border-l-2 border-transparent pl-[10px] text-[#9e9890] hover:bg-[#f0ede8] hover:text-[#1c1a16]"
        }`}
      >
        <Icon
          icon={icon}
          className={`h-[18px] w-[18px] shrink-0 transition-colors ${
            isActive ? "text-[#1c1a16]" : "text-[#c2bdb6] group-hover:text-[#6b665e]"
          }`}
        />
        <span className="font-manrope">{label}</span>
      </button>
    );
  };

  return (
    <aside className="flex h-screen w-[240px] shrink-0 flex-col bg-white px-4 py-6 shadow-[1px_0_0_#ede9e3]">
      {/* Logo */}
      <div className="mb-8">
        <LogoLink />
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1">
        {navItem("home", "Home", "solar:home-2-linear")}
        {navItem("leads", "Leads", "solar:users-group-rounded-linear")}
      </nav>

      {/* Divider */}
      <div className="my-4 h-px bg-[#ede9e3]" />

      {/* Sign out */}
      <button
        onClick={onSignOut}
        className="group flex w-full items-center gap-3 rounded-lg border-l-2 border-transparent px-3 py-2.5 pl-[10px] text-sm text-[#9e9890] transition-all duration-150 hover:bg-[#f3e8e6] hover:text-[#a06658]"
      >
        <Icon
          icon="solar:logout-2-linear"
          className="h-[18px] w-[18px] shrink-0 text-[#c2bdb6] transition-colors group-hover:text-[#c08878]"
        />
        <span className="font-manrope">Sign out</span>
      </button>
    </aside>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

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
  return <AppShell />;
}

// ─── AppShell ─────────────────────────────────────────────────────────────────

function AppShell() {
  const [activePage, setActivePage] = useState<Page>("leads");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-[#f7f4ef]">
      <Sidebar activePage={activePage} onNavigate={setActivePage} onSignOut={handleSignOut} />
      <main className="flex-1 overflow-auto">
        {activePage === "home" && <Home />}
        {activePage === "leads" && <Leads />}
      </main>
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────

function Home() {
  return (
    <div className="flex h-full items-center justify-center p-12">
      <div className="text-center">
        <p
          className="font-tan-pearl text-[40px] text-[#1c1a16]"
          style={{ letterSpacing: "-0.02em" }}
        >
          Welcome
        </p>
        <p className="font-manrope mt-2 text-sm text-[#9e9890]">
          Select a section from the sidebar.
        </p>
      </div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────

function Login() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/crm` },
    });
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#f7f4ef]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />
      <div className="pointer-events-none absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full bg-[#c9a96e] opacity-[0.06] blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-[320px] w-[320px] rounded-full bg-[#c9a96e] opacity-[0.04] blur-[80px]" />

      <div className="relative hidden w-1/2 flex-col justify-between p-16 lg:flex">
        <div className="flex items-center">
          <LogoLink />
        </div>
        <div>
          <p className="font-mulish mb-5 text-[10px] tracking-[0.3em] text-[#b5b0a8] uppercase">
            El Tambo · Huancayo · Peru
          </p>
          <h2
            className="font-tan-pearl text-[64px] leading-[1.02] font-normal text-[#1c1a16]"
            style={{ letterSpacing: "-0.025em" }}
          >
            Live a<br />
            <em className="text-[#c9a96e]">unique</em>
            <br />
            experience.
          </h2>
          <p className="font-manrope mt-6 max-w-xs text-sm leading-relaxed text-[#9e9890]">
            Find the perfect apartment for you in the heart of the city.
          </p>
          <div className="mt-10 flex items-center gap-5">
            <div className="h-px w-12 bg-[#c9a96e] opacity-60" />
            <div className="h-px flex-1 bg-[#dedad4]" />
          </div>
        </div>
        <span className="font-mulish text-[10px] tracking-[0.25em] text-[#c2bdb6] uppercase">
          CRM · Internal Access
        </span>
      </div>

      <div className="hidden w-px bg-[#e8e3db] lg:block" />

      <div className="flex w-full flex-col items-center justify-center bg-[#faf8f5] px-8 lg:w-1/2">
        <div className="w-full max-w-[360px]">
          <div className="mb-14 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="h-px w-6 bg-[#c9a96e]" />
              <span className="font-mulish text-[10px] tracking-[0.35em] text-[#c9a96e] uppercase">
                Galvez 1519
              </span>
            </div>
          </div>

          <p className="font-mulish mb-2 text-[10px] tracking-[0.3em] text-[#b5b0a8] uppercase">
            Access
          </p>
          <h1
            className="font-tan-pearl mb-2 text-[32px] leading-tight font-normal text-[#1c1a16]"
            style={{ letterSpacing: "-0.015em" }}
          >
            Welcome back
          </h1>
          <p className="font-manrope mb-10 text-sm text-[#9e9890] italic">Sign in to continue</p>

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
                <span className="font-manrope text-sm text-[#2a2820] transition-colors duration-200 group-hover:text-[#1c1a16]">
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
            <p className="font-mulish text-[10px] tracking-[0.2em] text-[#ccc9c3] uppercase">
              Authorized personnel only
            </p>
            <div className="h-px flex-1 bg-[#ede9e3]" />
          </div>
          <p className="font-manrope mt-6 text-center text-[10px] text-[#d4d0ca]">
            © 2026 Galvez 1519. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Leads ────────────────────────────────────────────────────────────────────

function Leads() {
  const { data: leads, isLoading, error, mutate } = useLeads();
  const [deletedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(() => {
    if (typeof window === "undefined") return 10;
    const saved = localStorage.getItem(PAGE_SIZE_KEY);
    const n = saved ? parseInt(saved, 10) : 10;
    return PAGE_SIZES.includes(n) ? n : 10;
  });

  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    mutate(
      leads?.map((l) => (l.id === id ? { ...l, status: newStatus } : l)),
      false,
    );
    const { error: updateError } = await supabase
      .from("lead")
      .update({ status: newStatus })
      .eq("id", id);
    if (updateError) {
      console.error("Update failed:", updateError);
      mutate();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    const { error: deleteError } = await supabase.from("lead").delete().eq("id", id).select();
    if (deleteError) {
      console.error("Delete failed:", deleteError);
      alert("Error al eliminar: " + deleteError.message);
      return;
    }
    mutate(leads?.filter((l) => l.id !== id));
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
    localStorage.setItem(PAGE_SIZE_KEY, String(size));
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const activeLeads = leads?.filter((l) => !deletedIds.has(l.id)) ?? [];

  const q = search.trim().toLowerCase();
  const filteredLeads = q
    ? activeLeads.filter((l) =>
        [l.name, l.phone, l.email, l.unit_type, STATUS_LABEL[l.status ?? "new"]]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q)),
      )
    : activeLeads;

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedLeads = filteredLeads.slice((safePage - 1) * pageSize, safePage * pageSize);

  if (isLoading)
    return (
      <div className="font-manrope flex h-full items-center justify-center p-12 text-sm text-[#9e9890] italic">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="font-manrope flex h-full items-center justify-center p-12 text-sm text-[#a06658]">
        Error loading leads
      </div>
    );

  return (
    <div className="p-10">
      {/* Page title */}
      <div className="mb-8 border-b border-[#e8e3db] pb-6">
        <h2
          className="font-tan-pearl text-[28px] font-normal text-[#1c1a16]"
          style={{ letterSpacing: "-0.02em" }}
        >
          Leads
        </h2>
        <p className="font-manrope mt-1 text-sm text-[#9e9890]">
          {activeLeads.length} total · {filteredLeads.length} shown
        </p>
      </div>

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-4 gap-4">
        {KPI_STATUSES.map((status) => (
          <div
            key={status}
            className={`border border-l-2 border-[#e8e3db] bg-[#faf8f5] p-5 transition-shadow duration-300 hover:shadow-[0_4px_16px_rgba(201,169,110,0.08)] ${STATUS_CLASSES[status].border}`}
          >
            <div className="font-mulish mb-3 text-[10px] tracking-[0.25em] text-[#b5b0a8] uppercase">
              {STATUS_LABEL[status]}
            </div>
            <div
              className="font-tan-pearl text-[40px] leading-none font-normal text-[#1c1a16]"
              style={{ letterSpacing: "-0.02em" }}
            >
              {filteredLeads.filter((l) => l.status === status).length}
            </div>
          </div>
        ))}
      </div>

      {/* Buscador + page size */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <svg
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#c2bdb6]"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name, phone, status…"
            className="font-manrope h-10 w-full border border-[#e8e3db] bg-[#faf8f5] py-2 pr-9 pl-9 text-sm text-[#1c1a16] placeholder-[#c2bdb6] transition-colors outline-none focus:border-[#c9a96e] focus:bg-white"
          />
          {search && (
            <button
              onClick={() => handleSearch("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-[#c2bdb6] hover:text-[#9e9890]"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="font-manrope text-xs text-[#b5b0a8]">
            {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""}
            {q && ` for "${search}"`}
          </span>
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="font-mulish cursor-pointer appearance-none border border-[#e8e3db] bg-[#faf8f5] py-2 pr-8 pl-3 text-[10px] tracking-[0.2em] text-[#9e9890] uppercase transition-colors outline-none hover:border-[#c9a96e]/50 focus:border-[#c9a96e]"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s} per page
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[#c2bdb6]"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-auto border border-[#e8e3db] bg-[#faf8f5] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <table className="font-manrope w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-[#e8e3db]">
              {["Name", "Phone", "Unit type", "Status", "Date", ""].map((h, i) => (
                <th
                  key={i}
                  className="font-mulish px-5 py-4 text-left text-[10px] font-normal tracking-[0.2em] text-[#b5b0a8] uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedLeads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center text-[#c2bdb6] italic">
                  {q ? `No results for "${search}"` : "No leads yet"}
                </td>
              </tr>
            )}
            {paginatedLeads.map((lead: Lead) => (
              <tr
                key={lead.id}
                className="border-b border-[#ede9e3] transition-colors last:border-b-0 hover:bg-[#f7f4ef]"
              >
                <td className="truncate px-5 py-4 font-medium text-[#1c1a16]">{lead.name}</td>
                <td className="truncate px-5 py-4 text-[#6b665e]">{lead.phone}</td>
                <td className="px-5 py-4 text-[#6b665e]">{lead.unit_type ?? "—"}</td>
                <td className="px-5 py-4">
                  <div className="relative inline-flex items-center gap-1">
                    <select
                      value={lead.status ?? "new"}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                      className={`cursor-pointer appearance-none rounded-full border-0 py-2 pr-10 pl-4 text-xs ring-0 transition-colors outline-none ${STATUS_CLASSES[lead.status ?? "new"].badge}`}
                    >
                      {(Object.keys(STATUS_LABEL) as LeadStatus[]).map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                    <Icon
                      icon="solar:pen-2-bold"
                      className="pointer-events-none absolute right-3 h-4 w-4 opacity-40"
                    />
                  </div>
                </td>
                <td className="truncate px-5 py-4 text-[13px] text-[#9e9890]">
                  {new Date(lead.created_at).toLocaleString("es-PE", { timeZone: "America/Lima" })}
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => handleDelete(lead.id)}
                    className="rounded-full border border-[#e8e3db] bg-white p-2 text-[#b5b0a8] transition-colors hover:border-[#c08878]/40 hover:text-[#a06658]"
                    title="Delete lead"
                  >
                    <Icon icon="solar:trash-bin-trash-bold" className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginador */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="font-manrope text-xs text-[#b5b0a8]">
            Page {safePage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="flex h-8 w-8 items-center justify-center border border-[#e8e3db] bg-[#faf8f5] text-[#b5b0a8] transition-colors hover:border-[#c9a96e]/50 hover:text-[#c9a96e] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .reduce<(number | "…")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="font-manrope flex h-8 w-8 items-center justify-center text-xs text-[#c2bdb6]"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`font-manrope flex h-8 w-8 items-center justify-center border text-xs transition-colors ${
                      safePage === p
                        ? "border-[#c9a96e]/40 bg-[#c9a96e]/10 text-[#a07d4a]"
                        : "border-[#e8e3db] bg-[#faf8f5] text-[#9e9890] hover:border-[#c9a96e]/50 hover:text-[#c9a96e]"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="flex h-8 w-8 items-center justify-center border border-[#e8e3db] bg-[#faf8f5] text-[#b5b0a8] transition-colors hover:border-[#c9a96e]/50 hover:text-[#c9a96e] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
