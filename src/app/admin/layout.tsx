import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin — FYNDE',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        background: '#1C1917',
        overflowY: 'auto',
      }}
    >
      {children}
    </div>
  )
}