import { useState, type ReactNode } from 'react'
import { ChevronRight, Globe, Link as LinkIcon, Lock, Settings } from 'lucide-react'
import { Button, IconButton } from '../components/Button/Button'
import { RadioCards } from '../components/Inputs/RadioCards'
import { TextField } from '../components/Inputs/TextField'
import { Popover, PopoverTrigger, usePopoverView } from '../components/Popover/Popover'
import { Avatar } from '../components/Sidebar/Sidebar'
import { user } from './sample-data'

type Access = 'invited' | 'link'

const accessInfo: Record<Access, { label: string; description: string; icon: ReactNode }> = {
  invited: { label: 'Only people invited', description: 'Only people you invite by email can open this chat.', icon: <Lock /> },
  link: { label: 'Anyone with the link', description: 'Anyone who has the link can read this chat.', icon: <Globe /> },
}

function AccessRow({ access, onChange }: { access: Access; onChange: (a: Access) => void }) {
  const { push, pop } = usePopoverView()
  const info = accessInfo[access]
  return (
    <button
      type="button"
      onClick={() =>
        push({
          title: 'General access',
          content: (
            <RadioCards
              aria-label="General access"
              columns={1}
              value={access}
              onChange={(v) => {
                onChange(v as Access)
                pop()
              }}
              options={(Object.keys(accessInfo) as Access[]).map((id) => ({
                id,
                title: accessInfo[id].label,
                description: accessInfo[id].description,
                icon: accessInfo[id].icon,
              }))}
            />
          ),
        })
      }
      className="flex w-full min-w-0 cursor-default items-center gap-3 rounded-md p-1.5 text-left text-ui outline-none hover:bg-hover focus-visible:outline-2 focus-visible:outline-focus touch:min-h-control-touch"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-button text-button-fg [&_svg]:size-icon">{info.icon}</span>
      <span className="min-w-0 flex-1 truncate">{info.label}</span>
      <ChevronRight aria-hidden className="size-icon shrink-0 text-muted" />
    </button>
  )
}

function Invite() {
  const [email, setEmail] = useState('')
  return (
    <div className="flex items-center gap-2">
      <TextField aria-label="Email" placeholder="Add people by email" value={email} onChange={setEmail} className="min-w-0 flex-1" />
      <Button variant="secondary" isDisabled={!email.trim()} onPress={() => setEmail('')}>
        Invite
      </Button>
    </div>
  )
}

/** Header-right Share button that opens a popover with invite field, general access drill-in and copy link. */
export function ShareChat({ email = user.email, name = user.name }: { email?: string; name?: string }) {
  const [access, setAccess] = useState<Access>('invited')
  return (
    <PopoverTrigger>
      <Button size="sm">Share</Button>
      <Popover title="Share chat" className="w-96">
        <div className="flex flex-col gap-3">
          <p className="text-ui-sm leading-4 text-muted">Only messages up until now will be shared</p>
          <Invite />
          <div className="flex flex-col gap-1">
            <div className="text-ui-sm font-medium text-muted">Who has access</div>
            <AccessRow access={access} onChange={setAccess} />
            <div className="flex items-center gap-3 p-1.5 text-ui">
              <Avatar name={name} className="size-8 text-ui-sm" />
              <div className="min-w-0 flex-1">
                <div className="truncate">
                  {name} <span className="text-muted">(you)</span>
                </div>
                <div className="truncate text-ui-sm text-muted">{email}</div>
              </div>
              <span className="shrink-0 text-ui-sm text-muted">Owner</span>
            </div>
          </div>
          <p className="text-ui-sm leading-4 text-muted">
            Shared chats may include attachments. <a href="#" className="underline underline-offset-2 hover:text-fg">Learn about sharing</a>
          </p>
          <hr className="border-divider" />
          <div className="flex items-center justify-end gap-2">
            <IconButton aria-label="Sharing settings"><Settings /></IconButton>
            <Button icon={<LinkIcon />}>Copy link</Button>
          </div>
        </div>
      </Popover>
    </PopoverTrigger>
  )
}
