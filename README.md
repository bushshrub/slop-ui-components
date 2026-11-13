# slop-ui-components

React UI components for app interfaces: buttons, inputs, overlays, feedback, navigation and layout. Built on
[react-aria-components](https://react-spectrum.adobe.com/react-aria/) and Tailwind CSS v4, and themed entirely
with CSS variables, so it can take on your app's look.

> [!WARNING]
> **This is AI-written slop. You probably shouldn't use it.**
> It isn't reviewed or hardened, the API will change without notice, and it may stop being maintained at
> any time. If you still want to try it, pin an exact commit, or fork it and treat the code as your own.

## Install

It is not on npm. Install it from GitHub, pinned to a release tag or a commit:

```sh
pnpm add github:bushshrub/slop-ui-components#v0.2.1
pnpm add github:bushshrub/slop-ui-components#<commit>
```

Requires React 19 and Tailwind CSS v4. The package ships TypeScript source, not a build, so your bundler compiles
it (Vite does this out of the box).

```css
/* app.css */
@import "slop-ui-components/styles.css";   /* Tailwind, the tokens and the theme */
@import "slop-ui-components/fonts.css";    /* optional, self-hosted fonts */
@source "../node_modules/slop-ui-components/src";   /* let Tailwind see the component classes */
```

The `@source` path is relative to your CSS file: from `src/app.css` it is `"../node_modules/slop-ui-components/src"`,
from a stylesheet at the project root `"./node_modules/slop-ui-components/src"`.

If your app already imports Tailwind (or another package does it for you), keep that import and take the theme
without it:

```css
@import "tailwindcss";
@import "slop-ui-components/theme.css";    /* the tokens and the theme, no Tailwind import */
@source "../node_modules/slop-ui-components/src";
```

```tsx
import { Button, NumberField, Modal } from 'slop-ui-components'
```

## What is in it

| Group      | Components                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| Actions    | Button, IconButton                                                                                          |
| Inputs     | TextField, SearchField, NumberField, Select, ComboBox, Checkbox, Switch, Slider, SegmentedControl, RadioCards, TagInput, DatePicker, DateRangePicker, DateField, Calendar, FileDropZone, FileButton |
| Overlays   | Menu, MenuList, Modal, ConfirmModal, `confirm()`, Sheet, Popover, Tooltip, Toggletip, CommandPalette                               |
| Feedback   | Toast, Alert, Spinner, Skeleton, ProgressBar, Meter, StackedMeter, EmptyState                               |
| Navigation | Tabs, Breadcrumbs, Pagination, Stepper                                                                      |
| Layout     | AppShell, Sidebar, Card, SettingsGroup, SettingsRow, Carousel, Disclosure, Heading, PageHeader                                          |
| Data       | Table, DataTable, Badge, CountBadge, Kbd, Highlight                                                                               |

Storybook has a page for each, plus larger examples (a chat app, a settings dialog):

```sh
pnpm install
pnpm storybook   # http://127.0.0.1:6206
```

## Theming

Every color, radius, font and size is a `--ui-*` CSS variable in `src/styles/tokens.css`. Set `data-theme="light"`
or `"dark"` on any ancestor, or leave it unset to follow the OS. Override variables on `:root` or any subtree:

```css
:root { --ui-accent: #2f5fd0; --ui-radius-md: 6px; }
```

If your app has its own default theme rather than following the OS, set `data-theme` on `<html>` yourself (in
`index.html` too, so the first paint is right). If it already has its own tokens, point ours at them after the import:

```css
:root {
  --ui-bg: var(--app-bg);
  --ui-fg: var(--app-fg);
}
```

Muted text sits on tinted fills as well as on the page, so when you map `--ui-muted`, check it still reads (4.5:1)
on `--ui-track`, `--ui-hover` and `--ui-button`, and map those too if it does not.

Sizes are in `rem`, so changing the root font size scales text and spacing together. To change spacing alone, set
`data-density="compact"` or `"spacious"` on `<html>` or on any subtree; it changes the heights of controls and rows
and leaves text size alone.

## Languages

Text you pass in is yours to translate. The text the components write themselves ("Close", "No matches", error
messages) is in `src/lib/strings.tsx`; override it with `UIStringsProvider`, and set the locale with `I18nProvider`:

```tsx
import { I18nProvider, UIStringsProvider } from 'slop-ui-components'

<I18nProvider locale="de-DE">
  <UIStringsProvider strings={{ close: 'Schließen' }}>
    <App />
  </UIStringsProvider>
</I18nProvider>
```

Right-to-left layout is not supported.

## Development

```sh
pnpm typecheck     # tsc
pnpm test          # story tests in a real browser (light and dark), with axe checks
pnpm lint          # oxlint
pnpm audit:phone   # every story at 320 and 390px: overflow, tap-target size, axe (needs Storybook running)
```

## License

MIT
