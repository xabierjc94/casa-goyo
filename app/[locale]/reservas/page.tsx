import { getTranslations } from "next-intl/server"
import FormularioReserva from "@/components/reservas/FormularioReserva"

export default async function ReservasPage() {
  const t = await getTranslations("reservas")

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-serif text-4xl text-burdeos text-center mb-2">
        {t("titulo")}
      </h1>
      <div className="flex justify-center mb-8">
        <div className="w-24 h-0.5 bg-dorado" />
      </div>
      <FormularioReserva />
    </div>
  )
}
