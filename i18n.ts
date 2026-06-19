import { getRequestConfig } from "next-intl/server"
import es from "./messages/es.json"
import en from "./messages/en.json"

const messages = { es, en } as const

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? "es"
  return {
    locale,
    messages: messages[locale as keyof typeof messages] ?? messages.es,
  }
})
