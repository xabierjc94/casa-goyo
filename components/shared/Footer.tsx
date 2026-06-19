"use client"

import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import Link from "next/link"

const CURRENT_YEAR = new Date().getFullYear()

export default function Footer() {
  const t      = useTranslations("footer")
  const locale = useLocale()

  return (
    <footer className="bg-carbon text-crema mt-24">
      {/* Top ornamental rule */}
      <div className="h-px bg-gradient-to-r from-transparent via-dorado/40 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">

          {/* Brand */}
          <div className="md:col-span-1">
            <p
              className="text-3xl font-light italic text-crema mb-1"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Casa Goyo
            </p>
            <p
              className="text-[9px] tracking-[0.28em] uppercase text-dorado mb-5"
              style={{ fontFamily: "var(--font-josefin), sans-serif" }}
            >
              Restaurante · Alcocer
            </p>
            <p
              className="text-crema/40 text-xs leading-relaxed"
              style={{ fontFamily: "var(--font-josefin), sans-serif" }}
            >
              Cocina tradicional castellana<br />en el corazón de la Alcarria
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p
              className="text-[9px] tracking-[0.25em] uppercase text-dorado mb-4"
              style={{ fontFamily: "var(--font-josefin), sans-serif" }}
            >
              Páginas
            </p>
            <ul className="space-y-2.5">
              {[
                { href: `/${locale}`,          label: "Carta" },
                { href: `/${locale}/info`,      label: "Información" },
                { href: `/${locale}/galeria`,   label: "Galería" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-crema/50 hover:text-crema text-xs tracking-wide transition-colors"
                    style={{ fontFamily: "var(--font-josefin), sans-serif" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p
              className="text-[9px] tracking-[0.25em] uppercase text-dorado mb-4"
              style={{ fontFamily: "var(--font-josefin), sans-serif" }}
            >
              Contacto
            </p>
            <address
              className="not-italic text-crema/50 text-xs leading-relaxed space-y-1.5"
              style={{ fontFamily: "var(--font-josefin), sans-serif" }}
            >
              <p>Alcocer, Guadalajara</p>
              <p>Castilla-La Mancha, España</p>
              <p>
                <a href="tel:+34949355003" className="hover:text-crema/80 transition-colors">
                  949 355 003
                </a>
              </p>
            </address>
          </div>
        </div>

        {/* Bottom rule */}
        <div className="mt-12 pt-6 border-t border-crema/8 flex flex-col md:flex-row justify-between items-center gap-3">
          <p
            className="text-crema/25 text-[10px] tracking-widest uppercase"
            style={{ fontFamily: "var(--font-josefin), sans-serif" }}
          >
            © {CURRENT_YEAR} Casa Goyo — {t("derechos")}
          </p>
          <div
            className="text-[10px] tracking-[0.2em] text-dorado/50 uppercase"
            style={{ fontFamily: "var(--font-josefin), sans-serif" }}
          >
            ◆
          </div>
        </div>
      </div>
    </footer>
  )
}
