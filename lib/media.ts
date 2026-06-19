export type MediaType = "image" | "youtube" | "vimeo" | "rtve" | "video"

export function getMediaType(url: string): MediaType {
  if (/youtube\.com\/watch|youtu\.be\//.test(url)) return "youtube"
  if (/vimeo\.com\/\d+/.test(url)) return "vimeo"
  if (/rtve\.es\/(play\/)?videos/.test(url)) return "rtve"
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) return "video"
  return "image"
}

export function getEmbedUrl(url: string): string {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`

  // RTVE: extrae el ID numérico al final de la URL
  const rtveMatch = url.match(/\/(\d+)\/?$/)
  if (rtveMatch && /rtve\.es/.test(url)) return `https://www.rtve.es/m/embed/videos/${rtveMatch[1]}/`

  return url
}

export function isVideoType(type: MediaType): boolean {
  return type !== "image"
}

export function getYoutubeThumbnail(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null
}
