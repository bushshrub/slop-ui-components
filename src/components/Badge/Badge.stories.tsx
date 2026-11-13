import type { Meta, StoryObj } from '@storybook/react-vite'
import { Check, Sparkles } from 'lucide-react'
import { Badge, CountBadge, type BadgeTone } from './Badge'

const tones: BadgeTone[] = ['neutral', 'accent', 'info', 'success', 'warning', 'danger']

const meta = {
  title: 'Components/Data display/Badge',
  component: Badge,
  args: { children: 'Beta', tone: 'neutral', variant: 'soft', size: 'md' },
  argTypes: {
    tone: { control: 'select', options: tones },
    variant: { control: 'inline-radio', options: ['soft', 'solid'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Small inline label for status or metadata. Soft badges use regular text on the tint (status colors as ' +
          'text do not reach 4.5:1 on their own tint in the light theme); add `dot` to show the tone in color. ' +
          '`CountBadge` is a numeric pill for unread counts.',
      },
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Every tone as soft, solid and outline, with a dot and an icon, and custom colors. */
export const Gallery: Story = {
  render: () => (
    <div className="flex flex-col gap-4 text-fg">
      {(['soft', 'solid', 'outline'] as const).map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-2">
          {tones.map((t) => (
            <Badge key={t} tone={t} variant={variant}>{t}</Badge>
          ))}
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2">
        {tones.map((t) => (
          <Badge key={t} tone={t} dot>{t}</Badge>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="success" icon={<Check />}>Verified</Badge>
        <Badge tone="accent" variant="solid" icon={<Sparkles />}>New</Badge>
        <Badge size="sm">Small</Badge>
        <Badge size="sm" tone="warning" dot>Small</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" dot color="#8040D0">Interview</Badge>
        <Badge variant="outline" dot color="teal">Applied</Badge>
        <Badge color="#8040D0">Draft</Badge>
        <Badge color="teal" dot>Applied</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <CountBadge count={3} />
        <CountBadge count={7} tone="warning" />
        <CountBadge count={2} tone="danger" />
        <CountBadge count={42} tone="neutral" />
        <CountBadge count={250} />
        <CountBadge count={0} showZero tone="neutral" />
      </div>
    </div>
  ),
}
