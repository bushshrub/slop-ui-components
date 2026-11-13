import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn } from 'storybook/test'
import { Button } from '../Button/Button'
import { Stepper, type StepProps } from './Stepper'

const steps: StepProps[] = [
  { title: 'Account', description: 'Name and sign-in' },
  { title: 'Workspace', description: 'Name your space' },
  { title: 'Invite team', description: 'Add people later' },
  { title: 'Review', description: 'Check and finish' },
]

const meta = {
  title: 'Components/Navigation/Stepper',
  component: Stepper,
  args: { steps, currentStep: 1, 'aria-label': 'Setup progress' },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    currentStep: { control: { type: 'number', min: 0, max: steps.length - 1 } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Progress through a multi-step flow. Steps before `currentStep` are complete; `status` on a step overrides the derived state, ' +
          'e.g. `error`. Pass `onStepChange` to let people go back to completed steps (and `allowJump` to reach upcoming ones). ' +
          'On phones a horizontal stepper shows only the current title and "Step 2 of 4".',
      },
    },
  },
} satisfies Meta<typeof Stepper>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Workspace').closest('li')).toHaveAttribute('aria-current', 'step')
  },
}

export const Vertical: Story = {
  args: { orientation: 'vertical', currentStep: 2 },
  decorators: [(Story) => <div className="w-80 max-w-full"><Story /></div>],
}

function ClickableDemo() {
  const [step, setStep] = useState(1)
  return (
    <div className="flex flex-col gap-4">
      <Stepper aria-label="Setup progress" steps={steps} currentStep={step} onStepChange={setStep} />
      <div className="flex justify-end gap-2">
        <Button isDisabled={step === 0} onPress={() => setStep((s) => s - 1)}>
          Back
        </Button>
        <Button variant="primary" isDisabled={step === steps.length - 1} onPress={() => setStep((s) => s + 1)}>
          Next
        </Button>
      </div>
    </div>
  )
}

/** Back and Next move the state; completed steps can also be pressed. */
export const Clickable: Story = {
  render: () => <ClickableDemo />,
  decorators: [(Story) => <div className="w-160 max-w-full"><Story /></div>],
}

export const WithError: Story = {
  args: {
    currentStep: 2,
    steps: [
      steps[0],
      steps[1],
      { title: 'Invite team', description: 'Two invites could not be sent', status: 'error' },
      steps[3],
    ],
  },
}

/** Every state together, for visual review. */
export const Gallery: Story = {
  render: () => (
    <div className="flex w-160 max-w-full flex-col gap-10">
      <Stepper aria-label="Horizontal" steps={steps} currentStep={1} />
      <Stepper aria-label="Jump allowed" steps={steps} currentStep={1} allowJump onStepChange={fn()} />
      <Stepper aria-label="With error" steps={steps.map((s, i) => (i === 2 ? { ...s, status: 'error' as const } : s))} currentStep={2} />
      <div className="w-80 max-w-full">
        <Stepper aria-label="Vertical" steps={steps} currentStep={2} orientation="vertical" />
      </div>
    </div>
  ),
}

export const Stepper_test: Story = {
  name: 'Stepper (test)',
  tags: ['!dev', '!autodocs'],
  args: { onStepChange: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByText('Workspace').closest('li')).toHaveAttribute('aria-current', 'step')
    await expect(canvas.queryByRole('button', { name: /Invite team/ })).toBeNull()
    await userEvent.click(canvas.getByRole('button', { name: /Account/ }))
    await expect(args.onStepChange).toHaveBeenCalledWith(0)
  },
}
