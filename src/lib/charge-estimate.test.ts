import { describe, expect, it } from 'vitest'
import {
  estimateSubcoolingChargeAdjustment,
  estimateSuperheatChargeAdjustment,
  targetHighPressureRangeBarGauge,
  targetLowPressureRangeBarGauge,
} from './charge-estimate'
import { R410A_PT_CURVE } from '../data/r410a'
import type { TargetRange } from './charge-verdict'

const superheatTarget: TargetRange = { minC: 5, maxC: 10 }
const subcoolingTarget: TargetRange = { minC: 8, maxC: 12 }

describe('estimateSuperheatChargeAdjustment', () => {
  it('suggests adding refrigerant when superheat is above target (undercharged)', () => {
    // valore 16°C, centro 7.5 -> offset +8.5
    const result = estimateSuperheatChargeAdjustment(8.5)
    expect(result.direction).toBe('add')
    expect(result.grams).toBeGreaterThan(0)
  })

  it('suggests removing refrigerant when superheat is below target (overcharged), matching the field case', () => {
    // caso di validazione: superheat 4°C, centro 7.5 -> offset -3.5
    const result = estimateSuperheatChargeAdjustment(-3.5)
    expect(result.direction).toBe('remove')
    expect(result.grams).toBeGreaterThan(0)
  })
})

describe('estimateSubcoolingChargeAdjustment', () => {
  it('suggests adding refrigerant when subcooling is below target (undercharged)', () => {
    const result = estimateSubcoolingChargeAdjustment(-5)
    expect(result.direction).toBe('add')
  })

  it('suggests removing refrigerant when subcooling is above target (overcharged)', () => {
    const result = estimateSubcoolingChargeAdjustment(5)
    expect(result.direction).toBe('remove')
  })
})

describe('targetLowPressureRangeBarGauge', () => {
  it('matches the field-validated case: gas line 6°C, target superheat 5-10 -> low pressure target ~6.02-6.61 bar', () => {
    const [minBar, maxBar] = targetLowPressureRangeBarGauge(R410A_PT_CURVE, 6, superheatTarget)
    // superheat 10 -> evap -4°C (~5.99 bar); superheat 5 -> evap 1°C (~7.23 bar)
    expect(minBar).toBeCloseTo(5.99, 1)
    expect(maxBar).toBeCloseTo(7.23, 1)
  })
})

describe('targetHighPressureRangeBarGauge', () => {
  it('computes a target high pressure range from the liquid line temperature', () => {
    const [minBar, maxBar] = targetHighPressureRangeBarGauge(R410A_PT_CURVE, 40, subcoolingTarget)
    // subcooling 12 -> cond 52°C (~30.96 bar); subcooling 8 -> cond 48°C (~28.14 bar)
    expect(minBar).toBeCloseTo(28.14, 1)
    expect(maxBar).toBeCloseTo(30.96, 1)
  })
})
