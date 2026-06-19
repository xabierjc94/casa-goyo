"use client"

import { useState, useCallback } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Upload, X } from "lucide-react"
import type { Plato, Seccion } from "@/lib/supabase/types"
import { ALERGENOS_LABELS } from "@/lib/utils"
import { PlatoSchema, type PlatoInput } from "@/lib/validations"
import type { z } from "zod"

// Raw form values — z.coerce.number() has unknown input type; use output for RHF defaults
type PlatoFormValues = z.output<typeof PlatoSchema>

interface FormPlatoProps {
  secciones: Seccion[]
  plato?: Plato
  onSaved?: () => void
  onCancel?: () => void
}

const ALERGENO_LIST = Object.keys(ALERGENOS_LABELS)

export default function FormPlato({ secciones, plato, onSaved, onCancel }: FormPlatoProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(plato?.foto_url || null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedAlergenos, setSelectedAlergenos] = useState<string[]>(plato?.alergenos || [])
  const [customAlergeno, setCustomAlergeno] = useState("")

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PlatoFormValues>({
    resolver: zodResolver(PlatoSchema) as never,
    mode: "onBlur",
    defaultValues: plato
      ? {
          nombre_es: plato.nombre_es,
          nombre_en: plato.nombre_en,
          descripcion_es: plato.descripcion_es || "",
          descripcion_en: plato.descripcion_en || "",
          precio: plato.precio,
          seccion_slug: plato.seccion_slug,
          es_vegano: plato.es_vegano,
          sin_gluten: plato.sin_gluten,
          activo: plato.activo,
          alergenos: plato.alergenos || [],
        }
      : {
          es_vegano: false,
          sin_gluten: false,
          activo: true,
          alergenos: [],
        },
  })

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen debe ser menor a 5MB")
      return
    }

    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleAlergenaToggle = useCallback((alergeno: string) => {
    setSelectedAlergenos((prev) => {
      return prev.includes(alergeno) ? prev.filter((a) => a !== alergeno) : [...prev, alergeno]
    })
  }, [])

  const handleAddCustomAlergeno = useCallback(() => {
    const trimmed = customAlergeno.trim()
    if (!trimmed || selectedAlergenos.includes(trimmed)) return
    setSelectedAlergenos((prev) => [...prev, trimmed])
    setCustomAlergeno("")
  }, [customAlergeno, selectedAlergenos])

  const removeImage = useCallback(() => {
    setImagePreview(null)
    setSelectedFile(null)
  }, [])

  const onSubmit = async (data: PlatoInput) => {
    setIsSubmitting(true)
    try {
      const supabase = createClient()

      let fotoUrl = plato?.foto_url || null

      // Handle image upload if a new file was selected
      if (selectedFile) {
        setUploading(true)
        const ext = selectedFile.name.split(".").pop()
        const path = `platos/${Date.now()}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("imagenes")
          .upload(path, selectedFile, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          throw new Error(`Error uploading image: ${uploadError.message}`)
        }

        // Get public URL
        const { data: publicData } = supabase.storage.from("imagenes").getPublicUrl(uploadData.path)
        fotoUrl = publicData.publicUrl
        setUploading(false)
      }

      // Prepare plato data
      const platoData = {
        nombre_es: data.nombre_es.trim(),
        nombre_en: data.nombre_en.trim(),
        descripcion_es: data.descripcion_es?.trim() || null,
        descripcion_en: data.descripcion_en?.trim() || null,
        precio: data.precio,
        seccion_slug: data.seccion_slug,
        alergenos: selectedAlergenos,
        es_vegano: data.es_vegano,
        sin_gluten: data.sin_gluten,
        activo: data.activo,
        foto_url: fotoUrl,
      }

      if (plato) {
        // Update existing plato
        const { error } = await supabase.from("platos").update(platoData).eq("id", plato.id)

        if (error) throw new Error(`Error updating plato: ${error.message}`)
        toast.success("Plato actualizado correctamente")
      } else {
        // Create new plato
        const { error } = await supabase.from("platos").insert([platoData])

        if (error) throw new Error(`Error creating plato: ${error.message}`)
        toast.success("Plato creado correctamente")
      }

      onSaved?.()
    } catch (error) {
      console.error("Form submission error:", error)
      toast.error(error instanceof Error ? error.message : "Error al guardar el plato")
    } finally {
      setIsSubmitting(false)
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Section Selection */}
      <div className="space-y-2">
        <Label htmlFor="seccion_slug">Sección</Label>
        <Controller
          name="seccion_slug"
          control={control}
          render={({ field }) => (
            <Select value={field.value || ""} onValueChange={field.onChange}>
              <SelectTrigger id="seccion_slug">
                <SelectValue placeholder="Selecciona una sección" />
              </SelectTrigger>
              <SelectContent>
                {secciones.map((seccion) => (
                  <SelectItem key={seccion.slug} value={seccion.slug}>
                    {seccion.nombre_es}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.seccion_slug && <p className="text-sm text-red-500">{errors.seccion_slug.message}</p>}
      </div>

      {/* Bilingual Names */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre_es">Nombre ES</Label>
          <Input id="nombre_es" {...register("nombre_es")} placeholder="Nombre en español" />
          {errors.nombre_es && <p className="text-sm text-red-500">{errors.nombre_es.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="nombre_en">Name EN</Label>
          <Input id="nombre_en" {...register("nombre_en")} placeholder="Name in English" />
          {errors.nombre_en && <p className="text-sm text-red-500">{errors.nombre_en.message}</p>}
        </div>
      </div>

      {/* Bilingual Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="descripcion_es">Descripción ES</Label>
          <Textarea
            id="descripcion_es"
            {...register("descripcion_es")}
            placeholder="Descripción en español"
            rows={3}
          />
          {errors.descripcion_es && <p className="text-sm text-red-500">{errors.descripcion_es.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="descripcion_en">Description EN</Label>
          <Textarea
            id="descripcion_en"
            {...register("descripcion_en")}
            placeholder="Description in English"
            rows={3}
          />
          {errors.descripcion_en && <p className="text-sm text-red-500">{errors.descripcion_en.message}</p>}
        </div>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="precio">Precio (EUR)</Label>
        <Input
          id="precio"
          type="number"
          step="0.01"
          {...register("precio")}
          placeholder="12.50"
          min="0"
        />
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Foto</Label>
        <div className="border-2 border-dashed border-dorado/30 rounded-lg p-6 text-center hover:border-dorado/60 transition-colors">
          {imagePreview ? (
            <div className="space-y-4">
              <div className="relative w-full h-48">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-dorado h-2 rounded-full animate-pulse w-full" />
                </div>
              )}
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-sm text-dorado hover:underline cursor-pointer">Cambiar imagen</span>
              </label>
            </div>
          ) : (
            <label className="cursor-pointer space-y-2 block">
              <Upload size={32} className="mx-auto text-dorado" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-sm font-medium text-carbon">Haz clic para subir imagen</p>
              <p className="text-xs text-carbon/60">PNG, JPG o GIF (máximo 5MB)</p>
            </label>
          )}
        </div>
      </div>

      {/* Allergens */}
      <div className="space-y-3">
        <div>
          <Label className="text-base">Alérgenos</Label>
          <p className="text-xs text-carbon/50 mt-0.5">14 alérgenos obligatorios (Reg. UE 1169/2011)</p>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {ALERGENO_LIST.map((alergeno) => {
            const active = selectedAlergenos.includes(alergeno)
            return (
              <button
                key={alergeno}
                type="button"
                onClick={() => handleAlergenaToggle(alergeno)}
                className={`px-3 py-2 rounded border text-sm text-left transition-all ${
                  active
                    ? "border-burdeos bg-burdeos/8 text-burdeos font-semibold"
                    : "border-burdeos/15 text-carbon/60 hover:border-burdeos/40 hover:text-carbon"
                }`}
              >
                {active && <span className="mr-1">✓</span>}
                {ALERGENOS_LABELS[alergeno]?.es || alergeno}
              </button>
            )
          })}
        </div>

        {/* Custom allergens */}
        <div className="flex gap-2">
          <Input
            value={customAlergeno}
            onChange={(e) => setCustomAlergeno(e.target.value)}
            placeholder="Otro alérgeno personalizado…"
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); handleAddCustomAlergeno() }
            }}
          />
          <Button type="button" variant="outline" onClick={handleAddCustomAlergeno} className="shrink-0">
            Añadir
          </Button>
        </div>

        {selectedAlergenos.filter((a) => !ALERGENO_LIST.includes(a)).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedAlergenos
              .filter((a) => !ALERGENO_LIST.includes(a))
              .map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-dorado/10 border border-dorado/30 rounded text-xs text-carbon"
                >
                  {a}
                  <button
                    type="button"
                    onClick={() => setSelectedAlergenos((prev) => prev.filter((x) => x !== a))}
                    className="hover:text-burdeos transition-colors"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="es_vegano">Vegano</Label>
          <Controller
            name="es_vegano"
            control={control}
            render={({ field }) => (
              <Switch id="es_vegano" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="sin_gluten">Sin Gluten</Label>
          <Controller
            name="sin_gluten"
            control={control}
            render={({ field }) => (
              <Switch id="sin_gluten" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="activo">Activo</Label>
          <Controller
            name="activo"
            control={control}
            render={({ field }) => (
              <Switch id="activo" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-burdeos hover:bg-burdeos-dark text-crema"
        >
          {isSubmitting ? "Guardando..." : plato ? "Actualizar Plato" : "Crear Plato"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
