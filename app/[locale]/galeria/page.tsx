import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import GaleriaGrid from "@/components/galeria/GaleriaGrid"

export default async function GaleriaPage() {
  const t = await getTranslations("galeria")
  const supabase = await createClient()

  const { data: fotos } = await supabase
    .from("galeria")
    .select("*")
    .eq("activo", true)
    .order("orden")

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-serif text-4xl text-burdeos text-center mb-2">
        {t("titulo")}
      </h1>
      <div className="flex justify-center mb-10">
        <div className="w-24 h-0.5 bg-dorado" />
      </div>
      <GaleriaGrid fotos={fotos ?? []} />
    </div>
  )
}
