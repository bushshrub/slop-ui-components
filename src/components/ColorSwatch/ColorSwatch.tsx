import { Button as AriaButton } from 'react-aria-components'
import { cx } from '../../lib/cx'

export type ColorSwatchSize = 'sm' | 'md' | 'lg'

const sizes: Record<ColorSwatchSize, string> = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-9',
}

// Checkerboard under the color, so a translucent color (#RRGGBBAA) shows its alpha
const checker =
  'bg-[conic-gradient(#bbb_25%,#fff_0_50%,#bbb_0_75%,#fff_0)] bg-[length:8px_8px]'
// Diagonal hatching for "no color"
const hatch = 'bg-[repeating-linear-gradient(135deg,transparent_0_3px,var(--color-border-strong)_3px_4px)]'

export interface ColorSwatchProps {
  /** Accessible name, e.g. "Ocean blue" or "No colour". Required: a colour alone says nothing to a screen reader. */
  'aria-label': string
  /** Any CSS colour: `#3b82f6`, `#3b82f680` (8-digit hex, last two digits are alpha), `rgb()`, `oklch()`, a name, a `var()`. */
  color?: string
  /** Draws hatching instead of a colour, for "none" or "not set". Also the state when `color` is missing. */
  empty?: boolean
  /** Ring around the swatch. On a pressable swatch this is also `aria-pressed`. */
  selected?: boolean
  size?: ColorSwatchSize
  /** Makes the swatch a button, e.g. in a colour picker row. Without it the swatch is a static image. */
  onPress?: () => void
  className?: string
}

/**
 * A small colour chip. Static by default (`role="img"`), or a toggle button when `onPress` is given. Translucent
 * colours sit on a checkerboard; `empty` shows hatching. Always give it an `aria-label`.
 */
export function ColorSwatch({ color, empty, selected, size = 'md', onPress, className, 'aria-label': label }: ColorSwatchProps) {
  const isEmpty = empty || !color
  const classes = cx(
    'relative inline-block shrink-0 overflow-hidden rounded-full border border-border-strong align-middle',
    sizes[size],
    isEmpty ? hatch : checker,
    selected && 'ring-2 ring-focus ring-offset-2 ring-offset-bg',
    onPress &&
      'cursor-default outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-4 data-focus-visible:outline-focus',
    className,
  )
  const fill = !isEmpty && <span aria-hidden className="absolute inset-0" style={{ backgroundColor: color }} />
  if (onPress) {
    return (
      <AriaButton aria-label={label} aria-pressed={selected ?? false} onPress={onPress} className={classes}>
        {fill}
      </AriaButton>
    )
  }
  return (
    <span role="img" aria-label={label} className={classes}>
      {fill}
    </span>
  )
}
