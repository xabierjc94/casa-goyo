import { createClient } from "@/lib/supabase/server"
import { getTranslations, setRequestLocale } from "next-intl/server"
import GaleriaGrid from "@/components/galeria/GaleriaGrid"

export const revalidate = 3600

export function generateStaticParams() {
  return [{ locale: "es" }, { locale: "en" }]
}

export default async function GaleriaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params
  const locale = rawLocale as "es" | "en"
  setRequestLocale(locale)
  const t = await getTranslations("galeria")
  const supabase = await createClient()

  const { data: fotos } = await supabase
    .from("galeria")
    .select("*")
    .eq("activo", true)
    .order("orden")

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">

      {/* Heading */}
      <div className="text-center mb-14">
        <h1
          className="text-5xl font-light italic text-burdeos mb-5"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {t("titulo")}
        </h1>
        <div className="divider-ornamental max-w-xs mx-auto">◆</div>
      </div>

      <GaleriaGrid fotos={fotos ?? []} locale={locale} />
    </div>
  )
}
