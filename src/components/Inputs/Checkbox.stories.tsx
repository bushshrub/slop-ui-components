import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { CheckIndicator, Checkbox } from './Checkbox'

const meta = {
  title: 'Components/Inputs/Checkbox',
  component: Checkbox,
  args: { children: 'Send with Enter', description: 'Shift+Enter adds a new line.', onChange: fn() },
  parameters: {
    docs: {
      description: {
        component: 'For choices saved with a form, or picking several items from a list. A single setting that applies right away wants Switch.',
      },
    },
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  play: async ({ args, canvas, userEvent, step }) => {
    await step('Clicking the label toggles the box', async () => {
      await userEvent.click(canvas.getByText('Send with Enter'))
      await expect(args.onChange).toHaveBeenCalledWith(true)
      await expect(canvas.getByRole('checkbox')).toBeChecked()
    })
  },
}

/** Every state together, for visual review. */
export const Gallery: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox>Unchecked</Checkbox>
      <Checkbox defaultSelected>Checked</Checkbox>
      <Checkbox isIndeterminate>Some selected</Checkbox>
      <Checkbox isInvalid>Accept the terms</Checkbox>
      <Checkbox isDisabled defaultSelected>Disabled</Checkbox>
    </div>
  ),
}

/** `CheckIndicator` is the box alone, for rows that are themselves the option. */
export const Indicator: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <CheckIndicator />
      <CheckIndicator isSelected />
      <CheckIndicator isIndeterminate />
    </div>
  ),
}
