import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ArrowDownUp, Copy, Download, FolderInput, Pencil, Trash2 } from 'lucide-react'
import { expect, fn, screen, waitFor, within } from 'storybook/test'
import { Button } from '../Button/Button'
import { ActionMenu, type ActionMenuEntry } from './ActionMenu'

const items: ActionMenuEntry[] = [
  { id: 'rename', label: 'Rename', icon: <Pencil /> },
  { id: 'duplicate', label: 'Duplicate', icon: <Copy />, shortcut: '⌘D' },
  {
    id: 'move',
    label: 'Move to',
    icon: <FolderInput />,
    items: [
      { id: 'move-lorem', label: 'Lorem' },
      { id: 'move-ipsum', label: 'Ipsum' },
    ],
  },
  { id: 'export', label: 'Export', icon: <Download />, description: 'As a ZIP file' },
  'separator',
  { id: 'delete', label: 'Delete', icon: <Trash2 />, tone: 'danger' },
]

const meta = {
  title: 'Components/Overlays/ActionMenu',
  component: ActionMenu,
  parameters: {
    docs: {
      description: {
        component:
          'A menu from a list of rows, opened by a "⋯" button: the short form of MenuTrigger + Menu + MenuItem. ' +
          'Rows take icons, a danger tone, links and submenus (`items`); `"separator"` splits groups. ' +
          'Pass `selectedId` and `onSelect` to make it a picker with a checkmark.',
      },
    },
  },
  args: { 'aria-label': 'File actions', items, onAction: fn() },
} satisfies Meta<typeof ActionMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Main: Story = { name: 'ActionMenu' }

/** A picker: one row is the current choice. Your own trigger replaces the "⋯" button. */
export const Picker: Story = {
  args: {
    'aria-label': 'Sort by',
    items: [
      { id: 'name', label: 'Name' },
      { id: 'updated', label: 'Last updated' },
      { id: 'size', label: 'Size' },
    ],
  },
  render: function Render(args) {
    const [sort, setSort] = useState('updated')
    const label = args.items.find((i) => i !== 'separator' && i.id === sort)
    return (
      <ActionMenu
        {...args}
        placement="bottom start"
        selectedId={sort}
        onSelect={setSort}
        trigger={
          <Button variant="secondary">
            <ArrowDownUp />
            {label !== 'separator' && label?.label}
          </Button>
        }
      />
    )
  },
}

/** Test for ActionMenu: hidden from the sidebar and docs. */
export const MainTest: Story = {
  ...Main,
  name: 'ActionMenu (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'File actions' }))
    const menu = await screen.findByRole('menu', { name: 'File actions' })
    await waitFor(() => expect(menu).toBeVisible())
    await expect(within(menu).getAllByRole('separator')).toHaveLength(1)
    await userEvent.click(within(menu).getByRole('menuitem', { name: /Delete/ }))
    await expect(args.onAction).toHaveBeenCalledWith('delete')
  },
}

/** Test for the picker: hidden from the sidebar and docs. */
export const PickerTest: Story = {
  ...Picker,
  name: 'Picker (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Last updated/ }))
    const menu = await screen.findByRole('menu')
    await expect(within(menu).getByRole('menuitemradio', { name: 'Last updated' })).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(within(menu).getByRole('menuitemradio', { name: 'Size' }))
    await waitFor(() => expect(canvas.getByRole('button', { name: /Size/ })).toBeVisible())
  },
}
