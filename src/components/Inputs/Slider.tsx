import {
  Slider as AriaSlider,
  SliderFill,
  SliderOutput,
  SliderThumb,
  SliderTrack,
  Text,
  type SliderProps as AriaSliderProps,
} from 'react-aria-components'
import { FieldLabel, fieldStack, type FieldChromeProps } from './field'

export interface SliderProps
  extends Omit<AriaSliderProps, 'className' | 'children' | 'label' | 'orientation'>,
    Pick<FieldChromeProps, 'label' | 'description'> {
  /** Show the current value at the right of the label row. */
  showValue?: boolean
  /** Mark each step on the track. Defaults to on when `step` is set and there are few enough steps to tell apart. */
  showSteps?: boolean
  className?: string
}

// Past this many steps the marks blur into a line, so they are off unless asked for
const MAX_AUTO_STEPS = 20

/**
 * Pick a number, or a range with two thumbs, by dragging or with the arrow keys.
 * Pass an array to `value` or `defaultValue` for a range. Use NumberField when the exact number matters.
 */
export function Slider({ label, description, showValue = true, showSteps, className, ...props }: SliderProps) {
  const { minValue = 0, maxValue = 100, step } = props
  const stepCount = step ? Math.floor((maxValue - minValue) / step) : 0
  const marked = showSteps ?? (stepCount > 1 && stepCount <= MAX_AUTO_STEPS)
  // The two ends of the track need no mark
  const marks = marked && step ? Array.from({ length: Math.max(0, Math.ceil((maxValue - minValue) / step) - 1) }, (_, i) => (i + 1) * step) : []
  return (
    <AriaSlider {...props} orientation="horizontal" className={fieldStack(className)}>
      <div className="flex items-center gap-3">
        {label && <FieldLabel>{label}</FieldLabel>}
        {showValue && <SliderOutput className="ml-auto text-ui tabular-nums text-fg" />}
      </div>
      <SliderTrack className="relative flex h-(--ui-switch) w-full cursor-pointer items-center touch:h-control-touch data-disabled:cursor-not-allowed data-disabled:opacity-50">
        {({ state }) => (
          <>
            <div className="absolute inset-x-0 top-1/2 h-progress -translate-y-1/2 rounded-full bg-border-strong" />
            <SliderFill className="absolute top-1/2 !h-progress -translate-y-1/2 rounded-full bg-interactive" />
            {marks.map((offset) => (
              <span
                key={offset}
                aria-hidden
                style={{ left: `${(offset / (maxValue - minValue)) * 100}%` }}
                className="absolute top-1/2 size-0.5 -translate-1/2 rounded-full bg-knob"
              />
            ))}
            {state.values.map((_, index) => (
              <SliderThumb
                key={index}
                index={index}
                className="absolute top-1/2 size-(--ui-switch) rounded-full border border-border-strong bg-knob shadow-sm outline-none touch:size-control-touch data-focus-visible:ring-2 data-focus-visible:ring-focus"
              />
            ))}
          </>
        )}
      </SliderTrack>
      {description && <Text slot="description" className="text-ui-sm leading-4 text-muted">{description}</Text>}
    </AriaSlider>
  )
}
