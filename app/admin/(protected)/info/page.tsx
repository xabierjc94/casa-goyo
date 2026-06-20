"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Info, Check } from "lucide-react"
import type { InfoRestaurante } from "@/lib/supabase/types"

const fieldClass =
  "w-full bg-transparent border-0 border-b border-carbon/15 px-0 py-2 text-sm text-carbon " +
  "placeholder:text-carbon/25 focus:outline-none focus:border-dorado/60 transition-colors duration-200"

const labelClass =
  "block text-[10px] tracking-[0.2em] uppercase text-muted-warm mb-1"

export default function AdminInfo() {
  const [info, setInfo]   = useState<Partial<InfoRestaurante>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from("info_restaurante").select("*").single().then(({ data }) => {
      if (data) setInfo(data)
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    const { id, ...fields } = info as InfoRestaurante
    await supabase.from("info_restaurante").update(fields).eq("id", 1)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Info size={13} className="text-dorado/60" />
          <span className="text-[10px] tracking-[0.35em] uppercase text-dorado/70"
            style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
            Configuración
          </span>
        </div>
        <h1 className="text-4xl font-light italic text-carbon mb-4"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
          Información del Restaurante
        </h1>
        <div className="h-px bg-gradient-to-r from-burdeos/30 via-dorado/20 to-transparent w-64" />
      </div>

      <form onSubmit={handleSave} className="space-y-8">

        {/* Contact section */}
        <div className="bg-white border border-dorado/12 rounded-sm p-6 space-y-6">
          <p className="text-[10px] tracking-[0.3em] uppercase text-dorado/60 pb-3 border-b border-dorado/10"
            style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
            Datos de contacto
          </p>

          <div>
            <label className={labelClass} style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
              Dirección
            </label>
            <input
              type="text"
              value={info.direccion ?? ""}
              onChange={(e) => setInfo({ ...info, direccion: e.target.value })}
              className={fieldClass}
              style={{ fontFamily: "var(--font-josefin), sans-serif" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
                Teléfono
              </label>
              <input
                type="text"
                value={info.telefono ?? ""}
                onChange={(e) => setInfo({ ...info, telefono: e.target.value })}
                className={fieldClass}
                style={{ fontFamily: "var(--font-josefin), sans-serif" }}
              />
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
                Email de contacto
              </label>
              <input
                type="email"
                value={info.email ?? ""}
                onChange={(e) => setInfo({ ...info, email: e.target.value })}
                className={fieldClass}
                style={{ fontFamily: "var(--font-josefin), sans-serif" }}
              />
            </div>
          </div>
        </div>

        {/* Hours section */}
        <div className="bg-white border border-dorado/12 rounded-sm p-6 space-y-6">
          <p className="text-[10px] tracking-[0.3em] uppercase text-dorado/60 pb-3 border-b border-dorado/10"
            style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
            Horarios
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
                Horario (ES)
              </label>
              <textarea
                value={info.horario_es ?? ""}
                onChange={(e) => setInfo({ ...info, horario_es: e.target.value })}
                rows={6}
                placeholder={"Lunes: cerrado\nMartes–Viernes: 13:00–16:00"}
                className="w-full bg-transparent border border-carbon/10 rounded-sm px-3 py-2 text-sm text-carbon placeholder:text-carbon/20 focus:outline-none focus:border-dorado/50 transition-colors resize-none"
                style={{ fontFamily: "var(--font-josefin), sans-serif" }}
              />
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
                Hours (EN)
              </label>
              <textarea
                value={info.horario_en ?? ""}
                onChange={(e) => setInfo({ ...info, horario_en: e.target.value })}
                rows={6}
                className="w-full bg-transparent border border-carbon/10 rounded-sm px-3 py-2 text-sm text-carbon placeholder:text-carbon/20 focus:outline-none focus:border-dorado/50 transition-colors resize-none"
                style={{ fontFamily: "var(--font-josefin), sans-serif" }}
              />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-carbon text-crema text-[11px] tracking-[0.2em] uppercase rounded-sm hover:bg-carbon-soft transition-colors duration-200"
            style={{ fontFamily: "var(--font-josefin), sans-serif" }}
          >
            {saved ? (
              <><Check size={13} /> Guardado</>
            ) : (
              "Guardar cambios"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
