import CardPlato from "./CardPlato"
import type { Plato, Seccion } from "@/lib/supabase/types"

type Props = {
  seccion: Seccion
  platos:  Plato[]
  hijos?:  { seccion: Seccion; platos: Plato[] }[]
  locale:  "es" | "en"
  index?:  number
}

export default function SeccionCarta({ seccion, platos, hijos, locale, index = 0 }: Props) {
  const nombre = locale === "es" ? seccion.nombre_es : seccion.nombre_en

  return (
    <section id={seccion.slug} className="scroll-mt-28 mb-20">

      {/* Section heading */}
      <div className="animate-fade-up mb-10 text-center">
        {/* Top ornamental rule */}
        <div className="flex items-center gap-4 mb-7">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-burdeos/20" />
          <span
            className="text-[9px] tracking-[0.4em] uppercase text-dorado/50"
            style={{ fontFamily: "var(--font-josefin), sans-serif" }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-burdeos/20" />
        </div>

        <h2
          className="text-4xl md:text-[3.25rem] font-light italic text-burdeos leading-tight mb-5"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {nombre}
        </h2>
        <div className="divider-ornamental max-w-[180px] mx-auto text-dorado/60">◆</div>
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
          <div className="animate-fade-in mb-5 flex items-center gap-4">
            <h3
              className="shrink-0 text-lg font-light italic text-carbon/55"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              {locale === "es" ? hijo.nombre_es : hijo.nombre_en}
            </h3>
            <div className="flex-1 h-px bg-dorado/20" />
          </div>

          {platosHijo.map((plato, i) => (
            <CardPlato key={plato.id} plato={plato} locale={locale} index={i} />
          ))}
        </div>
      ))}
    </section>
  )
}
