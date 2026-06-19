"use client"

import { useState, useCallback } from "react"
import { useForm, Controller } from "react-hook-form"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Upload, X } from "lucide-react"
import type { Plato, Seccion } from "@/lib/supabase/types"
import { ALERGENOS_LABELS } from "@/lib/utils"

interface FormPlatoData {
  nombre_es: string
  nombre_en: string
  descripcion_es?: string
  descripcion_en?: string
  precio: string
  seccion_slug: string
  es_vegano?: boolean
  sin_gluten?: boolean
  activo?: boolean
}

interface FormPlatoProps {
  secciones: Seccion[]
  plato?: Plato
  onSuccess?: () => void
  onCancel?: () => void
}

const ALERGENO_LIST = Object.keys(ALERGENOS_LABELS)

export default function FormPlato({ secciones, plato, onSuccess, onCancel }: FormPlatoProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [imagePreview, setImagePreview] = useState<string | null>(plato?.foto_url || null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedAlergenos, setSelectedAlergenos] = useState<string[]>(plato?.alergenos || [])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormPlatoData>({
    mode: "onBlur",
    defaultValues: plato
      ? {
          nombre_es: plato.nombre_es,
          nombre_en: plato.nombre_en,
          descripcion_es: plato.descripcion_es || "",
          descripcion_en: plato.descripcion_en || "",
          precio: plato.precio.toString(),
          seccion_slug: plato.seccion_slug,
          es_vegano: plato.es_vegano,
          sin_gluten: plato.sin_gluten,
          activo: plato.activo,
        }
      : {
          es_vegano: false,
          sin_gluten: false,
          activo: true,
          precio: "",
        },
  })

  const esVegano = watch("es_vegano")
  const sinGluten = watch("sin_gluten")

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

  const removeImage = useCallback(() => {
    setImagePreview(null)
    setSelectedFile(null)
  }, [])

  const onSubmit = async (data: FormPlatoData) => {
    // Validate
    if (!data.nombre_es.trim()) {
      toast.error("Nombre ES requerido")
      return
    }
    if (!data.nombre_en.trim()) {
      toast.error("Name EN required")
      return
    }
    if (!data.seccion_slug) {
      toast.error("Sección requerida")
      return
    }

    const precio = parseFloat(data.precio)
    if (isNaN(precio) || precio < 0) {
      toast.error("Precio inválido")
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = createClient()

      let fotoUrl = plato?.foto_url || null

      // Handle image upload if a new file was selected
      if (selectedFile) {
        setUploadProgress(0)

        const fileName = `${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("platos")
          .upload(fileName, selectedFile, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          throw new Error(`Error uploading image: ${uploadError.message}`)
        }

        // Get public URL
        const { data: publicData } = supabase.storage.from("platos").getPublicUrl(uploadData.path)
        fotoUrl = publicData.publicUrl

        setUploadProgress(100)
      }

      // Prepare plato data
      const platoData = {
        nombre_es: data.nombre_es.trim(),
        nombre_en: data.nombre_en.trim(),
        descripcion_es: data.descripcion_es?.trim() || null,
        descripcion_en: data.descripcion_en?.trim() || null,
        precio: precio,
        seccion_slug: data.seccion_slug,
        alergenos: selectedAlergenos,
        es_vegano: data.es_vegano || false,
        sin_gluten: data.sin_gluten || false,
        activo: data.activo !== false,
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

      onSuccess?.()
    } catch (error) {
      console.error("Form submission error:", error)
      toast.error(error instanceof Error ? error.message : "Error al guardar el plato")
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  // Filter leaf sections (sections without children)
  const leafSecciones = secciones.filter((s) => !s.padre_slug || s.padre_slug === null)

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
                {leafSecciones.map((seccion) => (
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
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-dorado h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
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
      <div className="space-y-2">
        <Label>Alérgenos</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {ALERGENO_LIST.map((alergeno) => (
            <button
              key={alergeno}
              type="button"
              onClick={() => handleAlergenaToggle(alergeno)}
              className={`p-2 rounded-lg border-2 transition-all text-sm font-medium ${
                selectedAlergenos.includes(alergeno)
                  ? "border-burdeos bg-burdeos text-crema"
                  : "border-crema bg-white text-carbon hover:border-dorado"
              }`}
            >
              {ALERGENOS_LABELS[alergeno]?.es || alergeno}
            </button>
          ))}
        </div>
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
