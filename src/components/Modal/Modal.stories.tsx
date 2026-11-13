import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, screen, waitFor, within } from 'storybook/test'
import { Button } from '../Button/Button'
import { TextField } from '../Inputs/TextField'
import { ConfirmModal, DialogTrigger, Modal } from './Modal'

const meta = {
  title: 'Components/Overlays/Modal',
  component: Modal,
  args: {
    title: 'Rename chat',
    description: 'Only you see chat titles.',
    size: 'md',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
    role: { control: 'inline-radio', options: ['dialog', 'alertdialog'] },
    footer: { control: false },
  },
  parameters: {
    docs: {
      // Own iframe so the overlay opens inside the preview box, not over the docs page
      story: { inline: false, height: '480px' },
      description: {
        component:
          'Centered dialog. Focus is trapped and returned to the trigger on close. ' +
          '`ConfirmModal` covers the common Cancel / Confirm case.',
      },
    },
  },
  render: (args) => (
    <DialogTrigger>
      <Button>Rename…</Button>
      <Modal
        {...args}
        footer={(close) => (
          <>
            <Button onPress={close}>Cancel</Button>
            <Button variant="primary" onPress={close}>Save</Button>
          </>
        )}
      >
        <TextField label="Title" defaultValue="Lorem ipsum dolor sit amet" autoFocus />
      </Modal>
    </DialogTrigger>
  ),
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
}

/** Test for Playground: runs in Vitest and Run tests, hidden from the sidebar and docs so the story loads still. */
export const PlaygroundTest: Story = {
  ...Playground,
  name: 'Playground (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, userEvent, step }) => {
    await step('Open the dialog', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Rename…' }))
      const dialog = await screen.findByRole('dialog', { name: 'Rename chat' })
      await waitFor(() => expect(dialog).toBeVisible()) // pops in from opacity 0
    })
    await step('Esc closes it and focus returns to the trigger', async () => {
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
      await expect(canvas.getByRole('button', { name: 'Rename…' })).toHaveFocus()
    })
  },
}

/** Destructive confirmation: alertdialog, danger button, no click-outside dismiss. */
export const DeleteChat: Story = {
  name: 'Delete a chat',
  args: { title: 'Delete chat?', onOpenChange: fn() },
  render: (args) => (
    <DialogTrigger>
      <Button variant="danger">Delete chat</Button>
      <ConfirmModal
        title={args.title}
        destructive
        confirmLabel="Delete chat"
        onConfirm={args.onOpenChange as () => void}
      >
        <p className="m-0">“Consectetur adipiscing elit” will be deleted for good. This can’t be undone.</p>
      </ConfirmModal>
    </DialogTrigger>
  ),
}

/** Test for Delete a chat: runs in Vitest and Run tests, hidden from the sidebar and docs so the story loads still. */
export const DeleteChatTest: Story = {
  ...DeleteChat,
  name: 'Delete a chat (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ args, canvas, userEvent, step }) => {
    await step('Open the confirmation', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Delete chat' }))
    })
    const dialog = await screen.findByRole('alertdialog', { name: 'Delete chat?' })
    await step('Confirming runs the action and closes', async () => {
      await userEvent.click(within(dialog).getByRole('button', { name: 'Delete chat' }))
      await expect(args.onOpenChange).toHaveBeenCalled()
      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    })
  },
}

/** Body scrolls; header and footer stay put. Opens itself on the story page; docs only show the trigger. */
export const LongTermsOfService: Story = {
  name: 'Long terms that scroll',
  args: { title: 'Updated terms of service', description: 'Effective December 1, 2026.', size: 'lg' },
  render: (args) => (
    <DialogTrigger>
      <Button>Read terms</Button>
      <Modal {...args} footer={(close) => <Button variant="primary" onPress={close}>I agree</Button>}>
        {Array.from({ length: 30 }, (_, i) => (
          <p key={i} className="m-0 leading-6 text-muted">
            {i + 1}. You keep ownership of everything you put in and everything the model gives back. We do not train
            on your conversations unless you opt in from Settings → Privacy.
          </p>
        ))}
      </Modal>
    </DialogTrigger>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Read terms' }))
    const dialog = await screen.findByRole('dialog', { name: 'Updated terms of service' })
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'I agree' })).toBeVisible()) // pops in from opacity 0
  },
}
