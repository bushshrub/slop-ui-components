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
