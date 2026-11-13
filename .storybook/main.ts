import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
  ],
  framework: '@storybook/react-vite',
  typescript: {
    // react-docgen (not -typescript): TypeScript 7 has no JS compiler API for docgen-typescript to load.
    // It still reads JSDoc on props into Controls and Docs.
    reactDocgen: 'react-docgen',
  },
  viteFinal(config) {
    // Reachable from the LAN by hostname
    config.server = { ...config.server, allowedHosts: ['.local', '.home', 'localhost'] }
    return config
  },
}
export default config
