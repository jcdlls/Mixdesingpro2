import { createFileRoute, Link } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { mixDesignStore, computeMix } from '../store/mixDesign'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

function KpiCard({
  icon, label, value, unit, sub, color, badge,
}: {
  icon: string; label: string; value: string | number; unit?: string
  sub?: string; color: string; badge?: string
}) {
  return (
    <div className="card" style={{ padding: 16, flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: color + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="material-symbols-outlined filled" style={{ color, fontSize: 22 }}>{icon}</span>
        </div>
        {badge && (
          <span className={`chip badge-${badge}`} style={{ fontSize: 11 }}>
            {badge === 'green' ? '▲' : badge === 'orange' ? '●' : '▼'} Activo
          </span>
        )}
      </div>
      <div style={{ fontSize: 24, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1 }}>
        {value}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--color-text-secondary)', marginLeft: 4 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color, marginTop: 4, fontWeight: 500 }}>{sub}</div>}
    </div>
  )
}

function MiniGauge({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color }}>{value}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function Dashboard() {
  const state = useStore(mixDesignStore)
  const results = computeMix(state)

  const wcOk = results.wc <= 0.55

  return (
    <div style={{ padding: '16px 16px 8px' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
          Panel de Control
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Dashboard
        </h1>
        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
          {state.projectCode} · {state.projectName}
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <KpiCard
          icon="folder_open"
          label="Proyectos Activos"
          value={state.activeProjects}
          color="#1565C0"
          badge="green"
        />
        <KpiCard
          icon="speed"
          label="Últ. f'c Diseño"
          value={state.lastStrength}
          unit="kg/cm²"
          color="#0288D1"
          sub={`f'cr = ${results.fcr} kg/cm²`}
        />
      </div>

      {/* Current Design Summary */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
            Diseño Activo
          </h2>
          <span className="chip" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary)', fontSize: 12 }}>
            f'c {state.fc} kg/cm²
          </span>
        </div>
        <MiniGauge value={results.cement} max={600} label="Cemento" color="#1565C0" />
        <MiniGauge value={results.water} max={250} label="Agua" color="#0288D1" />
        <MiniGauge value={results.sand} max={1000} label="Arena" color="#F57F17" />
        <MiniGauge value={results.gravel} max={1300} label="Grava" color="#795548" />
      </div>

      {/* W/C + Mix Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ padding: 16, flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Rel. A/C</div>
          <div style={{ fontSize: 28, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: wcOk ? '#2E7D32' : '#C62828' }}>
            {results.wc}
          </div>
          <div style={{ fontSize: 11, color: wcOk ? '#2E7D32' : '#C62828', fontWeight: 500, marginTop: 4 }}>
            {wcOk ? '✓ Cumple ACI' : '✗ Excede límite'}
          </div>
        </div>
        <div className="card" style={{ padding: 16, flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Asentamiento</div>
          <div style={{ fontSize: 28, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: 'var(--color-primary)' }}>
            {state.slump}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>cm (objetivo)</div>
        </div>
        <div className="card" style={{ padding: 16, flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Cemento</div>
          <div style={{ fontSize: 28, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {results.cement}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>kg/m³</div>
        </div>
      </div>

      {/* Admixtures Status */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
          Aditivos Configurados
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { key: 'fibers', icon: 'texture', label: 'Fibras', enabled: state.fibers.enabled, dosage: state.fibers.dosage, unit: 'kg/m³', color: '#7B1FA2' },
            { key: 'wp', icon: 'water_drop', label: 'Impermeabilizante', enabled: state.waterproofing.enabled, dosage: state.waterproofing.dosage, unit: 'kg/m³', color: '#0288D1' },
            { key: 'wr', icon: 'science', label: 'Reductor de Agua', enabled: state.waterReducer.enabled, dosage: state.waterReducer.dosage, unit: 'L/m³', color: '#00897B' },
          ].map((adm) => (
            <div key={adm.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: adm.enabled ? adm.color + '15' : '#F5F5F5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 17, color: adm.enabled ? adm.color : '#BDBDBD' }}>{adm.icon}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: adm.enabled ? 'var(--color-text-primary)' : '#BDBDBD' }}>{adm.label}</div>
              </div>
              {adm.enabled ? (
                <span className="chip" style={{ background: adm.color + '15', color: adm.color, fontSize: 12 }}>
                  {adm.dosage} {adm.unit}
                </span>
              ) : (
                <span style={{ fontSize: 12, color: '#BDBDBD' }}>No activo</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <Link to="/config" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: 22 }}>tune</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>Configurar Mezcla</span>
          </div>
        </Link>
        <Link to="/results" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ color: '#2E7D32', fontSize: 22 }}>summarize</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#2E7D32', fontFamily: "'Space Grotesk', sans-serif" }}>Ver Resultados</span>
          </div>
        </Link>
      </div>

      {/* Recent Projects */}
      <div className="card" style={{ padding: 16, marginBottom: 8 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
          Proyectos Recientes
        </h3>
        {[
          { code: 'PRY-2024-001', name: 'Edificio Torres', fc: 280, date: '29 Mar 2024', status: 'Activo' },
          { code: 'PRY-2024-002', name: 'Puente Vial Norte', fc: 350, date: '25 Mar 2024', status: 'Activo' },
          { code: 'PRY-2023-018', name: 'Losa Estacionamiento', fc: 210, date: '10 Feb 2024', status: 'Cerrado' },
          { code: 'PRY-2023-015', name: 'Pavimento Rígido', fc: 245, date: '15 Ene 2024', status: 'Cerrado' },
        ].map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--color-border)' : 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: p.status === 'Activo' ? 'var(--color-primary-50)' : '#F5F5F5',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: p.status === 'Activo' ? 'var(--color-primary)' : '#9E9E9E' }}>
                {p.status === 'Activo' ? 'folder_open' : 'folder'}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{p.code} · {p.date}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>f'c {p.fc}</div>
              <span className="chip" style={{
                fontSize: 10, padding: '2px 7px',
                background: p.status === 'Activo' ? '#E8F5E9' : '#F5F5F5',
                color: p.status === 'Activo' ? '#2E7D32' : '#9E9E9E',
              }}>
                {p.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
