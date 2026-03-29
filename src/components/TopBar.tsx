import { useState } from 'react'

export function TopBar() {
  const [notifOpen, setNotifOpen] = useState(false)

  return (
    <header
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: 'var(--top-bar-height)',
        background: 'var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(21,101,192,0.3)',
        gap: 12,
      }}
    >
      {/* Logo + Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
        <div
          style={{
            width: 36, height: 36,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 20 }}>
            construction
          </span>
        </div>
        <div>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            color: '#fff',
            fontSize: 16,
            lineHeight: 1.2,
          }}>
            MixDesign Pro
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: '0.04em' }}>
            ACI 211.1 · Civil Engineering
          </div>
        </div>
      </div>

      {/* Notification bell */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '50%',
            width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
            position: 'relative',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>notifications</span>
          <span style={{
            position: 'absolute',
            top: 6, right: 6,
            width: 8, height: 8,
            background: '#FF5722',
            borderRadius: '50%',
            border: '1.5px solid var(--color-primary)',
          }} />
        </button>
        {notifOpen && (
          <div
            style={{
              position: 'absolute',
              top: 44, right: 0,
              width: 280,
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
              zIndex: 200,
            }}
          >
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14 }}>Notificaciones</span>
              <button onClick={() => setNotifOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>
            {[
              { icon: 'check_circle', color: '#2E7D32', msg: 'Diseño MX-280 validado', time: '10 min' },
              { icon: 'warning', color: '#F57F17', msg: 'Relación A/C fuera de rango', time: '1h' },
              { icon: 'info', color: '#1565C0', msg: 'Nuevo informe disponible', time: '3h' },
            ].map((n, i) => (
              <div key={i} style={{ padding: '10px 16px', display: 'flex', gap: 12, alignItems: 'flex-start', borderBottom: i < 2 ? '1px solid var(--color-border)' : 'none' }}>
                <span className="material-symbols-outlined filled" style={{ color: n.color, fontSize: 18, marginTop: 1 }}>{n.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{n.msg}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>Hace {n.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User avatar */}
      <button
        style={{
          width: 36, height: 36,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #42A5F5, #1565C0)',
          border: '2px solid rgba(255,255,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          color: '#fff',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '0.02em',
        }}
      >
        IC
      </button>
    </header>
  )
}
