import type { CalendarDate, DateValue } from '@internationalized/date'
import {
  Calendar as AriaCalendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Heading,
  RangeCalendar as AriaRangeCalendar,
  type CalendarProps as AriaCalendarProps,
  type RangeCalendarProps as AriaRangeCalendarProps,
} from 'react-aria-components'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'
import { IconButton } from '../Button/Button'

export interface CalendarProps<T extends DateValue = DateValue> extends Omit<AriaCalendarProps<T>, 'className' | 'children'> {
  className?: string
}

export interface RangeCalendarProps<T extends DateValue = DateValue> extends Omit<AriaRangeCalendarProps<T>, 'className' | 'children'> {
  className?: string
}

const calendarRoot = 'w-max text-fg outline-none'

// Day cells are table cells: full height of a control row, and the week's strip for ranges spans the whole cell.
const dayCell = cx(
  'group relative h-control cursor-default text-center text-ui text-fg outline-none touch:h-control-touch',
  'data-outside-month:text-subtle',
)

// The visible day square, sized from the control tokens (--ui-control, or --ui-control-touch on touch screens)
const daySquare = cx(
  'relative mx-auto flex size-control touch:size-control-touch items-center justify-center rounded-sm tabular-nums transition-colors',
  'group-data-hovered:bg-hover group-data-focus-visible:ring-2 group-data-focus-visible:ring-focus',
  'group-data-unavailable:text-subtle group-data-unavailable:line-through',
)

const daySelected = 'group-data-selected:bg-interactive group-data-selected:font-medium group-data-selected:text-interactive-fg'
// In a range only the endpoints are solid; the days between them get the soft strip instead
const dayEndpoint =
  'group-data-selection-start:bg-interactive group-data-selection-end:bg-interactive group-data-selection-start:text-interactive-fg group-data-selection-end:text-interactive-fg group-data-selection-start:font-medium group-data-selection-end:font-medium'

// Tinted strip behind a range. It starts at the middle of the start day and ends at the middle of the end day.
const rangeStrip = cx(
  'pointer-events-none absolute inset-y-0 inset-x-0 hidden bg-interactive/15',
  'group-data-selected:block group-data-selection-start:left-1/2 group-data-selection-end:right-1/2',
)

function Day({ date, range }: { date: CalendarDate; range?: boolean }) {
  return (
    <CalendarCell date={date} className={dayCell}>
      {({ formattedDate, isToday }) => (
        <>
          {range && <span aria-hidden className={rangeStrip} />}
          <span className={cx(daySquare, range ? dayEndpoint : daySelected)}>
            {formattedDate}
            {/* Today is a dot under the number; `bg-current` keeps it readable on the selected fill */}
            {isToday && <span aria-hidden className="absolute bottom-1 size-1 rounded-full bg-current" />}
          </span>
        </>
      )}
    </CalendarCell>
  )
}

/** Previous and next buttons with the month heading between them. */
function CalendarHeader() {
  const strings = useStrings()
  return (
    <div className="flex items-center gap-1 pb-2">
      <IconButton slot="previous" aria-label={strings.previousMonth} size="sm">
        <ChevronLeft aria-hidden className="size-icon" />
      </IconButton>
      <Heading className="flex-1 text-center text-ui font-medium text-fg" />
      <IconButton slot="next" aria-label={strings.nextMonth} size="sm">
        <ChevronRight aria-hidden className="size-icon" />
      </IconButton>
    </div>
  )
}

/** Weekday names and the month grid. Shared by Calendar and RangeCalendar. */
function Month({ range }: { range?: boolean }) {
  return (
    <CalendarGrid>
      <CalendarGridHeader>
        {(day) => <CalendarHeaderCell className="pb-1 text-center text-ui-sm font-normal text-muted">{day}</CalendarHeaderCell>}
      </CalendarGridHeader>
      <CalendarGridBody>{(date) => <Day date={date} range={range} />}</CalendarGridBody>
    </CalendarGrid>
  )
}

/** Month view for picking one day. Click a day to select it; arrow keys move focus. */
export function Calendar<T extends DateValue = DateValue>({ className, ...props }: CalendarProps<T>) {
  return (
    <AriaCalendar {...props} className={cx(calendarRoot, className)}>
      <CalendarHeader />
      <Month />
    </AriaCalendar>
  )
}

/** Month view for picking a span of days. The first click sets the start, the second sets the end. */
export function RangeCalendar<T extends DateValue = DateValue>({ className, ...props }: RangeCalendarProps<T>) {
  return (
    <AriaRangeCalendar {...props} className={cx(calendarRoot, className)}>
      <CalendarHeader />
      <Month range />
    </AriaRangeCalendar>
  )
}
