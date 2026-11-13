import type { Meta, StoryObj } from '@storybook/react-vite'
import { parseDate } from '@internationalized/date'
import { expect, fn } from 'storybook/test'
import { Calendar, RangeCalendar } from './Calendar'

const meta = {
  title: 'Components/Inputs/Calendar',
  component: Calendar,
  args: {
    'aria-label': 'Due date',
    defaultValue: parseDate('2026-03-14'),
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          'Month grid for picking a day, built on react-aria. Use DatePicker for a field that opens one; use Calendar when the month is always visible. ' +
          'Day squares follow `--ui-control`, and grow to `--ui-control-touch` on touch screens.',
      },
    },
  },
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Pick a span: the first click sets the start, the second sets the end. Days between them get a soft tint. */
export const Range: Story = {
  render: () => (
    <RangeCalendar
      aria-label="Trip dates"
      defaultValue={{ start: parseDate('2026-03-09'), end: parseDate('2026-03-18') }}
    />
  ),
}

/** Click a day and the change is reported; the next button moves the heading to the following month. */
export const PickDayTest: Story = {
  name: 'Pick a day (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ args, canvas, userEvent, step }) => {
    await step('Pick the 17th', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /March 17, 2026/ }))
      await expect(args.onChange).toHaveBeenCalledWith(parseDate('2026-03-17'))
    })
    await step('Next month moves the heading to April', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Next month' }))
      await expect(canvas.getByRole('heading')).toHaveTextContent('April 2026')
    })
    await step('Pick a day in April', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /April 2, 2026/ }))
      await expect(args.onChange).toHaveBeenLastCalledWith(parseDate('2026-04-02'))
    })
  },
}
