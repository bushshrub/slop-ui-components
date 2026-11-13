import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/** tailwind-merge taught the custom token names, so `text-ui` is a size (not a color) and `rounded-popover` a radius. */
const merge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['ui', 'ui-sm'],
      radius: ['popover'],
      shadow: ['popover'],
      animate: ['pop-in', 'fade-in', 'slide-in', 'slide-up', 'drill-in', 'indeterminate'],
    },
  },
})

/**
 * Joins class names; on conflicts the later class wins. This is what lets a `className`
 * prop override a component's own classes: `<Button className="rounded-full" />`.
 */
export function cx(...inputs: ClassValue[]) {
  return merge(clsx(inputs))
}
