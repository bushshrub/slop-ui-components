import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'

export type StatTone = 'neutral' | 'accent' | 'info' | 'success' | 'warning' | 'danger'
export type StatSize = 'sm' | 'md' | 'lg'

// Status colors as text fall under 4.5:1 in the light theme (see Badge), so the tone is a dot, not the value's color
const dotColor: Record<StatTone, string> = {
  neutral: 'bg-subtle',
  accent: 'bg-accent',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

const valueSize: Record<StatSize, string> = {
  sm: 'text-base',
  md: 'text-2xl',
  lg: 'text-4xl',
}

const unitSize: Record<StatSize, string> = {
  sm: 'text-ui-sm',
  md: 'text-ui',
  lg: 'text-lg',
}

export interface StatProps extends Omit<HTMLAttributes<HTMLDListElement>, 'className' | 'children'> {
  /** What is measured, e.g. "Requests". Shown small above the value. */
  label: ReactNode
  /** The figure, e.g. `1,284` or `99.9`. Rendered with tabular figures so a row of stats lines up. */
  value: ReactNode
  /** Shown small after the value, e.g. `ms`, `GB`, `%`. */
  unit?: ReactNode
  /** Muted line under the value, e.g. a change ("+4% vs last week") or a time. */
  secondary?: ReactNode
  /** Adds a dot before the label in the tone's color, e.g. `danger` for a metric over its limit. Default `neutral`: no dot. */
  tone?: StatTone
  /** `sm` for dense rows, `md` default, `lg` for a headline figure. */
  size?: StatSize
  className?: string
}

/**
 * A single measurement: label, big value, optional unit and secondary line. Not interactive. Rendered as a
 * description list, so a screen reader reads the label with its value. Lay several out with a flex or grid.
 */
export function Stat({ label, value, unit, secondary, tone = 'neutral', size = 'md', className, ...props }: StatProps) {
  return (
    <dl {...props} className={cx('m-0 flex min-w-0 flex-col gap-0.5 font-sans', className)}>
      <dt className="flex items-center gap-1.5 text-ui-sm text-muted">
        {tone !== 'neutral' && <span aria-hidden className={cx('size-1.5 shrink-0 rounded-full', dotColor[tone])} />}
        <span className="truncate">{label}</span>
      </dt>
      <dd className={cx('m-0 flex items-baseline gap-1 font-medium text-fg tabular-nums', valueSize[size])}>
        <span className="truncate">{value}</span>
        {unit != null && <span className={cx('shrink-0 font-normal text-muted', unitSize[size])}>{unit}</span>}
      </dd>
      {secondary != null && <dd className="m-0 text-ui-sm text-muted tabular-nums">{secondary}</dd>}
    </dl>
  )
}
