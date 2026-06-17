// lib/supabase/types.ts
export type Seccion = {
  id: string
  slug: string
  nombre_es: string
  nombre_en: string
  padre_slug: string | null
  orden: number
  activo: boolean
}

export type Plato = {
  id: string
  seccion_slug: string
  nombre_es: string
  nombre_en: string
  descripcion_es: string | null
  descripcion_en: string | null
  precio: number
  foto_url: string | null
  alergenos: string[]
  es_vegano: boolean
  sin_gluten: boolean
  activo: boolean
  orden: number
}

export type Reserva = {
  id: string
  nombre: string
  email: string
  telefono: string | null
  fecha: string
  hora: string
  personas: number
  notas: string | null
  estado: "pendiente" | "confirmada" | "cancelada"
  created_at: string
}

export type Galeria = {
  id: string
  foto_url: string
  alt_es: string | null
  alt_en: string | null
  orden: number
  activo: boolean
}

export type InfoRestaurante = {
  id: number
  nombre: string
  direccion: string | null
  telefono: string | null
  email: string | null
  horario_es: string | null
  horario_en: string | null
  descripcion_es: string | null
  descripcion_en: string | null
}
