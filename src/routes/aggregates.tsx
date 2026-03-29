import { createFileRoute } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { mixDesignStore } from '../store/mixDesign'

export const Route = createFileRoute('/aggregates')({
  component: Aggregates,
})

interface FieldProps {
  label: string
  value: number
  unit: string
  step?: number
  min?: number
  max?: number
  onChange: (v: number) => void
}

function NumField({ label, value, unit, step = 0.1, min = 0, max = 9999, onChange }: FieldProps) {
  return (
    <div style={{ flex: 1, minWidth: 80 }}>
      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4, fontWeight: 500 }}>{label}</div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="number"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="field-input"
          style={{ paddingRight: unit.length > 3 ? 42 : 36 }}
        />
        <span style={{
          position: 'absolute', right: 10,
          fontSize: 11, color: 'var(--color-text-secondary)',
          pointerEvents: 'none',
        }}>{unit}</span>
      </div>
    </div>
  )
}

function AggCard({
  title, icon, color, children,
}: {
  title: string; icon: string; color: string; children: React.ReactNode
}) {
  return (
    <div className="card" style={{ marginBottom: 16, overflow: 'hidden' }}>
      <div style={{
        padding: '12px 16px',
        background: `linear-gradient(135deg, ${color}12, ${color}06)`,
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: color + '20',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="material-symbols-outlined filled" style={{ fontSize: 18, color }}>{icon}</span>
        </div>
        <h3 style={{ margin: 0, fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {title}
        </h3>
      </div>
      <div style={{ padding: 16 }}>
        {children}
      </div>
    </div>
  )
}

function Aggregates() {
  const state = useStore(mixDesignStore)

  const update = (path: string[], val: number) => {
    mixDesignStore.setState((s) => {
      const next = { ...s, aggregates: { ...s.aggregates } }
      const agg = next.aggregates as Record<string, Record<string, number>>
      agg[path[0]] = { ...agg[path[0]], [path[1]]: val }
      return next
    })
  }

  const aggs: Array<{
    key: 'sand' | 'agg10' | 'agg20' | 'agg40'
    title: string
    icon: string
    color: string
    hasFM: boolean
    description: string
  }> = [
    { key: 'sand', title: 'Arena Fina', icon: 'grain', color: '#F9A825', hasFM: true, description: 'Tamiz ≤ 4.75 mm (Nº 4)' },
    { key: 'agg10', title: 'Grava 10 mm', icon: 'circle', color: '#795548', hasFM: false, description: 'Tamaño máximo nominal 10 mm' },
    { key: 'agg20', title: 'Grava 20 mm', icon: 'circle', color: '#5D4037', hasFM: false, description: 'Tamaño máximo nominal 20 mm' },
    { key: 'agg40', title: 'Grava 40 mm', icon: 'circle', color: '#4E342E', hasFM: false, description: 'Tamaño máximo nominal 40 mm' },
  ]

  return (
    <div style={{ padding: '16px 16px 8px' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
          Materiales
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Áridos y Agregados
        </h1>
        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
          Propiedades físicas por tipo de material
        </div>
      </div>

      {/* Info banner */}
      <div style={{
        background: 'var(--color-primary-50)',
        border: '1px solid var(--color-primary-100)',
        borderRadius: 10,
        padding: '10px 14px',
        display: 'flex', gap: 10, alignItems: 'flex-start',
        marginBottom: 20,
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-primary)', marginTop: 1 }}>info</span>
        <div style={{ fontSize: 12, color: '#1565C0', lineHeight: 1.5 }}>
          Los datos de densidad aparente, absorción y humedad superficial se usan para calcular la dosificación en peso seco y los ajustes por humedad según ACI 211.1.
        </div>
      </div>

      {aggs.map((a) => {
        const data = state.aggregates[a.key] as Record<string, number>
        return (
          <AggCard key={a.key} title={a.title} icon={a.icon} color={a.color}>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 12 }}>{a.description}</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <NumField
                label="Densidad aparente"
                value={data.bulkDensity}
                unit="kg/m³"
                step={10}
                min={1000}
                max={2000}
                onChange={(v) => update([a.key, 'bulkDensity'], v)}
              />
              <NumField
                label="Absorción"
                value={data.absorption}
                unit="%"
                step={0.1}
                min={0}
                max={10}
                onChange={(v) => update([a.key, 'absorption'], v)}
              />
              <NumField
                label="Hum. superficial"
                value={data.humidity}
                unit="%"
                step={0.1}
                min={0}
                max={20}
                onChange={(v) => update([a.key, 'humidity'], v)}
              />
            </div>
            {a.hasFM && (
              <NumField
                label="Módulo de Finura (MF)"
                value={(data as Record<string, number>).fm || 2.7}
                unit="adim"
                step={0.1}
                min={2.0}
                max={3.5}
                onChange={(v) => update([a.key, 'fm'], v)}
              />
            )}
            {/* Moisture indicator */}
            <div style={{ marginTop: 12, padding: '8px 12px', background: '#F8FAFD', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--color-secondary)' }}>water_drop</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                Corrección de agua:{' '}
                <strong style={{ color: data.humidity - data.absorption >= 0 ? '#2E7D32' : '#C62828' }}>
                  {data.humidity - data.absorption >= 0 ? '+' : ''}{(data.humidity - data.absorption).toFixed(1)}%
                </strong>
                {' '}— {data.humidity - data.absorption >= 0 ? 'aporte de agua al mix' : 'demanda de agua adicional'}
              </span>
            </div>
          </AggCard>
        )
      })}

      {/* Active aggregate info */}
      <div className="card" style={{ padding: 16, marginBottom: 8, background: 'linear-gradient(135deg, #E3F2FD, #F3E5F5)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
          <span className="material-symbols-outlined filled" style={{ color: 'var(--color-primary)', fontSize: 20 }}>info</span>
          <span style={{ fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: 'var(--color-primary)' }}>
            Árido activo en diseño: Grava {state.maxAggSize} mm
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          El tamaño máximo nominal se configura en la pestaña <strong>Config</strong>. Los datos ingresados para ese tamaño se usarán en el cálculo de la dosificación.
        </div>
      </div>
    </div>
  )
}
