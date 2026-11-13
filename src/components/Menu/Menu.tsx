import { createContext, useContext, type ReactElement, type ReactNode } from 'react'
import {
  Autocomplete,
  Header,
  Input,
  Keyboard,
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuSection as AriaMenuSection,
  MenuTrigger as AriaMenuTrigger,
  OverlayTriggerStateContext,
  Popover,
  PopoverContext,
  SearchField,
  Separator,
  SubmenuTrigger as AriaSubmenuTrigger,
  Text,
  type MenuItemProps as AriaMenuItemProps,
  type MenuProps as AriaMenuProps,
  type MenuTriggerProps,
  type PopoverProps,
  useFilter,
  useSlottedContext,
} from 'react-aria-components'
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'
import { IconButton } from '../Button/Button'
import { SheetHeader, SheetPopover, useSheetMode, type SheetMode } from '../Sheet/Sheet'

const popoverClass =
  'flex min-w-56 flex-col overflow-hidden rounded-popover border border-border bg-popover font-sans text-fg shadow-popover outline-none ' +
  'motion-safe:data-entering:animate-pop-in'

/** True inside a menu shown as a sheet, so its submenus open as sheets too. */
const MenuSheetContext = createContext(false)
/**
 * Side that submenus cascade toward. The first submenu picks the side of the root menu with more
 * room and every deeper level keeps going that way, so levels never fold back over earlier ones.
 */
const CascadeContext = createContext<'start' | 'end' | null>(null)

function useCascadeSide(isSubmenu: boolean, triggerRef: { current: Element | null } | undefined) {
  const inherited = useContext(CascadeContext)
  if (inherited) return inherited
  // Measured on each render: this component mounts with its parent menu, before the item it hangs
  // off has an element, and re-renders once the submenu opens.
  const parent = isSubmenu ? triggerRef?.current?.closest('[data-trigger]')?.getBoundingClientRect() : undefined
  if (!parent) return 'end'
  const rtl = document.documentElement.dir === 'rtl'
  const roomRight = window.innerWidth - parent.right
  const roomLeft = parent.left
  return roomRight >= roomLeft !== rtl ? 'end' : 'start'
}

export interface MenuProps<T> extends Omit<AriaMenuProps<T>, 'className'> {
  /** Popover side relative to the trigger, e.g. `top start` for a menu above a sidebar footer. Submenus open to the side with room. */
  placement?: PopoverProps['placement']
  /** Gap between trigger and popover in px. */
  offset?: number
  /** Open as a bottom sheet: `auto` under 768px, where a popover has no room. Submenus follow their parent. */
  sheet?: SheetMode
  /** Title above the items when shown as a sheet. Submenu sheets default to the label of the item that opened them. */
  sheetTitle?: ReactNode
  /** Filter field above the items. Typing narrows them; arrow keys still move through them. */
  searchable?: boolean
  searchPlaceholder?: string
  /** Other content above the items, e.g. a hint or a Switch. Sits outside the item list, so it is not a menu item. */
  header?: ReactNode
  /** Other content below the items, e.g. a "Manage…" link. */
  footer?: ReactNode
  className?: string
}

/**
 * Dropdown menu content. Place inside `MenuTrigger` (after the trigger button) or `SubmenuTrigger`.
 * Keyboard: arrows move, Enter selects, Right opens a submenu, Left or Esc closes it.
 * On phones it opens as a bottom sheet; submenus stack on top with a back button.
 */
export function Menu<T extends object>({
  placement,
  offset,
  sheet = 'auto',
  sheetTitle,
  searchable,
  searchPlaceholder,
  header,
  footer,
  className,
  renderEmptyState,
  ...props
}: MenuProps<T>) {
  const popoverContext = useSlottedContext(PopoverContext)
  const isSubmenu = popoverContext?.trigger === 'SubmenuTrigger'
  const cascade = useCascadeSide(isSubmenu, popoverContext?.triggerRef)
  const parentIsSheet = useContext(MenuSheetContext)
  const sheetForRoot = useSheetMode(sheet)
  const asSheet = isSubmenu ? parentIsSheet : sheetForRoot
  const { contains } = useFilter({ sensitivity: 'base' })
  const strings = useStrings()

  const body = (
    <>
      {searchable && <MenuSearchField placeholder={searchPlaceholder ?? strings.search} autoFocus={!asSheet} />}
      {header && <div className="shrink-0 border-b border-divider px-3 py-2 text-ui in-data-sheet:px-4">{header}</div>}
      <AriaMenu
        {...props}
        renderEmptyState={
          renderEmptyState ?? (searchable ? () => <div className="px-2 py-1.5 text-ui text-muted">{strings.noMatches}</div> : undefined)
        }
        className={cx('min-h-0 overflow-auto outline-none', asSheet ? 'overscroll-contain px-2 pb-2' : 'p-1.5', className)}
      />
      {footer && <div className="shrink-0 border-t border-divider px-3 py-2 text-ui in-data-sheet:px-4">{footer}</div>}
    </>
  )
  const content = searchable ? <Autocomplete filter={contains}>{body}</Autocomplete> : body

  if (asSheet) {
    return (
      <MenuSheetContext.Provider value>
        <SheetPopover drillIn={isSubmenu}>
          <SheetHeader>
            {isSubmenu ? (
              // Read from the item element: react-aria renders submenus outside our React context
              <SubmenuBack title={sheetTitle ?? popoverContext?.triggerRef?.current?.querySelector('[slot=label]')?.textContent} />
            ) : (
              sheetTitle && <div className="truncate text-ui font-medium">{sheetTitle}</div>
            )}
          </SheetHeader>
          {content}
        </SheetPopover>
      </MenuSheetContext.Provider>
    )
  }
  // Submenus open beside their item on the cascade side, and only flip if the screen runs out. The
  // offset is measured from the item, which sits 7px inside the panel (p-1.5 + border), so 11 clears
  // the parent panel with a 4px gap. crossOffset lines the first item up with the one that opened it.
  const position = isSubmenu
    ? { placement: `${cascade} top` as const, offset: offset ?? 11, crossOffset: -7 }
    : { placement: placement ?? 'bottom start', offset: offset ?? 6 }
  return (
    <MenuSheetContext.Provider value={false}>
      <CascadeContext.Provider value={isSubmenu ? cascade : null}>
        <Popover {...position} className={popoverClass}>
          {content}
        </Popover>
      </CascadeContext.Provider>
    </MenuSheetContext.Provider>
  )
}

/** Back button and title at the top of a submenu sheet. */
function SubmenuBack({ title }: { title: ReactNode }) {
  const state = useContext(OverlayTriggerStateContext)
  const strings = useStrings()
  return (
    <div className="-ml-2 flex min-w-0 items-center gap-1">
      <IconButton aria-label={strings.back} size="sm" onPress={() => state?.close()}>
        <ChevronLeft />
      </IconButton>
      <div className="truncate text-ui font-medium">{title}</div>
    </div>
  )
}

/** Borderless filter field that blends into the top of the menu. Esc clears it, then closes the menu. */
function MenuSearchField({ placeholder, autoFocus }: { placeholder: string; autoFocus: boolean }) {
  return (
    <SearchField
      aria-label={placeholder}
      autoFocus={autoFocus}
      className="flex shrink-0 items-center gap-2 border-b border-divider px-3 in-data-sheet:px-4"
    >
      <Search aria-hidden className="size-icon shrink-0 text-muted" />
      <Input
        placeholder={placeholder}
        className="h-row min-w-0 flex-1 bg-transparent text-ui text-fg outline-none placeholder:text-subtle touch:h-control-touch touch:text-base [&::-webkit-search-cancel-button]:hidden"
      />
    </SearchField>
  )
}

export interface MenuItemProps extends Omit<AriaMenuItemProps, 'className' | 'children'> {
  /** 16px icon before the label. */
  icon?: ReactNode
  /** Keyboard shortcut shown at the right, e.g. `⇧⌘,`. Display only; wire the key yourself. */
  shortcut?: string
  /** Muted text at the right of the label, e.g. a count or "3d ago". Read out after the label. */
  detail?: ReactNode
  /** Muted second line under the label. */
  description?: ReactNode
  /** `danger` colors the label and icon for destructive actions. */
  tone?: 'default' | 'danger'
  /**
   * Shows an arrow at the right for links that leave the app. Defaults to true when
   * `target="_blank"` is set.
   */
  external?: boolean
  children: ReactNode
}

/** One row in a Menu. Pass `href` to make it a link; inside SubmenuTrigger it shows a chevron. */
export function MenuItem({ icon, shortcut, detail, description, tone = 'default', external, children, ...props }: MenuItemProps) {
  const isExternal = external ?? props.target === '_blank'
  return (
    <AriaMenuItem
      {...props}
      textValue={props.textValue ?? (typeof children === 'string' ? children : undefined)}
      className={cx(
        'group flex min-h-row cursor-default items-center gap-2.5 rounded-sm px-2 py-1 text-ui leading-5 outline-none',
        'in-data-sheet:min-h-control-touch in-data-sheet:gap-3 touch:min-h-control-touch',
        // Not data-focused: react-aria focuses the first item when it pulls focus back during an
        // outside click, which would flash a highlight right before the menu closes.
        'data-hovered:bg-hover data-focus-visible:bg-hover data-pressed:bg-hover data-open:bg-hover data-disabled:opacity-50',
        tone === 'danger' && 'text-danger',
      )}
    >
      {({ hasSubmenu, isSelected, selectionMode }) => (
        <>
          {selectionMode !== 'none' && (
            <span className="flex size-icon shrink-0 items-center">{isSelected && <Check className="size-icon text-focus" />}</span>
          )}
          {icon && (
            <span className={cx('flex size-icon shrink-0 items-center [&_svg]:size-icon', tone === 'danger' ? 'text-danger' : 'text-fg')}>
              {icon}
            </span>
          )}
          <span className="flex min-w-0 flex-1 flex-col">
            {detail ? (
              // Inside the label, so the detail is part of the item's accessible name
              <Text slot="label" className="flex min-w-0 items-baseline gap-4">
                <span className="min-w-0 flex-1 truncate">{children}</span>
                <span className="shrink-0 text-ui-sm text-muted">{detail}</span>
              </Text>
            ) : (
              <Text slot="label" className="truncate">
                {children}
              </Text>
            )}
            {description && (
              <Text slot="description" className="text-ui-sm leading-4 text-muted">
                {description}
              </Text>
            )}
          </span>
          {shortcut && <Keyboard className="ml-4 font-sans text-ui-sm tracking-wide text-muted in-data-sheet:hidden">{shortcut}</Keyboard>}
          {isExternal && <ArrowUpRight aria-hidden className="ml-4 size-icon shrink-0 text-muted" />}
          {hasSubmenu && <ChevronRight aria-hidden className="ml-4 size-icon shrink-0 text-muted" />}
        </>
      )}
    </AriaMenuItem>
  )
}

export interface MenuSectionProps {
  /** Small label above the group. Omit for an unlabeled group. */
  title?: ReactNode
  /** Accessible name when there is no visible title. */
  'aria-label'?: string
  children: ReactNode
}

/** Group of related items, optionally with a header. */
export function MenuSection({ title, children, ...props }: MenuSectionProps) {
  return (
    <AriaMenuSection {...props} className="flex flex-col">
      {title && <Header className="truncate px-2 pt-1.5 pb-1 text-ui-sm leading-4 text-muted">{title}</Header>}
      {children}
    </AriaMenuSection>
  )
}

export interface MenuListProps<T> extends Omit<AriaMenuProps<T>, 'className'> {
  className?: string
}

/**
 * Just the list of items, without the popover or sheet around it: for a menu inside a popover that
 * something else provides. Takes the same items as `Menu`. No search field, header, footer or sheet.
 */
export function MenuList<T extends object>({ className, ...props }: MenuListProps<T>) {
  return <AriaMenu {...props} className={cx('min-h-0 overflow-auto p-1.5 font-sans text-fg outline-none', className)} />
}

/** Hairline between groups of items. */
export function MenuSeparator() {
  return <Separator className="-mx-1.5 my-1.5 border-t border-border" />
}

/**
 * Non-interactive header row, e.g. the signed-in email at the top of an account menu. For anything
 * richer than a line of text, use the Menu's `header` prop, which sits outside the item list.
 */
export function MenuHeader({ children }: { children: ReactNode }) {
  return <Header className="truncate px-2 pt-1 pb-1.5 text-ui leading-5 text-muted">{children}</Header>
}

/** Wraps a trigger button and its Menu. Opens on press or long-press, closes on select. */
export function MenuTrigger(props: MenuTriggerProps) {
  return <AriaMenuTrigger {...props} />
}

export interface SubmenuTriggerProps {
  /** Exactly two children: the parent MenuItem, then the nested Menu. */
  children: [ReactElement, ReactElement]
  delay?: number
}

/** Nests a Menu under a MenuItem. Opens on hover, tap or Right arrow; nest as deep as you need. */
export function SubmenuTrigger({ children, delay }: SubmenuTriggerProps) {
  return <AriaSubmenuTrigger delay={delay}>{children}</AriaSubmenuTrigger>
}
