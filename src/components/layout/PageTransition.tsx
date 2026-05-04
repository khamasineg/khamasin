'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PageTransition({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)
  const [transitionStage, setTransitionStage] = useState<'idle' | 'covering' | 'revealing'>('idle')

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  useEffect(() => {
    if (isMobile) {
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

  if (isMobile) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <>
      {/* Page content — swapped mid-transition */}
      <div>{displayChildren}</div>

      {/* Transition panel */}
      <AnimatePresence>
        {transitionStage === 'covering' && (
          <motion.div
            className="fixed inset-0 z-[200] bg-parchment flex items-center justify-center"
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.span
              className="font-display text-4xl tracking-[0.4em] text-ink"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              FYNDE
            </motion.span>
          </motion.div>
        )}
        {transitionStage === 'revealing' && (
          <motion.div
            className="fixed inset-0 z-[200] bg-parchment flex items-center justify-center"
            initial={{ x: '0%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.span
              className="font-display text-4xl tracking-[0.4em] text-ink"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              FYNDE
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}