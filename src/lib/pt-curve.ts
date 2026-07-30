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
