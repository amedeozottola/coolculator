/**
 * A single point on a refrigerant's saturation curve.
 * Pressure is always gauge (relative to atmosphere), matching field manifold gauges.
 */
export interface PtPoint {
  tempC: number
  pressureBarGauge: number
}

/** A saturation curve, sorted ascending by temperature (and therefore by pressure). */
export type PtCurve = readonly PtPoint[]

export class PressureOutOfRangeError extends Error {
  constructor(pressureBarGauge: number, curve: PtCurve) {
    super(
      `Pressione ${pressureBarGauge} bar fuori dal range della curva P/T ` +
        `(${curve[0].pressureBarGauge}-${curve[curve.length - 1].pressureBarGauge} bar gauge).`,
    )
    this.name = 'PressureOutOfRangeError'
  }
}

export class TemperatureOutOfRangeError extends Error {
  constructor(tempC: number, curve: PtCurve) {
    super(
      `Temperatura ${tempC}°C fuori dal range della curva P/T ` +
        `(${curve[0].tempC}-${curve[curve.length - 1].tempC}°C).`,
    )
    this.name = 'TemperatureOutOfRangeError'
  }
}

/**
 * Saturation temperature for a given gauge pressure, via linear interpolation
 * between the two closest tabulated points. Throws if the pressure falls
 * outside the curve's covered range (curves are not extrapolated).
 */
export function saturationTemperatureC(curve: PtCurve, pressureBarGauge: number): number {
  if (curve.length < 2) {
    throw new Error('La curva P/T deve avere almeno due punti.')
  }

  const first = curve[0]
  const last = curve[curve.length - 1]
  if (pressureBarGauge < first.pressureBarGauge || pressureBarGauge > last.pressureBarGauge) {
    throw new PressureOutOfRangeError(pressureBarGauge, curve)
  }

  for (let i = 0; i < curve.length - 1; i++) {
    const lower = curve[i]
    const upper = curve[i + 1]
    if (pressureBarGauge >= lower.pressureBarGauge && pressureBarGauge <= upper.pressureBarGauge) {
      const span = upper.pressureBarGauge - lower.pressureBarGauge
      if (span === 0) return lower.tempC
      const fraction = (pressureBarGauge - lower.pressureBarGauge) / span
      return lower.tempC + fraction * (upper.tempC - lower.tempC)
    }
  }

  // Unreachable: the range check above guarantees a bracketing pair is found.
  throw new PressureOutOfRangeError(pressureBarGauge, curve)
}

/**
 * Inversa di saturationTemperatureC: pressione gauge di saturazione per una
 * data temperatura. Utile per mostrare un "target di pressione" pratico da
 * guardare sul manometro (più immediato di un target in gradi mentre si
 * carica un impianto). Anche questa non estrapola oltre i punti tabulati.
 */
export function saturationPressureBarGauge(curve: PtCurve, tempC: number): number {
  if (curve.length < 2) {
    throw new Error('La curva P/T deve avere almeno due punti.')
  }

  const first = curve[0]
  const last = curve[curve.length - 1]
  if (tempC < first.tempC || tempC > last.tempC) {
    throw new TemperatureOutOfRangeError(tempC, curve)
  }

  for (let i = 0; i < curve.length - 1; i++) {
    const lower = curve[i]
    const upper = curve[i + 1]
    if (tempC >= lower.tempC && tempC <= upper.tempC) {
      const span = upper.tempC - lower.tempC
      if (span === 0) return lower.pressureBarGauge
      const fraction = (tempC - lower.tempC) / span
      return lower.pressureBarGauge + fraction * (upper.pressureBarGauge - lower.pressureBarGauge)
    }
  }

  // Unreachable: the range check above guarantees a bracketing pair is found.
  throw new TemperatureOutOfRangeError(tempC, curve)
}
