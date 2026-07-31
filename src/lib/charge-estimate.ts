import type { PtCurve } from './pt-curve'
import { saturationPressureBarGauge } from './pt-curve'
import type { TargetRange } from './charge-verdict'

/**
 * Fattori g/°C PLACEHOLDER, non validati su impianti reali. Servono solo a
 * dare un ordine di grandezza ("aggiungi qualche decina di grammi" vs
 * "aggiungi mezzo kg"), non un valore da caricare direttamente: la quantità
 * reale dipende da capacità dell'impianto, lunghezza linee, tipo di
 * valvola, ecc. Vanno sempre verificati con step incrementali e ricalcolo
 * (ANALYSIS.md §4.2). Da tarare con l'uso sul campo.
 */
const SUPERHEAT_GRAMS_PER_DEGREE_C = 20
const SUBCOOLING_GRAMS_PER_DEGREE_C = 15

export interface ChargeAdjustmentEstimate {
  direction: 'add' | 'remove'
  grams: number
}

/**
 * Stima grossolana di quanto refrigerante aggiungere/togliere, proporzionale
 * allo scostamento dal centro del range target. Non chiamare quando la zona
 * è già "correct": lo scostamento a quel punto è nel range accettabile e
 * suggerire un aggiustamento sarebbe fuorviante.
 */
export function estimateChargeAdjustment(
  offsetFromCenterC: number,
  highMeansUndercharged: boolean,
  gramsPerDegreeC: number,
): ChargeAdjustmentEstimate {
  const underchargeSignal = highMeansUndercharged ? offsetFromCenterC : -offsetFromCenterC
  return {
    direction: underchargeSignal > 0 ? 'add' : 'remove',
    grams: Math.round(Math.abs(underchargeSignal) * gramsPerDegreeC),
  }
}

export function estimateSuperheatChargeAdjustment(offsetFromCenterC: number): ChargeAdjustmentEstimate {
  return estimateChargeAdjustment(offsetFromCenterC, true, SUPERHEAT_GRAMS_PER_DEGREE_C)
}

export function estimateSubcoolingChargeAdjustment(offsetFromCenterC: number): ChargeAdjustmentEstimate {
  return estimateChargeAdjustment(offsetFromCenterC, false, SUBCOOLING_GRAMS_PER_DEGREE_C)
}

/**
 * Range di pressione bassa (bar gauge) da tenere d'occhio sul manometro
 * mentre si carica, corrispondente al range target di superheat per la
 * temperatura reale del tubo gas attualmente misurata. Più pratico di un
 * target in °C: mentre si aggiunge gas si guarda l'ago del manometro, non
 * si ricalcola il superheat ad ogni step.
 */
export function targetLowPressureRangeBarGauge(
  curve: PtCurve,
  gasLineTempC: number,
  superheatTarget: TargetRange,
): [number, number] {
  const evapMinC = gasLineTempC - superheatTarget.maxC
  const evapMaxC = gasLineTempC - superheatTarget.minC
  return [saturationPressureBarGauge(curve, evapMinC), saturationPressureBarGauge(curve, evapMaxC)]
}

/** Equivalente a targetLowPressureRangeBarGauge, per la pressione alta e il subcooling. */
export function targetHighPressureRangeBarGauge(
  curve: PtCurve,
  liquidLineTempC: number,
  subcoolingTarget: TargetRange,
): [number, number] {
  const condMinC = liquidLineTempC + subcoolingTarget.minC
  const condMaxC = liquidLineTempC + subcoolingTarget.maxC
  return [saturationPressureBarGauge(curve, condMinC), saturationPressureBarGauge(curve, condMaxC)]
}
