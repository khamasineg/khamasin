import { useEffect, useRef } from 'react'

interface ScrollRevealOptions {
  threshold?: number
  delay?: number
  once?: boolean
  /** Direction the element drifts in from, like it's settling out of blown sand. Default 'left'. */
  from?: 'left' | 'right' | 'up'
}

// The shared entrance animation for scrolled-into-view content across the
// site — CLAUDE.md's wind motif applied to ordinary content reveals, not
// just the signature ContourWind/loader moments. Elements drift in and
// sharpen out of a slight blur, like settling out of a haze of blown sand,
// rather than a generic fade-up.
export function useScrollReveal<T extends HTMLElement>(
  options: ScrollRevealOptions = {}
) {
  const { threshold = 0.12, delay = 0, once = true, from = 'left' } = options
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Skip on mobile — instant, no drift (complex animation off by default)
    if (window.innerWidth < 768) {
      el.style.opacity = '1'
      el.style.transform = 'none'
      el.style.filter = 'none'
      return
    }

    const offset = from === 'left' ? '-28px' : from === 'right' ? '28px' : '0'
    const startY = from === 'up' ? '30px' : '0'

    el.style.opacity = '0'
    el.style.transform = `translate3d(${offset}, ${startY}, 0)`
    el.style.filter = 'blur(6px)'
    el.style.transition = `opacity 0.9s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.9s cubic-bezier(0.22,1,0.36,1) ${delay}s, filter 0.7s ease-out ${delay}s`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'translate3d(0, 0, 0)'
          el.style.filter = 'blur(0px)'
          if (once) observer.disconnect()
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, once, delay, from])

  return ref
}
