import type { ReactNode } from 'react'
import {
  Cell as AriaCell,
  Column as AriaColumn,
  Row as AriaRow,
  Table as AriaTable,
  TableBody as AriaTableBody,
  TableHeader as AriaTableHeader,
  type CellProps as AriaCellProps,
  type ColumnProps as AriaColumnProps,
  type RowProps,
  type TableBodyProps as AriaTableBodyProps,
  type TableHeaderProps,
  type TableProps as AriaTableProps,
} from 'react-aria-components'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cx } from '../../lib/cx'

export interface TableProps extends Omit<AriaTableProps, 'className'> {
  className?: string
}

/**
 * Dense data table on react-aria Table: keyboard grid navigation, sorting via
 * `sortDescriptor` / `onSortChange`, optional row selection. Compose with
 * TableHeader > Column and TableBody > Row > Cell.
 */
export function Table({ className, ...props }: TableProps) {
  return <AriaTable {...props} className={cx('w-full table-fixed border-collapse text-ui outline-none', className)} />
}

export function TableHeader<T extends object>(props: TableHeaderProps<T>) {
  return <AriaTableHeader {...props} className="border-b border-border" />
}

export interface ColumnProps extends Omit<AriaColumnProps, 'className' | 'children'> {
  /** Right-align, for numbers and dates. */
  align?: 'start' | 'end'
  /** Fixed width, e.g. `w-28`. Columns without one share the rest. */
  className?: string
  children?: ReactNode
}

/** Header cell. Set `allowsSorting` to make it a sort button; one column needs `isRowHeader`. */
export function Column({ align = 'start', className, children, ...props }: ColumnProps) {
  return (
    <AriaColumn
      {...props}
      className={cx(
        'h-control-sm px-2 touch:h-control-touch text-ui-sm font-medium whitespace-nowrap text-muted outline-none data-focus-visible:ring-2 data-focus-visible:ring-focus data-focus-visible:ring-inset',
        align === 'end' ? 'text-right' : 'text-left',
        className,
      )}
    >
      {({ allowsSorting, sortDirection }) => (
        <span className={cx('inline-flex items-center gap-1', allowsSorting && 'cursor-default hover:text-fg', align === 'end' && 'flex-row-reverse')}>
          {children}
          {allowsSorting && (
            <span aria-hidden className={cx('flex size-3.5', !sortDirection && 'invisible')}>
              {sortDirection === 'descending' ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
            </span>
          )}
        </span>
      )}
    </AriaColumn>
  )
}

export interface TableBodyProps<T> extends Omit<AriaTableBodyProps<T>, 'className' | 'renderEmptyState'> {
  /** Shown in a single full-width row when there are no rows. */
  emptyState?: ReactNode
}

export function TableBody<T extends object>({ emptyState, ...props }: TableBodyProps<T>) {
  return (
    <AriaTableBody
      {...props}
      renderEmptyState={emptyState ? () => <div className="px-2 py-8 text-center text-muted">{emptyState}</div> : undefined}
    />
  )
}

/** Data row. Hover fill, selected fill when the table allows selection. */
export function Row<T extends object>({ className, ...props }: Omit<RowProps<T>, 'className'> & { className?: string }) {
  return (
    <AriaRow
      {...props}
      className={cx(
        'border-b border-divider outline-none data-hovered:bg-hover data-selected:bg-selected',
        'data-focus-visible:outline-2 data-focus-visible:-outline-offset-2 data-focus-visible:outline-focus',
        className,
      )}
    />
  )
}

export interface CellProps extends Omit<AriaCellProps, 'className'> {
  align?: 'start' | 'end'
  /** Monospace, muted: for IDs, hashes, keys. */
  mono?: boolean
  /** Tabular numerals, right-aligned: for counts, sizes, money, dates. */
  numeric?: boolean
  className?: string
}

/** Body cell. Text truncates; use `numeric` and `mono` instead of styling numbers by hand. */
export function Cell({ align, mono, numeric, className, ...props }: CellProps) {
  return (
    <AriaCell
      {...props}
      className={cx(
        'h-row truncate px-2 outline-none data-focus-visible:ring-2 data-focus-visible:ring-focus data-focus-visible:ring-inset',
        mono && 'font-mono text-ui-sm text-muted',
        numeric && 'text-right tabular-nums',
        align === 'end' && 'text-right',
        className,
      )}
    />
  )
}
