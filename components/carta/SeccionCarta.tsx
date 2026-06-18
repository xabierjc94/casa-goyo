"use client"
import { motion } from "framer-motion"
import { useLocale } from "next-intl"
import CardPlato from "./CardPlato"
import type { Plato, Seccion } from "@/lib/supabase/types"

type Props = {
  seccion: Seccion
  platos: Plato[]
  hijos?: { seccion: Seccion; platos: Plato[] }[]
}

export default function SeccionCarta({ seccion, platos, hijos }: Props) {
  const locale = useLocale() as "es" | "en"
  const nombre = locale === "es" ? seccion.nombre_es : seccion.nombre_en

  return (
    <section id={seccion.slug} className="scroll-mt-20 mb-14">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h2 className="font-serif text-2xl text-burdeos">{nombre}</h2>
        <div className="w-16 h-0.5 bg-dorado mt-1" />
      </motion.div>

      {platos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {platos.map((plato) => (
            <CardPlato key={plato.id} plato={plato} />
          ))}
        </div>
      )}

      {hijos?.map(({ seccion: hijo, platos: platosHijo }) => (
        <div key={hijo.id} className="mb-6">
          <h3 className="font-serif text-lg text-carbon/70 mb-4 pl-2 border-l-2 border-dorado">
            {locale === "es" ? hijo.nombre_es : hijo.nombre_en}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {platosHijo.map((plato) => (
              <CardPlato key={plato.id} plato={plato} />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
