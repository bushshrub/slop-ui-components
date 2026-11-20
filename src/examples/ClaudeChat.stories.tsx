import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, screen, waitFor, within } from 'storybook/test'
import { useEffect, useRef, useState } from 'react'
import { ClaudeChat } from './ClaudeChat'
import { messages, type Message } from './sample-data'

/** What the scripted assistant does for each question: named steps, then a reply streamed word by word. */
const script = {
  prompt: 'Lorem ipsum dolor sit amet, what changed since last week?',
  steps: [
    { label: 'Thinking', ms: 1600 },
    { label: 'Searching 12 sources', ms: 1800 },
    { label: 'Reading 3 files', ms: 1400 },
  ],
  reply: [
    'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est.',
    'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.',
  ],
  msPerWord: 35,
}

/** Plays the script after each message: the steps as shimmering status, then the reply arriving a few words at a time. */
function ScriptedChat({ autoStart = true, ...args }: React.ComponentProps<typeof ClaudeChat> & { autoStart?: boolean }) {
  const [thread, setThread] = useState<Message[]>([])
  const [thinking, setThinking] = useState<string>()
  const [streaming, setStreaming] = useState(false)
  const timers = useRef<number[]>([])
  const later = (ms: number, f: () => void) => timers.current.push(window.setTimeout(f, ms))

  const ask = (text: string) => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    const id = `msg_${Date.now()}`
    setThread((t) => [...t, { id: `${id}_q`, role: 'user', text: [text] }])
    let at = 0
    for (const step of script.steps) {
      later(at, () => setThinking(step.label))
      at += step.ms
    }
    const words = script.reply.map((p) => p.split(' '))
    const total = words.flat().length
    later(at, () => {
      setThinking(undefined)
      setStreaming(true)
    })
    for (let n = 1; n <= total; n++) {
      later(at + n * script.msPerWord, () => {
        // The first n words, kept in their paragraphs
        let left = n
        const text = words.map((w) => w.slice(0, Math.max(0, (left -= w.length) + w.length)).join(' ')).filter(Boolean)
        setThread((t) => [...t.filter((m) => m.id !== `${id}_a`), { id: `${id}_a`, role: 'assistant', text }])
        if (n === total) setStreaming(false)
      })
    }
  }

  useEffect(() => {
    if (autoStart) later(600, () => ask(script.prompt))
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
    // Once, on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ClaudeChat
      {...args}
      messages={thread}
      thinking={thinking}
      streaming={streaming}
      onSend={(text) => {
        args.onSend?.(text)
        ask(text)
      }}
    />
  )
}

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

/**
 * A scripted reply: the assistant's steps show as shimmering status text ("Thinking", "Searching 12 sources"),
 * then the answer streams in. It plays once on load; send any message to play it again.
 */
export const ScriptedReply: Story = {
  name: 'Scripted reply',
  render: (args) => <ScriptedChat {...args} />,
}

/** Phone width: the sidebar is a drawer, and the composer stays at the bottom of the conversation. */
export const OnAPhone: Story = {
  name: 'On a phone',
  args: { messages, forceDrawer: true },
  globals: { viewport: { value: 'mobile1' } },
}

/** Test for the scripted reply: hidden from the sidebar and docs. */
export const ScriptedReplyTest: Story = {
  name: 'Scripted reply (test)',
  tags: ['!dev', '!autodocs'],
  render: (args) => <ScriptedChat {...args} autoStart={false} />,
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole('textbox', { name: 'Message' }), 'Lorem{Enter}')
    await expect(args.onSend).toHaveBeenCalledWith('Lorem')
    // The status names each step, then clears when the answer starts
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Thinking'))
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Searching 12 sources'), { timeout: 4000 })
    await waitFor(() => expect(canvas.getByText(/^Nam libero/)).toBeVisible(), { timeout: 6000 })
    await expect(canvas.getByRole('status')).toBeEmptyDOMElement()
    // Copy and the other actions appear once the whole answer is in
    await waitFor(() => expect(canvas.getByText(/non recusandae\.$/)).toBeVisible(), { timeout: 8000 })
    await expect(canvas.getByRole('button', { name: /copy/i })).toBeVisible()
  },
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
