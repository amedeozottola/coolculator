import { useState } from 'react'
import { MeasurementForm } from './components/MeasurementForm'
import { Gauge } from './components/Gauge'
import { computeDiagnostics, type DiagnosticsResult } from './lib/diagnostics'
import { judgeCharge } from './lib/charge-verdict'
import { R410A_PT_CURVE, R410A_SUPERHEAT_TARGET, R410A_SUBCOOLING_TARGET } from './data/r410a'
import type { MeasurementInput } from './types/measurement'

function formatC(value: number | undefined): string {
  return value === undefined ? '—' : `${value.toFixed(1)}°C`
}

function ResultsPanel({ result }: { result: DiagnosticsResult }) {
  const hasGauge = result.superheatC !== undefined || result.subcoolingC !== undefined

  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
      {hasGauge && (
        <div className="flex flex-wrap justify-center gap-6 border-b border-slate-200 pb-4 dark:border-slate-700">
          {result.superheatC !== undefined && (
            <Gauge
              label="Superheat"
              valueC={result.superheatC}
              target={R410A_SUPERHEAT_TARGET}
              highMeansUndercharged
              judgment={judgeCharge(result.superheatC, R410A_SUPERHEAT_TARGET, true)}
            />
          )}
          {result.subcoolingC !== undefined && (
            <Gauge
              label="Subcooling"
              valueC={result.subcoolingC}
              target={R410A_SUBCOOLING_TARGET}
              highMeansUndercharged={false}
              judgment={judgeCharge(result.subcoolingC, R410A_SUBCOOLING_TARGET, false)}
            />
          )}
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
    setResult(computeDiagnostics(input, R410A_PT_CURVE))
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
      </div>

      <MeasurementForm onSubmit={handleSubmit} />

      {result && <ResultsPanel result={result} />}
    </main>
  )
}

export default App
