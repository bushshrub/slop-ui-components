import { useRef, useState, type ClipboardEvent, type KeyboardEvent, type ReactNode } from 'react'
import { X } from 'lucide-react'
import {
  Button,
  Group,
  Input,
  Tag,
  TagGroup as AriaTagGroup,
  TagList,
  TextField as AriaTextField,
  type TagGroupProps as AriaTagGroupProps,
} from 'react-aria-components'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'
import { FieldHelp, FieldLabel, fieldBox, fieldStack, type FieldChromeProps } from './field'

export interface TagItem {
  /** Unique within the group. */
  id: number | string
  /** The tag text. Used for the remove button label and typeahead. */
  textValue: string
}

export interface TagGroupProps extends Omit<AriaTagGroupProps, 'className' | 'children'> {
  /** Visible label above the tags. */
  label?: ReactNode
  /** Tags to show. */
  items?: Iterable<TagItem>
  /** Custom tag content. Defaults to the tag text. */
  children?: (item: TagItem) => ReactNode
  /** Dims every tag and stops removal. */
  isDisabled?: boolean
  /** Class for the wrapper. */
  className?: string
  /** Class for the tag list. TagInput passes `contents` so its tags flow on one line with the input. */
  listClassName?: string
}

// Same height and tint as a neutral Badge, with a remove button when the group allows removal
const tagClass =
  'flex h-[calc(var(--ui-icon)+0.5rem)] min-w-0 shrink-0 items-center gap-1 rounded-full bg-button px-2.5 py-0.5 ' +
  'font-sans text-ui-sm font-medium whitespace-nowrap text-fg outline-none transition-colors ' +
  'data-disabled:opacity-50 data-focus-visible:ring-2 data-focus-visible:ring-focus'

// The hit area grows past the 16px icon: a pseudo-element on desktop, a 44px target on touch
const removeClass =
  'relative flex size-[calc(var(--ui-icon)+0.25rem)] shrink-0 items-center justify-center rounded-full text-muted outline-none transition-colors ' +
  "after:absolute after:-inset-1.5 after:content-[''] touch:after:-inset-3 " +
  'data-hovered:bg-button-hover data-hovered:text-fg data-focus-visible:ring-2 data-focus-visible:ring-focus'

/**
 * Read-only or removable list of tags. Removable when `onRemove` is set: each tag gets a remove button,
 * and Delete or Backspace on a focused tag removes it. Arrow keys move between tags.
 */
export function TagGroup({ label, items, children, isDisabled, className, listClassName, ...props }: TagGroupProps) {
  return (
    <AriaTagGroup {...props} className={fieldStack(className)}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <TagList items={items} className={cx('flex flex-wrap gap-1.5', listClassName)}>
        {(item: TagItem) => (
          <Tag id={item.id} textValue={item.textValue} isDisabled={isDisabled}
            // Less padding on the side with the remove button
            className={({ allowsRemoving }) => cx(tagClass, allowsRemoving && 'pr-1')}
          >
            {({ allowsRemoving }) => (
              <>
                {children ? children(item) : item.textValue}
                {allowsRemoving && (
                  <Button slot="remove" className={removeClass}>
                    <X aria-hidden className="size-icon" />
                  </Button>
                )}
              </>
            )}
          </Tag>
        )}
      </TagList>
    </AriaTagGroup>
  )
}

export interface TagInputProps extends FieldChromeProps {
  /** Tags in the field. Pass with `onChange` to control it. */
  value?: string[]
  /** Starting tags when uncontrolled. */
  defaultValue?: string[]
  /** Called with the full list after every add or remove. */
  onChange?: (tags: string[]) => void
  /** Hint inside the empty input. Replaced by a "limit reached" note once `maxTags` is reached. */
  placeholder?: string
  /** Characters that end a tag. Enter and pasted line breaks always do. */
  separators?: string[]
  /** Commit the text being typed when the field loses focus. */
  addOnBlur?: boolean
  /** Allow the same tag twice. Otherwise duplicates are compared without case. */
  allowDuplicates?: boolean
  /** Return a message to reject a tag (the text stays in the input), or `true` / nothing to accept it. */
  validate?: (tag: string) => string | true | undefined
  /** Stop adding at this many tags. */
  maxTags?: number
  isDisabled?: boolean
  isInvalid?: boolean
  /** Post each tag as a hidden input with this name, so the value travels with a form. */
  name?: string
  className?: string
}

/** Splits typed or pasted text on the separators and line breaks. Pieces are not trimmed. */
function splitTags(text: string, separators: string[]) {
  return [...separators, '\n', '\r'].reduce<string[]>((parts, sep) => parts.flatMap((part) => part.split(sep)), [text])
}

/**
 * Tags typed into one box: Enter or a separator commits the text, pasted lists split into tags,
 * and Backspace on an empty input removes the last tag. Use TagGroup for tags that are only shown.
 */
export function TagInput({
  label,
  description,
  errorMessage,
  value,
  defaultValue,
  onChange,
  placeholder,
  separators = [','],
  addOnBlur = true,
  allowDuplicates,
  validate,
  maxTags,
  isDisabled,
  isInvalid,
  name,
  className,
}: TagInputProps) {
  const [innerTags, setInnerTags] = useState(defaultValue ?? [])
  const tags = value ?? innerTags
  const [draft, setDraft] = useState('')
  const [draftError, setDraftError] = useState<string>()
  const inputRef = useRef<HTMLInputElement>(null)
  const groupRef = useRef<HTMLDivElement>(null)
  const full = maxTags !== undefined && tags.length >= maxTags
  const error = errorMessage ?? draftError
  const strings = useStrings()

  const update = (next: string[]) => {
    if (value === undefined) setInnerTags(next)
    onChange?.(next)
  }

  const rejection = (tag: string, current: string[]) => {
    if (maxTags !== undefined && current.length >= maxTags) return strings.tagLimit(maxTags)
    if (!allowDuplicates && current.some((t) => t.toLowerCase() === tag.toLowerCase())) return strings.tagAlreadyAdded
    const result = validate?.(tag)
    return typeof result === 'string' ? result : undefined
  }

  // Adds the complete pieces as tags. Rejected pieces stay in the input with the reason; `rest` is text still being typed.
  const add = (pieces: string[], rest = '') => {
    let next = tags
    const kept: string[] = []
    let reason: string | undefined
    for (const piece of pieces.map((p) => p.trim()).filter(Boolean)) {
      const why = rejection(piece, next)
      if (why) {
        reason = why
        kept.push(piece)
      } else {
        next = [...next, piece]
      }
    }
    if (next !== tags) update(next)
    setDraft([...kept, rest.trim()].filter(Boolean).join(`${separators[0] ?? ','} `))
    setDraftError(reason)
  }

  const onDraftChange = (text: string) => {
    setDraftError(undefined)
    const parts = splitTags(text, separators)
    if (parts.length > 1) add(parts.slice(0, -1), parts[parts.length - 1])
    else setDraft(text)
  }

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData('text')
    if (splitTags(text, separators).length > 1) {
      // Pasted at the end of the draft; the draft is joined in front of the paste
      event.preventDefault()
      add(splitTags(draft + text, separators))
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return
    if (event.key === 'Enter' && draft.trim()) {
      event.preventDefault()
      add(splitTags(draft, separators))
    } else if (event.key === 'Backspace' && draft === '' && tags.length) {
      update(tags.slice(0, -1))
    } else if (event.key === 'ArrowLeft' && draft === '') {
      const rows = Array.from(groupRef.current?.querySelectorAll<HTMLElement>('[role="row"]') ?? [])
      rows.at(-1)?.focus()
    }
  }

  const onBlur = () => {
    if (addOnBlur && draft.trim()) add(splitTags(draft, separators))
  }

  const removeKeys = (keys: Set<string | number>) => {
    update(tags.filter((_, index) => !keys.has(index)))
  }

  const items: TagItem[] = tags.map((textValue, index) => ({ id: index, textValue }))

  return (
    <AriaTextField
      isDisabled={isDisabled}
      isInvalid={isInvalid || Boolean(error)}
      value={draft}
      onChange={onDraftChange}
      className={fieldStack(className)}
    >
      {label && <FieldLabel>{label}</FieldLabel>}
      <Group
        ref={groupRef}
        isDisabled={isDisabled}
        isInvalid={isInvalid || Boolean(error)}
        onClick={(event) => {
          if (event.target === event.currentTarget) inputRef.current?.focus()
        }}
        className={cx(
          fieldBox,
          'flex min-h-control cursor-text flex-wrap items-center gap-1.5 px-2 py-1 touch:min-h-control-touch',
        )}
      >
        <TagGroup
          aria-label={typeof label === 'string' ? strings.tagsFor(label) : strings.tags}
          items={items}
          onRemove={isDisabled ? undefined : removeKeys}
          isDisabled={isDisabled}
          className="contents"
          listClassName="contents"
        />
        <Input
          ref={inputRef}
          // Say why typing stopped, not just go quiet
          placeholder={full && maxTags !== undefined ? strings.tagLimitReached(maxTags) : placeholder}
          readOnly={full && draft === ''}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onBlur={onBlur}
          className="min-w-24 flex-1 basis-24 bg-transparent py-0.5 outline-none placeholder:text-subtle disabled:cursor-not-allowed"
        />
        {name && tags.map((tag, index) => <input key={index} type="hidden" name={name} value={tag} />)}
      </Group>
      <FieldHelp description={description} errorMessage={error} />
    </AriaTextField>
  )
}
