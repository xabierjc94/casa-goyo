"use client"
import { motion } from "framer-motion"
import { useLocale, useTranslations } from "next-intl"
import { Leaf, WheatOff } from "lucide-react"
import ImagenPlato from "@/components/shared/ImagenPlato"
import { formatPrecio, ALERGENOS_LABELS } from "@/lib/utils"
import type { Plato } from "@/lib/supabase/types"

type Props = { plato: Plato }

export default function CardPlato({ plato }: Props) {
  const locale = useLocale() as "es" | "en"
  const t = useTranslations("carta")

  const nombre = locale === "es" ? plato.nombre_es : plato.nombre_en
  const descripcion = locale === "es" ? plato.descripcion_es : plato.descripcion_en

  return (
    <motion.div
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-dorado/10 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative h-44 w-full">
        <ImagenPlato src={plato.foto_url} alt={nombre} />
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-serif text-base font-semibold text-carbon leading-tight">
            {nombre}
          </h3>
          <span className="text-burdeos font-bold text-sm whitespace-nowrap">
            {formatPrecio(plato.precio)}
          </span>
        </div>

        {descripcion && (
          <p className="text-xs text-carbon/60 leading-relaxed mb-3">{descripcion}</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          {plato.es_vegano && (
            <span className="flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
              <Leaf size={10} /> {t("vegano")}
            </span>
          )}
          {plato.sin_gluten && (
            <span className="flex items-center gap-1 bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">
              <WheatOff size={10} /> {t("sin_gluten")}
            </span>
          )}
          {plato.alergenos.map((a) => (
            <span
              key={a}
              className="bg-crema text-carbon/50 text-xs px-2 py-0.5 rounded-full"
            >
              {ALERGENOS_LABELS[a]?.[locale] ?? a}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
