import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { NumberField } from './NumberField'

const meta = {
  title: 'Components/Inputs/NumberField',
  component: NumberField,
  args: { label: 'Max tokens', defaultValue: 1024, step: 1, onChange: fn() },
  decorators: [(Story) => <div className="w-72 max-w-full"><Story /></div>],
  argTypes: {
    isDisabled: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Text field for a number, with − and + steppers at the right edge. `step` sets how far the steppers and arrow ' +
          'keys move. A typed value is never changed: outside `minValue` and `maxValue` it shows an error. Use ' +
          '`formatOptions` for currency, percent or units; the symbol sits beside the number.',
      },
    },
  },
} satisfies Meta<typeof NumberField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('textbox', { name: 'Max tokens' })).toHaveValue('1,024')
    await expect(args.onChange).not.toHaveBeenCalled()
  },
}

export const Currency: Story = {
  args: {
    label: 'Monthly budget',
    defaultValue: 250,
    step: 10,
    formatOptions: { style: 'currency', currency: 'USD' },
  },
}

export const Percent: Story = {
  args: {
    label: 'Top-p',
    defaultValue: 0.5,
    step: 0.05,
    formatOptions: { style: 'percent' },
  },
}

export const Unit: Story = {
  args: {
    label: 'Temperature',
    defaultValue: 21,
    step: 1,
    formatOptions: { style: 'unit', unit: 'celsius' },
  },
}

export const WithMinMax: Story = {
  args: { label: 'Font size', defaultValue: 14, minValue: 8, maxValue: 32, step: 2 },
}

export const Disabled: Story = {
  args: { label: 'Context window', defaultValue: 4096, isDisabled: true },
}

export const Invalid: Story = {
  args: {
    label: 'Max tokens',
    defaultValue: 9000,
    maxValue: 4096,
    errorMessage: 'Max tokens must be 4,096 or less.',
  },
}

/** Every state together, for visual review. */
export const Gallery: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <NumberField label="Max tokens" defaultValue={1024} />
      <NumberField label="Monthly budget" defaultValue={250} step={10} formatOptions={{ style: 'currency', currency: 'USD' }} description="Billed monthly" />
      <NumberField label="Top-p" defaultValue={0.5} step={0.05} formatOptions={{ style: 'percent' }} />
      <NumberField label="Font size" defaultValue={14} minValue={8} maxValue={32} step={2} />
      <NumberField label="Context window" defaultValue={4096} isDisabled />
      <NumberField label="Max tokens" defaultValue={9000} maxValue={4096} errorMessage="Max tokens must be 4,096 or less." />
    </div>
  ),
}

export const NumberField_test: Story = {
  name: 'NumberField (test)',
  tags: ['!dev', '!autodocs'],
  args: { label: 'Max tokens', defaultValue: 5, minValue: 5, step: 1, onChange: fn() },
  play: async ({ canvas, userEvent, args }) => {
    const decrease = canvas.getByRole('button', { name: /decrease/i })
    const increase = canvas.getByRole('button', { name: /increase/i })
    await expect(decrease).toBeDisabled()
    await userEvent.click(increase)
    await expect(args.onChange).toHaveBeenLastCalledWith(6)
    await expect(decrease).toBeEnabled()
    await userEvent.click(decrease)
    await expect(args.onChange).toHaveBeenLastCalledWith(5)
    await expect(decrease).toBeDisabled()
  },
}

export const KeepsTyped_test: Story = {
  name: 'Keeps what is typed (test)',
  tags: ['!dev', '!autodocs'],
  args: {
    label: 'Monthly budget',
    defaultValue: 250,
    step: 10,
    maxValue: 5000,
    formatOptions: { style: 'currency', currency: 'USD' },
    onChange: fn(),
  },
  play: async ({ canvas, userEvent, args }) => {
    const input = canvas.getByRole('textbox', { name: 'Monthly budget ($)' })
    // The currency symbol is beside the input, not in its text
    await expect(input).toHaveValue('250.00')
    await expect(canvas.getByText('$')).toBeVisible()

    // A value between steps stays as typed
    await userEvent.clear(input)
    await userEvent.type(input, '3906')
    await userEvent.tab()
    await expect(args.onChange).toHaveBeenLastCalledWith(3906)
    await expect(input).toHaveValue('3,906.00')
    await expect(input).not.toHaveAttribute('aria-invalid', 'true')

    // Stepping moves to the next step, and uses text that is not committed yet
    await userEvent.click(canvas.getByRole('button', { name: /^Increase/ }))
    await expect(args.onChange).toHaveBeenLastCalledWith(3910)
    await userEvent.clear(input)
    await userEvent.type(input, '100{ArrowDown}')
    await expect(args.onChange).toHaveBeenLastCalledWith(90)

    // Over the maximum: kept, with an error
    await userEvent.clear(input)
    await userEvent.type(input, '10000')
    await userEvent.tab()
    await expect(input).toHaveValue('10,000.00')
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(canvas.getByText('Must be $5,000.00 or less.')).toBeVisible()
  },
}

export const Percent_test: Story = {
  name: 'Percent (test)',
  tags: ['!dev', '!autodocs'],
  args: { label: 'Top-p', defaultValue: 0.5, step: 0.05, formatOptions: { style: 'percent' }, onChange: fn() },
  play: async ({ canvas, userEvent, args }) => {
    const input = canvas.getByRole('textbox', { name: 'Top-p (%)' })
    await expect(input).toHaveValue('50')
    await userEvent.clear(input)
    await userEvent.type(input, '33.3')
    await userEvent.tab()
    await expect(args.onChange).toHaveBeenLastCalledWith(0.333)
    await expect(input).toHaveValue('33.3')
    await expect(input).not.toHaveAttribute('aria-invalid', 'true')
    await userEvent.click(canvas.getByRole('button', { name: /^Increase/ }))
    await expect(args.onChange).toHaveBeenLastCalledWith(0.35)
  },
}
