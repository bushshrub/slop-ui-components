import { ChevronRight, MoreHorizontal } from 'lucide-react'
import {
  Breadcrumb as AriaBreadcrumb,
  Breadcrumbs as AriaBreadcrumbs,
  Link as AriaLink,
  type BreadcrumbsProps as AriaBreadcrumbsProps,
} from 'react-aria-components'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'
import { IconButton } from '../Button/Button'
import { Menu, MenuItem, MenuTrigger } from '../Menu/Menu'

export interface BreadcrumbItem {
  id: string
  label: string
  /** Link target. Omit for the current page or when using `onAction`. */
  href?: string
  /** Called instead of navigating, for client-side routing. */
  onAction?: () => void
}

export interface BreadcrumbsProps extends Omit<AriaBreadcrumbsProps<BreadcrumbItem>, 'className' | 'children' | 'items'> {
  items: BreadcrumbItem[]
  /** Longer trails keep the first item and the last ones, and hide the rest in a "…" menu. */
  maxItems?: number
  className?: string
}

const separator = <ChevronRight aria-hidden className="size-icon shrink-0 text-subtle rtl:rotate-180" />

const linkClass =
  'rounded-sm text-ui leading-5 outline-none transition-colors data-focus-visible:outline-2 data-focus-visible:outline-solid data-focus-visible:outline-offset-2 data-focus-visible:outline-focus'

/** Where you are in a hierarchy. The last item is the current page; earlier ones are links. */
export function Breadcrumbs({ items, maxItems = 4, className, ...props }: BreadcrumbsProps) {
  const collapse = items.length > Math.max(maxItems, 2)
  // First item, then "…", then as many trailing items as fit in maxItems
  const tail = collapse ? items.slice(items.length - (maxItems - 2)) : []
  const hidden = collapse ? items.slice(1, items.length - tail.length) : []
  const visible = collapse ? [items[0], ...tail] : items
  const strings = useStrings()

  const crumb = (item: BreadcrumbItem) => (
    <AriaBreadcrumb key={item.id} className="flex min-w-0 items-center gap-1.5">
      {({ isCurrent }) => (
        <>
      <AriaLink
        href={item.href}
        onPress={item.onAction}
        className={cx(
          linkClass,
          'truncate text-muted data-hovered:text-fg data-current:cursor-default data-current:text-fg data-current:data-hovered:text-fg',
          // Padding, not height, so the truncating text keeps its line box; brings the link to touch height
          'touch:py-[calc((var(--ui-control-touch)-1.25rem)/2)]',
        )}
      >
        {item.label}
      </AriaLink>
      {/* The current (last) crumb has no separator after it */}
      {!isCurrent && separator}
        </>
      )}
    </AriaBreadcrumb>
  )

  return (
    <AriaBreadcrumbs
      {...props}
      className={cx('flex min-w-0 items-center gap-1.5', className)}
    >
      {collapse ? (
        <>
          {crumb(visible[0])}
          <AriaBreadcrumb key="more" className="flex items-center gap-1.5">
            <MenuTrigger>
              <IconButton size="sm" aria-label={strings.showHiddenLevels(hidden.length)} className="-mx-1">
                <MoreHorizontal />
              </IconButton>
              <Menu placement="bottom start" sheetTitle={strings.breadcrumbPath}>
                {hidden.map((h) => (
                  <MenuItem key={h.id} id={h.id} href={h.href} onAction={h.onAction}>
                    {h.label}
                  </MenuItem>
                ))}
              </Menu>
            </MenuTrigger>
            {separator}
          </AriaBreadcrumb>
          {visible.slice(1).map(crumb)}
        </>
      ) : (
        visible.map(crumb)
      )}
    </AriaBreadcrumbs>
  )
}
