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

// Los 14 alérgenos de declaración obligatoria según el Reglamento UE 1169/2011
export const ALERGENOS_LABELS: Record<string, { es: string; en: string }> = {
  gluten:       { es: "Gluten",        en: "Gluten" },
  lacteos:      { es: "Lácteos",       en: "Dairy" },
  huevos:       { es: "Huevos",        en: "Eggs" },
  pescado:      { es: "Pescado",       en: "Fish" },
  marisco:      { es: "Crustáceos",    en: "Crustaceans" },
  cacahuetes:   { es: "Cacahuetes",    en: "Peanuts" },
  frutos_secos: { es: "Frutos Secos",  en: "Tree Nuts" },
  soja:         { es: "Soja",          en: "Soy" },
  apio:         { es: "Apio",          en: "Celery" },
  mostaza:      { es: "Mostaza",       en: "Mustard" },
  sesamo:       { es: "Sésamo",        en: "Sesame" },
  sulfitos:     { es: "Sulfitos",      en: "Sulphites" },
  altramuces:   { es: "Altramuces",    en: "Lupin" },
  moluscos:     { es: "Moluscos",      en: "Molluscs" },
}
