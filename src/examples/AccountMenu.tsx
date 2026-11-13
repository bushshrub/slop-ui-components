import {
  CircleHelp,
  Gauge,
  Globe,
  Info,
  KeyRound,
  ListChecks,
  LogOut,
  MonitorSmartphone,
  Settings,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { Key } from 'react-aria-components'
import { Menu, MenuHeader, MenuItem, MenuSection, MenuSeparator, MenuTrigger, SubmenuTrigger } from '../components/Menu/Menu'

export interface AccountMenuProps {
  email: string
  /** The trigger, usually a SidebarUser. */
  children: ReactNode
  onAction?: (key: string) => void
}

/**
 * Example composition, not a library export: an account menu for a chat app, built from
 * Menu, MenuItem, MenuSection, MenuSeparator and SubmenuTrigger. Copy it into an app and edit.
 */
export function AccountMenu({ email, children, onAction }: AccountMenuProps) {
  const act = (key: Key) => onAction?.(String(key))
  return (
    <MenuTrigger>
      {children}
      <Menu placement="top start" aria-label="Account" onAction={act}>
        <MenuSection aria-label="Account">
          <MenuHeader>{email}</MenuHeader>
          <MenuItem id="settings" icon={<Settings />} shortcut="⇧⌘,">
            Settings
          </MenuItem>
          <MenuItem id="usage" icon={<Gauge />}>Usage</MenuItem>
          <MenuItem id="language" icon={<Globe />}>Language</MenuItem>
          <MenuItem id="help" icon={<CircleHelp />}>Get help</MenuItem>
        </MenuSection>
        <MenuSeparator />
        <MenuSection aria-label="Product">
          <MenuItem id="plans" icon={<ListChecks />}>View all plans</MenuItem>
          <MenuItem id="apps" icon={<MonitorSmartphone />}>Get apps and extensions</MenuItem>
          <SubmenuTrigger>
            <MenuItem id="learn" icon={<Info />}>Learn more</MenuItem>
            <Menu aria-label="Learn more" onAction={act}>
              <MenuItem id="about" href="https://example.com/about" target="_blank">About us</MenuItem>
              <MenuSeparator />
              <MenuItem id="academy">Tutorials</MenuItem>
              <MenuItem id="usage-policy" href="https://example.com/legal/usage" target="_blank">Usage policy</MenuItem>
              <MenuItem id="privacy" href="https://example.com/legal/privacy" target="_blank">Privacy policy</MenuItem>
              <MenuItem id="terms" href="https://example.com/legal/terms" target="_blank">Terms of service</MenuItem>
              <MenuItem id="fonts" external>Font licenses</MenuItem>
              <MenuItem id="privacy-choices">Your privacy choices</MenuItem>
              <MenuSeparator />
              <MenuItem id="shortcuts" shortcut="⌘/">Keyboard shortcuts</MenuItem>
            </Menu>
          </SubmenuTrigger>
        </MenuSection>
        <MenuSeparator />
        <MenuSection aria-label="Developer">
          <MenuItem id="api-keys" icon={<KeyRound />} external>Get API keys</MenuItem>
        </MenuSection>
        <MenuSeparator />
        <MenuSection aria-label="Session">
          <MenuItem id="logout" icon={<LogOut />}>Log out</MenuItem>
        </MenuSection>
      </Menu>
    </MenuTrigger>
  )
}
