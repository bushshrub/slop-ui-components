import type { Meta, StoryObj } from '@storybook/react-vite'
import { Clock, HardDrive, MessageSquare } from 'lucide-react'
import { expect } from 'storybook/test'
import { MetaItem, MetaRow } from './MetaRow'

const meta = {
  title: 'Components/Data display/MetaRow',
  component: MetaRow,
  parameters: {
    docs: {
      description: {
        component:
          'Short facts about one thing, e.g. under a card or list title. Use it instead of joining text with a ' +
          'separator glyph: items are spaced, wrap whole, and can carry an icon. Give `label` when the icon alone ' +
          'says what a value is.',
      },
    },
  },
  args: { children: null },
  render: () => (
    <MetaRow>
      <MetaItem icon={<MessageSquare />}>12 chats</MetaItem>
      <MetaItem icon={<Clock />}>Updated 2d ago</MetaItem>
      <MetaItem icon={<HardDrive />} label="Storage used">
        1.2 GB
      </MetaItem>
    </MetaRow>
  ),
} satisfies Meta<typeof MetaRow>

export default meta
type Story = StoryObj<typeof meta>

export const Main: Story = { name: 'MetaRow' }

/** Plain text items, no icons. */
export const TextOnly: Story = {
  render: () => (
    <MetaRow>
      <MetaItem>4 members</MetaItem>
      <MetaItem>Created 12 March</MetaItem>
    </MetaRow>
  ),
}

/** Test for MetaRow: hidden from the sidebar and docs. */
export const MainTest: Story = {
  ...Main,
  name: 'MetaRow (test)',
  tags: ['!dev', '!autodocs'],
  decorators: [(Story) => <div className="w-32">{Story()}</div>],
  play: async ({ canvas }) => {
    // The label is read before the value; icons are hidden from screen readers
    await expect(canvas.getByText('1.2 GB').closest('[title]')).toHaveTextContent('Storage used: 1.2 GB')
    // Items wrap whole: each stays on one line in a narrow box
    const item = canvas.getByText('Updated 2d ago')
    await expect(item.getBoundingClientRect().height).toBeLessThan(24)
  },
}
