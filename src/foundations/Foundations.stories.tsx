import type { Meta, StoryObj } from '@storybook/react-vite'
import { Plus, Settings } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Button, IconButton } from '../components/Button/Button'
import { Heading } from '../components/Heading/Heading'
import { Checkbox } from '../components/Inputs/Checkbox'
import { TextField } from '../components/Inputs/TextField'

const groups: Record<string, [token: string, use: string, fallback?: string][]> = {
  Surfaces: [
    ['bg', 'Page background'],
    ['sidebar', 'Sidebar column'],
    ['surface', 'Cards'],
    ['popover', 'Menus, modals'],
  ],
  Interaction: [
    ['hover', 'Row and button hover'],
    ['selected', 'Pressed, current item'],
    ['track', 'Segmented control track'],
    ['button', 'Secondary button fill'],
    ['button-hover', 'Secondary button fill on hover'],
    ['field', 'Text field fill'],
    ['field-hover', 'Text field fill on hover'],
  ],
  Lines: [
    ['border', 'Card and popover edges'],
    ['border-strong', 'Checkbox, switch and outline button edges'],
    ['field-border', 'Text field edge at rest (transparent by default)'],
    ['divider', 'Row separators'],
  ],
  Text: [
    ['fg', 'Body text'],
    ['button-fg', 'Secondary button text'],
    ['muted', 'Secondary text'],
    ['subtle', 'Placeholders, labels'],
  ],
  'Actions and status': [
    ['primary', 'Primary button (ink)'],
    ['accent', 'Brand accent (orange)'],
    ['interactive', 'The blue: switches, checks, radios, progress'],
    ['interactive-fg', 'Check marks on the blue'],
    ['knob', 'Switch knob'],
    ['focus', 'Focus ring and field border (defaults to interactive)'],
    ['danger', 'Destructive, errors'],
    ['danger-fg', 'Text on danger fill'],
    ['success', 'Saved, healthy'],
    ['warning', 'Needs attention'],
    ['info', 'Neutral notices (defaults to interactive)'],
  ],
  // Unset by default: these derive from the colors above, so overriding those is usually enough
  'Derived (optional overrides)': [
    ['info-soft', 'Alert and badge tint; also success-, warning-, danger-, accent-soft', 'color-mix(in srgb, var(--ui-info) 14%, transparent)'],
    ['tooltip', 'Tooltip fill (defaults to primary)', 'var(--ui-primary)'],
    ['tooltip-fg', 'Tooltip text (defaults to primary-fg)', 'var(--ui-primary-fg)'],
    ['progress-fill', 'Progress bar fill (defaults to interactive)', 'var(--ui-interactive)'],
  ],
}

function Swatch({ token, use, fallback }: { token: string; use: string; fallback?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState('')
  useEffect(() => {
    if (ref.current) setValue(getComputedStyle(ref.current).getPropertyValue(`--ui-${token}`).trim() || `= ${fallback}`)
  })
  return (
    <tr className="border-b border-divider">
      <td className="w-12 py-1.5">
        <span ref={ref} className="block size-7 rounded-sm border border-border" style={{ background: `var(--ui-${token}${fallback ? `, ${fallback}` : ''})` }} />
      </td>
      <td className="py-1.5 font-mono text-ui-sm">--ui-{token}</td>
      <td className="py-1.5 font-mono text-ui-sm text-muted">{value}</td>
      <td className="py-1.5 text-muted">{use}</td>
    </tr>
  )
}

function ColorTable() {
  return (
    <div className="flex w-[44rem] flex-col gap-6 p-6">
      {Object.entries(groups).map(([group, tokens]) => (
        <section key={group} className="flex flex-col gap-2">
          <Heading variant="label">{group}</Heading>
          <table className="w-full border-collapse text-ui">
            <tbody>
              {tokens.map(([t, use, fallback]) => (
                <Swatch key={t} token={t} use={use} fallback={fallback} />
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  )
}

const meta = {
  title: 'Foundations',
  parameters: { layout: 'fullscreen' },
  tags: ['!autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Every color token, its current value in the active theme, and what it is for. */
export const Colors: Story = {
  render: () => <ColorTable />,
}

const typeRows: [string, string, ReactNode][] = [
  ['Page title', 'Source Serif 4 · 28px', <Heading variant="page">Conversations</Heading>],
  ['Dialog title', 'Source Serif 4 · 18px', <Heading variant="dialog">Rename chat</Heading>],
  ['Section', 'Inter 600 · 15px', <Heading variant="section">Members</Heading>],
  ['Body', 'Inter 400 · 14px', <p className="m-0">The quick brown fox jumps over the lazy dog.</p>],
  ['Secondary', 'Inter 400 · 12px', <p className="m-0 text-ui-sm text-muted">Updated 4 minutes ago</p>],
  ['Label', 'Inter 500 · 12px caps', <Heading variant="label">Danger zone</Heading>],
  ['Mono', 'JetBrains Mono · 13px', <code className="font-mono text-[0.8125rem]">cnv_7f3a · sk-live-…3f9c</code>],
  ['Numbers', 'tabular-nums', <span className="tabular-nums">1,204 · 88 · 12,345,678 · 0.07</span>],
]

/** Type scale. Serif only for page and dialog titles. */
export const Typography: Story = {
  render: () => (
    <table className="m-6 w-[44rem] border-collapse text-ui">
      <tbody>
        {typeRows.map(([name, spec, sample]) => (
          <tr key={name} className="border-b border-divider align-middle">
            <td className="w-32 py-3 text-muted">{name}</td>
            <td className="w-48 py-3 font-mono text-ui-sm text-muted">{spec}</td>
            <td className="py-3">{sample}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
}

function Sample({ label, theme, style }: { label: string; theme: 'light' | 'dark'; style?: CSSProperties }) {
  return (
    <div data-theme={theme} style={style} className="flex flex-col gap-4 bg-bg p-6 font-sans text-fg">
      <Heading variant="label" as="h2">{label}</Heading>
      <Heading variant="page" as="h3" count={12}>Projects</Heading>
      <div className="flex flex-col gap-4 rounded-md border border-border bg-surface p-4">
        <TextField label="Name" defaultValue="Lorem ipsum" />
        <Checkbox defaultSelected>Pin to sidebar</Checkbox>
      </div>
      <div className="flex gap-2">
        <Button variant="primary" icon={<Plus />}>Create</Button>
        <Button>Cancel</Button>
        <Button variant="danger">Delete</Button>
        <IconButton aria-label="Settings"><Settings /></IconButton>
      </div>
      <p className="m-0 flex items-center gap-2 text-ui-sm text-muted">
        <span className="size-3 rounded-full bg-accent" /> accent
        <span className="ml-2 size-3 rounded-full bg-focus" /> focus
      </p>
    </div>
  )
}

/** Overriding a handful of --ui-* variables, like pmservers' blue accent. */
const bluePreset = {
  '--ui-accent': '#2f5fd0',
  '--ui-focus': '#2f5fd0',
  '--ui-bg': '#f6f7f9',
  '--ui-surface': '#ffffff',
  '--ui-border': '#e1e4e9',
  '--ui-border-strong': '#cdd2da',
  '--ui-fg': '#17191d',
  '--ui-primary': '#17191d',
  '--ui-muted': '#5d636d',
  '--ui-font-serif': 'var(--ui-font-sans)',
} as CSSProperties

/** The burger "terminal" preset: grayscale, square, monospace. */
const monoPreset = {
  '--ui-bg': '#111111',
  '--ui-surface': '#1c1c1c',
  '--ui-border': '#eeeeee',
  '--ui-border-strong': '#eeeeee',
  '--ui-fg': '#eeeeee',
  '--ui-primary': '#eeeeee',
  '--ui-primary-fg': '#111111',
  '--ui-muted': '#b0b0b0',
  '--ui-subtle': '#a0a0a0',
  '--ui-accent': '#eeeeee',
  '--ui-radius-sm': '0px',
  '--ui-radius-md': '0px',
  '--ui-radius-popover': '0px',
  '--ui-radius-lg': '0px',
  '--ui-font-sans': 'var(--ui-font-mono)',
  '--ui-font-serif': 'var(--ui-font-mono)',
} as CSSProperties

/** Light and dark side by side, plus two presets made only by overriding tokens. */
export const Theme: Story = {
  parameters: { theme: 'side-by-side' },
  render: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <Sample label="Light" theme="light" />
      <Sample label="Dark" theme="dark" />
      <Sample label="Override: blue accent, sans titles" theme="light" style={bluePreset} />
      <Sample label="Override: square mono" theme="dark" style={monoPreset} />
    </div>
  ),
}
