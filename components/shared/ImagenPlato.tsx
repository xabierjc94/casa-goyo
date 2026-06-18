"use client"
import Image from "next/image"
import { useState } from "react"

type Props = {
  src: string | null
  alt: string
  className?: string
}

export default function ImagenPlato({ src, alt, className = "" }: Props) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div className={`bg-gradient-to-br from-dorado/20 to-burdeos/10 flex items-center justify-center ${className}`}>
        <span className="text-4xl opacity-40">🍽</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={`object-cover ${className}`}
      onError={() => setError(true)}
    />
  )
}
