import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { getLocale } from "next-intl/server"
import { MapPin, Phone, Clock } from "lucide-react"

export default async function InfoPage() {
  const t = await getTranslations("info")
  const locale = await getLocale()
  const supabase = await createClient()

  const { data: info } = await supabase
    .from("info_restaurante")
    .select("*")
    .single()

  const horario = locale === "es" ? info?.horario_es : info?.horario_en

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-serif text-4xl text-burdeos text-center mb-2">
        {t("titulo")}
      </h1>
      <div className="flex justify-center mb-10">
        <div className="w-24 h-0.5 bg-dorado" />
      </div>

      <div className="space-y-6">
        {info?.telefono && (
          <div className="flex gap-4 items-start bg-white rounded-xl p-5 shadow-sm border border-dorado/10">
            <Phone className="text-burdeos mt-0.5" size={20} />
            <div>
              <p className="font-medium text-sm uppercase tracking-wide text-carbon/50 mb-1">
                {t("telefono")}
              </p>
              <a
                href={`tel:${info.telefono}`}
                className="text-lg font-serif text-carbon hover:text-burdeos"
              >
                {info.telefono}
              </a>
            </div>
          </div>
        )}

        {info?.direccion && (
          <div className="flex gap-4 items-start bg-white rounded-xl p-5 shadow-sm border border-dorado/10">
            <MapPin className="text-burdeos mt-0.5" size={20} />
            <div>
              <p className="font-medium text-sm uppercase tracking-wide text-carbon/50 mb-1">
                {t("direccion")}
              </p>
              <p className="text-lg font-serif text-carbon">{info.direccion}</p>
            </div>
          </div>
        )}

        {horario && (
          <div className="flex gap-4 items-start bg-white rounded-xl p-5 shadow-sm border border-dorado/10">
            <Clock className="text-burdeos mt-0.5" size={20} />
            <div>
              <p className="font-medium text-sm uppercase tracking-wide text-carbon/50 mb-1">
                {t("horario")}
              </p>
              <pre className="text-sm text-carbon whitespace-pre-wrap font-sans leading-relaxed">
                {horario}
              </pre>
            </div>
          </div>
        )}

        {info?.direccion && (
          <div className="rounded-xl overflow-hidden border border-dorado/10 h-56">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                info.direccion
              )}&output=embed`}
              className="w-full h-full"
              loading="lazy"
              title="Restaurant location map"
            />
          </div>
        )}
      </div>
    </div>
  )
}
