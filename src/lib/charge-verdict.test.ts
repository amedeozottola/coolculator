import { describe, expect, it } from 'vitest'
import { judgeCharge, type TargetRange } from './charge-verdict'

const superheatTarget: TargetRange = { minC: 5, maxC: 10 }
const subcoolingTarget: TargetRange = { minC: 8, maxC: 12 }

describe('judgeCharge — superheat (alto = carica insufficiente)', () => {
  it('is correct inside the target range', () => {
    expect(judgeCharge(7.5, superheatTarget, true).zone).toBe('correct')
  })

  it('is undercharged when clearly above the target', () => {
    // Caso di validazione sul campo: superheat 4°C è sotto al target -> leggermente sovraccarico,
    // qui verifichiamo invece il lato opposto (sopra al range).
    expect(judgeCharge(16, superheatTarget, true).zone).toBe('undercharged')
  })

  it('is slightly undercharged just above the target edge', () => {
    expect(judgeCharge(11, superheatTarget, true).zone).toBe('slightly-undercharged')
  })

  it('is slightly overcharged just below the target edge (matches the field case: 4°C)', () => {
    expect(judgeCharge(4, superheatTarget, true).zone).toBe('slightly-overcharged')
  })

  it('is overcharged when clearly below the target', () => {
    expect(judgeCharge(0, superheatTarget, true).zone).toBe('overcharged')
  })
})

describe('judgeCharge — subcooling (basso = carica insufficiente)', () => {
  it('is correct inside the target range', () => {
    expect(judgeCharge(10, subcoolingTarget, false).zone).toBe('correct')
  })

  it('is undercharged when clearly below the target', () => {
    expect(judgeCharge(2, subcoolingTarget, false).zone).toBe('undercharged')
  })

  it('is overcharged when clearly above the target', () => {
    expect(judgeCharge(20, subcoolingTarget, false).zone).toBe('overcharged')
  })
})

describe('judgeCharge — offset and gauge bounds', () => {
  it('reports the signed offset from the target center', () => {
    const result = judgeCharge(4, superheatTarget, true)
    expect(result.offsetFromCenterC).toBeCloseTo(4 - 7.5, 5)
  })

  it('clamps out-of-gauge values to the outermost zone instead of throwing', () => {
    const result = judgeCharge(-100, superheatTarget, true)
    expect(result.zone).toBe('overcharged')
    expect(result.gaugeMinC).toBe(superheatTarget.minC - 6)
    expect(result.gaugeMaxC).toBe(superheatTarget.maxC + 6)
  })
})
