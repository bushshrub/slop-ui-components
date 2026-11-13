import {
  UNSTABLE_Toast as AriaToast,
  UNSTABLE_ToastContent as AriaToastContent,
  UNSTABLE_ToastQueue as AriaToastQueue,
  UNSTABLE_ToastRegion as AriaToastRegion,
  Text,
} from 'react-aria-components'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'
import { Button, IconButton } from '../Button/Button'

export type ToastTone = 'neutral' | 'success' | 'danger'

/** What a toast carries. Build one with `toast()` rather than by hand. */
export interface ToastContent {
  title: string
  description?: string
  tone: ToastTone
  action?: { label: string; onPress: () => void }
}

export interface ToastOptions {
  description?: string
  /** `success` and `danger` get a matching icon. */
  tone?: ToastTone
  /** A button in the toast. Pressing it runs `onPress` and closes the toast. */
  action?: { label: string; onPress: () => void }
  /**
   * Milliseconds before it closes itself. Default 5000. `null` keeps it until the user closes it or
   * `toastQueue.close(key)` runs. Danger toasts with an action stay until dismissed.
   */
  timeout?: number | null
}

/** The global queue behind `toast()` and `<Toaster />`. */
export const toastQueue = new AriaToastQueue<ToastContent>({ maxVisibleToasts: 4 })

/** Shows a toast. Returns its key, which `toastQueue.close(key)` accepts. */
export function toast(title: string, { description, tone = 'neutral', action, timeout = 5000 }: ToastOptions = {}) {
  const sticky = timeout === null || (tone === 'danger' && action)
  return toastQueue.add({ title, description, tone, action }, sticky ? {} : { timeout })
}

const toneIcon = {
  success: <CheckCircle2 className="text-success" />,
  danger: <AlertCircle className="text-danger" />,
  neutral: null,
}

/**
 * Mount once near the root of the app. Toasts stack at the bottom right on desktop and span the bottom on phones.
 */
export function Toaster({ className }: { className?: string }) {
  const strings = useStrings()
  return (
    <AriaToastRegion
      queue={toastQueue}
      aria-label={strings.notifications}
      className={cx(
        'fixed inset-x-3 bottom-3 z-50 flex flex-col items-center gap-2 outline-none md:inset-x-auto md:right-4 md:bottom-4 md:items-end',
        className,
      )}
    >
      {({ toast: t }) => (
        <AriaToast
          toast={t}
          className={cx(
            // Centered so one-line toasts line up with their buttons; the icon pins to the first line when there's a description
            'flex w-full items-center gap-3 rounded-md border border-border bg-popover py-2 pr-2 pl-3.5 text-fg shadow-popover outline-none md:w-96',
            'motion-safe:animate-slide-up data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-focus',
          )}
        >
          {toneIcon[t.content.tone] && (
            <span className={cx('flex shrink-0 [&_svg]:size-icon', t.content.description && 'self-start pt-2')}>{toneIcon[t.content.tone]}</span>
          )}
          <AriaToastContent className="flex min-w-0 flex-1 flex-col gap-0.5 py-1.5">
            <Text slot="title" className="text-ui leading-5 font-medium">
              {t.content.title}
            </Text>
            {t.content.description && (
              <Text slot="description" className="text-ui-sm leading-4 text-muted">
                {t.content.description}
              </Text>
            )}
          </AriaToastContent>
          {t.content.action && (
            <Button
              size="sm"
              onPress={() => {
                t.content.action?.onPress()
                toastQueue.close(t.key)
              }}
            >
              {t.content.action.label}
            </Button>
          )}
          <IconButton slot="close" size="sm" aria-label={strings.close} className={cx(t.content.description && 'self-start')}>
            <X />
          </IconButton>
        </AriaToast>
      )}
    </AriaToastRegion>
  )
}
