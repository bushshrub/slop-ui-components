import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * The padded, scrolling part of a Modal or Drawer. It is a keyboard stop only while its content overflows, so long
 * bodies can be scrolled with the arrow keys and short ones do not add an empty Tab stop.
 */
export function ModalBody({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scrolls, setScrolls] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setScrolls(el.scrollHeight > el.clientHeight + 1)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    for (const child of el.children) observer.observe(child)
    return () => observer.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      tabIndex={scrolls ? 0 : undefined}
      className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-4 text-ui outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset"
    >
      {children}
    </div>
  )
}
