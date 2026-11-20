import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Button } from '../Button/Button'
import { ShimmerText, Skeleton, Spinner } from './Loading'

const meta = {
  title: 'Components/Feedback/Loading',
  component: Spinner,
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  parameters: {
    docs: {
      description: {
        component:
          '`Spinner` for short waits, `Skeleton` to hold the shape of content that is still loading, `ShimmerText` for ' +
          'named work in progress ("Thinking"). Skeletons shimmer; ' +
          'pass `animation="pulse"` for a fade instead. Under reduced motion both fade in place.',
      },
    },
  },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { args: { size: 'md' } }

/** Named work in progress, like an assistant thinking or a tool running. Takes the size of the text around it. */
export const Shimmer: Story = {
  render: () => (
    <div className="flex flex-col gap-3 text-ui">
      <ShimmerText>Thinking</ShimmerText>
      <ShimmerText>Searching 12 sources</ShimmerText>
      <ShimmerText className="font-serif text-lg">Writing the report</ShimmerText>
    </div>
  ),
}

/** Test for ShimmerText: hidden from the sidebar and docs. Tests run with reduced motion, so it pulses. */
export const ShimmerTest: Story = {
  ...Shimmer,
  name: 'Shimmer (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas }) => {
    const text = canvas.getByText('Thinking')
    await expect(getComputedStyle(text).animationName).toBe('pulse')
    // The colour comes from the clipped gradient, so the text itself is transparent
    await expect(getComputedStyle(text).backgroundClip).toBe('text')
  },
}

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
