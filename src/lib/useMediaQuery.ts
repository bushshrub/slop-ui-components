import { useEffect, useState } from 'react'

/** Phone widths: the sidebar becomes a drawer and menus open as bottom sheets. */
export const PHONE_QUERY = '(max-width: 767px)'

/** The user asked the system for less motion: no slides, no spins, nothing that moves across the screen. */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return matches
}
