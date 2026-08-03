import { useState } from 'react'
import { MeasurementForm } from './components/MeasurementForm'
import { Gauge, type GaugeProps } from './components/Gauge'
import { computeDiagnostics, type DiagnosticsResult } from './lib/diagnostics'
import { judgeCharge } from './lib/charge-verdict'
import {
  estimateSubcoolingChargeAdjustment,
  estimateSuperheatChargeAdjustment,
  targetHighPressureRangeBarGauge,
  targetLowPressureRangeBarGauge,
} from './lib/charge-estimate'
import { TemperatureOutOfRangeError } from './lib/pt-curve'
import { REFRIGERANTS } from './data/refrigerants'
import { UpdatePrompt } from './components/UpdatePrompt'
import type { MeasurementInput } from './types/measurement'

function formatC(value: number | undefined): string {
  return value === undefined ? '—' : `${value.toFixed(1)}°C`
}

function superheatGaugeProps(result: DiagnosticsResult): GaugeProps | null {
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

function subcoolingGaugeProps(result: DiagnosticsResult): GaugeProps | null {
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

function ResultsPanel({ result }: { result: DiagnosticsResult }) {
  const superheatGauge = superheatGaugeProps(result)
  const subcoolingGauge = subcoolingGaugeProps(result)

  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
      {(superheatGauge || subcoolingGauge) && (
        <div className="flex flex-wrap justify-center gap-6 border-b border-slate-200 pb-4 dark:border-slate-700">
          {superheatGauge && <Gauge {...superheatGauge} />}
          {subcoolingGauge && <Gauge {...subcoolingGauge} />}
        </div>
      )}

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-slate-600 dark:text-slate-400">Evaporazione teorica</dt>
        <dd className="text-right font-medium">{formatC(result.evaporationTempC)}</dd>

        <dt className="text-slate-600 dark:text-slate-400">Superheat</dt>
        <dd className="text-right font-medium">{formatC(result.superheatC)}</dd>

        {result.condensationTempC !== undefined && (
          <>
            <dt className="text-slate-600 dark:text-slate-400">Condensazione teorica</dt>
            <dd className="text-right font-medium">{formatC(result.condensationTempC)}</dd>
          </>
        )}
        {result.subcoolingC !== undefined && (
          <>
            <dt className="text-slate-600 dark:text-slate-400">Subcooling</dt>
            <dd className="text-right font-medium">{formatC(result.subcoolingC)}</dd>
          </>
        )}
        {result.airDeltaTC !== undefined && (
          <>
            <dt className="text-slate-600 dark:text-slate-400">Delta T aria</dt>
            <dd className="text-right font-medium">{formatC(result.airDeltaTC)}</dd>
          </>
        )}
      </dl>

      {result.warnings.length > 0 && (
        <ul className="flex flex-col gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
          {result.warnings.map((warning) => (
            <li
              key={warning}
              className="rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200"
            >
              ⚠️ {warning}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function App() {
  const [result, setResult] = useState<DiagnosticsResult | null>(null)

  function handleSubmit(input: MeasurementInput) {
    setResult(computeDiagnostics(input, REFRIGERANTS[input.refrigerant].curve))
  }

  return (
    <main className="flex min-h-svh flex-col items-center gap-8 bg-white px-6 py-10 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div className="flex flex-col items-center gap-2 text-center">
        <img
          src={`${import.meta.env.BASE_URL}icons/icon.svg`}
          alt="Coolculator"
          className="h-16 w-16"
        />
        <h1 className="text-2xl font-semibold">Coolculator</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">v{__APP_VERSION__}</p>
      </div>

      <MeasurementForm onSubmit={handleSubmit} />

      {result && <ResultsPanel result={result} />}

      <UpdatePrompt />
    </main>
  )
}

export default App
