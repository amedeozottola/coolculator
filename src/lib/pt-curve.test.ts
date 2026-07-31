import { describe, expect, it } from 'vitest'
import {
  PressureOutOfRangeError,
  TemperatureOutOfRangeError,
  saturationPressureBarGauge,
  saturationTemperatureC,
} from './pt-curve'
import { R410A_PT_CURVE } from '../data/r410a'

describe('saturationTemperatureC', () => {
  it('returns the exact tabulated temperature when pressure matches a point', () => {
    expect(saturationTemperatureC(R410A_PT_CURVE, 8.61)).toBe(6)
  })

  it('interpolates linearly between two tabulated points', () => {
    // Caso di campo validato in docs/ANALYSIS.md §8: 7,5 bar gauge -> ~2°C
    expect(saturationTemperatureC(R410A_PT_CURVE, 7.5)).toBeCloseTo(2.04, 1)
  })

  it('throws for pressure below the curve range', () => {
    expect(() => saturationTemperatureC(R410A_PT_CURVE, 0)).toThrow(PressureOutOfRangeError)
  })

  it('throws for pressure above the curve range', () => {
    expect(() => saturationTemperatureC(R410A_PT_CURVE, 100)).toThrow(PressureOutOfRangeError)
  })
})

describe('saturationPressureBarGauge', () => {
  it('is the inverse of saturationTemperatureC on tabulated points', () => {
    expect(saturationPressureBarGauge(R410A_PT_CURVE, 6)).toBe(8.61)
  })

  it('interpolates linearly between two tabulated points', () => {
    expect(saturationPressureBarGauge(R410A_PT_CURVE, 2.04)).toBeCloseTo(7.5, 1)
  })

  it('throws for temperature outside the curve range', () => {
    expect(() => saturationPressureBarGauge(R410A_PT_CURVE, 200)).toThrow(TemperatureOutOfRangeError)
  })
})
