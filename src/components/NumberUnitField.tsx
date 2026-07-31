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
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-base font-medium text-slate-900 dark:text-slate-100">
        {label}
        {required && <span className="text-orange-600 dark:text-orange-400"> *</span>}
      </label>
      {help && <p className="text-sm text-slate-600 dark:text-slate-400">{help}</p>}
      <div className="flex gap-2">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step="any"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          required={required}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value as TUnit)}
          aria-label={`Unità di misura per ${label}`}
          className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-lg text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
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
