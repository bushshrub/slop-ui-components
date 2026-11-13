import { Children, cloneElement, isValidElement, useEffect, useRef, type ReactElement, type ReactNode } from 'react'
import {
  Tab as AriaTab,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  Tabs as AriaTabs,
  type TabListProps as AriaTabListProps,
  type TabPanelProps as AriaTabPanelProps,
  type TabProps as AriaTabProps,
  type TabsProps as AriaTabsProps,
} from 'react-aria-components'
import { cx } from '../../lib/cx'
import { PHONE_QUERY, useMediaQuery } from '../../lib/useMediaQuery'

export interface TabsProps extends Omit<AriaTabsProps, 'className' | 'orientation'> {
  /**
   * `vertical` puts the tabs in a column at the left, for settings-style pages with many sections.
   * Under 768px it falls back to a horizontal strip that scrolls sideways.
   */
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

/** Switches between panels. Arrow keys move between tabs; the panel follows. */
export function Tabs({ orientation = 'horizontal', className, onSelectionChange, ...props }: TabsProps) {
  const phone = useMediaQuery(PHONE_QUERY)
  const ref = useRef<HTMLDivElement>(null)
  // Keep the selected tab in view when the strip is wider than the screen
  const revealSelected = () =>
    requestAnimationFrame(() =>
      ref.current?.querySelector('[role=tab][aria-selected=true]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' }),
    )
  useEffect(() => {
    revealSelected()
  }, [phone])
  return (
    <AriaTabs
      {...props}
      ref={ref}
      onSelectionChange={(key) => {
        onSelectionChange?.(key)
        revealSelected()
      }}
      orientation={phone ? 'horizontal' : orientation}
      className={cx('flex min-h-0 min-w-0 flex-col data-[orientation=vertical]:flex-row', className)}
    />
  )
}

export interface TabListProps<T> extends Omit<AriaTabListProps<T>, 'className'> {
  className?: string
}

/** Row (or column) of Tab buttons. Give it an `aria-label`. */
export function TabList<T extends object>({ className, ...props }: TabListProps<T>) {
  return (
    <AriaTabList
      {...props}
      className={cx(
        'flex shrink-0 outline-none',
        'data-[orientation=horizontal]:gap-1 data-[orientation=horizontal]:overflow-x-auto data-[orientation=horizontal]:border-b data-[orientation=horizontal]:border-divider data-[orientation=horizontal]:px-3 data-[orientation=horizontal]:[scrollbar-width:none]',
        'data-[orientation=vertical]:w-56 data-[orientation=vertical]:flex-col data-[orientation=vertical]:gap-0.5 data-[orientation=vertical]:p-3',
        className,
      )}
    />
  )
}

export interface TabProps extends Omit<AriaTabProps, 'className' | 'children'> {
  /** 16px icon before the label. */
  icon?: ReactNode
  className?: string
  children: ReactNode
  /** Set by TabSection on its first tab. */
  sectionStart?: boolean
  sectionTitle?: string
}

// A tablist may only contain tabs, so a section's divider and title are drawn by its first tab: ::before is
// the line, ::after the title (with empty alt text, so it stays out of the tab's name). Vertical lists only.
const sectionLine =
  'in-data-[orientation=vertical]:not-first:mt-4 in-data-[orientation=vertical]:not-first:before:absolute in-data-[orientation=vertical]:not-first:before:inset-x-0 in-data-[orientation=vertical]:not-first:before:-top-2 in-data-[orientation=vertical]:not-first:before:border-t in-data-[orientation=vertical]:not-first:before:border-divider'
const sectionTitled =
  'in-data-[orientation=vertical]:mt-6 in-data-[orientation=vertical]:not-first:mt-11 in-data-[orientation=vertical]:not-first:before:-top-9 ' +
  "in-data-[orientation=vertical]:after:absolute in-data-[orientation=vertical]:after:inset-x-2 in-data-[orientation=vertical]:after:bottom-full in-data-[orientation=vertical]:after:truncate in-data-[orientation=vertical]:after:pb-1 in-data-[orientation=vertical]:after:text-ui-sm in-data-[orientation=vertical]:after:leading-4 in-data-[orientation=vertical]:after:text-subtle in-data-[orientation=vertical]:after:content-[attr(data-section-title)_/_'']"

/** One tab. Its `id` matches the `id` of its TabPanel. */
export function Tab({ icon, className, children, sectionStart, sectionTitle, ...props }: TabProps) {
  return (
    <AriaTab
      {...props}
      data-section-title={sectionTitle}
      className={cx(
        'relative flex shrink-0 cursor-default items-center gap-2.5 text-ui leading-5 whitespace-nowrap outline-none',
        'data-disabled:opacity-50 data-focus-visible:ring-2 data-focus-visible:ring-focus data-focus-visible:ring-inset',
        // Horizontal: muted text, underline under the selected one
        'in-data-[orientation=horizontal]:h-control-lg in-data-[orientation=horizontal]:px-2 in-data-[orientation=horizontal]:text-muted in-data-[orientation=horizontal]:touch:h-control-touch',
        'in-data-[orientation=horizontal]:data-hovered:text-fg in-data-[orientation=horizontal]:data-selected:text-fg',
        'in-data-[orientation=horizontal]:data-selected:after:absolute in-data-[orientation=horizontal]:data-selected:after:inset-x-2 in-data-[orientation=horizontal]:data-selected:after:bottom-0 in-data-[orientation=horizontal]:data-selected:after:h-0.5 in-data-[orientation=horizontal]:data-selected:after:rounded-full in-data-[orientation=horizontal]:data-selected:after:bg-fg',
        // Vertical: nav rows like the sidebar, selected one filled
        'in-data-[orientation=vertical]:min-h-row in-data-[orientation=vertical]:rounded-sm in-data-[orientation=vertical]:px-2 in-data-[orientation=vertical]:touch:min-h-control-touch',
        'in-data-[orientation=vertical]:data-hovered:bg-hover in-data-[orientation=vertical]:data-selected:bg-selected',
        sectionStart && sectionLine,
        sectionStart && sectionTitle && sectionTitled,
        className,
      )}
    >
      {icon && <span className="flex size-icon shrink-0 items-center [&_svg]:size-icon">{icon}</span>}
      <span className="truncate">{children}</span>
    </AriaTab>
  )
}

export interface TabSectionProps {
  /** Small muted heading above the group. Omit for a group with only a divider. */
  title?: string
  /** The group's `Tab`s, as direct children. An empty group renders nothing. */
  children: ReactNode
}

/**
 * Groups tabs in a vertical TabList (a settings nav): a divider before the group and an optional heading.
 * Arrow keys still move through all tabs as one list. In a horizontal list, and under 768px, the tabs
 * run together without dividers or headings.
 */
export function TabSection({ title, children }: TabSectionProps) {
  return Children.toArray(children).map((child, i) =>
    i === 0 && isValidElement(child) ? cloneElement(child as ReactElement<TabProps>, { sectionStart: true, sectionTitle: title }) : child,
  )
}

export interface TabPanelProps extends Omit<AriaTabPanelProps, 'className'> {
  className?: string
}

/** Content for one tab. Scrolls on its own, so the tab list stays put. */
export function TabPanel({ className, ...props }: TabPanelProps) {
  return (
    <AriaTabPanel
      {...props}
      className={cx(
        'min-h-0 min-w-0 flex-1 overflow-y-auto outline-none data-focus-visible:ring-2 data-focus-visible:ring-focus data-focus-visible:ring-inset',
        className,
      )}
    />
  )
}
