import { describe, expect, it } from 'vitest'
import { computeDiagnostics } from './diagnostics'
import { R410A_PT_CURVE } from '../data/r410a'
import type { MeasurementInput } from '../types/measurement'

const base: MeasurementInput = {
  refrigerant: 'R410A',
  lowPressure: { value: 7.5, unit: 'bar' },
  gasLineTemp: { value: 6, unit: 'C' },
}

describe('computeDiagnostics — superheat', () => {
  it('matches the field-validated case: 7,5 bar + 6°C -> superheat ~4°C', () => {
    const result = computeDiagnostics(base, R410A_PT_CURVE)
    expect(result.evaporationTempC).toBeCloseTo(2.04, 1)
    expect(result.superheatC).toBeCloseTo(3.96, 1)
    expect(result.warnings).toEqual([])
  })

  it('flags a pressure outside the curve range without throwing', () => {
    const result = computeDiagnostics(
      { ...base, lowPressure: { value: 100, unit: 'bar' } },
      R410A_PT_CURVE,
    )
    expect(result.evaporationTempC).toBeUndefined()
    expect(result.superheatC).toBeUndefined()
    expect(result.warnings).toHaveLength(1)
    expect(result.warnings[0]).toMatch(/fuori dal range/)
  })

  it('warns when superheat is implausibly negative', () => {
    const result = computeDiagnostics(
      { ...base, gasLineTemp: { value: -5, unit: 'C' } },
      R410A_PT_CURVE,
    )
    expect(result.warnings.some((w) => w.includes('Superheat negativo'))).toBe(true)
  })
})

describe('computeDiagnostics — subcooling', () => {
  it('computes subcooling when high pressure and liquid line temp are present', () => {
    const input: MeasurementInput = {
      ...base,
      highPressure: { value: 29.84, unit: 'bar' }, // 50°C sulla curva R410A
      liquidLineTemp: { value: 42, unit: 'C' },
    }
    const result = computeDiagnostics(input, R410A_PT_CURVE)
    expect(result.condensationTempC).toBeCloseTo(50, 5)
    expect(result.subcoolingC).toBeCloseTo(8, 5)
  })

  it('warns on a suspiciously small gas/liquid temperature difference', () => {
    const input: MeasurementInput = {
      ...base,
      gasLineTemp: { value: 6, unit: 'C' },
      highPressure: { value: 29.84, unit: 'bar' },
      liquidLineTemp: { value: 5, unit: 'C' },
    }
    const result = computeDiagnostics(input, R410A_PT_CURVE)
    expect(result.warnings.some((w) => w.includes('differenza tra temperatura tubo gas'))).toBe(
      true,
    )
  })

  it('warns when the liquid line temperature is far below the outdoor air temperature', () => {
    const input: MeasurementInput = {
      ...base,
      highPressure: { value: 29.84, unit: 'bar' },
      liquidLineTemp: { value: 10, unit: 'C' },
      outdoorAirTemp: { value: 35, unit: 'C' },
    }
    const result = computeDiagnostics(input, R410A_PT_CURVE)
    expect(result.warnings.some((w) => w.includes('tubo liquido sembra troppo bassa'))).toBe(true)
  })
})

describe('computeDiagnostics — air delta T', () => {
  it('computes the air delta T when return and supply air temps are present', () => {
    const input: MeasurementInput = {
      ...base,
      returnAirTemp: { value: 25, unit: 'C' },
      supplyAirTemp: { value: 16, unit: 'C' },
    }
    const result = computeDiagnostics(input, R410A_PT_CURVE)
    expect(result.airDeltaTC).toBeCloseTo(9, 5)
  })
})
