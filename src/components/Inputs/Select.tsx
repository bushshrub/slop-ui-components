import type { ReactNode } from 'react'
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

export interface SelectOption<K extends Key = Key> {
  id: K
  label: string
  /** Muted second line under the label. */
  description?: string
  /** Shown before the label: an icon (any 16px SVG, e.g. lucide), logo or flag. */
  icon?: ReactNode
  isDisabled?: boolean
}

/** Box around an option's icon, shared with ComboBox. */
export const optionIcon = 'flex shrink-0 items-center text-muted [&_svg]:size-icon'

export interface SelectProps<K extends Key = Key>
  extends Omit<AriaSelectProps<SelectOption<K>>, 'className' | 'children' | 'items' | 'value' | 'defaultValue' | 'onChange'>,
    FieldChromeProps {
  /** Choices, in display order. Their `id` type is the type of `value` and of what `onChange` receives. */
  options: readonly SelectOption<K>[]
  /** Selected option id (controlled). */
  value?: K | null
  /** Initially selected option id (uncontrolled). */
  defaultValue?: K | null
  onChange?: (value: K) => void
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
export function Select<K extends Key = Key>({
  label,
  description,
  errorMessage,
  options,
  sheet = 'auto',
  variant = 'field',
  className,
  onChange,
  ...props
}: SelectProps<K>) {
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
          {option.icon && <span className={optionIcon}>{option.icon}</span>}
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
    <AriaSelect
      {...props}
      // The ids come from `options`, so a chosen key is always a K
      onChange={(value) => value != null && onChange?.(value as K)}
      isInvalid={props.isInvalid ?? (errorMessage ? true : undefined)} className={fieldStack(
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
        <SelectValue<SelectOption<K>> className={cx('flex min-w-0 items-center gap-2 data-placeholder:text-subtle', !quiet && 'flex-1')}>
          {/* Only the icon and label in the trigger; the description belongs to the list */}
          {({ selectedText, selectedItems, defaultChildren, isPlaceholder }) => (
            <>
              {!isPlaceholder && selectedItems[0]?.icon && <span className={optionIcon}>{selectedItems[0].icon}</span>}
              <span className="truncate">{isPlaceholder ? defaultChildren : selectedText}</span>
            </>
          )}
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
