/**
 * Giudizio "carica corretta / insufficiente / eccessiva" a partire da un
 * valore misurato (superheat o subcooling) confrontato con un range target
 * (ANALYSIS.md §4.4). Margine di scostamento "leggero" euristico, non
 * normativo — vedi nota in src/data/r410a.ts sui range target.
 */

export interface TargetRange {
  minC: number
  maxC: number
}

export type ChargeZone =
  | 'undercharged'
  | 'slightly-undercharged'
  | 'correct'
  | 'slightly-overcharged'
  | 'overcharged'

const ZONE_LABELS: Record<ChargeZone, string> = {
  undercharged: 'Carica insufficiente',
  'slightly-undercharged': 'Leggermente scarico',
  correct: 'Carica corretta',
  'slightly-overcharged': 'Leggermente sovraccarico',
  overcharged: 'Carica eccessiva',
}

/** Ampiezza (°C) della zona gialla oltre il bordo del range target, prima di diventare rossa. */
export const SLIGHT_DEVIATION_MARGIN_C = 3

export interface ZoneBoundary {
  zone: ChargeZone
  fromC: number
  toC: number
}

/**
 * Confini delle 5 zone in °C "grezzi" (non aggiustati per direzione), dal
 * valore più basso al più alto mostrato sul gauge. `highMeansUndercharged`
 * indica se un valore sopra il range target segnala carica insufficiente
 * (vero per il superheat) o carica eccessiva (vero per il subcooling).
 */
export function zoneBoundaries(target: TargetRange, highMeansUndercharged: boolean): ZoneBoundary[] {
  const margin = SLIGHT_DEVIATION_MARGIN_C
  const lowZone = highMeansUndercharged ? 'overcharged' : 'undercharged'
  const highZone = highMeansUndercharged ? 'undercharged' : 'overcharged'
  const slightLowZone = highMeansUndercharged ? 'slightly-overcharged' : 'slightly-undercharged'
  const slightHighZone = highMeansUndercharged ? 'slightly-undercharged' : 'slightly-overcharged'

  return [
    { zone: lowZone, fromC: target.minC - 2 * margin, toC: target.minC - margin },
    { zone: slightLowZone, fromC: target.minC - margin, toC: target.minC },
    { zone: 'correct', fromC: target.minC, toC: target.maxC },
    { zone: slightHighZone, fromC: target.maxC, toC: target.maxC + margin },
    { zone: highZone, fromC: target.maxC + margin, toC: target.maxC + 2 * margin },
  ]
}

export interface ChargeJudgment {
  zone: ChargeZone
  label: string
  /** Scostamento con segno dal centro del range target, in °C. */
  offsetFromCenterC: number
  gaugeMinC: number
  gaugeMaxC: number
}

export function judgeCharge(
  valueC: number,
  target: TargetRange,
  highMeansUndercharged: boolean,
): ChargeJudgment {
  const boundaries = zoneBoundaries(target, highMeansUndercharged)
  const gaugeMinC = boundaries[0].fromC
  const gaugeMaxC = boundaries[boundaries.length - 1].toC
  const centerC = (target.minC + target.maxC) / 2

  const clamped = Math.min(Math.max(valueC, gaugeMinC), gaugeMaxC)
  const match = boundaries.find((b) => clamped >= b.fromC && clamped <= b.toC) ?? boundaries[2]

  return {
    zone: match.zone,
    label: ZONE_LABELS[match.zone],
    offsetFromCenterC: valueC - centerC,
    gaugeMinC,
    gaugeMaxC,
  }
}
