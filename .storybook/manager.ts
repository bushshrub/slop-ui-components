import { addons } from 'storybook/manager-api'
import { GLOBALS_UPDATED, SET_GLOBALS } from 'storybook/internal/core-events'
import { storybookTheme } from './themes'

/** The toolbar Theme only reaches the preview, so restyle the sidebar and toolbar to match it. */
addons.register('slop-ui/theme-sync', (api) => {
  const sync = ({ globals }: { globals: { theme?: string } }) => api.setOptions({ theme: storybookTheme(globals.theme) })
  api.on(SET_GLOBALS, sync)
  api.on(GLOBALS_UPDATED, sync)
})
