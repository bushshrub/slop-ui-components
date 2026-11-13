import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'
import {
  Autocomplete,
  Dialog,
  Input,
  Menu as AriaMenu,
  Modal as AriaModal,
  ModalOverlay,
  SearchField,
  useFilter,
  type Key,
  type ModalOverlayProps,
} from 'react-aria-components'
import { Search } from 'lucide-react'
import { useStrings } from '../../lib/strings'
import { MenuItem, MenuSection, type MenuItemProps, type MenuSectionProps } from '../Menu/Menu'

/** Group of commands with a small label above it. Same as a Menu section. */
export const CommandSection = MenuSection
export type CommandSectionProps = MenuSectionProps

export interface CommandPaletteProps<T extends object = object> extends Omit<ModalOverlayProps, 'className' | 'children'> {
  /** Input placeholder. Also the field's accessible name. */
  placeholder?: string
  /** Shown when the query matches nothing. */
  emptyMessage?: ReactNode
  /** Close after an item runs. Default true. */
  closeOnAction?: boolean
  /** Hint row under the list, e.g. the keys to navigate with. */
  footer?: ReactNode
  /** Runs with the `id` of the chosen item, whether it is static or from `items`. */
  onAction?: (key: Key) => void
  /** Data for dynamic lists. `children` is then a function that renders one `CommandItem` per entry. */
  items?: Iterable<T>
  /** `CommandSection`s and `CommandItem`s, or a function of each entry of `items`. */
  children?: ReactNode | ((item: T) => ReactNode)
}

/** Runs an item's id through the palette's `onAction` and closes it. Provided by the palette's dialog. */
const CommandPaletteContext = createContext<((key: Key) => void) | null>(null)

/**
 * ⌘K command dialog: a search field over a filterable list of commands. Opens near the top of the
 * screen, full width on phones. Enter runs the first match; arrows move; Esc closes and returns
 * focus to the trigger. Filters on the item label and its `keywords`.
 */
export function CommandPalette<T extends object = object>({
  placeholder,
  emptyMessage,
  closeOnAction = true,
  footer,
  onAction,
  items,
  children,
  ...props
}: CommandPaletteProps<T>) {
  const { contains } = useFilter({ sensitivity: 'base' })
  const strings = useStrings()
  const searchPlaceholder = placeholder ?? strings.commandPlaceholder
  return (
    <ModalOverlay
      {...props}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-backdrop px-4 pt-[15dvh] motion-safe:data-entering:animate-fade-in max-md:px-2 max-md:pt-[8dvh]"
    >
      <AriaModal className="w-full max-w-lg outline-none motion-safe:data-entering:animate-pop-in">
        <Dialog
          aria-label={strings.commandPalette}
          className="flex max-h-full flex-col overflow-hidden rounded-lg border border-border bg-popover font-sans text-fg shadow-popover outline-none"
        >
          {({ close }) => (
            <CommandPaletteContext.Provider
              value={(key) => {
                onAction?.(key)
                if (closeOnAction) close()
              }}
            >
              <Autocomplete filter={contains}>
                <SearchField
                  aria-label={searchPlaceholder}
                  autoFocus
                  className="flex shrink-0 items-center gap-2.5 border-b border-divider px-4"
                >
                  <Search aria-hidden className="size-icon shrink-0 text-muted" />
                  <Input
                    placeholder={searchPlaceholder}
                    className="h-control-lg min-w-0 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-subtle [&::-webkit-search-cancel-button]:hidden"
                  />
                </SearchField>
                <AriaMenu
                  aria-label={strings.commands}
                  items={items}
                  renderEmptyState={() => <div className="px-2 py-3 text-ui text-muted">{emptyMessage ?? strings.noMatchingCommands}</div>}
                  className="min-h-0 max-h-[min(24rem,60dvh)] overflow-auto p-1.5 outline-none"
                >
                  {children}
                </AriaMenu>
                {footer && (
                  <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-t border-divider px-4 py-2 text-ui-sm text-muted">
                    {footer}
                  </div>
                )}
              </Autocomplete>
            </CommandPaletteContext.Provider>
          )}
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  )
}

export interface CommandItemProps extends Omit<MenuItemProps, 'textValue' | 'id' | 'onAction' | 'children'> {
  id: Key
  /** The command's name. It is what the user sees and searches. */
  children: string
  /** Extra words the search matches, e.g. `['preferences']` for "Open settings". Not shown. */
  keywords?: string[]
  /** Runs when the item is chosen, before the palette's `onAction`. */
  onAction?: () => void
}

/** One command in a CommandPalette. Its `onAction` runs first, then the palette's `onAction(id)`. */
export function CommandItem({ id, children, keywords, onAction, ...props }: CommandItemProps) {
  const runAction = useContext(CommandPaletteContext)
  return (
    <MenuItem
      {...props}
      id={id}
      textValue={[children, ...(keywords ?? [])].join(' ')}
      onAction={() => {
        onAction?.()
        runAction?.(id)
      }}
    >
      {children}
    </MenuItem>
  )
}

/**
 * Opens a CommandPalette from a keyboard shortcut: ⌘K on macOS, Ctrl+K elsewhere. Pass the state
 * toggle. The shortcut is prevented from doing the browser's default (focus the address bar).
 */
export function useCommandPaletteShortcut(onToggle: () => void, { key = 'k' }: { key?: string } = {}) {
  const toggleRef = useRef(onToggle)
  useEffect(() => {
    toggleRef.current = onToggle
  })
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === key) {
        event.preventDefault()
        toggleRef.current()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [key])
}
