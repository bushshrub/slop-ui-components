import type { Meta, StoryObj } from '@storybook/react-vite'
import { Cpu, HardDrive, Server, Zap } from 'lucide-react'
import { expect, fn } from 'storybook/test'
import { RadioCards } from './RadioCards'

const sizes = [
  { id: 'small', title: 'Small', icon: <Cpu />, meta: '$4/mo', description: '1 vCPU · 1 GB RAM · 25 GB disk' },
  { id: 'medium', title: 'Medium', icon: <Server />, meta: '$12/mo', description: '2 vCPU · 4 GB RAM · 80 GB disk' },
  { id: 'large', title: 'Large', icon: <HardDrive />, meta: '$48/mo', description: '8 vCPU · 16 GB RAM · 320 GB disk' },
]

const meta = {
  title: 'Components/Inputs/RadioCards',
  component: RadioCards,
  args: {
    label: 'Instance size',
    options: sizes,
    defaultValue: 'medium',
    onChange: fn(),
  },
  argTypes: {
    columns: { control: 'inline-radio', options: [1, 2, 3, 4] },
    errorMessage: { control: 'text' },
    options: { control: false },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A radio group drawn as cards, for choices that need a description or a price. ' +
          'It behaves like any radio group: Tab enters, arrows move and select.',
      },
    },
  },
} satisfies Meta<typeof RadioCards>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { description: 'You can resize later; disk only grows.' },
}

/** Picking a bigger instance with arrow keys, the way radio groups work. */
export const UpgradeWithArrowKeys: Story = {
  name: 'Upgrade to a larger instance with the keyboard',
  play: async ({ args, canvas, userEvent, step }) => {
    await step('Tab lands on the selected card', async () => {
      await userEvent.tab()
      await expect(canvas.getByRole('radio', { name: /Medium/ })).toHaveFocus()
    })
    await step('Arrow right selects Large', async () => {
      await userEvent.keyboard('{ArrowRight}')
      await expect(canvas.getByRole('radio', { name: /Large/ })).toBeChecked()
      await expect(args.onChange).toHaveBeenLastCalledWith('large')
    })
  },
}

/** Required with nothing picked, a sold-out option and long copy. */
export const SoldOutAndRequired: Story = {
  name: 'Region required, one sold out',
  args: {
    label: 'Region',
    columns: 2,
    defaultValue: undefined,
    isRequired: true,
    errorMessage: 'Pick a region to continue.',
    options: [
      { id: 'fra', title: 'Frankfurt', meta: '12 ms', description: 'eu-central · closest to you' },
      { id: 'ams', title: 'Amsterdam', meta: '18 ms', description: 'eu-west' },
      { id: 'iad', title: 'Ashburn', meta: '94 ms', description: 'us-east · sold out until December', isDisabled: true },
      {
        id: 'sin',
        title: 'Singapore with an unreasonably long region name that has to truncate',
        meta: '1,204 ms',
        icon: <Zap />,
        description: 'ap-southeast',
      },
    ],
  },
}
