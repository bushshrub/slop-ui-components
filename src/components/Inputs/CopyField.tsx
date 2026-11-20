import { useEffect, useRef, useState } from 'react'
import { Input, TextField as AriaTextField } from 'react-aria-components'
import { Check, Copy, Eye, EyeOff } from 'lucide-react'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'
import { IconButton } from '../Button/Button'
import { FieldHelp, FieldLabel, fieldBox, fieldStack, type FieldChromeProps } from './field'

export interface CopyFieldProps extends FieldChromeProps {
  /** The text to show and copy: an ID, a URL, a key. */
  value: string
  /** Hide the value behind dots until Show is pressed. Copy still copies the real value. */
  secret?: boolean
  /** Monospace text. Default true, as these are usually IDs and keys. */
  mono?: boolean
  /** Name for screen readers when there is no visible `label`. */
  'aria-label'?: string
  /** Called after the value is on the clipboard. */
  onCopy?: () => void
  className?: string
}

/**
 * A read-only value with a Copy button, for IDs, URLs and API keys. With `secret` it shows dots and a Show button.
 * The button turns into a check for a moment once the value is copied.
 */
export function CopyField({ label, description, errorMessage, value, secret, mono = true, onCopy, className, ...props }: CopyFieldProps) {
  const strings = useStrings()
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const timer = useRef<number>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // No clipboard access (an insecure page, a denied permission): select the text so the user can copy it
      setRevealed(true)
      requestAnimationFrame(() => input.current?.select())
      return
    }
    setCopied(true)
    onCopy?.()
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1500)
  }

  const hidden = secret && !revealed
  return (
    <AriaTextField
      aria-label={props['aria-label']}
      value={value}
      isReadOnly
      type={hidden ? 'password' : 'text'}
      isInvalid={errorMessage ? true : undefined}
      className={fieldStack(className)}
    >
      {label && <FieldLabel>{label}</FieldLabel>}
      <div className="relative flex items-center">
        <Input
          ref={input}
          // Clicking the value selects all of it, ready to copy by hand
          onFocus={(e) => e.currentTarget.select()}
          className={cx(
            fieldBox,
            'h-control w-full truncate pl-3 text-fg touch:h-control-touch [&::-ms-reveal]:hidden',
            mono && 'font-mono text-[0.8125rem]',
            secret ? 'pr-[4.25rem]' : 'pr-10',
          )}
        />
        <div className="absolute right-1 flex items-center">
          {secret && (
            <IconButton size="sm" aria-label={revealed ? strings.hide : strings.show} onPress={() => setRevealed((r) => !r)}>
              {revealed ? <EyeOff /> : <Eye />}
            </IconButton>
          )}
          <IconButton size="sm" aria-label={copied ? strings.copied : strings.copy} onPress={copy}>
            {copied ? <Check className="text-success" /> : <Copy />}
          </IconButton>
        </div>
      </div>
      <FieldHelp description={description} errorMessage={errorMessage} />
      {/* Announces the copy; the button's new name alone is not read while it keeps focus */}
      <span role="status" className="sr-only">
        {copied ? strings.copied : ''}
      </span>
    </AriaTextField>
  )
}
