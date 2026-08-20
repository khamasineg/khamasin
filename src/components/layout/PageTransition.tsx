'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import ContourTrace from '@/components/wind/ContourTrace'

function TransitionContour() {
  return (
    <svg viewBox="0 0 800 200" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
      <ContourTrace
        d="M-20 60 C 100 20, 200 100, 320 55 S 540 10, 660 60 S 850 90, 900 50"
        viewBox="0 0 800 200"
        color="#C6AE82"
        strokeWidth={1.5}
        dashLength={1400}
        duration={0.7}
        delay={0.05}
      />
      <ContourTrace
        d="M-20 150 C 120 190, 220 120, 340 155 S 560 200, 680 150 S 860 110, 900 160"
        viewBox="0 0 800 200"
        color="#9C8563"
        strokeWidth={1}
        dashLength={1400}
        duration={0.7}
        delay={0.15}
      />
    </svg>
  )
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const t = setTimeout(() => setTransitionStage('idle'), 600)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitionStage])

  if (isMobile || isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <div>{displayChildren}</div>

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
