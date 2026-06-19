import { createClient } from "@/lib/supabase/server"

type StatCard = {
  label: string
  value: number
  icon: string
  color: string
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch stats
  const [platosResult, reservasResult, galeriaResult] = await Promise.all([
    supabase.from("platos").select("id", { count: "exact" }),
    supabase
      .from("reservas")
      .select("id", { count: "exact" })
      .eq("estado", "pendiente"),
    supabase.from("galeria").select("id", { count: "exact" }),
  ])

  const totalPlatos = platosResult.count || 0
  const pendingReservas = reservasResult.count || 0
  const totalGaleria = galeriaResult.count || 0

  const stats: StatCard[] = [
    {
      label: "Platos en el Menú",
      value: totalPlatos,
      icon: "📖",
      color: "bg-dorado",
    },
    {
      label: "Reservas Pendientes",
      value: pendingReservas,
      icon: "📅",
      color: "bg-burdeos",
    },
    {
      label: "Fotos en Galería",
      value: totalGaleria,
      icon: "🖼️",
      color: "bg-burdeos-light",
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-burdeos mb-2">Panel de Control</h1>
        <p className="text-carbon/60">Bienvenido al panel de administración de Casa Goyo</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow-md border border-dorado/20 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Color Bar */}
            <div className={`${stat.color} h-2`} />

            {/* Content */}
            <div className="p-6">
              <div className="text-4xl mb-4">{stat.icon}</div>
              <p className="text-carbon/70 text-sm font-medium mb-2">{stat.label}</p>
              <p className="text-4xl font-bold text-burdeos">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-burdeos mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/admin/carta"
            className="p-6 bg-white rounded-lg border border-dorado/30 hover:border-dorado hover:shadow-md transition-all text-center"
          >
            <div className="text-3xl mb-2">📖</div>
            <h3 className="font-bold text-burdeos">Gestionar Carta</h3>
            <p className="text-sm text-carbon/60 mt-1">Añade, edita o elimina platos del menú</p>
          </a>

          <a
            href="/admin/reservas"
            className="p-6 bg-white rounded-lg border border-dorado/30 hover:border-dorado hover:shadow-md transition-all text-center"
          >
            <div className="text-3xl mb-2">📅</div>
            <h3 className="font-bold text-burdeos">Gestionar Reservas</h3>
            <p className="text-sm text-carbon/60 mt-1">Confirma o rechaza reservas pendientes</p>
          </a>

          <a
            href="/admin/galeria"
            className="p-6 bg-white rounded-lg border border-dorado/30 hover:border-dorado hover:shadow-md transition-all text-center"
          >
            <div className="text-3xl mb-2">🖼️</div>
            <h3 className="font-bold text-burdeos">Gestionar Galería</h3>
            <p className="text-sm text-carbon/60 mt-1">Actualiza las fotos de la galería</p>
          </a>

          <a
            href="/admin/info"
            className="p-6 bg-white rounded-lg border border-dorado/30 hover:border-dorado hover:shadow-md transition-all text-center"
          >
            <div className="text-3xl mb-2">ℹ️</div>
            <h3 className="font-bold text-burdeos">Información del Restaurante</h3>
            <p className="text-sm text-carbon/60 mt-1">Edita datos de contacto y descripción</p>
          </a>
        </div>
      </div>
    </div>
  )
}
