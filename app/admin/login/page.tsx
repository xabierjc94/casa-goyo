"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError("Credenciales inválidas")
        setLoading(false)
        return
      }
      router.push("/admin")
      router.refresh()
    } catch {
      setError("Error inesperado. Intenta de nuevo.")
      setLoading(false)
    }
  }

  const inputClass =
    "w-full bg-transparent border-0 border-b border-crema/20 px-0 py-2.5 text-sm text-crema " +
    "placeholder:text-crema/25 focus:outline-none focus:border-dorado/60 transition-colors duration-200"

  return (
    <div
      className="min-h-screen bg-carbon flex items-center justify-center px-6"
      style={{ fontFamily: "var(--font-josefin), sans-serif" }}
    >
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-14">
          <h1
            className="text-4xl font-light italic text-crema mb-2"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Casa Goyo
          </h1>
          <p className="text-[10px] tracking-[0.3em] uppercase text-dorado/70">
            Panel de administración
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {error && (
            <p className="text-[11px] tracking-wide text-burdeos-light text-center">
              {error}
            </p>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-[10px] tracking-[0.2em] uppercase text-crema/40 mb-2"
            >
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[10px] tracking-[0.2em] uppercase text-crema/40 mb-2"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 border border-dorado/40 text-crema text-[11px] tracking-[0.25em] uppercase hover:bg-dorado/10 hover:border-dorado/80 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "···" : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-12 text-center text-[10px] tracking-widest uppercase text-crema/20">
          © Casa Goyo
        </p>
      </div>
    </div>
  )
}
