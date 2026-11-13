import type { ReactNode } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'
import { IconButton } from '../Button/Button'

export type AlertTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral'

const tones: Record<AlertTone, { box: string; icon: string; Icon: typeof Info }> = {
  info: { box: 'bg-info-soft', icon: 'text-info', Icon: Info },
  success: { box: 'bg-success-soft', icon: 'text-success', Icon: CheckCircle2 },
  warning: { box: 'bg-warning-soft', icon: 'text-warning', Icon: AlertTriangle },
  danger: { box: 'bg-danger-soft', icon: 'text-danger', Icon: AlertCircle },
  neutral: { box: 'bg-hover', icon: 'text-muted', Icon: Info },
}

export interface AlertProps {
  /** Default `info`. */
  tone?: AlertTone
  title?: string
  /** The message. */
  children?: ReactNode
  /** Replaces the tone icon. `false` hides it. */
  icon?: ReactNode | false
  /** Shown at the right, usually a small Button. */
  action?: ReactNode
  /** Shows a close button that calls this. */
  onDismiss?: () => void
  className?: string
}

/** Inline banner for a message that stays in the page. Danger and warning are announced right away; the rest politely. */
export function Alert({ tone = 'info', title, children, icon, action, onDismiss, className }: AlertProps) {
  const strings = useStrings()
  const t = tones[tone]
  const urgent = tone === 'danger' || tone === 'warning'
  return (
    <div
      role={urgent ? 'alert' : 'status'}
      className={cx('flex items-start gap-3 rounded-md p-3 text-ui leading-5 text-fg', t.box, className)}
    >
      {icon !== false && (
        <span className={cx('mt-0.5 flex shrink-0 [&_svg]:size-icon', t.icon)}>{icon ?? <t.Icon />}</span>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title && <div className="font-medium">{title}</div>}
        {children && <div className={title ? 'text-ui-sm leading-4 text-fg/80' : undefined}>{children}</div>}
      </div>
      {action && <div className="flex shrink-0 items-center">{action}</div>}
      {onDismiss && (
        <IconButton size="sm" aria-label={strings.dismiss} onPress={onDismiss} className="-my-1 -mr-1">
          <X />
        </IconButton>
      )}
    </div>
  )
}
