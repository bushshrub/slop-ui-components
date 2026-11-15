import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileText, Folder, Home, Inbox, Plus, Settings } from 'lucide-react'
import { expect, screen, waitFor, within } from 'storybook/test'
import { IconButton } from '../Button/Button'
import { AppShell, AsideToggle, Sidebar, SidebarItem, SidebarSection, SidebarUser, type AppShellProps } from './Sidebar'

function DemoSidebar() {
  return (
    <Sidebar
      brand="Acme"
      headerActions={
        <IconButton aria-label="New page">
          <Plus />
        </IconButton>
      }
      footer={<SidebarUser name="Alex Rivera" detail="Admin" />}
    >
      <SidebarSection>
        <SidebarItem href="/" icon={<Home />} isActive>Home</SidebarItem>
        <SidebarItem href="/inbox" icon={<Inbox />} badge={3}>Inbox</SidebarItem>
        <SidebarItem href="/projects" icon={<Folder />}>Projects</SidebarItem>
        <SidebarItem href="/settings" icon={<Settings />}>Settings</SidebarItem>
      </SidebarSection>
      <SidebarSection title="Pages">
        <SidebarItem href="/p/1" icon={<FileText />}>Lorem ipsum</SidebarItem>
        <SidebarItem href="/p/2" icon={<FileText />}>Dolor sit amet</SidebarItem>
        <SidebarItem href="/p/3" icon={<FileText />}>Consectetur adipiscing elit</SidebarItem>
      </SidebarSection>
    </Sidebar>
  )
}

const meta = {
  title: 'Components/Layout/AppShell & Sidebar',
  component: AppShell,
  subcomponents: { Sidebar, SidebarSection, SidebarItem, SidebarUser } as Record<string, React.ComponentType<unknown>>,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '`AppShell` lays out a left `Sidebar` and the main area. Wide screens show it inline and ⌘B collapses it to an ' +
          'icon rail; under 768px it becomes a drawer. An optional `aside` is a right panel from 1280px up and a Sheet under it. For a full app with recents and an account menu, see Examples/Chat app.',
      },
      story: { inline: false, height: '480px' },
    },
  },
  args: { sidebar: <DemoSidebar />, children: null },
  argTypes: { sidebar: { control: false }, children: { control: false }, mobileHeader: { control: false }, aside: { control: false } },
  render: (args: AppShellProps) => (
    <AppShell {...args}>
      <div className="p-8 text-muted">Main content</div>
    </AppShell>
  ),
} satisfies Meta<typeof AppShell>

export default meta
type Story = StoryObj<typeof meta>

/** Sections, an active item, a count and a user in the footer. */
export const Basic: Story = {}

/** Test for Basic: runs in Vitest and Run tests, hidden from the sidebar and docs so the story loads still. */
export const BasicTest: Story = {
  ...Basic,
  name: 'Basic (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, userEvent, step }) => {
    const nav = canvas.getByRole('navigation', { name: 'Sidebar' })
    await step('The current page is marked', async () => {
      await expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
    })
    await step('⌘B collapses to a rail that keeps icon labels', async () => {
      await userEvent.keyboard('{Meta>}b{/Meta}')
      await expect(within(nav).queryByText('Pages')).not.toBeInTheDocument()
      await expect(within(nav).getByRole('link', { name: 'Settings' })).toBeVisible()
    })
    await step('The toggle expands it again', async () => {
      await userEvent.click(within(nav).getByRole('button', { name: 'Expand sidebar' }))
      await expect(within(nav).getByText('Pages')).toBeVisible()
    })
  },
}

/** Starts as an icon rail, e.g. when the user collapsed it last session. */
export const CollapsedRail: Story = {
  name: 'Collapsed to an icon rail',
  args: { defaultCollapsed: true },
}

/** Phone width: AppShell adds a top bar with the open button; the drawer covers the screen. */
export const PhoneDrawer: Story = {
  name: 'On a phone',
  args: { forceDrawer: true, mobileHeader: <span className="text-ui font-medium">Lorem ipsum</span> },
}

/** Test for On a phone: runs in Vitest and Run tests, hidden from the sidebar and docs so the story loads still. */
export const PhoneDrawerTest: Story = {
  ...PhoneDrawer,
  name: 'On a phone (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, userEvent, step }) => {
    await step('Open the drawer', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Open sidebar' }))
      const nav = await screen.findByRole('navigation', { name: 'Sidebar' })
      // The backdrop fades in from opacity 0, so wait it out rather than check mid-animation.
      await waitFor(() => expect(nav).toBeVisible())
    })
    await step('Picking a page closes it', async () => {
      await userEvent.click(screen.getByRole('link', { name: /Projects/ }))
      await waitFor(() => expect(screen.queryByRole('navigation', { name: 'Sidebar' })).not.toBeInTheDocument())
    })
  },
}

const details = (
  <div className="flex flex-col gap-2 p-4 text-ui">
    <h2 className="m-0 font-serif text-lg font-normal">Order #1042</h2>
    <p className="m-0 text-muted">Shipped on 3 March to Lorem Ipsum.</p>
  </div>
)

/** Wide screens: the aside is a right panel next to the main area. */
export const WithAside: Story = {
  name: 'With an aside',
  args: { aside: details, asideTitle: 'Order details', forceAsideSheet: false },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('complementary', { name: 'Order details' })).toBeVisible()
  },
}

/** Under 1280px the aside collapses into a Sheet that `AsideToggle` opens. */
export const AsideAsSheet: Story = {
  name: 'Aside as a sheet',
  args: { aside: details, asideTitle: 'Order details', forceAsideSheet: true },
  render: (args: AppShellProps) => (
    <AppShell {...args}>
      <div className="flex items-center gap-2 p-4">
        <AsideToggle />
        <span className="text-muted">Main content</span>
      </div>
    </AppShell>
  ),
  play: async ({ canvas, userEvent, step }) => {
    await step('The panel is not inline', async () => {
      await expect(canvas.queryByRole('complementary')).not.toBeInTheDocument()
    })
    await step('The toggle opens a sheet', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Show details' }))
      const dialog = await screen.findByRole('dialog', { name: 'Order details' })
      await waitFor(() => expect(dialog).toBeVisible())
      await expect(within(dialog).getByText('Shipped on 3 March to Lorem Ipsum.')).toBeVisible()
    })
    await step('Close brings back the page', async () => {
      await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Close' }))
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    })
  },
}
