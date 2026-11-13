import { Button, Input, SearchField as AriaSearchField, type SearchFieldProps as AriaSearchFieldProps } from 'react-aria-components'
import { Search, X } from 'lucide-react'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'
import { FieldHelp, FieldLabel, fieldBox, fieldStack, placeholder, type FieldChromeProps } from './field'

export interface SearchFieldProps extends Omit<AriaSearchFieldProps, 'className' | 'children'>, FieldChromeProps {
  /** Hint text inside the empty field. Without a `label`, also pass `aria-label`. */
  placeholder?: string
  className?: string
}

/**
 * Search box: a magnifier, the text, and a clear button once there is text. Esc clears it; Enter calls
 * `onSubmit`. Use `value` / `onChange` to filter as the user types.
 */
export function SearchField({ label, description, errorMessage, placeholder: hint, className, ...props }: SearchFieldProps) {
  const strings = useStrings()
  return (
    <AriaSearchField {...props} className={fieldStack(cx('group', className))}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <div className="relative flex items-center">
        <Search aria-hidden className="pointer-events-none absolute left-2.5 size-icon text-subtle" />
        <Input
          placeholder={hint}
          className={cx(fieldBox, placeholder, 'h-control w-full px-8 touch:h-control-touch [&::-webkit-search-cancel-button]:hidden')}
        />
        <Button
          aria-label={strings.clearSearch}
          className="absolute right-1 flex size-control-sm cursor-default items-center justify-center rounded-sm text-muted outline-none group-data-empty:hidden data-hovered:text-fg data-focus-visible:ring-2 data-focus-visible:ring-focus"
        >
          <X aria-hidden className="size-icon" />
        </Button>
      </div>
      <FieldHelp description={description} errorMessage={errorMessage} />
    </AriaSearchField>
  )
}
