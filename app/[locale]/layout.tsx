import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import Navbar from "@/components/shared/Navbar"
import Footer from "@/components/shared/Footer"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: "Restaurante Casa Goyo — Alcocer, Guadalajara",
    description: locale === "es"
      ? "Restaurante tradicional en Alcocer, Guadalajara. Cocina casera, productos de temporada y vinos de la tierra."
      : "Traditional restaurant in Alcocer, Guadalajara. Home cooking, seasonal produce and local wines.",
    icons: { icon: "/favicon.ico" },
  }
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
      <Navbar />
      <main>{children}</main>
      <Footer />
    </NextIntlClientProvider>
  )
}
