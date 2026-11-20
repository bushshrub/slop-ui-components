import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, waitFor } from 'storybook/test'
import { CopyField } from './CopyField'

const meta = {
  title: 'Components/Inputs/CopyField',
  component: CopyField,
  parameters: {
    docs: {
      description: {
        component:
          'A value to copy, not edit: an ID, a URL, an API key. `secret` hides it behind dots with a Show button; ' +
          'Copy always copies the real value. Without clipboard access, Copy selects the text instead.',
      },
    },
  },
  args: { label: 'Server ID', value: 'srv_7f3a9c21e4b04d1f8a6b', onCopy: fn() },
  render: (args) => (
    <div className="w-80 max-w-full">
      <CopyField {...args} />
    </div>
  ),
} satisfies Meta<typeof CopyField>

export default meta
type Story = StoryObj<typeof meta>

export const Main: Story = { name: 'CopyField' }

export const Secret: Story = {
  args: {
    label: 'API key',
    value: 'key_demo_9QeLoremIpsumDolorSitAmet3f9c',
    secret: true,
    description: 'Anyone with this key can act as you. Keep it out of shared code.',
  },
}

/** A long URL truncates; it is still copied in full. */
export const LongValue: Story = {
  args: { label: 'Invite link', value: 'https://example.com/invite/7f3a9c21e4b04d1f8a6b?team=lorem-ipsum&role=member', mono: false },
}

/** Test for CopyField: hidden from the sidebar and docs. */
export const SecretTest: Story = {
  ...Secret,
  name: 'Secret (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ args, canvas, userEvent }) => {
    const field = canvas.getByLabelText('API key')
    await expect(field).toHaveAttribute('type', 'password')
    await expect(field).toHaveAttribute('readonly')
    await userEvent.click(canvas.getByRole('button', { name: 'Show' }))
    await expect(field).toHaveAttribute('type', 'text')
    await expect(field).toHaveValue(args.value)

    let copied = ''
    const write = navigator.clipboard.writeText
    navigator.clipboard.writeText = async (text: string) => void (copied = text)
    try {
      await userEvent.click(canvas.getByRole('button', { name: 'Copy' }))
      await waitFor(() => expect(args.onCopy).toHaveBeenCalledOnce())
      await expect(copied).toBe(args.value)
      await expect(canvas.getByRole('button', { name: 'Copied' })).toBeVisible()
      await expect(canvas.getByRole('status')).toHaveTextContent('Copied')
    } finally {
      navigator.clipboard.writeText = write
    }
  },
}
