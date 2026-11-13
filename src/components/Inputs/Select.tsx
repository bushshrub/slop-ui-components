import type { Key } from 'react-aria-components'
import {
  Button,
  ListBox,
  ListBoxItem,
  Popover,
  Select as AriaSelect,
  SelectValue,
  type SelectProps as AriaSelectProps,
} from 'react-aria-components'
import { Check, ChevronDown } from 'lucide-react'
import { cx } from '../../lib/cx'
import { SheetHeader, SheetPopover, useSheetMode, type SheetMode } from '../Sheet/Sheet'
import { FieldHelp, FieldLabel, fieldBox, fieldStack, listOption, listPopover, type FieldChromeProps } from './field'

export interface SelectOption {
  id: Key
  label: string
  /** Muted second line under the label. */
  description?: string
  isDisabled?: boolean
}

export interface SelectProps extends Omit<AriaSelectProps<SelectOption>, 'className' | 'children' | 'items'>, FieldChromeProps {
  /** Choices, in display order. */
  options: SelectOption[]
  /** Open the list as a bottom sheet: `auto` under 768px. The label becomes the sheet title. */
  sheet?: SheetMode
  /**
   * `field` is a filled box for forms. `quiet` is just the value and a chevron, filled only on
   * hover or while open: for settings rows and table cells, where a row of boxes is noise.
   */
  variant?: 'field' | 'quiet'
  className?: string
}

/** Single-choice dropdown built on react-aria Select. Use `value` / `onChange` for control. */
export function Select({ label, description, errorMessage, options, sheet = 'auto', variant = 'field', className, ...props }: SelectProps) {
  const quiet = variant === 'quiet'
  const asSheet = useSheetMode(sheet)
  const list = (
    <ListBox items={options} className={cx('outline-none', asSheet && 'min-h-0 overflow-auto overscroll-contain px-2 pb-2')}>
      {(option) => (
        <ListBoxItem
          id={option.id}
          textValue={option.label}
          isDisabled={option.isDisabled}
          className={cx(listOption, 'data-selected:font-medium')}
        >
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate">{option.label}</span>
            {option.description && <span className="text-ui-sm leading-4 font-normal text-muted">{option.description}</span>}
          </span>
          <Check aria-hidden className="invisible size-icon shrink-0 text-focus group-data-selected:visible" />
        </ListBoxItem>
      )}
    </ListBox>
  )
  return (
    <AriaSelect {...props} isInvalid={props.isInvalid ?? (errorMessage ? true : undefined)} className={fieldStack(
        // -mr-2 on the wrapper (not the button, which would squeeze the value): the text, not the
        // hover fill, lines up with the right edge of the row
        cx(quiet && '-mr-2', className),
      )}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <Button
        className={
          quiet
            ? cx(
                'flex h-control w-fit max-w-full cursor-default items-center gap-1.5 self-end rounded-sm px-2 text-ui text-fg outline-none touch:h-control-touch',
                'data-hovered:bg-button-hover data-pressed:bg-button-hover data-focus-visible:ring-2 data-focus-visible:ring-focus [[data-open]_&]:bg-button-hover',
              )
            : cx(
                fieldBox,
                'flex h-control w-full cursor-default items-center gap-2 px-3 text-left touch:h-control-touch data-pressed:border-focus [[data-open]_&]:border-focus',
              )
        }
      >
        <SelectValue className={cx('truncate data-placeholder:text-subtle', !quiet && 'flex-1')}>
          {/* Only the label in the trigger; the description belongs to the list */}
          {({ selectedText, defaultChildren, isPlaceholder }) => (isPlaceholder ? defaultChildren : selectedText)}
        </SelectValue>
        <ChevronDown aria-hidden className="size-icon shrink-0 text-muted" />
      </Button>
      <FieldHelp description={description} errorMessage={errorMessage} />
      {asSheet ? (
        <SheetPopover>
          <SheetHeader>{label && <div className="truncate text-ui font-medium">{label}</div>}</SheetHeader>
          {list}
        </SheetPopover>
      ) : (
        <Popover offset={4} placement={quiet ? 'bottom end' : 'bottom start'} className={listPopover}>
          {list}
        </Popover>
      )}
    </AriaSelect>
  )
}
