import { createClient } from "@/lib/supabase/server"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Phone, MapPin, Clock } from "lucide-react"

export const revalidate = 3600

export function generateStaticParams() {
  return [{ locale: "es" }, { locale: "en" }]
}

export default async function InfoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params
  const locale = rawLocale as "es" | "en"
  setRequestLocale(locale)
  const t = await getTranslations("info")
  const supabase = await createClient()

  const { data: info } = await supabase.from("info_restaurante").select("*").single()
  const horario = locale === "es" ? info?.horario_es : info?.horario_en

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">

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

      <div className="space-y-0">

        {info?.telefono && (
          <InfoRow icon={<Phone size={15} className="text-dorado mt-0.5 shrink-0" />} label={t("telefono")}>
            <a
              href={`tel:${info.telefono}`}
              className="link-elegante text-carbon hover:text-burdeos"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.2rem" }}
            >
              {info.telefono}
            </a>
          </InfoRow>
        )}

        {info?.email && (
          <InfoRow icon={<span className="text-dorado text-sm mt-0.5 shrink-0">@</span>} label={t("email") ?? "Email"}>
            <a
              href={`mailto:${info.email}`}
              className="link-elegante text-carbon hover:text-burdeos"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.1rem" }}
            >
              {info.email}
            </a>
          </InfoRow>
        )}

        {info?.direccion && (
          <InfoRow icon={<MapPin size={15} className="text-dorado mt-0.5 shrink-0" />} label={t("direccion")}>
            <p
              className="text-carbon"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.2rem" }}
            >
              {info.direccion}
            </p>
          </InfoRow>
        )}

        {horario && (
          <InfoRow icon={<Clock size={15} className="text-dorado mt-0.5 shrink-0" />} label={t("horario")}>
            <pre
              className="whitespace-pre-wrap leading-relaxed text-carbon/80 text-sm"
              style={{ fontFamily: "var(--font-josefin), sans-serif" }}
            >
              {horario}
            </pre>
          </InfoRow>
        )}
      </div>

      {info?.direccion && (
        <div className="mt-12 border border-burdeos/10 overflow-hidden" style={{ height: 260 }}>
          <iframe
            src={`https://maps.google.com/maps?q=${encodeURIComponent(info.direccion)}&output=embed`}
            className="w-full h-full grayscale opacity-80 hover:opacity-100 transition-opacity duration-300"
            loading="lazy"
            title="Localización del restaurante"
          />
        </div>
      )}
    </div>
  )
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-5 py-7 border-b border-burdeos/8 last:border-b-0">
      <div className="w-5 flex justify-center pt-0.5">{icon}</div>
      <div className="flex-1">
        <p
          className="text-[10px] tracking-[0.22em] uppercase text-muted-warm mb-2"
          style={{ fontFamily: "var(--font-josefin), sans-serif" }}
        >
          {label}
        </p>
        {children}
      </div>
    </div>
  )
}
