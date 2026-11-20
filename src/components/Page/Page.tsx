import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

const widths = {
  narrow: 'max-w-2xl',
  default: 'max-w-5xl',
  wide: 'max-w-7xl',
  full: 'max-w-none',
}

export interface PageProps {
  /** Usually a `PageHeader`. */
  header?: ReactNode
  /** Width cap: narrow 42rem for forms and settings, default 64rem, wide 80rem for tables, or full. */
  width?: keyof typeof widths
  /** A column beside the content on wide screens, e.g. a `SectionRail`. It moves above the content under 1024px. */
  aside?: ReactNode
  className?: string
  children?: ReactNode
}

/**
 * The content area of one page: the same side padding, top spacing and width cap on every page, with the header
 * above the content. Put it inside `AppShell` (or any scrolling main area).
 */
export function Page({ header, width = 'default', aside, className, children }: PageProps) {
  return (
    <div className={cx('mx-auto flex w-full flex-col gap-6 px-4 py-6 md:px-8 md:py-8', widths[width], className)}>
      {header}
      {aside ? (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
          <div className="lg:sticky lg:top-6 lg:w-48 lg:shrink-0">{aside}</div>
          <div className="flex min-w-0 flex-1 flex-col gap-6">{children}</div>
        </div>
      ) : (
        children
      )}
    </div>
  )
}
