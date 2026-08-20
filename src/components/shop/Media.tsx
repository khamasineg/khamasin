'use client'

import { useState } from 'react'
import Image from 'next/image'
import FabricSwatch, { SwatchTone } from './FabricSwatch'

/**
 * Real photography when it exists, procedural swatch when it doesn't.
 *
 * Drop a file at the expected path and it takes over automatically. If the
 * file is missing the <Image> errors and we fall back to the FabricSwatch, so
 * a half-populated folder still looks deliberate rather than broken.
 *
 * Expected paths:
 *   Category tiles → /images/collections/<category-slug>.jpg
 *   Style cards    → /images/styles/<style-slug>.jpg
 *
 * Uses next/image rather than a bare <img> because the source photography is
 * full-resolution (one is 3400×6048 / 3.8 MB). Next re-encodes to WebP/AVIF at
 * the size actually requested, which is the difference between shipping ~8 MB
 * of JPEG and a couple hundred KB — required to hold CLAUDE.md §7's sub-3s
 * mobile load. Parent must be `position: relative` with a real height.
 */
export default function Media({
  src,
  alt,
  tone,
  sizes = '(max-width: 768px) 100vw, 33vw',
  priority = false,
  className = '',
}: {
  src?: string
  alt: string
  tone: SwatchTone
  sizes?: string
  priority?: boolean
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return <FabricSwatch tone={tone} className={className} />
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      // Flat, true-to-colour — no desaturation or vignette (CLAUDE.md §3)
      className={`object-cover ${className}`}
    />
  )
}
