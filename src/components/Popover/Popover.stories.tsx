import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, screen, waitFor } from 'storybook/test'
import { ChevronRight } from 'lucide-react'
import { Button } from '../Button/Button'
import { Popover, PopoverTrigger, usePopoverView } from './Popover'

function Advanced() {
  const { push } = usePopoverView()
  return (
    <div className="flex flex-col gap-3 text-ui text-muted">
      <p>Pick how long this chat is kept.</p>
      <Button
        className="justify-between"
        onPress={() => push({ title: 'Retention', content: <p className="text-ui text-muted">Chats are kept for 30 days by default.</p> })}
      >
        Retention <ChevronRight />
      </Button>
    </div>
  )
}

const meta = {
  title: 'Components/Overlays/Popover',
  component: Popover,
  args: { title: 'Chat details', showClose: true, children: null },
  argTypes: { placement: { control: 'select', options: ['bottom end', 'bottom start', 'top end', 'right top'] } },
  parameters: {
    docs: {
      description: {
        component:
          'Non-modal panel anchored to a trigger, for content that is not a list of actions. Call `usePopoverView()` ' +
          'inside to swap the panel content in place; the header then shows a back arrow.',
      },
    },
  },
  render: (args) => (
    <PopoverTrigger>
      <Button>Details</Button>
      <Popover {...args}>
        <Advanced />
      </Popover>
    </PopoverTrigger>
  ),
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Test for Playground: open, drill in, go back, close. */
export const PlaygroundTest: Story = {
  ...Playground,
  name: 'Playground (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Details' }))
    await waitFor(() => expect(screen.getByRole('dialog', { name: 'Chat details' })).toBeVisible())
    await userEvent.click(screen.getByRole('button', { name: /Retention/ }))
    await expect(await screen.findByText('Chats are kept for 30 days by default.')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    await expect(await screen.findByText('Pick how long this chat is kept.')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  },
}
