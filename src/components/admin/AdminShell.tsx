'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Role = 'admin' | 'editor'
const RoleContext = createContext<Role | null>(null)
export const useRole = () => useContext(RoleContext)

const NAV = [
  { href: '/admin/orders',   label: 'Orders',   icon: '◫' },
  { href: '/admin/products', label: 'Products',  icon: '⊞' },
  { href: '/admin/lookbook', label: 'Lookbook',  icon: '◧' },
  { href: '/admin/settings', label: 'Settings',  icon: '⊙', adminOnly: true },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [role, setRole]           = useState<Role | null>(null)
  const [email, setEmail]         = useState('')
  const [checking, setChecking]   = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/admin/login'); return }

      const userEmail = session.user.email!
      setEmail(userEmail)

      const { data: adminUser } = await supabase
        .from('admin_users').select('role').eq('email', userEmail).single()

      if (!adminUser) {
        await supabase.auth.signOut()
        router.replace('/admin/login?error=unauthorized')
        return
      }
      setRole(adminUser.role as Role)
      setChecking(false)
    }
    check()
  }, [router])

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  if (checking) return (
    <div style={{ minHeight:'100vh', background:'#0F0E0D', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:8, height:8, borderRadius:'50%', background:'#A8401A', animation:'p 1.2s ease-in-out infinite' }} />
      <style>{`@keyframes p{0%,100%{opacity:.2}50%{opacity:1}}`}</style>
    </div>
  )

  const nav = NAV.filter(n => !n.adminOnly || role === 'admin')

  return (
    <RoleContext.Provider value={role}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&family=Bebas+Neue&family=Instrument+Mono&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#0F0E0D;}

        .ash{display:flex;min-height:100vh;background:#0F0E0D;font-family:'Instrument Mono',monospace;}

        /* Sidebar */
        .ash-side{width:220px;min-height:100vh;background:#1A1917;border-right:1px solid #3A3734;display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:50;}
        .ash-side-top{padding:2rem 1.75rem 1.5rem;border-bottom:1px solid #3A3734;}
        .ash-wm{font-family:'Bebas Neue',sans-serif;font-size:1.9rem;letter-spacing:.12em;color:#F0E9DF;line-height:1;margin-bottom:3px;}
        .ash-lbl{font-size:8px;letter-spacing:.28em;text-transform:uppercase;color:#A8401A;}
        .ash-nav{flex:1;padding:1.5rem 0;}
        .ash-link{display:flex;align-items:center;gap:10px;padding:.75rem 1.75rem;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:#8A8178;text-decoration:none;transition:color .15s,background .15s;border-left:2px solid transparent;}
        .ash-link:hover{color:#F0E9DF;background:rgba(240,233,223,.04);}
        .ash-link.on{color:#A8401A;border-left-color:#A8401A;background:rgba(168,64,26,.08);}
        .ash-icon{font-size:14px;width:16px;text-align:center;}
        .ash-side-bot{padding:1.25rem 1.75rem;border-top:1px solid #3A3734;}
        .ash-email{font-size:8px;letter-spacing:.1em;color:#8A8178;margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .ash-role{font-size:7px;letter-spacing:.26em;text-transform:uppercase;color:#A8401A;margin-bottom:12px;}
        .ash-out{background:none;border:1px solid #3A3734;padding:6px 12px;font-family:'Instrument Mono',monospace;font-size:7px;letter-spacing:.22em;text-transform:uppercase;color:#8A8178;cursor:pointer;transition:all .15s;width:100%;border-radius:0;}
        .ash-out:hover{border-color:#F0E9DF;color:#F0E9DF;}

        /* Main */
        .ash-main{margin-left:220px;flex:1;min-height:100vh;}

        /* Mobile bar */
        .ash-mob{display:none;position:fixed;top:0;left:0;right:0;height:56px;background:#1A1917;border-bottom:1px solid #3A3734;z-index:50;align-items:center;justify-content:space-between;padding:0 1.25rem;}
        .ash-mob-wm{font-family:'Bebas Neue',sans-serif;font-size:1.5rem;letter-spacing:.12em;color:#F0E9DF;}
        .ash-mob-btn{background:none;border:1px solid #3A3734;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#F0E9DF;font-size:16px;}

        /* Mobile drawer */
        .ash-drawer{display:none;position:fixed;inset:0;z-index:100;}
        .ash-drawer.open{display:block;}
        .ash-dov{position:absolute;inset:0;background:rgba(0,0,0,.6);}
        .ash-dpanel{position:absolute;top:0;left:0;bottom:0;width:260px;background:#1A1917;border-right:1px solid #3A3734;display:flex;flex-direction:column;}
        .ash-dtop{padding:1.75rem 1.5rem 1.25rem;border-bottom:1px solid #3A3734;display:flex;align-items:center;justify-content:space-between;}
        .ash-dclose{background:none;border:none;font-size:18px;color:#8A8178;cursor:pointer;padding:4px;}

        /* Grain */
        .ash-grain{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.025;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:180px;}

        @media(max-width:768px){
          .ash-side{display:none;}
          .ash-main{margin-left:0;padding-top:56px;}
          .ash-mob{display:flex;}
        }
      `}</style>

      <div className="ash-grain" />

      {/* Sidebar */}
      <aside className="ash-side">
        <div className="ash-side-top">
          <div className="ash-wm">FYNDE</div>
          <div className="ash-lbl">Admin Panel</div>
        </div>
        <nav className="ash-nav">
          {nav.map(n => (
            <Link key={n.href} href={n.href} className={`ash-link${pathname.startsWith(n.href) ? ' on' : ''}`}>
              <span className="ash-icon">{n.icon}</span>{n.label}
            </Link>
          ))}
        </nav>
        <div className="ash-side-bot">
          <div className="ash-email">{email}</div>
          <div className="ash-role">{role}</div>
          <button className="ash-out" onClick={signOut}>Sign Out</button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="ash-mob">
        <span className="ash-mob-wm">FYNDE</span>
        <button className="ash-mob-btn" onClick={() => setDrawerOpen(true)}>☰</button>
      </div>

      {/* Mobile drawer */}
      <div className={`ash-drawer${drawerOpen ? ' open' : ''}`}>
        <div className="ash-dov" onClick={() => setDrawerOpen(false)} />
        <div className="ash-dpanel">
          <div className="ash-dtop">
            <div className="ash-wm">FYNDE</div>
            <button className="ash-dclose" onClick={() => setDrawerOpen(false)}>✕</button>
          </div>
          <nav style={{ flex:1, padding:'1.25rem 0' }}>
            {nav.map(n => (
              <Link key={n.href} href={n.href} className={`ash-link${pathname.startsWith(n.href) ? ' on' : ''}`}
                onClick={() => setDrawerOpen(false)}>
                <span className="ash-icon">{n.icon}</span>{n.label}
              </Link>
            ))}
          </nav>
          <div className="ash-side-bot">
            <div className="ash-email">{email}</div>
            <div className="ash-role">{role}</div>
            <button className="ash-out" onClick={signOut}>Sign Out</button>
          </div>
        </div>
      </div>

      <main className="ash-main" style={{ position:'relative', zIndex:1 }}>
        {children}
      </main>
    </RoleContext.Provider>
  )
}