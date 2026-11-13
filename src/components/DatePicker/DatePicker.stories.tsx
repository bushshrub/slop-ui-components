import type { Meta, StoryObj } from '@storybook/react-vite'
import { parseDate } from '@internationalized/date'
import { expect, fn, screen, waitFor, within } from 'storybook/test'
import { DateField, DatePicker, DateRangePicker } from './DatePicker'

const meta = {
  title: 'Components/Inputs/DatePicker',
  component: DatePicker,
  args: {
    label: 'Start date',
    defaultValue: parseDate('2026-03-14'),
    onChange: fn(),
  },
  argTypes: {
    errorMessage: { control: 'text' },
  },
  decorators: [(Story) => <div className="w-80 max-w-full"><Story /></div>],
  parameters: {
    docs: {
      description: {
        component:
          'Date field with a calendar button. Typing a date and picking one in the calendar set the same value. ' +
          'The popover fits a 390px phone; day squares grow to the touch size on coarse pointers. ' +
          'Dates come from `@internationalized/date`: use `parseDate("2026-03-14")` or `today(getLocalTimeZone())`.',
      },
    },
  },
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { description: 'Used for new projects.' },
}

/** Days outside the range are disabled in the calendar, and typed dates outside it are rejected. */
export const WithMinMax: Story = {
  args: {
    label: 'Due date',
    minValue: parseDate('2026-03-01'),
    maxValue: parseDate('2026-03-31'),
    defaultValue: null,
    description: 'Only March is open.',
  },
}

/** Dates the calendar cannot pick (for example, fully booked). Shown struck through. */
export const UnavailableDates: Story = {
  args: {
    label: 'Delivery date',
    defaultValue: null,
    isDateUnavailable: (date) => ['2026-03-17', '2026-03-18', '2026-03-24'].includes(date.toString()),
  },
}

/** Two dates with an en dash between them. The calendar tints the days in between. */
export const Range: Story = {
  render: () => (
    <DateRangePicker
      label="Stay"
      description="Check-in and check-out."
      defaultValue={{ start: parseDate('2026-03-09'), end: parseDate('2026-03-18') }}
    />
  ),
}

/** The typed field alone, with no calendar button. */
export const DateFieldOnly: Story = {
  render: () => <DateField label="Due date" defaultValue={parseDate('2026-03-14')} description="Type a day, month and year." />,
}

export const Disabled: Story = {
  args: { isDisabled: true, description: 'Locked by the project owner.' },
}

export const Invalid: Story = {
  args: { errorMessage: 'Pick a date before the project ends.', defaultValue: parseDate('2026-04-02') },
}

/** Every variant together, for visual review. */
export const Gallery: Story = {
  render: () => (
    <div className="flex flex-col gap-5">
      <DatePicker label="Start date" defaultValue={parseDate('2026-03-14')} />
      <DatePicker label="Due date" description="Optional." />
      <DatePicker label="Disabled" defaultValue={parseDate('2026-03-14')} isDisabled />
      <DatePicker label="Invalid" defaultValue={parseDate('2026-04-02')} errorMessage="Pick a date before the project ends." />
      <DateRangePicker label="Stay" defaultValue={{ start: parseDate('2026-03-09'), end: parseDate('2026-03-18') }} />
      <DateField label="Typed only" defaultValue={parseDate('2026-03-14')} />
    </div>
  ),
}

/** Open the calendar, pick a day: the value is reported and the popover closes. */
export const PickDayTest: Story = {
  name: 'Pick a day (test)',
  tags: ['!dev', '!autodocs'],
  args: { defaultValue: null, placeholderValue: parseDate('2026-03-14') },
  play: async ({ args, canvas, userEvent, step }) => {
    await step('Open the calendar', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /Open calendar/ }))
      await screen.findByRole('dialog')
    })
    await step('Pick the 17th', async () => {
      await userEvent.click(within(document.body).getByRole('button', { name: /March 17, 2026/ }))
    })
    await step('The value is reported and the popover closes', async () => {
      await expect(args.onChange).toHaveBeenCalledWith(parseDate('2026-03-17'))
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    })
  },
}

export const ImpossibleDayTest: Story = {
  name: 'Impossible day (test)',
  tags: ['!dev', '!autodocs'],
  render: () => <DateField label="Due date" />,
  play: async ({ canvas, userEvent }) => {
    // 31 February is moved to the 28th when focus leaves; the field says so instead of changing it silently
    await userEvent.click(canvas.getAllByRole('spinbutton')[0])
    await userEvent.keyboard('02312026')
    await userEvent.tab()
    await expect(await canvas.findByRole('status')).toHaveTextContent('That month has no day 31. Changed to Feb 28, 2026.')
    // The note goes away once the field is edited again
    await userEvent.click(canvas.getAllByRole('spinbutton')[1])
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument()
  },
}
