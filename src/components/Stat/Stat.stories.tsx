import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Stat } from './Stat'

const meta = {
  title: 'Components/Data display/Stat',
  component: Stat,
  parameters: {
    docs: {
      description: {
        component:
          'One measurement: a small label, a large value with an optional unit, and an optional secondary line. ' +
          'Values use tabular figures. `tone` adds a status dot before the label; the value keeps the normal text color.',
      },
    },
  },
  args: { label: 'Requests', value: '1,284', unit: '/min', secondary: '+4% vs last hour' },
  argTypes: { label: { control: 'text' }, value: { control: 'text' }, unit: { control: 'text' }, secondary: { control: 'text' } },
} satisfies Meta<typeof Stat>

export default meta
type Story = StoryObj<typeof meta>

export const Main: Story = { name: 'Stat' }

/** Test for Stat: hidden from the sidebar and docs. */
export const MainTest: Story = {
  ...Main,
  name: 'Stat (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Requests').closest('dt')).toBeVisible()
    await expect(canvas.getByText('1,284').closest('dd')).toHaveTextContent('1,284/min')
    await expect(canvas.getByText('+4% vs last hour')).toBeVisible()
  },
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-10">
      <Stat {...args} size="sm" />
      <Stat {...args} size="md" />
      <Stat {...args} size="lg" />
    </div>
  ),
}

export const Tones: Story = {
  render: () => (
    <div className="flex gap-10">
      <Stat label="Uptime" value="99.98" unit="%" tone="success" />
      <Stat label="Latency" value="420" unit="ms" tone="warning" />
      <Stat label="Errors" value="37" tone="danger" secondary="Over the limit of 25" />
      <Stat label="Regions" value="6" tone="info" />
    </div>
  ),
}

export const Minimal: Story = {
  args: { unit: undefined, secondary: undefined },
}
