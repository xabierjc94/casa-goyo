import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Restaurante Casa Goyo — Alcocer, Guadalajara",
  description: "Restaurante tradicional en Alcocer, Guadalajara. Cocina casera y vinos de la tierra.",
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
