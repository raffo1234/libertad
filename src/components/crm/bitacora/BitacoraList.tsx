import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import type { BitacoraEntry, BitacoraFile } from "../../../types/bitacora";
import { Icon } from "@iconify/react";
import { toast, Toaster } from "react-hot-toast";
import Modal from "../Modal";
import BitacoraForm from "./BitacoraForm";
import EditBitacoraForm from "./EditBitacoraForm";
import CrmAuthGuard from "../CrmAuthGuard";
import IconButton from "../IconButton";
import { useBitacora } from "../../../hooks/useBitacora";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string): string =>
  new Date(dateStr + "T00:00:00").toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatBytes = (bytes: number): string => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isImage = (type: string) => type.startsWith("image/");
const isVideo = (type: string) => type.startsWith("video/");

const fileIcon = (type: string): string => {
  if (isImage(type)) return "solar:gallery-bold";
  if (isVideo(type)) return "solar:video-library-bold";
  if (type === "application/pdf") return "solar:file-text-bold";
  return "solar:file-bold";
};

// ─── File preview ─────────────────────────────────────────────────────────────

function FilePreview({ file }: { file: BitacoraFile }) {
  if (isImage(file.type)) {
    return (
      <a
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative overflow-hidden border border-[#e8e3db]"
      >
        <img
          src={file.url}
          alt={file.name}
          className="h-24 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
          <Icon
            icon="solar:maximize-square-bold"
            className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100"
          />
        </div>
      </a>
    );
  }

  if (isVideo(file.type)) {
    return (
      <a
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-24 items-center justify-center border border-[#e8e3db] bg-[#f0ede8] transition-colors hover:bg-[#ebe7e2]"
      >
        <div className="flex flex-col items-center gap-1">
          <Icon icon="solar:play-circle-bold" className="h-8 w-8 text-[#c9a96e]" />
          <span className="font-manrope text-xs text-[#9e9890]">{formatBytes(file.size)}</span>
        </div>
      </a>
    );
  }

  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-24 items-center justify-center border border-[#e8e3db] bg-[#faf8f5] transition-colors hover:bg-[#f0ede8]"
    >
      <div className="flex flex-col items-center gap-1">
        <Icon icon={fileIcon(file.type)} className="h-8 w-8 text-[#b5b0a8]" />
        <span className="font-manrope max-w-[80px] truncate text-xs text-[#9e9890]">
          {file.name}
        </span>
      </div>
    </a>
  );
}

// ─── Entry card ───────────────────────────────────────────────────────────────

interface EntryCardProps {
  entry: BitacoraEntry;
  onDelete: (id: string) => void;
  onEdit: (entry: BitacoraEntry) => void;
}

function EntryCard({ entry, onDelete, onEdit }: EntryCardProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-[#e8e3db] bg-[#faf8f5]">
      <div
        className="flex cursor-pointer items-center justify-between px-5 py-4 hover:bg-[#f7f4ef]"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex flex-col gap-0.5">
          <span className="font-manrope text-xs text-[#b5b0a8] capitalize">
            {formatDate(entry.date)}
          </span>
          <h3 className="font-manrope font-medium text-[#1c1a16]">{entry.title}</h3>
        </div>
        <div className="flex items-center gap-3">
          {entry.files && entry.files.length > 0 && (
            <span className="font-mulish flex items-center gap-1 text-[10px] tracking-wider text-[#b5b0a8] uppercase">
              <Icon icon="solar:paperclip-linear" className="h-3.5 w-3.5" />
              {entry.files.length}
            </span>
          )}
          <IconButton
            icon="solar:pen-2-bold"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(entry);
            }}
            title="Editar entrada"
          />
          <IconButton
            icon="solar:trash-bin-trash-bold"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(entry.id);
            }}
            title="Eliminar entrada"
            variant="danger"
          />
          <Icon
            icon="solar:alt-arrow-down-linear"
            className={`h-4 w-4 text-[#b5b0a8] transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#e8e3db] px-5 py-4">
          {entry.description && (
            <p className="font-manrope mb-4 text-sm leading-relaxed whitespace-pre-wrap text-[#6b665e]">
              {entry.description}
            </p>
          )}
          {entry.files && entry.files.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {entry.files.map((file) => (
                <FilePreview key={file.id} file={file} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Inner component ──────────────────────────────────────────────────────────

interface BitacoraInnerProps {
  projectSlug: string;
  userId: string;
}

function BitacoraInner({ projectSlug, userId }: BitacoraInnerProps) {
  const { data: entries = [], isLoading, error, mutate } = useBitacora(projectSlug);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BitacoraEntry | null>(null);

  const handleEntryCreated = () => {
    setModalOpen(false);
    mutate();
    toast.success("Entrada guardada");
  };
  const handleEntryEdited = () => {
    setEditingEntry(null);
    mutate();
    toast.success("Entrada actualizada");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta entrada y sus archivos?")) return;
    const { error } = await supabase.from("bitacora_entry").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar");
      return;
    }
    mutate();
    toast.success("Entrada eliminada");
  };

  if (isLoading && entries.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#e8e3db] border-t-[#c9a96e]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="font-manrope text-sm text-[#a06658]">Error al cargar la bitácora.</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8 flex items-end justify-between border-b border-[#e8e3db] pb-6">
        <div>
          <h1
            className="font-tan-pearl text-[28px] font-normal text-[#1c1a16]"
            style={{ letterSpacing: "-0.02em" }}
          >
            Bitácora
          </h1>
          <p className="font-manrope mt-1 text-sm text-[#9e9890]">
            {entries.length} entrada{entries.length !== 1 ? "s" : ""} · {projectSlug}
          </p>
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
          Nueva entrada
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <Icon icon="solar:notebook-linear" className="h-10 w-10 text-[#c2bdb6]" />
          <p className="font-manrope text-sm text-[#9e9890]">No hay entradas aún.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onDelete={handleDelete}
              onEdit={setEditingEntry}
            />
          ))}
        </div>
      )}

      <Modal title="Nueva entrada" open={modalOpen} onClose={() => setModalOpen(false)}>
        <BitacoraForm projectSlug={projectSlug} userId={userId} onSuccess={handleEntryCreated} />
      </Modal>

      <Modal
        title="Editar entrada"
        open={editingEntry !== null}
        onClose={() => setEditingEntry(null)}
      >
        {editingEntry && (
          <EditBitacoraForm
            entry={editingEntry}
            projectSlug={projectSlug}
            onSuccess={handleEntryEdited}
          />
        )}
      </Modal>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface BitacoraListProps {
  projectSlug: string;
}

export default function BitacoraList({ projectSlug }: BitacoraListProps) {
  return (
    <>
      <Toaster position="top-right" />
      <CrmAuthGuard>
        {(session) => <BitacoraInner projectSlug={projectSlug} userId={session.user.id} />}
      </CrmAuthGuard>
    </>
  );
}
