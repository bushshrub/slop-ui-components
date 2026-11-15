import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

export interface StickyActionBarProps {
  /** Names the bar for screen readers, e.g. "Order actions". Makes it a landmark region; leave out for a plain bar. */
  'aria-label'?: string
  /** `sticky` (default) pins to the bottom of the nearest scrolling ancestor; `fixed` pins to the screen. */
  position?: 'sticky' | 'fixed'
  className?: string
  /** Buttons. Cancel first, main action last. */
  children: ReactNode
}

/**
 * Bar of actions pinned to the bottom of the screen, for touch layouts where reaching for the top is awkward
 * (a form, a checkout, a bulk selection). Pads for the device's bottom inset (home indicator) and keeps every
 * button, link and input inside at least 44px tall and wide. Under 768px the children share the width.
 * Add bottom padding to the content above it when using `fixed`, so the last rows are not covered.
 */
export function StickyActionBar({ position = 'sticky', className, children, ...props }: StickyActionBarProps) {
  const label = props['aria-label']
  return (
    <div
      role={label ? 'region' : undefined}
      aria-label={label}
      className={cx(
        position === 'fixed' ? 'fixed inset-x-0 bottom-0' : 'sticky bottom-0',
        'z-10 flex items-center justify-end gap-2 border-t border-divider bg-popover px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-ui',
        '[&_:is(button,a,input,select,[role=button])]:min-h-11 [&_:is(button,a,[role=button])]:min-w-11',
        'max-md:*:flex-1',
        className,
      )}
    >
      {children}
    </div>
  )
}
