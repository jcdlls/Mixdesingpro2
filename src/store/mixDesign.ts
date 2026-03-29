import { Store } from '@tanstack/store'

export interface AggregateProps {
  bulkDensity: number    // kg/m³
  absorption: number     // %
  humidity: number       // %
}

export interface AdmixtureConfig {
  enabled: boolean
  dosage: number         // kg/m³ or L/m³
  type: string
}

export interface WaterReducerConfig extends AdmixtureConfig {
  astmType: 'A' | 'B' | 'D' | 'E' | 'F' | 'G'
  reduction: number      // % water reduction
}

export interface MixDesignState {
  // Project meta
  projectName: string
  projectCode: string
  activeProjects: number
  lastStrength: number   // MPa, for dashboard KPI

  // Design parameters
  fc: number             // kg/cm², target compressive strength
  slump: number          // cm
  maxAggSize: '10' | '20' | '40'  // mm
  airContent: number     // % (typically 1.5 for non-AE)

  // Admixtures
  fibers: AdmixtureConfig & { fiberType: 'polypropylene' | 'steel' | 'basalt' }
  waterproofing: AdmixtureConfig & { wpType: 'crystalline' | 'hydrophobic' | 'integral' }
  waterReducer: WaterReducerConfig

  // Aggregate properties
  aggregates: {
    sand: AggregateProps & { fm: number }     // fineness modulus
    agg10: AggregateProps
    agg20: AggregateProps
    agg40: AggregateProps
  }
}

// ACI 211.1 lookup tables
const WATER_CONTENT: Record<string, Record<string, number>> = {
  // slumpRange -> maxAggSize -> water (L/m³)
  low:    { '10': 205, '20': 185, '40': 160 },
  medium: { '10': 225, '20': 200, '40': 175 },
  high:   { '10': 240, '20': 215, '40': 190 },
}

const CA_BULK_VOLUME: Record<string, Record<string, number>> = {
  // fineness modulus -> maxAggSize -> bulk volume (m³/m³)
  '2.4': { '10': 0.50, '20': 0.66, '40': 0.75 },
  '2.6': { '10': 0.48, '20': 0.64, '40': 0.73 },
  '2.8': { '10': 0.46, '20': 0.62, '40': 0.71 },
  '3.0': { '10': 0.44, '20': 0.60, '40': 0.69 },
}

function getWCRatio(fcr: number): number {
  const table: [number, number][] = [
    [150, 0.80], [200, 0.70], [250, 0.62],
    [300, 0.55], [350, 0.48], [400, 0.43], [450, 0.38]
  ]
  if (fcr <= table[0][0]) return table[0][1]
  if (fcr >= table[table.length - 1][0]) return table[table.length - 1][1]
  for (let i = 0; i < table.length - 1; i++) {
    if (fcr >= table[i][0] && fcr <= table[i + 1][0]) {
      const t = (fcr - table[i][0]) / (table[i + 1][0] - table[i][0])
      return table[i][1] + t * (table[i + 1][1] - table[i][1])
    }
  }
  return 0.55
}

export interface MixResults {
  // Design params
  fcr: number          // required strength (kg/cm²)
  wc: number           // w/c ratio

  // Materials per m³
  water: number        // kg/m³
  cement: number       // kg/m³
  sand: number         // kg/m³
  gravel: number       // kg/m³ (dominant CA based on maxAggSize)
  fibers: number       // kg/m³
  waterproofing: number // kg/m³
  waterReducer: number  // L/m³

  // Volumetric
  vWater: number
  vCement: number
  vSand: number
  vGravel: number
  vAdm: number
  vAir: number

  // Summary
  totalWeight: number  // kg/m³
  density: number      // kg/m³
  slump: number        // cm (target)
}

export function computeMix(state: MixDesignState): MixResults {
  const { fc, slump, maxAggSize, aggregates, waterReducer, fibers, waterproofing, airContent } = state

  // 1. Required strength (ACI 5.3.1) - no s.d. data
  let fcr: number
  if (fc < 210) fcr = fc + 70
  else if (fc <= 350) fcr = fc + 84
  else fcr = fc + 98

  // 2. W/C ratio
  const wc = getWCRatio(fcr)

  // 3. Water content
  const slumpRange = slump <= 5 ? 'low' : slump <= 10 ? 'medium' : 'high'
  const rawWater = WATER_CONTENT[slumpRange][maxAggSize]

  // Adjust for water reducer
  const waterReductionFactor = waterReducer.enabled ? (1 - waterReducer.reduction / 100) : 1
  const baseWater = rawWater * waterReductionFactor

  // Moisture adjustments for aggregate
  const activeAgg = maxAggSize === '10' ? aggregates.agg10 : maxAggSize === '20' ? aggregates.agg20 : aggregates.agg40
  const sandMoist = aggregates.sand.humidity - aggregates.sand.absorption
  const aggMoist = activeAgg.humidity - activeAgg.absorption

  const W = baseWater

  // 4. Cement
  const C = W / wc

  // 5. Coarse aggregate
  // Determine FM bucket (2.4, 2.6, 2.8, 3.0)
  const fm = aggregates.sand.fm
  const fmKey = fm <= 2.5 ? '2.4' : fm <= 2.7 ? '2.6' : fm <= 2.9 ? '2.8' : '3.0'
  const caBulkVol = CA_BULK_VOLUME[fmKey][maxAggSize]
  const caDryRodded = activeAgg.bulkDensity  // kg/m³ (bulk density dry-rodded)
  const Wca = caBulkVol * caDryRodded        // kg of CA per m³ concrete (dry)

  // Adjust CA for surface moisture
  const Wca_adjusted = Wca * (1 + aggMoist / 100)

  // 6. Volumes (m³/m³) — densities: cement 3150, CA 2650, sand 2650
  const rhoCement = 3150
  const rhoSand = 2650
  const rhoCA = 2650

  const vWater = W / 1000
  const vCement = C / rhoCement
  const vCA = Wca / rhoCA
  const vAir = airContent / 100

  // Admixture volumes (small)
  const fibDosage = fibers.enabled ? fibers.dosage : 0
  const wpDosage = waterproofing.enabled ? waterproofing.dosage : 0
  const wrDosage = waterReducer.enabled ? waterReducer.dosage : 0
  const vAdm = (fibDosage / 1300 + wpDosage / 1100 + wrDosage / 1000)

  // Fine aggregate by absolute volume
  const vSand = 1 - vWater - vCement - vCA - vAir - vAdm
  const Wsand = vSand * rhoSand

  // Adjust sand for surface moisture
  const Wsand_adjusted = Wsand * (1 + sandMoist / 100)

  // Adjust water for aggregate moisture
  const Wmix = W - (Wsand * sandMoist / 100) - (Wca * aggMoist / 100)

  const totalWeight = Math.max(Wmix, 0) + C + Math.max(Wsand_adjusted, 0) + Wca_adjusted + fibDosage + wpDosage

  return {
    fcr: Math.round(fcr),
    wc: Math.round(wc * 100) / 100,
    water: Math.round(Math.max(Wmix, W * 0.7)),
    cement: Math.round(C),
    sand: Math.round(Math.max(Wsand_adjusted, 0)),
    gravel: Math.round(Wca_adjusted),
    fibers: fibDosage,
    waterproofing: wpDosage,
    waterReducer: wrDosage,
    vWater: Math.round(vWater * 1000) / 10,
    vCement: Math.round(vCement * 1000) / 10,
    vSand: Math.round(Math.max(vSand, 0) * 1000) / 10,
    vGravel: Math.round(vCA * 1000) / 10,
    vAdm: Math.round(vAdm * 1000) / 10,
    vAir: Math.round(vAir * 1000) / 10,
    totalWeight: Math.round(totalWeight),
    density: Math.round(totalWeight),
    slump,
  }
}

const defaultState: MixDesignState = {
  projectName: 'Proyecto Edificio Torres',
  projectCode: 'PRY-2024-001',
  activeProjects: 4,
  lastStrength: 280,

  fc: 280,
  slump: 10,
  maxAggSize: '20',
  airContent: 1.5,

  fibers: {
    enabled: false,
    dosage: 0.9,
    type: 'Polipropileno 19mm',
    fiberType: 'polypropylene',
  },
  waterproofing: {
    enabled: false,
    dosage: 4.0,
    type: 'Cristalino integral',
    wpType: 'crystalline',
  },
  waterReducer: {
    enabled: false,
    dosage: 1.2,
    type: 'HRWR Policarboxilato',
    astmType: 'F',
    reduction: 25,
  },

  aggregates: {
    sand: { bulkDensity: 1540, absorption: 1.2, humidity: 4.5, fm: 2.7 },
    agg10: { bulkDensity: 1480, absorption: 0.8, humidity: 1.5 },
    agg20: { bulkDensity: 1510, absorption: 0.7, humidity: 1.2 },
    agg40: { bulkDensity: 1550, absorption: 0.6, humidity: 0.8 },
  },
}

export const mixDesignStore = new Store<MixDesignState>(defaultState)
