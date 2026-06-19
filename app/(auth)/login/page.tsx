"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const supabase = createClient()

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message || "Error al iniciar sesión")
        setLoading(false)
        return
      }

      // Redirect to admin dashboard
      router.push("/admin")
      router.refresh()
    } catch (err) {
      setError("Error inesperado. Por favor intenta de nuevo.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-crema flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-burdeos mb-2">Casa Goyo</h1>
          <p className="text-carbon/70">Panel de Administración</p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-8 border border-dorado/20"
        >
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Email Field */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-carbon mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full px-4 py-2 border border-dorado/30 rounded bg-white text-carbon placeholder:text-carbon/40 focus:outline-none focus:ring-2 focus:ring-dorado focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div className="mb-8">
            <label htmlFor="password" className="block text-sm font-medium text-carbon mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 border border-dorado/30 rounded bg-white text-carbon placeholder:text-carbon/40 focus:outline-none focus:ring-2 focus:ring-dorado focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-burdeos text-crema font-medium rounded hover:bg-burdeos-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-carbon/60">
          <p>Restaurante Casa Goyo © 2024</p>
        </div>
      </div>
    </div>
  )
}
