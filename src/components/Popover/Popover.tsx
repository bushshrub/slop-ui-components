import { createContext, useContext, useState, type ReactNode } from 'react'
import {
  Dialog,
  DialogTrigger,
  Heading,
  Popover as AriaPopover,
  type PopoverProps as AriaPopoverProps,
} from 'react-aria-components'
import { ArrowLeft, X } from 'lucide-react'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'
import { IconButton } from '../Button/Button'

/** Wraps a trigger button and a `Popover`. Re-export of react-aria's DialogTrigger. */
export const PopoverTrigger = DialogTrigger

export interface PopoverView {
  /** Header title while this view is showing. */
  title: ReactNode
  content: ReactNode
}

interface PopoverViewApi {
  /** Replace the panel content with a sub-view; the header gets a back arrow. */
  push: (view: PopoverView) => void
  /** Return to the previous view. */
  pop: () => void
  /** Close the whole popover. */
  close: () => void
  /** 0 on the main view, 1+ inside sub-views. */
  depth: number
}

const ViewContext = createContext<PopoverViewApi | null>(null)

/** Drill-in controls for content rendered inside a `Popover`. */
export function usePopoverView() {
  const api = useContext(ViewContext)
  if (!api) throw new Error('usePopoverView must be used inside a Popover')
  return api
}

export interface PopoverProps extends Omit<AriaPopoverProps, 'className' | 'children'> {
  /** Header title of the main view. Without it, pass `aria-label`. */
  title?: ReactNode
  'aria-label'?: string
  /** Show the close button in the header. */
  showClose?: boolean
  /** Panel width and other overrides, e.g. `w-96`. */
  className?: string
  children: ReactNode | ((api: PopoverViewApi) => ReactNode)
}

/**
 * Non-modal panel anchored to its trigger, for content that is not a list of actions (use Menu for those).
 * Children may be a function of the view API, or call `usePopoverView()` to drill into a sub-view in place.
 */
export function Popover({ title, 'aria-label': ariaLabel, showClose = true, className, children, placement = 'bottom end', ...props }: PopoverProps) {
  return (
    <AriaPopover
      {...props}
      placement={placement}
      offset={8}
      className={cx(
        'max-w-[calc(100vw-1.5rem)] overflow-auto rounded-popover border border-border bg-popover text-fg shadow-popover outline-none motion-safe:data-entering:animate-pop-in',
        'w-80',
        className,
      )}
    >
      <Dialog aria-label={title ? undefined : ariaLabel} className="outline-none">
        {({ close }) => (
          <Panel title={title} close={close} showClose={showClose}>
            {children}
          </Panel>
        )}
      </Dialog>
    </AriaPopover>
  )
}

function Panel({
  title,
  close,
  showClose,
  children,
}: {
  title?: ReactNode
  close: () => void
  showClose: boolean
  children: PopoverProps['children']
}) {
  const [stack, setStack] = useState<PopoverView[]>([])
  const [navigated, setNavigated] = useState(false)
  const api: PopoverViewApi = {
    push: (view) => {
      setNavigated(true)
      setStack((s) => [...s, view])
    },
    pop: () => {
      setNavigated(true)
      setStack((s) => s.slice(0, -1))
    },
    close,
    depth: stack.length,
  }
  const strings = useStrings()
  const current = stack[stack.length - 1]
  const heading = current ? current.title : title
  return (
    <ViewContext.Provider value={api}>
      <div className="flex items-center gap-1 p-3 pb-0">
        {current && (
          <IconButton aria-label={strings.back} size="sm" onPress={api.pop} className="-ml-1">
            <ArrowLeft />
          </IconButton>
        )}
        <Heading slot="title" className="min-w-0 flex-1 truncate px-1 text-ui font-medium leading-5">
          {heading}
        </Heading>
        {showClose && (
          <IconButton aria-label={strings.close} size="sm" onPress={close} className="-mr-1">
            <X />
          </IconButton>
        )}
      </div>
      <div key={stack.length} className={cx('p-3', navigated && 'motion-safe:animate-drill-in')}>
        {current ? current.content : typeof children === 'function' ? children(api) : children}
      </div>
    </ViewContext.Provider>
  )
}
