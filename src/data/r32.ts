import type { PtCurve } from '../lib/pt-curve'
import type { TargetRange } from '../lib/charge-verdict'

/**
 * Curva di saturazione R32, pressione gauge (bar relativi, non assoluti).
 * Fonte: docs/tabella_pt_gas.html, stessa tabella verificata usata per R410A
 * (vedi ANALYSIS.md §8).
 */
export const R32_PT_CURVE: PtCurve = [
  { tempC: -50, pressureBarGauge: 0.11 },
  { tempC: -45, pressureBarGauge: 0.41 },
  { tempC: -40, pressureBarGauge: 0.78 },
  { tempC: -36, pressureBarGauge: 1.1 },
  { tempC: -35, pressureBarGauge: 1.22 },
  { tempC: -32, pressureBarGauge: 1.5 },
  { tempC: -30, pressureBarGauge: 1.74 },
  { tempC: -28, pressureBarGauge: 2.0 },
  { tempC: -25, pressureBarGauge: 2.35 },
  { tempC: -24, pressureBarGauge: 2.5 },
  { tempC: -20, pressureBarGauge: 3.06 },
  { tempC: -16, pressureBarGauge: 3.8 },
  { tempC: -15, pressureBarGauge: 3.88 },
  { tempC: -12, pressureBarGauge: 4.4 },
  { tempC: -10, pressureBarGauge: 4.83 },
  { tempC: -8, pressureBarGauge: 5.15 },
  { tempC: -5, pressureBarGauge: 5.91 },
  { tempC: -4, pressureBarGauge: 6.06 },
  { tempC: 0, pressureBarGauge: 7.14 },
  { tempC: 1, pressureBarGauge: 7.38 },
  { tempC: 2, pressureBarGauge: 7.65 },
  { tempC: 3, pressureBarGauge: 7.93 },
  { tempC: 4, pressureBarGauge: 8.15 },
  { tempC: 5, pressureBarGauge: 8.52 },
  { tempC: 6, pressureBarGauge: 8.8 },
  { tempC: 7, pressureBarGauge: 9.1 },
  { tempC: 8, pressureBarGauge: 9.3 },
  { tempC: 9, pressureBarGauge: 9.73 },
  { tempC: 10, pressureBarGauge: 10.08 },
  { tempC: 12, pressureBarGauge: 10.8 },
  { tempC: 15, pressureBarGauge: 11.82 },
  { tempC: 16, pressureBarGauge: 12.1 },
  { tempC: 20, pressureBarGauge: 13.76 },
  { tempC: 24, pressureBarGauge: 15.3 },
  { tempC: 25, pressureBarGauge: 15.91 },
  { tempC: 28, pressureBarGauge: 17.15 },
  { tempC: 30, pressureBarGauge: 18.28 },
  { tempC: 32, pressureBarGauge: 19.2 },
  { tempC: 35, pressureBarGauge: 20.9 },
  { tempC: 36, pressureBarGauge: 21.5 },
  { tempC: 40, pressureBarGauge: 23.78 },
  { tempC: 41, pressureBarGauge: 24.38 },
  { tempC: 42, pressureBarGauge: 25.0 },
  { tempC: 43, pressureBarGauge: 25.63 },
  { tempC: 44, pressureBarGauge: 26.2 },
  { tempC: 45, pressureBarGauge: 26.94 },
  { tempC: 46, pressureBarGauge: 27.6 },
  { tempC: 47, pressureBarGauge: 28.28 },
  { tempC: 48, pressureBarGauge: 29.0 },
  { tempC: 49, pressureBarGauge: 29.68 },
  { tempC: 50, pressureBarGauge: 30.4 },
  { tempC: 52, pressureBarGauge: 31.9 },
  { tempC: 56, pressureBarGauge: 35.0 },
  { tempC: 60, pressureBarGauge: 38.4 },
  { tempC: 64, pressureBarGauge: 42.0 },
]

/**
 * Range target con attendibilità LIMITATA — da fonti web secondarie, non da
 * manuale produttore (vedi ANALYSIS.md §3 "Range target R32"). Superheat
 * riusa il range R410A (nessuna fonte indica un valore R32-specifico
 * diverso). Subcooling da 10-12°F a 85°F ambiente, fonti convergenti ma
 * non primarie. Verificare prima di un uso operativo reale.
 */
export const R32_SUPERHEAT_TARGET: TargetRange = { minC: 5, maxC: 10 }
export const R32_SUBCOOLING_TARGET: TargetRange = { minC: 5.6, maxC: 6.7 }
