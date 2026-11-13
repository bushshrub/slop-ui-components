import type { ReactNode } from 'react'
import {
  Label,
  Meter as AriaMeter,
  ProgressBar as AriaProgressBar,
  type MeterProps as AriaMeterProps,
  type ProgressBarProps as AriaProgressBarProps,
} from 'react-aria-components'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'

export type ProgressTone = 'default' | 'success' | 'warning' | 'danger'

const fills: Record<ProgressTone, string> = {
  default: 'bg-progress',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

const track = 'h-progress w-full overflow-hidden rounded-full bg-track'

function Header({ label, valueText, showValue }: { label?: ReactNode; valueText?: string; showValue: boolean }) {
  if (!label && !showValue) return null
  return (
    <div className="mb-1.5 flex justify-between gap-2 text-ui leading-5">
      {label && <Label className="text-fg">{label}</Label>}
      {showValue && <span className="ml-auto text-muted tabular-nums">{valueText}</span>}
    </div>
  )
}

export interface ProgressBarProps extends Omit<AriaProgressBarProps, 'className' | 'children'> {
  label?: ReactNode
  /** Show the value text at the right. Defaults to true when there is a label. */
  showValue?: boolean
  /** Fill color. Default uses the theme's progress color. */
  tone?: ProgressTone
  className?: string
}

/** Task progress. Pass `isIndeterminate` when the amount is unknown. */
export function ProgressBar({ label, showValue, tone = 'default', className, ...props }: ProgressBarProps) {
  return (
    <AriaProgressBar {...props} className={cx('flex w-full flex-col', className)}>
      {({ percentage, valueText, isIndeterminate }) => (
        <>
          <Header label={label} valueText={valueText} showValue={(showValue ?? !!label) && !isIndeterminate} />
          <div className={track}>
            {isIndeterminate ? (
              // Sliding segment; holds still at the start when reduced motion is on
              <div className={cx('h-full w-2/5 rounded-full motion-safe:animate-indeterminate', fills[tone])} />
            ) : (
              <div
                className={cx('h-full rounded-full motion-safe:transition-[width] motion-safe:duration-300', fills[tone])}
                style={{ width: `${percentage}%` }}
              />
            )}
          </div>
        </>
      )}
    </AriaProgressBar>
  )
}

export interface MeterProps extends Omit<AriaMeterProps, 'className' | 'children'> {
  label?: ReactNode
  /** Show the value text at the right. Defaults to true when there is a label. */
  showValue?: boolean
  /** Overrides the automatic tone: warning from 80%, danger from 95%. */
  tone?: ProgressTone
  className?: string
}

/** A measure within a range, such as usage against a limit. Turns warning at 80% and danger at 95%. */
export function Meter({ label, showValue, tone, className, ...props }: MeterProps) {
  return (
    <AriaMeter {...props} className={cx('flex w-full flex-col', className)}>
      {({ percentage, valueText }) => {
        const auto: ProgressTone = percentage >= 95 ? 'danger' : percentage >= 80 ? 'warning' : 'default'
        return (
          <>
            <Header label={label} valueText={valueText} showValue={showValue ?? !!label} />
            <div className={track}>
              <div
                className={cx('h-full rounded-full motion-safe:transition-[width] motion-safe:duration-300', fills[tone ?? auto])}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </>
        )
      }}
    </AriaMeter>
  )
}

const series = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5']

export interface StackedMeterSegment {
  id: string
  label: ReactNode
  value: number
  /** Any CSS color. Defaults to the next `--ui-chart-*` color. */
  color?: string
}

export interface StackedMeterProps {
  label?: ReactNode
  segments: StackedMeterSegment[]
  /** The whole bar. Defaults to the sum of the segments, so the bar is full. */
  maxValue?: number
  /** Formats values in the legend and header, e.g. bytes to "2.1 GB". */
  formatValue?: (value: number) => string
  /** Text at the right of the label. Defaults to "used of max" when `maxValue` is set. */
  valueLabel?: ReactNode
  /**
   * `inline`: colored dots with values, wrapping under the bar. `rows`: one row per part with its
   * value and share of the whole, plus what's free (a breakdown, like a context window). `false` hides it.
   */
  legend?: 'inline' | 'rows' | false
  /** Name of the unused part in the `rows` legend. */
  freeLabel?: ReactNode
  className?: string
}

const percent = (part: number, whole: number) => {
  const p = (part / whole) * 100
  return p > 0 && p < 1 ? '<1%' : `${Math.round(p)}%`
}

/** One bar split into colored parts, e.g. storage by type or what fills a context window. What's left of `maxValue` stays as track. */
export function StackedMeter({
  label,
  segments,
  maxValue,
  formatValue = (v) => v.toLocaleString(),
  valueLabel,
  legend = 'inline',
  freeLabel,
  className,
}: StackedMeterProps) {
  const strings = useStrings()
  const used = segments.reduce((sum, s) => sum + s.value, 0)
  const max = Math.max(maxValue ?? used, used, 1)
  const free = max - used
  const total = valueLabel ?? (maxValue != null ? strings.valueOfMax(formatValue(used), formatValue(maxValue)) : undefined)
  const color = (s: StackedMeterSegment, i: number) => (s.color ? undefined : series[i % series.length])
  return (
    <div className={cx('flex w-full flex-col', className)}>
      {(label || total) && (
        <div className="mb-1.5 flex justify-between gap-2 text-ui leading-5">
          {label && <span className="text-fg">{label}</span>}
          {total && <span className="ml-auto text-muted tabular-nums">{total}</span>}
        </div>
      )}
      <div
        role="meter"
        aria-label={typeof label === 'string' ? label : strings.usage}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={used}
        aria-valuetext={strings.valueOfMax(formatValue(used), formatValue(max))}
        // 1px gaps show the surface, so neighbors read as separate parts even in similar colors
        className={cx(track, 'flex gap-px')}
      >
        {segments.map((s, i) =>
          s.value > 0 ? (
            <span
              key={s.id}
              className={cx('h-full min-w-0.5 motion-safe:transition-[width] motion-safe:duration-300', color(s, i))}
              style={{ width: `${(s.value / max) * 100}%`, background: s.color }}
            />
          ) : null,
        )}
      </div>
      {legend === 'inline' && (
        <ul className="m-0 mt-2 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-ui-sm leading-4">
          {segments.map((s, i) => (
            <li key={s.id} className="flex items-center gap-1.5">
              <span className={cx('size-2 shrink-0 rounded-full', color(s, i))} style={{ background: s.color }} />
              <span className="text-fg">{s.label}</span>
              <span className="text-muted tabular-nums">{formatValue(s.value)}</span>
            </li>
          ))}
        </ul>
      )}
      {legend === 'rows' && (
        <ul className="m-0 mt-3 flex list-none flex-col gap-1 p-0 text-ui leading-5 text-muted">
          {[...segments.map((s, i) => ({ ...s, swatch: color(s, i) })), ...(free > 0 && maxValue != null ? [{ id: '__free', label: freeLabel ?? strings.free, value: free, color: undefined, swatch: 'bg-track ring-1 ring-inset ring-border-strong' }] : [])].map((s) => (
            <li key={s.id} className="flex items-center gap-2.5">
              <span aria-hidden className={cx('size-2.5 shrink-0 rounded-[2px]', s.swatch)} style={{ background: s.color }} />
              <span className="min-w-0 flex-1 truncate">{s.label}</span>
              <span className="tabular-nums">{formatValue(s.value)}</span>
              <span className="w-10 text-right tabular-nums">{percent(s.value, max)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
