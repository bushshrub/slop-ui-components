import type { ReactNode } from 'react'
import {
  Dialog,
  Heading as AriaHeading,
  Modal as AriaModal,
  ModalOverlay,
  type ModalOverlayProps,
} from 'react-aria-components'
import { X } from 'lucide-react'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'
import { IconButton } from '../Button/Button'
import { ModalBody } from '../Modal/ModalBody'

export type DrawerSize = 'sm' | 'md' | 'lg'

const sizes: Record<DrawerSize, string> = {
  sm: 'md:max-w-sm',
  md: 'md:max-w-lg',
  lg: 'md:max-w-2xl',
}

export interface DrawerProps extends Omit<ModalOverlayProps, 'className' | 'children'> {
  /** Serif title at the top. Also the dialog's accessible name. */
  title: ReactNode
  /** Muted line under the title. */
  description?: ReactNode
  /** Edge it slides in from. Default `right`. */
  side?: 'right' | 'left'
  /** Width cap: sm 24rem, md 32rem, lg 42rem. Under 768px it fills the screen. */
  size?: DrawerSize
  /** Buttons at the bottom right. Receives `close`. Cancel first, main action last. */
  footer?: ReactNode | ((close: () => void) => ReactNode)
  className?: string
  children?: ReactNode | ((close: () => void) => ReactNode)
}

/**
 * Full-height panel that slides in from the side over a dimmed backdrop, for detail next to the page
 * (history, an item's details, a diff). Use inside `DialogTrigger` with a Button, or control it with
 * `isOpen` / `onOpenChange`. Body scrolls; header and footer stay put. Click outside or Esc closes it.
 */
export function Drawer({
  title,
  description,
  side = 'right',
  size = 'md',
  footer,
  className,
  children,
  isDismissable = true,
  ...props
}: DrawerProps) {
  const strings = useStrings()
  return (
    <ModalOverlay
      {...props}
      isDismissable={isDismissable}
      className={cx('fixed inset-0 z-50 flex bg-backdrop motion-safe:data-entering:animate-fade-in', side === 'right' ? 'justify-end' : 'justify-start')}
    >
      <AriaModal
        className={cx(
          'h-dvh w-full outline-none',
          side === 'right' ? 'motion-safe:data-entering:animate-slide-in-right' : 'motion-safe:data-entering:animate-slide-in',
          sizes[size],
        )}
      >
        <Dialog
          className={cx(
            'flex h-full flex-col border-border bg-popover text-fg shadow-popover outline-none',
            side === 'right' ? 'md:border-l' : 'md:border-r',
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
                <IconButton aria-label={strings.close} size="sm" onPress={close} className="-mr-1.5">
                  <X />
                </IconButton>
              </header>
              {children && <ModalBody>{typeof children === 'function' ? children(close) : children}</ModalBody>}
              {footer && (
                <footer className="mt-auto flex justify-end gap-2 border-t border-divider px-5 py-3 max-md:pb-[max(0.75rem,env(safe-area-inset-bottom))] max-md:*:flex-1">
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
