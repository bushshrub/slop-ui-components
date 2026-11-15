import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect } from 'storybook/test'
import { ColorSwatch } from './ColorSwatch'

const meta = {
  title: 'Components/Data display/ColorSwatch',
  component: ColorSwatch,
  parameters: {
    docs: {
      description: {
        component:
          'A colour chip for data that carries a colour: labels, tags, themes. Takes any CSS colour including 8-digit hex ' +
          '(`#RRGGBBAA`), which shows over a checkerboard so the alpha is visible. `aria-label` is required. Give it `onPress` to ' +
          'use it as a choice in a row of swatches.',
      },
    },
  },
  args: { color: '#3b82f6', 'aria-label': 'Blue' },
} satisfies Meta<typeof ColorSwatch>

export default meta
type Story = StoryObj<typeof meta>

export const Main: Story = { name: 'ColorSwatch' }

/** Test for ColorSwatch: hidden from the sidebar and docs. */
export const MainTest: Story = {
  ...Main,
  name: 'ColorSwatch (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas }) => {
    const swatch = canvas.getByRole('img', { name: 'Blue' })
    await expect(swatch).toBeVisible()
    await expect(swatch.firstElementChild).toHaveStyle({ backgroundColor: 'rgb(59, 130, 246)' })
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <ColorSwatch size="sm" color="#3b82f6" aria-label="Small" />
      <ColorSwatch size="md" color="#3b82f6" aria-label="Medium" />
      <ColorSwatch size="lg" color="#3b82f6" aria-label="Large" />
    </div>
  ),
}

/** 8-digit hex keeps its alpha: the checkerboard shows through. */
export const Translucent: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <ColorSwatch size="lg" color="#ef4444ff" aria-label="Red, opaque" />
      <ColorSwatch size="lg" color="#ef4444aa" aria-label="Red, 67%" />
      <ColorSwatch size="lg" color="#ef444433" aria-label="Red, 20%" />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Red, 67%' }).firstElementChild).toHaveStyle({
      backgroundColor: 'rgba(239, 68, 68, 0.667)',
    })
  },
}

export const Empty: Story = {
  args: { empty: true, 'aria-label': 'No colour', size: 'lg' },
}

const colors = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Amber', value: '#f59e0b80' },
  { name: 'None', value: undefined },
]

function PickerRow() {
  const [picked, setPicked] = useState('Green')
  return (
    <div role="group" aria-label="Label colour" className="flex items-center gap-3 p-2">
      {colors.map((c) => (
        <ColorSwatch key={c.name} size="lg" aria-label={c.name} color={c.value} selected={picked === c.name} onPress={() => setPicked(c.name)} />
      ))}
    </div>
  )
}

/** A choice row: `onPress` makes each swatch a toggle button and `selected` rings it. */
export const Picker: Story = {
  render: () => <PickerRow />,
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('button', { name: 'Green' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(canvas.getByRole('button', { name: 'None' }))
    await expect(canvas.getByRole('button', { name: 'None' })).toHaveAttribute('aria-pressed', 'true')
    await expect(canvas.getByRole('button', { name: 'Green' })).toHaveAttribute('aria-pressed', 'false')
  },
}
