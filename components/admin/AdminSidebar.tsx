"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { Menu, X, LogOut } from "lucide-react"

const ADMIN_LINKS = [
  { href: "/admin", label: "Panel", icon: "📊" },
  { href: "/admin/carta", label: "Carta", icon: "📖" },
  { href: "/admin/reservas", label: "Reservas", icon: "📅" },
  { href: "/admin/galeria", label: "Galería", icon: "🖼️" },
  { href: "/admin/info", label: "Información", icon: "ℹ️" },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/admin/login")
      router.refresh()
    } catch (error) {
      console.error("Error logging out:", error)
      setLoggingOut(false)
    }
  }

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin"
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed top-4 left-4 z-40 md:hidden p-2 bg-burdeos text-crema rounded hover:bg-burdeos-dark transition-colors"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0 z-30 h-screen w-64 bg-burdeos text-crema
          transform transition-transform duration-300 md:transform-none
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-burdeos-light">
          <h1 className="text-xl font-bold text-dorado">Casa Goyo</h1>
          <p className="text-sm text-crema/70 mt-1">Administración</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="p-4 space-y-2">
            {ADMIN_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`
                    block px-4 py-3 rounded transition-colors
                    ${
                      isActive(link.href)
                        ? "bg-dorado text-burdeos font-medium"
                        : "text-crema hover:bg-burdeos-light"
                    }
                  `}
                  onClick={() => setOpen(false)}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-burdeos-light">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-burdeos-dark text-crema rounded hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <LogOut size={18} />
            {loggingOut ? "Cerrando..." : "Cerrar Sesión"}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
