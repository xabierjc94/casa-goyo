"use client"
import Image from "next/image"
import { motion } from "framer-motion"
import { useLocale } from "next-intl"
import type { Galeria } from "@/lib/supabase/types"

export default function GaleriaGrid({ fotos }: { fotos: Galeria[] }) {
  const locale = useLocale() as "es" | "en"

  return (
    <div className="columns-2 sm:columns-3 gap-3 space-y-3">
      {fotos.map((foto, i) => (
        <motion.div
          key={foto.id}
          className="break-inside-avoid relative rounded-xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
        >
          <Image
            src={foto.foto_url}
            alt={locale === "es" ? foto.alt_es ?? "" : foto.alt_en ?? ""}
            width={600}
            height={400}
            className="w-full h-auto object-cover"
          />
        </motion.div>
      ))}
    </div>
  )
}
