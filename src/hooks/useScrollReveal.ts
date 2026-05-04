import { useEffect, useRef } from 'react'

interface ScrollRevealOptions {
  threshold?: number
  delay?: number
  once?: boolean
}

export function useScrollReveal<T extends HTMLElement>(
  options: ScrollRevealOptions = {}
) {
  const { threshold = 0.12, once = true } = options
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Skip on mobile
    if (window.innerWidth < 768) {
      el.style.opacity = '1'
      el.style.transform = 'none'
      return
    }

    el.style.opacity = '0'
    el.style.transform = 'translateY(36px)'
    el.style.transition = `opacity 0.8s ease, transform 0.8s ease`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          if (once) observer.disconnect()
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, once])

  return ref
}