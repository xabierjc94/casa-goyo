import { getTranslations } from "next-intl/server"
import FormularioReserva from "@/components/reservas/FormularioReserva"

export default async function ReservasPage() {
  const t = await getTranslations("reservas")

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1
          className="text-5xl font-light italic text-burdeos mb-5"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {t("titulo")}
        </h1>
        <div className="divider-ornamental max-w-xs mx-auto">◆</div>
      </div>
      <FormularioReserva />
    </div>
  )
}
