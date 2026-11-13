import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../Button/Button'
import { Select } from '../Inputs/Select'
import { Switch } from '../Inputs/Switch'
import { TextField } from '../Inputs/TextField'
import { SettingsGroup, SettingsRow } from './Settings'

const meta = {
  title: 'Components/Layout/Settings',
  component: SettingsGroup,
  parameters: {
    docs: {
      description: {
        component:
          '`SettingsRow` puts a label and help text on the left and a control on the right. `SettingsGroup` stacks rows ' +
          'between hairlines under an optional heading.',
      },
    },
  },
  args: { title: 'Notifications', description: 'Choose what reaches you.', children: null },
  render: (args) => (
    <SettingsGroup {...args} className="max-w-xl" actions={<Button size="sm">Reset</Button>}>
      <SettingsRow label="Email digests" description="A weekly summary of activity.">
        <Switch aria-label="Email digests" defaultSelected />
      </SettingsRow>
      <SettingsRow label="Language">
        <Select
          aria-label="Language"
          variant="quiet"
          defaultValue="en"
          options={[
            { id: 'en', label: 'English' },
            { id: 'de', label: 'Deutsch' },
          ]}
        />
      </SettingsRow>
      <SettingsRow label="Signature" description="Added to the end of every message." layout="stacked">
        <TextField aria-label="Signature" multiline rows={2} />
      </SettingsRow>
      <SettingsRow label="Export data" description="Download everything as a zip file.">
        <Button>Export</Button>
      </SettingsRow>
    </SettingsGroup>
  ),
} satisfies Meta<typeof SettingsGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Main: Story = { name: 'Settings' }
