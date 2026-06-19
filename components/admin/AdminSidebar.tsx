"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { Menu, X, LogOut, LayoutDashboard, BookOpen, CalendarDays, Images, Info } from "lucide-react"
import { toast } from "sonner"

const ADMIN_LINKS = [
  { href: "/admin",         label: "Panel",       icon: LayoutDashboard, exact: true },
  { href: "/admin/carta",   label: "Carta",       icon: BookOpen,        exact: false },
  { href: "/admin/reservas",label: "Reservas",    icon: CalendarDays,    exact: false },
  { href: "/admin/galeria", label: "Galería",     icon: Images,          exact: false },
  { href: "/admin/info",    label: "Información", icon: Info,            exact: false },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [open,       setOpen]       = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/admin/login")
      router.refresh()
    } catch {
      toast.error("No se pudo cerrar sesión.")
      setLoggingOut(false)
    }
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-40 md:hidden p-2.5 bg-carbon text-crema hover:bg-carbon-soft transition-colors"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0 z-30 h-screen w-56 bg-carbon text-crema flex flex-col
          transform transition-transform duration-300 ease-in-out md:transform-none
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Brand */}
        <div className="px-6 py-7 border-b border-crema/8">
          <p
            className="text-2xl font-light italic text-crema"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Casa Goyo
          </p>
          <p
            className="text-[9px] tracking-[0.25em] uppercase text-dorado/60 mt-0.5"
            style={{ fontFamily: "var(--font-josefin), sans-serif" }}
          >
            Administración
          </p>
        </div>

        {/* Nav */}
        <nav
          className="flex-1 overflow-y-auto py-4"
          style={{ fontFamily: "var(--font-josefin), sans-serif" }}
        >
          {ADMIN_LINKS.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-6 py-3.5 text-[11px] tracking-[0.12em] uppercase transition-colors duration-150 ${
                  active
                    ? "text-dorado bg-crema/5 border-l-2 border-dorado"
                    : "text-crema/50 hover:text-crema hover:bg-crema/5 border-l-2 border-transparent"
                }`}
              >
                <Icon size={14} className="shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-6 py-5 border-t border-crema/8">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 text-[11px] tracking-[0.12em] uppercase text-crema/40 hover:text-crema transition-colors duration-150 disabled:opacity-30"
            style={{ fontFamily: "var(--font-josefin), sans-serif" }}
          >
            <LogOut size={14} />
            {loggingOut ? "···" : "Cerrar sesión"}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-carbon/60 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
