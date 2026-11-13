import type { HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'

export interface KbdProps extends Omit<HTMLAttributes<HTMLElement>, 'className'> {
  /** One key cap per entry, e.g. `['⌘', 'K']`. Use instead of children for a combo. */
  keys?: string[]
  className?: string
}

const cap = 'inline-flex min-w-5 items-center justify-center rounded-sm bg-button px-1 font-sans text-ui-sm leading-4 text-fg'

/** Keyboard key hint. Pass a single key or combo as children, or `keys` for one cap per key. */
export function Kbd({ keys, className, children, ...props }: KbdProps) {
  if (keys) {
    return (
      <span {...props} className={cx('inline-flex items-center gap-0.5', className)}>
        {keys.map((k, i) => (
          <kbd key={i} className={cap}>{k}</kbd>
        ))}
      </span>
    )
  }
  return (
    <kbd {...props} className={cx(cap, className)}>
      {children}
    </kbd>
  )
}
