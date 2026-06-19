import createMiddleware from "next-intl/middleware"
import type { NextRequest } from "next/server"

const handler = createMiddleware({
  locales: ["es", "en"],
  defaultLocale: "es",
})

export function proxy(request: NextRequest) {
  return handler(request)
}

export const config = {
  matcher: ["/((?!admin|api|_next|_vercel|.*\\..*).*)"],
}
