import {
  Button as AriaButton,
  DropIndicator as AriaDropIndicator,
  GridList as AriaGridList,
  GridListItem as AriaGridListItem,
  type DropIndicatorProps,
  type GridListItemProps as AriaGridListItemProps,
  type GridListProps as AriaGridListProps,
} from 'react-aria-components'
import { GripVertical } from 'lucide-react'
import { cx } from '../../lib/cx'

export interface GridListProps<T> extends Omit<AriaGridListProps<T>, 'className'> {
  className?: string
}

/**
 * Interactive list of rows or tiles on react-aria GridList: arrow-key navigation, optional single or multiple
 * selection (`selectionMode`, `selectedKeys`, `onSelectionChange`), `onAction` for activating an item, and
 * drag and drop. For drag and drop, create hooks with react-aria's `useDragAndDrop` and pass them as
 * `dragAndDropHooks`; put a `GridListDragHandle` in each draggable item for a keyboard and touch way to start a drag.
 * `layout="grid"` switches to two-dimensional arrow-key navigation, for tiles; give it a grid `className`.
 * Items are `GridListItem`; their `children` can be a function of the item's render props (`isSelected`,
 * `isDragging`, `allowsDragging`, `selectionMode` ...).
 */
export function GridList<T extends object>({ className, ...props }: GridListProps<T>) {
  return (
    <AriaGridList
      {...props}
      className={cx(
        'flex flex-col gap-1 text-ui outline-none data-[layout=grid]:grid data-focus-visible:outline-2 data-focus-visible:outline-focus',
        'data-empty:items-center data-empty:justify-center data-empty:p-6 data-empty:text-muted',
        className,
      )}
    />
  )
}

export interface GridListItemProps<T> extends Omit<AriaGridListItemProps<T>, 'className'> {
  className?: string
}

/** Item of a `GridList`. Hover and selected fills, a focus ring, dimmed while dragged, outlined as a drop target. */
export function GridListItem<T extends object>({ className, ...props }: GridListItemProps<T>) {
  return (
    <AriaGridListItem
      {...props}
      className={cx(
        'relative flex min-h-row cursor-default items-center gap-3 rounded-md border border-transparent px-3 py-1.5 outline-none touch:min-h-control-touch',
        'data-hovered:bg-hover data-selected:bg-selected data-pressed:bg-selected',
        'data-focus-visible:outline-2 data-focus-visible:-outline-offset-2 data-focus-visible:outline-focus',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
        // Forced colors drops the selected and drop-target fills: outline the item instead
        'forced-colors:data-drop-target:outline-solid forced-colors:data-drop-target:outline-2 forced-colors:data-selected:outline-solid forced-colors:data-selected:outline-2 forced-colors:data-drop-target:-outline-offset-2 forced-colors:data-selected:-outline-offset-2 forced-colors:data-drop-target:outline-[Highlight] forced-colors:data-selected:outline-[Highlight]',
        'data-dragging:opacity-50 data-drop-target:border-focus data-drop-target:bg-selected',
        className,
      )}
    />
  )
}

/** Handle that starts a drag with mouse, touch or keyboard (Enter). Put it inside a `GridListItem` that allows dragging. */
export function GridListDragHandle({ className, 'aria-label': label = 'Drag' }: { className?: string; 'aria-label'?: string }) {
  return (
    <AriaButton
      slot="drag"
      aria-label={label}
      className={cx(
        'flex size-6 shrink-0 cursor-grab items-center justify-center rounded-sm text-subtle outline-none data-focus-visible:outline-2 data-focus-visible:outline-focus [&_svg]:size-icon',
        className,
      )}
    >
      <GripVertical />
    </AriaButton>
  )
}

/** Insertion line shown between items while dragging. Pass to `useDragAndDrop({ renderDropIndicator })`. */
export function GridListDropIndicator(props: DropIndicatorProps) {
  return (
    <AriaDropIndicator
      {...props}
      className="h-0.5 rounded-full bg-focus data-drop-target:opacity-100 [&:not([data-drop-target])]:hidden"
    />
  )
}
