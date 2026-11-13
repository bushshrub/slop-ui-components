import { useState, type ReactNode } from 'react'
import {
  Input,
  TextArea,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from 'react-aria-components'
import { Eye, EyeOff } from 'lucide-react'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'
import { IconButton } from '../Button/Button'
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
  /** Show/hide button inside a `type="password"` field. Default true. */
  revealable?: boolean
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
  revealable = true,
  className,
  ...props
}: TextFieldProps) {
  const strings = useStrings()
  const [revealed, setRevealed] = useState(false)
  const reveal = props.type === 'password' && revealable && !multiline
  const text = cx(mono && 'font-mono text-[0.8125rem]', placeholder)
  return (
    <AriaTextField {...props} type={reveal && revealed ? 'text' : props.type} isInvalid={props.isInvalid ?? (errorMessage ? true : undefined)} className={fieldStack(className)}>
      {label && <FieldLabel>{label}</FieldLabel>}
      {multiline ? (
        <TextArea rows={rows} placeholder={hint} className={cx(fieldBox, text, 'resize-y px-3 py-2 leading-6')} />
      ) : prefix || reveal ? (
        <div className="relative flex items-center">
          {prefix && <span className="pointer-events-none absolute left-2.5 flex text-subtle [&_svg]:size-icon">{prefix}</span>}
          <Input
            placeholder={hint}
            // The reveal button replaces the one Edge draws
            className={cx(fieldBox, text, 'h-control w-full touch:h-control-touch', prefix ? 'pl-8' : 'pl-3', reveal ? 'pr-10 [&::-ms-reveal]:hidden' : 'pr-3')}
          />
          {reveal && (
            <IconButton
              size="sm"
              aria-label={revealed ? strings.hidePassword : strings.showPassword}
              isDisabled={props.isDisabled}
              onPress={() => setRevealed((shown) => !shown)}
              className="absolute right-1"
            >
              {revealed ? <EyeOff /> : <Eye />}
            </IconButton>
          )}
        </div>
      ) : (
        <Input placeholder={hint} className={cx(fieldBox, text, 'h-control px-3 touch:h-control-touch')} />
      )}
      <FieldHelp description={description} errorMessage={errorMessage} />
    </AriaTextField>
  )
}
