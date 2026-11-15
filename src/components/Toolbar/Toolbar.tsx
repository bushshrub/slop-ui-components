import {
  Group as AriaGroup,
  Separator as AriaSeparator,
  Toolbar as AriaToolbar,
  type GroupProps,
  type SeparatorProps,
  type ToolbarProps as AriaToolbarProps,
} from 'react-aria-components'
import { cx } from '../../lib/cx'

export interface ToolbarProps extends Omit<AriaToolbarProps, 'className'> {
  className?: string
}

/**
 * Row (or column, with `orientation="vertical"`) of controls that is one Tab stop: Left and Right arrows (Up and Down
 * when vertical) move between the controls, Tab leaves. Put Buttons, IconButtons, toggles and menu triggers inside,
 * grouped with `ToolbarGroup` and divided with `ToolbarSeparator`. Needs an `aria-label` naming it, e.g. "Text formatting".
 */
export function Toolbar({ className, ...props }: ToolbarProps) {
  return (
    <AriaToolbar
      {...props}
      className={cx('flex items-center gap-1 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch', className)}
    />
  )
}

export interface ToolbarGroupProps extends Omit<GroupProps, 'className'> {
  className?: string
}

/** Controls that belong together. Pass `aria-label` to name the group for screen readers. */
export function ToolbarGroup({ className, ...props }: ToolbarGroupProps) {
  return <AriaGroup {...props} className={cx('flex items-center gap-1 [[data-orientation=vertical]>&]:flex-col', className)} />
}

export interface ToolbarSeparatorProps extends Omit<SeparatorProps, 'className'> {
  className?: string
}

/** Divider between groups. Turns itself to run across the toolbar's direction. */
export function ToolbarSeparator({ className, ...props }: ToolbarSeparatorProps) {
  return (
    <AriaSeparator
      {...props}
      className={cx('shrink-0 self-stretch bg-divider data-[orientation=vertical]:mx-1 data-[orientation=vertical]:w-px data-[orientation=horizontal]:my-1 data-[orientation=horizontal]:h-px', className)}
    />
  )
}
