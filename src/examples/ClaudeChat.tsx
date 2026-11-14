import { useState } from 'react'
import { ArrowUp, AudioLines, Briefcase, ChevronDown, Clock, Code, FileText, Folder, Ghost, MessageCircle, Mic, Plus, Search, Shapes, Share } from 'lucide-react'
import { Button as AriaButton } from 'react-aria-components'
import { Button, IconButton } from '../components/Button/Button'
import { AppShell, Sidebar, SidebarItem, SidebarSection, SidebarUser } from '../components/Sidebar/Sidebar'
import { AccountMenu } from './AccountMenu'
import { ComposerInput, MessageActions, ModelMenu, composerBoxClass } from './ChatParts'
import { conversations, models, user, type Message } from './sample-data'

const pinned = ['Dolor sit amet', 'Tempor incididunt', 'Ut labore']

const artifacts = [
  { id: 'art_1', title: 'Lorem ipsum dolor sit amet', date: 'Nov 5' },
  { id: 'art_2', title: 'Consectetur adipiscing', date: 'Oct 29' },
  { id: 'art_3', title: 'Sed do eiusmod', date: 'Oct 24' },
]

// The one accent-colored control: the kit's buttons are ink, so this is drawn here
const sendClass =
  'flex size-control shrink-0 items-center justify-center rounded-md bg-accent text-accent-fg outline-none transition-colors touch:size-control-touch ' +
  'data-hovered:opacity-90 data-pressed:opacity-80 ' +
  'data-focus-visible:outline-2 data-focus-visible:outline-solid data-focus-visible:outline-offset-2 data-focus-visible:outline-focus [&_svg]:size-icon'

const artifactClass =
  'flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-surface text-left outline-none ' +
  'data-hovered:border-border-strong data-focus-visible:outline-2 data-focus-visible:outline-solid data-focus-visible:outline-offset-2 data-focus-visible:outline-focus'

export interface ClaudeChatProps {
  /** Empty shows the greeting with the composer in the middle. */
  messages?: Message[]
  /** Force the phone layout (for stories and tests). */
  forceDrawer?: boolean
  onSend?: (text: string) => void
  onAction?: (key: string) => void
}

/**
 * Example composition, not a library export: a chat interface laid out like claude.ai, drawn with this kit's
 * tokens. A serif greeting, a card composer with the project and model pickers on a line under it, and recent
 * artifacts below; answers are set in the serif font.
 */
export function ClaudeChat({ messages = [], forceDrawer, onSend, onAction }: ClaudeChatProps) {
  const [text, setText] = useState('')
  const [model, setModel] = useState(models[1].id)
  const send = () => {
    if (!text.trim()) return
    onSend?.(text.trim())
    setText('')
  }
  const empty = messages.length === 0

  const composer = (
    <div className="flex w-full max-w-3xl flex-col gap-1">
      <div className={`flex flex-col gap-3 rounded-2xl p-3 ${composerBoxClass.surface}`}>
        <div className="flex px-1 pt-0.5">
          <ComposerInput value={text} onChange={setText} onSend={send} placeholder={empty ? 'Type / for skills' : 'Reply to Claude'} />
        </div>
        <div className="flex items-center gap-1">
          <IconButton aria-label="Add files, connectors and more" onPress={() => onAction?.('attach')}><Plus /></IconButton>
          <div className="flex-1" />
          <IconButton aria-label="Dictate" onPress={() => onAction?.('dictate')}><Mic /></IconButton>
          {text.trim() ? (
            <AriaButton aria-label="Send message" onPress={send} className={sendClass}><ArrowUp /></AriaButton>
          ) : (
            <IconButton aria-label="Use voice mode" onPress={() => onAction?.('voice')}><AudioLines /></IconButton>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 px-1">
        {empty && (
          <Button variant="ghost" size="sm" onPress={() => onAction?.('project')}>
            Project
            <ChevronDown aria-hidden className="text-muted" />
          </Button>
        )}
        <div className="flex-1" />
        <ModelMenu models={models} value={model} onChange={setModel} />
      </div>
    </div>
  )

  return (
    <AppShell
      forceDrawer={forceDrawer}
      mobileHeader={<span className="font-serif text-base">Claude</span>}
      sidebar={
        <Sidebar
          brand="Claude"
          headerActions={
            <>
              <IconButton variant="secondary" aria-label="Chat" onPress={() => onAction?.('mode-chat')}><MessageCircle /></IconButton>
              <IconButton aria-label="Code" onPress={() => onAction?.('mode-code')}><Code /></IconButton>
            </>
          }
          footer={
            <AccountMenu email={user.email} onAction={onAction}>
              <SidebarUser name={user.name} detail={user.plan} />
            </AccountMenu>
          }
        >
          <SidebarSection>
            <SidebarItem href="/new" icon={<Plus />} isActive={empty}>New</SidebarItem>
            <SidebarItem icon={<Search />}>Search</SidebarItem>
            <SidebarItem href="/projects" icon={<Folder />}>Projects</SidebarItem>
            <SidebarItem href="/artifacts" icon={<Shapes />}>Artifacts</SidebarItem>
            <SidebarItem href="/scheduled" icon={<Clock />}>Scheduled</SidebarItem>
            <SidebarItem href="/customize" icon={<Briefcase />}>Customize</SidebarItem>
          </SidebarSection>
          <SidebarSection title="Pinned">
            {pinned.map((p, i) => (
              <SidebarItem key={p} href={`/project/${i}`} icon={<Folder />}>{p}</SidebarItem>
            ))}
          </SidebarSection>
          <SidebarSection title="Recents">
            {conversations.map((c, i) => (
              <SidebarItem key={c.id} href={`/chat/${c.id}`} isActive={!empty && i === 0}>{c.title}</SidebarItem>
            ))}
          </SidebarSection>
        </Sidebar>
      }
    >
      <div className="flex flex-1 flex-col">
        <div className="flex h-12 shrink-0 items-center gap-2 px-3">
          {empty ? <div className="flex-1" /> : <h1 className="min-w-0 flex-1 truncate px-1 text-ui font-medium text-fg">{conversations[0].title}</h1>}
          {empty ? (
            <IconButton aria-label="Incognito chat" tooltipPlacement="bottom" onPress={() => onAction?.('incognito')}><Ghost /></IconButton>
          ) : (
            <Button variant="ghost" size="sm" icon={<Share />} onPress={() => onAction?.('share')}>Share</Button>
          )}
        </div>
        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 pb-12">
            <h1 className="flex items-center justify-center gap-3 text-center font-serif text-4xl text-fg max-md:text-3xl">
              <Sparkle />
              Good evening, {user.name.split(' ')[0]}
            </h1>
            {composer}
            <section aria-labelledby="recent-artifacts" className="flex w-full max-w-3xl flex-col gap-2 pt-6">
              <div className="flex items-center justify-between px-1">
                <h2 id="recent-artifacts" className="text-ui text-muted">Recent artifacts</h2>
                <Button variant="ghost" size="sm" onPress={() => onAction?.('artifacts')}>View all</Button>
              </div>
              <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
                {artifacts.map((a) => (
                  <AriaButton key={a.id} className={artifactClass} onPress={() => onAction?.(a.id)}>
                    <span className="flex h-24 items-center justify-center bg-track text-subtle max-sm:hidden">
                      <FileText aria-hidden className="size-6" />
                    </span>
                    <span className="flex items-baseline gap-2 px-3 py-2.5">
                      <span className="min-w-0 flex-1 truncate text-ui text-fg">{a.title}</span>
                      <span className="shrink-0 text-ui-sm text-muted">{a.date}</span>
                    </span>
                  </AriaButton>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <>
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-4">
              {messages.map((m) =>
                m.role === 'user' ? (
                  <div key={m.id} className="max-w-[85%] self-end rounded-xl bg-button px-4 py-2.5 text-ui leading-6 text-fg">
                    {m.text.join('\n\n')}
                  </div>
                ) : (
                  <div key={m.id} className="flex flex-col gap-2">
                    <div className="flex flex-col gap-3 font-serif text-base leading-7 text-fg">
                      {m.text.map((p) => <p key={p}>{p}</p>)}
                    </div>
                    <MessageActions onAction={onAction} />
                  </div>
                ),
              )}
            </div>
            <div className="sticky bottom-0 flex flex-col items-center bg-bg px-4 pt-1">
              {composer}
              <p className="pb-2 text-center text-ui-sm text-muted">Claude is AI and can make mistakes. Please double-check responses.</p>
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}

/** Many-pointed spark in the accent color, next to the greeting. */
function Sparkle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true" className="size-8 shrink-0 text-accent max-md:size-6">
      <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4M8.5 3.7l7 16.6M15.5 3.7l-7 16.6M3.7 8.5l16.6 7M3.7 15.5l16.6-7" />
    </svg>
  )
}
