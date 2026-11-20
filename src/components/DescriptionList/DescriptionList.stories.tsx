import type { Meta, StoryObj } from '@storybook/react-vite'
import { Calendar, Globe, HardDrive, Hash } from 'lucide-react'
import { expect } from 'storybook/test'
import { Badge } from '../Badge/Badge'
import { DescriptionItem, DescriptionList } from './DescriptionList'

const meta = {
  title: 'Components/Data display/DescriptionList',
  component: DescriptionList,
  parameters: {
    docs: {
      description: {
        component:
          'Labelled facts about one thing, as in a details panel. Labels line up in a column sized to the longest ' +
          'one; under 640px each label sits above its value. `stacked` always does that, for narrow panels.',
      },
    },
  },
  args: { children: null },
  render: (args) => (
    <div className="w-[28rem] max-w-full">
      <DescriptionList {...args}>
        <DescriptionItem label="Status">
          <Badge tone="success" dot>
            Running
          </Badge>
        </DescriptionItem>
        <DescriptionItem label="Region">eu-west</DescriptionItem>
        <DescriptionItem label="ID" mono>
          srv_7f3a9c21e4b04d1f8a6b
        </DescriptionItem>
        <DescriptionItem label="Memory" numeric>
          8,192 MB
        </DescriptionItem>
        <DescriptionItem label="Created">12 March 2026</DescriptionItem>
        <DescriptionItem label="Notes">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</DescriptionItem>
      </DescriptionList>
    </div>
  ),
} satisfies Meta<typeof DescriptionList>

export default meta
type Story = StoryObj<typeof meta>

export const Main: Story = { name: 'DescriptionList' }

/** A hairline between items, for longer lists. */
export const Divided: Story = { args: { divided: true } }

/** Labels above values, for a narrow side panel. Icons are optional and decorative. */
export const StackedWithIcons: Story = {
  args: { layout: 'stacked' },
  render: (args) => (
    <div className="w-64">
      <DescriptionList {...args}>
        <DescriptionItem label="Region" icon={<Globe />}>
          eu-west
        </DescriptionItem>
        <DescriptionItem label="Disk" icon={<HardDrive />} numeric>
          80 GB
        </DescriptionItem>
        <DescriptionItem label="ID" icon={<Hash />} mono>
          srv_7f3a9c21e4b04d1f8a6b
        </DescriptionItem>
        <DescriptionItem label="Created" icon={<Calendar />}>
          12 March 2026
        </DescriptionItem>
      </DescriptionList>
    </div>
  ),
}

/** Test for DescriptionList: hidden from the sidebar and docs. */
export const MainTest: Story = {
  ...Main,
  name: 'DescriptionList (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas }) => {
    // A real <dl>: each label is a term, each value its definition
    await expect(canvas.getAllByRole('term')).toHaveLength(6)
    await expect(canvas.getAllByRole('definition')[1]).toHaveTextContent('eu-west')
    // Labels share one column: values start at the same x
    const [a, b] = canvas.getAllByRole('definition')
    await expect(a.getBoundingClientRect().left).toBe(b.getBoundingClientRect().left)
    // A long ID wraps instead of overflowing
    const id = canvas.getByText('srv_7f3a9c21e4b04d1f8a6b')
    await expect(id.scrollWidth).toBeLessThanOrEqual(id.clientWidth + 1)
  },
}
