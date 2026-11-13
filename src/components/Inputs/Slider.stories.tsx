import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Slider } from './Slider'

const meta = {
  title: 'Components/Inputs/Slider',
  component: Slider,
  args: { label: 'Temperature', defaultValue: 40, onChange: fn() },
  decorators: [(Story) => <div className="w-96 max-w-full"><Story /></div>],
  argTypes: {
    showValue: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Horizontal slider for one value, or a range when `value` or `defaultValue` is an array. ' +
          'The filled part of the track uses the interactive color. Use NumberField when the exact number matters.',
      },
    },
  },
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('slider')).toHaveValue('40')
    await expect(canvas.getByText('40')).toBeVisible()
    await expect(args.onChange).not.toHaveBeenCalled()
  },
}

/** Two thumbs for a low and high bound. The filled part sits between them. */
export const Range: Story = {
  args: { label: 'Price range', defaultValue: [20, 70] },
}

/** Snaps to multiples of `step`. */
export const WithSteps: Story = {
  args: { label: 'Max tokens', defaultValue: 50, minValue: 0, maxValue: 100, step: 10 },
}

export const Disabled: Story = {
  args: { label: 'Brightness', defaultValue: 30, isDisabled: true },
}

/** Every state together, for visual review. */
export const Gallery: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Slider label="Temperature" defaultValue={40} />
      <Slider label="Max tokens" defaultValue={50} minValue={0} maxValue={100} step={10} description="Steps of 10" />
      <Slider label="Price range" defaultValue={[20, 70]} />
      <Slider label="Brightness" defaultValue={30} isDisabled />
      <Slider label="Volume" defaultValue={60} showValue={false} />
    </div>
  ),
}

export const Slider_test: Story = {
  name: 'Slider (test)',
  tags: ['!dev', '!autodocs'],
  args: { label: 'Font size', defaultValue: 40, onChange: fn() },
  play: async ({ canvas, userEvent, args }) => {
    canvas.getByRole('slider').focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect(args.onChange).toHaveBeenCalledWith(41)
    await expect(canvas.getByRole('slider')).toHaveValue('41')
  },
}
