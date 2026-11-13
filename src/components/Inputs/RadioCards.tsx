import type { ReactNode } from 'react'
import { Label, Radio, RadioGroup, type RadioGroupProps } from 'react-aria-components'
import { cx } from '../../lib/cx'
import { FieldHelp, type FieldChromeProps } from './field'

export interface RadioCardOption {
  id: string
  title: ReactNode
  /** One or two lines under the title. */
  description?: ReactNode
  /** Right-aligned detail, e.g. a price or size. Rendered with tabular numerals. */
  meta?: ReactNode
  /** 16px icon before the title. Keep it monochrome. */
  icon?: ReactNode
  isDisabled?: boolean
}

export interface RadioCardsProps extends Omit<RadioGroupProps, 'className' | 'children'>, FieldChromeProps {
  options: RadioCardOption[]
  /** Cards per row on wide screens. Collapses to one column under 640px. */
  columns?: 1 | 2 | 3 | 4
  className?: string
}

const cols = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' }

/**
 * Radio group drawn as selectable cards, for choices that need a description or a price
 * (plans, instance sizes, regions). Arrow keys move between cards; use `value` / `onChange`.
 */
export function RadioCards({ label, description, errorMessage, options, columns = 3, className, ...props }: RadioCardsProps) {
  return (
    <RadioGroup
      {...props}
      isInvalid={props.isInvalid ?? (errorMessage ? true : undefined)}
      className={cx('flex flex-col gap-1.5', className)}
    >
      {label && <Label className="text-ui leading-5 font-medium text-fg">{label}</Label>}
      <div className={cx('grid grid-cols-1 gap-2', cols[columns])}>
        {options.map((o) => (
          <Radio
            key={o.id}
            value={o.id}
            isDisabled={o.isDisabled}
            className={cx(
              'group relative flex cursor-default flex-col gap-1 rounded-md border border-border bg-surface p-3 text-ui text-fg outline-none transition-colors',
              'data-hovered:border-border-strong data-focus-visible:ring-2 data-focus-visible:ring-focus',
              'data-selected:border-interactive data-selected:ring-1 data-selected:ring-interactive data-selected:data-focus-visible:ring-2 data-selected:data-focus-visible:ring-focus',
              'data-disabled:cursor-not-allowed data-disabled:opacity-50',
            )}
          >
            <span className="flex items-center gap-2">
              {o.icon && <span className="flex shrink-0 text-muted [&_svg]:size-icon">{o.icon}</span>}
              <span className="min-w-0 flex-1 truncate font-medium">{o.title}</span>
              {o.meta && <span className="shrink-0 text-ui-sm tabular-nums text-muted">{o.meta}</span>}
              <span
                aria-hidden
                className="flex size-check shrink-0 items-center justify-center rounded-full border border-border-strong group-data-selected:border-interactive"
              >
                <span className="size-[calc(var(--ui-check)*0.45)] rounded-full bg-interactive opacity-0 group-data-selected:opacity-100" />
              </span>
            </span>
            {o.description && <span className="text-ui-sm leading-4 text-muted">{o.description}</span>}
          </Radio>
        ))}
      </div>
      <FieldHelp description={description} errorMessage={errorMessage} />
    </RadioGroup>
  )
}
