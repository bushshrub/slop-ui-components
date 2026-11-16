import type { ReactNode } from 'react'
import {
  Cell as AriaCell,
  Column as AriaColumn,
  Row as AriaRow,
  Table as AriaTable,
  TableLayout,
  Virtualizer,
  TableBody as AriaTableBody,
  TableHeader as AriaTableHeader,
  type Key,
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
        // Forced colors drops the selected fill: outline the row instead
        'forced-colors:data-selected:outline-solid forced-colors:data-selected:outline-2 forced-colors:data-selected:-outline-offset-2 forced-colors:data-selected:outline-[Highlight]',
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

/**
 * Body cell. One line that truncates; use `numeric` and `mono` instead of styling numbers by hand.
 * For taller content pass `className="h-auto py-2 whitespace-normal"`.
 */
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

// Same components under names that do not collide with an app's own Row, Cell or Column
export { Row as TableRow, Cell as TableCell, Column as TableColumn }

export interface DataTableColumn<T> {
  id: string
  /** Column heading. */
  header: ReactNode
  /** What the column shows for a row. */
  cell: (row: T) => ReactNode
  align?: 'start' | 'end'
  /** Tabular numerals, right-aligned (heading too). */
  numeric?: boolean
  /** Monospace, muted. */
  mono?: boolean
  /** Makes the heading a sort button. Sorting itself is yours: see `sortDescriptor` / `onSortChange`. */
  allowsSorting?: boolean
  /** The column that names the row for screen readers. Defaults to the first column. */
  isRowHeader?: boolean
  /** Fixed width for the column, e.g. `w-28`. */
  className?: string
  /** Extra classes for this column's body cells. */
  cellClassName?: string
}

export interface DataTableProps<T> extends Omit<TableProps, 'children'> {
  columns: readonly DataTableColumn<T>[]
  rows: readonly T[]
  /** Stable id for a row. */
  rowKey: (row: T) => Key
  /** Makes rows pressable (click, Enter). */
  onRowPress?: (row: T) => void
  /** Makes rows links. */
  rowHref?: (row: T) => string | undefined
  /** Shown in place of the rows when there are none. */
  emptyState?: ReactNode
  /**
   * Renders only the rows in view, for thousands of rows. Rows must then be a fixed height (`rowHeight`) and the
   * table scrolls itself, so give it a height (`height`, or a `className` with one). Off by default; the table
   * is laid out as a normal one, with the same keyboard navigation and selection.
   */
  virtualized?: boolean
  /** Height of every row in px when `virtualized`. Default 37: the standard row plus its divider. Match it if you change density. */
  rowHeight?: number
  /** Height of the header row in px when `virtualized`. Default 33. */
  headingHeight?: number
  /** Height of the scrolling table when `virtualized`, any CSS length. Default `24rem`. */
  height?: string
}

/**
 * Table from an array of column definitions and an array of rows: the short form for plain data lists.
 * Takes every `Table` prop (`aria-label`, `sortDescriptor`, `selectionMode` ...). Compose `Table` by hand
 * when rows differ from each other or cells need their own props.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowPress,
  rowHref,
  emptyState,
  virtualized,
  rowHeight = 37,
  headingHeight = 33,
  height = '24rem',
  ...props
}: DataTableProps<T>) {
  const rowHeader = columns.find((c) => c.isRowHeader)?.id ?? columns[0]?.id
  const table = (
    <Table
      {...props}
      className={cx(virtualized && 'block overflow-auto', props.className)}
      style={virtualized ? { height } : undefined}
    >
      <TableHeader>
        {columns.map((c) => (
          <Column
            key={c.id}
            id={c.id}
            isRowHeader={c.id === rowHeader}
            allowsSorting={c.allowsSorting}
            align={c.align ?? (c.numeric ? 'end' : 'start')}
            className={c.className}
          >
            {c.header}
          </Column>
        ))}
      </TableHeader>
      <TableBody emptyState={emptyState}>
        {rows.map((row) => (
          <Row key={rowKey(row)} id={rowKey(row)} href={rowHref?.(row)} onAction={onRowPress && (() => onRowPress(row))}>
            {columns.map((c) => (
              <Cell key={c.id} align={c.align} numeric={c.numeric} mono={c.mono} className={c.cellClassName}>
                {c.cell(row)}
              </Cell>
            ))}
          </Row>
        ))}
      </TableBody>
    </Table>
  )
  if (!virtualized) return table
  return (
    <Virtualizer layout={TableLayout} layoutOptions={{ rowHeight, headingHeight }}>
      {table}
    </Virtualizer>
  )
}
