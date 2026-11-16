import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'
import { Button } from '../components/Button/Button'
import { Checkbox } from '../components/Inputs/Checkbox'
import { Switch } from '../components/Inputs/Switch'
import { TextField } from '../components/Inputs/TextField'
import { Spinner } from '../components/Loading/Loading'
import { ProgressBar } from '../components/Progress/Progress'
import { Tab, TabList, TabPanel, Tabs } from '../components/Tabs/Tabs'

function Sample() {
  return (
    <div className="flex max-w-md flex-col gap-4">
      <Tabs>
        <TabList aria-label="Sections">
          <Tab id="one">One</Tab>
          <Tab id="two">Two</Tab>
        </TabList>
        <TabPanel id="one" className="pt-2 text-ui text-muted">First section.</TabPanel>
        <TabPanel id="two" className="pt-2 text-ui text-muted">Second section.</TabPanel>
      </Tabs>
      <TextField label="Name" />
      <div className="flex items-center gap-3">
        <Button>Save</Button>
        <Spinner />
      </div>
      <Switch>Notifications</Switch>
      <Checkbox>Remember me</Checkbox>
      <ProgressBar aria-label="Uploading" isIndeterminate />
    </div>
  )
}

const meta = {
  title: 'Foundations/System settings',
  component: Sample,
  parameters: {
    docs: {
      description: {
        component:
          'The components follow the accessibility settings of the system and browser, with nothing to set up.\n\n' +
          '- **Reduced motion** (`prefers-reduced-motion`): nothing slides, spins or animates its size. Overlays appear without an ' +
          'entrance, the tab indicator and the switch knob jump, and the spinner and the indeterminate progress bar pulse in place. ' +
          '`REDUCED_MOTION_QUERY` is exported for your own code.\n' +
          '- **Text size**: every font size, control height and spacing token is in rem, so raising the browser or system ' +
          'default text size scales text and controls together. `pnpm audit:text-size` checks every story at 200%.\n' +
          '- **Forced colours** (Windows High Contrast): focus rings and selection states use system colours. ' +
          '`pnpm audit:forced-colors` checks the focus indicators.',
      },
    },
  },
} satisfies Meta<typeof Sample>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** As with the browser's default text size raised to 200%: text and controls grow with it. */
export const TextSizeTest: Story = {
  name: 'Text size 200% (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas }) => {
    const parts = [
      canvas.getByRole('button', { name: 'Save' }),
      canvas.getByRole('textbox', { name: 'Name' }),
      canvas.getByRole('tab', { name: 'One' }),
      canvas.getByText('Remember me'),
    ]
    const measure = () => parts.map((el) => ({ height: el.getBoundingClientRect().height, font: parseFloat(getComputedStyle(el).fontSize) }))
    const before = measure()
    const root = document.documentElement
    root.style.fontSize = '200%'
    try {
      await waitFor(() => expect(parts[0].getBoundingClientRect().height).toBeGreaterThan(before[0].height * 1.9))
      measure().forEach((after, i) => {
        expect(after.font).toBeCloseTo(before[i].font * 2, 0)
        expect(after.height).toBeGreaterThan(before[i].height * 1.9)
      })
    } finally {
      root.style.fontSize = ''
    }
  },
}

/** Tests run with reduced motion on: nothing moves, the loading indicators pulse in place. */
export const ReducedMotionTest: Story = {
  name: 'Reduced motion (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas }) => {
    await expect(matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true)
    const knob = canvas.getByRole('switch').closest('label')!.querySelector('span span')!
    await expect(getComputedStyle(knob).transitionDuration).toBe('0s')
    const spinner = canvas.getByRole('status', { name: 'Loading' })
    await expect(getComputedStyle(spinner).animationName).toBe('pulse')
    const bar = canvas.getByRole('progressbar').querySelector<HTMLElement>('[class*="animate-indeterminate"]')!
    await expect(getComputedStyle(bar).animationName).toBe('pulse')
    // Full width: a still partial bar would read as real progress
    await expect(bar.getBoundingClientRect().width).toBeCloseTo(bar.parentElement!.getBoundingClientRect().width, 0)
  },
}
