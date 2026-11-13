import type { ReactNode } from 'react'
import { Bell, Monitor, Moon, Palette, Settings2, Shield, Sun, UserRound } from 'lucide-react'
import { Button } from '../components/Button/Button'
import { Switch } from '../components/Inputs/Switch'
import { ComboBox } from '../components/Inputs/ComboBox'
import { SegmentedControl } from '../components/Inputs/SegmentedControl'
import { Select } from '../components/Inputs/Select'
import { TextField } from '../components/Inputs/TextField'
import { ConfirmModal, DialogTrigger, Modal, type ModalProps } from '../components/Modal/Modal'
import { Tab, TabList, TabPanel, Tabs } from '../components/Tabs/Tabs'
import { user } from './sample-data'

const languages = [
  { id: 'en', label: 'English' },
  { id: 'de', label: 'Deutsch' },
  { id: 'fr', label: 'Français' },
  { id: 'ja', label: '日本語' },
]

const chatFonts = [
  { id: 'sans', label: 'Default · Sans' },
  { id: 'serif', label: 'Serif' },
  { id: 'mono', label: 'Mono' },
]

const textSizes = [
  { id: 'small', label: 'Small' },
  { id: 'default', label: 'Default' },
  { id: 'large', label: 'Large' },
]

const timeZones = ['America/Los_Angeles', 'America/New_York', 'Europe/London', 'Europe/Berlin', 'Asia/Singapore', 'Asia/Tokyo'].map(
  (tz) => ({ id: tz, label: tz.replace('_', ' ') }),
)

/**
 * Example composition, not a library export: a settings dialog built from Modal (`flush`), side
 * Tabs, and the input components. Settings apply as they change, so there is no Save button.
 */
export function SettingsDialog(props: Omit<ModalProps, 'title' | 'children'>) {
  return (
    <Modal {...props} title="Settings" size="xl" flush className="md:h-[min(44rem,85dvh)]">
      <Tabs orientation="vertical" defaultSelectedKey="general" className="flex-1 md:border-t md:border-divider">
        <TabList aria-label="Settings sections">
          <Tab id="general" icon={<Settings2 />}>General</Tab>
          <Tab id="appearance" icon={<Palette />}>Appearance</Tab>
          <Tab id="notifications" icon={<Bell />}>Notifications</Tab>
          <Tab id="privacy" icon={<Shield />}>Privacy</Tab>
          <Tab id="account" icon={<UserRound />}>Account</Tab>
        </TabList>

        <Panel id="general">
          <Row label="What should we call you?" description="Used in greetings and shared chats.">
            <TextField aria-label="What should we call you?" defaultValue={user.name} className="w-full sm:w-56" />
          </Row>
          <Row label="Language">
            <Select aria-label="Language" variant="quiet" options={languages} defaultValue="en" />
          </Row>
          <Row label="Time zone">
            <ComboBox aria-label="Time zone" options={timeZones} defaultSelectedKey="Europe/London" menuTrigger="focus" placeholder="Type a city" className="w-full sm:w-56" />
          </Row>
        </Panel>

        <Panel id="appearance">
          <Row label="Theme">
            <SegmentedControl
              aria-label="Theme"
              defaultValue="system"
              options={[
                { id: 'light', label: 'Light', icon: <Sun /> },
                { id: 'dark', label: 'Dark', icon: <Moon /> },
                { id: 'system', label: 'System', icon: <Monitor /> },
              ]}
            />
          </Row>
          <Row label="Chat font">
            <Select aria-label="Chat font" variant="quiet" options={chatFonts} defaultValue="sans" />
          </Row>
          <Row label="Text size">
            <Select aria-label="Text size" variant="quiet" options={textSizes} defaultValue="default" />
          </Row>
          <Switch toggleSide="end" defaultSelected description="Animate replies as they stream in.">
            Typing effect
          </Switch>
        </Panel>

        <Panel id="notifications">
          <Switch toggleSide="end" defaultSelected description="When a long task or research run finishes.">
            Email me when work is done
          </Switch>
          <Switch toggleSide="end" description="On this device only.">
            Push notifications
          </Switch>
          <Switch toggleSide="end" description="A few times a year, never ads.">
            Product updates
          </Switch>
        </Panel>

        <Panel id="privacy">
          <Switch toggleSide="end" description="Lets us use your chats to train future models. Off by default.">
            Help improve the models
          </Switch>
          <Switch toggleSide="end" defaultSelected description="Turn off to keep new chats out of your history.">
            Save chat history
          </Switch>
          <Row label="Export data" description="A download link arrives by email within a day.">
            <Button>Export</Button>
          </Row>
        </Panel>

        <Panel id="account">
          <Row label="Email" description={user.email}>
            <Button>Change</Button>
          </Row>
          <Row label="Sign out everywhere" description="Ends every session except this one.">
            <Button>Sign out</Button>
          </Row>
          <Row label="Delete account" description="Removes your chats, projects and files for good.">
            <DialogTrigger>
              <Button variant="danger">Delete</Button>
              <ConfirmModal title="Delete your account?" destructive confirmLabel="Delete account" onConfirm={() => {}}>
                <p className="m-0">All chats, projects and files go with it. This can’t be undone.</p>
              </ConfirmModal>
            </DialogTrigger>
          </Row>
        </Panel>
      </Tabs>
    </Modal>
  )
}

/** Panel content: a column of settings with the same spacing everywhere. */
function Panel({ id, children }: { id: string; children: ReactNode }) {
  return (
    <TabPanel id={id} className="px-5 py-5 md:px-8 md:py-6">
      {/* Capped so switch rows don't stretch the toggle far away from its label */}
      {/* Rows split by hairlines, like a settings list */}
      <div className="flex max-w-2xl flex-col divide-y divide-divider *:py-3.5 *:first:pt-0">{children}</div>
    </TabPanel>
  )
}

/** Label and help on the left, control on the right. Stacks on narrow screens. */
function Row({ label, description, children }: { label: ReactNode; description?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="flex min-w-0 flex-col">
        <span className="text-ui leading-5">{label}</span>
        {description && <span className="text-ui-sm leading-4 text-muted">{description}</span>}
      </div>
      {children}
    </div>
  )
}
