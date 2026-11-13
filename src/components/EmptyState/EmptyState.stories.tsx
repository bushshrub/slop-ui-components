import type { Meta, StoryObj } from '@storybook/react-vite'
import { MessageSquare, SearchX } from 'lucide-react'
import { Button } from '../Button/Button'
import { EmptyState } from './EmptyState'

const meta = {
  title: 'Components/Feedback/Empty state',
  component: EmptyState,
  args: {
    icon: <MessageSquare />,
    title: 'No chats yet',
    description: 'Start a conversation and it will show up here.',
    actions: <Button variant="primary">New chat</Button>,
  },
  argTypes: { size: { control: 'inline-radio', options: ['default', 'compact'] } },
  parameters: {
    docs: {
      description: {
        component: 'Placeholder for a view with nothing to show. `compact` is for use inside a table, list or menu.',
      },
    },
  },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const NoChats: Story = {}

export const NoResults: Story = {
  args: {
    size: 'compact',
    icon: <SearchX />,
    title: 'No results',
    description: 'Nothing matches "invoice". Try a different search.',
    actions: <Button size="sm">Clear search</Button>,
  },
}

/** Compact inside a bordered box, as in an empty table. */
export const InTable: Story = {
  args: NoResults.args,
  render: (args) => (
    <div className="w-[36rem] max-w-full overflow-hidden rounded-lg border border-border bg-popover">
      <div className="flex border-b border-divider px-4 py-2 text-ui-sm font-medium text-subtle">
        <span className="flex-1">Name</span>
        <span className="w-24">Updated</span>
      </div>
      <EmptyState {...args} />
    </div>
  ),
}
