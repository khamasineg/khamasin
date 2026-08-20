'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { lockScroll, unlockScroll } from '@/lib/scrollLock'

/**
 * Every full-screen surface on the site mounts through this.
 *
 * It exists because of a real bug: overlays were being rendered inside
 * `<div className="relative z-10">` in the root layout, and a positioned
 * element with a z-index CREATES A STACKING CONTEXT. So an overlay declaring
 * `z-index: 300` was in fact confined to z-10 against the body — which put the
 * nav (z-100) and the footer (z-10, later in DOM) on top of it. The expanded
 * product image had the page's nav and footer punching through it.
 *
 * Portalling to document.body lifts the overlay out of that trap so its
 * z-index means what it says. It also owns the scroll lock, so no caller has
 * to remember to stop Lenis.
 */
export default function Overlay({
  children,
  z = 300,
  label,
}: {
  children: React.ReactNode
  z?: number
  label: string
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    lockScroll()
    return () => unlockScroll()
  }, [])

  if (!mounted) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0"
      style={{ zIndex: z }}
    >
      {children}
    </div>,
    document.body
  )
}
