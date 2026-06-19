"use client"

import { motion } from "framer-motion"
import { useLocale } from "next-intl"
import CardPlato from "./CardPlato"
import type { Plato, Seccion } from "@/lib/supabase/types"

type Props = {
  seccion: Seccion
  platos:  Plato[]
  hijos?:  { seccion: Seccion; platos: Plato[] }[]
}

export default function SeccionCarta({ seccion, platos, hijos }: Props) {
  const locale = useLocale() as "es" | "en"
  const nombre = locale === "es" ? seccion.nombre_es : seccion.nombre_en

  return (
    <section id={seccion.slug} className="scroll-mt-24 mb-16">

      {/* Section heading */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className="mb-8 text-center"
      >
        <h2
          className="text-4xl md:text-5xl font-light italic text-burdeos mb-4"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {nombre}
        </h2>
        <div className="divider-ornamental max-w-xs mx-auto">◆</div>
      </motion.div>

      {/* Root-level dishes */}
      {platos.length > 0 && (
        <div className="mb-10">
          {platos.map((plato, i) => (
            <CardPlato key={plato.id} plato={plato} index={i} />
          ))}
        </div>
      )}

      {/* Subsections */}
      {hijos?.map(({ seccion: hijo, platos: platosHijo }) => (
        <div key={hijo.id} className="mb-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-5"
          >
            <h3
              className="text-xl font-light italic text-carbon/60 mb-2"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              {locale === "es" ? hijo.nombre_es : hijo.nombre_en}
            </h3>
            <div className="h-px bg-dorado/25 w-24" />
          </motion.div>

          {platosHijo.map((plato, i) => (
            <CardPlato key={plato.id} plato={plato} index={i} />
          ))}
        </div>
      ))}
    </section>
  )
}
