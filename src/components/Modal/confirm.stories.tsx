import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, screen, waitFor, within } from 'storybook/test'
import { useState } from 'react'
import { Button } from '../Button/Button'
import { confirm, ConfirmHost } from './confirm'

function Demo() {
  const [answer, setAnswer] = useState('Not asked yet')
  return (
    <div className="flex items-center gap-3 text-ui">
      <ConfirmHost />
      <Button
        variant="danger"
        onPress={async () => {
          const ok = await confirm({ title: 'Delete chat?', description: 'This can’t be undone.', confirmLabel: 'Delete chat', destructive: true })
          setAnswer(ok ? 'Confirmed' : 'Cancelled')
        }}
      >
        Delete chat
      </Button>
      <span>{answer}</span>
    </div>
  )
}

const meta = {
  title: 'Components/Overlays/confirm()',
  parameters: {
    docs: {
      story: { inline: false, height: '360px' },
      description: {
        component:
          'Ask for confirmation from anywhere: mount `<ConfirmHost />` once, then `await confirm({ title, confirmLabel })`. ' +
          'It resolves `true` or `false`. Use `ConfirmModal` directly when the dialog belongs to one trigger.',
      },
    },
  },
  render: () => <Demo />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Main: Story = { name: 'confirm()' }

/** Test for confirm(): hidden from the sidebar and docs. */
export const MainTest: Story = {
  ...Main,
  name: 'confirm() (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, userEvent, step }) => {
    const open = async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Delete chat' }))
      return screen.findByRole('alertdialog', { name: 'Delete chat?' })
    }
    await step('Cancel resolves false', async () => {
      const dialog = await open()
      await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
      await expect(await canvas.findByText('Cancelled')).toBeVisible()
      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    })
    await step('Confirm resolves true', async () => {
      const dialog = await open()
      await userEvent.click(within(dialog).getByRole('button', { name: 'Delete chat' }))
      await expect(await canvas.findByText('Confirmed')).toBeVisible()
      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    })
  },
}
