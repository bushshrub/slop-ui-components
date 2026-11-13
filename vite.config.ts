/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// https://vite.dev/config/
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
/** One project per theme, so every story (and its a11y check) runs in light and dark. */
const storybookProject = (theme: 'light' | 'dark') => ({
  extends: true,
  plugins: [storybookTest({ configDir: path.join(dirname, '.storybook'), initialGlobals: { theme } })],
  test: {
    name: `storybook-${theme}`,
    browser: {
      enabled: true,
      headless: true,
      // Reduced motion: enter animations start at opacity 0 and would fail visibility checks
      provider: playwright({ contextOptions: { reducedMotion: 'reduce' } }),
      instances: [{ browser: 'chromium' as const }],
    },
  },
})

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    projects: [storybookProject('light'), storybookProject('dark')],
  },
})
