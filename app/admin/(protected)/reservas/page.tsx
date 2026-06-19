"use client"
import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import type { Reserva } from "@/lib/supabase/types"

const estadoColors: Record<Reserva["estado"], string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  confirmada: "bg-green-100 text-green-800",
  cancelada: "bg-red-100 text-red-800",
}

export default function AdminReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([])

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from("reservas").select("*").order("fecha", { ascending: true }).order("hora")
    setReservas(data ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  async function updateEstado(id: string, estado: Reserva["estado"]) {
    const supabase = createClient()
    await supabase.from("reservas").update({ estado }).eq("id", id)
    load()
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-gray-800 mb-6">Reservas</h1>
      <div className="space-y-3">
        {reservas.map((r) => (
          <div key={r.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-800">{r.nombre}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoColors[r.estado]}`}>{r.estado}</span>
                </div>
                <p className="text-sm text-gray-500">{r.fecha} · {r.hora} · {r.personas} personas</p>
                <p className="text-sm text-gray-400">{r.email}{r.telefono ? ` · ${r.telefono}` : ""}</p>
                {r.notas && <p className="text-sm text-gray-400 mt-1 italic">"{r.notas}"</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {r.estado !== "confirmada" && (
                  <Button size="sm" className="bg-green-600 text-white h-8 text-xs" onClick={() => updateEstado(r.id, "confirmada")}>Confirmar</Button>
                )}
                {r.estado !== "cancelada" && (
                  <Button size="sm" variant="outline" className="h-8 text-xs text-red-500 border-red-200" onClick={() => updateEstado(r.id, "cancelada")}>Cancelar</Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {reservas.length === 0 && <p className="text-gray-400 text-sm">No hay reservas aún.</p>}
      </div>
    </div>
  )
}
