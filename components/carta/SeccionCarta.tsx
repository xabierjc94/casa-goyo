import CardPlato from "./CardPlato"
import type { Plato, Seccion } from "@/lib/supabase/types"

type Props = {
  seccion: Seccion
  platos:  Plato[]
  hijos?:  { seccion: Seccion; platos: Plato[] }[]
  locale:  "es" | "en"
}

export default function SeccionCarta({ seccion, platos, hijos, locale }: Props) {
  const nombre = locale === "es" ? seccion.nombre_es : seccion.nombre_en

  return (
    <section id={seccion.slug} className="scroll-mt-24 mb-16">

      {/* Section heading */}
      <div className="animate-fade-up mb-8 text-center">
        <h2
          className="text-4xl md:text-5xl font-light italic text-burdeos mb-4"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {nombre}
        </h2>
        <div className="divider-ornamental max-w-xs mx-auto">◆</div>
      </div>

      {/* Root-level dishes */}
      {platos.length > 0 && (
        <div className="mb-10">
          {platos.map((plato, i) => (
            <CardPlato key={plato.id} plato={plato} locale={locale} index={i} />
          ))}
        </div>
      )}

      {/* Subsections */}
      {hijos?.map(({ seccion: hijo, platos: platosHijo }) => (
        <div key={hijo.id} className="mb-10">
          <div className="animate-fade-in mb-5">
            <h3
              className="text-xl font-light italic text-carbon/60 mb-2"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              {locale === "es" ? hijo.nombre_es : hijo.nombre_en}
            </h3>
            <div className="h-px bg-dorado/25 w-24" />
          </div>

          {platosHijo.map((plato, i) => (
            <CardPlato key={plato.id} plato={plato} locale={locale} index={i} />
          ))}
        </div>
      ))}
    </section>
  )
}
