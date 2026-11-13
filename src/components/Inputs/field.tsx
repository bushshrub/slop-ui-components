import type { ReactNode } from 'react'
import { FieldError, Label, Text } from 'react-aria-components'
import { cx } from '../../lib/cx'

/** Shared box look for every text-like control. */
export const fieldBox =
  // Filled, borderless at rest; the focus color draws the edge while typing. Retheme with
  // --ui-field, --ui-field-hover, --ui-field-border and --ui-focus.
  // 16px text on touch stops iOS from zooming into the field on focus
  'rounded-sm border border-field-border bg-field text-ui text-fg outline-none transition-colors touch:text-base ' +
  'data-hovered:bg-field-hover data-focused:border-focus data-focus-within:border-focus ' +
  'data-focus-visible:ring-2 data-focus-visible:ring-focus/30 ' +
  'data-invalid:border-danger data-disabled:cursor-not-allowed data-disabled:opacity-50'

export const placeholder = 'placeholder:text-subtle'

/** Row in a dropdown list (Select, ComboBox). */
export const listOption =
  'group flex min-h-row cursor-default items-center gap-2 rounded-sm px-2 py-1 text-ui leading-5 outline-none in-data-sheet:min-h-control-touch touch:min-h-control-touch ' +
  'data-disabled:opacity-50 data-hovered:bg-hover data-focus-visible:bg-hover data-pressed:bg-hover'

/** Floating panel under a field. Matches the field's width. */
export const listPopover =
  'w-(--trigger-width) min-w-48 overflow-auto rounded-popover border border-border bg-popover p-1.5 text-fg shadow-popover outline-none motion-safe:data-entering:animate-pop-in'

export interface FieldChromeProps {
  /** Visible label above the control. */
  label?: ReactNode
  /** Help text under the control. Hidden while an error shows. */
  description?: ReactNode
  /** Error text. Pass a string to show it, or let react-aria validation fill it. */
  errorMessage?: ReactNode
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <Label className="text-ui leading-5 font-medium text-fg">{children}</Label>
}

/** Label is rendered by the caller; this renders description and error under the control. */
export function FieldHelp({ description, errorMessage }: Omit<FieldChromeProps, 'label'>) {
  return (
    <>
      {description && (
        <Text slot="description" className="text-ui-sm leading-4 text-muted [[data-invalid]_&]:hidden">
          {description}
        </Text>
      )}
      <FieldError className="text-ui-sm leading-4 text-danger">{errorMessage}</FieldError>
    </>
  )
}

export const fieldStack = (className?: string) => cx('flex min-w-0 flex-col gap-1.5', className)
