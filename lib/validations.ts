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
  nombre: z.string().min(2, "Nombre requerido").max(100, "Nombre muy largo"),
  email: z.string().email("Email inválido").max(255, "Email muy largo"),
  telefono: z.string()
    .optional()
    .refine(
      (val) => !val || /^\d[\d\s\-\+\(\)]{8,19}$/.test(val),
      "Teléfono inválido"
    )
    .refine(
      (val) => !val || val.length <= 20,
      "Teléfono muy largo"
    ),
  fecha: z.string()
    .min(1, "Fecha requerida")
    .refine(
      (val) => new Date(val) > new Date(),
      "La fecha debe ser en el futuro"
    ),
  hora: z.string().min(1, "Hora requerida"),
  personas: z.number().int().min(1, "Mínimo 1 persona").max(50, "Máximo 50 personas"),
  notas: z.string().optional().refine(
    (val) => !val || val.length <= 1000,
    "Notas muy largas"
  ),
})

export type ReservaInput = z.infer<typeof ReservaSchema>
