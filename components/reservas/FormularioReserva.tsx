"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { ReservaSchema, type ReservaInput } from "@/lib/validations"

const inputClass =
  "w-full bg-transparent border-0 border-b border-burdeos/20 px-0 py-2 text-sm text-carbon placeholder:text-muted-warm/50 " +
  "focus:outline-none focus:border-burdeos transition-colors duration-200"

const labelClass =
  "block text-[10px] tracking-[0.2em] uppercase text-muted-warm mb-1"

export default function FormularioReserva() {
  const t      = useTranslations("reservas")
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReservaInput>({ resolver: zodResolver(ReservaSchema) })

  async function onSubmit(data: ReservaInput) {
    try {
      const res = await fetch("/api/reservas", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...data, personas: Number(data.personas) }),
      })
      if (res.ok) { setStatus("ok"); reset() }
      else          setStatus("error")
    } catch {
      setStatus("error")
    }
  }

  if (status === "ok") {
    return (
      <div className="text-center py-12 px-6 border border-burdeos/15">
        <p
          className="text-2xl font-light italic text-burdeos"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {t("exito")}
        </p>
        <div className="divider-ornamental max-w-[180px] mx-auto mt-4">◆</div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8"
      style={{ fontFamily: "var(--font-josefin), sans-serif" }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="nombre" className={labelClass}>{t("nombre")}</label>
          <input id="nombre" {...register("nombre")} className={inputClass} />
          {errors.nombre?.message && (
            <p className="text-burdeos/70 text-[11px] mt-1">{errors.nombre.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>{t("email")}</label>
          <input id="email" type="email" {...register("email")} className={inputClass} />
          {errors.email?.message && (
            <p className="text-burdeos/70 text-[11px] mt-1">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <label htmlFor="fecha" className={labelClass}>{t("fecha")}</label>
          <input id="fecha" type="date" {...register("fecha")} className={inputClass} />
          {errors.fecha?.message && (
            <p className="text-burdeos/70 text-[11px] mt-1">{errors.fecha.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="hora" className={labelClass}>{t("hora")}</label>
          <input id="hora" type="time" {...register("hora")} className={inputClass} />
          {errors.hora?.message && (
            <p className="text-burdeos/70 text-[11px] mt-1">{errors.hora.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="personas" className={labelClass}>{t("personas")}</label>
          <input
            id="personas"
            type="number"
            min={1}
            max={50}
            {...register("personas")}
            className={inputClass}
          />
          {errors.personas?.message && (
            <p className="text-burdeos/70 text-[11px] mt-1">{errors.personas.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="telefono" className={labelClass}>{t("telefono")}</label>
        <input id="telefono" type="tel" {...register("telefono")} className={inputClass} />
      </div>

      <div>
        <label htmlFor="notas" className={labelClass}>{t("notas")}</label>
        <textarea
          id="notas"
          {...register("notas")}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      {status === "error" && (
        <p className="text-burdeos/70 text-[11px] tracking-wide">{t("error")}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 bg-burdeos text-crema text-[11px] tracking-[0.25em] uppercase hover:bg-burdeos-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "···" : t("enviar")}
      </button>
    </form>
  )
}
