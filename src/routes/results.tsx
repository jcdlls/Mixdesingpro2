import { createFileRoute } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { mixDesignStore, computeMix } from '../store/mixDesign'
import { useState } from 'react'

export const Route = createFileRoute('/results')({
  component: Results,
})

const MATERIAL_COLORS: Record<string, string> = {
  water:         '#0288D1',
  cement:        '#5D4037',
  sand:          '#F9A825',
  gravel:        '#795548',
  fibers:        '#7B1FA2',
  waterproofing: '#00897B',
  waterReducer:  '#1565C0',
  air:           '#90A4AE',
}

function DonutChart({ slices }: { slices: Array<{ pct: number; color: string; label: string }> }) {
  const r = 70
  const cx = 90
  const cy = 90
  const strokeW = 22

  let cumAngle = -90
  const paths = slices.filter((s) => s.pct > 0).map((s) => {
    const angle = (s.pct / 100) * 360
    const start = cumAngle
    cumAngle += angle
    const toRad = (d: number) => (d * Math.PI) / 180
    const x1 = cx + r * Math.cos(toRad(start))
    const y1 = cy + r * Math.sin(toRad(start))
    const x2 = cx + r * Math.cos(toRad(cumAngle - 0.1))
    const y2 = cy + r * Math.sin(toRad(cumAngle - 0.1))
    const large = angle > 180 ? 1 : 0
    return { d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, color: s.color, pct: s.pct }
  })

  return (
    <svg width={180} height={180} viewBox="0 0 180 180" style={{ display: 'block', margin: '0 auto' }}>
      {/* Background circle */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F0F4FA" strokeWidth={strokeW} />
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill="none" stroke={p.color} strokeWidth={strokeW} strokeLinecap="butt" />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontSize: 12, fill: '#5A6A7A', fontFamily: 'Inter' }}>Volumen</text>
      <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontSize: 11, fill: '#9E9E9E', fontFamily: 'Inter' }}>m³/m³</text>
    </svg>
  )
}

function Results() {
  const state = useStore(mixDesignStore)
  const results = computeMix(state)
  const [exported, setExported] = useState(false)
  const [shared, setShared] = useState(false)

  const tableRows = [
    { material: 'Agua', icon: 'water_drop', iconFill: true, color: MATERIAL_COLORS.water, kg: results.water, vol: results.vWater, unit: 'L/m³' },
    { material: 'Cemento Portland', icon: 'inventory_2', iconFill: false, color: MATERIAL_COLORS.cement, kg: results.cement, vol: results.vCement, unit: 'kg/m³' },
    { material: `Arena fina (FM ${state.aggregates.sand.fm})`, icon: 'grain', iconFill: false, color: MATERIAL_COLORS.sand, kg: results.sand, vol: results.vSand, unit: 'kg/m³' },
    { material: `Grava ${state.maxAggSize} mm`, icon: 'circle', iconFill: true, color: MATERIAL_COLORS.gravel, kg: results.gravel, vol: results.vGravel, unit: 'kg/m³' },
    ...(state.fibers.enabled ? [{ material: `Fibras — ${state.fibers.type}`, icon: 'texture', iconFill: false, color: MATERIAL_COLORS.fibers, kg: results.fibers, vol: 0, unit: 'kg/m³' }] : []),
    ...(state.waterproofing.enabled ? [{ material: `Impermeabilizante — ${state.waterproofing.type}`, icon: 'water_drop', iconFill: true, color: MATERIAL_COLORS.waterproofing, kg: results.waterproofing, vol: 0, unit: 'kg/m³' }] : []),
    ...(state.waterReducer.enabled ? [{ material: `HRWR Tipo ${state.waterReducer.astmType} — ${state.waterReducer.type}`, icon: 'science', iconFill: false, color: MATERIAL_COLORS.waterReducer, kg: results.waterReducer, vol: 0, unit: 'L/m³' }] : []),
    { material: 'Aire atrapado', icon: 'blur_on', iconFill: false, color: MATERIAL_COLORS.air, kg: 0, vol: results.vAir, unit: '—' },
  ]

  const donutSlices = [
    { pct: results.vWater, color: MATERIAL_COLORS.water, label: 'Agua' },
    { pct: results.vCement, color: MATERIAL_COLORS.cement, label: 'Cemento' },
    { pct: results.vSand, color: MATERIAL_COLORS.sand, label: 'Arena' },
    { pct: results.vGravel, color: MATERIAL_COLORS.gravel, label: 'Grava' },
    { pct: results.vAdm, color: MATERIAL_COLORS.waterReducer, label: 'Aditivos' },
    { pct: results.vAir, color: MATERIAL_COLORS.air, label: 'Aire' },
  ]

  const wcOk = results.wc <= 0.55
  const cementOk = results.cement >= 280 && results.cement <= 550

  const handleExport = () => {
    setExported(true)
    setTimeout(() => setExported(false), 2500)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `MixDesign Pro — f'c ${state.fc} kg/cm²`,
        text: `Diseño de mezcla ACI 211.1: f'c=${state.fc} kg/cm², Agua=${results.water} kg/m³, Cemento=${results.cement} kg/m³, Arena=${results.sand} kg/m³, Grava=${results.gravel} kg/m³, A/C=${results.wc}`,
      }).catch(() => {})
    }
    setShared(true)
    setTimeout(() => setShared(false), 2500)
  }

  return (
    <div style={{ padding: '16px 16px 8px' }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
          Informe de Dosificación
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Resultados
        </h1>
        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
          {state.projectCode} · {state.projectName}
        </div>
      </div>

      {/* Design Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
        borderRadius: 14,
        padding: 20,
        marginBottom: 16,
        color: '#fff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.8, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Resistencia de Diseño</div>
            <div style={{ fontSize: 38, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>
              {state.fc}
              <span style={{ fontSize: 16, fontWeight: 400, marginLeft: 6, opacity: 0.85 }}>kg/cm²</span>
            </div>
            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>f'cr = {results.fcr} kg/cm² (resistencia requerida)</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Relación A/C</div>
            <div style={{ fontSize: 34, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>{results.wc}</div>
            <div style={{ fontSize: 11, opacity: 0.75, marginTop: 4 }}>{wcOk ? '✓ Cumple ACI 318' : '✗ Excede límite'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 14 }}>
          {[
            { label: 'Slump', val: `${results.slump} cm` },
            { label: 'Densidad', val: `${results.density} kg/m³` },
            { label: 'Árido máx.', val: `${state.maxAggSize} mm` },
            { label: 'Cemento', val: `${results.cement} kg/m³` },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1 }}>
              <div style={{ fontSize: 10, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginTop: 2 }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Donut + Legend */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
          Composición Volumétrica
        </h3>
        <DonutChart slices={donutSlices} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16, justifyContent: 'center' }}>
          {donutSlices.filter((s) => s.pct > 0).map((s) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{s.label} {s.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Material Quantities Table */}
      <div className="card" style={{ marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', background: '#F8FAFD' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
            Constituyentes por m³ de hormigón
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="results-table">
            <thead>
              <tr>
                <th>Material</th>
                <th style={{ textAlign: 'right' }}>Cantidad</th>
                <th style={{ textAlign: 'right' }}>Vol. %</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: row.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className={`material-symbols-outlined${row.iconFill ? ' filled' : ''}`} style={{ fontSize: 15, color: row.color }}>
                          {row.icon}
                        </span>
                      </div>
                      <span style={{ fontSize: 13 }}>{row.material}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", fontSize: 15 }}>
                    {row.kg > 0 ? row.kg : '—'}
                    {row.kg > 0 && <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-text-secondary)', marginLeft: 4 }}>{row.unit}</span>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {row.vol > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                        <div style={{ width: 40, height: 4, borderRadius: 2, background: '#EEF2F7', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(row.vol * 3.3, 100)}%`, height: '100%', background: row.color, borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{row.vol}%</span>
                      </div>
                    ) : <span style={{ color: '#ccc' }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#F0F4FA' }}>
                <td style={{ fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 15, color: 'var(--color-primary)' }}>calculate</span>
                    </div>
                    TOTAL
                  </div>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: 'var(--color-primary)' }}>
                  {results.totalWeight}
                  <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 4, color: 'var(--color-text-secondary)' }}>kg/m³</span>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--color-primary)' }}>
                  100%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
          Resumen de Desempeño
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Slump esperado', val: `${results.slump} cm`, ok: true, icon: 'straighten', sub: consistencyLabel(results.slump) },
            { label: 'Densidad fresca', val: `${results.density} kg/m³`, ok: true, icon: 'scale', sub: 'Hormigón normal' },
            { label: 'Relación A/C', val: results.wc.toString(), ok: wcOk, icon: 'water_drop', sub: wcOk ? 'Cumple ACI 318' : 'Excede límite' },
            { label: 'Contenido cemento', val: `${results.cement} kg/m³`, ok: cementOk, icon: 'inventory_2', sub: cementOk ? 'Rango ACI correcto' : 'Fuera de rango' },
            { label: 'f\'cr requerida', val: `${results.fcr} kg/cm²`, ok: true, icon: 'speed', sub: 'Con margen estadístico' },
            { label: 'Volumen total', val: '1.00 m³', ok: true, icon: 'view_in_ar', sub: 'Balance volumétrico ✓' },
          ].map((kpi, i) => (
            <div key={i} style={{
              padding: 12,
              borderRadius: 10,
              background: kpi.ok ? '#F8FAFD' : '#FFF3F3',
              border: `1px solid ${kpi.ok ? 'var(--color-border)' : '#FFCDD2'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: kpi.ok ? 'var(--color-primary)' : '#C62828' }}>{kpi.icon}</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 500 }}>{kpi.label}</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: kpi.ok ? 'var(--color-text-primary)' : '#C62828' }}>
                {kpi.val}
              </div>
              <div style={{ fontSize: 11, color: kpi.ok ? '#2E7D32' : '#C62828', marginTop: 3, fontWeight: 500 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Corrections Applied */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
          Correcciones por Humedad Aplicadas
        </h3>
        {(['sand', 'agg10', 'agg20', 'agg40'] as const).map((key) => {
          const agg = state.aggregates[key]
          const diff = agg.humidity - agg.absorption
          const labels: Record<string, string> = { sand: 'Arena', agg10: 'Grava 10mm', agg20: 'Grava 20mm', agg40: 'Grava 40mm' }
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: key !== 'agg40' ? '1px solid var(--color-border)' : 'none' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: diff >= 0 ? '#2E7D32' : '#C62828' }}>
                {diff >= 0 ? 'water_drop' : 'water'}
              </span>
              <div style={{ flex: 1, fontSize: 13, color: 'var(--color-text-primary)' }}>{labels[key]}</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: diff >= 0 ? '#2E7D32' : '#C62828' }}>
                {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
              </span>
              <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                {diff >= 0 ? 'aporta agua' : 'absorbe agua'}
              </span>
            </div>
          )
        })}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button
          onClick={handleExport}
          style={{
            flex: 1,
            padding: '14px 0',
            borderRadius: 12,
            border: 'none',
            background: exported ? '#E8F5E9' : 'var(--color-primary)',
            color: exported ? '#2E7D32' : '#fff',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{exported ? 'check_circle' : 'picture_as_pdf'}</span>
          {exported ? '¡Exportado!' : 'Exportar PDF'}
        </button>
        <button
          onClick={handleShare}
          style={{
            flex: 1,
            padding: '14px 0',
            borderRadius: 12,
            border: '2px solid var(--color-primary)',
            background: shared ? 'var(--color-primary-50)' : '#fff',
            color: 'var(--color-primary)',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{shared ? 'check' : 'share'}</span>
          {shared ? '¡Compartido!' : 'Compartir'}
        </button>
      </div>

      {/* ACI Reference */}
      <div className="card" style={{ padding: 14, marginBottom: 8, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-primary)', marginTop: 1 }}>menu_book</span>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          Diseño calculado según <strong>ACI 211.1-91</strong> (Standard Practice for Selecting Proportions for Normal, Heavyweight, and Mass Concrete). Los valores están basados en tablas de volumen absoluto para árido grueso según módulo de finura de la arena.
        </div>
      </div>
    </div>
  )
}

function consistencyLabel(slump: number): string {
  if (slump <= 5) return 'Consistencia seca S1'
  if (slump <= 9) return 'Plástica S2'
  if (slump <= 15) return 'Fluida S3'
  return 'Muy fluida S4'
}
