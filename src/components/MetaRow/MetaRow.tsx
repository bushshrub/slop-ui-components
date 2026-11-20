import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

export interface MetaRowProps {
  children: ReactNode
  className?: string
}

/**
 * Short facts about one thing (counts, dates, sizes) in a muted row that wraps between items. Spacing and an
 * optional icon per fact separate them, so there is no separator glyph to read out or to wrap onto its own line.
 */
export function MetaRow({ children, className }: MetaRowProps) {
  return <span className={cx('flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-ui-sm text-muted tabular-nums', className)}>{children}</span>
}

export interface MetaItemProps {
  /** Decorative icon in front of the value. */
  icon?: ReactNode
  /**
   * What the value measures, e.g. "Last updated", when the icon alone says it. Read by screen readers before the
   * value and shown as a tooltip on hover.
   */
  label?: string
  children: ReactNode
}

/** One fact in a MetaRow. It never wraps inside itself. */
export function MetaItem({ icon, label, children }: MetaItemProps) {
  return (
    <span title={label} className="inline-flex min-w-0 items-center gap-1 whitespace-nowrap">
      {icon && (
        <span aria-hidden className="flex shrink-0 [&_svg]:size-3.5">
          {icon}
        </span>
      )}
      {label && <span className="sr-only">{label}: </span>}
      {children}
    </span>
  )
}
