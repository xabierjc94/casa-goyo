"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react"
import type { Galeria } from "@/lib/supabase/types"

type Props = { fotos: Galeria[]; locale: "es" | "en" }

function getSpan(i: number): { col: string; row: string } {
  const pos = i % 7
  if (pos === 0) return { col: "md:col-span-2", row: "md:row-span-2" }
  if (pos === 4) return { col: "md:col-span-1", row: "md:row-span-2" }
  if (pos === 6) return { col: "md:col-span-2", row: "md:row-span-1" }
  return { col: "md:col-span-1", row: "md:row-span-1" }
}

export default function GaleriaGrid({ fotos, locale }: Props) {
  const [index, setIndex] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)

  const open = useCallback((i: number) => { setIndex(i); setVisible(true) }, [])
  const close = useCallback(() => { setVisible(false); setTimeout(() => setIndex(null), 250) }, [])
  const prev = useCallback(() => setIndex((i) => (i !== null ? (i - 1 + fotos.length) % fotos.length : null)), [fotos.length])
  const next = useCallback(() => setIndex((i) => (i !== null ? (i + 1) % fotos.length : null)), [fotos.length])

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
      <p className="text-center text-muted-warm text-sm py-24 tracking-widest uppercase"
        style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
        — Próximamente —
      </p>
    )
  }

  return (
    <>
      {/* Bento grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3"
        style={{ gridAutoRows: "220px" }}>
        {fotos.map((foto, i) => {
          const { col, row } = getSpan(i)
          const alt = locale === "es" ? foto.alt_es ?? "" : foto.alt_en ?? ""
          return (
            <div
              key={foto.id}
              className={`relative overflow-hidden cursor-pointer group animate-fade-up ${col} ${row}`}
              style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
              onClick={() => open(i)}
            >
              <Image
                src={foto.foto_url}
                alt={alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-carbon/0 group-hover:bg-carbon/35 transition-all duration-400" />
              {/* Expand icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="p-2.5 border border-crema/60 text-crema/90">
                  <Expand size={18} />
                </div>
              </div>
              {/* Alt text if exists */}
              {alt && (
                <p className="absolute bottom-0 left-0 right-0 px-4 py-3 text-crema text-[11px] tracking-widest uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-carbon/70 to-transparent"
                  style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
                  {alt}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Lightbox */}
      {index !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(18,12,10,0.93)",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.25s ease",
          }}
          onClick={close}
        >
          {/* Close */}
          <button onClick={close} aria-label="Cerrar"
            className="absolute top-5 right-5 p-2 text-crema/50 hover:text-crema transition-colors z-10">
            <X size={24} />
          </button>

          {/* Prev */}
          {fotos.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); prev() }} aria-label="Anterior"
              className="absolute left-4 md:left-8 p-3 text-crema/40 hover:text-crema transition-colors z-10">
              <ChevronLeft size={32} />
            </button>
          )}

          {/* Image */}
          <div
            className="relative"
            style={{
              maxWidth: "min(90vw, 1100px)",
              maxHeight: "88vh",
              transform: visible ? "scale(1)" : "scale(0.95)",
              transition: "transform 0.25s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={fotos[index].foto_url}
              alt={locale === "es" ? fotos[index].alt_es ?? "" : fotos[index].alt_en ?? ""}
              width={1200}
              height={900}
              className="object-contain"
              style={{ maxWidth: "min(90vw, 1100px)", maxHeight: "88vh", width: "auto", height: "auto" }}
            />
          </div>

          {/* Next */}
          {fotos.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); next() }} aria-label="Siguiente"
              className="absolute right-4 md:right-8 p-3 text-crema/40 hover:text-crema transition-colors z-10">
              <ChevronRight size={32} />
            </button>
          )}

          {/* Counter + alt */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center space-y-1">
            {(fotos[index].alt_es || fotos[index].alt_en) && (
              <p className="text-crema/60 text-xs tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
                {locale === "es" ? fotos[index].alt_es : fotos[index].alt_en}
              </p>
            )}
            <p className="text-crema/30 text-[10px] tracking-widest"
              style={{ fontFamily: "var(--font-josefin), sans-serif" }}>
              {index + 1} / {fotos.length}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
