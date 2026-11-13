import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Disclosure, DisclosureGroup } from './Disclosure'

const meta = {
  title: 'Components/Layout/Disclosure',
  component: Disclosure,
  args: {
    title: 'Advanced settings',
    children: 'Control the context window, temperature and other model parameters for this chat.',
  },
  parameters: {
    docs: {
      description: {
        component:
          'A section that expands from a title row. Group several in a `DisclosureGroup` for an accordion; ' +
          'set `allowsMultipleExpanded` to let more than one stay open.',
      },
    },
  },
  render: (args) => (
    <div className="w-96 max-w-full rounded-lg border border-border bg-popover p-1">
      <Disclosure {...args} />
    </div>
  ),
} satisfies Meta<typeof Disclosure>

export default meta
type Story = StoryObj<typeof meta>

export const Main: Story = {}

const faqs = [
  ['Can I change my plan later?', 'Yes. Upgrades apply immediately and downgrades at the end of the billing period.'],
  ['Is my data used for training?', 'No. Conversations are never used to train models unless you opt in.'],
  ['How do I export my chats?', 'Open Settings, choose Privacy, then Export data. You will get an email with a link.'],
]

function Faq({ multiple }: { multiple?: boolean }) {
  return (
    <DisclosureGroup
      allowsMultipleExpanded={multiple}
      defaultExpandedKeys={['0']}
      className="w-96 max-w-full rounded-lg border border-border bg-popover p-1"
    >
      {faqs.map(([q, a], i) => (
        <Disclosure key={q} id={String(i)} title={q}>{a}</Disclosure>
      ))}
    </DisclosureGroup>
  )
}

/** Accordion: opening one closes the others. */
export const FAQ: Story = { render: () => <Faq /> }

/** With `allowsMultipleExpanded`, several can stay open. */
export const FAQMultiple: Story = { render: () => <Faq multiple /> }

export const Test: Story = {
  ...Main,
  name: 'Disclosure (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Advanced settings' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  },
}
