import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, screen, waitFor, within } from 'storybook/test'
import { Button } from '../components/Button/Button'
import { DialogTrigger } from '../components/Modal/Modal'
import { SettingsDialog } from './SettingsDialog'

const meta = {
  title: 'Examples/Settings dialog',
  parameters: {
    docs: {
      description: {
        component:
          'Example composition, not a library export: Modal (`flush`) with side Tabs, settings rows, quiet Selects, ' +
          'Switches and a destructive confirm. On phones it fills the screen and the tabs become a strip. ' +
          'Source: `src/examples/SettingsDialog.tsx`.',
      },
      story: { inline: false, height: '640px' },
    },
  },
  render: () => (
    <DialogTrigger>
      <Button>Settings</Button>
      <SettingsDialog />
    </DialogTrigger>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: 'Settings dialog' }

/** Test for Settings dialog: runs in Vitest and Run tests, hidden from the sidebar and docs so the story loads still. */
export const DefaultTest: Story = {
  ...Default,
  name: 'Settings dialog (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, userEvent, step }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Settings' }))
    const dialog = await screen.findByRole('dialog', { name: 'Settings' })
    await waitFor(() => expect(dialog).toBeVisible()) // pops in from opacity 0
    await step('Opens on General', async () => {
      await expect(within(dialog).getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'true')
      await expect(within(dialog).getByRole('textbox', { name: /call you/ })).toBeVisible()
    })
    await step('Arrow keys move to the next section and show its panel', async () => {
      within(dialog).getByRole('tab', { name: 'General' }).focus()
      await userEvent.keyboard('{ArrowDown}')
      await expect(within(dialog).getByRole('tab', { name: 'Appearance' })).toHaveAttribute('aria-selected', 'true')
      await expect(within(dialog).getByRole('radiogroup', { name: 'Theme' })).toBeVisible()
    })
    await step('A switch row toggles from its label', async () => {
      await userEvent.click(within(dialog).getByRole('tab', { name: 'Privacy' }))
      const train = within(dialog).getByRole('switch', { name: /Help improve the models/ })
      await expect(train).not.toBeChecked()
      await userEvent.click(within(dialog).getByText('Help improve the models'))
      await expect(train).toBeChecked()
    })
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  },
}
