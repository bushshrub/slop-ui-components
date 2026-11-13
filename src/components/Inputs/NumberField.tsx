import { NumberParser } from '@internationalized/number'
import { Minus, Plus } from 'lucide-react'
import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import {
  Button,
  Group,
  Input,
  NumberField as AriaNumberField,
  useLocale,
  type NumberFieldProps as AriaNumberFieldProps,
} from 'react-aria-components'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'
import { FieldHelp, FieldLabel, fieldBox, fieldStack, placeholder, type FieldChromeProps } from './field'

export interface NumberFieldProps extends Omit<AriaNumberFieldProps, 'className' | 'children' | 'commitBehavior'>, FieldChromeProps {
  /** Hint text inside the empty control. */
  placeholder?: string
  /** How far − and +, and the arrow keys, move the value. Typed values may fall between steps unless `enforceStep` is set. */
  step?: number
  /** Show an error when a typed value is not a multiple of `step`. */
  enforceStep?: boolean
  className?: string
}

// Stepper buttons sit inside the field box, separated from the input by a hairline
const stepper = cx(
  'flex w-control-sm shrink-0 cursor-default items-center justify-center border-l border-field-border text-muted outline-none touch:w-control-touch',
  '[&_svg]:size-icon data-hovered:bg-hover data-hovered:text-fg data-pressed:bg-hover data-disabled:opacity-50',
  'data-focus-visible:ring-2 data-focus-visible:ring-inset data-focus-visible:ring-focus',
)

// Typed digits are kept up to this many decimals when `formatOptions` sets no limit, so nothing is rounded away
const KEPT_DECIMALS = 10

interface Affix {
  text: string
  side: 'start' | 'end'
}

/**
 * Splits currency, unit and percent formats into a plain number format for the input and the symbol to show
 * beside it. The symbol stays out of the editable text, so the caret can never land on the wrong side of it.
 */
function splitFormat(locale: string, options: Intl.NumberFormatOptions | undefined) {
  const style = options?.style ?? 'decimal'
  const rest = { ...options }
  delete rest.maximumFractionDigits
  let affix: Affix | undefined
  if (style !== 'decimal') {
    const formatter = new Intl.NumberFormat(locale, options)
    const parts = formatter.formatToParts(1)
    const symbol = parts.findIndex((part) => part.type === 'currency' || part.type === 'unit' || part.type === 'percentSign')
    if (symbol >= 0) {
      affix = { text: parts[symbol].value, side: symbol < parts.findIndex((part) => part.type === 'integer') ? 'start' : 'end' }
    }
    for (const key of ['currency', 'currencyDisplay', 'currencySign', 'unit', 'unitDisplay'] as const) delete rest[key]
    if (style === 'currency') {
      // Keep the currency's own decimals (two for USD, none for JPY)
      const resolved = formatter.resolvedOptions()
      rest.minimumFractionDigits ??= resolved.minimumFractionDigits
      rest.maximumFractionDigits = resolved.maximumFractionDigits
    }
  }
  const format: Intl.NumberFormatOptions = {
    maximumFractionDigits: options?.maximumFractionDigits ?? KEPT_DECIMALS,
    ...rest,
    style: 'decimal',
  }
  // A percent value of 0.5 is typed and shown as 50
  return { format, affix, scale: style === 'percent' ? 100 : 1 }
}

const decimals = (n: number) => (String(n).split('.')[1] ?? '').length
// Removes float noise such as 0.07 * 100 = 7.000000000000001
const tidy = (n: number) => +n.toFixed(KEPT_DECIMALS)

/** The next value one step up or down. A value between steps moves to the nearest step in that direction. */
function stepFrom(value: number, direction: 1 | -1, step: number, min: number | undefined, max: number | undefined) {
  const base = min ?? 0
  if (Number.isNaN(value)) return Math.min(Math.max(0, min ?? -Infinity), max ?? Infinity)
  const position = (value - base) / step
  const epsilon = 1e-9
  const index = direction > 0 ? Math.floor(position + epsilon) + 1 : Math.ceil(position - epsilon) - 1
  const next = +(base + index * step).toFixed(Math.max(decimals(step), decimals(base)))
  return Math.min(Math.max(next, min ?? -Infinity), max ?? Infinity)
}

/**
 * Labeled number input with − and + steppers. What you type is kept as typed: a value outside `minValue` and
 * `maxValue` shows an error instead of being changed. Use `formatOptions` for currency, percent or units;
 * the symbol sits beside the number.
 */
export function NumberField({
  label,
  description,
  errorMessage,
  placeholder: hint,
  step = 1,
  enforceStep,
  value,
  defaultValue,
  onChange,
  minValue,
  maxValue,
  formatOptions,
  validate,
  className,
  ...props
}: NumberFieldProps) {
  const { locale } = useLocale()
  const strings = useStrings()
  // Keyed by content: callers usually pass `formatOptions` as a new object on every render
  const formatKey = JSON.stringify(formatOptions)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { format, affix, scale } = useMemo(() => splitFormat(locale, formatOptions), [locale, formatKey])
  const parser = useMemo(() => new NumberParser(locale, format), [locale, format])
  const inputRef = useRef<HTMLInputElement>(null)

  // Everything below works in the units shown in the input (50 for 50%); `value` and `onChange` use the caller's (0.5)
  const [inner, setInner] = useState(defaultValue ?? NaN)
  const shown = tidy((value !== undefined ? value : inner) * scale)
  const min = minValue === undefined ? undefined : tidy(minValue * scale)
  const max = maxValue === undefined ? undefined : tidy(maxValue * scale)
  const shownStep = tidy(step * scale)

  const change = (next: number) => {
    const result = tidy(next / scale)
    if (value === undefined) setInner(result)
    onChange?.(result)
  }

  // Steps from the text in the input, which may not be committed yet
  const bump = (direction: 1 | -1) => {
    const text = inputRef.current?.value ?? ''
    const typed = text.trim() === '' ? NaN : parser.parse(text)
    const next = stepFrom(Number.isNaN(typed) ? shown : typed, direction, shownStep, min, max)
    if (next !== shown) change(next)
  }

  // The range is checked here and not handed to react-aria, which would clamp and round the typed value
  const check = (typed: number) => {
    const say = (n: number) => new Intl.NumberFormat(locale, formatOptions).format(n)
    if (maxValue !== undefined && max !== undefined && typed > max) return strings.numberTooHigh(say(maxValue))
    if (minValue !== undefined && min !== undefined && typed < min) return strings.numberTooLow(say(minValue))
    if (enforceStep && Math.abs(tidy((typed - (min ?? 0)) / shownStep) % 1) > 0) return strings.numberOffStep(say(step))
    return validate?.(tidy(typed / scale))
  }

  const locked = props.isDisabled || props.isReadOnly

  const onKeyDownCapture = (event: KeyboardEvent<HTMLInputElement>) => {
    if (locked) return
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      event.stopPropagation()
      bump(event.key === 'ArrowUp' ? 1 : -1)
    } else if (['Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) {
      // These move the caret as in any text field, not the value to its minimum or maximum
      event.stopPropagation()
    }
  }

  const affixLabel = affix && (
    // Hidden from screen readers here; they get the symbol with the label
    <span
      aria-hidden
      onMouseDown={(event) => {
        event.preventDefault()
        inputRef.current?.focus()
      }}
      className={cx('flex shrink-0 cursor-text items-center text-muted select-none', affix.side === 'start' ? 'pl-3' : 'pr-3')}
    >
      {affix.text}
    </span>
  )

  return (
    <AriaNumberField
      isWheelDisabled
      {...props}
      value={shown}
      onChange={change}
      formatOptions={format}
      validate={check}
      isInvalid={props.isInvalid ?? (errorMessage ? true : undefined)}
      className={fieldStack(className)}
    >
      {label && (
        <FieldLabel>
          {label}
          {/* The symbol sits outside the input, so screen readers get it with the label: "Monthly budget ($)" */}
          {affix && <span className="sr-only"> ({affix.text})</span>}
        </FieldLabel>
      )}
      <Group className={cx(fieldBox, 'flex h-control items-stretch overflow-hidden touch:h-control-touch')}>
        {affix?.side === 'start' && affixLabel}
        <Input
          ref={inputRef}
          placeholder={hint}
          onKeyDownCapture={onKeyDownCapture}
          className={cx(placeholder, 'min-w-0 flex-1 bg-transparent outline-none', affix?.side === 'start' ? 'pr-3 pl-1.5' : 'px-3')}
        />
        {affix?.side === 'end' && affixLabel}
        {/* Own buttons, not the react-aria slots: those step by its own `step`, which would also reject typed values between steps */}
        <Button
          slot={null}
          aria-label={typeof label === 'string' ? strings.decreaseField(label) : strings.decrease}
          excludeFromTabOrder
          preventFocusOnPress
          isDisabled={locked || (min !== undefined && shown <= min)}
          onPress={() => bump(-1)}
          className={stepper}
        >
          <Minus />
        </Button>
        <Button
          slot={null}
          aria-label={typeof label === 'string' ? strings.increaseField(label) : strings.increase}
          excludeFromTabOrder
          preventFocusOnPress
          isDisabled={locked || (max !== undefined && shown >= max)}
          onPress={() => bump(1)}
          className={stepper}
        >
          <Plus />
        </Button>
      </Group>
      <FieldHelp description={description} errorMessage={errorMessage} />
    </AriaNumberField>
  )
}
