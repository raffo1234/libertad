import type { UnitType, UnitTypeOrEmpty } from "../../constants/unitTypes";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import CircleArrow from "../CircleArrow";

export const UNIT_TYPES = {
  type_1: "Tipo 1",
  type_2: "Tipo 2",
  type_3: "Tipo 3",
  type_4: "Tipo 4",
  parking: "Estacionamiento",
} as const;

interface LeadModalProps {
  type?: UnitType;
}

interface LeadFormValues {
  name: string;
  phone: string;
  email: string;
  unit_type: UnitTypeOrEmpty;
}

const PHONE_REGEX = /^(?:\+?51)?9\d{8}$/;

export default function LeadModal({ type }: LeadModalProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      unit_type: type ?? "",
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && handleClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function handleClose() {
    setOpen(false);
    setTimeout(() => {
      setSuccess(false);
      reset({ name: "", phone: "", email: "", unit_type: type ?? "" });
    }, 400);
  }

  async function onSubmit(data: LeadFormValues) {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email.trim() || undefined,
        unit_type: data.unit_type || undefined,
      }),
    });

    if (!res.ok) throw new Error("Error al enviar");

    setSuccess(true);
    setTimeout(handleClose, 2800);
  }

  const modal = (
    <div
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-md transition-opacity duration-350 ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <div
        className={`w-full max-w-[600px] overflow-hidden rounded-[50px] border-8 border-[#E0DDD8] bg-[#EAE8E4] transition-all duration-450 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"}`}
      >
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-[#e5e0dc]" />

        {!success ? (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-6 px-7 pt-7">
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#EAE8E4] px-3 py-1 text-[11px] font-semibold tracking-wider text-[#795a45]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#795a45]" />
                Galvez 1519 · El Tambo
              </span>
              <h2 className="text-2xl font-semibold">
                Asesor&iacute;a
                <br />
                Personalizada
              </h2>
              <p className="mt-1.5 text-sm text-[#807357]">Compra tu depa</p>
            </div>

            <div className="flex flex-col gap-7 p-7">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nombre" required error={errors.name?.message}>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    className={inputCls(!!errors.name)}
                    {...register("name", {
                      required: "Campo requerido",
                      minLength: { value: 2, message: "Mínimo 2 caracteres" },
                      pattern: {
                        value: /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/,
                        message: "Solo letras, sin números ni caracteres especiales",
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
                        message: "Celular inválido (ej. 995258491)",
                      },
                    })}
                  />
                </Field>
              </div>

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

              <Field label="Tipo de unidad" error={errors.unit_type?.message}>
                <div className="relative">
                  <select
                    className={
                      inputCls(!!errors.unit_type) + " cursor-pointer appearance-none pr-10"
                    }
                    {...register("unit_type")}
                  >
                    <option value="">¿Qué te interesa?</option>
                    {Object.entries(UNIT_TYPES).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[#9e8c7f]"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </Field>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative mt-1 flex h-16 w-full cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-full bg-amber-700 font-semibold tracking-wide text-white transition-[transform,background] duration-200 hover:scale-[1.015] hover:bg-amber-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.12)_50%,transparent_70%)] transition-transform duration-500 group-hover:translate-x-full" />
                {isSubmitting ? "Enviando…" : "Quiero que me contacten"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 px-7 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f3ede8]">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#795a45"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="font-manrope text-xl font-semibold text-[#1a1008]">
              ¡Gracias, te llamamos pronto!
            </h3>
            <p className="text-sm leading-relaxed text-[#9e8c7f]">
              Recibimos tu solicitud.
              <br />
              Un asesor de Galvez 1519 te contactará a la brevedad.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setOpen(true)}>
        <CircleArrow isDark />
      </button>
      {mounted && createPortal(modal, document.body)}
    </>
  );
}

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
      <label className="text-[11px] font-semibold tracking-widest text-[#9e8c7f] uppercase">
        {label}
        {required && <span className="ml-0.5 text-[#795a45]">*</span>}
      </label>
      {children}
      {error && <span className="text-[11px] text-red-500">{error}</span>}
    </div>
  );
}

const inputCls = (error: boolean) =>
  `h-12 w-full rounded-2xl border-[1.5px] bg-[#faf8f6] px-4 text-[15px] text-[#1a1008] placeholder-[#c4b5ab] outline-none transition-colors duration-200 focus:border-[#795a45] focus:bg-white ${error ? "border-red-400" : "border-[#e8e2dd]"}`;
