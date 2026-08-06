import { useMemo, useState } from 'react'
import type { PressureUnit, TemperatureUnit } from '../lib/units'
import type { MeasurementInput, PressureField, TemperatureField } from '../types/measurement'
import { REFRIGERANT_IDS, REFRIGERANTS, type RefrigerantId } from '../data/refrigerants'
import { computeDiagnostics } from '../lib/diagnostics'
import { formatC, subcoolingGaugeProps, superheatGaugeProps } from '../lib/gauge-props'
import { NumberUnitField } from './NumberUnitField'
import { Gauge } from './Gauge'

const PRESSURE_UNITS: readonly PressureUnit[] = ['bar', 'MPa', 'psi']
const TEMPERATURE_UNITS: readonly TemperatureUnit[] = ['C', 'F']
const TEMPERATURE_UNIT_LABELS: Record<TemperatureUnit, string> = { C: '°C', F: '°F' }

interface RawField<TUnit> {
  value: string
  unit: TUnit
}

interface FormState {
  refrigerant: RefrigerantId
  lowPressure: RawField<PressureUnit>
  gasLineTemp: RawField<TemperatureUnit>
  highPressure: RawField<PressureUnit>
  liquidLineTemp: RawField<TemperatureUnit>
  outdoorAirTemp: RawField<TemperatureUnit>
  indoorAirTemp: RawField<TemperatureUnit>
  supplyAirTemp: RawField<TemperatureUnit>
  returnAirTemp: RawField<TemperatureUnit>
}

const INITIAL_STATE: FormState = {
  refrigerant: 'R410A',
  lowPressure: { value: '', unit: 'bar' },
  gasLineTemp: { value: '', unit: 'C' },
  highPressure: { value: '', unit: 'bar' },
  liquidLineTemp: { value: '', unit: 'C' },
  outdoorAirTemp: { value: '', unit: 'C' },
  indoorAirTemp: { value: '', unit: 'C' },
  supplyAirTemp: { value: '', unit: 'C' },
  returnAirTemp: { value: '', unit: 'C' },
}

function toPressureField(raw: RawField<PressureUnit>): PressureField | undefined {
  if (raw.value.trim() === '') return undefined
  return { value: Number(raw.value), unit: raw.unit }
}

function toTemperatureField(raw: RawField<TemperatureUnit>): TemperatureField | undefined {
  if (raw.value.trim() === '') return undefined
  return { value: Number(raw.value), unit: raw.unit }
}

function AddSectionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-dashed border-slate-400 px-4 py-3 text-left text-base font-medium text-sky-700 active:bg-sky-50 dark:border-slate-600 dark:text-sky-400 dark:active:bg-slate-800"
    >
      + {label}
    </button>
  )
}

export function MeasurementFlow() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE)
  const [liquidLineOpen, setLiquidLineOpen] = useState(false)
  const [coherenceOpen, setCoherenceOpen] = useState(false)

  function updateField<K extends Exclude<keyof FormState, 'refrigerant'>>(
    key: K,
    patch: Partial<FormState[K]>,
  ) {
    setForm((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }))
  }

  const measurementInput: MeasurementInput | null = useMemo(() => {
    const lowPressure = toPressureField(form.lowPressure)
    const gasLineTemp = toTemperatureField(form.gasLineTemp)
    if (!lowPressure || !gasLineTemp) return null

    return {
      refrigerant: form.refrigerant,
      lowPressure,
      gasLineTemp,
      highPressure: toPressureField(form.highPressure),
      liquidLineTemp: toTemperatureField(form.liquidLineTemp),
      outdoorAirTemp: toTemperatureField(form.outdoorAirTemp),
      indoorAirTemp: toTemperatureField(form.indoorAirTemp),
      supplyAirTemp: toTemperatureField(form.supplyAirTemp),
      returnAirTemp: toTemperatureField(form.returnAirTemp),
    }
  }, [form])

  const result = useMemo(
    () =>
      measurementInput
        ? computeDiagnostics(measurementInput, REFRIGERANTS[measurementInput.refrigerant].curve)
        : null,
    [measurementInput],
  )

  const superheatGauge = result ? superheatGaugeProps(result) : null
  const subcoolingGauge = result ? subcoolingGaugeProps(result) : null

  return (
    <div className="flex w-full max-w-md min-w-0 flex-col gap-6 overflow-x-hidden">
      <fieldset className="flex min-w-0 flex-col gap-4">
        <legend className="mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
          1. Dati obbligatori
        </legend>
        <p className="-mt-2 text-sm text-slate-600 dark:text-slate-400">
          Misura entrambi i valori all'unità esterna, sulla valvola di servizio della linea del
          gas — stesso punto dove leggi la pressione.
        </p>
        <div className="flex flex-col gap-1">
          <label htmlFor="refrigerant" className="text-base font-medium text-slate-900 dark:text-slate-100">
            Refrigerante
          </label>
          <select
            id="refrigerant"
            value={form.refrigerant}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, refrigerant: e.target.value as RefrigerantId }))
            }
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            {REFRIGERANT_IDS.map((id) => (
              <option key={id} value={id}>
                {REFRIGERANTS[id].label}
              </option>
            ))}
          </select>
        </div>
        <NumberUnitField
          id="lowPressure"
          label="Pressione bassa (linea gas)"
          required
          units={PRESSURE_UNITS}
          value={form.lowPressure.value}
          unit={form.lowPressure.unit}
          onValueChange={(value) => updateField('lowPressure', { value })}
          onUnitChange={(unit) => updateField('lowPressure', { unit })}
        />
        <NumberUnitField
          id="gasLineTemp"
          label="Temperatura reale tubo gas"
          help="Sonda a contatto diretto sul rame, non sopra la guaina isolante."
          required
          units={TEMPERATURE_UNITS}
          unitLabels={TEMPERATURE_UNIT_LABELS}
          value={form.gasLineTemp.value}
          unit={form.gasLineTemp.unit}
          onValueChange={(value) => updateField('gasLineTemp', { value })}
          onUnitChange={(unit) => updateField('gasLineTemp', { unit })}
        />
      </fieldset>

      {superheatGauge && result && (
        <div className="flex flex-col items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <Gauge {...superheatGauge} />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Evaporazione teorica: {formatC(result.evaporationTempC)}
          </p>
        </div>
      )}

      {liquidLineOpen ? (
        <fieldset className="flex min-w-0 flex-col gap-4">
          <legend className="mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
            2. Linea liquido (per il subcooling)
          </legend>
          <p className="-mt-2 text-sm text-slate-600 dark:text-slate-400">
            Stesso principio: misura all'unità esterna, sulla valvola di servizio della linea del
            liquido.
          </p>
          <NumberUnitField
            id="highPressure"
            label="Pressione alta (linea liquido)"
            units={PRESSURE_UNITS}
            value={form.highPressure.value}
            unit={form.highPressure.unit}
            onValueChange={(value) => updateField('highPressure', { value })}
            onUnitChange={(unit) => updateField('highPressure', { unit })}
          />
          <NumberUnitField
            id="liquidLineTemp"
            label="Temperatura reale tubo liquido"
            help="Sonda a contatto diretto sul rame, non sopra la guaina isolante."
            units={TEMPERATURE_UNITS}
            unitLabels={TEMPERATURE_UNIT_LABELS}
            value={form.liquidLineTemp.value}
            unit={form.liquidLineTemp.unit}
            onValueChange={(value) => updateField('liquidLineTemp', { value })}
            onUnitChange={(unit) => updateField('liquidLineTemp', { unit })}
          />
        </fieldset>
      ) : (
        <AddSectionButton
          label="Aggiungi dati linea liquido (per il subcooling)"
          onClick={() => setLiquidLineOpen(true)}
        />
      )}

      {subcoolingGauge && result && (
        <div className="flex flex-col items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <Gauge {...subcoolingGauge} />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Condensazione teorica: {formatC(result.condensationTempC)}
          </p>
        </div>
      )}

      {coherenceOpen ? (
        <fieldset className="flex min-w-0 flex-col gap-4">
          <legend className="mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
            3. Controlli di coerenza
          </legend>
          <p className="-mt-2 text-sm text-slate-600 dark:text-slate-400">
            Non influenzano il giudizio principale, servono solo a segnalare dati sospetti e a
            calcolare il Delta T aria.
          </p>
          <NumberUnitField
            id="outdoorAirTemp"
            label="Temperatura aria esterna"
            units={TEMPERATURE_UNITS}
            unitLabels={TEMPERATURE_UNIT_LABELS}
            value={form.outdoorAirTemp.value}
            unit={form.outdoorAirTemp.unit}
            onValueChange={(value) => updateField('outdoorAirTemp', { value })}
            onUnitChange={(unit) => updateField('outdoorAirTemp', { unit })}
          />
          <NumberUnitField
            id="indoorAirTemp"
            label="Temperatura aria interna / set termostato"
            help="La temperatura ambiente mostrata sul telecomando o display dello split."
            units={TEMPERATURE_UNITS}
            unitLabels={TEMPERATURE_UNIT_LABELS}
            value={form.indoorAirTemp.value}
            unit={form.indoorAirTemp.unit}
            onValueChange={(value) => updateField('indoorAirTemp', { value })}
            onUnitChange={(unit) => updateField('indoorAirTemp', { unit })}
          />
          <NumberUnitField
            id="returnAirTemp"
            label="Temperatura aria in ripresa"
            help="L'aria che rientra nello split dall'ambiente (davanti alla griglia di aspirazione)."
            units={TEMPERATURE_UNITS}
            unitLabels={TEMPERATURE_UNIT_LABELS}
            value={form.returnAirTemp.value}
            unit={form.returnAirTemp.unit}
            onValueChange={(value) => updateField('returnAirTemp', { value })}
            onUnitChange={(unit) => updateField('returnAirTemp', { unit })}
          />
          <NumberUnitField
            id="supplyAirTemp"
            label="Temperatura aria in mandata"
            help="L'aria che esce dallo split verso l'ambiente (davanti alle alette di mandata)."
            units={TEMPERATURE_UNITS}
            unitLabels={TEMPERATURE_UNIT_LABELS}
            value={form.supplyAirTemp.value}
            unit={form.supplyAirTemp.unit}
            onValueChange={(value) => updateField('supplyAirTemp', { value })}
            onUnitChange={(unit) => updateField('supplyAirTemp', { unit })}
          />
          {result?.airDeltaTC !== undefined && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Delta T aria: {formatC(result.airDeltaTC)}
            </p>
          )}
        </fieldset>
      ) : (
        <AddSectionButton
          label="Aggiungi controlli di coerenza"
          onClick={() => setCoherenceOpen(true)}
        />
      )}

      {result && result.warnings.length > 0 && (
        <ul className="flex flex-col gap-2">
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
