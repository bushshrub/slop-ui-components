import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, screen, waitFor } from 'storybook/test'
import { Breadcrumbs } from './Breadcrumbs'

const meta = {
  title: 'Components/Navigation/Breadcrumbs',
  component: Breadcrumbs,
  args: {
    items: [
      { id: 'projects', label: 'Projects', href: '#projects' },
      { id: 'slop', label: 'Slop UI', href: '#slop' },
      { id: 'settings', label: 'Settings' },
    ],
  },
  argTypes: { maxItems: { control: { type: 'number', min: 2 } } },
  parameters: {
    docs: {
      description: {
        component:
          'Trail of parent pages ending in the current one, which is plain text with `aria-current`. ' +
          'When there are more than `maxItems` (default 4) the first item and the last ones stay and the middle ' +
          'collapses into a "…" menu.',
      },
    },
  },
} satisfies Meta<typeof Breadcrumbs>

export default meta
type Story = StoryObj<typeof meta>

export const Main: Story = {}

const longTrail = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'org', label: 'Acme Inc', href: '#org' },
  { id: 'projects', label: 'Projects', href: '#projects' },
  { id: 'slop', label: 'Slop UI', href: '#slop' },
  { id: 'settings', label: 'Settings', href: '#settings' },
  { id: 'members', label: 'Members' },
]

/** Six levels with the default `maxItems`: Home › … › Settings › Members. */
export const Collapsed: Story = {
  args: { items: longTrail },
}

/** Items can call `onAction` instead of linking, for client-side routing. */
export const WithActions: Story = {
  args: {
    items: [
      { id: 'a', label: 'Workspace', onAction: fn() },
      { id: 'b', label: 'Billing', onAction: fn() },
      { id: 'c', label: 'Invoices' },
    ],
  },
}

export const Collapsed_test: Story = {
  ...Collapsed,
  name: 'Collapsed (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.queryByText('Acme Inc')).not.toBeInTheDocument()
    await expect(canvas.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(canvas.getByText('Members')).toHaveAttribute('aria-current', 'page')
    await userEvent.click(canvas.getByRole('button', { name: /hidden levels/ }))
    const menu = await screen.findByRole('menu')
    await waitFor(() => expect(menu).toBeVisible())
    await expect(screen.getByRole('menuitem', { name: 'Acme Inc' })).toBeVisible()
    await expect(screen.getByRole('menuitem', { name: 'Projects' })).toBeVisible()
    await expect(screen.getByRole('menuitem', { name: 'Slop UI' })).toBeVisible()
  },
}
