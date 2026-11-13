import { cx } from '../../lib/cx'

export interface HighlightProps {
  /** The full text. */
  text: string
  /** The part to mark, matched without regard to case. Every occurrence is marked. */
  query: string
  /** Classes for the marked parts. */
  className?: string
}

/** Renders `text` with each occurrence of `query` in a `<mark>`: search results, command palette items. */
export function Highlight({ text, query, className }: HighlightProps) {
  const needle = query.trim().toLowerCase()
  if (!needle) return text
  const lower = text.toLowerCase()
  const parts = []
  let from = 0
  for (let at = lower.indexOf(needle); at >= 0; at = lower.indexOf(needle, from)) {
    parts.push(text.slice(from, at))
    from = at + needle.length
    parts.push(
      <mark key={at} className={cx('rounded-[2px] bg-accent-soft text-inherit', className)}>
        {text.slice(at, from)}
      </mark>,
    )
  }
  parts.push(text.slice(from))
  return <>{parts}</>
}
