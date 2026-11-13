import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Button } from '../Button/Button'
import { Alert, type AlertTone } from './Alert'

const meta = {
  title: 'Components/Feedback/Alert',
  component: Alert,
  args: { tone: 'info', title: 'Heads up', children: 'Projects share their files with every chat inside them.', onDismiss: fn() },
  argTypes: {
    tone: { control: 'inline-radio', options: ['info', 'success', 'warning', 'danger', 'neutral'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Inline banner with a soft tinted fill. Body text stays in the normal text color; only the icon carries the tone. ' +
          'Danger and warning use `role="alert"`, the rest `role="status"`.',
      },
    },
  },
  decorators: [(Story) => <div className="w-[34rem] max-w-full"><Story /></div>],
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const tones: AlertTone[] = ['info', 'success', 'warning', 'danger', 'neutral']

/** Every tone, with a title, an action and a dismiss button. Switch the theme in the toolbar for dark. */
export const Gallery: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {tones.map((tone) => (
        <Alert key={tone} tone={tone} title={`${tone[0].toUpperCase()}${tone.slice(1)}`} onDismiss={() => {}}
          action={<Button size="sm">Details</Button>}>
          Your usage resets on the first of the month.
        </Alert>
      ))}
      <Alert tone="danger">Body only, no title.</Alert>
      <Alert tone="success" icon={false}>Without an icon.</Alert>
    </div>
  ),
}

export const DismissTest: Story = {
  name: 'Alert (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.getByRole('status')).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss' }))
    await expect(args.onDismiss).toHaveBeenCalled()
  },
}
