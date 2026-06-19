import { createClient } from "@/lib/supabase/server"

type StatCard = {
  label: string
  value: number
  icon: string
  color: string
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [platosResult, reservasResult, galeriaResult] = await Promise.all([
    supabase.from("platos").select("id", { count: "exact" }),
    supabase.from("reservas").select("id", { count: "exact" }).eq("estado", "pendiente"),
    supabase.from("galeria").select("id", { count: "exact" }),
  ])

  const stats: StatCard[] = [
    { label: "Platos en el Menú", value: platosResult.count || 0, icon: "📖", color: "bg-dorado" },
    { label: "Reservas Pendientes", value: reservasResult.count || 0, icon: "📅", color: "bg-burdeos" },
    { label: "Fotos en Galería", value: galeriaResult.count || 0, icon: "🖼️", color: "bg-burdeos-light" },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-burdeos mb-2">Panel de Control</h1>
        <p className="text-carbon/60">Bienvenido al panel de administración de Casa Goyo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-md border border-dorado/20 overflow-hidden hover:shadow-lg transition-shadow">
            <div className={`${stat.color} h-2`} />
            <div className="p-6">
              <div className="text-4xl mb-4">{stat.icon}</div>
              <p className="text-carbon/70 text-sm font-medium mb-2">{stat.label}</p>
              <p className="text-4xl font-bold text-burdeos">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-burdeos mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { href: "/admin/carta", icon: "📖", title: "Gestionar Carta", desc: "Añade, edita o elimina platos del menú" },
            { href: "/admin/reservas", icon: "📅", title: "Gestionar Reservas", desc: "Confirma o rechaza reservas pendientes" },
            { href: "/admin/galeria", icon: "🖼️", title: "Gestionar Galería", desc: "Actualiza las fotos de la galería" },
            { href: "/admin/info", icon: "ℹ️", title: "Información del Restaurante", desc: "Edita datos de contacto y descripción" },
          ].map(({ href, icon, title, desc }) => (
            <a key={href} href={href} className="p-6 bg-white rounded-lg border border-dorado/30 hover:border-dorado hover:shadow-md transition-all text-center">
              <div className="text-3xl mb-2">{icon}</div>
              <h3 className="font-bold text-burdeos">{title}</h3>
              <p className="text-sm text-carbon/60 mt-1">{desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
