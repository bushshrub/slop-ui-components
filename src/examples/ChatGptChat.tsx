import { useState } from 'react'
import { ArrowUp, AudioLines, Blocks, CalendarClock, Compass, Ellipsis, Folder, Images, Library, Mic, Plus, Search, Share, SquarePen } from 'lucide-react'
import { Button, IconButton } from '../components/Button/Button'
import { AppShell, Sidebar, SidebarItem, SidebarSection, SidebarUser } from '../components/Sidebar/Sidebar'
import { AccountMenu } from './AccountMenu'
import { ComposerInput, MessageActions, ModelMenu, composerBoxClass } from './ChatParts'
import { conversations, thinkingLevels, user, type Message } from './sample-data'

export interface ChatGptChatProps {
  /** Empty shows the new-chat screen with the composer in the middle. */
  messages?: Message[]
  /** Force the phone layout (for stories and tests). */
  forceDrawer?: boolean
  onSend?: (text: string) => void
  onAction?: (key: string) => void
}

/**
 * Example composition, not a library export: a chat interface laid out like chatgpt.com. The model menu is at the
 * top left; a pill composer sits in the middle of a new chat and at the bottom of a conversation. The stories add
 * `chatgpt-theme.css`, which overrides the kit's color and font tokens.
 */
export function ChatGptChat({ messages = [], forceDrawer, onSend, onAction }: ChatGptChatProps) {
  const [text, setText] = useState('')
  const [model, setModel] = useState(thinkingLevels[0].id)
  const send = () => {
    if (!text.trim()) return
    onSend?.(text.trim())
    setText('')
  }
  const empty = messages.length === 0

  const composer = (
    <div className={`flex w-full max-w-3xl items-end gap-1 rounded-[1.75rem] p-2 ${composerBoxClass.field}`}>
      <IconButton aria-label="Add files and more" className="rounded-full" onPress={() => onAction?.('attach')}><Plus /></IconButton>
      <div className="flex min-w-0 flex-1 self-center px-1">
        <ComposerInput value={text} onChange={setText} onSend={send} placeholder={empty ? 'Ask anything' : 'Ask ChatGPT'} />
      </div>
      <IconButton aria-label="Dictate" className="rounded-full" onPress={() => onAction?.('dictate')}><Mic /></IconButton>
      {text.trim() ? (
        <IconButton variant="primary" aria-label="Send message" className="rounded-full" onPress={send}><ArrowUp /></IconButton>
      ) : (
        <IconButton variant="primary" aria-label="Use voice mode" className="rounded-full" onPress={() => onAction?.('voice')}><AudioLines /></IconButton>
      )}
    </div>
  )

  const disclaimer = <p className="px-4 py-2 text-center text-ui-sm text-muted">ChatGPT can make mistakes. Check important info.</p>

  return (
    <AppShell
      forceDrawer={forceDrawer}
      mobileHeader={<span className="text-ui font-medium">ChatGPT</span>}
      sidebar={
        <Sidebar
          brand={<span className="font-semibold">ChatGPT</span>}
          headerActions={<IconButton aria-label="Search chats" shortcut="⌘K" onPress={() => onAction?.('search')}><Search /></IconButton>}
          footer={
            <AccountMenu email={user.email} onAction={onAction}>
              <SidebarUser name={user.name} />
            </AccountMenu>
          }
        >
          <SidebarSection>
            <SidebarItem href="/" icon={<SquarePen />} shortcut="⇧⌘O">New chat</SidebarItem>
            <SidebarItem href="/images" icon={<Images />}>Images</SidebarItem>
            <SidebarItem href="/scheduled" icon={<CalendarClock />}>Scheduled</SidebarItem>
            <SidebarItem href="/library" icon={<Library />}>Library</SidebarItem>
            <SidebarItem href="/plugins" icon={<Blocks />}>Plugins</SidebarItem>
            <SidebarItem href="/explore" icon={<Compass />}>Explore</SidebarItem>
          </SidebarSection>
          <SidebarSection title="Projects">
            <SidebarItem href="/p/1" icon={<Folder />}>Dolor sit amet</SidebarItem>
            <SidebarItem href="/p/2" icon={<Folder />}>Tempor incididunt</SidebarItem>
          </SidebarSection>
          <SidebarSection title="Recents">
            {conversations.map((c, i) => (
              <SidebarItem key={c.id} href={`/c/${c.id}`} isActive={!empty && i === 0}>{c.title}</SidebarItem>
            ))}
          </SidebarSection>
        </Sidebar>
      }
    >
      <div className="flex flex-1 flex-col">
        <div className="flex h-12 shrink-0 items-center gap-1 px-3">
          <ModelMenu models={thinkingLevels} value={model} onChange={setModel} placement="bottom start" label="ChatGPT" />
          <div className="flex-1" />
          {!empty && <Button variant="ghost" size="sm" icon={<Share />} onPress={() => onAction?.('share')}>Share</Button>}
          {!empty && <IconButton size="sm" aria-label="More" onPress={() => onAction?.('more')}><Ellipsis /></IconButton>}
        </div>
        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 pb-16">
            <h1 className="text-center text-2xl text-fg">What are you working on?</h1>
            {composer}
          </div>
        ) : (
          <>
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-4">
              {messages.map((m) =>
                m.role === 'user' ? (
                  <div key={m.id} className="max-w-[80%] self-end rounded-3xl bg-button px-4 py-2.5 text-ui leading-6 text-fg">
                    {m.text.join('\n\n')}
                  </div>
                ) : (
                  <div key={m.id} className="flex flex-col gap-2">
                    <div className="flex flex-col gap-3 text-ui leading-6 text-fg">
                      {m.text.map((p) => <p key={p}>{p}</p>)}
                    </div>
                    <MessageActions onAction={onAction} />
                  </div>
                ),
              )}
            </div>
            <div className="sticky bottom-0 flex flex-col items-center bg-bg px-4 pt-1">
              {composer}
              {disclaimer}
            </div>
          </>
        )}
        {empty && disclaimer}
      </div>
    </AppShell>
  )
}
