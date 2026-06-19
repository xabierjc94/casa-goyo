import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const LOCALES    = ["es", "en"]
const DEFAULT    = "es"

function detectLocale(request: NextRequest): string {
  const accept = request.headers.get("accept-language") ?? ""
  const preferred = accept.split(",")[0].split("-")[0].toLowerCase().trim()
  return LOCALES.includes(preferred) ? preferred : DEFAULT
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  )
  if (hasLocale) return NextResponse.next()

  const locale = detectLocale(request)
  const url    = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ["/((?!admin|api|_next|_vercel|.*\\..*).*)"],
}
