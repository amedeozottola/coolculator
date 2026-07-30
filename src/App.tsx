function App() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-white px-6 text-center text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <img
        src={`${import.meta.env.BASE_URL}icons/icon.svg`}
        alt="Coolculator"
        className="h-24 w-24"
      />
      <h1 className="text-3xl font-semibold">Coolculator</h1>
      <p className="max-w-sm text-slate-600 dark:text-slate-400">
        Scaffold pronto. Il calcolo di superheat e subcooling arriva nei prossimi step.
      </p>
    </main>
  )
}

export default App
