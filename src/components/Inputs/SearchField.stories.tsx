import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { SearchField } from './SearchField'

const meta = {
  title: 'Components/Inputs/SearchField',
  component: SearchField,
  args: { 'aria-label': 'Search settings', placeholder: 'Search settings', onChange: fn(), className: 'w-72' },
  parameters: {
    docs: {
      description: {
        component: 'Search box with a clear button. Esc clears it. Use `value` / `onChange` to filter a list as the user types.',
      },
    },
  },
} satisfies Meta<typeof SearchField>

export default meta
type Story = StoryObj<typeof meta>

export const Main: Story = { name: 'SearchField' }

/** Test for SearchField: hidden from the sidebar and docs. */
export const MainTest: Story = {
  ...Main,
  name: 'SearchField (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole('searchbox', { name: 'Search settings' })
    await expect(canvas.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
    await userEvent.type(field, 'theme')
    await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }))
    await expect(field).toHaveValue('')
    await userEvent.type(field, 'font')
    await userEvent.keyboard('{Escape}')
    await expect(field).toHaveValue('')
  },
}
