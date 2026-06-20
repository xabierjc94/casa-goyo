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
export const ALERGENOS_LABELS: Record<string, { es: string; en: string; symbol: string }> = {
  gluten:       { es: "Gluten",        en: "Gluten",       symbol: "🌾" },
  lacteos:      { es: "Lácteos",       en: "Dairy",        symbol: "🥛" },
  huevos:       { es: "Huevos",        en: "Eggs",         symbol: "🥚" },
  pescado:      { es: "Pescado",       en: "Fish",         symbol: "🐟" },
  marisco:      { es: "Crustáceos",    en: "Crustaceans",  symbol: "🦐" },
  cacahuetes:   { es: "Cacahuetes",    en: "Peanuts",      symbol: "🥜" },
  frutos_secos: { es: "Frutos Secos",  en: "Tree Nuts",    symbol: "🌰" },
  soja:         { es: "Soja",          en: "Soy",          symbol: "🫘" },
  apio:         { es: "Apio",          en: "Celery",       symbol: "🥬" },
  mostaza:      { es: "Mostaza",       en: "Mustard",      symbol: "🌿" },
  sesamo:       { es: "Sésamo",        en: "Sesame",       symbol: "🌱" },
  sulfitos:     { es: "Sulfitos",      en: "Sulphites",    symbol: "🍇" },
  altramuces:   { es: "Altramuces",    en: "Lupin",        symbol: "🌸" },
  moluscos:     { es: "Moluscos",      en: "Molluscs",     symbol: "🐚" },
}
