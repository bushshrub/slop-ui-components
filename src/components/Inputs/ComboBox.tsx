import { useContext, useEffect, useRef, type ReactNode } from 'react'
import {
  ComboBox as AriaComboBox,
  ComboBoxStateContext,
  Group,
  Input,
  ListBox,
  ListBoxItem,
  Popover,
  type ComboBoxProps as AriaComboBoxProps,
  useFilter,
} from 'react-aria-components'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'
import { optionIcon, type SelectOption } from './Select'
import { FieldHelp, FieldLabel, fieldBox, fieldStack, listOption, listPopover, placeholder, type FieldChromeProps } from './field'

export interface ComboBoxProps
  extends Omit<AriaComboBoxProps<SelectOption>, 'className' | 'children' | 'items' | 'defaultItems'>,
    FieldChromeProps {
  /** Suggestions. Filtered as the user types unless `filter` is false. */
  options: SelectOption[]
  /**
   * Set false when you narrow `options` yourself, e.g. from a server as `onInputChange` fires.
   * The list then shows `options` as given.
   */
  filter?: boolean
  /** Hint text inside the empty input. */
  placeholder?: string
  /** Icon inside the left edge, e.g. a search glass. */
  prefix?: ReactNode
  className?: string
}

/**
 * Text input that suggests matches in a list under it as the user types. Arrow keys move through
 * the list, Enter picks, Esc closes it. Use `allowsCustomValue` when free text is also fine (search).
 * Without it, leaving the field with text that is not an option keeps the text and shows an error;
 * text that matches exactly one option picks that option.
 * Stays a dropdown on phones: a sheet would sit under the on-screen keyboard.
 */
export function ComboBox({
  label,
  description,
  errorMessage,
  options,
  filter = true,
  placeholder: hint,
  prefix,
  className,
  menuTrigger = 'input',
  allowsCustomValue,
  name,
  validate,
  ...props
}: ComboBoxProps) {
  // Match anywhere in the label, not only at the start (react-aria's default)
  const { contains } = useFilter({ sensitivity: 'base' })
  const strings = useStrings()
  return (
    <AriaComboBox
      {...props}
      // Always on for react-aria, which otherwise throws away typed text that is not an option when the
      // field loses focus. When the caller wants options only, that text is flagged below instead.
      allowsCustomValue
      name={allowsCustomValue ? name : undefined}
      validate={(value) =>
        !allowsCustomValue && value.inputValue.trim() && value.selectedKey == null ? strings.pickFromList : validate?.(value)
      }
      {...(filter ? { defaultItems: options } : { items: options })}
      defaultFilter={props.defaultFilter ?? contains}
      menuTrigger={menuTrigger}
      allowsEmptyCollection
      isInvalid={props.isInvalid ?? (errorMessage ? true : undefined)}
      className={fieldStack(className)}
    >
      {label && <FieldLabel>{label}</FieldLabel>}
      {/* Group: the popover anchors to and matches the width of the whole box, icon included */}
      <Group className={cx(fieldBox, 'flex h-control items-center gap-2 px-3 touch:h-control-touch', prefix && 'pl-2.5')}>
        {prefix && <span className="pointer-events-none flex shrink-0 text-subtle [&_svg]:size-icon">{prefix}</span>}
        <ComboInput
          options={options}
          // With `filter` off the caller narrows the list, so only an exact label counts as a match
          match={allowsCustomValue ? undefined : filter ? (props.defaultFilter ?? contains) : sameText}
          placeholder={hint}
        />
        {!allowsCustomValue && name && <SelectedKeyInput name={name} />}
      </Group>
      <FieldHelp description={description} errorMessage={errorMessage} />
      <Popover offset={4} className={listPopover}>
        <ListBox<SelectOption>
          className="outline-none"
          renderEmptyState={() => <div className="px-2 py-1.5 text-ui text-muted">{strings.noMatches}</div>}
        >
          {(option) => (
            <ListBoxItem id={option.id} textValue={option.label} isDisabled={option.isDisabled} className={listOption}>
              {option.icon && <span className={optionIcon}>{option.icon}</span>}
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate">
                  <Match text={option.label} />
                </span>
                {option.description && <span className="truncate text-ui-sm leading-4 text-muted">{option.description}</span>}
              </span>
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </AriaComboBox>
  )
}

const sameText = (a: string, b: string) => a.toLocaleLowerCase() === b.toLocaleLowerCase()

/**
 * The text input. On blur, typed text that names exactly one option selects it; `match` decides what
 * counts. No `match` means free text is allowed and nothing is done.
 */
function ComboInput({
  options,
  match,
  placeholder: hint,
}: {
  options: SelectOption[]
  match?: (label: string, typed: string) => boolean
  placeholder?: string
}) {
  const state = useContext(ComboBoxStateContext)
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  })
  // Picking an option clears the "not an option" error right away, not on the next blur
  const selectedKey = state?.selectedKey
  useEffect(() => {
    if (selectedKey != null) stateRef.current?.commitValidation()
  }, [selectedKey])
  return (
    <Input
      placeholder={hint}
      onBlur={() => {
        const typed = state?.inputValue.trim()
        if (!match || !state || !typed) return
        const usable = options.filter((option) => !option.isDisabled)
        const exact = usable.filter((option) => sameText(option.label, typed))
        const found = exact.length ? exact : usable.filter((option) => match(option.label, typed))
        if (found.length !== 1 || found[0].id === state.selectedKey) return
        // After react-aria's own blur handling, which clears the selection for text that is not an option
        setTimeout(() => stateRef.current?.setSelectedKey(found[0].id))
      }}
      className={cx('h-full min-w-0 flex-1 bg-transparent outline-none', placeholder)}
    />
  )
}

/** Posts the selected option's id with a form. react-aria posts the text once custom values are on. */
function SelectedKeyInput({ name }: { name: string }) {
  const key = useContext(ComboBoxStateContext)?.selectedKey
  return <input type="hidden" name={name} value={key ?? ''} />
}

/** Label with the typed text in bold, so it's clear why each suggestion matched. */
function Match({ text }: { text: string }) {
  const query = useContext(ComboBoxStateContext)?.inputValue.trim() ?? ''
  const at = query ? text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) : -1
  if (at < 0) return text
  return (
    <>
      {text.slice(0, at)}
      <strong className="font-semibold">{text.slice(at, at + query.length)}</strong>
      {text.slice(at + query.length)}
    </>
  )
}
