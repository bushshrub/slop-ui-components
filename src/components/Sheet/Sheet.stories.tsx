import type { Meta, StoryObj } from '@storybook/react-vite'
import { SlidersHorizontal } from 'lucide-react'
import { DialogTrigger } from 'react-aria-components'
import { expect, screen, waitFor, within } from 'storybook/test'
import { Button } from '../Button/Button'
import { Checkbox } from '../Inputs/Checkbox'
import { SegmentedControl } from '../Inputs/SegmentedControl'
import { Sheet } from './Sheet'

const meta = {
  title: 'Components/Overlays/Sheet',
  component: Sheet,
  args: {
    title: 'Filter chats',
    description: 'Applies to the list in the sidebar.',
  },
  parameters: {
    docs: {
      // Own iframe so the overlay opens inside the preview box, not over the docs page
      story: { inline: false, height: '520px' },
      description: {
        component:
          'Panel that slides up from the bottom, for choices and short forms on a phone. Tap outside, ' +
          'press Esc or drag the handle down to close. `Menu` and `Select` already open as sheets under ' +
          '768px (`sheet="auto"`), so reach for `Sheet` only for custom content.',
      },
    },
  },
  render: (args) => (
    <DialogTrigger>
      <Button>
        <SlidersHorizontal /> Filters
      </Button>
      <Sheet
        {...args}
        footer={(close) => (
          <>
            <Button onPress={close}>Reset</Button>
            <Button variant="primary" onPress={close}>Show 24 chats</Button>
          </>
        )}
      >
        <SegmentedControl
          label="Sort by"
          defaultValue="recent"
          options={[
            { id: 'recent', label: 'Recent' },
            { id: 'oldest', label: 'Oldest' },
            { id: 'name', label: 'Name' },
          ]}
        />
        <div className="flex flex-col gap-3">
          <Checkbox defaultSelected>Pinned first</Checkbox>
          <Checkbox>Only chats with files</Checkbox>
          <Checkbox>Include archived</Checkbox>
        </div>
      </Sheet>
    </DialogTrigger>
  ),
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

export const Filters: Story = {
  name: 'Filters on a phone',
}

/** Test for Filters on a phone: runs in Vitest and Run tests, hidden from the sidebar and docs so the story loads still. */
export const FiltersTest: Story = {
  ...Filters,
  name: 'Filters on a phone (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, userEvent, step }) => {
    await step('Open it', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Filters' }))
      const dialog = await screen.findByRole('dialog', { name: 'Filter chats' })
      // The backdrop fades in from opacity 0, so wait it out rather than check mid-animation.
      await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Show 24 chats' })).toBeVisible())
    })
    await step('Esc closes it and focus returns to the trigger', async () => {
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
      await expect(canvas.getByRole('button', { name: 'Filters' })).toHaveFocus()
    })
  },
}
