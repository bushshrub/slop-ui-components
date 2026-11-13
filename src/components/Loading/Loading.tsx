import { Loader2 } from 'lucide-react'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'

const spinnerSizes = {
  sm: 'size-icon',
  md: 'size-[calc(var(--ui-icon)*1.5)]',
  lg: 'size-[calc(var(--ui-icon)*2)]',
}

export interface SpinnerProps {
  /** sm matches an icon in a button. Default md. */
  size?: keyof typeof spinnerSizes
  id?: string
  className?: string
}

/** Spinning indicator in the current text color. Stops spinning for people who prefer reduced motion. */
export function Spinner({ size = 'md', id, className }: SpinnerProps) {
  const strings = useStrings()
  return (
    <Loader2
      id={id}
      role="status"
      aria-label={strings.loading}
      className={cx('shrink-0 motion-safe:animate-spin', spinnerSizes[size], className)}
    />
  )
}

export interface SkeletonProps {
  /** Size it here, e.g. `h-4 w-32`. */
  className?: string
  /** Renders this many text lines; the last is shorter. */
  lines?: number
  /** Round placeholder, e.g. for an avatar. Give it a `size-*`. */
  circle?: boolean
}

/** Placeholder block shown while content loads. Hidden from screen readers. */
export function Skeleton({ className, lines, circle }: SkeletonProps) {
  if (lines && lines > 0) {
    return (
      <div aria-hidden className={cx('flex flex-col gap-2', className)}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={cx('h-3 rounded-sm bg-track motion-safe:animate-pulse', i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full')}
          />
        ))}
      </div>
    )
  }
  return (
    <div
      aria-hidden
      className={cx('h-4 bg-track motion-safe:animate-pulse', circle ? 'size-10 rounded-full' : 'rounded-sm', className)}
    />
  )
}
