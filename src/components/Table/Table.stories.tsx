import type { Meta, StoryObj } from '@storybook/react-vite'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { SortDescriptor } from 'react-aria-components'
import { expect, fn, screen, within } from 'storybook/test'
import { IconButton } from '../Button/Button'
import { Menu, MenuItem, MenuSeparator, MenuTrigger } from '../Menu/Menu'
import { Cell, Column, Row, Table, TableBody, TableHeader } from './Table'

interface Volume {
  id: string
  name: string
  region: string
  sizeGb: number
  requests: number
}

const volumes: Volume[] = [
  { id: 'vol_01JC8Q4M2T', name: 'postgres-data', region: 'fra', sizeGb: 80, requests: 1_204_331 },
  { id: 'vol_01JC8Q9XKD', name: 'redis-cache', region: 'fra', sizeGb: 4, requests: 88_412_907 },
  { id: 'vol_01JC8R0A7F', name: 'uploads', region: 'ams', sizeGb: 1_024, requests: 31_877 },
  { id: 'vol_01JC8R3ZPW', name: 'backups-nightly', region: 'iad', sizeGb: 2_560, requests: 30 },
  {
    id: 'vol_01JC8R7MMB',
    name: 'grafana-loki-chunks-retention-90d-do-not-delete-ask-rob-first',
    region: 'ams',
    sizeGb: 312,
    requests: 9_871_002,
  },
]

const number = new Intl.NumberFormat('en')

interface VolumeTableProps {
  rows: Volume[]
  onAction?: (action: string, id: string) => void
}

function VolumeTable({ rows, onAction }: VolumeTableProps) {
  const [sort, setSort] = useState<SortDescriptor>({ column: 'name', direction: 'ascending' })
  const sorted = useMemo(() => {
    const key = sort.column as keyof Volume
    const out = [...rows].sort((a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0))
    return sort.direction === 'descending' ? out.reverse() : out
  }, [rows, sort])

  return (
    <Table aria-label="Volumes" sortDescriptor={sort} onSortChange={setSort}>
      <TableHeader>
        <Column id="name" isRowHeader allowsSorting>Name</Column>
        <Column id="id" className="hidden w-36 sm:table-cell">ID</Column>
        <Column id="region" allowsSorting className="w-20">Region</Column>
        <Column id="sizeGb" allowsSorting align="end" className="w-24">Size</Column>
        <Column id="requests" allowsSorting align="end" className="w-32">Requests</Column>
        <Column className="w-12"><span className="sr-only">Actions</span></Column>
      </TableHeader>
      <TableBody items={sorted} emptyState="No volumes yet. Create one to attach it to a server.">
        {(v) => (
          <Row id={v.id}>
            <Cell>{v.name}</Cell>
            <Cell mono className="hidden sm:table-cell">{v.id}</Cell>
            <Cell className="uppercase text-muted">{v.region}</Cell>
            <Cell numeric>{number.format(v.sizeGb)} GB</Cell>
            <Cell numeric>{number.format(v.requests)}</Cell>
            <Cell align="end">
              <MenuTrigger>
                <IconButton aria-label={`Actions for ${v.name}`} size="sm"><MoreHorizontal /></IconButton>
                <Menu placement="bottom end" onAction={(key) => onAction?.(String(key), v.id)}>
                  <MenuItem id="rename" icon={<Pencil />}>Rename</MenuItem>
                  <MenuSeparator />
                  <MenuItem id="delete" icon={<Trash2 />} tone="danger">Delete</MenuItem>
                </Menu>
              </MenuTrigger>
            </Cell>
          </Row>
        )}
      </TableBody>
    </Table>
  )
}

/** Story args: the row-action callback, so the Actions panel logs it. */
type Args = Pick<VolumeTableProps, 'onAction'>

const meta: Meta<Args> = {
  title: 'Components/Data display/Table',
  component: Table as React.ComponentType<Args>,
  subcomponents: { Column, Row, Cell } as Record<string, React.ComponentType<unknown>>,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Dense table on react-aria Table: arrow-key grid navigation, sortable columns, optional selection. ' +
          'Use `numeric` cells for numbers (right-aligned, tabular) and `mono` cells for IDs.',
      },
    },
  },
  args: { onAction: fn() },
  render: (args) => <VolumeTable rows={volumes} onAction={args.onAction} />,
}

export default meta
type Story = StoryObj<Args>

/** Sorting by a numeric column, then acting on a row. */
export const SortBySizeThenDelete: Story = {
  name: 'Find the biggest volume and delete it',
}

/** Test for Find the biggest volume and delete it: runs in Vitest and Run tests, hidden from the sidebar and docs so the story loads still. */
export const SortBySizeThenDeleteTest: Story = {
  ...SortBySizeThenDelete,
  name: 'Find the biggest volume and delete it (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ args, canvas, userEvent, step }) => {
    const firstRowName = () => within(canvas.getAllByRole('row')[1]).getAllByRole('rowheader')[0]
    await step('Sort by size, largest first', async () => {
      await userEvent.click(canvas.getByRole('columnheader', { name: 'Size' }))
      await userEvent.click(canvas.getByRole('columnheader', { name: 'Size' }))
      await expect(canvas.getByRole('columnheader', { name: 'Size' })).toHaveAttribute('aria-sort', 'descending')
      await expect(firstRowName()).toHaveTextContent('backups-nightly')
    })
    await step('Delete it from the row menu', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Actions for backups-nightly' }))
      await userEvent.click(await screen.findByRole('menuitem', { name: 'Delete' }))
      await expect(args.onAction).toHaveBeenCalledWith('delete', 'vol_01JC8R3ZPW')
    })
  },
}

export const NoRowsYet: Story = {
  name: 'No volumes yet',
  render: () => <VolumeTable rows={[]} />,
}
