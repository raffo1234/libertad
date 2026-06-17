import { PERMISSIONS } from "../../lib/permissions";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Session } from "@supabase/supabase-js";
import type { Lead, LeadSource, LeadStatus } from "../../types/lead";
import { Icon } from "@iconify/react";
import { Toaster, toast } from "react-hot-toast";
import Modal from "./Modal";
import EditLeadForm from "./EditLeadForm";
import LogoLink from "../LogoLink";
import { usePermissions } from "../../hooks/usePermissions";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  visit: "Visit",
  reserved: "Reserved",
  lost: "Lost",
};

const STATUS_CLASSES: Record<LeadStatus, string> = {
  new: "bg-[#eef1f6] text-[#5a6b86]",
  contacted: "bg-[#f4ece0] text-[#a07d4a]",
  visit: "bg-[#efeaf2] text-[#7a6890]",
  reserved: "bg-[#e8efe8] text-[#5d7d5d]",
  lost: "bg-[#f3e8e6] text-[#a06658]",
};

const SOURCE_LABEL: Record<LeadSource, string> = {
  web: "Web",
  manual: "Manual",
};

const SOURCE_CLASSES: Record<LeadSource, string> = {
  web: "bg-[#f0f0ee] text-[#7a7870]",
  manual: "bg-[#f4ece0] text-[#a07d4a]",
};

const UNIT_TYPE_LABEL: Record<string, string> = {
  type_1: "Tipo 1",
  type_2: "Tipo 2",
  type_3: "Tipo 3",
  type_4: "Tipo 4",
  parking: "Estacionamiento",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`font-mulish inline-flex items-center rounded-full px-2.5 py-1 text-[10px] tracking-wider uppercase ${className}`}
    >
      {label}
    </span>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mulish text-[10px] font-semibold tracking-widest text-[#9e8c7f] uppercase">
        {label}
      </span>
      <span className="font-manrope text-sm text-[#1c1a16]">
        {value ?? <span className="text-[#c2bdb6]">—</span>}
      </span>
    </div>
  );
}

// ─── LeadDetail ───────────────────────────────────────────────────────────────

interface LeadDetailProps {
  id: string;
}

export default function LeadDetail({ id }: LeadDetailProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [lead, setLead] = useState<Lead | null>(null);
  const [leadLoading, setLeadLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const { data: permissions } = usePermissions();
  const canEditLead = (permissions ?? []).includes(PERMISSIONS.EDIT_LEADS);

  // ─── Auth ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        window.location.href = "/";
        return;
      }
      setSession(session);
      setAuthLoading(false);
    });
  }, []);

  // ─── Fetch lead ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!session) return;

    const fetchLead = async () => {
      setLeadLoading(true);
      const { data, error } = await supabase.from("lead").select("*").eq("id", id).maybeSingle();

      if (error) {
        toast.error("Error loading lead");
        setLeadLoading(false);
        return;
      }

      setLead(data);
      setLeadLoading(false);
    };

    fetchLead();
  }, [session, id]);

  const handleLeadEdited = async () => {
    setEditOpen(false);
    const { data, error } = await supabase.from("lead").select("*").eq("id", id).maybeSingle();

    if (error) {
      toast.error("Error refreshing lead");
      return;
    }
    setLead(data);
    toast.success("Lead updated");
  };

  // ─── States ────────────────────────────────────────────────────────────────

  if (authLoading || leadLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f4ef]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#e8e3db] border-t-[#c9a96e]" />
      </div>
    );
  }

  if (!session) {
    window.location.href = "/crm";
    return null;
  }

  if (!lead) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f4ef]">
        <p className="font-manrope text-sm text-[#9e9890]">Lead not found.</p>
        <a
          href="/crm"
          className="font-manrope text-sm text-[#c9a96e] underline underline-offset-4 hover:text-[#a07d4a]"
        >
          Back to CRM
        </a>
      </div>
    );
  }

  const createdAt = new Date(lead.created_at).toLocaleString("es-PE", { timeZone: "America/Lima" });
  const isRecent = Date.now() - new Date(lead.created_at).getTime() < 24 * 60 * 60 * 1000;
  const hasUtm = lead.utm_source || lead.utm_medium || lead.utm_campaign;

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="border-b border-[#e8e3db] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="/crm/leads"
              className="font-manrope flex items-center gap-1.5 text-sm text-[#b5b0a8] transition-colors hover:text-[#1c1a16]"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Leads
            </a>
            <span className="text-[#e8e3db]">/</span>
            <span className="font-manrope text-sm text-[#1c1a16]">{lead.name}</span>
          </div>
          <LogoLink />
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-3xl space-y-6 px-6 py-10">
        {/* Title row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1
                className="font-tan-pearl text-[32px] font-normal text-[#1c1a16]"
                style={{ letterSpacing: "-0.02em" }}
              >
                {lead.name}
              </h1>
              {isRecent && (
                <span className="font-mulish inline-flex items-center gap-1 rounded-full bg-[#e8efe8] px-2.5 py-1 text-[10px] tracking-wider text-[#5d7d5d] uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#5d7d5d]" />
                  New today
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge label={STATUS_LABEL[lead.status]} className={STATUS_CLASSES[lead.status]} />
              <Badge label={SOURCE_LABEL[lead.source]} className={SOURCE_CLASSES[lead.source]} />
            </div>
          </div>

          {lead.source === "manual" && (
            <>
              {canEditLead && (
                <button
                  onClick={() => setEditOpen(true)}
                  className="group font-manrope relative flex shrink-0 items-center gap-2 overflow-hidden border border-[#1c1a16] bg-[#1c1a16] px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-[#2e2b24] active:scale-[0.99]"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.06)_50%,transparent_70%)] transition-transform duration-500 group-hover:translate-x-full" />
                  <Icon icon="solar:pen-2-bold" className="h-4 w-4" />
                  Edit
                </button>
              )}
            </>
          )}
        </div>

        {/* Contact info */}
        <section className="border border-[#e8e3db] bg-[#faf8f5] p-6">
          <h2 className="font-mulish mb-5 text-[10px] font-semibold tracking-widest text-[#b5b0a8] uppercase">
            Contact
          </h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            <Field
              label="Phone"
              value={
                <a href={`tel:${lead.phone}`} className="transition-colors hover:text-[#c9a96e]">
                  {lead.phone}
                </a>
              }
            />
            <Field
              label="Email"
              value={
                lead.email ? (
                  <a
                    href={`mailto:${lead.email}`}
                    className="transition-colors hover:text-[#c9a96e]"
                  >
                    {lead.email}
                  </a>
                ) : null
              }
            />
            <Field
              label="Unit type"
              value={lead.unit_type ? UNIT_TYPE_LABEL[lead.unit_type] : null}
            />
            <Field label="Created at" value={createdAt} />
          </div>
        </section>

        {/* Notes */}
        {lead.notes && (
          <section className="border border-[#e8e3db] bg-[#faf8f5] p-6">
            <h2 className="font-mulish mb-3 text-[10px] font-semibold tracking-widest text-[#b5b0a8] uppercase">
              Notes
            </h2>
            <p className="font-manrope text-sm leading-relaxed whitespace-pre-wrap text-[#1c1a16]">
              {lead.notes}
            </p>
          </section>
        )}

        {/* UTM tracking */}
        {hasUtm && (
          <section className="border border-[#e8e3db] bg-[#faf8f5] p-6">
            <h2 className="font-mulish mb-5 text-[10px] font-semibold tracking-widest text-[#b5b0a8] uppercase">
              Tracking
            </h2>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
              <Field label="UTM Source" value={lead.utm_source} />
              <Field label="UTM Medium" value={lead.utm_medium} />
              <Field label="UTM Campaign" value={lead.utm_campaign} />
            </div>
          </section>
        )}
      </div>

      {/* Edit modal */}
      <Modal title="Edit lead" open={editOpen} onClose={() => setEditOpen(false)}>
        <EditLeadForm lead={lead} onSuccess={handleLeadEdited} />
      </Modal>
    </div>
  );
}
