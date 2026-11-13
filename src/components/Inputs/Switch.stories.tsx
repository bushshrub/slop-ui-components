import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Switch } from './Switch'

const meta = {
  title: 'Components/Inputs/Switch',
  component: Switch,
  args: { children: 'Show timestamps', onChange: fn() },
  argTypes: {
    toggleSide: { control: 'inline-radio', options: ['start', 'end'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'On/off toggle for one setting that applies immediately. Use Checkbox inside forms with a Save button, ' +
          'or when picking several items from a list. Track size comes from `--ui-switch`.',
      },
    },
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByText('Show timestamps'))
    await expect(args.onChange).toHaveBeenCalledWith(true)
    await expect(canvas.getByRole('switch')).toBeChecked()
  },
}

/** Toggle at the far right of a settings row, with a description under the label. */
export const SettingsRow: Story = {
  args: {
    children: 'Typing effect',
    description: 'Animate replies as they stream in.',
    toggleSide: 'end',
    defaultSelected: true,
  },
  decorators: [(Story) => <div className="w-96 max-w-full"><Story /></div>],
}

/** Every state together, for visual review. */
export const Gallery: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Switch>Off</Switch>
      <Switch defaultSelected>On</Switch>
      <Switch isDisabled>Disabled</Switch>
      <Switch isDisabled defaultSelected>Disabled, on</Switch>
    </div>
  ),
}
