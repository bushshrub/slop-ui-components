import { DocsContainer, type DocsContainerProps } from '@storybook/addon-docs/blocks'
import type { Decorator, Preview } from '@storybook/react-vite'
import { useEffect, useState, type PropsWithChildren } from 'react'
import { GLOBALS_UPDATED } from 'storybook/internal/core-events'
import { RouterProvider } from 'react-aria-components'
import '../src/styles/fonts.css'
import '../src/styles/index.css'
import './preview.css'
import { applyTheme, storybookTheme } from './themes'

/** Sets data-theme on <html> so portals (menus, modals) pick up the theme too. */
const ThemeRoot = ({ theme, children }: PropsWithChildren<{ theme: string }>) => {
  useEffect(() => {
    if (theme === 'side-by-side') return
    applyTheme(theme)
  }, [theme])
  return children
}

const withTheme: Decorator = (Story, { globals, parameters }) => (
  <ThemeRoot theme={parameters.theme ?? globals.theme ?? 'light'}>
    <Story />
  </ThemeRoot>
)

/** Docs pages don't run decorators for their prose, so follow the toolbar theme here. */
const ThemedDocsContainer = ({ context, children }: PropsWithChildren<DocsContainerProps>) => {
  // `store` isn't on the public DocsContextProps type, but it is on the runtime DocsContext.
  const initial = (context as unknown as { store: { userGlobals: { globals: { theme?: string } } } }).store
    .userGlobals.globals.theme
  const [theme, setTheme] = useState(initial ?? 'light')
  useEffect(() => {
    const onGlobals = ({ globals }: { globals: { theme?: string } }) => setTheme(globals.theme ?? 'light')
    context.channel.on(GLOBALS_UPDATED, onGlobals)
    return () => context.channel.off(GLOBALS_UPDATED, onGlobals)
  }, [context.channel])
  useEffect(() => applyTheme(theme), [theme])
  return (
    <DocsContainer context={context} theme={storybookTheme(theme)}>
      {children}
    </DocsContainer>
  )
}

/**
 * Internal hrefs on react-aria Links (sidebar items, menu items) would reload the story iframe.
 * Apps pass their router's navigate here; stories just swallow it.
 */
const withNoopRouter: Decorator = (Story) => (
  <RouterProvider navigate={() => {}}>
    <Story />
  </RouterProvider>
)

const preview: Preview = {
  // react-aria's live announcer keeps messages in <body> across stories; their labels point at elements
  // from the previous story, which axe then flags. Clear them before each story.
  beforeEach() {
    document.querySelectorAll('[role="log"][aria-live] > *').forEach((n) => n.remove())
  },
  decorators: [withNoopRouter, withTheme],
  tags: ['autodocs'],
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'system', title: 'System', icon: 'browser' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  parameters: {
    layout: 'centered',
    controls: { expanded: true, sort: 'requiredFirst' },
    backgrounds: { disable: true },
    docs: { container: ThemedDocsContainer },
    a11y: { test: 'error' },
    options: {
      storySort: {
        order: [
          'Foundations',
          ['Introduction', 'Colors', 'Typography', 'Theme'],
          'Components',
          [
            'Actions',
            'Typography',
            'Inputs',
            ['TextField', 'Select', 'Checkbox', 'SegmentedControl', 'RadioCards'],
            'Overlays',
            ['Menu', 'Modal', 'Sheet'],
            'Layout',
            'Data display',
          ],
        ],
      },
    },
  },
}

export default preview
