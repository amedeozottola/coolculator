import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * Con registerType: 'prompt' (vite.config.ts) il nuovo service worker resta
 * in attesa finché l'utente non conferma: evita che l'app cambi versione
 * sotto i piedi di un tecnico a metà di una misurazione sul campo.
 */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
      <div className="flex w-full max-w-md items-center justify-between gap-4 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
        <span>È disponibile una nuova versione di Coolculator.</span>
        <button
          type="button"
          onClick={() => updateServiceWorker(true)}
          className="shrink-0 rounded-md bg-sky-600 px-3 py-2 font-semibold text-white active:bg-sky-700"
        >
          Aggiorna
        </button>
      </div>
    </div>
  )
}
