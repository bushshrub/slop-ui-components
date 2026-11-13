import { FileText, Upload, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { DropZone, FileTrigger, Link, Text, isFileDropItem, useLocale } from 'react-aria-components'
import { cx } from '../../lib/cx'
import { useStrings, type UIStrings } from '../../lib/strings'
import { Button, IconButton, type ButtonProps } from '../Button/Button'

/** "1.4 MB" style size, 1024-based, in the locale's number format. */
function formatBytes(bytes: number, locale: string) {
  const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const
  let value = bytes
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: units[i],
    unitDisplay: 'short',
    maximumFractionDigits: value >= 10 ? 0 : 1,
  }).format(value)
}

/** Whether a file matches `accept` entries like `image/png`, `image/*` or `.pdf`. */
function matchesAccept(file: File, accept?: string[]) {
  if (!accept?.length) return true
  const name = file.name.toLowerCase()
  return accept.some((a) => {
    const t = a.toLowerCase()
    if (t.startsWith('.')) return name.endsWith(t)
    if (t.endsWith('/*')) return file.type.startsWith(t.slice(0, -1))
    return file.type === t
  })
}

/** A file that was picked or dropped but not passed to `onFiles`, and why. */
export interface RejectedFile {
  file: File
  /** `type`: not in `accept`. `size`: over `maxSize`. `count`: more than one file where only one is allowed. */
  reason: 'type' | 'size' | 'count'
}

interface PickerOptions {
  onFiles: (files: File[]) => void
  onReject?: (rejected: RejectedFile[]) => void
  accept?: string[]
  allowsMultiple?: boolean
  maxSize?: number
}

/** Sorts picked or dropped files into the ones to keep and the ones to turn away, each with its reason. */
function sortFiles(files: File[], { accept, allowsMultiple = true, maxSize }: Omit<PickerOptions, 'onFiles' | 'onReject'>) {
  const ok: File[] = []
  const rejected: RejectedFile[] = []
  for (const file of files) {
    if (!matchesAccept(file, accept)) rejected.push({ file, reason: 'type' })
    else if (maxSize != null && file.size > maxSize) rejected.push({ file, reason: 'size' })
    else if (!allowsMultiple && ok.length) rejected.push({ file, reason: 'count' })
    else ok.push(file)
  }
  return { ok, rejected }
}

/** One sentence per reason, so no rejected file goes unmentioned. */
function rejectionMessage(rejected: RejectedFile[], maxSize: number | undefined, strings: UIStrings, locale: string) {
  const names = (reason: RejectedFile['reason']) => rejected.filter((r) => r.reason === reason).map((r) => r.file.name)
  const list = (items: string[]) => new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format(items)
  const [type, size, count] = [names('type'), names('size'), names('count')]
  return [
    size.length && strings.filesTooLarge(list(size), size.length, formatBytes(maxSize!, locale)),
    type.length && strings.filesWrongType(list(type), type.length),
    count.length && strings.filesOverCount(list(count), count.length),
  ]
    .filter(Boolean)
    .join(' ')
}

/** Passes the valid files to `onFiles`, the rest to `onReject`, and returns a message about the rest. */
function useFileFilter({ onFiles, onReject, accept, allowsMultiple, maxSize }: PickerOptions) {
  const [error, setError] = useState<string | null>(null)
  const strings = useStrings()
  const { locale } = useLocale()
  const receive = (files: File[]) => {
    const { ok, rejected } = sortFiles(files, { accept, allowsMultiple, maxSize })
    setError(rejected.length ? rejectionMessage(rejected, maxSize, strings, locale) : null)
    if (rejected.length) onReject?.(rejected)
    if (ok.length) onFiles(ok)
  }
  return { error, receive }
}

export interface FileDropZoneProps {
  /** Called with the files that passed `accept` and `maxSize`. */
  onFiles: (files: File[]) => void
  /** Called with the files that were turned away. The zone also shows a message about them. */
  onReject?: (rejected: RejectedFile[]) => void
  /** Accepted types: MIME types (`image/png`, `image/*`) or extensions (`.pdf`). */
  accept?: string[]
  allowsMultiple?: boolean
  /** Largest file in bytes. Bigger files are rejected with a message in the zone. */
  maxSize?: number
  /**
   * Text of the zone. `{browse}` marks where the picker button goes (a custom label without it gets the
   * button after the text). Default: "Drop files here or browse", translatable with `fileDropLabel`.
   */
  label?: string
  /** Hint under the label, e.g. the accepted types and size. */
  description?: string
  isDisabled?: boolean
  className?: string
}

/** Drop target with a "browse" button as the keyboard and click fallback. Highlights while files are dragged over it. */
export function FileDropZone({
  onFiles,
  onReject,
  accept,
  allowsMultiple = true,
  maxSize,
  label,
  description,
  isDisabled,
  className,
}: FileDropZoneProps) {
  const { error, receive } = useFileFilter({ onFiles, onReject, accept, allowsMultiple, maxSize })
  const strings = useStrings()
  // The marker becomes the button; the rest of the label stays plain text. A custom label may use the
  // word for "browse" instead of the marker.
  const text = label ?? strings.fileDropLabel
  const marker = ['{browse}', strings.fileDropBrowse].find((m) => text.includes(m))
  const [before, after] = marker ? text.split(marker) : [text]

  const browse = (
    <FileTrigger
      acceptedFileTypes={accept}
      allowsMultiple={allowsMultiple}
      onSelect={(list) => list && receive(Array.from(list))}
    >
      <Button
        variant="ghost"
        isDisabled={isDisabled}
        className="h-auto touch:h-auto rounded-sm p-0 text-ui leading-5 text-fg underline underline-offset-2 data-hovered:bg-transparent data-pressed:bg-transparent data-hovered:opacity-80"
      >
        {strings.fileDropBrowse}
      </Button>
    </FileTrigger>
  )

  return (
    <DropZone
      isDisabled={isDisabled}
      onDrop={async (e) => {
        const items = e.items.filter(isFileDropItem)
        const files = await Promise.all(items.map((i) => i.getFile()))
        receive(files)
      }}
      className={cx(
        'flex flex-col items-center gap-3 rounded-lg border border-dashed border-border-strong bg-field px-6 py-8 text-center outline-none transition-colors',
        'data-drop-target:border-focus data-drop-target:bg-info-soft data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-focus',
        // Dim by dropping the border and icon fill, not opacity, so the text keeps its contrast
        'data-disabled:cursor-not-allowed data-disabled:border-border data-disabled:bg-transparent',
        className,
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-button text-button-fg [&_svg]:size-icon">
        <Upload aria-hidden />
      </span>
      <div className="flex flex-col gap-1">
        <Text slot="label" className="text-ui leading-5 text-fg">
          {marker ? (
            <>
              {before}
              {browse}
              {after}
            </>
          ) : (
            <>
              {text} {browse}
            </>
          )}
        </Text>
        {description && <p className="text-ui-sm leading-4 text-muted">{description}</p>}
      </div>
      {error && (
        <p role="alert" className="text-ui-sm leading-4 text-danger">
          {error}
        </p>
      )}
    </DropZone>
  )
}

export interface FileButtonProps extends Omit<ButtonProps, 'onPress' | 'children'> {
  onFiles: (files: File[]) => void
  /** Called with files of the wrong type or over `maxSize`. The button shows nothing itself, so tell the user here (a toast). */
  onReject?: (rejected: RejectedFile[]) => void
  accept?: string[]
  allowsMultiple?: boolean
  /** Largest file in bytes. Bigger files go to `onReject`, not `onFiles`. */
  maxSize?: number
  children?: ReactNode
}

/** Button that opens the file picker, for compact UIs such as a composer's "Attach". */
export function FileButton({ onFiles, onReject, accept, allowsMultiple = true, maxSize, children, ...props }: FileButtonProps) {
  const strings = useStrings()
  return (
    <FileTrigger
      acceptedFileTypes={accept}
      allowsMultiple={allowsMultiple}
      onSelect={(list) => {
        if (!list) return
        const { ok, rejected } = sortFiles(Array.from(list), { accept, allowsMultiple, maxSize })
        if (rejected.length) onReject?.(rejected)
        if (ok.length) onFiles(ok)
      }}
    >
      <Button {...props}>{children === undefined ? strings.attach : children}</Button>
    </FileTrigger>
  )
}

/** A picked `file`, or a stored one described by `name` and `size`. */
export type FileListItem = {
  id: string
  /** 0 to 100. Shows a thin bar under the name while set. */
  progress?: number
  /** Makes the name a link, e.g. to download a stored file. */
  href?: string
  /** Buttons for this row, before the remove button. */
  actions?: ReactNode
} & ({ file: File } | { file?: undefined; name: string; /** In bytes. */ size?: number })

export interface FileListProps {
  files: FileListItem[]
  /** Adds a remove button to each row. */
  onRemove?: (id: string) => void
  className?: string
}

/** Files as rows: name, size and a remove button, with an optional progress bar. */
export function FileList({ files, onRemove, className }: FileListProps) {
  const strings = useStrings()
  const { locale } = useLocale()
  if (files.length === 0) return null
  return (
    <ul aria-label={strings.files} className={cx('flex flex-col divide-y divide-divider rounded-lg border border-border', className)}>
      {files.map(({ id, progress, href, actions, ...item }) => {
        const { name, size } = item.file ?? item
        return (
          <li key={id} className="flex min-h-row items-center gap-3 px-3 py-2">
            <FileText aria-hidden className="size-icon shrink-0 text-muted" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-baseline gap-2">
                {href !== undefined ? (
                  <Link href={href} className="min-w-0 truncate rounded-xs text-ui leading-5 text-fg underline underline-offset-2 outline-none data-focus-visible:outline-2 data-focus-visible:outline-solid data-focus-visible:outline-focus">
                    {name}
                  </Link>
                ) : (
                  <span className="min-w-0 truncate text-ui leading-5 text-fg">{name}</span>
                )}
                {size != null && <span className="shrink-0 text-ui-sm leading-4 text-muted tabular-nums">{formatBytes(size, locale)}</span>}
              </div>
              {progress != null && (
                <div
                  role="progressbar"
                  aria-label={strings.uploading(name)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                  className="h-progress overflow-hidden rounded-full bg-track"
                >
                  <div className="h-full rounded-full bg-progress transition-[width]" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
            {actions}
            {onRemove && (
              <IconButton size="sm" aria-label={strings.remove(name)} onPress={() => onRemove(id)}>
                <X />
              </IconButton>
            )}
          </li>
        )
      })}
    </ul>
  )
}
