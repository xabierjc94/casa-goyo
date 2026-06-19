"use client"
import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Trash2 } from "lucide-react"
import type { Galeria } from "@/lib/supabase/types"

export default function AdminGaleria() {
  const [fotos, setFotos] = useState<Galeria[]>([])
  const [uploading, setUploading] = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from("galeria").select("*").order("orden")
    setFotos(data ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    const supabase = createClient()
    for (const file of files) {
      const ext = file.name.split(".").pop()
      const path = `galeria/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from("imagenes").upload(path, file)
      if (!error) {
        const { data: urlData } = supabase.storage.from("imagenes").getPublicUrl(path)
        await supabase.from("galeria").insert({ foto_url: urlData.publicUrl, orden: fotos.length + 1 })
      }
    }
    setUploading(false)
    load()
  }

  async function eliminar(foto: Galeria) {
    if (!confirm("¿Eliminar esta foto?")) return
    const supabase = createClient()
    await supabase.from("galeria").delete().eq("id", foto.id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-gray-800">Galería</h1>
        <label className="cursor-pointer">
          <span className={`inline-flex items-center gap-2 px-4 py-2 bg-burdeos text-crema text-sm rounded-lg hover:bg-burdeos-dark transition-colors ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}>
            {uploading ? "Subiendo..." : "+ Añadir fotos"}
          </span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {fotos.map((foto) => (
          <div key={foto.id} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100">
            <img src={foto.foto_url} alt="" className="w-full h-full object-cover" />
            <button onClick={() => eliminar(foto)} className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {fotos.length === 0 && !uploading && (
          <p className="col-span-4 text-gray-400 text-sm text-center py-8">No hay fotos. Añade la primera.</p>
        )}
      </div>
    </div>
  )
}
