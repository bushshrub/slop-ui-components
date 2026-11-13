import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

export type HeadingVariant = 'page' | 'dialog' | 'section' | 'label'

const variants: Record<HeadingVariant, string> = {
  page: 'font-serif text-[1.75rem] leading-tight font-normal tracking-tight',
  dialog: 'font-serif text-lg leading-snug font-normal',
  section: 'font-sans text-[0.9375rem] leading-6 font-semibold tracking-[-0.01em]',
  label: 'font-sans text-ui-sm leading-4 font-medium text-subtle uppercase tracking-[0.06em]',
}

const defaultTag: Record<HeadingVariant, 'h1' | 'h2' | 'h3'> = {
  page: 'h1',
  dialog: 'h2',
  section: 'h2',
  label: 'h3',
}

export interface HeadingProps {
  /**
   * Visual style. `page` and `dialog` are serif titles; `section` is a sans heading;
   * `label` is a small uppercase group label.
   */
  variant?: HeadingVariant
  /** HTML tag. Defaults to a sensible level for the variant; set it to keep the outline correct. */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  /** Muted text after the title, e.g. a count. Rendered with tabular numerals. */
  count?: ReactNode
  className?: string
  children: ReactNode
}

/** Title text in one of four fixed styles. */
export function Heading({ variant = 'section', as, count, className, children }: HeadingProps) {
  const Tag = as ?? defaultTag[variant]
  return (
    <Tag className={cx('m-0 text-fg', variants[variant], className)}>
      {children}
      {count != null && <span className="ml-2 font-sans text-base font-normal tabular-nums text-muted">{count}</span>}
    </Tag>
  )
}

export interface PageHeaderProps {
  title: ReactNode
  /** One line under the title. */
  description?: ReactNode
  /** Shown after the title, e.g. the number of items. */
  count?: ReactNode
  /** Buttons aligned to the right of the title. */
  actions?: ReactNode
  className?: string
}

/** Page title with optional description and right-aligned actions. */
export function PageHeader({ title, description, count, actions, className }: PageHeaderProps) {
  return (
    <header className={cx('flex flex-wrap items-end justify-between gap-x-6 gap-y-3', className)}>
      <div className="min-w-0">
        <Heading variant="page" count={count}>
          {title}
        </Heading>
        {description && <p className="mt-1.5 mb-0 text-ui text-muted">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
