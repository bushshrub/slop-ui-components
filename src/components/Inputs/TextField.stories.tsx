import type { Meta, StoryObj } from '@storybook/react-vite'
import { KeyRound, Search } from 'lucide-react'
import { useState } from 'react'
import { expect, fn } from 'storybook/test'
import { TextField } from './TextField'

const meta = {
  title: 'Components/Inputs/TextField',
  component: TextField,
  args: {
    label: 'Display name',
    placeholder: 'e.g. Ada',
    description: 'Shown in the sidebar and on shared chats.',
    onChange: fn(),
  },
  argTypes: {
    prefix: { control: false },
    errorMessage: { control: 'text' },
  },
  decorators: [(Story) => <div className="w-80 max-w-full"><Story /></div>],
} satisfies Meta<typeof TextField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  play: async ({ args, canvas, userEvent, step }) => {
    await step('Typing reports each change', async () => {
      await userEvent.type(canvas.getByLabelText('Display name'), 'Ada')
      await expect(args.onChange).toHaveBeenLastCalledWith('Ada')
    })
  },
}

/** Every shape the field takes, for visual review. */
export const Gallery: Story = {
  render: () => (
    <div className="flex flex-col gap-5">
      <TextField label="Display name" defaultValue="Alex" />
      <TextField aria-label="Search" placeholder="Search chats" prefix={<Search />} />
      <TextField label="Project ID" mono defaultValue="prj_01JC8Q4M2T7XW" isReadOnly />
      <TextField label="System prompt" multiline placeholder="You are a helpful assistant…" />
      <TextField label="Email" defaultValue="not-an-email" errorMessage="Enter a valid email address." />
      <TextField label="Region" defaultValue="eu-west-1" isDisabled />
    </div>
  ),
}

/** A key with the wrong prefix is rejected as the user types. */
export const PastedWrongKey: Story = {
  name: 'Pasted a key from the wrong provider',
  render: function Render() {
    const [value, setValue] = useState('')
    const bad = value.length > 0 && !value.startsWith('sk-live-')
    return (
      <TextField
        label="API key"
        mono
        prefix={<KeyRound />}
        placeholder="sk-live-…"
        value={value}
        onChange={setValue}
        description="Starts with sk-live-."
        errorMessage={bad ? 'This looks like a key from another service. Keys here start with sk-live-.' : undefined}
      />
    )
  },
  play: async ({ canvas, userEvent, step }) => {
    const input = canvas.getByLabelText('API key')
    await step('Paste a key from another service', async () => {
      await userEvent.click(input)
      await userEvent.paste('sk-proj-abc123')
    })
    await step('The field is marked invalid and explains why', async () => {
      await expect(input).toHaveAttribute('aria-invalid', 'true')
      await expect(canvas.getByText(/Keys here start with sk-live-/)).toBeVisible()
    })
  },
}
