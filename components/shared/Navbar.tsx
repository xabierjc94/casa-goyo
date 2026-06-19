"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useState, useCallback } from "react"
import { Menu, X } from "lucide-react"
import ThemeToggle from "@/components/shared/ThemeToggle"

const NAVBAR_LINKS = [
  { href: (locale: string) => `/${locale}`,         label: "carta" },
  { href: (locale: string) => `/${locale}/info`,    label: "info" },
  { href: (locale: string) => `/${locale}/galeria`, label: "galeria" },
]

export default function Navbar() {
  const t        = useTranslations("nav")
  const locale   = useLocale()
  const pathname = usePathname()
  const router   = useRouter()
  const [open, setOpen] = useState(false)

  const links = NAVBAR_LINKS.map((link) => ({
    href:  link.href(locale),
    label: t(link.label),
  }))

  const toggleLocale = useCallback(() => {
    const newLocale = locale === "es" ? "en" : "es"
    router.push(pathname.replace(`/${locale}`, `/${newLocale}`))
  }, [locale, pathname, router])

  const isActive = (href: string) => pathname === href

  return (
    <nav className="sticky top-0 z-50 bg-crema/96 backdrop-blur-md border-b border-burdeos/10">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-[68px]">

        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="flex flex-col leading-none group"
          aria-label="Casa Goyo — Inicio"
        >
          <span
            className="font-display text-2xl font-light italic text-burdeos tracking-wide transition-opacity group-hover:opacity-80"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Casa Goyo
          </span>
          <span
            className="font-ui text-[9px] tracking-[0.3em] uppercase text-muted-warm mt-0.5"
            style={{ fontFamily: "var(--font-josefin), sans-serif" }}
          >
            Restaurante · Alcocer
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative group"
              style={{ fontFamily: "var(--font-josefin), sans-serif" }}
            >
              <span
                className={`text-[11px] tracking-[0.18em] uppercase transition-colors duration-200 ${
                  isActive(link.href) ? "text-burdeos" : "text-carbon-soft hover:text-burdeos"
                }`}
              >
                {link.label}
              </span>
              <span
                className={`absolute -bottom-0.5 left-0 h-px bg-burdeos transition-all duration-300 ${
                  isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
          ))}

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Language toggle */}
          <button
            onClick={toggleLocale}
            className="text-[11px] tracking-[0.18em] uppercase text-muted-warm hover:text-burdeos transition-colors duration-200 border-l border-burdeos/15 pl-5"
            style={{ fontFamily: "var(--font-josefin), sans-serif" }}
            aria-label={locale === "es" ? "Switch to English" : "Cambiar a Español"}
          >
            {locale === "es" ? "EN" : "ES"}
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-burdeos hover:opacity-70 transition-opacity"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden bg-crema border-t border-burdeos/10 px-6 py-6 flex flex-col gap-5"
          role="navigation"
          aria-label="Navegación móvil"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[11px] tracking-[0.22em] uppercase transition-colors ${
                isActive(link.href) ? "text-burdeos" : "text-carbon-soft hover:text-burdeos"
              }`}
              style={{ fontFamily: "var(--font-josefin), sans-serif" }}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-burdeos/10">
            <button
              onClick={() => { toggleLocale(); setOpen(false) }}
              className="text-[11px] tracking-[0.22em] uppercase text-muted-warm hover:text-burdeos transition-colors"
              style={{ fontFamily: "var(--font-josefin), sans-serif" }}
              aria-label={locale === "es" ? "Switch to English" : "Cambiar a Español"}
            >
              {locale === "es" ? "English" : "Español"}
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
