import type { ReactNode } from 'react'
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components'
import { cx } from '../../lib/cx'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex shrink-0 cursor-default items-center justify-center whitespace-nowrap rounded-button font-sans text-ui leading-5 [font-weight:var(--ui-button-weight)] ' +
  // Focus: ring with a gap, so it reads on filled buttons too. The gap is transparent, so it works on any surface.
  'select-none outline-none transition-colors data-focus-visible:outline-2 data-focus-visible:outline-solid data-focus-visible:outline-offset-2 data-focus-visible:outline-focus ' +
  'data-disabled:cursor-not-allowed data-disabled:opacity-50 [&_svg]:size-icon [&_svg]:shrink-0'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-fg data-hovered:opacity-90 data-pressed:opacity-80',
  secondary: 'bg-button text-button-fg data-hovered:bg-button-hover data-pressed:bg-button-hover',
  outline: 'border border-border-strong text-fg data-hovered:bg-hover data-pressed:bg-selected',
  ghost: 'text-fg data-hovered:bg-hover data-pressed:bg-selected',
  danger: 'bg-danger text-danger-fg data-hovered:opacity-90 data-pressed:opacity-80',
}

// Heights come from the --ui-control* tokens. On touch (coarse pointer or under 768px, see index.css) md and lg reach
// --ui-control-touch. sm grows to --ui-control and an invisible ::after extends its hit area, so dense rows keep their spacing.
const coarseHit = 'relative touch:after:absolute touch:after:-inset-1'

const sizes: Record<ButtonSize, string> = {
  sm: `h-control-sm gap-1.5 px-2.5 touch:h-control ${coarseHit}`,
  md: 'h-control gap-2 px-3.5 touch:h-control-touch',
  lg: 'h-control-lg gap-2 px-4 touch:h-control-touch',
}

const iconSizes: Record<ButtonSize, string> = {
  sm: `size-control-sm touch:size-control ${coarseHit}`,
  md: 'size-control touch:size-control-touch',
  lg: 'size-control-lg touch:size-control-touch',
}

/** Class string for a button look, for links or other elements that should look like a button. */
export function buttonClass(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md') {
  return cx(base, variants[variant], sizes[size])
}

export interface ButtonProps extends Omit<AriaButtonProps, 'className' | 'children'> {
  /** Visual weight. `primary` is ink-colored; use it once per view for the main action. */
  variant?: ButtonVariant
  /** Height from --ui-control-sm, --ui-control or --ui-control-lg (32, 36, 40px by default). Touch screens raise it to --ui-control-touch. */
  size?: ButtonSize
  /** Icon shown before the label (any 16px SVG, e.g. lucide). */
  icon?: ReactNode
  /** Extra classes, merged after the variant classes. */
  className?: string
  children?: ReactNode
}

/** Text button with an optional leading icon. Uses react-aria for press, focus and disabled handling. */
export function Button({ variant = 'secondary', size = 'md', icon, className, children, ...props }: ButtonProps) {
  return (
    <AriaButton {...props} className={cx(buttonClass(variant, size), className)}>
      {icon}
      {children}
    </AriaButton>
  )
}

export interface IconButtonProps extends Omit<AriaButtonProps, 'className' | 'children'> {
  /** Accessible name. Required because the button has no visible text. */
  'aria-label': string
  /** Defaults to `ghost`; icon buttons rarely need a fill. */
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
}

/** Square icon-only button. Ghost variants render the icon in the muted color. */
export function IconButton({ variant = 'ghost', size = 'md', className, children, ...props }: IconButtonProps) {
  return (
    <AriaButton
      {...props}
      className={cx(
        base,
        variants[variant],
        iconSizes[size],
        variant === 'ghost' && 'text-muted data-hovered:text-fg',
        className,
      )}
    >
      {children}
    </AriaButton>
  )
}
