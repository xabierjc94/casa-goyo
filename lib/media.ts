export type MediaType = "image" | "youtube" | "vimeo" | "video"

export function getMediaType(url: string): MediaType {
  if (/youtube\.com\/watch|youtu\.be\//.test(url)) return "youtube"
  if (/vimeo\.com\/\d+/.test(url)) return "vimeo"
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) return "video"
  return "image"
}

export function getEmbedUrl(url: string): string {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return url
}
