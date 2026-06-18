"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const t = useTranslations("nav")
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const links = [
    { href: `/${locale}`, label: t("carta") },
    { href: `/${locale}/reservas`, label: t("reservas") },
    { href: `/${locale}/info`, label: t("info") },
    { href: `/${locale}/galeria`, label: t("galeria") },
  ]

  function toggleLocale() {
    const newLocale = locale === "es" ? "en" : "es"
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPath)
  }

  return (
    <nav className="sticky top-0 z-50 bg-crema/95 backdrop-blur border-b border-dorado/20">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href={`/${locale}`}>
          <Image
            src="/logo.svg"
            alt="Casa Goyo"
            width={120}
            height={48}
            className="object-contain"
            priority
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-carbon hover:text-burdeos font-medium transition-colors text-sm uppercase tracking-wide"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={toggleLocale}
            className="ml-4 px-3 py-1 border border-burdeos text-burdeos text-xs font-bold rounded hover:bg-burdeos hover:text-crema transition-colors"
          >
            {locale === "es" ? "EN" : "ES"}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-carbon hover:text-burdeos transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-crema border-t border-dorado/20 px-4 py-4 flex flex-col gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-carbon font-medium hover:text-burdeos transition-colors"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => {
              toggleLocale()
              setOpen(false)
            }}
            className="text-left text-burdeos font-bold text-sm hover:text-burdeos-dark transition-colors"
          >
            {locale === "es" ? "Switch to English" : "Cambiar a Español"}
          </button>
        </div>
      )}
    </nav>
  )
}
