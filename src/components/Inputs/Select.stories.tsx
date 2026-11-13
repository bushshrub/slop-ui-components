import type { Meta, StoryObj } from '@storybook/react-vite'
import { Flag, Globe, Laptop } from 'lucide-react'
import { expect, fn, screen, waitFor } from 'storybook/test'
import { models } from '../../examples/sample-data'
import { Select } from './Select'

const meta = {
  title: 'Components/Inputs/Select',
  component: Select,
  args: {
    label: 'Default model',
    options: models,
    placeholder: 'Choose a model',
    onChange: fn(),
  },
  argTypes: {
    errorMessage: { control: 'text' },
  },
  decorators: [(Story) => <div className="w-72 max-w-full"><Story /></div>],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { description: 'Used for new chats.' },
}

/** Opening the list and picking a different model with the mouse. */
export const SwitchToFasterModel: Story = {
  name: 'Switch to a faster model',
  args: { defaultValue: 'claude-opus-5-5' },
}

/** Test for Switch to a faster model: runs in Vitest and Run tests, hidden from the sidebar and docs so the story loads still. */
export const SwitchToFasterModelTest: Story = {
  ...SwitchToFasterModel,
  name: 'Switch to a faster model (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ args, canvas, userEvent, step }) => {
    await step('Open the list', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /Default model/ }))
    })
    await step('Pick Haiku', async () => {
      await userEvent.click(await screen.findByRole('option', { name: /Haiku 5.5/ }))
    })
    await step('The value updates and the list closes', async () => {
      await expect(args.onChange).toHaveBeenCalledWith('claude-haiku-5-5')
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
      await expect(canvas.getByRole('button', { name: /Default model/ })).toHaveTextContent('Haiku 5.5')
    })
  },
}

/** `quiet`: value and chevron only, for settings rows and table cells. Fills on hover and while open. */
export const Quiet: Story = {
  args: { variant: 'quiet', label: undefined, 'aria-label': 'Default model', defaultValue: 'claude-sonnet-5-5' },
  render: (args) => (
    <div className="flex items-center justify-between gap-4 border-y border-divider py-3 text-ui">
      Default model
      <Select {...args} />
    </div>
  ),
}

/** Under 768px the list opens as a bottom sheet titled by the label. Forced here with `sheet="always"`. */
export const AsSheet: Story = {
  name: 'As a bottom sheet on phones',
  args: { sheet: 'always', defaultValue: 'claude-opus-5-5' },
  // Own iframe in docs so the sheet opens inside the preview box
  parameters: { docs: { story: { inline: false, height: '520px' } } },
}

/** Test for As a bottom sheet on phones: runs in Vitest and Run tests, hidden from the sidebar and docs so the story loads still. */
export const AsSheetTest: Story = {
  ...AsSheet,
  name: 'As a bottom sheet on phones (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ args, canvas, userEvent, step }) => {
    await step('Tap opens a sheet', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /Default model/ }))
      const list = await screen.findByRole('listbox')
      await expect(list.closest('[data-sheet]')).not.toBeNull()
    })
    await step('Picking an option updates the value and closes it', async () => {
      await userEvent.click(screen.getByRole('option', { name: /Haiku 5.5/ }))
      await expect(args.onChange).toHaveBeenCalledWith('claude-haiku-5-5')
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
    })
  },
}

/** Long option labels truncate in the trigger instead of widening the form. */
export const VeryLongOptionNames: Story = {
  name: 'Very long option names',
  tags: ['!dev'],
  args: {
    defaultValue: 'long',
    options: [
      { id: 'long', label: 'claude-opus-5-5-20261101-extended-thinking-experimental-preview' },
      ...models,
    ],
  },
}

/** Options with an icon: shown in the list and, once chosen, in the trigger. */
export const WithIcons: Story = {
  args: {
    label: 'Region',
    defaultValue: 'eu',
    options: [
      { id: 'eu', label: 'Europe', icon: <Globe /> },
      { id: 'us', label: 'United States', icon: <Flag />, description: 'Lowest latency for the Americas' },
      { id: 'local', label: 'This device', icon: <Laptop /> },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: /Region/ })
    await expect(trigger.querySelector('svg.lucide-globe')).toBeInTheDocument()
    await userEvent.click(trigger)
    const option = await screen.findByRole('option', { name: /United States/ })
    await expect(option.querySelector('svg.lucide-flag')).toBeInTheDocument()
    await userEvent.click(option)
    await waitFor(() => expect(trigger.querySelector('svg.lucide-flag')).toBeInTheDocument())
  },
}
