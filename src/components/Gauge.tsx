import type { ChargeJudgment, ChargeZone, TargetRange } from '../lib/charge-verdict'
import { zoneBoundaries } from '../lib/charge-verdict'

const ZONE_COLORS: Record<ChargeZone, string> = {
  undercharged: '#E8432A',
  'slightly-undercharged': '#F5A623',
  correct: '#3FA65B',
  'slightly-overcharged': '#F5A623',
  overcharged: '#E8432A',
}

const CENTER_X = 100
const CENTER_Y = 95
const RADIUS = 80
const STROKE_WIDTH = 22

function polarPoint(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CENTER_X + radius * Math.cos(rad), y: CENTER_Y - radius * Math.sin(rad) }
}

/** Converte un valore in °C nell'angolo (0=destra, 180=sinistra) del semicerchio del gauge. */
function valueToAngle(valueC: number, min: number, max: number): number {
  const fraction = Math.min(Math.max((valueC - min) / (max - min), 0), 1)
  return 180 - fraction * 180
}

function arcPath(fromAngle: number, toAngle: number, radius: number): string {
  const start = polarPoint(fromAngle, radius)
  const end = polarPoint(toAngle, radius)
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`
}

export interface GaugeProps {
  label: string
  valueC: number
  target: TargetRange
  highMeansUndercharged: boolean
  judgment: ChargeJudgment
}

export function Gauge({ label, valueC, target, highMeansUndercharged, judgment }: GaugeProps) {
  const { gaugeMinC, gaugeMaxC } = judgment
  const boundaries = zoneBoundaries(target, highMeansUndercharged)
  const needleAngle = valueToAngle(valueC, gaugeMinC, gaugeMaxC)
  const needleTip = polarPoint(needleAngle, RADIUS - STROKE_WIDTH / 2 - 4)

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-1">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{label}</h3>
      <svg viewBox="0 0 200 110" className="w-full" role="img" aria-label={`${label}: ${judgment.label}`}>
        {boundaries.map((b) => (
          <path
            key={`${b.zone}-${b.fromC}`}
            d={arcPath(
              valueToAngle(b.fromC, gaugeMinC, gaugeMaxC),
              valueToAngle(b.toC, gaugeMinC, gaugeMaxC),
              RADIUS,
            )}
            stroke={ZONE_COLORS[b.zone]}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
        ))}
        <line
          x1={CENTER_X}
          y1={CENTER_Y}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke="#0B3D5C"
          strokeWidth={3}
          strokeLinecap="round"
          className="dark:stroke-slate-100"
        />
        <circle cx={CENTER_X} cy={CENTER_Y} r={5} fill="#0B3D5C" className="dark:fill-slate-100" />
      </svg>
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        {judgment.offsetFromCenterC >= 0 ? '+' : ''}
        {judgment.offsetFromCenterC.toFixed(1)}°C
      </p>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{judgment.label}</p>
    </div>
  )
}
