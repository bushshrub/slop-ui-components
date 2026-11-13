import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

export interface SettingsGroupProps {
  /** Small heading above the rows. */
  title?: ReactNode
  /** Muted line under the heading. */
  description?: ReactNode
  className?: string
  /** `SettingsRow`s, or anything else that should sit between the hairlines. */
  children: ReactNode
}

/** Column of settings split by hairlines, with the same spacing everywhere. */
export function SettingsGroup({ title, description, className, children }: SettingsGroupProps) {
  return (
    <section className={cx('flex flex-col font-sans text-fg', className)}>
      {(title || description) && (
        <div className="flex flex-col gap-0.5 pb-2">
          {title && <h3 className="m-0 text-ui leading-5 font-medium">{title}</h3>}
          {description && <p className="m-0 text-ui-sm leading-4 text-muted">{description}</p>}
        </div>
      )}
      <div className="flex flex-col divide-y divide-divider *:py-3.5 *:first:pt-0 *:last:pb-0">{children}</div>
    </section>
  )
}

export interface SettingsRowProps {
  /** Name of the setting. */
  label: ReactNode
  /** Muted help under the label. */
  description?: ReactNode
  className?: string
  /** The control: a Switch, a quiet Select, a Button. Give it an `aria-label`, since the row's label is not wired to it. */
  children?: ReactNode
}

/** One setting: label and help on the left, control on the right. Wraps the control below on narrow widths. */
export function SettingsRow({ label, description, className, children }: SettingsRowProps) {
  return (
    <div className={cx('flex flex-wrap items-center justify-between gap-x-4 gap-y-2', className)}>
      <div className="flex min-w-0 flex-col">
        <span className="text-ui leading-5">{label}</span>
        {description && <span className="text-ui-sm leading-4 text-muted">{description}</span>}
      </div>
      {children}
    </div>
  )
}
