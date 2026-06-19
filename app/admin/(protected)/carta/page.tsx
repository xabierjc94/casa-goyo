"use client"

import { useState, useCallback, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import FormPlato from "@/components/admin/FormPlato"
import ListaPlatos from "@/components/admin/ListaPlatos"
import type { Plato, Seccion } from "@/lib/supabase/types"

export default function AdminCartaPage() {
  const [secciones, setSecciones] = useState<Seccion[]>([])
  const [platos, setPlatos] = useState<Plato[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const [seccionesResult, platosResult] = await Promise.all([
        supabase.from("secciones").select("*").order("orden"),
        supabase.from("platos").select("*").order("orden"),
      ])
      if (seccionesResult.error) throw seccionesResult.error
      if (platosResult.error) throw platosResult.error
      setSecciones(seccionesResult.data || [])
      setPlatos(platosResult.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Error al cargar los datos")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData, refreshKey])

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-burdeos mb-2">Gestión de Carta</h1>
          <p className="text-carbon/60">Añade, edita o elimina platos del menú</p>
        </div>
        <Button onClick={() => setIsFormDialogOpen(true)} className="bg-burdeos hover:bg-burdeos-dark text-crema flex items-center gap-2">
          <Plus size={20} /> Añadir Plato
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-carbon/60">Cargando datos...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-md border border-dorado/20 p-4">
              <p className="text-carbon/60 text-sm">Total de Platos</p>
              <p className="text-3xl font-bold text-burdeos">{platos.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md border border-dorado/20 p-4">
              <p className="text-carbon/60 text-sm">Platos Activos</p>
              <p className="text-3xl font-bold text-green-600">{platos.filter((p) => p.activo).length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md border border-dorado/20 p-4">
              <p className="text-carbon/60 text-sm">Secciones</p>
              <p className="text-3xl font-bold text-dorado">{secciones.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-burdeos mb-6">Platos del Menú</h2>
            <ListaPlatos platos={platos} secciones={secciones} onRefresh={() => setRefreshKey((prev) => prev + 1)} />
          </div>
        </>
      )}

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Plato</DialogTitle>
          </DialogHeader>
          <FormPlato
            secciones={secciones}
            onSaved={() => { setIsFormDialogOpen(false); setRefreshKey((prev) => prev + 1) }}
            onCancel={() => setIsFormDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
