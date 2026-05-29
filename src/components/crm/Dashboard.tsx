import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { useLeads } from "../../hooks/useLeads";
import type { Lead, LeadSource, LeadStatus } from "../../types/lead";
import LogoLink from "../LogoLink";
import { Icon } from "@iconify/react";
import { Toaster, toast } from "react-hot-toast";
import Modal from "./Modal";
import CreateLeadForm from "./CreateLeadForm";
import EditLeadForm from "./EditLeadForm";

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

const SOURCE_CLASSES: Record<LeadSource, string> = {
  web: "bg-[#f0f0ee] text-[#7a7870]",
  manual: "bg-[#f4ece0] text-[#a07d4a]",
};

const SOURCE_LABEL: Record<LeadSource, string> = {
  web: "Web",
  manual: "Manual",
};

const KPI_STATUSES: LeadStatus[] = ["new", "contacted", "visit", "reserved"];

type Page = "home" | "leads";
type SortKey = "name" | "created_at" | "status";
type SortDir = "asc" | "desc";

const STATUS_FILTER_OPTIONS: { value: LeadStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "visit", label: "Visit" },
  { value: "reserved", label: "Reserved" },
  { value: "lost", label: "Lost" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isRecent(dateStr: string): boolean {
  return Date.now() - new Date(dateStr).getTime() < 24 * 60 * 60 * 1000;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onSignOut: () => void;
  open: boolean;
  onClose: () => void;
}

function Sidebar({ activePage, onNavigate, onSignOut, open, onClose }: SidebarProps) {
  const handleNavigate = (page: Page) => {
    onNavigate(page);
    onClose();
  };

  const navItem = (page: Page, label: string, icon: string) => {
    const isActive = activePage === page;
    return (
      <button
        key={page}
        onClick={() => handleNavigate(page)}
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

  const content = (
    <aside className="flex h-full w-full flex-col bg-white px-4 py-6 lg:shadow-[1px_0_0_#ede9e3]">
      <div className="mb-8 flex items-center justify-between">
        <LogoLink />
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b5b0a8] transition-colors hover:bg-[#f0ede8] hover:text-[#1c1a16] lg:hidden"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {navItem("home", "Home", "solar:home-2-linear")}
        {navItem("leads", "Leads", "solar:users-group-rounded-linear")}
      </nav>
      <div className="my-4 h-px bg-[#ede9e3]" />
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

  return (
    <>
      <div className="hidden h-screen w-[240px] shrink-0 lg:block">{content}</div>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        className={`fixed inset-0 z-50 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {content}
      </div>
    </>
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSidebarOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-[#f7f4ef]">
      <Toaster position="top-right" />
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        onSignOut={handleSignOut}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-auto">
        <header className="flex h-14 items-center border-b border-[#e8e3db] bg-white px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9e9890] transition-colors hover:bg-[#f0ede8] hover:text-[#1c1a16]"
            aria-label="Open menu"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <div className="ml-3">
            <LogoLink />
          </div>
        </header>
        <main className="flex-1">
          {activePage === "home" && <Home />}
          {activePage === "leads" && <Leads />}
        </main>
      </div>
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

// ─── Source Badge ─────────────────────────────────────────────────────────────

function SourceBadge({ source }: { source: LeadSource }) {
  return (
    <span
      className={`font-mulish inline-flex items-center rounded-full px-2.5 py-1 text-[10px] tracking-wider uppercase ${SOURCE_CLASSES[source]}`}
    >
      {SOURCE_LABEL[source]}
    </span>
  );
}

// ─── Sort Icon ────────────────────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`ml-1 inline-block transition-colors ${active ? "text-[#1c1a16]" : "text-[#d4d0ca]"}`}
    >
      {dir === "asc" || !active ? (
        <path d="M12 5v14M5 12l7-7 7 7" />
      ) : (
        <path d="M12 19V5M5 12l7 7 7-7" />
      )}
    </svg>
  );
}

// ─── Leads ────────────────────────────────────────────────────────────────────

function Leads() {
  const { data: leads, isLoading, error, mutate } = useLeads();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
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
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    const { error: deleteError } = await supabase.from("lead").delete().eq("id", id).select();
    if (deleteError) {
      toast.error("Failed to delete lead");
      return;
    }
    mutate(leads?.filter((l) => l.id !== id));
    toast.success("Lead deleted");
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
  const handleStatusFilter = (value: LeadStatus | "all") => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleLeadCreated = () => {
    setModalOpen(false);
    mutate();
    toast.success("Lead created");
  };

  const handleLeadEdited = () => {
    setEditingLead(null);
    mutate();
    toast.success("Lead updated");
  };

  const q = search.trim().toLowerCase();

  const filteredLeads = (leads ?? [])
    .filter((l) => statusFilter === "all" || l.status === statusFilter)
    .filter(
      (l) =>
        !q ||
        [l.name, l.phone, l.email, l.unit_type, STATUS_LABEL[l.status], SOURCE_LABEL[l.source]]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q)),
    )
    .sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") return mul * a.name.localeCompare(b.name);
      if (sortKey === "status") return mul * a.status.localeCompare(b.status);
      if (sortKey === "created_at")
        return mul * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      return 0;
    });

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

  const sortableHeader = (label: string, key: SortKey) => (
    <th
      className="font-mulish cursor-pointer px-5 py-4 text-left text-[10px] font-normal tracking-[0.2em] text-[#b5b0a8] uppercase transition-colors select-none hover:text-[#1c1a16]"
      onClick={() => handleSort(key)}
    >
      {label}
      <SortIcon active={sortKey === key} dir={sortDir} />
    </th>
  );

  return (
    <div className="p-6 lg:p-10">
      {/* Title */}
      <div className="mb-8 border-b border-[#e8e3db] pb-6">
        <h2
          className="font-tan-pearl text-[28px] font-normal text-[#1c1a16]"
          style={{ letterSpacing: "-0.02em" }}
        >
          Leads
        </h2>
        <p className="font-manrope mt-1 text-sm text-[#9e9890]">
          {(leads ?? []).length} total · {filteredLeads.length} shown
        </p>
      </div>

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
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

      {/* Filters + actions */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-sm">
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
            placeholder="Search by name, phone, source…"
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

        {/* Right controls */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-manrope text-xs text-[#b5b0a8]">
            {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""}
          </span>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value as LeadStatus | "all")}
              className="font-mulish cursor-pointer appearance-none border border-[#e8e3db] bg-[#faf8f5] py-2 pr-8 pl-3 text-[10px] tracking-[0.2em] text-[#9e9890] uppercase transition-colors outline-none hover:border-[#c9a96e]/50 focus:border-[#c9a96e]"
            >
              {STATUS_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
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

          {/* Page size */}
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

          {/* New lead */}
          <button
            onClick={() => setModalOpen(true)}
            className="group font-manrope relative flex items-center gap-2 overflow-hidden border border-[#1c1a16] bg-[#1c1a16] px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-[#2e2b24] active:scale-[0.98]"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.06)_50%,transparent_70%)] transition-transform duration-500 group-hover:translate-x-full" />
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New lead
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto border border-[#e8e3db] bg-[#faf8f5] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <table className="font-manrope w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-[#e8e3db]">
              {sortableHeader("Name", "name")}
              <th className="font-mulish px-5 py-4 text-left text-[10px] font-normal tracking-[0.2em] text-[#b5b0a8] uppercase">
                Phone
              </th>
              <th className="font-mulish px-5 py-4 text-left text-[10px] font-normal tracking-[0.2em] text-[#b5b0a8] uppercase">
                Unit type
              </th>
              {sortableHeader("Status", "status")}
              <th className="font-mulish px-5 py-4 text-left text-[10px] font-normal tracking-[0.2em] text-[#b5b0a8] uppercase">
                Source
              </th>
              {sortableHeader("Date", "created_at")}
              <th className="px-5 py-4" />
            </tr>
          </thead>
          <tbody>
            {paginatedLeads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-[#c2bdb6] italic">
                  {q ? `No results for "${search}"` : "No leads yet"}
                </td>
              </tr>
            )}
            {paginatedLeads.map((lead: Lead) => (
              <tr
                key={lead.id}
                onClick={() => (window.location.href = `/crm/lead/${lead.id}`)}
                className="cursor-pointer border-b border-[#ede9e3] transition-colors last:border-b-0 hover:bg-[#f7f4ef]"
              >
                <td className="px-5 py-4 font-medium text-[#1c1a16]">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{lead.name}</span>
                    {isRecent(lead.created_at) && (
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#7ba07b]"
                        title="New today"
                      />
                    )}
                  </div>
                </td>
                <td className="truncate px-5 py-4 text-[#6b665e]">{lead.phone}</td>
                <td className="px-5 py-4 text-[#6b665e]">{lead.unit_type ?? "—"}</td>
                <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                  <div className="relative inline-flex items-center gap-1">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                      className={`cursor-pointer appearance-none rounded-full border-0 py-2 pr-10 pl-4 text-xs ring-0 transition-colors outline-none ${STATUS_CLASSES[lead.status].badge}`}
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
                <td className="px-5 py-4">
                  <SourceBadge source={lead.source} />
                </td>
                <td className="truncate px-5 py-4 text-[13px] text-[#9e9890]">
                  {new Date(lead.created_at).toLocaleString("es-PE", { timeZone: "America/Lima" })}
                </td>
                <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    {lead.source === "manual" && (
                      <button
                        onClick={() => setEditingLead(lead)}
                        className="rounded-full border border-[#e8e3db] bg-white p-2 text-[#b5b0a8] transition-colors hover:border-[#c9a96e]/40 hover:text-[#a07d4a]"
                        title="Edit lead"
                      >
                        <Icon icon="solar:pen-2-bold" className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(lead.id)}
                      className="rounded-full border border-[#e8e3db] bg-white p-2 text-[#b5b0a8] transition-colors hover:border-[#c08878]/40 hover:text-[#a06658]"
                      title="Delete lead"
                    >
                      <Icon icon="solar:trash-bin-trash-bold" className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
                    key={`e-${i}`}
                    className="font-manrope flex h-8 w-8 items-center justify-center text-xs text-[#c2bdb6]"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`font-manrope flex h-8 w-8 items-center justify-center border text-xs transition-colors ${safePage === p ? "border-[#c9a96e]/40 bg-[#c9a96e]/10 text-[#a07d4a]" : "border-[#e8e3db] bg-[#faf8f5] text-[#9e9890] hover:border-[#c9a96e]/50 hover:text-[#c9a96e]"}`}
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

      {/* Modals */}
      <Modal title="New lead" open={modalOpen} onClose={() => setModalOpen(false)}>
        <CreateLeadForm onSuccess={handleLeadCreated} />
      </Modal>
      <Modal title="Edit lead" open={editingLead !== null} onClose={() => setEditingLead(null)}>
        {editingLead && <EditLeadForm lead={editingLead} onSuccess={handleLeadEdited} />}
      </Modal>
    </div>
  );
}
