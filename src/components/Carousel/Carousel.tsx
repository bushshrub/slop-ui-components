import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { Button as AriaButton, useLocale } from 'react-aria-components'
import { cx } from '../../lib/cx'
import { useStrings } from '../../lib/strings'
import { PHONE_QUERY, useMediaQuery } from '../../lib/useMediaQuery'
import { IconButton } from '../Button/Button'

// Gap sizes in Tailwind spacing steps, so they follow the theme's --spacing unit
const gapSteps = { sm: 2, md: 3, lg: 4 } as const

/** Index of the slide nearest the scroller's left edge; the last stop once the scroller is at its end. */
function nearestSlide(el: HTMLElement, stops: number) {
  const atEnd = el.scrollWidth > el.clientWidth && el.scrollLeft + el.clientWidth >= el.scrollWidth - 1
  if (atEnd) return stops - 1
  const origin = el.getBoundingClientRect().left
  let best = 0
  let bestDistance = Infinity
  Array.from(el.children).forEach((slide, i) => {
    const distance = Math.abs(slide.getBoundingClientRect().left - origin)
    if (distance < bestDistance) {
      best = Math.min(i, stops - 1)
      bestDistance = distance
    }
  })
  return best
}

/** Smooth-scrolls slide `i` to the left edge, or jumps when the user prefers reduced motion. */
function scrollSlide(el: HTMLElement | null, i: number, stops: number, pending: { current: number | null }) {
  const slide = el?.children[i] as HTMLElement | undefined
  if (!el || !slide) return
  pending.current = nearestSlide(el, stops) === i ? null : i
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // Not scrollIntoView: that can also scroll the page
  el.scrollTo({ left: slide.offsetLeft - el.offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' })
}

interface SlideInfo {
  index: number
  count: number
  basis: string
}

const SlideContext = createContext<SlideInfo | null>(null)

export interface CarouselSlideProps {
  className?: string
  children?: ReactNode
}

/** One slide. Sized and labelled by the enclosing Carousel. */
export function CarouselSlide({ className, children }: CarouselSlideProps) {
  const slide = useContext(SlideContext)
  const strings = useStrings()
  const { locale } = useLocale()
  const format = (n: number) => new Intl.NumberFormat(locale).format(n)
  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={slide ? strings.slideOf(format(slide.index + 1), format(slide.count)) : undefined}
      style={{ flexBasis: slide?.basis }}
      className={cx('shrink-0 snap-start', className)}
    >
      {children}
    </div>
  )
}

export interface CarouselProps {
  /** Accessible name for the carousel, e.g. "Onboarding tips". */
  'aria-label': string
  /** Slides visible at once. A fraction (1.2) peeks the next slide. On phones an integer shows one slide. */
  slidesPerView?: number
  gap?: keyof typeof gapSteps
  /** Next on the last slide goes to the first, and the reverse. */
  loop?: boolean
  showDots?: boolean
  showArrows?: boolean
  /** Active slide, 0-based. Omit to let the carousel track it. */
  index?: number
  /** Called with the new index when the active slide changes, by scrolling or by the controls. */
  onIndexChange?: (index: number) => void
  children?: ReactNode
  className?: string
}

/**
 * Horizontal slides that snap as you scroll or swipe. Use CarouselSlide for each slide.
 * Arrow keys move slides while the scroller is focused. There is no autoplay.
 */
export function Carousel({
  'aria-label': label,
  slidesPerView = 1,
  gap = 'md',
  loop = false,
  showDots = true,
  showArrows = true,
  index,
  onIndexChange,
  children,
  className,
}: CarouselProps) {
  const phone = useMediaQuery(PHONE_QUERY)
  const strings = useStrings()
  const { locale } = useLocale()
  const format = (n: number) => new Intl.NumberFormat(locale).format(n)
  const slides = Children.toArray(children).filter(isValidElement)
  const count = slides.length
  const perView = phone && Number.isInteger(slidesPerView) ? 1 : slidesPerView
  // Scroll positions: with two slides per view the last slide never reaches the left edge
  const stops = Math.max(1, count - Math.floor(perView) + 1)
  const gapValue = `calc(var(--spacing) * ${gapSteps[gap]})`
  const basis = `calc((100% - ${perView - 1} * ${gapValue}) / ${perView})`

  const controlled = index !== undefined
  const [uncontrolled, setUncontrolled] = useState(0)
  const active = controlled ? index : uncontrolled
  // Read by scroll handlers, which can fire before React re-renders
  const activeRef = useRef(active)
  useEffect(() => {
    activeRef.current = active
  })

  const scrollRef = useRef<HTMLDivElement>(null)
  // Slide a programmatic scroll is heading to; scroll events for other slides are ignored until it lands
  const pending = useRef<number | null>(null)

  const setActive = (i: number) => {
    activeRef.current = i
    if (!controlled) setUncontrolled(i)
    onIndexChange?.(i)
  }

  const goTo = (target: number) => {
    if (count === 0) return
    const next = loop ? (((target % stops) + stops) % stops) : Math.min(Math.max(target, 0), stops - 1)
    if (next === activeRef.current) return
    setActive(next)
    scrollSlide(scrollRef.current, next, stops, pending)
  }

  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const i = nearestSlide(el, stops)
    if (pending.current !== null) {
      if (i !== pending.current) return
      pending.current = null
    }
    if (i !== activeRef.current) setActive(i)
  }

  // Controlled index changed from outside: bring that slide into view
  useEffect(() => {
    const el = scrollRef.current
    if (index !== undefined && el && nearestSlide(el, stops) !== index) scrollSlide(el, index, stops, pending)
  }, [index, stops])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      goTo(activeRef.current + (e.key === 'ArrowLeft' ? -1 : 1))
    }
  }

  const atStart = !loop && active <= 0
  const atEnd = !loop && active >= stops - 1

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className={cx('flex min-w-0 flex-col gap-3', className)}
    >
      <div
        ref={scrollRef}
        role="group"
        aria-label={strings.slides}
        tabIndex={0}
        onScroll={onScroll}
        onPointerDown={() => {
          // A finger or mouse takes over from any programmatic scroll
          pending.current = null
        }}
        onKeyDown={onKeyDown}
        style={{ gap: gapValue }}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-sm outline-none [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-focus [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, i) => (
          <SlideContext.Provider key={i} value={{ index: i, count, basis }}>
            {slide}
          </SlideContext.Provider>
        ))}
      </div>
      {(showDots || showArrows) && (
        <div className="flex items-center justify-between gap-2">
          {showDots && (
            <div className="flex items-center gap-1">
              {Array.from({ length: stops }, (_, i) => (
                <AriaButton
                  key={i}
                  aria-label={strings.goToSlide(format(i + 1))}
                  aria-current={i === active ? 'true' : undefined}
                  onPress={() => goTo(i)}
                  className="relative flex size-icon cursor-default items-center justify-center rounded-full outline-none data-focus-visible:ring-2 data-focus-visible:ring-focus touch:size-control-touch"
                >
                  <span
                    className={cx('size-1.5 rounded-full transition-colors', i === active ? 'bg-fg' : 'bg-border-strong')}
                  />
                </AriaButton>
              ))}
            </div>
          )}
          {showArrows && (
            // Swipe and dots cover touch screens, so the arrows go there
            <div className="ml-auto flex items-center gap-1 touch:hidden">
              <IconButton size="sm" aria-label={strings.previousSlide} isDisabled={atStart} onPress={() => goTo(active - 1)}>
                <ChevronLeft />
              </IconButton>
              <IconButton size="sm" aria-label={strings.nextSlide} isDisabled={atEnd} onPress={() => goTo(active + 1)}>
                <ChevronRight />
              </IconButton>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
