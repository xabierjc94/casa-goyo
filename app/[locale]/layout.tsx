import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import Navbar from "@/components/shared/Navbar"
import Footer from "@/components/shared/Footer"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
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
  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* Fixed landscape background — photo in public/bg.jpg */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "url('/bg3.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center 35%",
        }}
      />
      {/* Cream overlay for readability */}
      <div className="fixed inset-0 -z-10 bg-crema/82" />

      <Navbar />
      <main>{children}</main>
      <BannerVacaciones locale={locale as "es" | "en"} />
      <Footer />
    </NextIntlClientProvider>
  )
}

function BannerVacaciones({ locale }: { locale: "es" | "en" }) {
  if (new Date() > new Date("2026-10-02T23:59:59")) return null

  const texto =
    locale === "es"
      ? "Permaneceremos cerrados por vacaciones desde el día 21 de septiembre hasta el 2 de octubre (ambos incluidos). Volvemos el día 3 de octubre. Disculpen las molestias."
      : "We will be closed for holidays from September 21st to October 2nd (both included). We reopen on October 3rd. We apologize for any inconvenience."

  return (
    <div className="border-t border-burdeos/15 bg-burdeos/[0.06] px-6 py-4">
      <p
        className="max-w-2xl mx-auto text-center text-[0.7rem] tracking-[0.1em] text-carbon/65 leading-relaxed"
        style={{ fontFamily: "var(--font-josefin), sans-serif" }}
      >
        <span className="text-burdeos/70 mr-2">◆</span>
        {texto}
        <span className="text-burdeos/70 ml-2">◆</span>
      </p>
    </div>
  )
}
