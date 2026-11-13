import type { ReactNode } from 'react'
import { Switch as AriaSwitch, type SwitchProps as AriaSwitchProps } from 'react-aria-components'
import { cx } from '../../lib/cx'

export interface SwitchProps extends Omit<AriaSwitchProps, 'className' | 'children'> {
  children?: ReactNode
  /** Muted line under the label. */
  description?: ReactNode
  /** `end` puts the toggle at the far right of the row, as in a settings list. */
  toggleSide?: 'start' | 'end'
  className?: string
}

/**
 * On/off toggle for one setting that applies immediately, like a light switch.
 * Use Checkbox instead inside forms with a Save button, or to pick several items from a list.
 */
export function Switch({ children, description, toggleSide = 'start', className, ...props }: SwitchProps) {
  return (
    <AriaSwitch
      {...props}
      className={cx(
        'group flex cursor-default items-center gap-2.5 text-ui leading-5 text-fg outline-none data-disabled:opacity-50 touch:min-h-control-touch',
        toggleSide === 'end' && 'flex-row-reverse justify-between gap-4',
        className,
      )}
    >
      <span
        className={cx(
          // Sized from --ui-switch: track is 1.75x as wide as tall, the knob travels the difference
          'flex h-(--ui-switch) w-[calc(var(--ui-switch)*1.75)] shrink-0 items-center rounded-full bg-border-strong p-0.5 transition-colors',
          'group-data-selected:bg-interactive group-data-focus-visible:ring-2 group-data-focus-visible:ring-focus',
        )}
      >
        <span className="size-[calc(var(--ui-switch)-0.25rem)] rounded-full bg-knob shadow-sm transition-transform group-data-selected:translate-x-[calc(var(--ui-switch)*0.75)]" />
      </span>
      {description ? (
        <span className="flex min-w-0 flex-col">
          {children}
          <span className="text-ui-sm leading-4 text-muted">{description}</span>
        </span>
      ) : (
        children
      )}
    </AriaSwitch>
  )
}
