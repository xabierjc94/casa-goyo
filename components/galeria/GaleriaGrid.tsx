"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import type { Galeria } from "@/lib/supabase/types"

type Props = { fotos: Galeria[]; locale: "es" | "en" }

export default function GaleriaGrid({ fotos, locale }: Props) {
  const [index, setIndex] = useState<number | null>(null)

  const prev = useCallback(() => setIndex((i) => (i !== null ? (i - 1 + fotos.length) % fotos.length : null)), [fotos.length])
  const next = useCallback(() => setIndex((i) => (i !== null ? (i + 1) % fotos.length : null)), [fotos.length])
  const close = useCallback(() => setIndex(null), [])

  useEffect(() => {
    if (index === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [index, prev, next, close])

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
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {fotos.map((foto, i) => (
          <figure
            key={foto.id}
            className="animate-fade-up break-inside-avoid relative overflow-hidden border border-burdeos/8 group cursor-zoom-in"
            style={{ animationDelay: `${i * 40}ms` }}
            onClick={() => setIndex(i)}
          >
            <Image
              src={foto.foto_url}
              alt={locale === "es" ? foto.alt_es ?? "" : foto.alt_en ?? ""}
              width={600}
              height={400}
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-carbon/0 group-hover:bg-carbon/10 transition-colors duration-300 pointer-events-none" />
          </figure>
        ))}
      </div>

      {/* Lightbox */}
      {index !== null && (
        <div
          className="fixed inset-0 z-50 bg-carbon/90 flex items-center justify-center"
          onClick={close}
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 p-2 text-crema/70 hover:text-crema transition-colors"
            aria-label="Cerrar"
          >
            <X size={28} />
          </button>

          {/* Prev */}
          {fotos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-4 p-2 text-crema/70 hover:text-crema transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft size={36} />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={fotos[index].foto_url}
              alt={locale === "es" ? fotos[index].alt_es ?? "" : fotos[index].alt_en ?? ""}
              width={1200}
              height={900}
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
          </div>

          {/* Next */}
          {fotos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-4 p-2 text-crema/70 hover:text-crema transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight size={36} />
            </button>
          )}

          {/* Counter */}
          <p
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-crema/50 text-xs tracking-widest"
            style={{ fontFamily: "var(--font-josefin), sans-serif" }}
          >
            {index + 1} / {fotos.length}
          </p>
        </div>
      )}
    </>
  )
}
