"use client"

import { useState, useCallback } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
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
import { Pencil, Trash2, ToggleLeft, ToggleRight, GripVertical } from "lucide-react"
import { toast } from "sonner"
import FormPlato from "./FormPlato"
import type { Plato, Seccion } from "@/lib/supabase/types"
import { formatPrecio, ALERGENOS_LABELS } from "@/lib/utils"

// ─── Sortable card ────────────────────────────────────────────────────────────

interface SortablePlatoItemProps {
  plato: Plato
  secciones: Seccion[]
  isTogglingId: string | null
  onEdit: (plato: Plato) => void
  onDelete: (id: string) => void
  onToggle: (id: string, currentActive: boolean) => void
}

function SortablePlatoItem({
  plato,
  secciones,
  isTogglingId,
  onEdit,
  onDelete,
  onToggle,
}: SortablePlatoItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: plato.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
    position: isDragging ? ("relative" as const) : undefined,
  }

  const getSectionName = (slug: string) =>
    secciones.find((s) => s.slug === slug)?.nombre_es ?? slug

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border border-dorado/20 overflow-hidden shadow-sm transition-shadow ${
        isDragging ? "shadow-lg ring-2 ring-burdeos/30" : "hover:shadow-md"
      } ${!plato.activo ? "opacity-50" : ""}`}
    >
      <div className="flex">
        {/* Drag handle */}
        <button
          type="button"
          className="flex items-center justify-center w-9 flex-shrink-0 cursor-grab active:cursor-grabbing text-carbon/30 hover:text-burdeos/60 transition-colors touch-none"
          aria-label="Arrastrar para reordenar"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} />
        </button>

        {/* Thumbnail */}
        <div className="w-28 h-28 flex-shrink-0 bg-crema self-center">
          {plato.foto_url ? (
            <img
              src={plato.foto_url}
              alt={plato.nombre_es}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-carbon/30 text-xs">
              Sin imagen
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="min-w-0">
              <h3 className="font-semibold text-carbon truncate">
                {plato.nombre_es}
                {plato.nombre_en && (
                  <span className="ml-2 text-sm font-normal text-carbon/50">
                    / {plato.nombre_en}
                  </span>
                )}
              </h3>
              <p className="text-xs text-carbon/50">{getSectionName(plato.seccion_slug)}</p>
            </div>
            <span className="text-base font-bold text-burdeos whitespace-nowrap">
              {formatPrecio(plato.precio)}
            </span>
          </div>

          {plato.descripcion_es && (
            <p className="text-sm text-carbon/60 mb-2 line-clamp-1">{plato.descripcion_es}</p>
          )}

          <div className="flex flex-wrap gap-1 mb-3">
            {plato.es_vegano && (
              <Badge variant="secondary" className="bg-green-50 text-green-700 text-[10px]">
                Vegano
              </Badge>
            )}
            {plato.sin_gluten && (
              <Badge variant="secondary" className="bg-amber-50 text-amber-700 text-[10px]">
                Sin Gluten
              </Badge>
            )}
            {plato.alergenos.slice(0, 4).map((a) => (
              <Badge key={a} variant="outline" className="bg-crema text-carbon/60 text-[10px]">
                {ALERGENOS_LABELS[a]?.es ?? a}
              </Badge>
            ))}
            {plato.alergenos.length > 4 && (
              <Badge variant="outline" className="bg-crema text-carbon/60 text-[10px]">
                +{plato.alergenos.length - 4}
              </Badge>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onToggle(plato.id, plato.activo)}
              disabled={isTogglingId === plato.id}
              className="flex items-center gap-1 h-7 text-xs"
            >
              {plato.activo ? (
                <><ToggleRight size={14} /> Activo</>
              ) : (
                <><ToggleLeft size={14} /> Inactivo</>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(plato)}
              className="flex items-center gap-1 h-7 text-xs"
            >
              <Pencil size={14} /> Editar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(plato.id)}
              className="flex items-center gap-1 h-7 text-xs"
            >
              <Trash2 size={14} /> Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ListaPlatosProps {
  platos: Plato[]
  secciones: Seccion[]
  onRefresh?: () => void
}

export default function ListaPlatos({ platos: initialPlatos, secciones, onRefresh }: ListaPlatosProps) {
  const [platos, setPlatos] = useState<Plato[]>(initialPlatos)
  const [editingPlato, setEditingPlato] = useState<Plato | null>(null)
  const [deletingPlatoId, setDeletingPlatoId] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null)
  const [isSavingOrder, setIsSavingOrder] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = platos.findIndex((p) => p.id === active.id)
      const newIndex = platos.findIndex((p) => p.id === over.id)
      const reordered = arrayMove(platos, oldIndex, newIndex)

      setPlatos(reordered) // optimistic

      setIsSavingOrder(true)
      try {
        const supabase = createClient()
        const updates = reordered.map((p, i) =>
          supabase.from("platos").update({ orden: i + 1 }).eq("id", p.id)
        )
        const results = await Promise.all(updates)
        const failed = results.find((r) => r.error)
        if (failed?.error) throw new Error(failed.error.message)
      } catch (err) {
        toast.error("Error al guardar el orden")
        setPlatos(platos) // rollback
        console.error(err)
      } finally {
        setIsSavingOrder(false)
      }
    },
    [platos]
  )

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
      if (error) throw new Error(error.message)
      setPlatos((prev) => prev.filter((p) => p.id !== deletingPlatoId))
      toast.success("Plato eliminado correctamente")
      onRefresh?.()
    } catch (error) {
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
      if (error) throw new Error(error.message)
      setPlatos((prev) => prev.map((p) => (p.id === platoId ? { ...p, activo: !currentActive } : p)))
      toast.success(currentActive ? "Plato desactivado" : "Plato activado")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar el plato")
    } finally {
      setIsTogglingId(null)
    }
  }

  const handleFormSuccess = async () => {
    handleCloseEditDialog()
    onRefresh?.()
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("platos").select("*").order("orden")
      if (error) throw error
      setPlatos(data ?? [])
    } catch (error) {
      console.error("Error refreshing platos:", error)
    }
  }

  return (
    <>
      {/* Order hint */}
      <p className="text-xs text-carbon/40 mb-3 flex items-center gap-1.5">
        <GripVertical size={13} className="inline" />
        Arrastra el icono izquierdo para reordenar. El orden se guarda automáticamente.
        {isSavingOrder && <span className="text-dorado ml-1">Guardando…</span>}
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={platos.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid gap-3">
            {platos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-carbon/60">
                  No hay platos aún. Crea el primer plato para comenzar.
                </p>
              </div>
            ) : (
              platos.map((plato) => (
                <SortablePlatoItem
                  key={plato.id}
                  plato={plato}
                  secciones={secciones}
                  isTogglingId={isTogglingId}
                  onEdit={handleEditPlato}
                  onDelete={handleDeleteClick}
                  onToggle={handleToggleActive}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Plato</DialogTitle>
          </DialogHeader>
          {editingPlato && (
            <FormPlato
              plato={editingPlato}
              secciones={secciones}
              onSaved={handleFormSuccess}
              onCancel={handleCloseEditDialog}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Eliminar Plato</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar este plato? Esta acción no se puede deshacer.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
