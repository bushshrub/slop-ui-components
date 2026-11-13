import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Switch } from '../Inputs/Switch'
import { Card, CardBody, CardFooter, CardHeader } from './Card'

const projects = [
  { name: 'Launch plan', note: 'Roadmap, copy drafts and the press checklist.', meta: '12 chats · Updated 2d ago' },
  { name: 'Research notes', note: 'Interview summaries and open questions.', meta: '4 chats · Updated 5d ago' },
  { name: 'Brand voice', note: 'Tone guidelines and example rewrites.', meta: '9 chats · Updated 1w ago' },
]

const meta = {
  title: 'Components/Layout/Card',
  component: Card,
  args: { onPress: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'A bordered surface that groups related content. Pass `href` or `onPress` to make the whole card ' +
          'pressable, with hover and focus styles.',
      },
    },
  },
  render: (args) => (
    <Card {...args} className="w-72">
      <CardHeader title="Launch plan" description="Roadmap and copy drafts" />
      <CardFooter>12 chats</CardFooter>
    </Card>
  ),
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Pressable project cards in a grid next to a plain settings card. */
export const Gallery: Story = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Card key={p.name} href="#">
            <CardHeader title={p.name} />
            <CardBody>{p.note}</CardBody>
            <CardFooter>{p.meta}</CardFooter>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader title="Notifications" description="Choose what we email you about" action={<Switch aria-label="Email notifications" defaultSelected />} />
        <CardBody>Replies to shared chats and weekly usage summaries.</CardBody>
      </Card>
    </div>
  ),
}

/** Test for Playground: pressing the card calls onPress. */
export const PlaygroundTest: Story = {
  ...Playground,
  name: 'Playground (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button'))
    await expect(args.onPress).toHaveBeenCalled()
  },
}
