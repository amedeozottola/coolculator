import { MeasurementFlow } from './components/MeasurementFlow'
import { UpdatePrompt } from './components/UpdatePrompt'

function App() {
  return (
    <main className="flex min-h-svh w-full max-w-full flex-col items-center gap-8 overflow-x-hidden bg-white px-6 py-10 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div className="flex flex-col items-center gap-2 text-center">
        <img
          src={`${import.meta.env.BASE_URL}icons/icon.svg`}
          alt="Coolculator"
          className="h-16 w-16"
        />
        <h1 className="text-2xl font-semibold">Coolculator</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">v{__APP_VERSION__}</p>
      </div>

      <MeasurementFlow />

      <UpdatePrompt />
    </main>
  )
}

export default App
