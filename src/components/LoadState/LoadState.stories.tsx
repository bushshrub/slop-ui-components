import type { Meta, StoryObj } from '@storybook/react-vite'
import { Server } from 'lucide-react'
import { expect, fn } from 'storybook/test'
import { Button } from '../Button/Button'
import { Skeleton } from '../Loading/Loading'
import { LoadState } from './LoadState'

const meta = {
  title: 'Components/Feedback/LoadState',
  component: LoadState,
  parameters: {
    docs: {
      description: {
        component:
          'Stands where data will be: a spinner while `loading`, a message when `empty`, an error with Retry on ' +
          '`error`, and its children once `ready`. Switch `status` in the controls to see each. `size` fits it to a ' +
          'page, a card (`compact`) or a single line (`inline`).',
      },
    },
  },
  args: {
    status: 'loading',
    emptyIcon: <Server />,
    emptyTitle: 'No servers yet',
    emptyDescription: 'Servers you create show up here.',
    emptyActions: <Button variant="primary">Create server</Button>,
    errorDescription: 'The server did not answer. Check your connection and try again.',
    onRetry: fn(),
    children: <p className="m-0 text-ui">Lorem, Ipsum and Dolor are running.</p>,
  },
  argTypes: { status: { control: 'inline-radio', options: ['loading', 'empty', 'error', 'ready'] } },
  render: (args) => (
    <div className="w-[28rem] max-w-full rounded-md border border-border">
      <LoadState {...args} />
    </div>
  ),
} satisfies Meta<typeof LoadState>

export default meta
type Story = StoryObj<typeof meta>

export const Loading: Story = {}
export const Empty: Story = { args: { status: 'empty' } }
export const Error: Story = { args: { status: 'error' } }
export const Ready: Story = { args: { status: 'ready' } }

/** `skeleton`: shimmering placeholders instead of the spinner, for content whose shape you know. */
export const LoadingSkeleton: Story = {
  args: {
    skeleton: (
      <div className="flex flex-col gap-4 p-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton circle className="size-8" />
            <Skeleton lines={2} className="flex-1" />
          </div>
        ))}
      </div>
    ),
  },
}

/** One line, for a section of a list or a panel. */
export const Inline: Story = {
  args: { size: 'inline', status: 'error', errorTitle: "Couldn't load members" },
  render: (args) => (
    <div className="w-[28rem] max-w-full px-3">
      <LoadState {...args} />
    </div>
  ),
}

/** Test for LoadState: hidden from the sidebar and docs. */
export const ErrorTest: Story = {
  ...Error,
  name: 'Error (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ args, canvas, userEvent }) => {
    const alert = canvas.getByRole('alert')
    await expect(alert).toHaveTextContent("Couldn't load this")
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }))
    await expect(args.onRetry).toHaveBeenCalledOnce()
    await expect(canvas.queryByText(/are running/)).toBeNull()
  },
}

/** Test for the skeleton: hidden from the sidebar and docs. Tests run with reduced motion, so it pulses. */
export const LoadingSkeletonTest: Story = {
  ...LoadingSkeleton,
  name: 'Loading skeleton (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('Loading')
    const block = canvasElement.querySelector<HTMLElement>('[aria-hidden] div, [aria-hidden].rounded-full')!
    await expect(getComputedStyle(block).animationName).toBe('pulse')
  },
}

/** Test for LoadState: hidden from the sidebar and docs. */
export const LoadingAndReadyTest: Story = {
  ...Loading,
  name: 'Loading and ready (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('Loading')
  },
}
