import type { GaugeProps } from '../components/Gauge'
import type { DiagnosticsResult } from './diagnostics'
import { judgeCharge } from './charge-verdict'
import {
  estimateSubcoolingChargeAdjustment,
  estimateSuperheatChargeAdjustment,
  targetHighPressureRangeBarGauge,
  targetLowPressureRangeBarGauge,
} from './charge-estimate'
import { TemperatureOutOfRangeError } from './pt-curve'
import { REFRIGERANTS } from '../data/refrigerants'

export function formatC(value: number | undefined): string {
  return value === undefined ? '—' : `${value.toFixed(1)}°C`
}

export function superheatGaugeProps(result: DiagnosticsResult): GaugeProps | null {
  if (result.superheatC === undefined) return null
  const refrigerant = REFRIGERANTS[result.refrigerant]
  const judgment = judgeCharge(result.superheatC, refrigerant.superheatTarget, true)

  let targetPressureRange: GaugeProps['targetPressureRange']
  try {
    const [minBar, maxBar] = targetLowPressureRangeBarGauge(
      refrigerant.curve,
      result.gasLineTempC,
      refrigerant.superheatTarget,
    )
    targetPressureRange = { label: 'Pressione bassa target', minBar, maxBar }
  } catch (err) {
    if (!(err instanceof TemperatureOutOfRangeError)) throw err
    // Target fuori dalla curva P/T (caso limite): mostriamo comunque il gauge, solo senza il target di pressione.
  }

  return {
    label: 'Superheat',
    valueC: result.superheatC,
    target: refrigerant.superheatTarget,
    highMeansUndercharged: true,
    judgment,
    adjustmentEstimate: estimateSuperheatChargeAdjustment(judgment.offsetFromCenterC),
    targetPressureRange,
  }
}

export function subcoolingGaugeProps(result: DiagnosticsResult): GaugeProps | null {
  if (result.subcoolingC === undefined || result.liquidLineTempC === undefined) return null
  const refrigerant = REFRIGERANTS[result.refrigerant]
  const judgment = judgeCharge(result.subcoolingC, refrigerant.subcoolingTarget, false)

  let targetPressureRange: GaugeProps['targetPressureRange']
  try {
    const [minBar, maxBar] = targetHighPressureRangeBarGauge(
      refrigerant.curve,
      result.liquidLineTempC,
      refrigerant.subcoolingTarget,
    )
    targetPressureRange = { label: 'Pressione alta target', minBar, maxBar }
  } catch (err) {
    if (!(err instanceof TemperatureOutOfRangeError)) throw err
  }

  return {
    label: 'Subcooling',
    valueC: result.subcoolingC,
    target: refrigerant.subcoolingTarget,
    highMeansUndercharged: false,
    judgment,
    adjustmentEstimate: estimateSubcoolingChargeAdjustment(judgment.offsetFromCenterC),
    targetPressureRange,
  }
}
