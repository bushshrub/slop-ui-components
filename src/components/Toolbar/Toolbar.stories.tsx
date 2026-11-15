import type { Meta, StoryObj } from '@storybook/react-vite'
import { Bold, Italic, Link, Underline } from 'lucide-react'
import { expect } from 'storybook/test'
import { Button, IconButton } from '../Button/Button'
import { Toolbar, ToolbarGroup, ToolbarSeparator } from './Toolbar'

const meta = {
  title: 'Components/Layout/Toolbar',
  component: Toolbar,
  subcomponents: { ToolbarGroup, ToolbarSeparator } as Record<string, React.ComponentType<unknown>>,
  parameters: {
    docs: {
      description: {
        component:
          'A row of controls that is a single Tab stop: arrow keys move between them. Group related controls with ' +
          '`ToolbarGroup` and divide groups with `ToolbarSeparator`.',
      },
    },
  },
  args: { 'aria-label': 'Text formatting' },
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarGroup aria-label="Style">
        <IconButton aria-label="Bold" variant="ghost">
          <Bold />
        </IconButton>
        <IconButton aria-label="Italic" variant="ghost">
          <Italic />
        </IconButton>
        <IconButton aria-label="Underline" variant="ghost">
          <Underline />
        </IconButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup aria-label="Insert">
        <IconButton aria-label="Link" variant="ghost">
          <Link />
        </IconButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <Button variant="ghost" isDisabled>
        Disabled
      </Button>
      <Button variant="ghost">Clear</Button>
    </Toolbar>
  ),
} satisfies Meta<typeof Toolbar>

export default meta
type Story = StoryObj<typeof meta>

export const Main: Story = { name: 'Toolbar' }

/** Test for Toolbar: hidden from the sidebar and docs. */
export const MainTest: Story = {
  ...Main,
  name: 'Toolbar (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, userEvent, step }) => {
    await step('One Tab stop, arrows move across groups', async () => {
      await userEvent.tab()
      await expect(canvas.getByRole('button', { name: 'Bold' })).toHaveFocus()
      await userEvent.keyboard('{ArrowRight}{ArrowRight}')
      await expect(canvas.getByRole('button', { name: 'Underline' })).toHaveFocus()
      await userEvent.keyboard('{ArrowRight}')
      await expect(canvas.getByRole('button', { name: 'Link' })).toHaveFocus()
      await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
      await expect(canvas.getByRole('button', { name: 'Italic' })).toHaveFocus()
    })
    await step('Separators are exposed', async () => {
      await expect(canvas.getAllByRole('separator')).toHaveLength(2)
    })
  },
}

export const Vertical: Story = {
  args: { orientation: 'vertical', 'aria-label': 'Vertical formatting' },
}
