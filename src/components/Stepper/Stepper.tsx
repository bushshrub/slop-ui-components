import { Check, CircleAlert } from 'lucide-react'
import { Children, isValidElement, type ReactNode } from 'react'
import { Button as AriaButton, useLocale } from 'react-aria-components'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'
import { PHONE_QUERY, useMediaQuery } from '../../lib/useMediaQuery'

export type StepStatus = 'complete' | 'current' | 'upcoming' | 'error'

export interface StepProps {
  title: ReactNode
  description?: ReactNode
  /** Overrides the status derived from `currentStep`, e.g. `error` for a step that failed. */
  status?: StepStatus
}

/** One step of a Stepper. The Stepper reads its props from the children; it renders nothing on its own. */
export function Step(_props: StepProps) {
  return null
}

export interface StepperProps {
  /** Index of the step in progress, 0-based. Steps before it are complete. */
  currentStep: number
  /** Makes completed steps pressable; the callback receives the step index. */
  onStepChange?: (index: number) => void
  /** With `onStepChange`, also makes upcoming steps pressable. */
  allowJump?: boolean
  orientation?: 'horizontal' | 'vertical'
  /** Steps as data, instead of `<Step>` children. */
  steps?: StepProps[]
  children?: ReactNode
  'aria-label': string
  className?: string
}

const indicatorBase =
  'flex size-[calc(var(--ui-icon)*1.5)] shrink-0 items-center justify-center rounded-full text-ui-sm font-medium tabular-nums [&_svg]:size-icon'

const indicatorTone: Record<StepStatus, string> = {
  complete: 'bg-interactive text-interactive-fg',
  current: 'bg-interactive text-interactive-fg',
  upcoming: 'border border-border-strong text-muted',
  error: 'bg-danger text-danger-fg',
}

const titleTone: Record<StepStatus, string> = {
  complete: 'text-fg',
  current: 'font-medium text-fg',
  upcoming: 'text-muted',
  error: 'font-medium text-danger',
}

// Touch screens get a 44px hit area; the visual indicator stays small
const pressable =
  'relative flex cursor-default items-center rounded-sm text-left outline-none data-focus-visible:ring-2 data-focus-visible:ring-focus touch:min-h-control-touch touch:min-w-control-touch'

/**
 * Progress through a multi-step flow: steps before `currentStep` are complete, the current one is highlighted.
 * Press a completed step to go back when `onStepChange` is set. On phones a horizontal stepper shows only the current title.
 */
export function Stepper({
  currentStep,
  onStepChange,
  allowJump = false,
  orientation = 'horizontal',
  steps,
  children,
  className,
  ...props
}: StepperProps) {
  const phone = useMediaQuery(PHONE_QUERY)
  const vertical = orientation === 'vertical'
  const compact = !vertical && phone
  const items = steps ?? Children.toArray(children).flatMap((child) => (isValidElement<StepProps>(child) ? [child.props] : []))
  const current = items[currentStep]
  const strings = useStrings()
  const { locale } = useLocale()
  const format = (n: number) => new Intl.NumberFormat(locale).format(n)

  return (
    <nav {...props} className={className}>
      <ol className={cx('flex', vertical ? 'flex-col' : 'items-center')}>
        {items.map((step, i) => {
          const last = i === items.length - 1
          const status: StepStatus = step.status ?? (i < currentStep ? 'complete' : i === currentStep ? 'current' : 'upcoming')
          const isCurrent = i === currentStep
          const canPress = onStepChange !== undefined && !isCurrent && (i < currentStep || allowJump)
          const connectorTone = i < currentStep ? 'bg-interactive' : 'bg-border-strong'
          const indicator = (
            <span className={cx(indicatorBase, indicatorTone[status])}>
              {status === 'complete' ? <Check /> : status === 'error' ? <CircleAlert /> : i + 1}
              {(status === 'complete' || status === 'error') && (
                <span className="sr-only">{status === 'complete' ? strings.stepCompleted : strings.stepError}</span>
              )}
            </span>
          )
          const text = (
            <span className={cx('flex min-w-0 flex-col', compact && 'sr-only', !vertical && 'whitespace-nowrap')}>
              <span className={cx('text-ui leading-5', titleTone[status])}>{step.title}</span>
              {step.description && <span className="text-ui-sm leading-4 text-muted">{step.description}</span>}
            </span>
          )

          let body: ReactNode
          if (vertical) {
            body = (
              <>
                <span className="flex flex-col items-center self-stretch">
                  {indicator}
                  {!last && <span aria-hidden className={cx('my-1 min-h-4 w-px flex-1', connectorTone)} />}
                </span>
                <span className={cx('min-w-0 flex-1', !last && 'pb-6')}>{text}</span>
              </>
            )
          } else {
            body = (
              <>
                {indicator}
                {text}
              </>
            )
          }

          const row = vertical ? 'flex items-stretch gap-3' : 'flex items-center gap-2.5'
          return (
            <li
              key={i}
              aria-current={isCurrent ? 'step' : undefined}
              className={cx(vertical ? 'flex' : 'flex flex-1 items-center gap-3 last:flex-none')}
            >
              {canPress ? (
                <AriaButton onPress={() => onStepChange?.(i)} className={cx(pressable, row)}>
                  {body}
                </AriaButton>
              ) : (
                <div className={row}>{body}</div>
              )}
              {!vertical && !last && <span aria-hidden className={cx('h-px min-w-4 flex-1', connectorTone)} />}
            </li>
          )
        })}
      </ol>
      {compact && current && (
        <p aria-hidden className="mt-2 flex min-w-0 gap-2 text-ui leading-5">
          <span className="shrink-0 text-muted tabular-nums">
            {strings.stepOf(format(currentStep + 1), format(items.length))}
          </span>
          <span className="min-w-0 truncate font-medium">{current.title}</span>
        </p>
      )}
    </nav>
  )
}
