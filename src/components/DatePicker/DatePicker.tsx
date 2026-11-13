import { CalendarDate, DateFormatter, type DateValue } from '@internationalized/date'
import { useState, type FocusEvent, type ReactNode } from 'react'
import {
  DateField as AriaDateField,
  DateInput,
  DatePicker as AriaDatePicker,
  DateRangePicker as AriaDateRangePicker,
  DateSegment,
  Dialog,
  Group,
  Popover,
  useLocale,
  type DateFieldProps as AriaDateFieldProps,
  type DatePickerProps as AriaDatePickerProps,
  type DateRangePickerProps as AriaDateRangePickerProps,
} from 'react-aria-components'
import { CalendarDays } from 'lucide-react'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'
import { IconButton } from '../Button/Button'
import { FieldHelp, FieldLabel, fieldBox, fieldStack, type FieldChromeProps } from '../Inputs/field'
import { Calendar, RangeCalendar } from './Calendar'

export interface DateFieldProps<T extends DateValue = DateValue>
  extends Omit<AriaDateFieldProps<T>, 'className' | 'children'>,
    FieldChromeProps {
  className?: string
}

export interface DatePickerProps<T extends DateValue = DateValue>
  extends Omit<AriaDatePickerProps<T>, 'className' | 'children'>,
    FieldChromeProps {
  className?: string
}

export interface DateRangePickerProps<T extends DateValue = DateValue>
  extends Omit<AriaDateRangePickerProps<T>, 'className' | 'children'>,
    FieldChromeProps {
  className?: string
}

// The field row: fieldBox sizing from --ui-control (--ui-control-touch on touch screens)
const fieldRow = cx(fieldBox, 'flex h-control w-full min-w-0 items-center gap-1 px-3 touch:h-control-touch')

const segmentClass = cx(
  'rounded-sm px-px whitespace-nowrap tabular-nums outline-none data-placeholder:text-subtle',
  'data-focused:bg-interactive data-focused:text-interactive-fg',
)

// A one-digit day or month is too narrow to tap, so touch screens get a minimum width. Not the separators between them.
const segment = ({ type }: { type: string }) => cx(segmentClass, type !== 'literal' && 'touch:min-w-6 touch:text-center')

/**
 * react-aria moves a day that does not exist (31 February) to the month's last day when focus leaves the
 * field. This says so under the field, so the change is not silent. Wrap the inputs in `watch`.
 */
function useAdjustedNote() {
  const strings = useStrings()
  const { locale } = useLocale()
  const [note, setNote] = useState<string>()
  const read = (input: Element, type: string) => Number(input.querySelector(`[data-type="${type}"]`)?.getAttribute('aria-valuenow') ?? NaN)

  const onBlurCapture = (event: FocusEvent<HTMLElement>) => {
    const field = event.currentTarget
    if (field.contains(event.relatedTarget)) return
    // What was typed, per input (a range picker has two), before react-aria corrects it
    const typed = [...new Set([...field.querySelectorAll('[data-type="day"]')].map((day) => day.parentElement!))].map((input) => ({
      input,
      day: read(input, 'day'),
    }))
    setTimeout(() => {
      for (const { input, day } of typed) {
        const [now, month, year] = [read(input, 'day'), read(input, 'month'), read(input, 'year')]
        if ([day, now, month, year].some(Number.isNaN) || now >= day) continue
        // Segment numbers are only safe to read as a Gregorian date here; other calendars get no note
        const formatter = new DateFormatter(locale, { dateStyle: 'medium', timeZone: 'UTC' })
        if (formatter.resolvedOptions().calendar !== 'gregory') continue
        const date = new CalendarDate(year, month, now).toDate('UTC')
        setNote(strings.dateAdjusted(new Intl.NumberFormat(locale).format(day), formatter.format(date)))
      }
    })
  }

  const watch = (inputs: ReactNode) => (
    <div className="contents" onBlurCapture={onBlurCapture} onFocusCapture={() => setNote(undefined)}>
      {inputs}
    </div>
  )
  const adjusted = note && (
    <p role="status" className="text-ui-sm leading-4 text-fg">
      {note}
    </p>
  )
  return { watch, adjusted }
}

const popover = 'rounded-popover border border-border bg-popover p-3 text-fg shadow-popover outline-none motion-safe:data-entering:animate-pop-in'

/** Typed date entry: one segment per part (day, month, year), each editable with the keyboard. */
export function DateField<T extends DateValue = DateValue>({ label, description, errorMessage, className, ...props }: DateFieldProps<T>) {
  const { watch, adjusted } = useAdjustedNote()
  return (
    <AriaDateField {...props} isInvalid={props.isInvalid ?? (errorMessage ? true : undefined)} className={fieldStack(className)}>
      {label && <FieldLabel>{label}</FieldLabel>}
      {watch(<DateInput className={fieldRow}>{(item) => <DateSegment segment={item} className={segment} />}</DateInput>)}
      {adjusted}
      <FieldHelp description={description} errorMessage={errorMessage} />
    </AriaDateField>
  )
}

/** Date field with a calendar button that opens a month view. Typing and picking both set the value. */
export function DatePicker<T extends DateValue = DateValue>({ label, description, errorMessage, className, ...props }: DatePickerProps<T>) {
  const strings = useStrings()
  const { watch, adjusted } = useAdjustedNote()
  return (
    <AriaDatePicker {...props} isInvalid={props.isInvalid ?? (errorMessage ? true : undefined)} className={fieldStack(className)}>
      {label && <FieldLabel>{label}</FieldLabel>}
      {watch(
        <Group className={cx(fieldRow, 'pr-1')}>
          <DateInput className="flex min-w-0 flex-1 items-center">{(item) => <DateSegment segment={item} className={segment} />}</DateInput>
          <IconButton aria-label={strings.openCalendar} size="sm" className="text-muted">
            <CalendarDays aria-hidden className="size-icon" />
          </IconButton>
        </Group>,
      )}
      {adjusted}
      <FieldHelp description={description} errorMessage={errorMessage} />
      <Popover placement="bottom start" offset={4} className={popover}>
        <Dialog className="outline-none">
          <Calendar />
        </Dialog>
      </Popover>
    </AriaDatePicker>
  )
}

/** Two date fields with an en dash between them, and a range calendar in the popover. */
export function DateRangePicker<T extends DateValue = DateValue>({
  label,
  description,
  errorMessage,
  className,
  ...props
}: DateRangePickerProps<T>) {
  const strings = useStrings()
  const { watch, adjusted } = useAdjustedNote()
  return (
    <AriaDateRangePicker {...props} isInvalid={props.isInvalid ?? (errorMessage ? true : undefined)} className={fieldStack(className)}>
      {label && <FieldLabel>{label}</FieldLabel>}
      {watch(
        <Group className={cx(fieldRow, 'pr-1')}>
          {/* The start date takes only its own width, so the dash sits midway between the two dates */}
          <DateInput slot="start" className="flex min-w-0 items-center">
            {(item) => <DateSegment segment={item} className={segment} />}
          </DateInput>
          <span aria-hidden className="px-1 text-muted">
            –
          </span>
          <DateInput slot="end" className="flex min-w-0 flex-1 items-center">
            {(item) => <DateSegment segment={item} className={segment} />}
          </DateInput>
          <IconButton aria-label={strings.openCalendar} size="sm" className="text-muted">
            <CalendarDays aria-hidden className="size-icon" />
          </IconButton>
        </Group>,
      )}
      {adjusted}
      <FieldHelp description={description} errorMessage={errorMessage} />
      <Popover placement="bottom start" offset={4} className={popover}>
        <Dialog className="outline-none">
          <RangeCalendar />
        </Dialog>
      </Popover>
    </AriaDateRangePicker>
  )
}
