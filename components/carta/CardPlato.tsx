import { ALERGENOS_LABELS, formatPrecio } from "@/lib/utils"
import type { Plato } from "@/lib/supabase/types"

const DIET_LABELS = {
  es: { vegano: "Vegano", sinGluten: "Sin Gluten" },
  en: { vegano: "Vegan",  sinGluten: "Gluten Free" },
} as const

type Props = { plato: Plato; locale: "es" | "en"; index?: number }

export default function CardPlato({ plato, locale, index = 0 }: Props) {
  const nombre      = locale === "es" ? plato.nombre_es : plato.nombre_en
  const descripcion = locale === "es" ? plato.descripcion_es : plato.descripcion_en
  const labels      = DIET_LABELS[locale]

  return (
    <article
      className="animate-fade-up group relative py-5 border-b border-burdeos/8 last:border-b-0 transition-all duration-300 hover:pl-3"
      style={{ animationDelay: `${index * 55}ms` }}
    >
      {/* Left accent on hover */}
      <div className="absolute left-0 top-4 bottom-4 w-px bg-dorado scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center" />

      {/* Name + dotted leader + price */}
      <div className="flex items-baseline gap-2">
        <h3
          className="shrink-0 text-[1.15rem] font-light text-carbon leading-snug group-hover:text-burdeos transition-colors duration-200"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {nombre}
        </h3>
        <span
          className="flex-1 min-w-[1.5rem] border-b border-dotted border-carbon/18 mb-[5px]"
          aria-hidden="true"
        />
        <span
          className="shrink-0 text-[0.88rem] font-light tracking-wide text-dorado tabular-nums"
          style={{ fontFamily: "var(--font-josefin), sans-serif" }}
        >
          {formatPrecio(plato.precio)}
        </span>
      </div>

      {descripcion && (
        <p
          className="mt-1 text-[0.74rem] text-muted-warm leading-relaxed tracking-wide"
          style={{ fontFamily: "var(--font-josefin), sans-serif" }}
        >
          {descripcion}
        </p>
      )}

      {(plato.es_vegano || plato.sin_gluten || plato.alergenos.length > 0) && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
          {plato.es_vegano && (
            <span
              className="text-[0.65rem] tracking-[0.15em] uppercase text-green-700"
              style={{ fontFamily: "var(--font-josefin), sans-serif" }}
            >
              · {labels.vegano}
            </span>
          )}
          {plato.sin_gluten && (
            <span
              className="text-[0.65rem] tracking-[0.15em] uppercase text-amber-700"
              style={{ fontFamily: "var(--font-josefin), sans-serif" }}
            >
              · {labels.sinGluten}
            </span>
          )}
          {plato.alergenos.map((a) => (
            <span
              key={a}
              className="text-[0.65rem] tracking-[0.12em] uppercase text-muted-warm/70"
              style={{ fontFamily: "var(--font-josefin), sans-serif" }}
            >
              {ALERGENOS_LABELS[a]?.[locale] ?? a}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
