import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../../../lib/supabase";
import { uploadFiles } from "../../../lib/uploadR2";
import { deleteFromR2 } from "../../../lib/deleteR2";
import type { BitacoraEntry, BitacoraFile } from "../../../types/bitacora";
import { Icon } from "@iconify/react";
import FileUploader from "./FileUploader";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormValues {
  date: string;
  title: string;
  description: string;
}

interface EditBitacoraFormProps {
  entry: BitacoraEntry;
  projectSlug: string;
  onSuccess: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fileIcon = (type: string): string => {
  if (type.startsWith("image/")) return "solar:gallery-bold";
  if (type.startsWith("video/")) return "solar:video-library-bold";
  if (type === "application/pdf") return "solar:file-text-bold";
  return "solar:file-bold";
};

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mulish text-[10px] font-semibold tracking-widest text-[#9e8c7f] uppercase">
        {label}
        {required && <span className="ml-0.5 text-[#795a45]">*</span>}
      </label>
      {children}
      {error && <span className="font-manrope text-[11px] text-red-500">{error}</span>}
    </div>
  );
}

const inputCls = (hasError: boolean) =>
  `h-11 w-full border-[1.5px] bg-white px-4 font-manrope text-sm text-[#1c1a16] placeholder-[#c4b5ab] outline-none transition-colors duration-200 focus:border-[#795a45] ${
    hasError ? "border-red-400" : "border-[#e8e2dd]"
  }`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditBitacoraForm({ entry, projectSlug, onSuccess }: EditBitacoraFormProps) {
  // Existing files the user can remove
  const [existingFiles, setExistingFiles] = useState<BitacoraFile[]>(entry.files ?? []);
  const [removedFiles, setRemovedFiles] = useState<BitacoraFile[]>([]);

  // New files to upload
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      date: entry.date,
      title: entry.title,
      description: entry.description ?? "",
    },
  });

  const removeExisting = (file: BitacoraFile) => {
    setExistingFiles((prev) => prev.filter((f) => f.id !== file.id));
    setRemovedFiles((prev) => [...prev, file]);
  };

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    setSaveError(null);

    try {
      // 1. Upload new files to R2
      let uploaded: Awaited<ReturnType<typeof uploadFiles>> = [];
      if (newFiles.length > 0) {
        uploaded = await uploadFiles(newFiles, `bitacora/${projectSlug}`, (progressList) => {
          const map: Record<string, number> = {};
          progressList.forEach((p) => {
            map[p.file] = p.percent;
          });
          setProgress(map);
        });
      }

      // 2. Insert new files in Supabase
      if (uploaded.length > 0) {
        const fileRows = uploaded.map((f) => ({
          entry_id: entry.id,
          name: f.name,
          size: f.size,
          type: f.type,
          r2_key: f.r2Key,
          url: f.url,
        }));
        const { error: insertError } = await supabase.from("bitacora_file").insert(fileRows);
        if (insertError) {
          setSaveError("Error al guardar archivos nuevos.");
          return;
        }
      }

      // 3. Update entry metadata
      const { error: updateError } = await supabase
        .from("bitacora_entry")
        .update({
          date: data.date,
          title: data.title.trim(),
          description: data.description.trim() || null,
        })
        .eq("id", entry.id);

      if (updateError) {
        setSaveError("Error al actualizar la entrada.");
        return;
      }

      // 4. Delete removed files from Supabase + R2
      for (const file of removedFiles) {
        await supabase.from("bitacora_file").delete().eq("id", file.id);
        await deleteFromR2(file.r2_key);
      }

      onSuccess();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {/* Date + Title */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Fecha" required error={errors.date?.message}>
          <input
            type="date"
            className={inputCls(!!errors.date)}
            {...register("date", { required: "Campo requerido" })}
          />
        </Field>
        <Field label="Título" required error={errors.title?.message}>
          <input
            type="text"
            className={inputCls(!!errors.title)}
            {...register("title", {
              required: "Campo requerido",
              minLength: { value: 3, message: "Mínimo 3 caracteres" },
            })}
          />
        </Field>
      </div>

      {/* Description */}
      <Field label="Descripción" error={errors.description?.message}>
        <textarea
          rows={4}
          className={inputCls(false) + " resize-none py-3 leading-relaxed"}
          {...register("description")}
        />
      </Field>

      {/* Existing files */}
      {existingFiles.length > 0 && (
        <Field label="Archivos existentes">
          <div className="flex flex-col gap-1.5">
            {existingFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 border border-[#e8e2dd] bg-white px-3 py-2"
              >
                <Icon icon={fileIcon(file.type)} className="h-5 w-5 shrink-0 text-[#c2bdb6]" />
                <span className="font-manrope flex-1 truncate text-xs text-[#1c1a16]">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeExisting(file)}
                  disabled={saving}
                  className="shrink-0 text-[#c2bdb6] transition-colors hover:text-[#a06658] disabled:opacity-40"
                  title="Quitar archivo"
                >
                  <Icon icon="solar:close-circle-bold" className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          {removedFiles.length > 0 && (
            <p className="font-manrope mt-1 text-xs text-[#a06658]">
              {removedFiles.length} archivo{removedFiles.length !== 1 ? "s" : ""} se eliminarán al
              guardar
            </p>
          )}
        </Field>
      )}

      {/* New files */}
      <Field label="Agregar archivos">
        <FileUploader
          files={newFiles}
          onChange={setNewFiles}
          progress={progress}
          disabled={saving}
        />
        {newFiles.length > 0 && !saving && (
          <p className="font-manrope mt-1 text-xs text-[#9e9890]">
            {newFiles.length} archivo{newFiles.length !== 1 ? "s" : ""} se subirán al guardar
          </p>
        )}
      </Field>

      {saveError && <p className="font-manrope text-xs text-red-500">{saveError}</p>}

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="group font-manrope relative mt-1 flex h-12 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden bg-[#1c1a16] text-sm font-medium tracking-wide text-white transition-all duration-200 hover:bg-[#2e2b24] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.06)_50%,transparent_70%)] transition-transform duration-500 group-hover:translate-x-full" />
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
