import type { Meta, StoryObj } from '@storybook/react-vite'
import { DialogTrigger } from 'react-aria-components'
import { expect, screen, waitFor, within } from 'storybook/test'
import { Button } from '../Button/Button'
import { Drawer } from './Drawer'

const meta = {
  title: 'Components/Overlays/Drawer',
  component: Drawer,
  args: { title: 'Version history', description: 'Saved versions of this document.' },
  argTypes: {
    side: { control: 'inline-radio', options: ['right', 'left'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: {
    docs: {
      story: { inline: false, height: '420px' },
      description: {
        component:
          'A panel that slides in from the side for detail next to the page. Same title, description and footer shape as `Modal`; ' +
          'use `Sheet` for a bottom sheet on phones.',
      },
    },
  },
  render: (args) => (
    <DialogTrigger>
      <Button>Show history</Button>
      <Drawer
        {...args}
        footer={(close) => (
          <>
            <Button onPress={close}>Close</Button>
            <Button variant="primary" onPress={close}>Restore</Button>
          </>
        )}
      >
        {['Today, 14:02', 'Today, 09:40', 'Yesterday, 17:15'].map((when) => (
          <p key={when} className="m-0">{when}</p>
        ))}
      </Drawer>
    </DialogTrigger>
  ),
} satisfies Meta<typeof Drawer>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const PlaygroundTest: Story = {
  ...Playground,
  name: 'Drawer (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Show history' }))
    const dialog = await screen.findByRole('dialog', { name: 'Version history' })
    await waitFor(() => expect(dialog).toBeVisible())
    await userEvent.click(within(dialog).getByRole('button', { name: 'Restore' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  },
}
