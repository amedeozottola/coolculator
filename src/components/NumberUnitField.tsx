interface NumberUnitFieldProps<TUnit extends string> {
  id: string
  label: string
  help?: string
  required?: boolean
  units: readonly TUnit[]
  /** Etichetta da mostrare per ogni unità, se diversa dal valore interno (es. 'C' -> '°C'). */
  unitLabels?: Partial<Record<TUnit, string>>
  value: string
  unit: TUnit
  onValueChange: (value: string) => void
  onUnitChange: (unit: TUnit) => void
}

/** Campo numerico con selettore unità, usato per pressioni e temperature del form misurazione. */
export function NumberUnitField<TUnit extends string>({
  id,
  label,
  help,
  required,
  units,
  unitLabels,
  value,
  unit,
  onValueChange,
  onUnitChange,
}: NumberUnitFieldProps<TUnit>) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="text-base font-medium text-slate-900 dark:text-slate-100">
        {label}
        {required && <span className="text-orange-600 dark:text-orange-400"> *</span>}
      </label>
      {help && <p className="text-sm text-slate-600 dark:text-slate-400">{help}</p>}
      {/* flex-wrap: se per qualsiasi motivo (rendering nativo del browser, impostazioni
          del dispositivo) i due campi non ci stanno affiancati sulla riga, il selettore
          va a capo sotto invece di sforare orizzontalmente la pagina. */}
      <div className="flex min-w-0 flex-wrap gap-2">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step="any"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          // Chrome incrementa/decrementa il valore quando si scorre con rotellina/trackpad
          // sopra un input number attivo: su un form lungo capita per sbaglio scorrendo la
          // pagina. Togliere il focus allo scroll fa sì che lo scroll muova solo la pagina.
          onWheel={(e) => e.currentTarget.blur()}
          required={required}
          className="min-w-[8rem] max-w-full flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value as TUnit)}
          aria-label={`Unità di misura per ${label}`}
          className="max-w-full shrink-0 rounded-lg border border-slate-300 bg-white px-2 py-3 text-lg text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          {units.map((u) => (
            <option key={u} value={u}>
              {unitLabels?.[u] ?? u}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
