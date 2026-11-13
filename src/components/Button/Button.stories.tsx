import type { Meta, StoryObj } from '@storybook/react-vite'
import { ExternalLink, Plus, Save, Settings, Trash2 } from 'lucide-react'
import { expect, fn, screen, waitFor } from 'storybook/test'
import { Button, IconButton, LinkButton } from './Button'

const meta = {
  title: 'Components/Actions/Button',
  component: Button,
  args: { children: 'New chat', onPress: fn() },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'outline', 'ghost', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    icon: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Primary is ink-colored, not accent-colored: use it once per view. Secondary is the default. ' +
          '`LinkButton` is the same look for actions that navigate. `IconButton` shows its `aria-label` as a tooltip.',
      },
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { variant: 'primary', size: 'md' },
  play: async ({ args, canvas, userEvent, step }) => {
    await step('Clicking fires onPress', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'New chat' }))
      await expect(args.onPress).toHaveBeenCalledOnce()
    })
  },
}

/** Every variant and size together, for visual review. */
export const Gallery: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex items-center gap-2">
          <Button size={size} variant="primary">Save</Button>
          <Button size={size} variant="secondary">Cancel</Button>
          <Button size={size} variant="outline" icon={<Plus />}>Add key</Button>
          <Button size={size} variant="ghost">Skip</Button>
          <Button size={size} variant="danger" icon={<Trash2 />}>Delete</Button>
          <IconButton size={size} aria-label="Settings"><Settings /></IconButton>
          <Button size={size} isDisabled>Disabled</Button>
        </div>
      ))}
    </div>
  ),
}

/** A disabled button ignores presses and stays focusable only when told to. */
export const UnavailableAction: Story = {
  name: 'Action not available yet',
  args: { isDisabled: true, children: 'Deploy' },
  play: async ({ args, canvas, userEvent, step }) => {
    await step('Clicking a disabled button does nothing', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Deploy' }))
      await expect(args.onPress).not.toHaveBeenCalled()
    })
  },
}

/** While pending, a spinner replaces the icon and presses are ignored; the button keeps focus. */
export const Pending: Story = {
  args: { isPending: true, variant: 'primary', icon: <Save />, children: 'Save' },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Button {...args} />
      <Button isPending>Loading more</Button>
      <IconButton isPending variant="outline" aria-label="Refresh"><Settings /></IconButton>
    </div>
  ),
  play: async ({ args, canvas, userEvent, step }) => {
    const save = canvas.getByRole('button', { name: /Save/ })
    await step('The spinner is part of the button', async () => {
      await expect(save.querySelector('[role="status"]')).toBeInTheDocument()
      await expect(canvas.getByRole('button', { name: /Refresh/ })).toHaveAccessibleName('Refresh Loading')
    })
    await step('Pressing does nothing, focus still works', async () => {
      await userEvent.click(save)
      await expect(args.onPress).not.toHaveBeenCalled()
      save.focus()
      await expect(save).toHaveFocus()
    })
  },
}

/** A link with the button look, for actions that navigate. */
export const Links: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <LinkButton href="#pricing" variant="primary">See pricing</LinkButton>
      <LinkButton href="https://example.com" target="_blank" rel="noreferrer" variant="outline" icon={<ExternalLink />}>Docs</LinkButton>
      <LinkButton href="#billing" isDisabled>Billing</LinkButton>
    </div>
  ),
  play: async ({ canvas }) => {
    const docs = canvas.getByRole('link', { name: 'Docs' })
    await expect(docs).toHaveAttribute('href', 'https://example.com')
    await expect(docs).toHaveAttribute('target', '_blank')
  },
}

/** An icon button names itself in a tooltip. `tooltip` changes the text or turns it off. */
export const IconButtonTooltip: Story = {
  name: 'Icon button tooltip',
  render: () => (
    <div className="flex items-center gap-2 p-12">
      <IconButton aria-label="Settings" shortcut="Ctrl+,"><Settings /></IconButton>
      <IconButton aria-label="Delete" tooltip="Delete this chat"><Trash2 /></IconButton>
      <IconButton aria-label="Add" tooltip={false}><Plus /></IconButton>
    </div>
  ),
  play: async ({ canvas, userEvent, step }) => {
    await step('Keyboard focus shows the aria-label and shortcut', async () => {
      await userEvent.tab()
      await expect(canvas.getByRole('button', { name: 'Settings' })).toHaveFocus()
      await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent('SettingsCtrl+,'))
    })
    await step('`tooltip` overrides the text', async () => {
      await userEvent.tab()
      await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent('Delete this chat'))
    })
    await step('`tooltip={false}` shows none', async () => {
      await userEvent.tab()
      await expect(canvas.getByRole('button', { name: 'Add' })).toHaveFocus()
      await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument())
    })
  },
}
