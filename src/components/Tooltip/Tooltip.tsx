import type { ReactNode } from 'react'
import {
  OverlayArrow,
  Tooltip as AriaTooltip,
  TooltipTrigger,
  type TooltipTriggerComponentProps,
  type TooltipProps as AriaTooltipProps,
} from 'react-aria-components'
import { cx } from '../../lib/cx'

export interface TooltipProps extends Omit<AriaTooltipProps, 'className' | 'children' | 'triggerRef'>, Pick<TooltipTriggerComponentProps, 'isOpen' | 'defaultOpen' | 'onOpenChange'> {
  /** Tooltip text. */
  content: ReactNode
  /** Keyboard shortcut shown after the label in a muted tone, e.g. `Ctrl+B`. */
  shortcut?: string
  /** Wait before opening on hover, in ms. */
  delay?: number
  /** Wait before closing, in ms. */
  closeDelay?: number
  className?: string
  /** The trigger. Must be a react-aria focusable such as Button or IconButton. */
  children: ReactNode
}

/** Bubble look shared by Tooltip and Toggletip. */
export const bubbleClass =
  'group flex items-center gap-2 rounded-sm bg-tooltip px-2 py-1 text-ui-sm leading-4 text-tooltip-fg outline-none motion-safe:data-entering:animate-pop-in'

/** Arrow that points at the trigger on any side; the parent needs `group` and a data-placement attribute. */
export function TooltipArrow() {
  return (
    <OverlayArrow>
      <svg
        width="8"
        height="8"
        viewBox="0 0 8 8"
        aria-hidden
        className="block fill-tooltip group-data-[placement=bottom]:rotate-180 group-data-[placement=left]:-rotate-90 group-data-[placement=right]:rotate-90"
      >
        <path d="M0 0 L4 4 L8 0" />
      </svg>
    </OverlayArrow>
  )
}

/** Small label that explains an icon button on hover or keyboard focus. */
export function Tooltip({
  content,
  shortcut,
  delay = 500,
  closeDelay = 100,
  placement = 'top',
  offset = 8,
  isOpen,
  defaultOpen,
  onOpenChange,
  className,
  children,
  ...props
}: TooltipProps) {
  return (
    <TooltipTrigger delay={delay} closeDelay={closeDelay} isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {children}
      <AriaTooltip
        {...props}
        placement={placement}
        offset={offset}
        className={cx(bubbleClass, className)}
      >
        <TooltipArrow />
        <span>{content}</span>
        {shortcut && <kbd className="font-sans opacity-80">{shortcut}</kbd>}
      </AriaTooltip>
    </TooltipTrigger>
  )
}
