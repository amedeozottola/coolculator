import type { PressureUnit, TemperatureUnit } from '../lib/units'

export interface PressureField {
  value: number
  unit: PressureUnit
}

export interface TemperatureField {
  value: number
  unit: TemperatureUnit
}

/**
 * Dati grezzi inseriti dall'utente nel form. Un solo refrigerante in v1,
 * ma il campo resta un'unione così aggiungerne altri non richiede di
 * riscrivere i tipi a valle (vedi ANALYSIS.md §3).
 */
export interface MeasurementInput {
  refrigerant: 'R410A'

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
