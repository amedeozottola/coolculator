import type { PressureUnit, TemperatureUnit } from '../lib/units'
import type { RefrigerantId } from '../data/refrigerants'

export interface PressureField {
  value: number
  unit: PressureUnit
}

export interface TemperatureField {
  value: number
  unit: TemperatureUnit
}

export interface MeasurementInput {
  refrigerant: RefrigerantId

  // Obbligatori: bastano per il superheat.
  lowPressure: PressureField
  gasLineTemp: TemperatureField

  // Facoltativi: abilitano il subcooling.
  highPressure?: PressureField
  liquidLineTemp?: TemperatureField

  // Facoltativi: solo per i controlli di coerenza (ANALYSIS.md §4.3) e il Delta T aria.
  outdoorAirTemp?: TemperatureField
  indoorAirTemp?: TemperatureField
  supplyAirTemp?: TemperatureField // mandata: aria che esce dallo split verso l'ambiente
  returnAirTemp?: TemperatureField // ripresa: aria che rientra nello split dall'ambiente
}
