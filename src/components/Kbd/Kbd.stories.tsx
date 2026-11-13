import type { Meta, StoryObj } from '@storybook/react-vite'
import { Kbd } from './Kbd'

const meta = {
  title: 'Components/Data display/Kbd',
  component: Kbd,
  args: { children: '⌘K' },
  parameters: {
    docs: {
      description: { component: 'Keyboard key hint, for shortcuts in text, menus and tooltips.' },
    },
  },
} satisfies Meta<typeof Kbd>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Inline in a sentence, as separate caps, and trailing a menu label. */
export const InContext: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-4 text-ui text-fg">
      <p>
        Press <Kbd>⌘K</Kbd> to search, or <Kbd keys={['⌘', 'Shift', 'P']} /> for commands.
      </p>
      <div className="rounded-lg border border-border bg-popover p-1">
        {[
          ['New chat', ['⌘', 'N']],
          ['Search chats', ['⌘', 'K']],
          ['Settings', ['⌘', ',']],
        ].map(([label, keys]) => (
          <div key={label as string} className="flex min-h-row items-center justify-between rounded-sm px-2.5">
            <span>{label}</span>
            <Kbd keys={keys as string[]} />
          </div>
        ))}
      </div>
    </div>
  ),
}
