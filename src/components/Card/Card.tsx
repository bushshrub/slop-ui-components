import type { AriaAttributes, ReactNode } from 'react'
import { Button, Link, type LinkProps } from 'react-aria-components'
import { cx } from '../../lib/cx'

// `id` and the aria attributes (e.g. `aria-labelledby`) reach the element in all three forms.
export interface CardProps extends AriaAttributes {
  id?: string
  /** Makes the card a link. */
  href?: LinkProps['href']
  /** Makes the card a button. Ignored when `href` is set. */
  onPress?: () => void
  className?: string
  children?: ReactNode
}

const base = 'block w-full rounded-lg border border-border bg-surface p-4 text-left text-fg'
const interactive =
  'cursor-default outline-none transition-colors data-hovered:bg-hover data-pressed:bg-selected data-focus-visible:outline-2 data-focus-visible:outline-solid data-focus-visible:outline-offset-2 data-focus-visible:outline-focus'

/** Bordered surface that groups related content. Becomes a link or button when given `href` or `onPress`. */
export function Card({ href, onPress, className, children, ...props }: CardProps) {
  if (href !== undefined) {
    return <Link {...props} href={href} className={cx(base, interactive, className)}>{children}</Link>
  }
  if (onPress) {
    return <Button {...props} onPress={onPress} className={cx(base, interactive, className)}>{children}</Button>
  }
  return <div {...props} className={cx(base, className)}>{children}</div>
}

export interface CardHeaderProps {
  title: ReactNode
  description?: ReactNode
  /** Right-aligned slot, e.g. a menu button or switch. */
  action?: ReactNode
  className?: string
}

/** Title row of a card with optional description and action. */
export function CardHeader({ title, description, action, className }: CardHeaderProps) {
  return (
    <div className={cx('flex items-start gap-3', className)}>
      <div className="min-w-0 flex-1">
        <div className="truncate text-ui font-medium leading-5">{title}</div>
        {description && <div className="mt-0.5 text-ui-sm leading-4 text-muted">{description}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/** Main content area of a card. */
export function CardBody({ className, children }: { className?: string; children?: ReactNode }) {
  return <div className={cx('mt-3 text-ui leading-5 text-muted', className)}>{children}</div>
}

/** Bottom row of a card, for actions or metadata. */
export function CardFooter({ className, children }: { className?: string; children?: ReactNode }) {
  return <div className={cx('mt-4 flex items-center gap-2 text-ui-sm text-muted', className)}>{children}</div>
}
