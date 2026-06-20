import { createClient } from "@/lib/supabase/server"
import { getTranslations, setRequestLocale } from "next-intl/server"
import SeccionCarta from "@/components/carta/SeccionCarta"
import NavCarta from "@/components/carta/NavCarta"
import type { Plato, Seccion } from "@/lib/supabase/types"

export const revalidate = 60 // re-fetch from Supabase every 60 seconds

export function generateStaticParams() {
  return [{ locale: "es" }, { locale: "en" }]
}

export default async function CartaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params
  const locale = rawLocale as "es" | "en"
  setRequestLocale(locale)
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
    <>
    {/* Landscape hero — inspired by the fields, sky and reservoir of Alcocer */}
    <div className="relative w-full overflow-hidden" style={{ height: "200px" }}>
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #1E65B5 0%, #2B8FC5 22%, #37B0B0 43%, #69AB65 64%, #BF7A35 80%, #EFD8B5 92%, #FAF0E6 100%)"
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E\")",
          opacity: "0.45"
        }}
      />
      <div className="absolute bottom-7 inset-x-0 flex justify-center">
        <p
          className="text-[9px] tracking-[0.5em] uppercase text-white/50"
          style={{ fontFamily: "var(--font-josefin), sans-serif" }}
        >
          Alcocer · Guadalajara
        </p>
      </div>
    </div>

    <main className="max-w-3xl mx-auto px-4 pt-10 pb-16">
      {/* Page Title */}
      <div className="text-center mb-12">
        <h1
          className="text-5xl md:text-6xl font-light italic text-burdeos mb-5"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {t("titulo")}
        </h1>
        <div className="divider-ornamental max-w-xs mx-auto">◆</div>

        {/* Allergen notice — Reg. EU 1169/2011 */}
        <div
          className="mt-8 mx-auto max-w-sm border border-burdeos/15 rounded px-6 py-4 text-center space-y-1"
          style={{ fontFamily: "var(--font-josefin), sans-serif" }}
        >
          <p className="text-[9px] tracking-[0.18em] uppercase text-burdeos/60">
            Reglamento (UE) N.º 1169/2011
          </p>
          <p className="text-[11px] tracking-[0.12em] uppercase text-carbon/70 font-medium leading-snug">
            Establecimiento con información disponible
          </p>
          <p className="text-[11px] tracking-[0.12em] uppercase text-carbon/70 font-medium leading-snug">
            en materia de alergias e intolerancias alimentarias
          </p>
          <p className="text-[10px] tracking-[0.1em] uppercase text-carbon/50 pt-1">
            Soliciten información a nuestro personal · Muchas gracias
          </p>
        </div>

        {/* Pan notice */}
        <div
          className="mt-3 mx-auto max-w-sm flex items-center justify-center gap-2 bg-dorado/8 border border-dorado/25 rounded px-5 py-2.5"
          style={{ fontFamily: "var(--font-josefin), sans-serif" }}
        >
          <span className="text-dorado text-sm">◆</span>
          <p className="text-[10px] tracking-[0.14em] uppercase text-carbon/65">
            Servicio de pan · <span className="font-semibold text-carbon/80">1,30 €</span>
          </p>
        </div>
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

        // Build subsection data — only include subsections that have dishes
        const hijos = hijosDeEsta
          .map((hijo) => ({
            seccion: hijo,
            platos: platosBySeccion.get(hijo.slug) ?? [],
          }))
          .filter(({ platos }) => platos.length > 0)

        return (
          <SeccionCarta
            key={seccion.id}
            seccion={seccion}
            platos={platosDirectos}
            hijos={hijos.length > 0 ? hijos : undefined}
            locale={locale}
          />
        )
      })}
    </main>
    </>
  )
}
