import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'title'> {
  /** Icon shown in a soft round badge (any SVG, e.g. lucide). */
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  /** Buttons or links under the text. */
  actions?: ReactNode
  /** `default` fills a page; `compact` fits inside a table or menu. */
  size?: 'default' | 'compact'
  className?: string
}

/** Centered placeholder for a view with nothing to show, with an optional next step. */
export function EmptyState({ icon, title, description, actions, size = 'default', className, ...props }: EmptyStateProps) {
  const compact = size === 'compact'
  return (
    <div
      {...props}
      className={cx('flex flex-col items-center text-center font-sans', compact ? 'gap-3 px-4 py-8' : 'gap-4 px-6 py-16', className)}
    >
      {icon && (
        <div
          aria-hidden
          className={cx(
            'flex items-center justify-center rounded-full bg-button text-muted [&_svg]:size-icon [&_svg]:shrink-0',
            compact ? 'size-control' : 'size-control-lg',
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex max-w-sm flex-col gap-1">
        <h3 className={cx('m-0 font-medium text-fg', compact ? 'text-ui' : 'text-[length:calc(var(--ui-text)+0.125rem)] leading-6')}>
          {title}
        </h3>
        {description && <p className="m-0 text-ui text-muted">{description}</p>}
      </div>
      {actions && <div className="mt-1 flex flex-wrap justify-center gap-2">{actions}</div>}
    </div>
  )
}
