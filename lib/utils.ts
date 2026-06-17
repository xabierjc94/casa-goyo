import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrecio(precio: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(precio)
}

export const ALERGENOS_LABELS: Record<string, { es: string; en: string }> = {
  gluten: { es: "Gluten", en: "Gluten" },
  lacteos: { es: "Lácteos", en: "Dairy" },
  huevos: { es: "Huevos", en: "Eggs" },
  pescado: { es: "Pescado", en: "Fish" },
  marisco: { es: "Marisco", en: "Shellfish" },
  frutos_secos: { es: "Frutos Secos", en: "Nuts" },
  soja: { es: "Soja", en: "Soy" },
  apio: { es: "Apio", en: "Celery" },
  mostaza: { es: "Mostaza", en: "Mustard" },
  sesamo: { es: "Sésamo", en: "Sesame" },
  sulfitos: { es: "Sulfitos", en: "Sulphites" },
  moluscos: { es: "Moluscos", en: "Molluscs" },
}
