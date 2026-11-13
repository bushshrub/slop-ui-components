import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Meter, ProgressBar, StackedMeter } from './Progress'

const meta = {
  title: 'Components/Feedback/Progress',
  component: ProgressBar,
  args: { label: 'Uploading report.pdf', value: 60 },
  argTypes: { tone: { control: 'inline-radio', options: ['default', 'success', 'warning', 'danger'] } },
  parameters: {
    docs: {
      description: {
        component:
          '`ProgressBar` for tasks, with an indeterminate sliding state. `Meter` for usage against a limit: ' +
          'it turns warning at 80% and danger at 95%.',
      },
    },
  },
  decorators: [(Story) => <div className="w-80 max-w-full"><Story /></div>],
} satisfies Meta<typeof ProgressBar>

export default meta
type Story = StoryObj<typeof meta>

export const Upload: Story = {}

export const Indeterminate: Story = { args: { label: 'Preparing', isIndeterminate: true } }

/** Usage at 40%, 85% and 97%. */
export const UsageMeter: Story = {
  render: () => (
    <div className="flex flex-col gap-5">
      <Meter label="40% of messages used" value={40} />
      <Meter label="85% of messages used" value={85} />
      <Meter label="97% of messages used" value={97} />
      <Meter label="Custom tone" value={97} tone="success" />
    </div>
  ),
}

const gb = (v: number) => `${v.toFixed(1)} GB`

/** One bar in several colors, e.g. storage by type. Colors come from `--ui-chart-1…5` unless a segment sets its own. */
export const Stacked: Story = {
  render: () => (
    <div className="flex w-96 max-w-full flex-col gap-8">
      <StackedMeter
        label="Storage"
        maxValue={10}
        formatValue={gb}
        segments={[
          { id: 'chats', label: 'Chats', value: 2.4 },
          { id: 'files', label: 'Files', value: 3.1 },
          { id: 'projects', label: 'Projects', value: 1.2 },
          { id: 'other', label: 'Other', value: 0.6 },
        ]}
      />
      <StackedMeter
        label="Test run"
        valueLabel="120 tests"
        segments={[
          { id: 'pass', label: 'Passed', value: 104, color: 'var(--ui-success)' },
          { id: 'skip', label: 'Skipped', value: 9, color: 'var(--ui-warning)' },
          { id: 'fail', label: 'Failed', value: 7, color: 'var(--ui-danger)' },
        ]}
      />
    </div>
  ),
}

const tokens = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`)

/** Context window of a chat: what fills it, and how much room is left. */
export const ContextWindow: Story = {
  render: () => (
    <div className="w-96 max-w-full">
      <StackedMeter
        label="Context"
        maxValue={200_000}
        formatValue={tokens}
        valueLabel="93.4k / 200k · 47%"
        legend="rows"
        freeLabel="Free space"
        segments={[
          { id: 'system', label: 'System prompt', value: 3_100 },
          { id: 'tools', label: 'Tools', value: 11_800 },
          { id: 'files', label: 'Files', value: 18_900 },
          { id: 'messages', label: 'Messages', value: 27_600 },
          { id: 'buffer', label: 'Reserved for reply', value: 32_000, color: 'var(--ui-border-strong)' },
        ]}
      />
    </div>
  ),
}

export const ProgressTest: Story = {
  name: 'Progress (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '60')
  },
}
