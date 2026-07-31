import { describe, expect, it } from 'vitest'
import { saturationTemperatureC } from '../lib/pt-curve'
import { R32_PT_CURVE } from './r32'

describe('R32_PT_CURVE', () => {
  it('matches the tabulated value at 6°C (docs/tabella_pt_gas.html)', () => {
    expect(saturationTemperatureC(R32_PT_CURVE, 8.8)).toBe(6)
  })

  it('is monotonically increasing (pressure grows with temperature)', () => {
    for (let i = 1; i < R32_PT_CURVE.length; i++) {
      expect(R32_PT_CURVE[i].pressureBarGauge).toBeGreaterThan(R32_PT_CURVE[i - 1].pressureBarGauge)
    }
  })
})
