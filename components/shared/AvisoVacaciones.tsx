// Vacation closure notice — auto-hides after Oct 2, 2026
const FIN_VACACIONES = new Date("2026-10-02T23:59:59")

const TEXTO = {
  es: "Permaneceremos cerrados por vacaciones desde el día 21 de septiembre hasta el 2 de octubre (ambos incluidos). Volvemos el día 3 de octubre. Disculpen las molestias.",
  en: "We will be closed for holidays from September 21st to October 2nd (both included). We reopen on October 3rd. We apologize for any inconvenience.",
} as const

type Props = { locale: "es" | "en"; destacado?: boolean }

export default function AvisoVacaciones({ locale, destacado = false }: Props) {
  if (new Date() > FIN_VACACIONES) return null

  const texto = TEXTO[locale]

  if (destacado) {
    return (
      <div
        className="animate-parpadeo mt-6 mx-auto max-w-lg border-2 border-burdeos bg-burdeos px-6 py-4 rounded text-center"
        style={{ fontFamily: "var(--font-josefin), sans-serif" }}
      >
        <p className="text-[9px] tracking-[0.28em] uppercase text-dorado-light mb-2">
          {locale === "es" ? "◆ Aviso importante ◆" : "◆ Important notice ◆"}
        </p>
        <p className="text-[11px] tracking-[0.08em] text-crema leading-relaxed">
          {texto}
        </p>
      </div>
    )
  }

  return (
    <div className="animate-parpadeo border-t border-burdeos/15 bg-burdeos/[0.06] px-6 py-4">
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
