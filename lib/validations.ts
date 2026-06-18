import { z } from "zod"

export const PlatoSchema = z.object({
  nombre_es: z.string().min(1, "Nombre requerido"),
  nombre_en: z.string().min(1, "Name required"),
  descripcion_es: z.string().optional(),
  descripcion_en: z.string().optional(),
  precio: z.coerce.number().min(0),
  alergenos: z.array(z.string()).optional(),
  es_vegano: z.boolean().optional(),
  sin_gluten: z.boolean().optional(),
})

export type PlatoInput = z.infer<typeof PlatoSchema>

export const ReservaSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  fecha: z.string().min(1, "Fecha requerida"),
  hora: z.string().min(1, "Hora requerida"),
  personas: z.number().int().min(1, "Mínimo 1 persona").max(50, "Máximo 50 personas"),
  notas: z.string().optional(),
})

export type ReservaInput = z.infer<typeof ReservaSchema>
