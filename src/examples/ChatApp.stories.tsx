import type { Meta, StoryObj } from '@storybook/react-vite'
import { Bot, Folder, MessageSquare, Plus, Search, Settings } from 'lucide-react'
import { expect, fn, screen, waitFor, within } from 'storybook/test'
import { IconButton } from '../components/Button/Button'
import { AppShell, Sidebar, SidebarItem, SidebarSection, SidebarUser } from '../components/Sidebar/Sidebar'
import { AccountMenu } from './AccountMenu'
import { conversations, longTitleConversation, user } from './sample-data'

function ChatSidebar({ onAction }: { onAction?: (key: string) => void }) {
  return (
    <Sidebar
      brand="Slop"
      headerActions={
        <IconButton aria-label="New chat">
          <Plus />
        </IconButton>
      }
      footer={
        <AccountMenu email={user.email} onAction={onAction}>
          <SidebarUser name={user.name} detail={user.plan} />
        </AccountMenu>
      }
    >
      <SidebarSection>
        <SidebarItem href="/" icon={<MessageSquare />} isActive>Chats</SidebarItem>
        <SidebarItem icon={<Search />} shortcut="⌘K">Search</SidebarItem>
        <SidebarItem href="/projects" icon={<Folder />} badge={12}>Projects</SidebarItem>
        <SidebarItem href="/agents" icon={<Bot />} badge={1_204}>Agents</SidebarItem>
        <SidebarItem href="/settings" icon={<Settings />}>Settings</SidebarItem>
      </SidebarSection>
      <SidebarSection title="Recents">
        {[longTitleConversation, ...conversations].map((c) => (
          <SidebarItem key={c.id} href={`/c/${c.id}`}>{c.title}</SidebarItem>
        ))}
      </SidebarSection>
    </Sidebar>
  )
}

const meta = {
  title: 'Examples/Chat app',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Example composition, not a library export: a chat app shell with nav, counts, a long recents list and an ' +
          'account menu in the sidebar footer. Source: `src/examples/ChatApp.stories.tsx` and `AccountMenu.tsx`.',
      },
      story: { inline: false, height: '560px' },
    },
  },
  args: { onAction: fn() },
  render: ({ onAction }) => (
    <AppShell sidebar={<ChatSidebar onAction={onAction} />} mobileHeader={<span className="text-ui font-medium">{conversations[1].title}</span>}>
      <div className="p-8 text-muted">Main content</div>
    </AppShell>
  ),
} satisfies Meta<{ onAction: (key: string) => void }>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: 'Chat app' }

/** Test for Chat app: runs in Vitest and Run tests, hidden from the sidebar and docs so the story loads still. */
export const DefaultTest: Story = {
  ...Default,
  name: 'Chat app (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ args, canvas, userEvent, step }) => {
    const nav = canvas.getByRole('navigation', { name: 'Sidebar' })
    await step('The current page is marked', async () => {
      await expect(within(nav).getByRole('link', { name: 'Chats' })).toHaveAttribute('aria-current', 'page')
    })
    await step('⌘B collapses to a rail that keeps icon labels', async () => {
      await userEvent.keyboard('{Meta>}b{/Meta}')
      await expect(within(nav).queryByText('Recents')).not.toBeInTheDocument()
      await expect(within(nav).getByRole('link', { name: 'Settings' })).toBeVisible()
      await userEvent.click(within(nav).getByRole('button', { name: 'Expand sidebar' }))
      await expect(within(nav).getByText('Recents')).toBeVisible()
    })
    await step('The footer opens the account menu', async () => {
      await userEvent.click(canvas.getByRole('button', { name: new RegExp(user.name) }))
      // A menu is named by its trigger
      const menu = await screen.findByRole('menu', { name: new RegExp(user.name) })
      await waitFor(() => expect(within(menu).getByText(user.email)).toBeVisible()) // pops in from opacity 0
      await expect(within(menu).getByText('⇧⌘,')).toBeVisible()
      await userEvent.hover(within(menu).getByRole('menuitem', { name: /Learn more/ }))
      const sub = await screen.findByRole('menu', { name: /Learn more/ })
      await waitFor(() => expect(within(sub).getByRole('menuitem', { name: /Keyboard shortcuts/ })).toBeVisible())
      await userEvent.click(screen.getByRole('menuitem', { name: /Tutorials/ }))
      await expect(args.onAction).toHaveBeenCalledWith('academy')
    })
  },
}

/** Phone width: the sidebar is a drawer behind the top bar's open button. */
export const OnAPhone: Story = {
  name: 'Chat app on a phone',
  render: ({ onAction }) => (
    <AppShell forceDrawer sidebar={<ChatSidebar onAction={onAction} />} mobileHeader={<span className="text-ui font-medium">{conversations[1].title}</span>}>
      <div className="p-6 text-muted">Main content</div>
    </AppShell>
  ),
}
