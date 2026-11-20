import { create } from 'storybook/theming'

/** Storybook's own chrome (sidebar, toolbar, docs prose, arg tables), matched to our tokens. */
export const storybookThemes = {
  light: create({
    base: 'light',
    appBg: '#f3f1ea',
    appContentBg: '#faf9f5',
    appPreviewBg: '#faf9f5',
    appBorderColor: '#e8e4d8',
    textColor: '#29261b',
    textMutedColor: '#5f5b4e',
  }),
  dark: create({
    base: 'dark',
    appBg: '#1f1e1d',
    appContentBg: '#262624',
    appPreviewBg: '#262624',
    appBorderColor: '#3e3d39',
    textColor: '#ece9e1',
    textMutedColor: '#bcb7aa',
  }),
}

/** `system` follows the OS, like the kit's tokens do when no data-theme is set. */
export const resolveTheme = (theme: string | undefined): 'light' | 'dark' =>
  theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'

export const storybookTheme = (theme: string | undefined) => storybookThemes[resolveTheme(theme)]

/** Sets data-theme on <html>; `system` removes it so the OS preference applies. */
export function applyTheme(theme: string) {
  if (theme === 'system') delete document.documentElement.dataset.theme
  else document.documentElement.dataset.theme = theme
}
