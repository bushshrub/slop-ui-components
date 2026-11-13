import type { ReactNode } from 'react'
import { Dialog, DialogTrigger, Popover, type PopoverProps } from 'react-aria-components'
import { Info } from 'lucide-react'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'
import { IconButton } from '../Button/Button'
import { TooltipArrow, bubbleClass } from './Tooltip'

export interface ToggletipProps extends Omit<PopoverProps, 'className' | 'children' | 'triggerRef'> {
  /** Help text in the bubble. */
  children: ReactNode
  /** Accessible name of the info button. */
  'aria-label'?: string
  /** Replace the default info icon. */
  icon?: ReactNode
  className?: string
}

/**
 * Small info button that opens a tooltip-styled bubble on press or tap. Unlike Tooltip it works on touch
 * and keyboard, so use it for help text that phone users must be able to reach. Closes on outside tap or Esc.
 */
export function Toggletip({ children, 'aria-label': ariaLabel, icon, placement = 'top', className, ...props }: ToggletipProps) {
  const strings = useStrings()
  const label = ariaLabel ?? strings.moreInfo
  return (
    <DialogTrigger>
      <IconButton size="sm" aria-label={label} tooltip={false}>
        {icon ?? <Info />}
      </IconButton>
      <Popover {...props} placement={placement} offset={8} className={cx(bubbleClass, 'max-w-64', className)}>
        <TooltipArrow />
        <Dialog aria-label={label} className="outline-none">
          {children}
        </Dialog>
      </Popover>
    </DialogTrigger>
  )
}
