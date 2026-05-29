import { useForm } from "react-hook-form";
import { supabase } from "../../lib/supabase";
import type { CreateLeadPayload, UnitType } from "../../types/lead";

const UNIT_TYPE_OPTIONS = [
  { value: "type_1", label: "Tipo 1" },
  { value: "type_2", label: "Tipo 2" },
  { value: "type_3", label: "Tipo 3" },
  { value: "type_4", label: "Tipo 4" },
  { value: "parking", label: "Estacionamiento" },
] as const;

const PHONE_REGEX = /^(?:\+?51)?9\d{8}$/;

interface FormValues {
  name: string;
  phone: string;
  email: string;
  unit_type: string;
  notes: string;
}

interface CreateLeadFormProps {
  onSuccess: () => void;
}

export default function CreateLeadForm({ onSuccess }: CreateLeadFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { name: "", phone: "", email: "", unit_type: "", notes: "" },
  });

  const onSubmit = async (data: FormValues) => {
    const payload: CreateLeadPayload = {
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim() || undefined,
      unit_type: (data.unit_type as UnitType) || undefined,
      notes: data.notes.trim() || undefined,
      source: "manual",
    };

    const { error } = await supabase.from("lead").insert(payload);
    if (error) throw new Error(error.message);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {/* Name + Phone */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nombre" required error={errors.name?.message}>
          <input
            type="text"
            placeholder="Nombre completo"
            className={inputCls(!!errors.name)}
            {...register("name", {
              required: "Campo requerido",
              minLength: { value: 2, message: "Mínimo 2 caracteres" },
              pattern: {
                value: /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/,
                message: "Solo letras",
              },
            })}
          />
        </Field>

        <Field label="Celular" required error={errors.phone?.message}>
          <input
            type="tel"
            placeholder="995258491"
            className={inputCls(!!errors.phone)}
            {...register("phone", {
              required: "Campo requerido",
              pattern: {
                value: PHONE_REGEX,
                message: "Celular inválido",
              },
            })}
          />
        </Field>
      </div>

      {/* Email */}
      <Field label="Correo electrónico" error={errors.email?.message}>
        <input
          type="email"
          placeholder="correo@ejemplo.com"
          className={inputCls(!!errors.email)}
          {...register("email", {
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Correo inválido",
            },
          })}
        />
      </Field>

      {/* Unit type */}
      <Field label="Tipo de unidad" error={errors.unit_type?.message}>
        <div className="relative">
          <select
            className={inputCls(!!errors.unit_type) + " cursor-pointer appearance-none pr-10"}
            {...register("unit_type")}
          >
            <option value="">¿Qué te interesa?</option>
            {UNIT_TYPE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[#9e8c7f]"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </Field>

      {/* Notes */}
      <Field label="Notas" error={errors.notes?.message}>
        <textarea
          rows={3}
          placeholder="Contexto adicional del lead…"
          className={inputCls(false) + " resize-none py-3 leading-relaxed"}
          {...register("notes")}
        />
      </Field>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="group font-manrope relative mt-1 flex h-12 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden bg-[#1c1a16] text-sm font-medium tracking-wide text-white transition-all duration-200 hover:bg-[#2e2b24] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.06)_50%,transparent_70%)] transition-transform duration-500 group-hover:translate-x-full" />
        {isSubmitting ? "Guardando…" : "Crear lead"}
      </button>
    </form>
  );
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
  `h-11 w-full border-[1.5px] bg-white px-4 font-manrope text-sm text-[#1c1a16] placeholder-[#c4b5ab] outline-none transition-colors duration-200 focus:border-[#795a45] focus:bg-white ${
    hasError ? "border-red-400" : "border-[#e8e2dd]"
  }`;
