import { useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FolderOpen, MessageSquarePlus, Plus, Settings, SunMoon } from 'lucide-react'
import { expect, fn, screen, waitFor, within } from 'storybook/test'
import { Button } from '../Button/Button'
import { Kbd } from '../Kbd/Kbd'
import { CommandItem, CommandPalette, CommandSection, useCommandPaletteShortcut, type CommandPaletteProps } from './CommandPalette'

const meta = {
  title: 'Components/Overlays/CommandPalette',
  component: CommandPalette,
  args: {
    onAction: fn(),
    placeholder: 'Type a command or search…',
    closeOnAction: true,
  },
  argTypes: {
    closeOnAction: { control: 'boolean' },
    footer: { control: false },
    items: { control: false },
    children: { control: false },
    onAction: { control: false },
  },
  parameters: {
    docs: {
      // Own iframe so the overlay opens inside the preview box, not over the docs page
      story: { inline: false, height: '480px' },
      description: {
        component:
          'Command dialog opened from a button or ⌘K. Type to filter; Enter runs the first match, arrows move, Esc closes. ' +
          'Build the list from `CommandSection` and `CommandItem`, or pass `items` with a render function. ' +
          'Use `useCommandPaletteShortcut` to open it from ⌘K / Ctrl+K.',
      },
    },
  },
  render: (args) => <PaletteDemo {...args}>{basicCommands}</PaletteDemo>,
} satisfies Meta<typeof CommandPalette>

export default meta
type Story = StoryObj<typeof meta>

/** A button and ⌘K both open the palette. Keeps its own open state, so the args only configure it. */
function PaletteDemo({ children, ...args }: CommandPaletteProps) {
  const [isOpen, setOpen] = useState(false)
  useCommandPaletteShortcut(() => setOpen((open) => !open))
  return (
    <>
      <Button onPress={() => setOpen(true)}>
        Open command palette <Kbd keys={['⌘', 'K']} />
      </Button>
      <CommandPalette {...args} isOpen={isOpen} onOpenChange={setOpen}>
        {children}
      </CommandPalette>
    </>
  )
}

const hint: ReactNode = (
  <>
    <span className="flex items-center gap-1">
      <Kbd>↑↓</Kbd> to navigate
    </span>
    <span className="flex items-center gap-1">
      <Kbd>↵</Kbd> to run
    </span>
    <span className="flex items-center gap-1">
      <Kbd>esc</Kbd> to close
    </span>
  </>
)

const basicCommands = (
  <>
    <CommandItem id="new-chat" icon={<Plus />}>
      New chat
    </CommandItem>
    <CommandItem id="settings" icon={<Settings />} keywords={['preferences', 'config']}>
      Open settings
    </CommandItem>
    <CommandItem id="toggle-theme" icon={<SunMoon />} keywords={['dark mode', 'light mode', 'appearance']}>
      Toggle theme
    </CommandItem>
    <CommandItem id="projects" icon={<FolderOpen />}>
      Go to Projects
    </CommandItem>
  </>
)

export const Playground: Story = {
  render: (args) => (
    <PaletteDemo {...args} footer={hint}>
      {basicCommands}
    </PaletteDemo>
  ),
}

/** Test for Playground: runs in Vitest and Run tests, hidden from the sidebar and docs so the story loads still. */
export const PlaygroundTest: Story = {
  ...Playground,
  name: 'Playground (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ args, canvas, userEvent, step }) => {
    await step('Button opens the palette and focuses the search', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /Open command palette/ }))
      const dialog = await screen.findByRole('dialog', { name: 'Command palette' })
      await waitFor(() => expect(within(dialog).getByRole('searchbox')).toHaveFocus())
    })
    await step('Typing narrows the list to the matching command, Enter runs it and closes', async () => {
      await userEvent.keyboard('sett')
      const dialog = screen.getByRole('dialog', { name: 'Command palette' })
      await waitFor(() => expect(within(dialog).getAllByRole('menuitem')).toHaveLength(1))
      await expect(within(dialog).getByRole('menuitem', { name: 'Open settings' })).toBeVisible()
      await userEvent.keyboard('{Enter}')
      await expect(args.onAction).toHaveBeenCalledWith('settings')
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    })
    await step('⌘K opens it again, Esc closes it', async () => {
      await userEvent.keyboard('{Meta>}k{/Meta}')
      await screen.findByRole('dialog', { name: 'Command palette' })
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    })
  },
}

export const WithSections: Story = {
  render: (args) => (
    <PaletteDemo {...args}>
      <CommandSection title="Chats">
        <CommandItem id="new-chat" icon={<MessageSquarePlus />}>
          New chat
        </CommandItem>
      </CommandSection>
      <CommandSection title="Go to">
        <CommandItem id="projects" icon={<FolderOpen />}>
          Go to Projects
        </CommandItem>
        <CommandItem id="settings" icon={<Settings />} keywords={['preferences', 'config']}>
          Open settings
        </CommandItem>
      </CommandSection>
      <CommandSection title="Appearance">
        <CommandItem id="toggle-theme" icon={<SunMoon />} keywords={['dark mode', 'light mode']}>
          Toggle theme
        </CommandItem>
      </CommandSection>
    </PaletteDemo>
  ),
}

export const WithShortcutsAndDescriptions: Story = {
  render: (args) => (
    <PaletteDemo {...args} footer={hint}>
      <CommandItem id="new-chat" icon={<Plus />} shortcut="⌘N" description="Starts an empty conversation">
        New chat
      </CommandItem>
      <CommandItem id="settings" icon={<Settings />} shortcut="⌘," description="Account, models and privacy">
        Open settings
      </CommandItem>
      <CommandItem id="toggle-theme" icon={<SunMoon />} shortcut="⇧⌘L" description="Switches between light and dark">
        Toggle theme
      </CommandItem>
    </PaletteDemo>
  ),
}

export const Empty: Story = {
  play: async ({ canvas, userEvent, step }) => {
    await step('A query with no matches shows the empty message', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /Open command palette/ }))
      const dialog = await screen.findByRole('dialog', { name: 'Command palette' })
      await userEvent.keyboard('zzz')
      await waitFor(() => expect(within(dialog).queryByRole('menuitem', { name: 'New chat' })).not.toBeInTheDocument())
      await expect(within(dialog).getByText('No matching commands')).toBeVisible()
    })
  },
}
