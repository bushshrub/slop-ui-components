import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, within } from 'storybook/test'
import { Badge } from '../Badge/Badge'
import { DataTable, type DataTableColumn } from './Table'

interface Server {
  id: string
  name: string
  region: string
  status: 'running' | 'stopped'
  memory: number
}

const servers: Server[] = [
  { id: 'srv-01', name: 'Lorem', region: 'eu-west', status: 'running', memory: 4096 },
  { id: 'srv-02', name: 'Ipsum', region: 'us-east', status: 'stopped', memory: 2048 },
  { id: 'srv-03', name: 'Dolor', region: 'eu-west', status: 'running', memory: 8192 },
]

const columns: DataTableColumn<Server>[] = [
  { id: 'name', header: 'Name', cell: (s) => s.name },
  { id: 'id', header: 'ID', cell: (s) => s.id, mono: true, className: 'w-28' },
  { id: 'region', header: 'Region', cell: (s) => s.region },
  {
    id: 'status',
    header: 'Status',
    cell: (s) => <Badge tone={s.status === 'running' ? 'success' : 'neutral'}>{s.status}</Badge>,
    className: 'w-28',
  },
  { id: 'memory', header: 'Memory (MB)', cell: (s) => s.memory.toLocaleString('en-US'), numeric: true, className: 'w-32' },
]

const meta = {
  title: 'Components/Data display/DataTable',
  parameters: {
    docs: {
      description: {
        component:
          'A `Table` from a `columns` array and a `rows` array, for plain data lists. The first column names the row ' +
          'unless another sets `isRowHeader`. Compose `Table` by hand when rows or cells need more control.',
      },
    },
  },
  component: DataTable<Server>,
  args: { 'aria-label': 'Servers', columns, rows: servers, rowKey: (s) => s.id, onRowPress: fn() },
  argTypes: { columns: { control: false }, rowKey: { control: false } },
} satisfies Meta<typeof DataTable<Server>>

export default meta
type Story = StoryObj<typeof meta>

export const Main: Story = { name: 'DataTable' }

/** Test for DataTable: hidden from the sidebar and docs. */
export const MainTest: Story = {
  ...Main,
  name: 'DataTable (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ args, canvas, userEvent }) => {
    const row = canvas.getByRole('row', { name: 'Ipsum' })
    await expect(within(row).getByRole('rowheader')).toHaveTextContent('Ipsum')
    await expect(within(row).getByText('2,048')).toBeVisible()
    await userEvent.click(row)
    await expect(args.onRowPress).toHaveBeenCalledWith(servers[1])
  },
}

export const Empty: Story = {
  args: { rows: [], emptyState: 'No servers yet' },
}

/**
 * `resizableColumns`: drag a heading's right edge, or focus it and use the arrow keys. Size columns with
 * `defaultWidth` / `minWidth`; `onColumnResizeEnd` gets every width, e.g. to save them.
 */
export const ResizableColumns: Story = {
  args: {
    resizableColumns: true,
    onColumnResizeEnd: fn(),
    columns: columns.map((c) => ({ ...c, defaultWidth: c.id === 'name' ? '1fr' : 140, minWidth: 80 })),
  },
}

/** Test for resizable columns: hidden from the sidebar and docs. */
export const ResizableColumnsTest: Story = {
  ...ResizableColumns,
  name: 'Resizable columns (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ args, canvas, userEvent }) => {
    const region = canvas.getByRole('columnheader', { name: /Region/ })
    const before = region.getBoundingClientRect().width
    // Enter on a heading starts a keyboard resize, arrows change the width, Enter ends it
    await userEvent.click(region)
    await userEvent.keyboard('{Enter}{ArrowRight}{ArrowRight}{Enter}')
    await expect(region.getBoundingClientRect().width).toBeGreaterThan(before)
    await expect(args.onColumnResizeEnd).toHaveBeenCalled()
  },
}

interface Request {
  id: string
  time: string
  method: string
  path: string
  status: number
  duration: number
  bytes: number
  agent: string
}

const requests: Request[] = Array.from({ length: 6 }, (_, i) => ({
  id: `req-${1040 + i}`,
  time: `12:0${i}:1${i}.204`,
  method: i % 3 ? 'GET' : 'POST',
  path: ['/api/items', '/api/items/42/comments', '/login', '/api/search?q=lorem+ipsum', '/static/app.js', '/health'][i],
  status: [200, 201, 302, 200, 304, 503][i],
  duration: [12, 148, 9, 412, 3, 2003][i],
  bytes: [1840, 92, 0, 18233, 0, 41][i],
  agent: 'Mozilla/5.0 (X11; Linux x86_64) Lorem/1.0',
}))

const requestColumns: DataTableColumn<Request>[] = [
  { id: 'time', header: 'Time', cell: (r) => r.time, mono: true },
  { id: 'method', header: 'Method', cell: (r) => r.method, mono: true },
  { id: 'path', header: 'Path', cell: (r) => r.path, mono: true },
  { id: 'status', header: 'Status', cell: (r) => r.status, numeric: true },
  { id: 'duration', header: 'Duration (ms)', cell: (r) => r.duration.toLocaleString('en-US'), numeric: true },
  { id: 'bytes', header: 'Bytes', cell: (r) => r.bytes.toLocaleString('en-US'), numeric: true },
  { id: 'agent', header: 'User agent', cell: (r) => r.agent },
]

/**
 * `overflow="scroll"`, for wide data read across the columns: every column is as wide as its content and the table
 * scrolls sideways instead of truncating. Narrow the viewport, or open it on a phone.
 */
export const ScrollWideData: Story = {
  render: () => (
    <div className="w-80 max-w-full border border-dashed border-border">
      <DataTable aria-label="Requests" overflow="scroll" columns={requestColumns} rows={requests} rowKey={(r) => r.id} />
    </div>
  ),
}

/** Test for overflow="scroll": hidden from the sidebar and docs. */
export const ScrollWideDataTest: Story = {
  ...ScrollWideData,
  name: 'Scroll wide data (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas }) => {
    const box = canvas.getByRole('grid').parentElement!
    await expect(box.scrollWidth).toBeGreaterThan(box.clientWidth)
    // Nothing truncated: the longest path is shown in full
    const cell = canvas.getByText('/api/search?q=lorem+ipsum')
    await expect(cell.scrollWidth).toBeLessThanOrEqual(cell.clientWidth)
  },
}

/**
 * The default, `overflow="fit"`: the table is as wide as its box and never scrolls sideways. Columns marked
 * `hideOnPhone` drop out below 768px, so a phone shows name and status instead of five squeezed columns.
 */
export const FitOnPhone: Story = {
  args: {
    columns: columns.map((c) => (['id', 'region', 'memory'].includes(c.id) ? { ...c, hideOnPhone: true } : c)),
  },
  globals: { viewport: { value: 'mobile1' } },
}

/** Test for overflow="fit": hidden from the sidebar and docs. */
export const FitTest: Story = {
  ...FitOnPhone,
  name: 'Fit (test)',
  tags: ['!dev', '!autodocs'],
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
  play: async ({ canvas }) => {
    const table = canvas.getByRole('grid')
    await expect(table.getBoundingClientRect().width).toBeLessThanOrEqual(table.parentElement!.getBoundingClientRect().width)
  },
}
