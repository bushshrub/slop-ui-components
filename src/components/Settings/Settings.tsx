import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

export interface SettingsGroupProps {
  /** Small heading above the rows. */
  title?: ReactNode
  /** Muted line under the heading. */
  description?: ReactNode
  /** Buttons at the right of the heading, e.g. Add or Save. */
  actions?: ReactNode
  className?: string
  /** `SettingsRow`s, or anything else that should sit between the hairlines. */
  children: ReactNode
}

/** Column of settings split by hairlines, with the same spacing everywhere. */
export function SettingsGroup({ title, description, actions, className, children }: SettingsGroupProps) {
  return (
    <section className={cx('flex flex-col font-sans text-fg', className)}>
      {(title || description || actions) && (
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 pb-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            {title && <h3 className="m-0 text-ui leading-5 font-medium">{title}</h3>}
            {description && <p className="m-0 text-ui-sm leading-4 text-muted">{description}</p>}
          </div>
          {actions && <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>}
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
  /** `stacked` puts the control under the label at full width, for text areas and other wide controls. */
  layout?: 'inline' | 'stacked'
  className?: string
  /** The control: a Switch, a quiet Select, a Button. Give it an `aria-label`, since the row's label is not wired to it. */
  children?: ReactNode
}

/** One setting: label and help on the left, control on the right. Wraps the control below on narrow widths. */
export function SettingsRow({ label, description, layout = 'inline', className, children }: SettingsRowProps) {
  return (
    <div className={cx('flex gap-x-4 gap-y-2', layout === 'stacked' ? 'flex-col items-stretch' : 'flex-wrap items-center justify-between', className)}>
      <div className="flex min-w-0 flex-col">
        <span className="text-ui leading-5">{label}</span>
        {description && <span className="text-ui-sm leading-4 text-muted">{description}</span>}
      </div>
      {children}
    </div>
  )
}
