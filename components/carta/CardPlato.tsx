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
      className="animate-fade-up group border-b border-burdeos/8 py-5 last:border-b-0 hover:bg-dorado/[0.03] transition-colors duration-300 px-1"
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <div className="flex items-baseline justify-between gap-4 mb-1">
        <h3
          className="text-[1.15rem] font-light text-carbon leading-snug group-hover:text-burdeos transition-colors duration-200"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {nombre}
        </h3>
        <span
          className="shrink-0 text-[0.85rem] font-light tracking-wide text-dorado tabular-nums"
          style={{ fontFamily: "var(--font-josefin), sans-serif" }}
        >
          {formatPrecio(plato.precio)}
        </span>
      </div>

      {descripcion && (
        <p
          className="text-[0.75rem] text-muted-warm leading-relaxed tracking-wide mb-2"
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
          {plato.alergenos.map((a) => {
            const info = ALERGENOS_LABELS[a]
            return (
              <span
                key={a}
                className="flex items-center gap-0.5 text-[0.65rem] tracking-[0.12em] uppercase text-muted-warm/70"
                style={{ fontFamily: "var(--font-josefin), sans-serif" }}
              >
                {info?.symbol && <span className="text-[0.75rem] leading-none">{info.symbol}</span>}
                {info?.[locale] ?? a}
              </span>
            )
          })}
        </div>
      )}
    </article>
  )
}
