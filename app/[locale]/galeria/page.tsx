import { createClient } from "@/lib/supabase/server"
import { getTranslations, getLocale } from "next-intl/server"
import GaleriaGrid from "@/components/galeria/GaleriaGrid"

export const revalidate = 3600

export default async function GaleriaPage() {
  const [t, locale] = await Promise.all([
    getTranslations("galeria"),
    getLocale() as Promise<"es" | "en">,
  ])
  const supabase = await createClient()

  const { data: fotos } = await supabase
    .from("galeria")
    .select("*")
    .eq("activo", true)
    .order("orden")

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">

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
