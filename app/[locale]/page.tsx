import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import SeccionCarta from "@/components/carta/SeccionCarta"
import NavCarta from "@/components/carta/NavCarta"
import type { Plato, Seccion } from "@/lib/supabase/types"

export default async function CartaPage() {
  const t = await getTranslations("carta")
  const supabase = await createClient()

  // Fetch all sections and dishes
  const [{ data: secciones }, { data: platos }] = await Promise.all([
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
  const { data: subsecciones } = await supabase
    .from("secciones")
    .select("*")
    .not("padre_slug", "is", null)
    .order("orden")

  const platosArr: Plato[] = platos ?? []
  const seccionesArr: Seccion[] = secciones ?? []
  const subArr: Seccion[] = subsecciones ?? []

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
      {seccionesArr.length > 0 && <NavCarta secciones={seccionesArr} />}

      {/* Sections */}
      {seccionesArr.map((seccion) => {
        // Find all subsections that belong to this section
        const hijosDeEsta = subArr.filter((s) => s.padre_slug === seccion.slug)

        // Find all dishes in this section (not in subsections)
        const platosDirectos = platosArr.filter(
          (p) => p.seccion_slug === seccion.slug
        )

        // Build subsection data
        const hijos = hijosDeEsta.map((hijo) => ({
          seccion: hijo,
          platos: platosArr.filter((p) => p.seccion_slug === hijo.slug),
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
