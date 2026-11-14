import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  Button as AriaButton,
  Link,
  Modal as AriaModal,
  ModalOverlay,
  type ButtonProps as AriaButtonProps,
  type LinkProps,
} from 'react-aria-components'
import { ChevronDown } from 'lucide-react'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'
import { PHONE_QUERY, useMediaQuery } from '../../lib/useMediaQuery'
import { IconButton } from '../Button/Button'

interface ShellState {
  /** Desktop: sidebar shrunk to an icon rail. */
  collapsed: boolean
  /** Narrow screens: sidebar shown as an overlay drawer instead of inline. */
  isDrawer: boolean
  drawerOpen: boolean
  toggle: () => void
  closeDrawer: () => void
}

const ShellContext = createContext<ShellState | null>(null)

/** Sidebar state for custom controls. Must be inside AppShell. */
export function useSidebar() {
  const ctx = useContext(ShellContext)
  if (!ctx) throw new Error('useSidebar must be used inside <AppShell>')
  return ctx
}

export interface AppShellProps {
  /** A `<Sidebar>`. Shown inline on wide screens, as a drawer under 768px. */
  sidebar: ReactNode
  /** Start as an icon rail on wide screens. */
  defaultCollapsed?: boolean
  /** Force drawer mode regardless of width (mainly for stories and tests). */
  forceDrawer?: boolean
  /** Next to the drawer's open button on phones, e.g. the page title. The button itself is always there. */
  mobileHeader?: ReactNode
  className?: string
  children: ReactNode
}

/**
 * Full-height layout with a left sidebar and a scrolling main area.
 * ⌘B / Ctrl+B toggles the sidebar.
 */
export function AppShell({ sidebar, defaultCollapsed = false, forceDrawer, mobileHeader, className, children }: AppShellProps) {
  const narrow = useMediaQuery(PHONE_QUERY)
  const isDrawer = forceDrawer ?? narrow
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const toggle = useCallback(() => {
    if (isDrawer) setDrawerOpen((o) => !o)
    else setCollapsed((c) => !c)
  }, [isDrawer])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle])

  const state = useMemo(
    () => ({ collapsed: !isDrawer && collapsed, isDrawer, drawerOpen, toggle, closeDrawer }),
    [isDrawer, collapsed, drawerOpen, toggle, closeDrawer],
  )

  return (
    <ShellContext.Provider value={state}>
      <div className={cx('flex h-dvh w-full overflow-hidden bg-bg text-fg', className)}>
        {isDrawer ? (
          <ModalOverlay
            isOpen={drawerOpen}
            onOpenChange={setDrawerOpen}
            isDismissable
            className="fixed inset-0 z-50 bg-backdrop motion-safe:data-entering:animate-fade-in"
          >
            <AriaModal className="fixed inset-0 flex outline-none motion-safe:data-entering:animate-slide-in">
              {sidebar}
            </AriaModal>
          </ModalOverlay>
        ) : (
          <div
            className={cx(
              'shrink-0 border-r border-divider motion-safe:transition-[width] motion-safe:duration-200',
              collapsed ? 'w-13' : 'w-(--ui-sidebar-width)',
            )}
          >
            {sidebar}
          </div>
        )}
        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          {/* Phones always get an open button, in the same spot as the drawer's close button */}
          {isDrawer && (
            <div className="flex h-12 shrink-0 items-center gap-1 border-b border-divider px-2">
              <SidebarToggle />
              {mobileHeader && <div className="min-w-0 flex-1 truncate pl-0.5">{mobileHeader}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </ShellContext.Provider>
  )
}

/** Rounded panel with a short inset bar on the left. Lucide's PanelLeft runs the divider edge to edge. */
function SidebarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M7.5 9v6" />
    </svg>
  )
}

/** Button that collapses the sidebar (wide) or opens the drawer (narrow). */
export function SidebarToggle({ className }: { className?: string }) {
  const { collapsed, isDrawer, drawerOpen, toggle } = useSidebar()
  const strings = useStrings()
  const label = isDrawer
    ? drawerOpen
      ? strings.closeSidebar
      : strings.openSidebar
    : collapsed
      ? strings.expandSidebar
      : strings.collapseSidebar
  return (
    <IconButton aria-label={label} onPress={toggle} className={className}>
      <SidebarIcon />
    </IconButton>
  )
}

export interface SidebarProps {
  /** Product name or logo at the top left. Hidden in the collapsed rail. */
  brand?: ReactNode
  /** Small buttons at the top right, e.g. a new-item IconButton. */
  headerActions?: ReactNode
  /** Pinned under the footer line, e.g. a SidebarUser. */
  footer?: ReactNode
  /** Accessible name of the nav landmark. */
  'aria-label'?: string
  children?: ReactNode
}

/** Sidebar column: header, scrolling body, and footer. Put it in AppShell's `sidebar` prop. */
export function Sidebar({ brand, headerActions, footer, children, 'aria-label': ariaLabel }: SidebarProps) {
  const { collapsed } = useSidebar()
  const strings = useStrings()
  return (
    <nav aria-label={ariaLabel ?? strings.sidebar} className="flex h-full w-full flex-col bg-sidebar font-sans text-fg">
      {/* Toggle sits first so it stays put when the sidebar collapses: open and close are the same click. */}
      <div className="flex h-12 shrink-0 items-center gap-1 px-2">
        <SidebarToggle />
        {!collapsed && brand && <div className="min-w-0 flex-1 truncate pl-0.5 font-serif text-lg leading-none">{brand}</div>}
        {!collapsed && headerActions}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 pt-1 pb-4">{children}</div>
      {footer && <div className="shrink-0 border-t border-divider p-2">{footer}</div>}
    </nav>
  )
}

export interface SidebarSectionProps {
  /** Small muted label above the items. Hidden in the collapsed rail. */
  title?: ReactNode
  children: ReactNode
}

/** Group of SidebarItems with an optional label. */
export function SidebarSection({ title, children }: SidebarSectionProps) {
  const { collapsed } = useSidebar()
  return (
    <section className="flex flex-col gap-px">
      {title && !collapsed && <h2 className="m-0 truncate px-2 pb-1 text-ui-sm leading-4 font-normal text-subtle">{title}</h2>}
      {children}
    </section>
  )
}

export interface SidebarItemProps extends Omit<LinkProps, 'className' | 'children'> {
  /** 16px icon. Required for top-level nav so the collapsed rail has something to show. */
  icon?: ReactNode
  /** Current page. Sets aria-current and the selected fill. */
  isActive?: boolean
  /** Shortcut hint shown on hover, e.g. `⌘K`. */
  shortcut?: string
  /** Count at the right, e.g. unread items. Tabular numerals. */
  badge?: ReactNode
  children: ReactNode
}

/** Nav row. Renders a link when `href` is set, otherwise a button (use `onPress`). */
export function SidebarItem({ icon, isActive, shortcut, badge, children, ...props }: SidebarItemProps) {
  const { collapsed, isDrawer, closeDrawer } = useSidebar()
  return (
    <Link
      {...props}
      aria-current={isActive ? 'page' : undefined}
      aria-label={collapsed && typeof children === 'string' ? children : undefined}
      onPress={(e) => {
        props.onPress?.(e)
        if (isDrawer) closeDrawer()
      }}
      className={cx(
        'group flex min-h-row touch:min-h-control-touch cursor-default items-center gap-2.5 rounded-sm px-2 text-ui leading-5 text-fg no-underline outline-none',
        'data-hovered:bg-hover data-pressed:bg-selected data-focus-visible:ring-2 data-focus-visible:ring-focus',
        isActive && 'bg-selected',
        collapsed && 'w-control justify-center px-0',
      )}
    >
      {icon && <span className="flex size-icon shrink-0 items-center text-fg [&_svg]:size-icon">{icon}</span>}
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate">{children}</span>
          {shortcut && (
            <kbd className="font-sans text-ui-sm text-muted opacity-0 group-data-focus-visible:opacity-100 group-data-hovered:opacity-100">
              {shortcut}
            </kbd>
          )}
          {badge != null && <span className="text-ui-sm tabular-nums text-muted">{badge}</span>}
        </>
      )}
    </Link>
  )
}

export interface SidebarUserProps extends Omit<AriaButtonProps, 'className' | 'children'> {
  name: string
  /** Text after the name, e.g. the plan. */
  detail?: ReactNode
  /** Image URL. Falls back to the first letter of `name`. */
  avatarUrl?: string
  /** Show only the avatar. Defaults to the AppShell's collapsed state; set it to use the row outside an AppShell. */
  collapsed?: boolean
}

/** Account row for the sidebar footer. A button, so it can be a MenuTrigger's trigger. */
export function SidebarUser({ name, detail, avatarUrl, collapsed: collapsedProp, ...props }: SidebarUserProps) {
  const shell = useContext(ShellContext)
  const collapsed = collapsedProp ?? shell?.collapsed ?? false
  return (
    <AriaButton
      {...props}
      aria-label={collapsed ? name : props['aria-label']}
      className={cx(
        // Fits its content: the highlight hugs the name instead of spanning the whole footer
        'flex h-control-lg w-fit max-w-full cursor-default items-center gap-2 rounded-md px-2 text-left text-ui text-fg outline-none touch:h-control-touch',
        'data-hovered:bg-hover data-pressed:bg-selected data-focus-visible:ring-2 data-focus-visible:ring-focus',
        collapsed && 'w-control justify-center px-0',
      )}
    >
      <Avatar name={name} src={avatarUrl} />
      {!collapsed && (
        <>
          <span className="min-w-0 truncate font-medium">{name}</span>
          {detail && <span className="shrink-0 text-ui-sm text-muted">· {detail}</span>}
          <ChevronDown aria-hidden className="size-3.5 shrink-0 text-muted" />
        </>
      )}
    </AriaButton>
  )
}

export interface AvatarProps {
  name: string
  src?: string
  className?: string
}

/** Round avatar. Shows the first letter of `name` when there is no image. */
export function Avatar({ name, src, className }: AvatarProps) {
  return src ? (
    <img src={src} alt="" className={cx('size-6 shrink-0 rounded-full object-cover', className)} />
  ) : (
    <span
      aria-hidden
      className={cx('flex size-6 shrink-0 items-center justify-center rounded-full bg-fg text-[0.6875rem] font-medium text-bg', className)}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  )
}
