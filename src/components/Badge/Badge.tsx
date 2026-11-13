import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'

export type BadgeTone = 'neutral' | 'accent' | 'info' | 'success' | 'warning' | 'danger'

// Soft badges keep text-fg on the tint: status colors as text fall under 4.5:1 on their own tint in the light theme
// (accent 3.6, success 3.9, warning 4.0, info 4.4), so the tone is carried by the tint and an optional dot instead.
const soft: Record<BadgeTone, string> = {
  neutral: 'bg-button text-muted',
  accent: 'bg-accent-soft text-fg',
  info: 'bg-info-soft text-fg',
  success: 'bg-success-soft text-fg',
  warning: 'bg-warning-soft text-fg',
  danger: 'bg-danger-soft text-fg',
}

// accent-fg is white on light and near-black on dark; every status color clears 4.5:1 against it in both themes
const solid: Record<BadgeTone, string> = {
  neutral: 'bg-primary text-primary-fg',
  accent: 'bg-accent text-accent-fg',
  info: 'bg-info text-accent-fg',
  success: 'bg-success text-accent-fg',
  warning: 'bg-warning text-accent-fg',
  danger: 'bg-danger text-danger-fg',
}

const dotColor: Record<BadgeTone, string> = {
  neutral: 'bg-subtle',
  accent: 'bg-accent',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'className'> {
  /** Meaning of the badge. `neutral` is the quiet default. */
  tone?: BadgeTone
  /** `soft` is a tinted fill; `solid` is a filled pill for the few labels that must stand out. */
  variant?: 'soft' | 'solid'
  /** Leading status dot in the tone's color. */
  dot?: boolean
  /** Icon shown before the label (any 16px SVG, e.g. lucide). */
  icon?: ReactNode
  size?: 'sm' | 'md'
  className?: string
}

/** Small inline label for status or metadata. Not interactive. */
export function Badge({ tone = 'neutral', variant = 'soft', dot, icon, size = 'md', className, children, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={cx(
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full font-sans font-medium [&_svg]:size-[1em] [&_svg]:shrink-0',
        size === 'sm' ? 'h-[calc(var(--ui-icon)+0.125rem)] px-2 text-ui-sm' : 'h-[calc(var(--ui-icon)+0.5rem)] px-2.5 text-ui-sm',
        variant === 'solid' ? solid[tone] : soft[tone],
        className,
      )}
    >
      {dot && (
        <span
          aria-hidden
          className={cx('size-1.5 shrink-0 rounded-full', variant === 'solid' ? 'bg-current' : dotColor[tone])}
        />
      )}
      {icon}
      {children}
    </span>
  )
}

export interface CountBadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'className' | 'children'> {
  /** The count. Zero renders nothing unless `showZero`. */
  count: number
  /** Counts above this show as "99+". */
  max?: number
  showZero?: boolean
  /** `accent` for unread, `neutral` for plain totals. */
  tone?: 'neutral' | 'accent'
  className?: string
}

/** Numeric pill for unread counts. Capped with a "+" so it never grows wide. */
export function CountBadge({ count, max = 99, showZero, tone = 'accent', className, ...props }: CountBadgeProps) {
  if (count <= 0 && !showZero) return null
  return (
    <span
      {...props}
      className={cx(
        'inline-flex h-[calc(var(--ui-icon)+0.125rem)] min-w-[calc(var(--ui-icon)+0.125rem)] shrink-0 items-center justify-center rounded-full px-1.5 font-sans text-ui-sm font-medium tabular-nums',
        tone === 'accent' ? 'bg-accent text-accent-fg' : 'bg-button text-muted',
        className,
      )}
    >
      {count > max ? `${max}+` : count}
    </span>
  )
}
