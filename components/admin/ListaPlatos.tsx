"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { toast } from "sonner"
import FormPlato from "./FormPlato"
import type { Plato, Seccion } from "@/lib/supabase/types"
import { formatPrecio, ALERGENOS_LABELS } from "@/lib/utils"

interface ListaPlatosProps {
  platos: Plato[]
  secciones: Seccion[]
  onPlatosChange?: () => void
}

export default function ListaPlatos({ platos: initialPlatos, secciones, onPlatosChange }: ListaPlatosProps) {
  const [platos, setPlatos] = useState<Plato[]>(initialPlatos)
  const [editingPlato, setEditingPlato] = useState<Plato | null>(null)
  const [deletingPlatoId, setDeletingPlatoId] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null)

  const handleEditPlato = useCallback((plato: Plato) => {
    setEditingPlato(plato)
    setIsEditDialogOpen(true)
  }, [])

  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false)
    setEditingPlato(null)
  }, [])

  const handleDeleteClick = useCallback((platoId: string) => {
    setDeletingPlatoId(platoId)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleConfirmDelete = async () => {
    if (!deletingPlatoId) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("platos").delete().eq("id", deletingPlatoId)

      if (error) throw new Error(`Error deleting plato: ${error.message}`)

      // Update local state
      setPlatos((prev) => prev.filter((p) => p.id !== deletingPlatoId))
      toast.success("Plato eliminado correctamente")
      onPlatosChange?.()
    } catch (error) {
      console.error("Delete error:", error)
      toast.error(error instanceof Error ? error.message : "Error al eliminar el plato")
    } finally {
      setIsDeleteDialogOpen(false)
      setDeletingPlatoId(null)
    }
  }

  const handleToggleActive = async (platoId: string, currentActive: boolean) => {
    setIsTogglingId(platoId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("platos")
        .update({ activo: !currentActive })
        .eq("id", platoId)

      if (error) throw new Error(`Error updating plato: ${error.message}`)

      // Update local state
      setPlatos((prev) =>
        prev.map((p) => (p.id === platoId ? { ...p, activo: !currentActive } : p))
      )
      toast.success(currentActive ? "Plato desactivado" : "Plato activado")
    } catch (error) {
      console.error("Toggle error:", error)
      toast.error(error instanceof Error ? error.message : "Error al actualizar el plato")
    } finally {
      setIsTogglingId(null)
    }
  }

  const handleFormSuccess = async () => {
    handleCloseEditDialog()
    onPlatosChange?.()

    // Refresh platos list
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("platos")
        .select("*")
        .order("orden")

      if (error) throw error
      setPlatos(data || [])
    } catch (error) {
      console.error("Error refreshing platos:", error)
    }
  }

  const getSectionName = (slug: string) => {
    const section = secciones.find((s) => s.slug === slug)
    return section?.nombre_es || slug
  }

  return (
    <>
      {/* List View */}
      <div className="grid gap-4">
        {platos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-carbon/60">No hay platos aún. Crea el primer plato para comenzar.</p>
          </div>
        ) : (
          platos.map((plato) => (
            <div
              key={plato.id}
              className={`bg-white rounded-lg border border-dorado/20 overflow-hidden hover:shadow-md transition-all ${
                !plato.activo ? "opacity-50" : ""
              }`}
            >
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="w-full md:w-32 h-32 flex-shrink-0 bg-gray-100">
                  {plato.foto_url ? (
                    <img
                      src={plato.foto_url}
                      alt={plato.nombre_es}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-crema text-carbon/40 text-sm">
                      Sin imagen
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-carbon">
                        {plato.nombre_es}
                        {plato.nombre_en && (
                          <span className="ml-2 text-sm font-normal text-carbon/60">
                            / {plato.nombre_en}
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-carbon/60">{getSectionName(plato.seccion_slug)}</p>
                    </div>
                    <span className="text-lg font-bold text-burdeos whitespace-nowrap ml-4">
                      {formatPrecio(plato.precio)}
                    </span>
                  </div>

                  {plato.descripcion_es && (
                    <p className="text-sm text-carbon/70 mb-3 line-clamp-2">{plato.descripcion_es}</p>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {plato.es_vegano && (
                      <Badge variant="secondary" className="bg-green-50 text-green-700">
                        Vegano
                      </Badge>
                    )}
                    {plato.sin_gluten && (
                      <Badge variant="secondary" className="bg-amber-50 text-amber-700">
                        Sin Gluten
                      </Badge>
                    )}
                    {plato.alergenos.map((alergeno) => (
                      <Badge key={alergeno} variant="outline" className="bg-crema text-carbon/70">
                        {ALERGENOS_LABELS[alergeno]?.es || alergeno}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(plato.id, plato.activo)}
                      disabled={isTogglingId === plato.id}
                      className="flex items-center gap-1"
                    >
                      {plato.activo ? (
                        <>
                          <ToggleRight size={16} /> Activo
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={16} /> Inactivo
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditPlato(plato)}
                      className="flex items-center gap-1"
                    >
                      <Pencil size={16} /> Editar
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteClick(plato.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 size={16} /> Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlato ? "Editar Plato" : "Nuevo Plato"}
            </DialogTitle>
          </DialogHeader>
          {editingPlato && (
            <FormPlato
              plato={editingPlato}
              secciones={secciones}
              onSuccess={handleFormSuccess}
              onCancel={handleCloseEditDialog}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Eliminar Plato</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar este plato? Esta acción no se puede deshacer.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
