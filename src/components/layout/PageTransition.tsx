'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

// A couple of contour lines tracing themselves across the wipe panel — reuses
// the loader's draw-on keyframe so the two moments feel like the same motif.
function TransitionContour() {
  return (
    <svg
      viewBox="0 0 800 200"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      <path
        d="M-20 60 C 100 20, 200 100, 320 55 S 540 10, 660 60 S 850 90, 900 50"
        fill="none"
        stroke="#C6AE82"
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{ strokeDasharray: 1400, strokeDashoffset: 1400, animation: 'contour-trace 0.7s cubic-bezier(0.65,0,0.35,1) 0.05s forwards' }}
      />
      <path
        d="M-20 150 C 120 190, 220 120, 340 155 S 560 200, 680 150 S 860 110, 900 160"
        fill="none"
        stroke="#9C8563"
        strokeWidth="1"
        strokeLinecap="round"
        style={{ strokeDasharray: 1400, strokeDashoffset: 1400, animation: 'contour-trace 0.7s cubic-bezier(0.65,0,0.35,1) 0.15s forwards' }}
      />
    </svg>
  )
}

export default function PageTransition({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  const [isMobile, setIsMobile] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)
  const [transitionStage, setTransitionStage] = useState<'idle' | 'covering' | 'revealing'>('idle')

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  useEffect(() => {
    if (isMobile || isAdmin) {
      setDisplayChildren(children)
      return
    }
    setTransitionStage('covering')
  }, [pathname])

  useEffect(() => {
    if (transitionStage === 'covering') {
      const t = setTimeout(() => {
        setDisplayChildren(children)
        setTransitionStage('revealing')
      }, 600)
      return () => clearTimeout(t)
    }
    if (transitionStage === 'revealing') {
      const t = setTimeout(() => {
        setTransitionStage('idle')
      }, 600)
      return () => clearTimeout(t)
    }
  }, [transitionStage, children])

  // Admin routes and mobile: no animation, instant swap
  if (isMobile || isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      {/* Page content — swapped mid-transition */}
      <div>{displayChildren}</div>

      {/* Transition panel — a wipe carrying a faint contour trail, so it reads
          as wind passing through rather than a generic curtain wipe. */}
      <AnimatePresence>
        {transitionStage === 'covering' && (
          <motion.div
            className="fixed inset-0 z-[200] bg-parchment flex items-center justify-center overflow-hidden"
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          >
            <TransitionContour />
            <motion.span
              className="font-display text-4xl tracking-[0.4em] text-ink relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              KHAMSIN
            </motion.span>
          </motion.div>
        )}
        {transitionStage === 'revealing' && (
          <motion.div
            className="fixed inset-0 z-[200] bg-parchment flex items-center justify-center overflow-hidden"
            initial={{ x: '0%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          >
            <TransitionContour />
            <motion.span
              className="font-display text-4xl tracking-[0.4em] text-ink relative"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              KHAMSIN
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}