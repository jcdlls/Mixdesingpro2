import { createFileRoute } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { mixDesignStore } from '../store/mixDesign'

const ASTM_TYPES = [
  { value: 'A', label: 'Tipo A — Reductor de agua', reduction: 12 },
  { value: 'B', label: 'Tipo B — Retardante', reduction: 0 },
  { value: 'D', label: 'Tipo D — Reductor retardante', reduction: 12 },
  { value: 'E', label: 'Tipo E — Reductor acelerante', reduction: 12 },
  { value: 'F', label: 'Tipo F — HRWR (Policarboxilato)', reduction: 25 },
  { value: 'G', label: 'Tipo G — HRWR retardante', reduction: 25 },
]

export const Route = createFileRoute('/config')({
  component: Config,
})

function SectionTitle({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: sub ? 2 : 0 }}>
        <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: 20 }}>{icon}</span>
        <h2 style={{ margin: 0, fontSize: 16, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: 'var(--color-text-primary)' }}>{title}</h2>
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginLeft: 28 }}>{sub}</div>}
    </div>
  )
}

function SliderField({
  label, value, min, max, step = 1, unit, onChange,
  marks, description, color = 'var(--color-primary)',
}: {
  label: string; value: number; min: number; max: number; step?: number
  unit: string; onChange: (v: number) => void; marks?: Array<{ v: number; l: string }>
  description?: string; color?: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{label}</span>
          {description && <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>{description}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color }}>{value}</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{unit}</span>
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            background: `linear-gradient(to right, ${color} ${pct}%, var(--color-primary-100) ${pct}%)`,
          }}
        />
        {marks && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            {marks.map((m) => (
              <div key={m.v} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 10, color: 'var(--color-text-secondary)' }}>
                <span>{m.l}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  )
}

const FC_MARKS = [
  { v: 140, l: '140' }, { v: 210, l: '210' }, { v: 280, l: '280' },
  { v: 350, l: '350' }, { v: 420, l: '420' },
]

const SLUMP_MARKS = [
  { v: 3, l: '3' }, { v: 6, l: '6' }, { v: 10, l: '10' },
  { v: 15, l: '15' }, { v: 20, l: '20' },
]

function fcClass(fc: number): { label: string; color: string } {
  if (fc <= 175) return { label: 'Normal', color: '#2E7D32' }
  if (fc <= 280) return { label: 'Estándar', color: '#1565C0' }
  if (fc <= 350) return { label: 'Alta resistencia', color: '#7B1FA2' }
  return { label: 'Ultra-alta', color: '#C62828' }
}

function slumpClass(slump: number): string {
  if (slump <= 5) return 'Seca (S1)'
  if (slump <= 9) return 'Plástica (S2)'
  if (slump <= 15) return 'Fluida (S3)'
  return 'Muy fluida (S4)'
}

function Config() {
  const state = useStore(mixDesignStore)
  const cls = fcClass(state.fc)

  return (
    <div style={{ padding: '16px 16px 8px' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
          Parámetros de Diseño
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Configurador
        </h1>
        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
          Método ACI 211.1 — Dosificación por volumen absoluto
        </div>
      </div>

      {/* ─── Section 1: Strength & Workability ─── */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <SectionTitle icon="speed" title="Resistencia y Consistencia" sub="Parámetros de desempeño del hormigón" />

        <SliderField
          label="Resistencia a la compresión f'c"
          value={state.fc}
          min={140}
          max={450}
          step={5}
          unit="kg/cm²"
          color={cls.color}
          marks={FC_MARKS}
          description={`Clase: ${cls.label}`}
          onChange={(v) => mixDesignStore.setState((s) => ({ ...s, fc: v, lastStrength: v }))}
        />

        <SliderField
          label="Asentamiento (Slump)"
          value={state.slump}
          min={3}
          max={20}
          step={1}
          unit="cm"
          color="#0288D1"
          marks={SLUMP_MARKS}
          description={`Consistencia: ${slumpClass(state.slump)}`}
          onChange={(v) => mixDesignStore.setState((s) => ({ ...s, slump: v }))}
        />

        {/* Max aggregate size */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 10 }}>
            Tamaño máximo nominal del árido grueso
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['10', '20', '40'] as const).map((size) => (
              <button
                key={size}
                onClick={() => mixDesignStore.setState((s) => ({ ...s, maxAggSize: size }))}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 10,
                  border: state.maxAggSize === size ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
                  background: state.maxAggSize === size ? 'var(--color-primary-50)' : '#fff',
                  cursor: 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: state.maxAggSize === size ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  transition: 'all 0.15s',
                }}
              >
                {size} mm
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Section 2: Admixtures ─── */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <SectionTitle icon="science" title="Aditivos Químicos" sub="Clasificación según ASTM C494 / C1017" />

        {/* ── Fibers ── */}
        <div style={{ padding: '14px 0', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: state.fibers.enabled ? '#7B1FA215' : '#F5F5F5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: state.fibers.enabled ? '#7B1FA2' : '#BDBDBD' }}>texture</span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>Fibras</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Refuerzo distribuido</div>
              </div>
            </div>
            <Toggle
              checked={state.fibers.enabled}
              onChange={(v) => mixDesignStore.setState((s) => ({ ...s, fibers: { ...s.fibers, enabled: v } }))}
            />
          </div>
          {state.fibers.enabled && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Tipo de fibra</div>
                <select
                  className="field-select"
                  value={state.fibers.fiberType}
                  onChange={(e) => {
                    const ft = e.target.value as 'polypropylene' | 'steel' | 'basalt'
                    const typeLabel = ft === 'polypropylene' ? 'Polipropileno 19mm' : ft === 'steel' ? 'Acero inoxidable 50mm' : 'Basalto 12mm'
                    mixDesignStore.setState((s) => ({ ...s, fibers: { ...s.fibers, fiberType: ft, type: typeLabel } }))
                  }}
                >
                  <option value="polypropylene">Polipropileno (PP) — ASTM C1116</option>
                  <option value="steel">Acero inoxidable — ASTM A820</option>
                  <option value="basalt">Fibra de basalto — EN 14889</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                  Dosificación: <strong style={{ color: '#7B1FA2' }}>{state.fibers.dosage} kg/m³</strong>
                </div>
                <input
                  type="range" min={0.3} max={6} step={0.1}
                  value={state.fibers.dosage}
                  onChange={(e) => mixDesignStore.setState((s) => ({ ...s, fibers: { ...s.fibers, dosage: parseFloat(e.target.value) } }))}
                  style={{ background: `linear-gradient(to right, #7B1FA2 ${((state.fibers.dosage - 0.3) / 5.7) * 100}%, var(--color-primary-100) ${((state.fibers.dosage - 0.3) / 5.7) * 100}%)` }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--color-text-secondary)' }}>
                  <span>0.3</span><span>6.0 kg/m³</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Waterproofing ── */}
        <div style={{ padding: '14px 0', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: state.waterproofing.enabled ? '#0288D115' : '#F5F5F5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="material-symbols-outlined filled" style={{ fontSize: 18, color: state.waterproofing.enabled ? '#0288D1' : '#BDBDBD' }}>water_drop</span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>Impermeabilizante</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Aditivo integral</div>
              </div>
            </div>
            <Toggle
              checked={state.waterproofing.enabled}
              onChange={(v) => mixDesignStore.setState((s) => ({ ...s, waterproofing: { ...s.waterproofing, enabled: v } }))}
            />
          </div>
          {state.waterproofing.enabled && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Tipo de impermeabilizante</div>
                <select
                  className="field-select"
                  value={state.waterproofing.wpType}
                  onChange={(e) => {
                    const wt = e.target.value as 'crystalline' | 'hydrophobic' | 'integral'
                    const typeLabel = wt === 'crystalline' ? 'Cristalino integral' : wt === 'hydrophobic' ? 'Hidrofóbico — ácidos grasos' : 'Integral puzolana activa'
                    mixDesignStore.setState((s) => ({ ...s, waterproofing: { ...s.waterproofing, wpType: wt, type: typeLabel } }))
                  }}
                >
                  <option value="crystalline">Cristalino integral — ASTM C1202</option>
                  <option value="hydrophobic">Hidrofóbico (ácidos grasos)</option>
                  <option value="integral">Integral puzolana activa</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                  Dosificación: <strong style={{ color: '#0288D1' }}>{state.waterproofing.dosage} kg/m³</strong>
                </div>
                <input
                  type="range" min={1} max={10} step={0.5}
                  value={state.waterproofing.dosage}
                  onChange={(e) => mixDesignStore.setState((s) => ({ ...s, waterproofing: { ...s.waterproofing, dosage: parseFloat(e.target.value) } }))}
                  style={{ background: `linear-gradient(to right, #0288D1 ${((state.waterproofing.dosage - 1) / 9) * 100}%, var(--color-primary-100) ${((state.waterproofing.dosage - 1) / 9) * 100}%)` }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--color-text-secondary)' }}>
                  <span>1.0</span><span>10.0 kg/m³</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Water Reducer / HRWR ── */}
        <div style={{ padding: '14px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: state.waterReducer.enabled ? '#00897B15' : '#F5F5F5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: state.waterReducer.enabled ? '#00897B' : '#BDBDBD' }}>science</span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>Reductor de agua / HRWR</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>ASTM C494</div>
              </div>
            </div>
            <Toggle
              checked={state.waterReducer.enabled}
              onChange={(v) => mixDesignStore.setState((s) => ({ ...s, waterReducer: { ...s.waterReducer, enabled: v } }))}
            />
          </div>
          {state.waterReducer.enabled && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Clasificación ASTM C494</div>
                <select
                  className="field-select"
                  value={state.waterReducer.astmType}
                  onChange={(e) => {
                    const at = e.target.value as 'A' | 'B' | 'D' | 'E' | 'F' | 'G'
                    const found = ASTM_TYPES.find((x) => x.value === at)!
                    mixDesignStore.setState((s) => ({ ...s, waterReducer: { ...s.waterReducer, astmType: at, reduction: found.reduction, type: found.label.split('—')[1].trim() } }))
                  }}
                >
                  {ASTM_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* ASTM Type badge */}
              <div style={{
                background: '#E0F2F1', borderRadius: 8, padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span className="material-symbols-outlined filled" style={{ fontSize: 16, color: '#00897B' }}>check_circle</span>
                <div style={{ fontSize: 12, color: '#00695C' }}>
                  Tipo <strong>{state.waterReducer.astmType}</strong> — reducción de agua:{' '}
                  <strong>{state.waterReducer.reduction}%</strong>
                  {state.waterReducer.reduction >= 20 && ' (HRWR)'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                  Dosificación: <strong style={{ color: '#00897B' }}>{state.waterReducer.dosage} L/m³</strong>
                </div>
                <input
                  type="range" min={0.5} max={5} step={0.1}
                  value={state.waterReducer.dosage}
                  onChange={(e) => mixDesignStore.setState((s) => ({ ...s, waterReducer: { ...s.waterReducer, dosage: parseFloat(e.target.value) } }))}
                  style={{ background: `linear-gradient(to right, #00897B ${((state.waterReducer.dosage - 0.5) / 4.5) * 100}%, var(--color-primary-100) ${((state.waterReducer.dosage - 0.5) / 4.5) * 100}%)` }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--color-text-secondary)' }}>
                  <span>0.5</span><span>5.0 L/m³</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Section 3: Project Info ─── */}
      <div className="card" style={{ padding: 20, marginBottom: 8 }}>
        <SectionTitle icon="folder_open" title="Información del Proyecto" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6, fontWeight: 500 }}>Nombre del proyecto</div>
            <input
              className="field-input"
              value={state.projectName}
              onChange={(e) => mixDesignStore.setState((s) => ({ ...s, projectName: e.target.value }))}
              placeholder="Ej: Edificio Residencial Norte"
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6, fontWeight: 500 }}>Código de proyecto</div>
            <input
              className="field-input"
              value={state.projectCode}
              onChange={(e) => mixDesignStore.setState((s) => ({ ...s, projectCode: e.target.value }))}
              placeholder="Ej: PRY-2024-001"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
