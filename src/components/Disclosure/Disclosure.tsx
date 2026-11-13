import type { ReactNode } from 'react'
import {
  Button as AriaButton,
  Disclosure as AriaDisclosure,
  DisclosureGroup as AriaDisclosureGroup,
  DisclosurePanel as AriaDisclosurePanel,
  Heading as AriaHeading,
  type DisclosureGroupProps as AriaDisclosureGroupProps,
  type DisclosureProps as AriaDisclosureProps,
} from 'react-aria-components'
import { ChevronDown } from 'lucide-react'
import { cx } from '../../lib/cx'

export interface DisclosureProps extends Omit<AriaDisclosureProps, 'className' | 'children'> {
  /** Text of the always-visible row that toggles the panel. */
  title: ReactNode
  /** Content revealed when expanded. */
  children: ReactNode
  className?: string
}

/** A section that expands and collapses from a full-width title row. */
export function Disclosure({ title, children, className, ...props }: DisclosureProps) {
  return (
    <AriaDisclosure {...props} className={cx('group font-sans', className)}>
      <AriaHeading className="m-0">
        <AriaButton
          slot="trigger"
          className="flex min-h-row w-full cursor-default items-center justify-between gap-2 rounded-sm px-3 py-2 text-left text-ui font-medium text-fg outline-none transition-colors data-disabled:opacity-50 data-focus-visible:outline-2 data-focus-visible:-outline-offset-2 data-focus-visible:outline-solid data-focus-visible:outline-focus data-hovered:bg-hover touch:min-h-control-touch"
        >
          {title}
          <ChevronDown
            aria-hidden
            className="size-icon shrink-0 text-muted motion-safe:transition-transform group-data-expanded:rotate-180"
          />
        </AriaButton>
      </AriaHeading>
      <AriaDisclosurePanel className="h-(--disclosure-panel-height) overflow-clip motion-safe:transition-[height] motion-safe:duration-200">
        <div className="px-3 pt-1 pb-3 text-ui text-muted">{children}</div>
      </AriaDisclosurePanel>
    </AriaDisclosure>
  )
}

export interface DisclosureGroupProps extends Omit<AriaDisclosureGroupProps, 'className'> {
  className?: string
}

/** Accordion of Disclosures with dividers between them. Set `allowsMultipleExpanded` to let several stay open. */
export function DisclosureGroup({ className, ...props }: DisclosureGroupProps) {
  return <AriaDisclosureGroup {...props} className={cx('flex flex-col divide-y divide-divider', className)} />
}
