export type PressureUnit = 'bar' | 'MPa' | 'psi'
export type TemperatureUnit = 'C' | 'F'

const PRESSURE_TO_BAR: Record<PressureUnit, number> = {
  bar: 1,
  MPa: 10,
  psi: 0.0689476,
}

/** Converte una pressione gauge nell'unità indicata in bar gauge (unità interna dell'app). */
export function pressureToBarGauge(value: number, unit: PressureUnit): number {
  return value * PRESSURE_TO_BAR[unit]
}

/** Converte una temperatura nell'unità indicata in °C (unità interna dell'app). */
export function temperatureToC(value: number, unit: TemperatureUnit): number {
  return unit === 'C' ? value : ((value - 32) * 5) / 9
}
