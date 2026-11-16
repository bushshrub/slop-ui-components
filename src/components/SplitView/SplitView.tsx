import { createContext, useContext, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import { ChevronLeft, X } from 'lucide-react'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'
import { PHONE_QUERY, useMediaQuery } from '../../lib/useMediaQuery'
import { IconButton } from '../Button/Button'
import { ModalBody } from '../Modal/ModalBody'

interface SplitViewState {
  side: 'right' | 'left'
  fullScreen: boolean
  paneStyle: { width: string; minWidth: string; maxWidth: string }
  main: RefObject<HTMLDivElement | null>
}

const SplitViewContext = createContext<SplitViewState | null>(null)

export interface SplitViewProps {
  /** The main content, e.g. a list or a table. It narrows while the pane is open. */
  children: ReactNode
  /** A `<DetailPane>`. */
  pane: ReactNode
  /** Side the pane opens on. Default `right`. */
  side?: 'right' | 'left'
  /** Width of the pane. Default `26rem`. Any CSS length. */
  paneWidth?: string
  /** Narrowest the pane gets. Default `20rem`. */
  minPaneWidth?: string
  /** Widest the pane gets, so the list stays usable. Default `50%`. */
  maxPaneWidth?: string
  /** Show the pane full screen regardless of width, as on phones (mainly for stories and tests). */
  forceFullScreen?: boolean
  className?: string
}

/**
 * List-detail layout: the main content with a `DetailPane` beside it, in the page flow. Nothing is covered and
 * the list stays usable while the pane is open. Under 768px the open pane covers the screen instead.
 *
 * It fills its container's height and both sides scroll on their own, so give it a height or put it in a
 * flex column (AppShell's main is one).
 */
export function SplitView({
  children,
  pane,
  side = 'right',
  paneWidth = '26rem',
  minPaneWidth = '20rem',
  maxPaneWidth = '50%',
  forceFullScreen,
  className,
}: SplitViewProps) {
  const phone = useMediaQuery(PHONE_QUERY)
  const fullScreen = forceFullScreen || phone
  const main = useRef<HTMLDivElement>(null)
  const state: SplitViewState = {
    side,
    fullScreen,
    paneStyle: { width: paneWidth, minWidth: minPaneWidth, maxWidth: maxPaneWidth },
    main,
  }
  return (
    <SplitViewContext.Provider value={state}>
      <div className={cx('flex min-h-0 w-full flex-1', side === 'left' && 'flex-row-reverse', className)}>
        {/* DetailPane makes this inert while it covers the screen */}
        <div ref={main} className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          {children}
        </div>
        {pane}
      </div>
    </SplitViewContext.Provider>
  )
}

export interface DetailPaneProps {
  /** Serif title at the top. Also the pane's accessible name. */
  title: ReactNode
  /** Muted line under the title. */
  description?: ReactNode
  isOpen?: boolean
  defaultOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
  /** Buttons at the bottom right. Receives `close`. Cancel first, main action last. */
  footer?: ReactNode | ((close: () => void) => ReactNode)
  className?: string
  children?: ReactNode | ((close: () => void) => ReactNode)
}

/**
 * The pane of a `SplitView`: details of the selected item next to the list. Same title, description, footer and
 * open state as `Drawer`, but in the page: no backdrop, no focus trap. Change its content while it is open to
 * show another item.
 *
 * Focus moves into the pane when it opens and back to where it was (the row) when it closes. The close button
 * and Esc inside the pane close it; full screen, the close button is a back arrow.
 */
export function DetailPane({
  title,
  description,
  isOpen: isOpenProp,
  defaultOpen = false,
  onOpenChange,
  footer,
  className,
  children,
}: DetailPaneProps) {
  const ctx = useContext(SplitViewContext)
  if (!ctx) throw new Error('DetailPane must be the pane of a <SplitView>')
  const { side, fullScreen, paneStyle, main } = ctx
  const strings = useStrings()
  const titleId = useId()
  const ref = useRef<HTMLElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  // Open from the first render (defaultOpen): don't pull focus away from the page as it loads
  const mounted = useRef(false)

  const [openState, setOpenState] = useState(defaultOpen)
  const isOpen = isOpenProp ?? openState
  const close = () => {
    setOpenState(false)
    onOpenChange?.(false)
  }

  // Move focus into the pane, and remember the last thing focused outside it (the row pressed last) to return to
  useLayoutEffect(() => {
    if (!isOpen) return
    const takeFocus = mounted.current
    // A frame later: a mouse press opens the pane on pointerdown, and the browser then focuses what was pressed
    const frame = requestAnimationFrame(() => {
      const active = document.activeElement
      if (active instanceof HTMLElement && active !== document.body && !ref.current?.contains(active)) returnFocus.current = active
      if (takeFocus) ref.current?.focus({ preventScroll: true })
    })
    const onFocusIn = (e: FocusEvent) => {
      if (e.target instanceof HTMLElement && !ref.current?.contains(e.target)) returnFocus.current = e.target
    }
    document.addEventListener('focusin', onFocusIn)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('focusin', onFocusIn)
      // Runs after the pane is gone. Focus was inside it if it fell to the body; elsewhere means the user moved on
      requestAnimationFrame(() => {
        const target = returnFocus.current
        returnFocus.current = null
        if (target?.isConnected && (document.activeElement === document.body || document.activeElement === null)) {
          target.focus({ preventScroll: true })
        }
      })
    }
  }, [isOpen])

  // A full-screen pane hides the list, so the list must not take focus or be read behind it. Set after the focus
  // effect's frame has noted the focused row (inert blurs it), and lifted during the commit that closes the pane
  useLayoutEffect(() => {
    const el = main.current
    if (!el || !fullScreen || !isOpen) return
    const frame = requestAnimationFrame(() => {
      el.inert = true
    })
    return () => {
      cancelAnimationFrame(frame)
      el.inert = false
    }
  }, [main, fullScreen, isOpen])

  useEffect(() => {
    mounted.current = true
  }, [])

  if (!isOpen) return null

  const onKeyDown = (e: KeyboardEvent) => {
    // Menus, popovers and fields inside stop Esc themselves when they use it
    if (e.key === 'Escape' && !e.nativeEvent.isComposing) {
      e.preventDefault()
      close()
    }
  }

  return (
    <section
      ref={ref}
      tabIndex={-1}
      aria-labelledby={titleId}
      onKeyDown={onKeyDown}
      style={fullScreen ? undefined : paneStyle}
      className={cx(
        'flex flex-col bg-surface text-fg outline-none',
        fullScreen
          ? 'fixed inset-0 z-40 h-dvh pt-[env(safe-area-inset-top)] motion-safe:animate-slide-in-right'
          : cx('min-h-0 flex-none border-divider', side === 'right' ? 'border-l' : 'border-r'),
        className,
      )}
    >
      <header className="flex items-start gap-3 px-5 pt-4 pb-3">
        {fullScreen && (
          <IconButton aria-label={strings.back} size="sm" onPress={close} className="-ml-1.5">
            <ChevronLeft />
          </IconButton>
        )}
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="m-0 font-serif text-lg leading-snug font-normal">
            {title}
          </h2>
          {description && <p className="mt-1 mb-0 text-ui text-muted">{description}</p>}
        </div>
        {!fullScreen && (
          <IconButton aria-label={strings.close} size="sm" onPress={close} className="-mr-1.5">
            <X />
          </IconButton>
        )}
      </header>
      {children && <ModalBody>{typeof children === 'function' ? children(close) : children}</ModalBody>}
      {footer && (
        <footer className="mt-auto flex justify-end gap-2 border-t border-divider px-5 py-3 max-md:pb-[max(0.75rem,env(safe-area-inset-bottom))] max-md:*:flex-1">
          {typeof footer === 'function' ? footer(close) : footer}
        </footer>
      )}
    </section>
  )
}
