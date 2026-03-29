import { Link, useLocation } from '@tanstack/react-router'

const tabs = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', iconFilled: 'dashboard' },
  { to: '/aggregates', label: 'Áridos', icon: 'layers', iconFilled: 'layers' },
  { to: '/config', label: 'Config', icon: 'tune', iconFilled: 'tune' },
  { to: '/results', label: 'Reporte', icon: 'summarize', iconFilled: 'summarize' },
]

export function BottomNav() {
  const loc = useLocation()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        height: 'var(--bottom-nav-height)',
        background: '#FFFFFF',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        zIndex: 100,
        boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {tabs.map((tab) => {
        const active = loc.pathname === tab.to
        return (
          <Link
            key={tab.to}
            to={tab.to}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              padding: '8px 4px',
              textDecoration: 'none',
              color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              transition: 'color 0.15s',
            }}
          >
            <div
              style={{
                padding: '2px 16px',
                borderRadius: 20,
                background: active ? 'var(--color-primary-50)' : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              <span
                className={`material-symbols-outlined${active ? ' filled' : ''}`}
                style={{ fontSize: 22 }}
              >
                {tab.icon}
              </span>
            </div>
            <span style={{ fontSize: 11, fontWeight: active ? 600 : 400, letterSpacing: '0.02em' }}>
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
