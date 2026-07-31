import type { PtCurve } from './pt-curve'
import { PressureOutOfRangeError, saturationTemperatureC } from './pt-curve'
import { pressureToBarGauge, temperatureToC } from './units'
import type { MeasurementInput } from '../types/measurement'

/**
 * Soglie euristiche per i controlli di coerenza (ANALYSIS.md §4.3 e §8).
 * Indicative, non normative: segnalano un dato sospetto da riverificare,
 * non un errore certo. Vanno raffinate con l'uso reale sul campo.
 */
const IMPLAUSIBLE_NEGATIVE_DELTA_C = -2
const LIQUID_LINE_VS_OUTDOOR_MAX_GAP_C = 15
const MIN_PLAUSIBLE_GAS_LIQUID_DIFF_C = 3

export interface DiagnosticsResult {
  /** Temperatura reale tubo gas in °C, sempre presente (campo obbligatorio). Utile a valle per calcolare un target di pressione. */
  gasLineTempC: number
  /** Temperatura reale tubo liquido in °C, se fornita. */
  liquidLineTempC?: number
  evaporationTempC?: number
  superheatC?: number
  condensationTempC?: number
  subcoolingC?: number
  airDeltaTC?: number
  /** Avvisi non bloccanti su dati sospetti — vedi ANALYSIS.md §4.3. */
  warnings: string[]
}

export function computeDiagnostics(input: MeasurementInput, curve: PtCurve): DiagnosticsResult {
  const warnings: string[] = []

  const gasLineTempC = temperatureToC(input.gasLineTemp.value, input.gasLineTemp.unit)
  const lowPressureBarGauge = pressureToBarGauge(input.lowPressure.value, input.lowPressure.unit)

  let evaporationTempC: number | undefined
  try {
    evaporationTempC = saturationTemperatureC(curve, lowPressureBarGauge)
  } catch (err) {
    if (err instanceof PressureOutOfRangeError) {
      warnings.push(
        `Pressione bassa (${lowPressureBarGauge.toFixed(2)} bar) fuori dal range fisico plausibile per il refrigerante selezionato.`,
      )
    } else {
      throw err
    }
  }

  const superheatC = evaporationTempC === undefined ? undefined : gasLineTempC - evaporationTempC

  let condensationTempC: number | undefined
  let subcoolingC: number | undefined
  let liquidLineTempC: number | undefined
  if (Boolean(input.highPressure) !== Boolean(input.liquidLineTemp)) {
    const missing = input.highPressure ? 'la temperatura reale tubo liquido' : 'la pressione alta'
    warnings.push(
      `Per calcolare il subcooling serve anche ${missing}: al momento il dato inserito per la linea liquido viene ignorato.`,
    )
  }
  if (input.highPressure && input.liquidLineTemp) {
    const highPressureBarGauge = pressureToBarGauge(input.highPressure.value, input.highPressure.unit)
    liquidLineTempC = temperatureToC(input.liquidLineTemp.value, input.liquidLineTemp.unit)
    try {
      condensationTempC = saturationTemperatureC(curve, highPressureBarGauge)
      subcoolingC = condensationTempC - liquidLineTempC
    } catch (err) {
      if (err instanceof PressureOutOfRangeError) {
        warnings.push(
          `Pressione alta (${highPressureBarGauge.toFixed(2)} bar) fuori dal range fisico plausibile per il refrigerante selezionato.`,
        )
      } else {
        throw err
      }
    }
  }

  let airDeltaTC: number | undefined
  if (input.returnAirTemp && input.supplyAirTemp) {
    const returnC = temperatureToC(input.returnAirTemp.value, input.returnAirTemp.unit)
    const supplyC = temperatureToC(input.supplyAirTemp.value, input.supplyAirTemp.unit)
    airDeltaTC = returnC - supplyC
  }

  if (superheatC !== undefined && superheatC < IMPLAUSIBLE_NEGATIVE_DELTA_C) {
    warnings.push(
      `Superheat negativo (${superheatC.toFixed(1)}°C): verifica la temperatura del tubo gas e la pressione bassa, un valore così negativo non è fisicamente plausibile a impianto stabilizzato.`,
    )
  }

  if (subcoolingC !== undefined && subcoolingC < IMPLAUSIBLE_NEGATIVE_DELTA_C) {
    warnings.push(
      `Subcooling negativo (${subcoolingC.toFixed(1)}°C): verifica la temperatura del tubo liquido e la pressione alta, un valore così negativo non è fisicamente plausibile a impianto stabilizzato.`,
    )
  }

  if (liquidLineTempC !== undefined && input.outdoorAirTemp) {
    const outdoorC = temperatureToC(input.outdoorAirTemp.value, input.outdoorAirTemp.unit)
    if (liquidLineTempC < outdoorC - LIQUID_LINE_VS_OUTDOOR_MAX_GAP_C) {
      warnings.push(
        'Dato sospetto: la temperatura del tubo liquido sembra troppo bassa rispetto all\'esterno. Verifica di aver misurato a contatto diretto sul rame, non sopra la guaina isolante.',
      )
    }
  }

  if (liquidLineTempC !== undefined) {
    const diff = Math.abs(gasLineTempC - liquidLineTempC)
    if (diff < MIN_PLAUSIBLE_GAS_LIQUID_DIFF_C) {
      warnings.push(
        `Dato sospetto: la differenza tra temperatura tubo gas e tubo liquido è molto piccola (${diff.toFixed(1)}°C). Verifica le due misurazioni.`,
      )
    }
  }

  return {
    gasLineTempC,
    liquidLineTempC,
    evaporationTempC,
    superheatC,
    condensationTempC,
    subcoolingC,
    airDeltaTC,
    warnings,
  }
}
