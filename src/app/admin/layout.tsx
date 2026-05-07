import type { Metadata } from 'next'
import AdminNav from './components/AdminNav'

export const metadata: Metadata = {
  title: 'Admin',
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
      {/* 48px top nav — always on top */}
      <AdminNav />

      {/* Page content pushed below nav */}
      <div style={{ paddingTop: '48px', minHeight: '100%' }}>
        {children}
      </div>
    </div>
  )
}
