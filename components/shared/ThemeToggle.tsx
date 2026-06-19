"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDark(document.documentElement.classList.contains("dark"))
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    try { localStorage.setItem("theme", next ? "dark" : "light") } catch {}
  }

  if (!mounted) return <div className="w-8 h-4" />

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
      className="text-muted-warm hover:text-burdeos transition-colors duration-200"
    >
      {dark
        ? <Sun size={15} strokeWidth={1.5} />
        : <Moon size={15} strokeWidth={1.5} />
      }
    </button>
  )
}
