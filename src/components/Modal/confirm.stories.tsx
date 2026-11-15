import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, screen, waitFor, within } from 'storybook/test'
import { useState } from 'react'
import { Button } from '../Button/Button'
import { alert, confirm, ConfirmHost } from './confirm'

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

/** `alert()` shows a message with a single button and resolves when it is closed. */
export const Alert: Story = {
  render: () => (
    <div className="flex items-center gap-3 text-ui">
      <ConfirmHost />
      <Button onPress={() => alert({ title: 'This chat can’t be shared', description: 'It contains a private attachment.' })}>
        Share chat
      </Button>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Share chat' }))
    const dialog = await screen.findByRole('dialog')
    await waitFor(() => expect(dialog).toBeVisible())
    await expect(within(dialog).queryByRole('button', { name: 'Cancel' })).toBeNull()
    await userEvent.click(within(dialog).getByRole('button', { name: 'OK' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  },
}

/** A destructive confirm opens with Cancel focused, so Enter cancels. `cancelLabel`, `autoFocus` and `media` are options. */
export const FocusAndMedia: Story = {
  name: 'Focus, cancel label and media',
  render: () => {
    const Inner = () => {
      const [answer, setAnswer] = useState('Not asked yet')
      return (
        <div className="flex items-center gap-3 text-ui">
          <ConfirmHost />
          <Button
            variant="danger"
            onPress={async () => {
              const ok = await confirm({
                title: 'Delete deployment?',
                description: 'This can’t be undone.',
                confirmLabel: 'Delete deployment',
                cancelLabel: 'Keep it',
                destructive: true,
                media: <div role="img" aria-label="Deployment preview" className="h-24 bg-selected" />,
              })
              setAnswer(ok ? 'Confirmed' : 'Cancelled')
            }}
          >
            Delete deployment
          </Button>
          <span>{answer}</span>
        </div>
      )
    }
    return <Inner />
  },
  play: async ({ canvas, userEvent, step }) => {
    await step('Enter on the focused Cancel does not confirm', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Delete deployment' }))
      const dialog = await screen.findByRole('alertdialog', { name: 'Delete deployment?' })
      await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Keep it' })).toHaveFocus())
      await expect(within(dialog).getByRole('img', { name: 'Deployment preview' })).toBeInTheDocument()
      await userEvent.keyboard('{Enter}')
      await expect(await canvas.findByText('Cancelled')).toBeVisible()
      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    })
  },
}

/** `autoFocus: 'confirm'` puts focus on the confirming button, for a safe, frequent action. */
export const ConfirmFocused: Story = {
  render: () => (
    <div className="flex items-center gap-3 text-ui">
      <ConfirmHost />
      <Button onPress={() => confirm({ title: 'Publish changes?', confirmLabel: 'Publish', autoFocus: 'confirm' })}>Publish</Button>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Publish' }))
    const dialog = await screen.findByRole('dialog', { name: 'Publish changes?' })
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Publish' })).toHaveFocus())
  },
}
