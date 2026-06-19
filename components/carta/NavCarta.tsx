"use client"

import { useLocale } from "next-intl"
import { useEffect, useRef, useState } from "react"
import type { Seccion } from "@/lib/supabase/types"

type Props = { secciones: Seccion[] }

export default function NavCarta({ secciones }: Props) {
  const locale             = useLocale() as "es" | "en"
  const [active, setActive] = useState<string>("")
  const navRef             = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting)
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: "-25% 0px -65% 0px" }
    )

    secciones.forEach(({ slug }) => {
      const el = document.getElementById(slug)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [secciones])

  // Scroll active item into view in the nav bar
  useEffect(() => {
    if (!active || !navRef.current) return
    const btn = navRef.current.querySelector<HTMLElement>(`[data-slug="${active}"]`)
    btn?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" })
  }, [active])

  return (
    <nav
      ref={navRef}
      className="sticky top-[68px] z-40 bg-crema/95 backdrop-blur-sm border-b border-burdeos/8 overflow-x-auto scrollbar-hide"
      aria-label="Secciones de la carta"
    >
      <div className="flex gap-0 min-w-max mx-auto px-6">
        {secciones.map((s) => {
          const nombre   = locale === "es" ? s.nombre_es : s.nombre_en
          const isActive = active === s.slug
          return (
            <a
              key={s.slug}
              href={`#${s.slug}`}
              data-slug={s.slug}
              className="relative group py-4 px-5 flex-shrink-0"
            >
              <span
                className={`text-[10px] tracking-[0.2em] uppercase transition-colors duration-200 ${
                  isActive ? "text-burdeos" : "text-carbon-soft/60 group-hover:text-burdeos"
                }`}
                style={{ fontFamily: "var(--font-josefin), sans-serif" }}
              >
                {nombre}
              </span>
              <span
                className={`absolute bottom-0 left-0 h-[2px] bg-burdeos transition-all duration-300 ${
                  isActive ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </a>
          )
        })}
      </div>
    </nav>
  )
}
