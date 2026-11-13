import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button as AriaButton, useLocale } from 'react-aria-components'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'
import { PHONE_QUERY, useMediaQuery } from '../../lib/useMediaQuery'
import { IconButton } from '../Button/Button'

/** A page number, or `'gap'` where pages are skipped. */
export type PaginationItem = number | 'gap'

/**
 * Pages to show: first, last, the current page with `siblingCount` neighbors each side, and gaps between.
 * The list is always the same length once it needs a gap, so the controls don't jump while paging.
 */
export function paginationRange(page: number, pageCount: number, siblingCount = 1): PaginationItem[] {
  const range = (from: number, to: number) => Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i)
  // first + last + current + 2 siblings sets + 2 gaps
  const slots = siblingCount * 2 + 5
  if (pageCount <= slots) return range(1, pageCount)

  const current = Math.min(Math.max(page, 1), pageCount)
  const left = Math.max(current - siblingCount, 1)
  const right = Math.min(current + siblingCount, pageCount)
  const showLeftGap = left > 3
  const showRightGap = right < pageCount - 2
  const edge = siblingCount * 2 + 3

  if (!showLeftGap) return [...range(1, edge), 'gap', pageCount]
  if (!showRightGap) return [1, 'gap', ...range(pageCount - edge + 1, pageCount)]
  return [1, 'gap', ...range(left, right), 'gap', pageCount]
}

export interface PaginationProps {
  /** Current page, 1-based. */
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  /** Page numbers shown on each side of the current page. */
  siblingCount?: number
  /** Total number of items. With `pageSize`, adds a "Showing 21–40 of 312" label. */
  total?: number
  pageSize?: number
  className?: string
}

const pageButton =
  'inline-flex h-control-sm min-w-control-sm cursor-default select-none items-center justify-center rounded-button px-2 text-ui leading-5 tabular-nums outline-none transition-colors touch:h-control touch:min-w-control ' +
  'data-focus-visible:outline-2 data-focus-visible:outline-solid data-focus-visible:outline-offset-2 data-focus-visible:outline-focus'

/** Page switcher with previous/next and numbered pages. On phones it collapses to "Page 3 of 16". */
export function Pagination({ page, pageCount, onPageChange, siblingCount = 1, total, pageSize, className }: PaginationProps) {
  const phone = useMediaQuery(PHONE_QUERY)
  const strings = useStrings()
  const { locale } = useLocale()
  const format = (n: number) => new Intl.NumberFormat(locale).format(n)
  const current = Math.min(Math.max(page, 1), Math.max(pageCount, 1))
  const go = (p: number) => onPageChange(Math.min(Math.max(p, 1), pageCount))

  const summary =
    total != null && pageSize
      ? strings.showingRange(
          format(total === 0 ? 0 : (current - 1) * pageSize + 1),
          format(Math.min(current * pageSize, total)),
          format(total),
        )
      : null

  const prev = (
    <IconButton size="sm" aria-label={strings.previousPage} isDisabled={current <= 1} onPress={() => go(current - 1)}>
      <ChevronLeft />
    </IconButton>
  )
  const next = (
    <IconButton size="sm" aria-label={strings.nextPage} isDisabled={current >= pageCount} onPress={() => go(current + 1)}>
      <ChevronRight />
    </IconButton>
  )

  return (
    <div className={cx('flex flex-wrap items-center justify-between gap-x-4 gap-y-2', className)}>
      {summary && <p className="text-ui leading-5 text-muted tabular-nums">{summary}</p>}
      <nav aria-label={strings.pagination} className={cx('flex items-center gap-1', summary && 'ml-auto')}>
        {prev}
        {phone ? (
          <span className="px-2 text-ui leading-5 text-muted tabular-nums">{strings.pageOf(format(current), format(pageCount))}</span>
        ) : (
          paginationRange(current, pageCount, siblingCount).map((item, i) =>
            item === 'gap' ? (
              <span key={`gap-${i}`} aria-hidden className="inline-flex min-w-control-sm justify-center text-ui text-subtle">
                …
              </span>
            ) : (
              <AriaButton
                key={item}
                aria-label={strings.page(format(item))}
                aria-current={item === current ? 'page' : undefined}
                onPress={() => go(item)}
                className={cx(
                  pageButton,
                  item === current ? 'bg-selected text-fg' : 'text-muted data-hovered:bg-hover data-pressed:bg-selected',
                )}
              >
                {item}
              </AriaButton>
            ),
          )
        )}
        {next}
      </nav>
    </div>
  )
}
