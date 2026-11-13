import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, screen, waitFor } from 'storybook/test'
import { Bell, PanelLeft, Settings } from 'lucide-react'
import { IconButton } from '../Button/Button'
import { Toggletip } from './Toggletip'
import { Tooltip } from './Tooltip'

const meta = {
  title: 'Components/Overlays/Tooltip',
  component: Tooltip,
  args: { content: 'Collapse sidebar', shortcut: 'Ctrl+B', children: null },
  argTypes: { placement: { control: 'select', options: ['top', 'bottom', 'left', 'right'] } },
  parameters: {
    docs: {
      description: {
        component:
          'Tooltip is a label for icon-only controls, shown on mouse hover or keyboard focus only (it never opens on ' +
          'touch), so never put essential information in it. Wrap a react-aria focusable (Button, IconButton). ' +
          'It flips to the opposite side near a screen edge and shifts to stay on screen. Use Toggletip for ' +
          'tap-to-open help text that phone users must be able to reach.',
      },
    },
  },
  render: (args) => (
    <div className="p-12">
      <Tooltip {...args}>
        <IconButton aria-label="Collapse sidebar"><PanelLeft /></IconButton>
      </Tooltip>
    </div>
  ),
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Tooltips on a row of icon buttons, with and without shortcuts and in each placement. */
export const Gallery: Story = {
  render: () => (
    <div className="flex gap-3 p-12">
      <Tooltip content="Notifications" placement="top"><IconButton aria-label="Notifications"><Bell /></IconButton></Tooltip>
      <Tooltip content="Settings" shortcut="Ctrl+,"><IconButton aria-label="Settings"><Settings /></IconButton></Tooltip>
      <Tooltip content="Toggle sidebar" placement="right"><IconButton aria-label="Toggle sidebar"><PanelLeft /></IconButton></Tooltip>
    </div>
  ),
}

/** Test for Playground: focusing the button shows the tooltip. */
export const PlaygroundTest: Story = {
  ...Playground,
  name: 'Playground (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Collapse sidebar' })).toHaveFocus()
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeVisible())
    await expect(screen.getByRole('tooltip')).toHaveTextContent('Collapse sidebar')
  },
}

/** One tooltip per side. The arrow points at the trigger on each. */
export const Placements: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-x-24 gap-y-16 p-20">
      {(['top', 'bottom', 'left', 'right'] as const).map((p) => (
        <Tooltip key={p} content={`Placement ${p}`} placement={p} delay={0} isOpen>
          <IconButton aria-label={p}><Bell /></IconButton>
        </Tooltip>
      ))}
    </div>
  ),
}

const corner = (label: string, placement: 'top' | 'bottom' | 'left' | 'right', pos: string) => (
  <div className={`absolute ${pos}`}>
    <Tooltip content={label} placement={placement} isOpen>
      <IconButton aria-label={label}><Bell /></IconButton>
    </Tooltip>
  </div>
)

/** Triggers in the four corners of the screen: tooltips flip to the open side and stay on screen. */
export const NearEdges: Story = {
  name: 'Near edges',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="relative h-screen w-screen">
      {corner('Bottom edge, wants bottom', 'bottom', 'bottom-2 left-2')}
      {corner('Right edge, wants right', 'right', 'right-2 top-2')}
      {corner('Left edge, wants left', 'left', 'bottom-2 right-2')}
      {corner('Top edge, wants top', 'top', 'left-2 top-2')}
    </div>
  ),
}

/** Sidebar items use `placement="right"` so the label sits beside the rail, not over the next item. */
export const SidebarItems: Story = {
  render: () => (
    <nav aria-label="Sidebar" className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-1.5">
      <Tooltip content="Toggle sidebar" shortcut="Ctrl+B" placement="right"><IconButton aria-label="Toggle sidebar"><PanelLeft /></IconButton></Tooltip>
      <Tooltip content="Notifications" placement="right"><IconButton aria-label="Notifications"><Bell /></IconButton></Tooltip>
      <Tooltip content="Settings" placement="right"><IconButton aria-label="Settings"><Settings /></IconButton></Tooltip>
    </nav>
  ),
}

/** Tooltips never open on touch. Toggletip opens on tap, press or Enter, and closes on outside tap or Esc. */
export const ToggletipStory: Story = {
  name: 'Toggletip',
  render: () => (
    <div className="flex items-center gap-1 p-16 text-ui">
      Context window
      <Toggletip aria-label="About the context window">Older messages are summarized once the chat gets long.</Toggletip>
    </div>
  ),
}

/** Test for Toggletip: pressing the info button shows the help text. */
export const ToggletipTest: Story = {
  ...ToggletipStory,
  name: 'Toggletip (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'About the context window' }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible())
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  },
}
