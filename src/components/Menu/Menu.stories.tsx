import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChevronDown, Copy, Download, FolderInput, MoreHorizontal, Pencil, Pin, Plus, Share, Trash2 } from 'lucide-react'
import { expect, fn, screen, userEvent as user, waitFor, within } from 'storybook/test'
import { models } from '../../examples/sample-data'
import { Button, IconButton } from '../Button/Button'
import { Switch } from '../Inputs/Switch'
import { Menu, MenuItem, MenuSeparator, MenuTrigger, SubmenuTrigger } from './Menu'

const meta = {
  title: 'Components/Overlays/Menu',
  component: Menu,
  subcomponents: { MenuItem, MenuTrigger, MenuSeparator } as Record<string, React.ComponentType<unknown>>,
  args: { onAction: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'Dropdown menu on react-aria: arrow keys, typeahead, submenus, links and Esc all work. ' +
          'Items take a leading `icon`, a trailing `shortcut`, an `external` arrow and `tone="danger"`.',
      },
    },
  },
} satisfies Meta<typeof Menu>

export default meta
type Story = StoryObj<typeof meta>

/** The ⋯ menu on a list row. */
export const RowActions: Story = {
  name: 'Actions on a chat row',
  render: (args) => (
    <MenuTrigger>
      <IconButton aria-label="Chat actions">
        <MoreHorizontal />
      </IconButton>
      <Menu {...args}>
        <MenuItem id="rename" icon={<Pencil />} shortcut="R">Rename</MenuItem>
        <MenuItem id="pin" icon={<Pin />}>Pin</MenuItem>
        <MenuItem id="share" icon={<Share />}>Share</MenuItem>
        <MenuItem id="copy" icon={<Copy />} description="cnv_7f3a">Copy ID</MenuItem>
        <MenuSeparator />
        <MenuItem id="delete" icon={<Trash2 />} tone="danger">Delete</MenuItem>
      </Menu>
    </MenuTrigger>
  ),
}

/** Test for Actions on a chat row: runs in Vitest and Run tests, hidden from the sidebar and docs so the story loads still. */
export const RowActionsTest: Story = {
  ...RowActions,
  name: 'Actions on a chat row (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ args, canvas, step }) => {
    await step('Open with the keyboard', async () => {
      canvas.getByRole('button', { name: 'Chat actions' }).focus()
      await user.keyboard('{Enter}')
      const menu = await screen.findByRole('menu')
      await waitFor(() => expect(menu).toBeVisible()) // pops in from opacity 0
    })
    await step('Arrow to Delete and choose it', async () => {
      await user.keyboard('{ArrowUp}{Enter}')
      await expect(args.onAction).toHaveBeenCalledWith('delete', undefined)
      await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
    })
  },
}

/** Under 768px the same menu opens as a bottom sheet: taller rows, no shortcuts. Forced here with `sheet="always"`. */
export const AsSheet: Story = {
  ...RowActions,
  name: 'As a bottom sheet on phones',
  args: { sheet: 'always', sheetTitle: 'Consectetur adipiscing elit' },
  // Own iframe in docs so the sheet opens inside the preview box
  parameters: { docs: { story: { inline: false, height: '420px' } } },
}

/** Test for As a bottom sheet on phones: runs in Vitest and Run tests, hidden from the sidebar and docs so the story loads still. */
export const AsSheetTest: Story = {
  ...AsSheet,
  name: 'As a bottom sheet on phones (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ args, canvas, userEvent, step }) => {
    await step('Tap opens a sheet', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Chat actions' }))
      const menu = await screen.findByRole('menu')
      await expect(menu.closest('[data-sheet]')).not.toBeNull()
      const rename = within(menu).getByRole('menuitem', { name: /Rename/ })
      await expect(rename.getBoundingClientRect().height).toBeGreaterThanOrEqual(44)
      await expect(within(rename).queryByText('R')).not.toBeVisible()
    })
    await step('Choosing an item closes it', async () => {
      await userEvent.click(screen.getByRole('menuitem', { name: 'Pin' }))
      await expect(args.onAction).toHaveBeenCalledWith('pin', undefined)
      await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
    })
  },
}

const projects = ['Lorem', 'Ipsum', 'Ipsum dolor', 'Sit amet', 'Consectetur', 'Adipiscing', 'Elit', 'Tempor']

/**
 * Submenus open beside the item, on whichever side has room, and nest as deep as needed. *Move to
 * project* adds a search field and a footer button. On a phone each level stacks as a sheet with a back button.
 */
export const NestedWithSearch: Story = {
  name: 'Nested menus with search',
  render: (args) => (
    <MenuTrigger>
      <IconButton aria-label="Chat actions">
        <MoreHorizontal />
      </IconButton>
      <Menu {...args} sheetTitle="Consectetur adipiscing elit">
        <MenuItem id="rename" icon={<Pencil />}>Rename</MenuItem>
        <SubmenuTrigger>
          <MenuItem icon={<FolderInput />}>Move to project</MenuItem>
          <Menu
            onAction={args.onAction}
            searchable
            searchPlaceholder="Find a project"
            footer={
              <Button variant="ghost" size="sm" icon={<Plus />} className="-mx-2">
                New project
              </Button>
            }
          >
            {projects.map((p) => (
              <MenuItem key={p} id={`move:${p}`}>{p}</MenuItem>
            ))}
          </Menu>
        </SubmenuTrigger>
        <SubmenuTrigger>
          <MenuItem icon={<Download />}>Export</MenuItem>
          <Menu onAction={args.onAction}>
            <MenuItem id="markdown">Markdown</MenuItem>
            <MenuItem id="pdf">PDF</MenuItem>
            <SubmenuTrigger>
              <MenuItem>More formats</MenuItem>
              <Menu onAction={args.onAction}>
                <MenuItem id="json">JSON</MenuItem>
                <MenuItem id="html">HTML</MenuItem>
                <MenuItem id="txt">Plain text</MenuItem>
              </Menu>
            </SubmenuTrigger>
          </Menu>
        </SubmenuTrigger>
        <MenuSeparator />
        <MenuItem id="delete" icon={<Trash2 />} tone="danger">Delete</MenuItem>
      </Menu>
    </MenuTrigger>
  ),
}

/** Test for nested menus: side placement, three levels deep, and filtering. */
export const NestedWithSearchTest: Story = {
  ...NestedWithSearch,
  name: 'Nested menus with search (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ args, canvas, step }) => {
    const sideBySide = (a: Element, b: Element) => {
      const r1 = a.getBoundingClientRect()
      const r2 = b.getBoundingClientRect()
      return r2.left >= r1.right - 1 || r2.right <= r1.left + 1
    }
    await step('Export opens beside the menu, not over it', async () => {
      await user.click(canvas.getByRole('button', { name: 'Chat actions' }))
      const root = await screen.findByRole('menu', { name: 'Chat actions' })
      await user.hover(within(root).getByRole('menuitem', { name: /Export/ }))
      const exportMenu = await screen.findByRole('menu', { name: /Export/ })
      await waitFor(() => expect(sideBySide(root, exportMenu)).toBe(true))
      await user.hover(within(exportMenu).getByRole('menuitem', { name: /More formats/ }))
      const more = await screen.findByRole('menu', { name: /More formats/ })
      await user.click(within(more).getByRole('menuitem', { name: 'JSON' }))
      await expect(args.onAction).toHaveBeenCalledWith('json', undefined)
      await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
    })
    await step('Typing in Move to project filters the list', async () => {
      await user.click(canvas.getByRole('button', { name: 'Chat actions' }))
      const root = await screen.findByRole('menu', { name: 'Chat actions' })
      await user.hover(within(root).getByRole('menuitem', { name: /Move to project/ }))
      const search = await screen.findByRole('searchbox', { name: 'Find a project' })
      await user.click(search)
      await user.keyboard('ipsum')
      const list = screen.getByRole('menu', { name: /Move to project/ })
      await waitFor(() => expect(within(list).getAllByRole('menuitem')).toHaveLength(2))
      // The first match is highlighted as you type, so Enter picks it
      await user.keyboard('{Enter}')
      await expect(args.onAction).toHaveBeenCalledWith('move:Ipsum', undefined)
    })
  },
}

/** Any component can sit in the header or footer: here a search field and a Switch, outside the item list. */
export const SearchAndSwitch: Story = {
  name: 'Search and a switch in the menu',
  render: (args) => (
    <MenuTrigger>
      <Button variant="ghost" icon={<ChevronDown />}>Opus 5.5</Button>
      <Menu
        {...args}
        sheetTitle="Model"
        searchable
        searchPlaceholder="Search models"
        selectionMode="single"
        defaultSelectedKeys={['claude-opus-5-5']}
        footer={<Switch defaultSelected>Extended thinking</Switch>}
      >
        {models.map((m) => (
          <MenuItem key={m.id} id={m.id} description={m.description}>{m.label}</MenuItem>
        ))}
      </Menu>
    </MenuTrigger>
  ),
}
