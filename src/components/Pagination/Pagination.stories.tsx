import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { I18nProvider } from 'react-aria-components'
import { expect, fn } from 'storybook/test'
import { conversations } from '../../examples/sample-data'
import { UIStringsProvider } from '../../lib/strings'
import { Cell, Column, Row, Table, TableBody, TableHeader } from '../Table/Table'
import { Pagination, paginationRange, type PaginationProps } from './Pagination'

/** Holds the page in state so the story behaves like real usage, while still reporting changes to Actions. */
function Controlled({ page: initial, onPageChange, ...props }: PaginationProps) {
  const [page, setPage] = useState(initial)
  return (
    <Pagination
      {...props}
      page={page}
      onPageChange={(p) => {
        setPage(p)
        onPageChange(p)
      }}
    />
  )
}

const meta = {
  title: 'Components/Navigation/Pagination',
  component: Pagination,
  args: { page: 3, pageCount: 16, onPageChange: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'Page switcher for lists and tables. Shows the first and last page, the current one with its neighbors, and ' +
          '"…" for skipped runs. Under 768px it collapses to previous, "Page 3 of 16", next. ' +
          'Add `total` and `pageSize` for a "Showing 21–40 of 312" label.',
      },
    },
  },
  render: (args) => <Controlled {...args} />,
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const Main: Story = {}

export const WithRange: Story = {
  args: { page: 2, pageCount: 16, total: 312, pageSize: 20 },
}

/** Few pages show every number; the first and last page disable their arrow. */
export const FewPages: Story = {
  args: { page: 1, pageCount: 4 },
}

const rows = Array.from({ length: 312 }, (_, i) => ({
  id: i + 1,
  title: conversations[i % conversations.length].title,
  updatedAt: conversations[i % conversations.length].updatedAt,
}))

function TableDemo({ onPageChange }: Pick<PaginationProps, 'onPageChange'>) {
  const [page, setPage] = useState(3)
  const pageSize = 5
  const visible = rows.slice((page - 1) * pageSize, page * pageSize)
  return (
    <div className="flex w-[40rem] max-w-full flex-col gap-3">
      <Table aria-label="Conversations">
        <TableHeader>
          <Column id="id" className="w-16">#</Column>
          <Column id="title" isRowHeader>Title</Column>
          <Column id="updated" className="hidden w-32 sm:table-cell">Updated</Column>
        </TableHeader>
        <TableBody items={visible}>
          {(r) => (
            <Row id={r.id}>
              <Cell numeric>{r.id}</Cell>
              <Cell>{r.title}</Cell>
              <Cell className="hidden text-muted sm:table-cell">{r.updatedAt.slice(0, 10)}</Cell>
            </Row>
          )}
        </TableBody>
      </Table>
      <Pagination
        page={page}
        pageCount={Math.ceil(rows.length / pageSize)}
        total={rows.length}
        pageSize={pageSize}
        onPageChange={(p) => {
          setPage(p)
          onPageChange(p)
        }}
      />
    </div>
  )
}

/** Under a table, with the item range on the left. */
export const UnderTable: Story = {
  parameters: { layout: 'padded' },
  render: (args) => <TableDemo onPageChange={args.onPageChange} />,
}

export const Pagination_test: Story = {
  name: 'Pagination (test)',
  tags: ['!dev', '!autodocs'],
  args: { page: 1, pageCount: 16, total: 312, pageSize: 20 },
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    await expect(canvas.getByText('Showing 1–20 of 312')).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }))
    await expect(args.onPageChange).toHaveBeenLastCalledWith(2)
    await expect(canvas.getByText('Showing 21–40 of 312')).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Page 16' }))
    await expect(args.onPageChange).toHaveBeenLastCalledWith(16)
    await expect(canvas.getByRole('button', { name: 'Page 16' })).toHaveAttribute('aria-current', 'page')
    await expect(canvas.getByRole('button', { name: 'Next page' })).toBeDisabled()
  },
}

export const Translated_test: Story = {
  name: 'Translated (test)',
  tags: ['!dev', '!autodocs'],
  args: { page: 1, pageCount: 62, total: 1234, pageSize: 20, onPageChange: fn() },
  render: (args) => (
    <I18nProvider locale="de-DE">
      <UIStringsProvider strings={{ nextPage: 'Nächste Seite', showingRange: (from, to, total) => `${from}–${to} von ${total}` }}>
        <Pagination {...args} />
      </UIStringsProvider>
    </I18nProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Nächste Seite' })).toBeVisible()
    await expect(canvas.getByText('1–20 von 1.234')).toBeVisible()
  },
}

export const Range_test: Story = {
  name: 'Page range (test)',
  tags: ['!dev', '!autodocs'],
  render: () => <div />,
  play: async () => {
    await expect(paginationRange(1, 5)).toEqual([1, 2, 3, 4, 5])
    await expect(paginationRange(1, 16)).toEqual([1, 2, 3, 4, 5, 'gap', 16])
    await expect(paginationRange(8, 16)).toEqual([1, 'gap', 7, 8, 9, 'gap', 16])
    await expect(paginationRange(16, 16)).toEqual([1, 'gap', 12, 13, 14, 15, 16])
    await expect(paginationRange(4, 16, 0)).toEqual([1, 'gap', 4, 'gap', 16])
  },
}
