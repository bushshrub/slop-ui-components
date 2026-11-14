import { ChevronDown, Copy, RefreshCw, ThumbsDown, ThumbsUp } from 'lucide-react'
import type { Key } from 'react-aria-components'
import { Button, IconButton } from '../components/Button/Button'
import { Menu, MenuItem, MenuTrigger, type MenuProps } from '../components/Menu/Menu'

/** Example parts shared by the chat interface examples. Not library exports: copy them into an app and edit. */

export interface ComposerInputProps {
  value: string
  onChange: (value: string) => void
  /** Enter sends; Shift+Enter adds a line. */
  onSend: () => void
  placeholder: string
}

/** Borderless textarea that grows with its text. The box around it draws the edge and the focus color. */
export function ComposerInput({ value, onChange, onSend, placeholder }: ComposerInputProps) {
  return (
    <textarea
      aria-label="Message"
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
          e.preventDefault()
          onSend()
        }
      }}
      // 16px on touch: iOS zooms the page when a smaller field takes focus
      className="field-sizing-content max-h-48 min-h-6 min-w-0 flex-1 resize-none bg-transparent text-ui leading-6 text-fg outline-none placeholder:text-subtle touch:text-base"
    />
  )
}

/**
 * Classes for the box around a ComposerInput. Neither changes color on focus: the caret shows where typing goes, as
 * in the chat apps these examples follow. `field` is the fill of the kit's text fields; `surface` is a raised card.
 */
export const composerBoxClass = {
  field: 'border border-field-border bg-field',
  surface: 'border border-border bg-surface',
}

export interface ModelMenuProps {
  models: { id: string; label: string; description: string }[]
  value: string
  onChange: (id: string) => void
  /** Side the menu opens on. Default `top end`, for a picker inside a composer. */
  placement?: MenuProps<object>['placement']
  /** Fixed text for the button, e.g. the product name. Default: the current model's label. */
  label?: string
}

/** Model picker: a quiet button that opens a single-select menu. */
export function ModelMenu({ models, value, onChange, placement = 'top end', label }: ModelMenuProps) {
  const current = models.find((m) => m.id === value)
  return (
    <MenuTrigger>
      <Button variant="ghost" size="sm" aria-label={label ? `${label}, model: ${current?.label}` : `Model: ${current?.label}`}>
        {label ?? current?.label}
        <ChevronDown aria-hidden className="text-muted" />
      </Button>
      <Menu
        placement={placement}
        sheetTitle="Model"
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={[value]}
        onSelectionChange={(keys) => {
          const [id] = [...(keys as Set<Key>)]
          if (id != null) onChange(String(id))
        }}
      >
        {models.map((m) => (
          <MenuItem key={m.id} id={m.id} description={m.description}>{m.label}</MenuItem>
        ))}
      </Menu>
    </MenuTrigger>
  )
}

/** The row of small buttons under an assistant message. */
export function MessageActions({ onAction }: { onAction?: (key: string) => void }) {
  return (
    <div className="-ml-1.5 flex gap-0.5">
      <IconButton size="sm" aria-label="Copy" onPress={() => onAction?.('copy')}><Copy /></IconButton>
      <IconButton size="sm" aria-label="Good response" onPress={() => onAction?.('good')}><ThumbsUp /></IconButton>
      <IconButton size="sm" aria-label="Bad response" onPress={() => onAction?.('bad')}><ThumbsDown /></IconButton>
      <IconButton size="sm" aria-label="Try again" onPress={() => onAction?.('retry')}><RefreshCw /></IconButton>
    </div>
  )
}
