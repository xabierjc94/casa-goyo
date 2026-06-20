"use client"
import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { CalendarDays, Clock, Users, Mail, Phone, MessageSquare, Check, X } from "lucide-react"
import type { Reserva } from "@/lib/supabase/types"

const ESTADO_STYLE: Record<Reserva["estado"], { label: string; class: string }> = {
  pendiente:  { label: "Pendiente",  class: "text-dorado   border-dorado/30   bg-dorado/8"   },
  confirmada: { label: "Confirmada", class: "text-green-700 border-green-200   bg-green-50"  },
  cancelada:  { label: "Cancelada",  class: "text-burdeos  border-burdeos/25  bg-burdeos/5" },
}

type Tab = "todas" | Reserva["estado"]

export default function AdminReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [tab, setTab] = useState<Tab>("pendiente")

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("reservas")
      .select("*")
      .order("fecha", { ascending: true })
      .order("hora")
    setReservas(data ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  async function updateEstado(id: string, estado: Reserva["estado"]) {
    const supabase = createClient()
    await supabase.from("reservas").update({ estado }).eq("id", id)
    load()
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "pendiente",  label: "Pendientes"  },
    { key: "confirmada", label: "Confirmadas" },
    { key: "cancelada",  label: "Canceladas"  },
    { key: "todas",      label: "Todas"       },
  ]

  const filtered = tab === "todas" ? reservas : reservas.filter((r) => r.estado === tab)
  const counts = {
    pendiente:  reservas.filter((r) => r.estado === "pendiente").length,
    confirmada: reservas.filter((r) => r.estado === "confirmada").length,
    cancelada:  reservas.filter((r) => r.estado === "cancelada").length,
  }

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <CalendarDays size={13} className="text-dorado/60" />
          <span className="text-[10px] tracking-[0.35em] uppercase text-dorado/70"
            style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
            Gestión
          </span>
        </div>
        <h1 className="text-4xl font-light italic text-carbon mb-4"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
          Reservas
        </h1>
        <div className="h-px bg-gradient-to-r from-burdeos/30 via-dorado/20 to-transparent w-48" />
      </div>

      {/* Tab filters */}
      <div className="flex items-center gap-1 mb-6 border-b border-dorado/10">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative px-4 py-2.5 text-[10px] tracking-[0.2em] uppercase transition-colors duration-200 ${
              tab === key
                ? "text-burdeos"
                : "text-muted-warm hover:text-carbon"
            }`}
            style={{ fontFamily: "var(--font-josefin), sans-serif" }}
          >
            {label}
            {key !== "todas" && counts[key as Reserva["estado"]] > 0 && (
              <span className="ml-1.5 text-[9px] text-dorado/60">
                ({counts[key as Reserva["estado"]]})
              </span>
            )}
            {tab === key && (
              <span className="absolute bottom-0 left-0 right-0 h-px bg-burdeos" />
            )}
          </button>
        ))}
      </div>

      {/* Reservations list */}
      <div className="space-y-3">
        {filtered.map((r) => {
          const estado = ESTADO_STYLE[r.estado]
          return (
            <div key={r.id}
              className="bg-white border border-dorado/12 rounded-sm overflow-hidden hover:border-dorado/25 hover:shadow-[0_2px_16px_rgba(123,21,39,0.05)] transition-all duration-300">
              <div className="flex items-start gap-6 p-5">

                {/* Left: info */}
                <div className="flex-1 min-w-0 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <p className="text-[15px] font-light text-carbon"
                      style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
                      {r.nombre}
                    </p>
                    <span className={`text-[9px] tracking-[0.18em] uppercase px-2 py-0.5 border rounded-sm ${estado.class}`}
                      style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
                      {estado.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-warm"
                      style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
                      <CalendarDays size={11} className="text-dorado/50" />
                      {r.fecha}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-warm"
                      style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
                      <Clock size={11} className="text-dorado/50" />
                      {r.hora}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-warm"
                      style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
                      <Users size={11} className="text-dorado/50" />
                      {r.personas} personas
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-warm"
                      style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
                      <Mail size={11} className="text-dorado/50" />
                      {r.email}
                    </span>
                    {r.telefono && (
                      <span className="flex items-center gap-1.5 text-[11px] text-muted-warm"
                        style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
                        <Phone size={11} className="text-dorado/50" />
                        {r.telefono}
                      </span>
                    )}
                  </div>

                  {r.notas && (
                    <p className="flex items-start gap-1.5 text-[11px] text-carbon/40 italic"
                      style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
                      <MessageSquare size={11} className="mt-0.5 shrink-0 text-dorado/30" />
                      {r.notas}
                    </p>
                  )}
                </div>

                {/* Right: actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  {r.estado !== "confirmada" && (
                    <button
                      onClick={() => updateEstado(r.id, "confirmada")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-carbon text-crema text-[10px] tracking-[0.15em] uppercase rounded-sm hover:bg-carbon-soft transition-colors"
                      style={{ fontFamily: "var(--font-josefin), sans-serif" }}
                    >
                      <Check size={11} /> Confirmar
                    </button>
                  )}
                  {r.estado !== "cancelada" && (
                    <button
                      onClick={() => updateEstado(r.id, "cancelada")}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-burdeos/20 text-burdeos text-[10px] tracking-[0.15em] uppercase rounded-sm hover:bg-burdeos/5 transition-colors"
                      style={{ fontFamily: "var(--font-josefin), sans-serif" }}
                    >
                      <X size={11} /> Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 border border-dashed border-dorado/15 rounded-sm">
            <p className="text-[11px] tracking-[0.2em] uppercase text-muted-warm/60"
              style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
              No hay reservas {tab !== "todas" ? `${tab}s` : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
