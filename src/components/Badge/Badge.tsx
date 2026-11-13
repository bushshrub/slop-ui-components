import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'

export type BadgeTone = 'neutral' | 'accent' | 'info' | 'success' | 'warning' | 'danger'

// Soft badges keep text-fg on the tint: status colors as text fall under 4.5:1 on their own tint in the light theme
// (accent 3.6, success 3.9, warning 4.0, info 4.4), so the tone is carried by the tint and an optional dot instead.
const soft: Record<BadgeTone, string> = {
  neutral: 'bg-button text-fg',
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

// Outline keeps text-fg for the same reason as soft; the border and an optional dot carry the tone.
const outline: Record<BadgeTone, string> = {
  neutral: 'border border-border-strong text-fg',
  accent: 'border border-accent text-fg',
  info: 'border border-info text-fg',
  success: 'border border-success text-fg',
  warning: 'border border-warning text-fg',
  danger: 'border border-danger text-fg',
}

// With a custom `color`, soft and outline are drawn from --badge-color. Solid is left out: no text color is
// readable on every fill.
const custom = {
  soft: 'bg-[color-mix(in_srgb,var(--badge-color)_16%,transparent)] text-fg',
  outline: 'border border-(--badge-color) text-fg',
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
  /** `soft` is a tinted fill; `solid` is a filled pill for the few labels that must stand out; `outline` is a bordered pill. */
  variant?: 'soft' | 'solid' | 'outline'
  /**
   * Any CSS color, used instead of `tone` for colors that come from data (a label or stage color).
   * Applies to `soft` and `outline`, which keep the normal text color; `solid` ignores it.
   */
  color?: string
  /** Leading status dot in the tone's color. */
  dot?: boolean
  /** Icon shown before the label (any 16px SVG, e.g. lucide). */
  icon?: ReactNode
  size?: 'sm' | 'md'
  className?: string
}

/** Small inline label for status or metadata. Not interactive. */
export function Badge({ tone = 'neutral', variant = 'soft', color, dot, icon, size = 'md', className, style, children, ...props }: BadgeProps) {
  const tones = { soft, solid, outline }[variant]
  const customColor = variant !== 'solid' && color ? color : undefined
  return (
    <span
      {...props}
      style={customColor ? ({ '--badge-color': customColor, ...style } as CSSProperties) : style}
      className={cx(
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full font-sans font-medium [&_svg]:size-[1em] [&_svg]:shrink-0',
        size === 'sm' ? 'h-[calc(var(--ui-icon)+0.125rem)] px-2 text-ui-sm' : 'h-[calc(var(--ui-icon)+0.5rem)] px-2.5 text-ui-sm',
        customColor && variant !== 'solid' ? custom[variant] : tones[tone],
        className,
      )}
    >
      {dot && (
        <span
          aria-hidden
          className={cx('size-1.5 shrink-0 rounded-full', variant === 'solid' ? 'bg-current' : customColor ? 'bg-(--badge-color)' : dotColor[tone])}
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
  /** `accent` for unread, `neutral` for plain totals, `warning` or `danger` for counts that need attention. */
  tone?: BadgeTone
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
        tone === 'neutral' ? 'bg-button text-fg' : solid[tone],
        className,
      )}
    >
      {count > max ? `${max}+` : count}
    </span>
  )
}
