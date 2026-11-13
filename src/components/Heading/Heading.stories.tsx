import type { Meta, StoryObj } from '@storybook/react-vite'
import { Plus } from 'lucide-react'
import { Button } from '../Button/Button'
import { Heading, PageHeader } from './Heading'

const meta = {
  title: 'Components/Typography/Heading',
  component: Heading,
  args: { children: 'Conversations', variant: 'page' },
  argTypes: {
    variant: { control: 'select', options: ['page', 'dialog', 'section', 'label'] },
    as: { control: 'select', options: [undefined, 'h1', 'h2', 'h3', 'h4'] },
  },
  parameters: {
    docs: {
      description: {
        component: 'Four fixed title styles. Page and dialog titles are serif; everything inside a page is sans.',
      },
    },
  },
} satisfies Meta<typeof Heading>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { count: 128 },
}

/** The four styles in the order they appear on a page. */
export const Gallery: Story = {
  render: () => (
    <div className="flex w-[32rem] flex-col gap-5">
      <Heading variant="page" count={42}>Projects</Heading>
      <Heading variant="dialog">Rename project</Heading>
      <Heading variant="section">Members</Heading>
      <Heading variant="label">Danger zone</Heading>
    </div>
  ),
}

/** PageHeader with actions, when the title is long enough to wrap the actions below. */
export const PageHeaderWithLongTitle: Story = {
  name: 'Page header with a very long title',
  parameters: { layout: 'padded' },
  render: () => (
    <div className="max-w-2xl">
      <PageHeader
        title="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt"
        count={1_284}
        description="Archived chats are read-only."
        actions={
          <Button variant="primary" icon={<Plus />}>
            New chat
          </Button>
        }
      />
    </div>
  ),
}
