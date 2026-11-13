import { createContext, useContext, useRef, useState, type HTMLAttributes, type PointerEvent, type ReactNode } from 'react'
import {
  Dialog,
  Heading as AriaHeading,
  Modal as AriaModal,
  ModalOverlay,
  OverlayTriggerStateContext,
  Popover,
  type ModalOverlayProps,
} from 'react-aria-components'
import { X } from 'lucide-react'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'
import { PHONE_QUERY, useMediaQuery } from '../../lib/useMediaQuery'
import { IconButton } from '../Button/Button'

/** `auto` opens as a sheet under 768px and in place otherwise; `always` / `never` force it. */
export type SheetMode = 'auto' | 'always' | 'never'

/** Whether an overlay with this mode should render as a bottom sheet right now. */
export function useSheetMode(mode: SheetMode = 'auto') {
  const phone = useMediaQuery(PHONE_QUERY)
  return mode === 'always' || (mode === 'auto' && phone)
}

/** Dragging the header down this far (px) closes the sheet; less snaps it back. */
const DISMISS_DRAG = 80

type DragHandlers = Pick<
  HTMLAttributes<HTMLDivElement>,
  'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'onPointerCancel'
>

const SheetDragContext = createContext<DragHandlers>({})

export interface SheetOverlayProps extends Omit<ModalOverlayProps, 'className' | 'children'> {
  children: ReactNode
}

/**
 * Backdrop and bottom panel for custom content. Takes its open state from a DialogTrigger or from
 * `isOpen` / `onOpenChange`. Put a `SheetHeader` first. For a Menu or Select use `SheetPopover`.
 */
export function SheetOverlay({ children, isDismissable = true, ...props }: SheetOverlayProps) {
  return (
    <ModalOverlay
      {...props}
      isDismissable={isDismissable}
      className="fixed inset-0 z-50 flex flex-col justify-end bg-backdrop pt-12 motion-safe:data-entering:animate-fade-in"
    >
      <AriaModal className="mx-auto flex max-h-[85dvh] w-full max-w-lg min-h-0 flex-col outline-none motion-safe:data-entering:animate-slide-up">
        <SheetPanel>{children}</SheetPanel>
      </AriaModal>
    </ModalOverlay>
  )
}

/**
 * Bottom sheet for collection overlays (Menu, Select). Built on react-aria's Popover rather than
 * ModalOverlay because Select pre-renders its options through the popover to learn what they are,
 * and only Popover passes them through. Its position is overridden to pin it to the bottom.
 */
export function SheetPopover({ children, drillIn }: { children: ReactNode; drillIn?: boolean }) {
  return (
    <Popover
      // `!` beats the inline top/left/max-height that Popover computes for anchored placement.
      // The spread shadow dims the page behind; Popover's own underlay is transparent. A drill-in level
      // (submenu) replaces its parent in place, so it skips the second dim and slides in sideways.
      className={cx(
        '!fixed !inset-x-0 !top-auto !bottom-0 mx-auto flex !max-h-[calc(100dvh-3rem)] w-full max-w-lg flex-col outline-none',
        drillIn
          ? 'motion-safe:data-entering:animate-drill-in'
          : // bg-backdrop: the shadow only dims outside this box, so dim inside it too for when a
            // submenu hides the panel
            'bg-backdrop shadow-[0_0_0_100vmax_var(--ui-backdrop)] motion-safe:data-entering:animate-slide-up',
      )}
    >
      <SheetPanel>{children}</SheetPanel>
    </Popover>
  )
}

function SheetPanel({ children }: { children: ReactNode }) {
  const state = useContext(OverlayTriggerStateContext)
  const [drag, setDrag] = useState<number | null>(null)
  const startY = useRef(0)

  const handlers: DragHandlers = {
    onPointerDown(e: PointerEvent<HTMLDivElement>) {
      if (e.button !== 0 || (e.target as HTMLElement).closest('button')) return
      startY.current = e.clientY
      setDrag(0)
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    onPointerMove(e) {
      if (drag !== null) setDrag(Math.max(0, e.clientY - startY.current))
    },
    onPointerUp(e) {
      if (drag === null) return
      setDrag(null)
      if (e.clientY - startY.current > DISMISS_DRAG) state?.close()
    },
    onPointerCancel() {
      setDrag(null)
    },
  }

  return (
    <div
      data-sheet
      // Hidden while one of its menu items has a submenu open: the submenu takes its place (drill-in)
      className="flex max-h-[85dvh] min-h-0 flex-col has-[[role=menuitem][data-open]]:invisible rounded-t-lg border border-b-0 border-border bg-popover pb-[env(safe-area-inset-bottom)] font-sans text-fg shadow-popover"
      // Follow the finger while dragging, ease back if let go early
      style={{
        transform: drag ? `translateY(${drag}px)` : undefined,
        transition: drag === null ? 'transform 150ms ease-out' : 'none',
      }}
    >
      <SheetDragContext.Provider value={handlers}>{children}</SheetDragContext.Provider>
    </div>
  )
}

export interface SheetHeaderProps {
  /** Title row under the grab handle. Omit for a handle only. */
  children?: ReactNode
  /** Right side of the title row, e.g. a close button. */
  action?: ReactNode
}

/** Grab handle plus optional title. Drag it down to close. */
export function SheetHeader({ children, action }: SheetHeaderProps) {
  const drag = useContext(SheetDragContext)
  return (
    <div {...drag} className="shrink-0 cursor-grab touch-none select-none active:cursor-grabbing">
      <div aria-hidden className="mx-auto mt-2 mb-1 h-1 w-9 rounded-full bg-border-strong" />
      {(children || action) && (
        <div className="flex items-center gap-3 px-4 pt-1 pb-2">
          <div className="min-w-0 flex-1">{children}</div>
          {action}
        </div>
      )}
    </div>
  )
}

export interface SheetProps extends Omit<ModalOverlayProps, 'className' | 'children'> {
  /** Serif title at the top. Also the dialog's accessible name. */
  title: ReactNode
  /** Muted line under the title. */
  description?: ReactNode
  /** Buttons pinned to the bottom, sharing the width. Receives `close`. Cancel first, main action last. */
  footer?: ReactNode | ((close: () => void) => ReactNode)
  className?: string
  children?: ReactNode | ((close: () => void) => ReactNode)
}

/**
 * Panel that slides up from the bottom of the screen, for phone-sized choices and short forms
 * (filters, share options). Use inside `DialogTrigger` like `Modal`. Tap outside, Esc or drag
 * the handle down to close. Menu and Select already turn into sheets on phones on their own.
 */
export function Sheet({ title, description, footer, className, children, ...props }: SheetProps) {
  const strings = useStrings()
  return (
    <SheetOverlay {...props}>
      <Dialog className={cx('flex min-h-0 flex-col outline-none', className)}>
        {({ close }) => (
          <>
            <SheetHeader
              action={
                <IconButton aria-label={strings.close} size="sm" onPress={close} className="-mr-1.5">
                  <X />
                </IconButton>
              }
            >
              <AriaHeading slot="title" className="m-0 truncate font-serif text-lg leading-snug font-normal">
                {title}
              </AriaHeading>
              {description && <p className="mt-0.5 mb-0 text-ui text-muted">{description}</p>}
            </SheetHeader>
            {children && (
              // tabIndex: lets keyboard users scroll long bodies
              <div
                tabIndex={0}
                className="flex min-h-0 flex-col gap-4 overflow-y-auto overscroll-contain px-4 pb-4 text-ui outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset"
              >
                {typeof children === 'function' ? children(close) : children}
              </div>
            )}
            {footer && (
              <footer className="flex gap-2 border-t border-divider px-4 py-3 *:flex-1">
                {typeof footer === 'function' ? footer(close) : footer}
              </footer>
            )}
          </>
        )}
      </Dialog>
    </SheetOverlay>
  )
}
