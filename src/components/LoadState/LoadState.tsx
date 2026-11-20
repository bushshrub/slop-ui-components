import type { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'
import { Button } from '../Button/Button'
import { EmptyState } from '../EmptyState/EmptyState'
import { Skeleton, Spinner } from '../Loading/Loading'

export type LoadStatus = 'loading' | 'empty' | 'error' | 'ready'

export interface LoadStateProps {
  /** Where the data is. `ready` shows `children`; the others stand in for it. */
  status: LoadStatus
  /** Shown while loading, next to the spinner. With `skeleton` it is read by screen readers only. Default "Loading". */
  loadingLabel?: ReactNode
  /**
   * Shimmering placeholders instead of the spinner while loading, for content whose shape is known (a list, a card,
   * a table). `true` shows a few text lines; pass Skeleton blocks laid out like the content for a closer match.
   */
  skeleton?: boolean | ReactNode
  /** Title when there is nothing to show, e.g. "No servers yet". */
  emptyTitle?: ReactNode
  emptyDescription?: ReactNode
  /** Buttons under the empty message, e.g. "Add server". */
  emptyActions?: ReactNode
  emptyIcon?: ReactNode
  /** Title when loading failed. Default "Couldn't load this". */
  errorTitle?: ReactNode
  /** What went wrong, in words a user can act on. */
  errorDescription?: ReactNode
  /** Shows a Retry button on the error. */
  onRetry?: () => void
  /**
   * - `default`: centred, for a page or a panel.
   * - `compact`: centred with less padding, for a card or a table.
   * - `inline`: one line, for a list section or a field.
   */
  size?: 'default' | 'compact' | 'inline'
  className?: string
  /** The content, rendered only when `ready`. */
  children?: ReactNode
}

/**
 * What stands where data will be: a spinner while loading, an empty message when there is nothing, an error with
 * Retry when loading failed, and the content once it is there. One component, so every screen handles all four.
 */
export function LoadState({
  status,
  loadingLabel,
  skeleton,
  emptyTitle,
  emptyDescription,
  emptyActions,
  emptyIcon,
  errorTitle,
  errorDescription,
  onRetry,
  size = 'default',
  className,
  children,
}: LoadStateProps) {
  const strings = useStrings()
  if (status === 'ready') return children

  const inline = size === 'inline'
  const retry = onRetry && (
    <Button size="sm" variant="secondary" onPress={onRetry}>
      {strings.retry}
    </Button>
  )

  if (status === 'loading' && skeleton)
    return (
      <div role="status" className={className}>
        <span className="sr-only">{loadingLabel ?? strings.loading}</span>
        {skeleton === true ? <Skeleton lines={3} /> : skeleton}
      </div>
    )

  if (status === 'loading')
    return (
      <div
        role="status"
        className={cx(
          'flex items-center gap-2 text-ui text-muted',
          inline ? 'py-2' : cx('justify-center', size === 'compact' ? 'py-8' : 'py-16'),
          className,
        )}
      >
        {/* The label is the announcement; the spinner's own "Loading" would repeat it */}
        <span aria-hidden className="flex">
          <Spinner size="sm" />
        </span>
        {loadingLabel ?? strings.loading}
      </div>
    )

  if (status === 'empty') {
    const title = emptyTitle ?? strings.nothingHere
    if (inline)
      return (
        <div className={cx('flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-ui text-muted', className)}>
          <span>{title}</span>
          {emptyDescription && <span>{emptyDescription}</span>}
          {emptyActions}
        </div>
      )
    return (
      <EmptyState
        icon={emptyIcon}
        title={title}
        description={emptyDescription}
        actions={emptyActions}
        size={size === 'compact' ? 'compact' : 'default'}
        className={className}
      />
    )
  }

  const title = errorTitle ?? strings.loadFailed
  if (inline)
    return (
      <div role="alert" className={cx('flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-ui', className)}>
        <AlertCircle aria-hidden className="size-icon shrink-0 text-danger" />
        <span className="text-fg">{title}</span>
        {errorDescription && <span className="text-muted">{errorDescription}</span>}
        {retry}
      </div>
    )
  return (
    <EmptyState
      role="alert"
      icon={<AlertCircle className="text-danger" />}
      title={title}
      description={errorDescription}
      actions={retry}
      size={size === 'compact' ? 'compact' : 'default'}
      className={className}
    />
  )
}
