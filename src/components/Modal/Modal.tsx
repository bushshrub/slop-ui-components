import { useState, type ReactNode } from 'react'
import {
  Dialog,
  DialogTrigger,
  Heading as AriaHeading,
  Modal as AriaModal,
  ModalOverlay,
  type ModalOverlayProps,
} from 'react-aria-components'
import { X } from 'lucide-react'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'
import { Button, IconButton } from '../Button/Button'
import { ModalBody } from './ModalBody'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

const sizes: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-5xl',
}

export interface ModalProps extends Omit<ModalOverlayProps, 'className' | 'children'> {
  /** Serif title at the top. Also the dialog's accessible name. */
  title: ReactNode
  /** Muted line under the title. */
  description?: ReactNode
  /** Width cap: sm 24rem, md 32rem, lg 42rem, xl 64rem. */
  size?: ModalSize
  /** Buttons at the bottom right. Receives `close`. Cancel first, main action last. */
  footer?: ReactNode | ((close: () => void) => ReactNode)
  /** `alertdialog` for destructive confirmations: no close button, no outside-click dismiss. */
  role?: 'dialog' | 'alertdialog'
  /** Body without padding or its own scroll, for content that lays itself out, e.g. side Tabs. */
  flush?: boolean
  className?: string
  children?: ReactNode | ((close: () => void) => ReactNode)
}

/**
 * Centered dialog over a dimmed backdrop. Use inside `DialogTrigger` with a Button, or control it
 * with `isOpen` / `onOpenChange`. Body scrolls; header and footer stay put. Fills the screen under
 * 768px, except `alertdialog`, which stays a card. The body is padded and spaces its children, so
 * content inside (a form, say) should not add its own outer padding.
 */
export function Modal({
  title,
  description,
  size = 'md',
  footer,
  role = 'dialog',
  flush,
  className,
  children,
  isDismissable,
  ...props
}: ModalProps) {
  const dismissable = isDismissable ?? role === 'dialog'
  // Under 768px a dialog takes the whole screen; a confirmation (alertdialog) stays a compact card
  const fullOnPhone = role === 'dialog'
  const strings = useStrings()
  return (
    <ModalOverlay
      {...props}
      isDismissable={dismissable}
      className={cx(
        'fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-backdrop p-4 pt-[10vh] motion-safe:data-entering:animate-fade-in',
        fullOnPhone && 'max-md:p-0',
      )}
    >
      <AriaModal
        className={cx(
          'w-full outline-none motion-safe:data-entering:animate-pop-in',
          sizes[size],
          fullOnPhone && 'max-md:h-dvh max-md:max-w-none',
        )}
      >
        <Dialog
          role={role}
          className={cx(
            'flex max-h-[80dvh] flex-col rounded-lg border border-border bg-popover text-fg shadow-popover outline-none',
            fullOnPhone && 'max-md:h-full max-md:max-h-none max-md:rounded-none max-md:border-0',
            className,
          )}
        >
          {({ close }) => (
            <>
              <header className="flex items-start gap-3 px-5 pt-4 pb-3">
                <div className="min-w-0 flex-1">
                  <AriaHeading slot="title" className="m-0 font-serif text-lg leading-snug font-normal">
                    {title}
                  </AriaHeading>
                  {description && <p className="mt-1 mb-0 text-ui text-muted">{description}</p>}
                </div>
                {role === 'dialog' && (
                  <IconButton aria-label={strings.close} size="sm" onPress={close} className="-mr-1.5">
                    <X />
                  </IconButton>
                )}
              </header>
              {children &&
                (flush ? (
                  <div className="flex min-h-0 flex-1 flex-col text-ui">{typeof children === 'function' ? children(close) : children}</div>
                ) : (
                  <ModalBody>{typeof children === 'function' ? children(close) : children}</ModalBody>
                ))}
              {footer && (
                <footer className="flex justify-end gap-2 border-t border-divider px-5 py-3 max-md:pb-[max(0.75rem,env(safe-area-inset-bottom))] max-md:*:flex-1">
                  {typeof footer === 'function' ? footer(close) : footer}
                </footer>
              )}
            </>
          )}
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  )
}

export { DialogTrigger }

export interface ConfirmModalProps extends Omit<ModalProps, 'footer' | 'role' | 'children'> {
  /** Label of the confirming button, e.g. "Delete chat". Say what happens. */
  confirmLabel: string
  /**
   * Called when the user confirms. If it returns a promise, both buttons are held until it settles and the
   * modal closes after it resolves. If it rejects, the modal stays open so the user can retry or cancel;
   * report the error yourself (catch it inside `onConfirm`, e.g. to show a toast).
   */
  onConfirm: () => void | Promise<void>
  /** Uses the danger button and alertdialog role. */
  destructive?: boolean
  /** Only the confirming button, for a message that just needs acknowledging. */
  hideCancel?: boolean
  children?: ReactNode
}

/** Two-button confirmation. Closes after `onConfirm` resolves. */
export function ConfirmModal({ confirmLabel, onConfirm, destructive, hideCancel, children, size = 'sm', ...props }: ConfirmModalProps) {
  const strings = useStrings()
  const [pending, setPending] = useState(false)
  return (
    <Modal
      {...props}
      size={size}
      role={destructive ? 'alertdialog' : 'dialog'}
      footer={(close) => (
        <>
          {!hideCancel && (
            <Button onPress={close} isDisabled={pending}>
              {strings.cancel}
            </Button>
          )}
          <Button
            variant={destructive ? 'danger' : 'primary'}
            // Not disabled while pending: a disabled button would drop keyboard focus out of the dialog
            className={pending ? 'cursor-progress opacity-60' : undefined}
            onPress={async () => {
              if (pending) return
              setPending(true)
              try {
                await onConfirm()
                close()
              } finally {
                setPending(false)
              }
            }}
          >
            {confirmLabel}
          </Button>
        </>
      )}
    >
      {children}
    </Modal>
  )
}
