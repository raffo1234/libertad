import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../../../lib/supabase";
import { uploadFiles } from "../../../lib/uploadR2";
import type { UploadProgress } from "../../../lib/uploadR2";
import FileUploader from "./FileUploader";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormValues {
  date: string;
  title: string;
  description: string;
}

interface BitacoraFormProps {
  projectSlug: string;
  userId: string;
  onSuccess: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

export default function BitacoraForm({ projectSlug, userId, onSuccess }: BitacoraFormProps) {
  const [queuedFiles, setQueuedFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { date: today, title: "", description: "" },
  });

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    setSaveError(null);

    try {
      // 1. Upload files to R2 if any
      let uploadedFiles: Awaited<ReturnType<typeof uploadFiles>> = [];

      if (queuedFiles.length > 0) {
        uploadedFiles = await uploadFiles(
          queuedFiles,
          `bitacora/${projectSlug}`,
          (progressList) => {
            const map: Record<string, number> = {};
            progressList.forEach((p) => {
              map[p.file] = p.percent;
            });
            setProgress(map);
          },
        );
      }

      // 2. Insert entry in Supabase
      const { data: entry, error: entryError } = await supabase
        .from("bitacora_entry")
        .insert({
          project_slug: projectSlug,
          date: data.date,
          title: data.title.trim(),
          description: data.description.trim() || null,
          created_by: userId,
        })
        .select()
        .single();

      if (entryError || !entry) {
        setSaveError("Error al guardar la entrada.");
        return;
      }

      // 3. Insert files metadata in Supabase
      if (uploadedFiles.length > 0) {
        const fileRows = uploadedFiles.map((f) => ({
          entry_id: entry.id,
          name: f.name,
          size: f.size,
          type: f.type,
          r2_key: f.r2Key,
          url: f.url,
        }));

        const { error: filesError } = await supabase.from("bitacora_file").insert(fileRows);

        if (filesError) {
          setSaveError("Entrada guardada pero hubo un error con los archivos.");
          return;
        }
      }

      // 4. Reset and notify
      reset({ date: today, title: "", description: "" });
      setQueuedFiles([]);
      setProgress({});
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
            placeholder="Ej: Vaciado de cimientos"
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
          placeholder="Describe las actividades del día…"
          className={inputCls(false) + " resize-none py-3 leading-relaxed"}
          {...register("description")}
        />
      </Field>

      {/* Files */}
      <Field label="Archivos">
        <FileUploader
          files={queuedFiles}
          onChange={setQueuedFiles}
          progress={progress}
          disabled={saving}
        />
        {queuedFiles.length > 0 && !saving && (
          <p className="font-manrope mt-1 text-xs text-[#9e9890]">
            {queuedFiles.length} archivo{queuedFiles.length !== 1 ? "s" : ""} se subirán al guardar
          </p>
        )}
      </Field>

      {saveError && <p className="font-manrope text-xs text-red-500">{saveError}</p>}

      {/* Single submit button */}
      <button
        type="submit"
        disabled={saving}
        className="group font-manrope relative mt-1 flex h-12 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden bg-[#1c1a16] text-sm font-medium tracking-wide text-white transition-all duration-200 hover:bg-[#2e2b24] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.06)_50%,transparent_70%)] transition-transform duration-500 group-hover:translate-x-full" />
        {saving
          ? queuedFiles.length > 0
            ? "Subiendo archivos…"
            : "Guardando…"
          : "Guardar entrada"}
      </button>
    </form>
  );
}
