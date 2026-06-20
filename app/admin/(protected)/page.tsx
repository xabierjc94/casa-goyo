import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { BookOpen, CalendarDays, Images, Info, ArrowRight, UtensilsCrossed } from "lucide-react"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [platosResult, reservasResult, galeriaResult] = await Promise.all([
    supabase.from("platos").select("id", { count: "exact" }),
    supabase.from("reservas").select("id", { count: "exact" }).eq("estado", "pendiente"),
    supabase.from("galeria").select("id", { count: "exact" }),
  ])

  const stats = [
    {
      label: "Platos en el Menú",
      value: platosResult.count ?? 0,
      icon: BookOpen,
      accent: "#7B1527",
    },
    {
      label: "Reservas Pendientes",
      value: reservasResult.count ?? 0,
      icon: CalendarDays,
      accent: "#B8870B",
    },
    {
      label: "Elementos en Galería",
      value: galeriaResult.count ?? 0,
      icon: Images,
      accent: "#7B1527",
    },
  ]

  const actions = [
    { href: "/admin/carta",    icon: BookOpen,      title: "Gestionar Carta",               desc: "Añade, edita o elimina platos del menú" },
    { href: "/admin/reservas", icon: CalendarDays,  title: "Gestionar Reservas",             desc: "Confirma o rechaza reservas pendientes" },
    { href: "/admin/galeria",  icon: Images,        title: "Gestionar Galería",              desc: "Sube fotos y vídeos de la galería" },
    { href: "/admin/info",     icon: Info,          title: "Información del Restaurante",    desc: "Edita datos de contacto y descripción" },
  ]

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-1">
          <UtensilsCrossed size={14} className="text-dorado/60" />
          <span
            className="text-[10px] tracking-[0.35em] uppercase text-dorado/70"
            style={{ fontFamily: "var(--font-josefin), sans-serif" }}
          >
            Restaurante Casa Goyo
          </span>
        </div>
        <h1
          className="text-4xl font-light italic text-carbon mb-4"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Panel de Control
        </h1>
        <div className="h-px bg-gradient-to-r from-burdeos/30 via-dorado/20 to-transparent w-64" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, accent }) => (
          <div
            key={label}
            className="relative bg-carbon rounded-sm overflow-hidden group"
            style={{ boxShadow: "0 2px 20px rgba(26,10,10,0.12)" }}
          >
            {/* Subtle top accent line */}
            <div className="h-px" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />

            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div
                  className="w-9 h-9 rounded-sm flex items-center justify-center"
                  style={{ background: `${accent}22`, border: `1px solid ${accent}33` }}
                >
                  <Icon size={16} style={{ color: accent }} />
                </div>
                <span
                  className="text-[9px] tracking-[0.3em] uppercase text-crema/20"
                  style={{ fontFamily: "var(--font-josefin), sans-serif" }}
                >
                  Total
                </span>
              </div>

              <p
                className="text-5xl font-light text-crema mb-2 leading-none"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                {value}
              </p>
              <p
                className="text-[10px] tracking-[0.2em] uppercase text-crema/40"
                style={{ fontFamily: "var(--font-josefin), sans-serif" }}
              >
                {label}
              </p>
            </div>

            {/* Bottom shimmer on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: "linear-gradient(135deg, rgba(184,135,11,0.03) 0%, transparent 60%)" }}
            />
          </div>
        ))}
      </div>

      {/* Section label */}
      <div className="flex items-center gap-4 mb-5">
        <p
          className="text-[10px] tracking-[0.3em] uppercase text-muted-warm"
          style={{ fontFamily: "var(--font-josefin), sans-serif" }}
        >
          Acciones Rápidas
        </p>
        <div className="flex-1 h-px bg-burdeos/10" />
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {actions.map(({ href, icon: Icon, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-5 bg-white border border-dorado/15 rounded-sm px-5 py-4 hover:border-dorado/40 hover:shadow-[0_2px_16px_rgba(123,21,39,0.06)] transition-all duration-300"
          >
            <div className="shrink-0 w-10 h-10 rounded-sm bg-crema border border-dorado/20 flex items-center justify-center group-hover:bg-dorado/8 group-hover:border-dorado/35 transition-all duration-300">
              <Icon size={17} className="text-burdeos/70 group-hover:text-burdeos transition-colors" />
            </div>

            <div className="flex-1 min-w-0">
              <p
                className="text-[11px] tracking-[0.18em] uppercase text-carbon font-medium mb-0.5"
                style={{ fontFamily: "var(--font-josefin), sans-serif" }}
              >
                {title}
              </p>
              <p
                className="text-[11px] text-muted-warm leading-snug"
                style={{ fontFamily: "var(--font-josefin), sans-serif" }}
              >
                {desc}
              </p>
            </div>

            <ArrowRight
              size={15}
              className="shrink-0 text-dorado/30 group-hover:text-dorado/70 group-hover:translate-x-0.5 transition-all duration-300"
            />
          </Link>
        ))}
      </div>

    </div>
  )
}
