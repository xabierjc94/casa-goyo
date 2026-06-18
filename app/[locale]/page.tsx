import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import SeccionCarta from "@/components/carta/SeccionCarta"
import NavCarta from "@/components/carta/NavCarta"
import type { Plato, Seccion } from "@/lib/supabase/types"

export default async function CartaPage() {
  const t = await getTranslations("carta")
  const supabase = await createClient()

  // Fetch all sections and dishes
  const [
    { data: secciones, error: seccionesError },
    { data: platos, error: platosError },
  ] = await Promise.all([
    supabase
      .from("secciones")
      .select("*")
      .is("padre_slug", null)
      .order("orden"),
    supabase
      .from("platos")
      .select("*")
      .eq("activo", true)
      .order("orden"),
  ])

  // Fetch subsections
  const { data: subsecciones, error: subseccionesError } = await supabase
    .from("secciones")
    .select("*")
    .not("padre_slug", "is", null)
    .order("orden")

  // Error handling for all queries
  if (seccionesError) throw new Error(`Failed to fetch sections: ${seccionesError.message}`)
  if (platosError) throw new Error(`Failed to fetch dishes: ${platosError.message}`)
  if (subseccionesError) throw new Error(`Failed to fetch subsections: ${subseccionesError.message}`)

  const platosArr: Plato[] = platos ?? []
  const seccionesArr: Seccion[] = secciones ?? []
  const subseccionesArr: Seccion[] = subsecciones ?? []

  // Pre-organize dishes by section slug using a Map for O(1) lookups
  const platosBySeccion = new Map<string, Plato[]>()
  for (const plato of platosArr) {
    if (!platosBySeccion.has(plato.seccion_slug)) {
      platosBySeccion.set(plato.seccion_slug, [])
    }
    platosBySeccion.get(plato.seccion_slug)!.push(plato)
  }

  // Pre-organize subsections by parent slug
  const subseccionesByPadre = new Map<string, Seccion[]>()
  for (const subseccion of subseccionesArr) {
    if (!subseccionesByPadre.has(subseccion.padre_slug!)) {
      subseccionesByPadre.set(subseccion.padre_slug!, [])
    }
    subseccionesByPadre.get(subseccion.padre_slug!)!.push(subseccion)
  }

  // Filter sections to only show those with dishes or subsections with dishes
  const seccionesConContenido = seccionesArr.filter((seccion) => {
    const platosDirectos = platosBySeccion.get(seccion.slug) ?? []
    const hijosDeEsta = subseccionesByPadre.get(seccion.slug) ?? []
    const hijosConPlatos = hijosDeEsta.some(
      (hijo) => (platosBySeccion.get(hijo.slug) ?? []).length > 0
    )
    return platosDirectos.length > 0 || hijosConPlatos
  })

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Page Title */}
      <h1 className="font-serif text-4xl text-burdeos text-center mb-2">
        {t("titulo")}
      </h1>
      <div className="flex justify-center mb-8">
        <div className="w-24 h-0.5 bg-dorado" />
      </div>

      {/* Navigation */}
      {seccionesConContenido.length > 0 && (
        <NavCarta secciones={seccionesConContenido} />
      )}

      {/* Sections */}
      {seccionesConContenido.map((seccion) => {
        // Get dishes in this section (not in subsections)
        const platosDirectos = platosBySeccion.get(seccion.slug) ?? []

        // Get all subsections that belong to this section
        const hijosDeEsta = subseccionesByPadre.get(seccion.slug) ?? []

        // Build subsection data
        const hijos = hijosDeEsta.map((hijo) => ({
          seccion: hijo,
          platos: platosBySeccion.get(hijo.slug) ?? [],
        }))

        return (
          <SeccionCarta
            key={seccion.id}
            seccion={seccion}
            platos={platosDirectos}
            hijos={hijos.length > 0 ? hijos : undefined}
          />
        )
      })}
    </main>
  )
}
