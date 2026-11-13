import type { ReactNode } from 'react'
import {
  Input,
  TextArea,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from 'react-aria-components'
import { cx } from '../../lib/cx'
import { FieldHelp, FieldLabel, fieldBox, fieldStack, placeholder, type FieldChromeProps } from './field'

export interface TextFieldProps extends Omit<AriaTextFieldProps, 'className' | 'children'>, FieldChromeProps {
  /** Hint text inside the empty control. */
  placeholder?: string
  /** Render a resizable multi-line textarea instead of a single-line input. */
  multiline?: boolean
  /** Visible rows when `multiline`. */
  rows?: number
  /** Monospace text, for IDs, keys and code. */
  mono?: boolean
  /** Icon or text inside the left edge of a single-line input. */
  prefix?: ReactNode
  className?: string
}

/** Labeled text input or textarea with help and error text. */
export function TextField({
  label,
  description,
  errorMessage,
  placeholder: hint,
  multiline,
  rows = 4,
  mono,
  prefix,
  className,
  ...props
}: TextFieldProps) {
  const text = cx(mono && 'font-mono text-[0.8125rem]', placeholder)
  return (
    <AriaTextField {...props} isInvalid={props.isInvalid ?? (errorMessage ? true : undefined)} className={fieldStack(className)}>
      {label && <FieldLabel>{label}</FieldLabel>}
      {multiline ? (
        <TextArea rows={rows} placeholder={hint} className={cx(fieldBox, text, 'resize-y px-3 py-2 leading-6')} />
      ) : prefix ? (
        <div className="relative flex items-center">
          <span className="pointer-events-none absolute left-2.5 flex text-subtle [&_svg]:size-icon">{prefix}</span>
          <Input placeholder={hint} className={cx(fieldBox, text, 'h-control w-full pr-3 pl-8 touch:h-control-touch')} />
        </div>
      ) : (
        <Input placeholder={hint} className={cx(fieldBox, text, 'h-control px-3 touch:h-control-touch')} />
      )}
      <FieldHelp description={description} errorMessage={errorMessage} />
    </AriaTextField>
  )
}
