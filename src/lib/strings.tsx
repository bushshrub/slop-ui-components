import { createContext, useContext, useMemo, type ReactNode } from 'react'

/**
 * Every piece of text the components write themselves, in English. Text you pass in (labels, titles,
 * options) is yours to translate. Override any of these with `UIStringsProvider`.
 *
 * Entries with values are functions. Numbers and dates arrive already formatted for the current locale
 * as strings; a raw `count` comes along where the wording depends on it (plural forms).
 */
export const defaultStrings = {
  // Shared
  close: 'Close',
  cancel: 'Cancel',
  ok: 'OK',
  back: 'Back',
  dismiss: 'Dismiss',
  loading: 'Loading',
  moreInfo: 'More info',
  search: 'Search',
  clearSearch: 'Clear search',
  noMatches: 'No matches',
  remove: (name: string) => `Remove ${name}`,
  showPassword: 'Show password',
  hidePassword: 'Hide password',

  // Toast
  notifications: 'Notifications',

  // Sidebar
  openSidebar: 'Open sidebar',
  closeSidebar: 'Close sidebar',
  expandSidebar: 'Expand sidebar',
  collapseSidebar: 'Collapse sidebar',
  sidebar: 'Sidebar',

  // Pagination
  pagination: 'Pagination',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  page: (page: string) => `Page ${page}`,
  pageOf: (page: string, total: string) => `Page ${page} of ${total}`,
  showingRange: (from: string, to: string, total: string) => `Showing ${from}–${to} of ${total}`,

  // Breadcrumbs
  breadcrumbPath: 'Path',
  showHiddenLevels: (count: number) => `Show ${count} hidden levels`,

  // Stepper
  stepOf: (step: string, total: string) => `Step ${step} of ${total}`,
  /** Read by screen readers in place of the check mark and the alert icon. */
  stepCompleted: 'Completed',
  stepError: 'Error',

  // Carousel
  slides: 'Slides',
  slideOf: (slide: string, total: string) => `${slide} of ${total}`,
  goToSlide: (slide: string) => `Go to slide ${slide}`,
  previousSlide: 'Previous slide',
  nextSlide: 'Next slide',

  // Calendar and date pickers
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  openCalendar: 'Open calendar',
  /** Shown when a typed day does not exist in the month (31 February) and the date was moved to the month's last day. */
  dateAdjusted: (typedDay: string, date: string) => `That month has no day ${typedDay}. Changed to ${date}.`,

  // Command palette
  commandPalette: 'Command palette',
  commands: 'Commands',
  commandPlaceholder: 'Type a command or search…',
  noMatchingCommands: 'No matching commands',

  // ComboBox
  pickFromList: 'Pick an option from the list.',

  // NumberField
  increase: 'Increase',
  decrease: 'Decrease',
  /** Stepper button names when the field has a text label: "Increase Font size". */
  increaseField: (label: string) => `Increase ${label}`,
  decreaseField: (label: string) => `Decrease ${label}`,
  numberTooHigh: (max: string) => `Must be ${max} or less.`,
  numberTooLow: (min: string) => `Must be ${min} or more.`,
  numberOffStep: (step: string) => `Must be in steps of ${step}.`,

  // TagInput
  tags: 'Tags',
  tagsFor: (label: string) => `${label} tags`,
  tagAlreadyAdded: 'Already added',
  tagLimit: (max: number) => `Up to ${max} tags`,
  tagLimitReached: (max: number) => `Limit of ${max} reached`,

  // Progress
  free: 'Free',
  usage: 'Usage',
  valueOfMax: (value: string, max: string) => `${value} of ${max}`,

  // File drop
  files: 'Files',
  attach: 'Attach',
  /** `{browse}` marks where the picker button goes; its text is `fileDropBrowse`. */
  fileDropLabel: 'Drop files here or {browse}',
  fileDropBrowse: 'browse',
  uploading: (name: string) => `Uploading ${name}`,
  /** `names` is the list of file names, already joined for the locale. */
  filesTooLarge: (names: string, count: number, maxSize: string) => `${names} ${count > 1 ? 'are' : 'is'} larger than ${maxSize}.`,
  filesWrongType: (names: string, count: number) => `${names} ${count > 1 ? 'are' : 'is'} not a supported file type.`,
  filesOverCount: (names: string, count: number) => `Only one file can be added; ${names} ${count > 1 ? 'were' : 'was'} left out.`,
}

export type UIStrings = typeof defaultStrings

const StringsContext = createContext<UIStrings>(defaultStrings)

export interface UIStringsProviderProps {
  /** Translations for the text the components write. Anything left out stays as the enclosing provider has it. */
  strings: Partial<UIStrings>
  children: ReactNode
}

/**
 * Translates the components' own text for everything inside it. Pair it with react-aria's `I18nProvider`,
 * which sets the locale for number and date formatting and for react-aria's built-in text.
 */
export function UIStringsProvider({ strings, children }: UIStringsProviderProps) {
  const parent = useContext(StringsContext)
  const merged = useMemo(() => ({ ...parent, ...strings }), [parent, strings])
  return <StringsContext.Provider value={merged}>{children}</StringsContext.Provider>
}

/** The components' text in the current language. */
export function useStrings() {
  return useContext(StringsContext)
}
