import type { Meta, StoryObj } from '@storybook/react-vite'
import { Plus, Settings, Trash2 } from 'lucide-react'
import { expect, fn } from 'storybook/test'
import { Button, IconButton } from './Button'

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
          'Use `buttonClass()` to style a link like a button.',
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
