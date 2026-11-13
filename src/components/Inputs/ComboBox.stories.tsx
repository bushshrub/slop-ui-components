import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, screen, waitFor, within } from 'storybook/test'
import { Search } from 'lucide-react'
import { conversations } from '../../examples/sample-data'
import { ComboBox } from './ComboBox'

const chats = conversations.map((c) => ({
  id: c.id,
  label: c.title,
  description: new Date(c.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
}))

const timeZones = [
  'America/Los_Angeles',
  'America/New_York',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
].map((tz) => ({ id: tz, label: tz.replace('_', ' ') }))

const meta = {
  title: 'Components/Inputs/ComboBox',
  component: ComboBox,
  args: {
    'aria-label': 'Search chats',
    options: chats,
    placeholder: 'Search chats',
    prefix: <Search />,
    allowsCustomValue: true,
    onSelectionChange: fn(),
  },
  argTypes: {
    prefix: { control: false },
    errorMessage: { control: 'text' },
  },
  parameters: {
    docs: {
      // Own iframe so the suggestion list has room to open inside the preview box
      story: { inline: false, height: '360px' },
      description: {
        component:
          'Text input with suggestions under it as the user types. Matches anywhere in the label and bolds the typed part. ' +
          'Pass `filter={false}` and update `options` from `onInputChange` for server-side suggestions.',
      },
    },
    layout: 'padded',
  },
  decorators: [(Story) => <div className="w-80 max-w-full"><Story /></div>],
} satisfies Meta<typeof ComboBox>

export default meta
type Story = StoryObj<typeof meta>

/** Search field with an icon. Free text is allowed; picking a suggestion jumps to that chat. */
export const SearchChats: Story = {
  name: 'Search with suggestions',
}

/** Test for Search with suggestions: runs in Vitest and Run tests, hidden from the sidebar and docs so the story loads still. */
export const SearchChatsTest: Story = {
  ...SearchChats,
  name: 'Search with suggestions (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ args, canvas, userEvent, step }) => {
    const input = canvas.getByRole('combobox', { name: 'Search chats' })
    await step('Typing shows matches from anywhere in the title', async () => {
      await userEvent.type(input, 'cidi')
      const list = await screen.findByRole('listbox')
      await waitFor(() => expect(list).toBeVisible()) // pops in from opacity 0
      await expect(within(list).getAllByRole('option')).toHaveLength(1)
      await expect(within(list).getByText('cidi', { selector: 'strong' })).toBeInTheDocument()
    })
    await step('Arrow down and Enter picks it', async () => {
      await userEvent.keyboard('{ArrowDown}{Enter}')
      await expect(args.onSelectionChange).toHaveBeenCalledWith('cnv_0aa7')
      await expect(input).toHaveValue('Incididunt ut labore et dolore')
    })
    await step('Text with no match says so', async () => {
      await userEvent.clear(input)
      await userEvent.type(input, 'zzz')
      await expect(await screen.findByText('No matches')).toBeInTheDocument()
      await userEvent.keyboard('{Escape}')
    })
  },
}

/**
 * Pick from a long fixed list by typing part of it. Opens on focus. Leaving with text that is not an option
 * keeps the text and shows an error; text that matches one option picks it.
 */
export const TimeZone: Story = {
  name: 'Pick a time zone',
  args: {
    'aria-label': undefined,
    label: 'Time zone',
    description: 'Used for scheduled tasks.',
    options: timeZones,
    placeholder: 'Type a city',
    prefix: undefined,
    allowsCustomValue: false,
    menuTrigger: 'focus',
    defaultSelectedKey: 'Europe/London',
  },
}

export const TimeZoneTest: Story = {
  ...TimeZone,
  name: 'Pick a time zone (test)',
  tags: ['!dev', '!autodocs'],
  args: { ...TimeZone.args, name: 'tz' },
  play: async ({ args, canvas, canvasElement, userEvent, step }) => {
    const input = canvas.getByRole('combobox', { name: 'Time zone' })
    const posted = () => canvasElement.querySelector<HTMLInputElement>('input[name="tz"]')?.value
    await expect(posted()).toBe('Europe/London')
    await step('Text that matches one option picks it on leaving the field', async () => {
      await userEvent.clear(input)
      await userEvent.type(input, 'tokyo')
      await userEvent.tab()
      await waitFor(() => expect(input).toHaveValue('Asia/Tokyo'))
      await expect(args.onSelectionChange).toHaveBeenLastCalledWith('Asia/Tokyo')
      await expect(posted()).toBe('Asia/Tokyo')
    })
    await step('Text that is not an option stays, with an error', async () => {
      await userEvent.clear(input)
      await userEvent.type(input, 'zzz')
      await userEvent.tab()
      await expect(input).toHaveValue('zzz')
      await expect(input).toHaveAttribute('aria-invalid', 'true')
      await expect(canvas.getByText('Pick an option from the list.')).toBeVisible()
      await expect(posted()).toBe('')
    })
    await step('Picking an option clears the error', async () => {
      await userEvent.clear(input)
      await userEvent.type(input, 'sing')
      await userEvent.keyboard('{ArrowDown}{Enter}')
      await waitFor(() => expect(input).toHaveValue('Asia/Singapore'))
      await waitFor(() => expect(input).not.toHaveAttribute('aria-invalid', 'true'))
    })
  },
}
