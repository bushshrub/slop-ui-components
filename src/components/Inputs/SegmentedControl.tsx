import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ToggleButton, ToggleButtonGroup, type Key } from 'react-aria-components'
import { cx } from '../../lib/cx'

export interface SegmentedOption {
  id: Key
  label: ReactNode
  /** 16px icon before the label. With `iconOnly`, pass `aria-label` text as `label`. */
  icon?: ReactNode
  isDisabled?: boolean
}

export interface SegmentedControlProps {
  /** Two to five mutually exclusive choices. More than that wants a Select. */
  options: SegmentedOption[]
  /** Selected option id (controlled). */
  value?: Key
  /** Initially selected option id (uncontrolled). */
  defaultValue?: Key
  onChange?: (value: Key) => void
  /** Visible label above the control. Otherwise pass `aria-label`. */
  label?: ReactNode
  'aria-label'?: string
  /** Height from --ui-control-sm or --ui-control. */
  size?: 'sm' | 'md'
  /** Show only icons. String labels become the buttons' accessible names. */
  iconOnly?: boolean
  /** Stretch to the container width with equal segments. */
  fullWidth?: boolean
  isDisabled?: boolean
  className?: string
}

/**
 * One-of-few switcher that applies immediately (view mode, theme, time range).
 * Built on react-aria ToggleButtonGroup: arrow keys move, one segment is always selected.
 */
export function SegmentedControl({
  options,
  value,
  defaultValue,
  onChange,
  label,
  size = 'md',
  iconOnly,
  fullWidth,
  isDisabled,
  className,
  ...props
}: SegmentedControlProps) {
  const labelId = useId()
  const [uncontrolled, setUncontrolled] = useState(defaultValue)
  const selected = value ?? uncontrolled
  const groupRef = useRef<HTMLDivElement>(null)
  const thumb = useThumb(groupRef, selected)
  const group = (
    <ToggleButtonGroup
      ref={groupRef}
      aria-label={props['aria-label']}
      aria-labelledby={label ? labelId : undefined}
      selectionMode="single"
      disallowEmptySelection
      isDisabled={isDisabled}
      selectedKeys={selected != null ? [selected] : []}
      onSelectionChange={(keys) => {
        const [next] = keys
        if (next == null) return
        setUncontrolled(next)
        onChange?.(next)
      }}
      className={cx(
        // max-w-full: never wider than the container; text segments shrink and truncate instead
        'relative inline-flex max-w-full gap-0.5 rounded-sm bg-track p-0.5 data-disabled:opacity-50',
        fullWidth && 'flex w-full',
        !label && className,
      )}
    >
      {/* One highlight that slides to the selected segment, instead of each segment filling in */}
      <span
        aria-hidden
        style={thumb}
        className="pointer-events-none absolute top-0.5 bottom-0.5 left-0 rounded-[calc(var(--ui-radius-sm)-2px)] bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.08)] motion-safe:transition-[translate,width] motion-safe:duration-200 motion-safe:ease-out"
      />
      {options.map((o) => (
        <ToggleButton
          key={o.id}
          id={o.id}
          isDisabled={o.isDisabled}
          aria-label={iconOnly && typeof o.label === 'string' ? o.label : undefined}
          className={cx(
            // relative: above the sliding highlight. Same weight selected or not, so widths never jump.
            'relative inline-flex cursor-default items-center justify-center gap-1.5 rounded-[calc(var(--ui-radius-sm)-2px)] text-ui leading-5 font-medium whitespace-nowrap text-muted outline-none transition-colors',
            'data-hovered:text-fg data-focus-visible:ring-2 data-focus-visible:ring-focus data-disabled:opacity-50 data-selected:text-fg',
            '[&_svg]:size-icon [&_svg]:shrink-0',
            // Segment = control height minus the track's 2px padding on each side
            size === 'sm' ? 'h-[calc(var(--ui-control-sm)-0.25rem)]' : 'h-[calc(var(--ui-control)-0.25rem)]',
            'touch:h-[calc(var(--ui-control-touch)-0.25rem)]',
            iconOnly
              ? cx('shrink-0 touch:w-[calc(var(--ui-control-touch)-0.25rem)]', size === 'sm' ? 'w-[calc(var(--ui-control-sm)-0.25rem)]' : 'w-[calc(var(--ui-control)-0.25rem)]')
              : 'min-w-0 px-3 touch:px-3.5',
            fullWidth && 'flex-1',
          )}
        >
          {o.icon}
          {!iconOnly && <span className="truncate">{o.label}</span>}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
  if (!label) return group
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      {/* ToggleButtonGroup has no label slot; the group points at this by id */}
      <span id={labelId} className="text-ui leading-5 font-medium text-fg">
        {label}
      </span>
      {group}
    </div>
  )
}

/**
 * Position of the sliding highlight under the selected segment. Measured after layout and on
 * resize; the first placement skips the transition so it doesn't slide in from the left edge.
 */
function useThumb(groupRef: { current: HTMLDivElement | null }, selected: Key | undefined): CSSProperties {
  const [box, setBox] = useState<{ x: number; width: number } | null>(null)
  const [animate, setAnimate] = useState(false)
  useLayoutEffect(() => {
    const group = groupRef.current
    if (!group) return
    const measure = () => {
      const button = group.querySelector<HTMLElement>('[data-selected]')
      setBox(button ? { x: button.offsetLeft, width: button.offsetWidth } : null)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(group)
    return () => observer.disconnect()
  }, [groupRef, selected])
  const hasBox = box != null
  useEffect(() => {
    if (!hasBox) return
    const frame = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(frame)
  }, [hasBox])
  if (!box) return { opacity: 0 }
  return { translate: `${box.x}px 0`, width: box.width, transition: animate ? undefined : 'none' }
}
