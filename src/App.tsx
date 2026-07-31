import { useState } from 'react'
import { MeasurementForm } from './components/MeasurementForm'
import type { MeasurementInput } from './types/measurement'

function App() {
  const [lastSubmission, setLastSubmission] = useState<MeasurementInput | null>(null)

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

      <MeasurementForm onSubmit={setLastSubmission} />

      {lastSubmission && (
        <pre className="w-full max-w-md overflow-x-auto rounded-lg bg-slate-100 p-4 text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
          {JSON.stringify(lastSubmission, null, 2)}
        </pre>
      )}
    </main>
  )
}

export default App
