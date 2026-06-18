"use client"

import { useTranslations } from "next-intl"

export default function Footer() {
  const t = useTranslations("footer")
  const year = new Date().getFullYear()

  return (
    <footer className="bg-carbon text-crema/80 py-8 mt-16">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <p className="font-serif text-xl text-dorado mb-2">Restaurante Casa Goyo</p>
        <p className="text-sm">Alcocer, Guadalajara</p>
        <p className="text-xs mt-4 text-crema/40">
          © {year} Casa Goyo — {t("derechos")}
        </p>
      </div>
    </footer>
  )
}
