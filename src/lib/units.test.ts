import { describe, expect, it } from 'vitest'
import { pressureToBarGauge, temperatureToC } from './units'

describe('pressureToBarGauge', () => {
  it('passes bar through unchanged', () => {
    expect(pressureToBarGauge(7.5, 'bar')).toBe(7.5)
  })

  it('converts MPa to bar', () => {
    expect(pressureToBarGauge(0.75, 'MPa')).toBeCloseTo(7.5, 5)
  })

  it('converts psi to bar', () => {
    expect(pressureToBarGauge(100, 'psi')).toBeCloseTo(6.89476, 4)
  })
})

describe('temperatureToC', () => {
  it('passes Celsius through unchanged', () => {
    expect(temperatureToC(6, 'C')).toBe(6)
  })

  it('converts Fahrenheit to Celsius', () => {
    expect(temperatureToC(32, 'F')).toBeCloseTo(0, 5)
    expect(temperatureToC(212, 'F')).toBeCloseTo(100, 5)
  })
})
