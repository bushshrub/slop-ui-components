import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import type { Key } from 'react-aria-components'
import { expect, waitFor, within } from 'storybook/test'
import { Badge } from '../Badge/Badge'
import { Button } from '../Button/Button'
import { TextField } from '../Inputs/TextField'
import { DataTable, type DataTableColumn } from '../Table/Table'
import { DetailPane, SplitView } from './SplitView'

interface Item {
  id: string
  name: string
  owner: string
  status: 'active' | 'archived'
}

const items: Item[] = [
  { id: 'itm-01', name: 'Lorem', owner: 'Ana', status: 'active' },
  { id: 'itm-02', name: 'Ipsum', owner: 'Ben', status: 'archived' },
  { id: 'itm-03', name: 'Dolor', owner: 'Chen', status: 'active' },
  { id: 'itm-04', name: 'Sit amet', owner: 'Dana', status: 'active' },
]

const columns: DataTableColumn<Item>[] = [
  { id: 'name', header: 'Name', cell: (i) => i.name },
  { id: 'id', header: 'ID', cell: (i) => i.id, mono: true, className: 'w-28' },
  { id: 'owner', header: 'Owner', cell: (i) => i.owner },
  {
    id: 'status',
    header: 'Status',
    cell: (i) => <Badge tone={i.status === 'active' ? 'success' : 'neutral'}>{i.status}</Badge>,
    className: 'w-28',
  },
]

type DemoProps = { side?: 'right' | 'left'; forceFullScreen?: boolean }

/** The usual wiring: the table's single selection is the open item; clearing it closes the pane. */
function Demo({ side, forceFullScreen }: DemoProps) {
  const [selected, setSelected] = useState<Key | null>(null)
  const item = items.find((i) => i.id === selected)
  return (
    <div className="flex h-[28rem] border border-divider">
      <SplitView
        side={side}
        forceFullScreen={forceFullScreen}
        pane={
          <DetailPane
            isOpen={item != null}
            onOpenChange={(open) => !open && setSelected(null)}
            title={item?.name}
            description={item && `Owned by ${item.owner}`}
            footer={(close) => (
              <>
                <Button onPress={close}>Cancel</Button>
                <Button variant="primary" onPress={close}>Save</Button>
              </>
            )}
          >
            {/* key: a new item gets a fresh form */}
            <TextField key={item?.id} label="Name" defaultValue={item?.name} />
          </DetailPane>
        }
      >
        <DataTable
          aria-label="Items"
          columns={columns}
          rows={items}
          rowKey={(i) => i.id}
          selectionMode="single"
          selectionBehavior="replace"
          selectedKeys={selected == null ? [] : [selected]}
          onSelectionChange={(keys) => setSelected(keys === 'all' ? null : ([...keys][0] ?? null))}
        />
      </SplitView>
    </div>
  )
}

const meta = {
  title: 'Components/Layout/SplitView',
  component: Demo,
  args: { side: 'right', forceFullScreen: false },
  argTypes: { side: { control: 'inline-radio', options: ['right', 'left'] } },
  parameters: {
    docs: {
      story: { inline: false, height: '480px' },
      description: {
        component:
          'A list with a `DetailPane` beside it, in the page: no backdrop, the list stays usable and narrows to make room. ' +
          'The pane takes the same props as `Drawer` (`isOpen` / `onOpenChange`, `title`, `description`, `footer`). ' +
          'Under 768px the open pane covers the screen with a back button.',
      },
    },
  },
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const LeftSide: Story = { args: { side: 'left' } }

export const FullScreen: Story = { name: 'Full screen (phone)', args: { forceFullScreen: true } }

const rowNamed = (canvas: { getAllByRole: (role: string) => HTMLElement[] }, name: string) =>
  canvas.getAllByRole('row').find((r) => within(r).queryByText(name)) as HTMLElement

export const OpenAndCloseTest: Story = {
  name: 'Open, Esc and focus return (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(within(rowNamed(canvas, 'Ipsum')).getByText('Ipsum'))
    const pane = await canvas.findByRole('region', { name: 'Ipsum' })
    await waitFor(() => expect(pane).toHaveFocus())
    // In the page: the list is still there and usable, nothing is modal
    expect(canvas.queryByRole('dialog')).toBeNull()
    expect(rowNamed(canvas, 'Ipsum')).toHaveAttribute('aria-selected', 'true')

    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(canvas.queryByRole('region', { name: 'Ipsum' })).toBeNull())
    await waitFor(() => expect(rowNamed(canvas, 'Ipsum').contains(document.activeElement)).toBe(true))

    // Keyboard: Enter on the focused row opens, the close button closes and focus goes back to the row
    await userEvent.keyboard('{ArrowDown}{Enter}')
    const next = await canvas.findByRole('region', { name: 'Dolor' })
    await userEvent.click(within(next).getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(canvas.queryByRole('region')).toBeNull())
    await waitFor(() => expect(rowNamed(canvas, 'Dolor').contains(document.activeElement)).toBe(true))
  },
}

export const SwapTest: Story = {
  name: 'Swap the selection (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(within(rowNamed(canvas, 'Lorem')).getByText('Lorem'))
    await canvas.findByRole('region', { name: 'Lorem' })
    await userEvent.click(within(rowNamed(canvas, 'Dolor')).getByText('Dolor'))
    const pane = await canvas.findByRole('region', { name: 'Dolor' })
    expect(within(pane).getByRole('textbox', { name: 'Name' })).toHaveValue('Dolor')
    expect(rowNamed(canvas, 'Dolor')).toHaveAttribute('aria-selected', 'true')
    expect(rowNamed(canvas, 'Lorem')).toHaveAttribute('aria-selected', 'false')
    // Esc in a field inside the pane still closes it; focus returns to the row picked last
    await userEvent.click(within(pane).getByRole('textbox', { name: 'Name' }))
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(canvas.queryByRole('region')).toBeNull())
    await waitFor(() => expect(rowNamed(canvas, 'Dolor').contains(document.activeElement)).toBe(true))
  },
}

export const FullScreenTest: Story = {
  name: 'Full screen (test)',
  tags: ['!dev', '!autodocs'],
  args: { forceFullScreen: true },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(within(rowNamed(canvas, 'Lorem')).getByText('Lorem'))
    const pane = await canvas.findByRole('region', { name: 'Lorem' })
    const box = pane.getBoundingClientRect()
    expect(box.left).toBe(0)
    expect(box.width).toBe(window.innerWidth)
    // The list behind is out of reach while the pane covers it
    expect(canvas.getByRole('grid', { name: 'Items' }).closest('[inert]')).not.toBeNull()
    expect(within(pane).queryByRole('button', { name: 'Close' })).toBeNull()
    await userEvent.click(within(pane).getByRole('button', { name: 'Back' }))
    await waitFor(() => expect(canvas.queryByRole('region')).toBeNull())
    expect(canvas.getByRole('grid', { name: 'Items' }).closest('[inert]')).toBeNull()
    await waitFor(() => expect(rowNamed(canvas, 'Lorem').contains(document.activeElement)).toBe(true))
  },
}

export const LeftSideTest: Story = {
  name: 'Left side (test)',
  tags: ['!dev', '!autodocs'],
  args: { side: 'left' },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(within(rowNamed(canvas, 'Lorem')).getByText('Lorem'))
    const pane = await canvas.findByRole('region', { name: 'Lorem' })
    const grid = canvas.getByRole('grid', { name: 'Items' })
    expect(pane.getBoundingClientRect().right).toBeLessThanOrEqual(grid.getBoundingClientRect().left + 1)
  },
}
