import { createContext, useContext, type ReactNode } from 'react'
import {
  Cell as AriaCell,
  Column as AriaColumn,
  ColumnResizer,
  ResizableTableContainer,
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
import { PHONE_QUERY, useMediaQuery } from '../../lib/useMediaQuery'

type ColumnSize = NonNullable<AriaColumnProps['defaultWidth']>
type ColumnStaticSize = NonNullable<AriaColumnProps['minWidth']>

export interface TableProps extends Omit<AriaTableProps, 'className'> {
  className?: string
  /**
   * What happens when the columns need more room than the table has.
   * - `fit` (default): the table is exactly as wide as its container and cells truncate. Right for lists a phone
   *   should read top to bottom; drop the columns a phone does not need (`hideOnPhone` in DataTable).
   * - `scroll`: each column is as wide as its content and the table scrolls sideways. Right for wide data a reader
   *   compares across columns (logs, metrics), where truncating every cell would leave nothing to read.
   */
  overflow?: 'fit' | 'scroll'
  /**
   * Lets the user drag a column's right edge (or use the arrow keys on it) to resize it. Size columns with `width`,
   * `defaultWidth`, `minWidth` and `maxWidth` on Column (px, %, or `fr`); width classes are ignored while resizing is
   * on. A column can opt out with `allowsResizing={false}`. The table scrolls sideways once columns outgrow it.
   */
  resizableColumns?: boolean
  /** Called with every column's width when a resize ends, e.g. to save them. Requires `resizableColumns`. */
  onColumnResizeEnd?: (widths: Map<Key, ColumnSize>) => void
}

const ResizableContext = createContext(false)

/** The scroll box around the table: none in `fit`, a sideways scroller in `scroll`, react-aria's when resizable. */
function TableFrame({ overflow, resizableColumns, onColumnResizeEnd, children }: Pick<TableProps, 'overflow' | 'resizableColumns' | 'onColumnResizeEnd'> & { children: ReactNode }) {
  if (resizableColumns)
    return (
      <ResizableTableContainer onResizeEnd={onColumnResizeEnd} className="relative w-full overflow-x-auto">
        <ResizableContext.Provider value>{children}</ResizableContext.Provider>
      </ResizableTableContainer>
    )
  if (overflow === 'scroll') return <div className="w-full overflow-x-auto">{children}</div>
  return children
}

function tableClass(overflow: TableProps['overflow'], resizableColumns: boolean | undefined, className?: string) {
  return cx(
    'border-collapse text-ui outline-none',
    // Auto layout sizes each column to its content; the table never gets narrower than its box
    overflow === 'scroll' && !resizableColumns ? 'min-w-full table-auto' : 'w-full table-fixed',
    className,
  )
}

/**
 * Dense data table on react-aria Table: keyboard grid navigation, sorting via
 * `sortDescriptor` / `onSortChange`, optional row selection. Compose with
 * TableHeader > Column and TableBody > Row > Cell.
 */
export function Table({ className, overflow = 'fit', resizableColumns, onColumnResizeEnd, ...props }: TableProps) {
  return (
    <TableFrame overflow={overflow} resizableColumns={resizableColumns} onColumnResizeEnd={onColumnResizeEnd}>
      <AriaTable {...props} className={tableClass(overflow, resizableColumns, className)} />
    </TableFrame>
  )
}

export function TableHeader<T extends object>(props: TableHeaderProps<T>) {
  return <AriaTableHeader {...props} className="border-b border-border" />
}

export interface ColumnProps extends Omit<AriaColumnProps, 'className' | 'children'> {
  /** Right-align, for numbers and dates. */
  align?: 'start' | 'end'
  /** Fixed width, e.g. `w-28`. Columns without one share the rest. Ignored when the table has `resizableColumns`. */
  className?: string
  children?: ReactNode
  /** Opt this column out of resizing in a table with `resizableColumns`. Default true there. */
  allowsResizing?: boolean
}

/** Header cell. Set `allowsSorting` to make it a sort button; one column needs `isRowHeader`. */
export function Column({ align = 'start', className, children, allowsResizing = true, ...props }: ColumnProps) {
  const resizable = useContext(ResizableContext) && allowsResizing
  return (
    <AriaColumn
      {...props}
      className={cx(
        'relative h-control-sm px-2 touch:h-control-touch text-ui-sm font-medium whitespace-nowrap text-muted outline-none data-focus-visible:ring-2 data-focus-visible:ring-focus data-focus-visible:ring-inset',
        align === 'end' ? 'text-right' : 'text-left',
        className,
      )}
    >
      {({ allowsSorting, sortDirection }) => (
        <>
          <span className={cx('inline-flex max-w-full items-center gap-1', allowsSorting && 'cursor-default hover:text-fg', align === 'end' && 'flex-row-reverse')}>
            <span className="truncate">{children}</span>
            {allowsSorting && (
              <span aria-hidden className={cx('flex size-3.5 shrink-0', !sortDirection && 'invisible')}>
                {sortDirection === 'descending' ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
              </span>
            )}
          </span>
          {resizable && <ColumnResizer className={resizerClass} />}
        </>
      )}
    </AriaColumn>
  )
}

// A wide, invisible grab area on the column's right edge, drawn as a 1px line that turns accent while hovered or dragged
const resizerClass = cx(
  'absolute inset-y-0 -right-1.5 z-10 flex w-3 touch:w-5 touch:-right-2.5 cursor-col-resize touch-none justify-center outline-none',
  'after:my-1.5 after:w-px after:bg-border after:content-[""] data-hovered:after:bg-focus data-resizing:after:w-0.5 data-resizing:after:bg-focus',
  'data-focus-visible:after:w-0.5 data-focus-visible:after:bg-focus forced-colors:after:bg-[CanvasText]',
)

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
  /** Fixed width for the column, e.g. `w-28`. Ignored with `resizableColumns`: use `defaultWidth`. */
  className?: string
  /** Extra classes for this column's body cells. */
  cellClassName?: string
  /** Leave the column out below 768px. For `overflow="fit"` tables, so a phone shows the few columns that matter. */
  hideOnPhone?: boolean
  /** Starting width with `resizableColumns`: px, %, or `fr`. Default `1fr`. */
  defaultWidth?: ColumnSize
  /** Narrowest the user can drag the column, in px or %. */
  minWidth?: ColumnStaticSize
  /** Widest the user can drag the column, in px or %. */
  maxWidth?: ColumnStaticSize
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
  overflow = 'fit',
  resizableColumns,
  onColumnResizeEnd,
  className,
  ...props
}: DataTableProps<T>) {
  const phone = useMediaQuery(PHONE_QUERY)
  const shown = phone ? columns.filter((c) => !c.hideOnPhone) : columns
  const rowHeader = shown.find((c) => c.isRowHeader)?.id ?? shown[0]?.id
  const table = (
    <AriaTable
      {...props}
      className={tableClass(overflow, resizableColumns, cx(virtualized && 'block overflow-auto', className))}
      style={virtualized ? { height } : undefined}
    >
      <TableHeader>
        {shown.map((c) => (
          <Column
            key={c.id}
            id={c.id}
            isRowHeader={c.id === rowHeader}
            allowsSorting={c.allowsSorting}
            align={c.align ?? (c.numeric ? 'end' : 'start')}
            className={c.className}
            defaultWidth={c.defaultWidth}
            minWidth={c.minWidth}
            maxWidth={c.maxWidth}
          >
            {c.header}
          </Column>
        ))}
      </TableHeader>
      <TableBody emptyState={emptyState}>
        {rows.map((row) => (
          <Row key={rowKey(row)} id={rowKey(row)} href={rowHref?.(row)} onAction={onRowPress && (() => onRowPress(row))}>
            {shown.map((c) => (
              <Cell key={c.id} align={c.align} numeric={c.numeric} mono={c.mono} className={c.cellClassName}>
                {c.cell(row)}
              </Cell>
            ))}
          </Row>
        ))}
      </TableBody>
    </AriaTable>
  )
  return (
    <TableFrame overflow={virtualized ? 'fit' : overflow} resizableColumns={resizableColumns} onColumnResizeEnd={onColumnResizeEnd}>
      {virtualized ? (
        <Virtualizer layout={TableLayout} layoutOptions={{ rowHeight, headingHeight }}>
          {table}
        </Virtualizer>
      ) : (
        table
      )}
    </TableFrame>
  )
}
