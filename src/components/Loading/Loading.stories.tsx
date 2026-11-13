import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Button } from '../Button/Button'
import { Skeleton, Spinner } from './Loading'

const meta = {
  title: 'Components/Feedback/Loading',
  component: Spinner,
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  parameters: {
    docs: {
      description: {
        component: '`Spinner` for short waits, `Skeleton` to hold the shape of content that is still loading.',
      },
    },
  },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { args: { size: 'md' } }

/** Compose a Spinner into a disabled Button while saving. */
export const InButton: Story = {
  render: () => (
    <Button isDisabled>
      <Spinner size="sm" /> Saving
    </Button>
  ),
}

/** Placeholder for a chat list: avatar plus two lines per row. */
export const SkeletonChatList: Story = {
  render: () => (
    <div className="flex w-80 max-w-full flex-col gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton circle />
          <div className="flex-1">
            <Skeleton lines={2} />
          </div>
        </div>
      ))}
      <Skeleton className="h-24 w-full" />
    </div>
  ),
}

export const SpinnerTest: Story = {
  name: 'Spinner (test)',
  tags: ['!dev', '!autodocs'],
  render: () => <Spinner />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status', { name: 'Loading' })).toBeVisible()
  },
}
