import { useEffect, useState } from 'react'
import { cx } from '../../lib/cx'

export interface SectionRailItem {
  /** The `id` of the section element on the page. */
  id: string
  label: string
}

export interface SectionRailProps {
  sections: SectionRailItem[]
  /** Name of the navigation for screen readers, e.g. "On this page". */
  'aria-label': string
  className?: string
}

/**
 * Links to the sections of a long page, marking the one being read. Vertical in a side column on wide screens (see
 * `Page`'s `aside`), a scrolling row of chips on narrow ones. Give each section the matching `id`, and a
 * `scroll-mt-*` if a sticky header would cover its top.
 */
export function SectionRail({ sections, className, ...props }: SectionRailProps) {
  const current = useCurrentSection(sections)
  return (
    <nav aria-label={props['aria-label']} className={className}>
      <ul className="m-0 flex list-none gap-1 overflow-x-auto p-0 max-lg:-mx-1 max-lg:px-1 lg:flex-col lg:gap-0.5">
        {sections.map((s) => {
          const active = s.id === current
          return (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                aria-current={active ? 'location' : undefined}
                className={cx(
                  'flex items-center rounded-md px-2.5 text-ui whitespace-nowrap no-underline outline-none',
                  'h-control touch:h-control-touch focus-visible:ring-2 focus-visible:ring-focus',
                  'lg:h-auto lg:min-h-8 lg:border-l-2 lg:rounded-l-none lg:whitespace-normal',
                  active
                    ? 'bg-selected font-medium text-fg lg:border-fg lg:bg-transparent'
                    : 'text-muted hover:bg-hover hover:text-fg lg:border-transparent lg:hover:bg-transparent',
                  'forced-colors:aria-[current]:border-[Highlight]',
                )}
              >
                {s.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** The section being read: the last one whose top has scrolled up to near the top of the viewport. */
function useCurrentSection(sections: SectionRailItem[]) {
  const [current, setCurrent] = useState(sections[0]?.id)
  const ids = sections.map((s) => s.id).join(' ')
  useEffect(() => {
    const els = ids.split(' ').map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el)
    if (!els.length) return
    const update = () => {
      // Near the top edge, not a third of the way down: a short section would otherwise hand over to the next too soon
      const line = Math.min(window.innerHeight / 3, 96)
      let best = els[0].id
      // Until the first section starts to scroll away, the page is still at its start
      if (els[0].getBoundingClientRect().top < 0) for (const el of els) if (el.getBoundingClientRect().top <= line) best = el.id
      // At the very bottom the last section may never reach the line: count it as read
      const scroller = document.scrollingElement
      if (scroller && scroller.scrollTop + window.innerHeight >= scroller.scrollHeight - 2) best = els[els.length - 1].id
      setCurrent(best)
    }
    update()
    // Capture: also hears scrolling inside nested containers, e.g. an app shell's main area
    document.addEventListener('scroll', update, { capture: true, passive: true })
    window.addEventListener('resize', update)
    return () => {
      document.removeEventListener('scroll', update, { capture: true })
      window.removeEventListener('resize', update)
    }
  }, [ids])
  return current
}
