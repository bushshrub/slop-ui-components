import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

export interface DescriptionListProps {
  /**
   * - `columns` (default): labels in a column on the left, sized to the longest one, values beside them. Under
   *   640px each label sits above its value.
   * - `stacked`: every label above its value, for narrow panels.
   */
  layout?: 'columns' | 'stacked'
  /** A hairline between items. */
  divided?: boolean
  className?: string
  children: ReactNode
}

/**
 * Labelled facts about one thing: a details panel ("Status: Running", "Region: eu-west"). Fill it with
 * DescriptionItem. Renders a `<dl>`, so screen readers announce each label with its value.
 */
export function DescriptionList({ layout = 'columns', divided, className, children }: DescriptionListProps) {
  return (
    <dl
      data-layout={layout}
      className={cx(
        'group/dl m-0 grid text-ui',
        layout === 'columns' ? 'grid-cols-1 sm:grid-cols-[minmax(0,max-content)_minmax(0,1fr)] sm:gap-x-6' : 'grid-cols-1',
        divided ? '[&>div]:py-2 [&>div:not(:last-child)]:border-b [&>div]:border-divider' : 'gap-y-2.5',
        className,
      )}
    >
      {children}
    </dl>
  )
}

export interface DescriptionItemProps {
  /** What the value is, e.g. "Region". */
  label: ReactNode
  /** Decorative icon before the label. */
  icon?: ReactNode
  /** Monospace, for IDs, hashes and keys. */
  mono?: boolean
  /** Tabular numerals, for counts, sizes, money and dates. */
  numeric?: boolean
  className?: string
  /** The value. */
  children: ReactNode
}

/** One label and its value in a DescriptionList. Values wrap; long IDs break anywhere rather than overflow. */
export function DescriptionItem({ label, icon, mono, numeric, className, children }: DescriptionItemProps) {
  return (
    <div className={cx('col-span-full grid min-w-0 grid-cols-subgrid items-baseline gap-y-0.5', className)}>
      <dt className="flex min-w-0 items-center gap-1.5 text-muted">
        {icon && (
          <span aria-hidden className="flex shrink-0 [&_svg]:size-icon">
            {icon}
          </span>
        )}
        {label}
      </dt>
      <dd
        className={cx(
          'm-0 min-w-0 text-fg [overflow-wrap:anywhere]',
          mono && 'font-mono text-ui-sm',
          numeric && 'tabular-nums',
        )}
      >
        {children}
      </dd>
    </div>
  )
}
