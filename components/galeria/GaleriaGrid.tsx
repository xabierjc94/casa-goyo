"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { useLocale } from "next-intl"
import type { Galeria } from "@/lib/supabase/types"

export default function GaleriaGrid({ fotos }: { fotos: Galeria[] }) {
  const locale = useLocale() as "es" | "en"

  if (fotos.length === 0) {
    return (
      <p
        className="text-center text-muted-warm text-sm py-16 tracking-widest uppercase"
        style={{ fontFamily: "var(--font-josefin), sans-serif" }}
      >
        — Próximamente —
      </p>
    )
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
      {fotos.map((foto, i) => (
        <motion.figure
          key={foto.id}
          className="break-inside-avoid relative overflow-hidden border border-burdeos/8 group"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.04 }}
        >
          <Image
            src={foto.foto_url}
            alt={locale === "es" ? foto.alt_es ?? "" : foto.alt_en ?? ""}
            width={600}
            height={400}
            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
          {/* Subtle hover overlay */}
          <div className="absolute inset-0 bg-carbon/0 group-hover:bg-carbon/10 transition-colors duration-300 pointer-events-none" />
        </motion.figure>
      ))}
    </div>
  )
}
