import type { Meta, StoryObj } from '@storybook/react-vite'
import { LayoutGrid, List, Monitor, Moon, Rows3, Sun } from 'lucide-react'
import { expect, fn } from 'storybook/test'
import { SegmentedControl } from './SegmentedControl'

const meta = {
  title: 'Components/Inputs/SegmentedControl',
  component: SegmentedControl,
  args: {
    label: 'Appearance',
    options: [
      { id: 'light', label: 'Light', icon: <Sun /> },
      { id: 'dark', label: 'Dark', icon: <Moon /> },
      { id: 'system', label: 'System', icon: <Monitor /> },
    ],
    defaultValue: 'system',
    onChange: fn(),
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    options: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'For 2–5 choices that apply immediately (theme, view mode, time range). ' +
          'Inside a form with a Save button, or with a description per choice, use RadioCards.',
      },
    },
  },
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Sizes, icon-only and full-width together. */
export const Gallery: Story = {
  render: () => (
    <div className="flex w-80 max-w-full flex-col items-start gap-4">
      <SegmentedControl
        aria-label="Range"
        size="sm"
        defaultValue="7d"
        options={[
          { id: '24h', label: '24h' },
          { id: '7d', label: '7d' },
          { id: '30d', label: '30d' },
          { id: '90d', label: '90d' },
        ]}
      />
      <SegmentedControl
        aria-label="View"
        iconOnly
        defaultValue="list"
        options={[
          { id: 'list', label: 'List', icon: <List /> },
          { id: 'grid', label: 'Grid', icon: <LayoutGrid /> },
          { id: 'compact', label: 'Compact', icon: <Rows3 /> },
        ]}
      />
      <SegmentedControl
        aria-label="Plan billing"
        fullWidth
        defaultValue="monthly"
        options={[
          { id: 'monthly', label: 'Monthly' },
          { id: 'yearly', label: 'Yearly' },
        ]}
      />
    </div>
  ),
}

/** Keyboard: arrows move focus, Enter/Space selects; one segment always stays selected. */
export const SwitchToDarkWithKeyboard: Story = {
  name: 'Switch to dark with the keyboard',
  play: async ({ args, canvas, userEvent, step }) => {
    await step('From System, arrow left to Dark and press Enter', async () => {
      canvas.getByRole('radio', { name: 'System' }).focus()
      await userEvent.keyboard('{ArrowLeft}{Enter}')
    })
    await step('Dark is selected and reported', async () => {
      await expect(args.onChange).toHaveBeenCalledWith('dark')
      await expect(canvas.getByRole('radio', { name: 'Dark' })).toBeChecked()
    })
    await step('Pressing the selected segment again keeps it selected', async () => {
      await userEvent.keyboard('{Enter}')
      await expect(canvas.getByRole('radio', { name: 'Dark' })).toBeChecked()
    })
  },
}
