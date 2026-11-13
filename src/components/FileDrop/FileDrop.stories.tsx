import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn } from 'storybook/test'
import { FileButton, FileDropZone, FileList, type FileDropZoneProps, type FileListItem } from './FileDrop'

let nextId = 0

/** Zone and list wired together, as an upload form would be. */
function Uploader(props: FileDropZoneProps) {
  const [files, setFiles] = useState<FileListItem[]>([])
  return (
    <div className="flex w-[28rem] max-w-full flex-col gap-3">
      <FileDropZone
        {...props}
        onFiles={(added) => {
          props.onFiles(added)
          setFiles((cur) => [...cur, ...added.map((file) => ({ id: `f${nextId++}`, file }))])
        }}
      />
      <FileList files={files} onRemove={(id) => setFiles((cur) => cur.filter((f) => f.id !== id))} />
    </div>
  )
}

const meta = {
  title: 'Components/Inputs/File drop',
  component: FileDropZone,
  args: {
    onFiles: fn(),
    accept: ['application/pdf', 'image/png'],
    maxSize: 10 * 1024 * 1024,
    description: 'PDF, PNG up to 10 MB',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Drop target for files, with a "browse" button for keyboard and click. `accept` and `maxSize` are checked ' +
          'for both drops and picks; rejected files show a message in the zone and go to `onReject` instead of `onFiles`. ' +
          'Pair with `FileList` to show what was added. `FileButton` is the compact version for toolbars.',
      },
    },
  },
  render: (args) => <Uploader {...args} />,
} satisfies Meta<typeof FileDropZone>

export default meta
type Story = StoryObj<typeof meta>

export const Main: Story = {}

export const Disabled: Story = { args: { isDisabled: true } }

/** A file of the given reported size, without allocating it. */
const item = (name: string, size: number, type = 'application/pdf'): FileListItem => {
  const file = new File([], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return { id: name, file }
}

/** Rows with and without upload progress, including a name long enough to truncate. */
export const List: StoryObj<typeof FileList> = {
  render: () => (
    <FileList
      className="w-[28rem] max-w-full"
      onRemove={fn()}
      files={[
        { ...item('quarterly-report.pdf', 2_400_000), progress: 100 },
        { ...item('architecture-diagram-final-v7-really-final-this-time-for-real.png', 845_000, 'image/png'), progress: 45 },
        item('notes.pdf', 12_300),
      ]}
    />
  ),
}

/** Compact picker for places without room for a drop zone. */
export const Button: StoryObj<typeof FileButton> = {
  render: () => <FileButton onFiles={fn()} size="sm" />,
}

export const FileDrop_test: Story = {
  name: 'File drop (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement, canvas, userEvent, args }) => {
    const input = canvasElement.querySelector('input[type="file"]') as HTMLInputElement
    const pdf = new File(['hello'], 'brief.pdf', { type: 'application/pdf' })
    await userEvent.upload(input, pdf)
    await expect(args.onFiles).toHaveBeenCalledWith([pdf])
    await expect(canvas.getByText('brief.pdf')).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Remove brief.pdf' }))
    await expect(canvas.queryByText('brief.pdf')).not.toBeInTheDocument()

    const big = new File(['x'], 'huge.pdf', { type: 'application/pdf' })
    Object.defineProperty(big, 'size', { value: 20 * 1024 * 1024 })
    await userEvent.upload(input, big)
    await expect(canvas.getByRole('alert')).toHaveTextContent('huge.pdf is larger than 10 MB.')
    await expect(canvas.queryByText('huge.pdf', { selector: 'span' })).not.toBeInTheDocument()

    // Every rejected file is named, whatever the reason
    const text = new File(['x'], 'notes.txt', { type: 'text/plain' })
    await userEvent.setup({ applyAccept: false }).upload(input, [big, text])
    await expect(canvas.getByRole('alert')).toHaveTextContent('huge.pdf is larger than 10 MB. notes.txt is not a supported file type.')
  },
}
