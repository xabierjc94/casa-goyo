"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { ReservaSchema, type ReservaInput } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function FormularioReserva() {
  const t = useTranslations("reservas")
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReservaInput>({
    resolver: zodResolver(ReservaSchema),
  })

  async function onSubmit(data: ReservaInput) {
    try {
      // Ensure personas is a number
      const formData = {
        ...data,
        personas: Number(data.personas),
      }

      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setStatus("ok")
        reset()
      } else {
        setStatus("error")
      }
    } catch (error) {
      setStatus("error")
    }
  }

  if (status === "ok") {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-6 text-center">
        <p className="font-serif text-xl">{t("exito")}</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 bg-white rounded-2xl p-6 shadow-sm border border-dorado/10"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nombre">{t("nombre")}</Label>
          <Input id="nombre" {...register("nombre")} className="mt-1" />
          {errors.nombre?.message && (
            <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            className="mt-1"
          />
          {errors.email?.message && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="fecha">{t("fecha")}</Label>
          <Input id="fecha" type="date" {...register("fecha")} className="mt-1" />
          {errors.fecha?.message && (
            <p className="text-red-500 text-xs mt-1">{errors.fecha.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="hora">{t("hora")}</Label>
          <Input id="hora" type="time" {...register("hora")} className="mt-1" />
          {errors.hora?.message && (
            <p className="text-red-500 text-xs mt-1">{errors.hora.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="personas">{t("personas")}</Label>
          <Input
            id="personas"
            type="number"
            min={1}
            max={50}
            {...register("personas")}
            className="mt-1"
          />
          {errors.personas?.message && (
            <p className="text-red-500 text-xs mt-1">{errors.personas.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="telefono">{t("telefono")}</Label>
        <Input
          id="telefono"
          type="tel"
          {...register("telefono")}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="notas">{t("notas")}</Label>
        <Textarea
          id="notas"
          {...register("notas")}
          className="mt-1"
          rows={3}
        />
      </div>

      {status === "error" && (
        <p className="text-red-500 text-sm">{t("error")}</p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-burdeos hover:bg-burdeos-dark text-crema"
      >
        {isSubmitting ? "..." : t("enviar")}
      </Button>
    </form>
  )
}
