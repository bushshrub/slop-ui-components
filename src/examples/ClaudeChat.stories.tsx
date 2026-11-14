import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, screen, waitFor, within } from 'storybook/test'
import { ClaudeChat } from './ClaudeChat'
import { messages } from './sample-data'

const meta = {
  title: 'Examples/Claude-style chat',
  component: ClaudeChat,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Example composition, not a library export: the layout of the Claude web app built from AppShell, Sidebar, Menu, ' +
          'Button and IconButton, in this kit\'s own colors. Source: `src/examples/ClaudeChat.tsx` and `ChatParts.tsx`.',
      },
      story: { inline: false, height: '640px' },
    },
  },
  args: { onSend: fn(), onAction: fn() },
} satisfies Meta<typeof ClaudeChat>

export default meta
type Story = StoryObj<typeof meta>

export const NewChat: Story = { name: 'New chat' }

export const Conversation: Story = { args: { messages } }

/** Phone width: the sidebar is a drawer, and the composer stays at the bottom of the conversation. */
export const OnAPhone: Story = {
  name: 'On a phone',
  args: { messages, forceDrawer: true },
  globals: { viewport: { value: 'mobile1' } },
}

/** Test for New chat: runs in Vitest and Run tests, hidden from the sidebar and docs so the story loads still. */
export const NewChatTest: Story = {
  ...NewChat,
  name: 'New chat (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ args, canvas, userEvent, step }) => {
    await step('Enter sends the trimmed message and clears the field', async () => {
      const field = canvas.getByRole('textbox', { name: 'Message' })
      await userEvent.type(field, ' Lorem ipsum{Enter}')
      await expect(args.onSend).toHaveBeenCalledWith('Lorem ipsum')
      await expect(field).toHaveValue('')
    })
    await step('The model menu changes the model on its button', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /model: /i }))
      const menu = await screen.findByRole('menu')
      const options = within(menu).getAllByRole('menuitemradio')
      const picked = options.find((o) => o.getAttribute('aria-checked') !== 'true')!
      const label = picked.textContent!
      await userEvent.click(picked)
      // The item's text is its label followed by its description
      await waitFor(() => expect(label).toContain(canvas.getByRole('button', { name: /model: /i }).getAttribute('aria-label')!.split('odel: ')[1]))
    })
  },
}
