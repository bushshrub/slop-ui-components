import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, screen, waitFor, within } from 'storybook/test'
import { ShareChat } from './ShareChat'

const meta = {
  title: 'Examples/Share chat',
  component: ShareChat,
  parameters: {
    docs: {
      description: {
        component:
          'A share popover built from Popover, TextField, Button and RadioCards. Pressing the access row drills into ' +
          'a sub-view in place; picking an option returns and updates the row.',
      },
    },
  },
  render: (args) => (
    <div className="flex h-[32rem] w-[40rem] max-w-full justify-end">
      <ShareChat {...args} />
    </div>
  ),
} satisfies Meta<typeof ShareChat>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Test for Default: open, drill in, pick Anyone with the link, back shows the new label. */
export const DefaultTest: Story = {
  ...Default,
  name: 'Default (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Share' }))
    const dialog = await screen.findByRole('dialog', { name: 'Share chat' })
    await waitFor(() => expect(dialog).toBeVisible())
    await expect(within(dialog).getByRole('button', { name: 'Invite' })).toBeDisabled()
    await userEvent.click(within(dialog).getByRole('button', { name: 'Only people invited' }))
    await userEvent.click(await within(dialog).findByRole('radio', { name: /Anyone with the link/ }))
    await expect(await within(dialog).findByRole('button', { name: 'Anyone with the link' })).toBeVisible()
  },
}
