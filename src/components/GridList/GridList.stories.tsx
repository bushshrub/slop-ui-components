import type { Meta, StoryObj } from '@storybook/react-vite'
import { useDragAndDrop, useListData } from 'react-aria-components'
import { expect, waitFor } from 'storybook/test'
import { GridList, GridListDragHandle, GridListDropIndicator, GridListItem } from './GridList'

const items = [
  { id: 'srv-01', name: 'Lorem' },
  { id: 'srv-02', name: 'Ipsum' },
  { id: 'srv-03', name: 'Dolor' },
]

const meta = {
  title: 'Components/Data display/GridList',
  component: GridList,
  subcomponents: { GridListItem, GridListDragHandle } as Record<string, React.ComponentType<unknown>>,
  parameters: {
    docs: {
      description: {
        component:
          'A list of selectable, optionally reorderable items on react-aria GridList. Pass `selectionMode` for selection ' +
          'and `dragAndDropHooks` (from `useDragAndDrop`) for drag and drop, with a `GridListDragHandle` in each item.',
      },
    },
  },
} satisfies Meta<typeof GridList>

export default meta
type Story = StoryObj<typeof meta>

export const Main: Story = {
  name: 'GridList',
  render: () => (
    <GridList aria-label="Servers" selectionMode="multiple" defaultSelectedKeys={['srv-02']} className="max-w-sm">
      {items.map((s) => (
        <GridListItem key={s.id} id={s.id} textValue={s.name}>
          {s.name}
        </GridListItem>
      ))}
    </GridList>
  ),
}

/** Test for GridList: hidden from the sidebar and docs. */
export const MainTest: Story = {
  ...Main,
  name: 'GridList (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, userEvent }) => {
    const rows = canvas.getAllByRole('row')
    await expect(rows[1]).toHaveAttribute('aria-selected', 'true')
    await userEvent.click(rows[0])
    await expect(rows[0]).toHaveAttribute('aria-selected', 'true')
    await expect(rows[1]).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ }')
    await expect(rows[2]).toHaveAttribute('aria-selected', 'true')
  },
}

function Reorderable() {
  const list = useListData({ initialItems: items })
  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) => [...keys].map((key) => ({ 'text/plain': String(key) })),
    renderDropIndicator: (target) => <GridListDropIndicator target={target} />,
    onReorder(e) {
      if (e.target.dropPosition === 'before') list.moveBefore(e.target.key, e.keys)
      else if (e.target.dropPosition === 'after') list.moveAfter(e.target.key, e.keys)
    },
  })
  return (
    <GridList aria-label="Servers, reorderable" items={list.items} dragAndDropHooks={dragAndDropHooks} className="max-w-sm">
      {(s) => (
        <GridListItem textValue={s.name}>
          <GridListDragHandle aria-label={`Drag ${s.name}`} />
          {s.name}
        </GridListItem>
      )}
    </GridList>
  )
}

/** Drag the handle with the mouse, or focus it and press Enter, move with the arrow keys and press Enter to drop. */
export const DragAndDrop: Story = {
  name: 'Drag and drop',
  render: () => <Reorderable />,
  play: async ({ canvas, userEvent }) => {
    const names = () => canvas.getAllByRole('row').map((r) => r.textContent)
    await expect(names()).toEqual(['Lorem', 'Ipsum', 'Dolor'])
    canvas.getByRole('button', { name: 'Drag Lorem' }).focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    await waitFor(() => expect(names()).not.toEqual(['Lorem', 'Ipsum', 'Dolor']))
  },
}

/** `layout="grid"` for tiles. Arrow keys move in two dimensions. */
export const Tiles: Story = {
  render: () => (
    <GridList aria-label="Servers as tiles" layout="grid" selectionMode="single" className="max-w-md grid-cols-3">
      {items.map((s) => (
        <GridListItem key={s.id} id={s.id} textValue={s.name} className="h-20 justify-center border-border">
          {s.name}
        </GridListItem>
      ))}
    </GridList>
  ),
}

export const Empty: Story = {
  render: () => (
    <GridList aria-label="Servers" renderEmptyState={() => 'No servers yet'} className="max-w-sm">
      {[]}
    </GridList>
  ),
}
