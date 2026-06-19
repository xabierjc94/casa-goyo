"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { InfoRestaurante } from "@/lib/supabase/types"

export default function AdminInfo() {
  const [info, setInfo] = useState<Partial<InfoRestaurante>>({})
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
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-gray-800 mb-6">Información del restaurante</h1>
      <form onSubmit={handleSave} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5 max-w-xl">
        <div>
          <Label>Dirección</Label>
          <Input
            value={info.direccion ?? ""}
            onChange={(e) => setInfo({ ...info, direccion: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Teléfono</Label>
          <Input
            value={info.telefono ?? ""}
            onChange={(e) => setInfo({ ...info, telefono: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Email de contacto</Label>
          <Input
            value={info.email ?? ""}
            onChange={(e) => setInfo({ ...info, email: e.target.value })}
            className="mt-1"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Horario (ES)</Label>
            <Textarea
              value={info.horario_es ?? ""}
              onChange={(e) => setInfo({ ...info, horario_es: e.target.value })}
              className="mt-1"
              rows={5}
              placeholder={"Lunes: cerrado\nMartes-Viernes: 13:00-16:00"}
            />
          </div>
          <div>
            <Label>Hours (EN)</Label>
            <Textarea
              value={info.horario_en ?? ""}
              onChange={(e) => setInfo({ ...info, horario_en: e.target.value })}
              className="mt-1"
              rows={5}
            />
          </div>
        </div>
        <Button type="submit" className="bg-burdeos text-crema">
          {saved ? "¡Guardado!" : "Guardar cambios"}
        </Button>
      </form>
    </div>
  )
}
