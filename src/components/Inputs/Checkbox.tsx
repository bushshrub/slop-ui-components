import type { ReactNode } from 'react'
import {
  Checkbox as AriaCheckbox,
  type CheckboxProps as AriaCheckboxProps,
} from 'react-aria-components'
import { Check, Minus } from 'lucide-react'
import { cx } from '../../lib/cx'

export interface CheckboxProps extends Omit<AriaCheckboxProps, 'className' | 'children'> {
  /** Label next to the box. */
  children?: ReactNode
  /** Muted line under the label. */
  description?: ReactNode
  className?: string
}

/**
 * Checkbox with label and optional description. Supports `isIndeterminate`.
 * Use for picking several items from a list, or for a choice inside a form that has a Save button.
 * A single on/off setting that applies right away (settings rows) wants `Switch` instead.
 */
export function Checkbox({ children, description, className, ...props }: CheckboxProps) {
  return (
    <AriaCheckbox
      {...props}
      className={cx(
        'group flex cursor-default items-start gap-2.5 text-ui leading-5 text-fg outline-none data-disabled:opacity-50 touch:py-3',
        className,
      )}
    >
      {({ isSelected, isIndeterminate }) => (
        <>
          <span
            className={cx(
              // Centered on the first 20px line of the label
              'mt-[calc((1.25rem-var(--ui-check))/2)] flex size-check shrink-0 items-center justify-center rounded-[4px] border text-interactive-fg transition-colors',
              'group-data-focus-visible:ring-2 group-data-focus-visible:ring-focus group-data-focus-visible:ring-offset-1 group-data-focus-visible:ring-offset-bg',
              isSelected || isIndeterminate
                ? 'border-interactive bg-interactive'
                : 'border-border-strong bg-surface group-data-hovered:border-subtle group-data-invalid:border-danger',
            )}
          >
            {isIndeterminate ? <Minus className="size-[calc(var(--ui-check)*0.75)]" strokeWidth={3} /> : isSelected ? <Check className="size-[calc(var(--ui-check)*0.75)]" strokeWidth={3} /> : null}
          </span>
          {(children || description) && (
            <span className="flex flex-col">
              {children}
              {description && <span className="text-ui-sm leading-4 text-muted">{description}</span>}
            </span>
          )}
        </>
      )}
    </AriaCheckbox>
  )
}
