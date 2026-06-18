"use client"
import { useLocale } from "next-intl"
import { useEffect, useState } from "react"
import type { Seccion } from "@/lib/supabase/types"

type Props = { secciones: Seccion[] }

export default function NavCarta({ secciones }: Props) {
  const locale = useLocale() as "es" | "en"
  const [active, setActive] = useState<string>("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting)
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: "-30% 0px -60% 0px" }
    )

    secciones.forEach(({ slug }) => {
      const el = document.getElementById(slug)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [secciones])

  return (
    <nav className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
      {secciones.map((s) => (
        <a
          key={s.slug}
          href={`#${s.slug}`}
          className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            active === s.slug
              ? "bg-burdeos text-crema border-burdeos"
              : "border-burdeos/30 text-burdeos hover:bg-burdeos/10"
          }`}
        >
          {locale === "es" ? s.nombre_es : s.nombre_en}
        </a>
      ))}
    </nav>
  )
}
