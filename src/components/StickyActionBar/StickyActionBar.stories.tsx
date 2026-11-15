import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Button, IconButton } from '../Button/Button'
import { StickyActionBar } from './StickyActionBar'
import { Trash2 } from 'lucide-react'

const meta = {
  title: 'Components/Layout/StickyActionBar',
  component: StickyActionBar,
  parameters: {
    docs: {
      description: {
        component:
          'Bottom action bar for touch layouts. Sticks to the bottom of its scrolling container, pads for the safe area ' +
          '(home indicator) and keeps every control at least 44px. Under 768px the buttons share the width.',
      },
      story: { inline: false, height: '320px' },
    },
  },
  args: { 'aria-label': 'Order actions', children: null },
  argTypes: { children: { control: false } },
  render: (args) => (
    <div className="relative h-72 overflow-y-auto border border-border">
      <ul className="m-0 flex list-none flex-col gap-2 p-4 text-ui">
        {Array.from({ length: 14 }, (_, i) => (
          <li key={i}>Order #{1000 + i}</li>
        ))}
      </ul>
      <StickyActionBar {...args}>
        <Button>Cancel</Button>
        <Button variant="primary">Place order</Button>
      </StickyActionBar>
    </div>
  ),
} satisfies Meta<typeof StickyActionBar>

export default meta
type Story = StoryObj<typeof meta>

export const Main: Story = { name: 'StickyActionBar' }

/** Test for StickyActionBar: hidden from the sidebar and docs. */
export const MainTest: Story = {
  ...Main,
  name: 'StickyActionBar (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas }) => {
    const bar = canvas.getByRole('region', { name: 'Order actions' })
    await expect(bar).toBeVisible()
    await expect(bar).toHaveStyle({ position: 'sticky' })
    for (const button of canvas.getAllByRole('button')) {
      await expect(button.getBoundingClientRect().height).toBeGreaterThanOrEqual(44)
    }
  },
}

/** Small icon buttons inside are stretched to the 44px target. */
export const WithIconButton: Story = {
  render: (args) => (
    <div className="h-40">
      <StickyActionBar {...args} className="justify-between">
        <IconButton aria-label="Delete" size="sm">
          <Trash2 />
        </IconButton>
        <Button variant="primary">Save</Button>
      </StickyActionBar>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Delete' }).getBoundingClientRect().width).toBeGreaterThanOrEqual(44)
  },
}
