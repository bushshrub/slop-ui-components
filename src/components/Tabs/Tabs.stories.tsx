import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, waitFor } from 'storybook/test'
import { Bell, Palette, Settings2 } from 'lucide-react'
import { Tab, TabList, TabPanel, Tabs, TabSection } from './Tabs'

const meta = {
  title: 'Components/Navigation/Tabs',
  component: Tabs,
  args: { onSelectionChange: fn() },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Switches between panels in place. Horizontal for a few views of one thing; vertical for settings-style ' +
          'pages with many sections, which falls back to a scrolling strip under 768px.',
      },
    },
  },
  render: (args) => (
    <Tabs {...args} className="h-64 w-[36rem] max-w-full rounded-lg border border-border bg-popover">
      <TabList aria-label="Project">
        <Tab id="chats">Chats</Tab>
        <Tab id="files">Files</Tab>
        <Tab id="instructions">Instructions</Tab>
        <Tab id="members">Members</Tab>
      </TabList>
      {['chats', 'files', 'instructions', 'members'].map((id) => (
        <TabPanel key={id} id={id} className="p-4 text-ui text-muted">
          The {id} of this project.
        </TabPanel>
      ))}
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {}

/** Side tabs with icons, as in a settings dialog. Narrow the viewport to see the strip fallback. */
export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <Tabs {...args} className="h-64 w-[36rem] max-w-full rounded-lg border border-border bg-popover">
      <TabList aria-label="Settings sections">
        <Tab id="general" icon={<Settings2 />}>General</Tab>
        <Tab id="appearance" icon={<Palette />}>Appearance</Tab>
        <Tab id="notifications" icon={<Bell />}>Notifications</Tab>
      </TabList>
      {['general', 'appearance', 'notifications'].map((id) => (
        <TabPanel key={id} id={id} className="p-4 text-ui text-muted">
          {id[0].toUpperCase() + id.slice(1)} settings go here.
        </TabPanel>
      ))}
    </Tabs>
  ),
}

/** Test for Horizontal: runs in Vitest and Run tests, hidden from the sidebar and docs so the story loads still. */
/** `TabSection` groups a vertical list: a divider before each group and an optional heading. */
export const Sections: Story = {
  name: 'Vertical with sections',
  args: { orientation: 'vertical' },
  render: (args) => (
    <Tabs {...args} className="h-80">
      <TabList aria-label="Settings">
        <TabSection>
          <Tab id="account">Account</Tab>
          <Tab id="appearance">Appearance</Tab>
        </TabSection>
        <TabSection title="Workspace">
          <Tab id="members">Members</Tab>
          <Tab id="billing">Billing</Tab>
        </TabSection>
        <TabSection title="Admin">
          <Tab id="limits">Limits</Tab>
        </TabSection>
      </TabList>
      {['account', 'appearance', 'members', 'billing', 'limits'].map((id) => (
        <TabPanel key={id} id={id} className="p-4 text-ui">
          {id}
        </TabPanel>
      ))}
    </Tabs>
  ),
}

/** Test for Vertical with sections: hidden from the sidebar and docs. */
export const SectionsTest: Story = {
  ...Sections,
  name: 'Vertical with sections (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, userEvent }) => {
    // Headings are drawn by the tabs, so they must not leak into the tab names
    const members = canvas.getByRole('tab', { name: 'Members' })
    await expect(getComputedStyle(members, '::after').content).toContain('Workspace')
    await expect(canvas.getAllByRole('tab')).toHaveLength(5)
    // Arrow keys cross section boundaries as one list
    await userEvent.click(canvas.getByRole('tab', { name: 'Appearance' }))
    await userEvent.keyboard('{ArrowDown}')
    await expect(members).toHaveAttribute('aria-selected', 'true')
  },
}

export const HorizontalTest: Story = {
  ...Horizontal,
  name: 'Horizontal (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('tab', { name: 'Files' }))
    await expect(args.onSelectionChange).toHaveBeenCalledWith('files')
    await waitFor(() => expect(canvas.getByRole('tabpanel')).toHaveTextContent('The files of this project.'))
    await userEvent.keyboard('{ArrowRight}')
    await expect(canvas.getByRole('tab', { name: 'Instructions' })).toHaveAttribute('aria-selected', 'true')
  },
}
