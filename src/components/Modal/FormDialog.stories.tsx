import type { Meta, StoryObj } from '@storybook/react-vite'
import { Plus } from 'lucide-react'
import { expect, fn, screen, waitFor, within } from 'storybook/test'
import { UIStringsProvider } from '../../lib/strings'
import { Button } from '../Button/Button'
import { TextField } from '../Inputs/TextField'
import { DialogTrigger } from './Modal'
import { FormDialog } from './FormDialog'

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

const fields = (
  <>
    <TextField name="name" label="Name" isRequired autoFocus placeholder="Lorem ipsum" />
    <TextField name="description" label="Description" multiline rows={3} description="Optional. Shown to everyone on the team." />
  </>
)

const meta = {
  title: 'Components/Overlays/FormDialog',
  component: FormDialog,
  parameters: {
    docs: {
      description: {
        component:
          'A dialog holding a form, for "create" and "edit" popups. The submit button spins while `onSubmit` runs and ' +
          'the dialog closes when it finishes. If `onSubmit` throws, its message shows above the fields and the ' +
          'dialog stays open. Required fields are checked first.',
      },
    },
  },
  args: {
    title: 'New project',
    submitLabel: 'Create project',
    children: fields,
    onSubmit: fn(async () => wait(900)),
  },
  render: (args) => (
    <DialogTrigger>
      <Button variant="primary" icon={<Plus />}>New project</Button>
      <FormDialog {...args} />
    </DialogTrigger>
  ),
} satisfies Meta<typeof FormDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Main: Story = { name: 'FormDialog' }

/** The save fails: the message shows in the dialog, which stays open. Try submitting it. */
export const SaveFails: Story = {
  args: {
    onSubmit: fn(async () => {
      await wait(700)
      throw new Error('A project with that name already exists. Pick another name.')
    }),
  },
}

/**
 * The text the kit writes itself (Cancel here, Close on the X) comes from `UIStringsProvider`, so a whole app can
 * switch language. Text you pass in, like the title and the submit label, you translate yourself.
 */
export const InAnotherLanguage: Story = {
  args: {
    title: 'Nouveau projet',
    submitLabel: 'Créer le projet',
    children: <TextField name="name" label="Nom" isRequired autoFocus />,
  },
  render: (args) => (
    <UIStringsProvider strings={{ cancel: 'Annuler', close: 'Fermer' }}>
      <DialogTrigger>
        <Button variant="primary" icon={<Plus />}>Nouveau projet</Button>
        <FormDialog {...args} />
      </DialogTrigger>
    </UIStringsProvider>
  ),
}

/** Test for FormDialog: hidden from the sidebar and docs. */
export const MainTest: Story = {
  ...Main,
  name: 'FormDialog (test)',
  tags: ['!dev', '!autodocs'],
  args: { onSubmit: fn(async () => wait(50)) },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'New project' }))
    const dialog = await screen.findByRole('dialog')
    // Empty required field: nothing is submitted
    await userEvent.click(within(dialog).getByRole('button', { name: 'Create project' }))
    await expect(args.onSubmit).not.toHaveBeenCalled()
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'Name' }), 'Lorem{Enter}')
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalledOnce())
    const data = (args.onSubmit as ReturnType<typeof fn>).mock.calls[0][0] as FormData
    await expect(data.get('name')).toBe('Lorem')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  },
}

/** Test for the failing save: hidden from the sidebar and docs. */
export const SaveFailsTest: Story = {
  ...SaveFails,
  name: 'Save fails (test)',
  tags: ['!dev', '!autodocs'],
  args: { onSubmit: fn(async (): Promise<void> => { throw new Error('That name is taken') }) },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'New project' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'Name' }), 'Lorem{Enter}')
    await expect(await within(dialog).findByText('That name is taken')).toBeVisible()
    await expect(screen.getByRole('dialog')).toBeVisible()
    // Closing and reopening starts clean
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await userEvent.click(canvas.getByRole('button', { name: 'New project' }))
    const again = await screen.findByRole('dialog')
    await expect(within(again).queryByText('That name is taken')).toBeNull()
  },
}
