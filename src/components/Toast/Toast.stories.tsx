import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, screen, waitFor, within } from 'storybook/test'
import { Button } from '../Button/Button'
import { toast, Toaster } from './Toast'

const meta = {
  title: 'Components/Feedback/Toast',
  parameters: {
    docs: {
      description: {
        component:
          'Brief, temporary messages. Mount `<Toaster />` once, then call `toast(title, options)` from anywhere. ' +
          'Bottom right on desktop, full width at the bottom on phones. Danger toasts with an action, and toasts with `timeout: null`, stay until dismissed.',
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Toaster />
      <Button onPress={() => toast('Chat renamed')}>Neutral</Button>
      <Button onPress={() => toast('Settings saved', { tone: 'success', description: 'Changes apply to new chats.' })}>
        Success
      </Button>
      <Button onPress={() => toast('Could not send message', { tone: 'danger', description: 'Check your connection.' })}>
        Error
      </Button>
      <Button
        onPress={() =>
          toast('Chat archived', { action: { label: 'Undo', onPress: () => toast('Restored', { tone: 'success' }) } })
        }
      >
        With action
      </Button>
      <Button
        onPress={() =>
          toast('Upload failed', { tone: 'danger', action: { label: 'Retry', onPress: () => {} } })
        }
      >
        Sticky error
      </Button>
      <Button onPress={() => toast('Submitting…', { timeout: null })}>Stays until closed</Button>
    </div>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Main: Story = {}

export const MainTest: Story = {
  ...Main,
  name: 'Toast (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Success' }))
    const el = await screen.findByRole('alertdialog')
    await waitFor(() => expect(el).toBeVisible())
    await expect(within(el).getByText('Settings saved')).toBeVisible()
    await userEvent.click(within(el).getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  },
}
