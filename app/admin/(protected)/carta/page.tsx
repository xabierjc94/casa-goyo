"use client"

import { useState, useCallback, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, BookOpen, Eye, EyeOff, LayoutList } from "lucide-react"
import { toast } from "sonner"
import FormPlato from "@/components/admin/FormPlato"
import ListaPlatos from "@/components/admin/ListaPlatos"
import type { Plato, Seccion } from "@/lib/supabase/types"

export default function AdminCartaPage() {
  const [secciones, setSecciones]           = useState<Seccion[]>([])
  const [platos, setPlatos]                 = useState<Plato[]>([])
  const [isLoading, setIsLoading]           = useState(true)
  const [isFormDialogOpen, setIsFormDialog] = useState(false)
  const [refreshKey, setRefreshKey]         = useState(0)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const [seccionesResult, platosResult] = await Promise.all([
        supabase.from("secciones").select("*").order("orden"),
        supabase.from("platos").select("*").order("orden"),
      ])
      if (seccionesResult.error) throw seccionesResult.error
      if (platosResult.error)   throw platosResult.error
      setSecciones(seccionesResult.data || [])
      setPlatos(platosResult.data || [])
    } catch {
      toast.error("Error al cargar los datos")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData, refreshKey])

  const stats = [
    { label: "Total Platos",   value: platos.length,                          icon: BookOpen,   accent: "#7B1527" },
    { label: "Activos",        value: platos.filter((p) => p.activo).length,  icon: Eye,        accent: "#B8870B" },
    { label: "Inactivos",      value: platos.filter((p) => !p.activo).length, icon: EyeOff,     accent: "#7B1527" },
    { label: "Secciones",      value: secciones.length,                       icon: LayoutList,  accent: "#B8870B" },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <BookOpen size={13} className="text-dorado/60" />
            <span className="text-[10px] tracking-[0.35em] uppercase text-dorado/70"
              style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
              Gestión
            </span>
          </div>
          <h1 className="text-4xl font-light italic text-carbon mb-4"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
            Carta del Menú
          </h1>
          <div className="h-px bg-gradient-to-r from-burdeos/30 via-dorado/20 to-transparent w-48" />
        </div>

        <button
          onClick={() => setIsFormDialog(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-carbon text-crema text-[10px] tracking-[0.2em] uppercase rounded-sm hover:bg-carbon-soft transition-colors mt-1"
          style={{ fontFamily: "var(--font-josefin), sans-serif" }}
        >
          <Plus size={13} /> Añadir Plato
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <p className="text-[11px] tracking-[0.25em] uppercase text-muted-warm/50"
            style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
            Cargando···
          </p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map(({ label, value, icon: Icon, accent }) => (
              <div key={label}
                className="relative bg-carbon rounded-sm overflow-hidden"
                style={{ boxShadow: "0 2px 16px rgba(26,10,10,0.10)" }}>
                <div className="h-px" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
                <div className="p-4">
                  <div className="w-7 h-7 rounded-sm flex items-center justify-center mb-4"
                    style={{ background: `${accent}22`, border: `1px solid ${accent}33` }}>
                    <Icon size={13} style={{ color: accent }} />
                  </div>
                  <p className="text-3xl font-light text-crema leading-none mb-1"
                    style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
                    {value}
                  </p>
                  <p className="text-[9px] tracking-[0.18em] uppercase text-crema/35"
                    style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Dish list */}
          <div className="bg-white border border-dorado/12 rounded-sm">
            <div className="px-6 py-4 border-b border-dorado/10 flex items-center gap-3">
              <LayoutList size={13} className="text-dorado/50" />
              <p className="text-[10px] tracking-[0.25em] uppercase text-muted-warm"
                style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
                Platos del Menú
              </p>
            </div>
            <div className="p-6">
              <ListaPlatos
                platos={platos}
                secciones={secciones}
                onRefresh={() => setRefreshKey((prev) => prev + 1)}
              />
            </div>
          </div>
        </>
      )}

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialog}>
        <DialogContent className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Plato</DialogTitle>
          </DialogHeader>
          <FormPlato
            secciones={secciones}
            onSaved={() => { setIsFormDialog(false); setRefreshKey((prev) => prev + 1) }}
            onCancel={() => setIsFormDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
