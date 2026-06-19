"use client"
import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Trash2, ImageIcon, PlayCircle } from "lucide-react"
import { getMediaType } from "@/lib/media"
import type { Galeria } from "@/lib/supabase/types"

export default function AdminGaleria() {
  const [fotos, setFotos] = useState<Galeria[]>([])
  const [uploading, setUploading] = useState(false)
  const [tab, setTab] = useState<"foto" | "video">("foto")
  const [videoUrl, setVideoUrl] = useState("")
  const [addingVideo, setAddingVideo] = useState(false)

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
    let orden = fotos.length
    for (const file of files) {
      const body = new FormData()
      body.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body })
      const json = await res.json()
      if (res.ok && json.url) {
        await supabase.from("galeria").insert({ foto_url: json.url, activo: true, orden: orden + 1 })
        orden++
      }
    }
    setUploading(false)
    load()
  }

  async function handleAddVideo() {
    if (!videoUrl.trim()) return
    setAddingVideo(true)
    const supabase = createClient()
    await supabase.from("galeria").insert({ foto_url: videoUrl.trim(), activo: true, orden: fotos.length + 1 })
    setVideoUrl("")
    setAddingVideo(false)
    load()
  }

  async function eliminar(foto: Galeria) {
    if (!confirm("¿Eliminar este elemento?")) return
    const supabase = createClient()
    await supabase.from("galeria").delete().eq("id", foto.id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-burdeos">Galería</h1>
      </div>

      {/* Add media tabs */}
      <div className="bg-white border border-dorado/20 rounded-lg p-4 mb-6 space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("foto")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors ${tab === "foto" ? "bg-burdeos text-crema" : "text-carbon/60 hover:text-carbon border border-dorado/20"}`}
          >
            <ImageIcon size={13} /> Subir foto
          </button>
          <button
            onClick={() => setTab("video")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors ${tab === "video" ? "bg-burdeos text-crema" : "text-carbon/60 hover:text-carbon border border-dorado/20"}`}
          >
            <PlayCircle size={13} /> Añadir vídeo
          </button>
        </div>

        {tab === "foto" && (
          <label className="cursor-pointer block">
            <span className={`inline-flex items-center gap-2 px-4 py-2 bg-crema border border-dorado/30 text-carbon text-sm rounded hover:bg-crema-dark transition-colors ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}>
              {uploading ? "Subiendo…" : "+ Seleccionar imágenes"}
            </span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        )}

        {tab === "video" && (
          <div className="flex gap-2">
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... o https://vimeo.com/..."
              className="flex-1 border border-dorado/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-burdeos/40"
            />
            <button
              onClick={handleAddVideo}
              disabled={addingVideo || !videoUrl.trim()}
              className="px-4 py-2 bg-burdeos text-crema text-sm rounded hover:bg-burdeos-dark transition-colors disabled:opacity-50"
            >
              {addingVideo ? "Añadiendo…" : "Añadir"}
            </button>
          </div>
        )}
        <p className="text-[11px] text-carbon/40">Soporta YouTube, Vimeo y vídeos directos (.mp4)</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {fotos.map((foto) => {
          const type = getMediaType(foto.foto_url)
          const isVideo = type !== "image"
          return (
            <div key={foto.id} className="relative group rounded-xl overflow-hidden aspect-square bg-carbon/10">
              {isVideo ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-carbon text-crema/60">
                  <PlayCircle size={28} className="text-red-500" />
                  <p className="text-[10px] px-2 text-center line-clamp-2 text-crema/40">{foto.foto_url}</p>
                </div>
              ) : (
                <img src={foto.foto_url} alt="" className="w-full h-full object-cover" />
              )}
              <button
                onClick={() => eliminar(foto)}
                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )
        })}
        {fotos.length === 0 && !uploading && (
          <p className="col-span-4 text-carbon/40 text-sm text-center py-8">No hay elementos. Añade la primera foto o vídeo.</p>
        )}
      </div>
    </div>
  )
}
