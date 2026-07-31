import type { PtCurve } from '../lib/pt-curve'
import type { TargetRange } from '../lib/charge-verdict'
import { R410A_PT_CURVE, R410A_SUPERHEAT_TARGET, R410A_SUBCOOLING_TARGET } from './r410a'
import { R32_PT_CURVE, R32_SUPERHEAT_TARGET, R32_SUBCOOLING_TARGET } from './r32'

export type RefrigerantId = 'R410A' | 'R32'

export interface RefrigerantDefinition {
  id: RefrigerantId
  label: string
  curve: PtCurve
  superheatTarget: TargetRange
  subcoolingTarget: TargetRange
}

export const REFRIGERANTS: Record<RefrigerantId, RefrigerantDefinition> = {
  R410A: {
    id: 'R410A',
    label: 'R410A',
    curve: R410A_PT_CURVE,
    superheatTarget: R410A_SUPERHEAT_TARGET,
    subcoolingTarget: R410A_SUBCOOLING_TARGET,
  },
  R32: {
    id: 'R32',
    label: 'R32',
    curve: R32_PT_CURVE,
    superheatTarget: R32_SUPERHEAT_TARGET,
    subcoolingTarget: R32_SUBCOOLING_TARGET,
  },
}

export const REFRIGERANT_IDS: readonly RefrigerantId[] = ['R410A', 'R32']
