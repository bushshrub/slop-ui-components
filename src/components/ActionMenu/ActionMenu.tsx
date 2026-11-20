import type { ReactElement, ReactNode } from 'react'
import type { Key } from 'react-aria-components'
import { Ellipsis } from 'lucide-react'
import { useStrings } from '../../lib/strings'
import { IconButton, type ButtonSize } from '../Button/Button'
import { Menu, MenuItem, MenuSeparator, MenuTrigger, SubmenuTrigger, type MenuProps } from '../Menu/Menu'

export interface ActionMenuItem {
  id: string
  label: string
  /** 16px icon before the label. */
  icon?: ReactNode
  /** Second, muted line under the label. */
  description?: ReactNode
  /** Muted text at the right, e.g. the current value. */
  detail?: ReactNode
  /** Shortcut shown at the right. Display only; wire the key yourself. */
  shortcut?: string
  /** `danger` for destructive actions. */
  tone?: 'default' | 'danger'
  isDisabled?: boolean
  /** Makes the row a link. With `target="_blank"` it shows the leaving-the-app arrow. */
  href?: string
  target?: string
  /** Runs when this row is picked, before the menu's `onAction`. */
  onAction?: () => void
  /** Makes the row open a submenu with these entries. */
  items?: readonly ActionMenuEntry[]
}

/** A row, or `'separator'` for a hairline between groups. */
export type ActionMenuEntry = ActionMenuItem | 'separator'

export interface ActionMenuProps extends Pick<MenuProps<object>, 'placement' | 'header' | 'footer' | 'searchable' | 'sheetTitle'> {
  /** Names the menu, and the default trigger for screen readers. Default "More actions". */
  'aria-label'?: string
  items: readonly ActionMenuEntry[]
  /** Called with the picked row's `id`, for menus that handle every row in one place. */
  onAction?: (id: string) => void
  /**
   * Makes it a picker: the row with this id gets a checkmark, and picking a row calls `onSelect`. For "Sort by",
   * "Theme" and other one-of-many choices.
   */
  selectedId?: string
  onSelect?: (id: string) => void
  /** The button that opens the menu. Default: a "⋯" icon button. */
  trigger?: ReactElement
  /** Size of the default trigger. */
  size?: ButtonSize
  isDisabled?: boolean
}

/**
 * A menu from a list: pass the rows as data instead of writing MenuItem elements. A "⋯" button opens it by default.
 * Rows can carry icons, a danger tone, links, and submenus (`items`); `'separator'` splits groups. With `selectedId`
 * it becomes a picker with a checkmark on the current row. For menus whose rows need their own markup, compose
 * MenuTrigger, Menu and MenuItem instead.
 */
export function ActionMenu({
  'aria-label': ariaLabel,
  items,
  onAction,
  selectedId,
  onSelect,
  trigger,
  size = 'md',
  isDisabled,
  placement = 'bottom end',
  ...menuProps
}: ActionMenuProps) {
  const strings = useStrings()
  const label = ariaLabel ?? strings.moreActions
  const picker = selectedId !== undefined || onSelect !== undefined
  return (
    <MenuTrigger>
      {trigger ?? (
        <IconButton aria-label={label} size={size} isDisabled={isDisabled}>
          <Ellipsis />
        </IconButton>
      )}
      <ActionMenuList
        {...menuProps}
        aria-label={label}
        placement={placement}
        items={items}
        onAction={onAction}
        selection={picker ? { selectedId, onSelect } : undefined}
      />
    </MenuTrigger>
  )
}

interface ActionMenuListProps extends Pick<ActionMenuProps, 'placement' | 'header' | 'footer' | 'searchable' | 'sheetTitle' | 'onAction'> {
  'aria-label': string
  items: readonly ActionMenuEntry[]
  selection?: { selectedId?: string; onSelect?: (id: string) => void }
}

function ActionMenuList({ items, onAction, selection, ...menuProps }: ActionMenuListProps) {
  const rows = (entries: readonly ActionMenuEntry[]) => entries.map((entry, i) => renderEntry(entry, i))
  const byId = new Map<string, ActionMenuItem>()
  const index = (entries: readonly ActionMenuEntry[]) =>
    entries.forEach((e) => {
      if (e === 'separator') return
      byId.set(e.id, e)
      if (e.items) index(e.items)
    })
  index(items)

  const handle = (key: Key) => {
    const id = String(key)
    byId.get(id)?.onAction?.()
    onAction?.(id)
  }

  function renderEntry(entry: ActionMenuEntry, i: number): ReactNode {
    if (entry === 'separator') return <MenuSeparator key={`separator-${i}`} />
    const { id, label, items: children, onAction: _, ...item } = entry
    const row = (
      <MenuItem key={id} id={id} textValue={label} {...item}>
        {label}
      </MenuItem>
    )
    if (!children) return row
    return (
      <SubmenuTrigger key={id}>
        {row}
        <Menu aria-label={label} onAction={handle}>
          {rows(children)}
        </Menu>
      </SubmenuTrigger>
    )
  }

  return (
    <Menu
      {...menuProps}
      onAction={handle}
      {...(selection && {
        selectionMode: 'single' as const,
        selectedKeys: selection.selectedId === undefined ? [] : [selection.selectedId],
        onSelectionChange: (keys) => {
          const [first] = keys === 'all' ? [] : [...keys]
          if (first !== undefined) selection.onSelect?.(String(first))
        },
      })}
    >
      {rows(items)}
    </Menu>
  )
}
