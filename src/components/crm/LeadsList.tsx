import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useLeads } from "../../hooks/useLeads";
import type { Lead, LeadSource, LeadStatus } from "../../types/lead";
import { Icon } from "@iconify/react";
import { Toaster, toast } from "react-hot-toast";
import Modal from "./Modal";
import CreateLeadForm from "./CreateLeadForm";
import EditLeadForm from "./EditLeadForm";
import CrmAuthGuard from "./CrmAuthGuard";
import IconButton from "./IconButton";
import SwrCacheProvider from "./SwrCacheProvider";

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

function isRecent(dateStr: string): boolean {
  return Date.now() - new Date(dateStr).getTime() < 24 * 60 * 60 * 1000;
}

function SourceBadge({ source }: { source: LeadSource }) {
  return (
    <span
      className={`font-mulish inline-flex items-center rounded-full px-2.5 py-1 text-[10px] tracking-wider uppercase ${SOURCE_CLASSES[source]}`}
    >
      {SOURCE_LABEL[source]}
    </span>
  );
}

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

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  return (
    <SwrCacheProvider>
      <Toaster position="top-right" />
      <CrmAuthGuard>{() => <Leads />}</CrmAuthGuard>
    </SwrCacheProvider>
  );
}

// ─── Leads ────────────────────────────────────────────────────────────────────

function Leads() {
  const { data: leads, error, mutate } = useLeads();
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
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
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

  if (leads === undefined)
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

        <div className="flex flex-wrap items-center gap-3">
          <span className="font-manrope text-xs text-[#b5b0a8]">
            {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""}
          </span>
          {(search || statusFilter !== "all") && (
            <button
              onClick={() => {
                handleSearch("");
                handleStatusFilter("all");
              }}
              className="font-manrope text-xs text-[#b5b0a8] transition-colors hover:text-[#a06658]"
            >
              Clear filters
            </button>
          )}
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
                onClick={() => (window.location.href = `/crm/leads/${lead.id}`)}
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
                      <IconButton
                        onClick={() => setEditingLead(lead)}
                        icon="solar:pen-2-bold"
                        title="Edit lead"
                      ></IconButton>
                    )}
                    <IconButton
                      onClick={() => handleDelete(lead.id)}
                      icon="solar:trash-bin-trash-bold"
                      title="Delete lead"
                      variant="danger"
                    ></IconButton>
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

      <Modal title="New lead" open={modalOpen} onClose={() => setModalOpen(false)}>
        <CreateLeadForm onSuccess={handleLeadCreated} />
      </Modal>
      <Modal title="Edit lead" open={editingLead !== null} onClose={() => setEditingLead(null)}>
        {editingLead && <EditLeadForm lead={editingLead} onSuccess={handleLeadEdited} />}
      </Modal>
    </div>
  );
}
