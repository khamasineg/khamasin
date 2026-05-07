import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin — FYNDE',
  robots: 'noindex, nofollow',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F0E9DF' }}>
      {children}
    </div>
  )
}