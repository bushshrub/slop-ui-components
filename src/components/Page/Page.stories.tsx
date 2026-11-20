import type { Meta, StoryObj } from '@storybook/react-vite'
import { Plus } from 'lucide-react'
import { expect, waitFor } from 'storybook/test'
import { Badge } from '../Badge/Badge'
import { Button } from '../Button/Button'
import { Card } from '../Card/Card'
import { DescriptionItem, DescriptionList } from '../DescriptionList/DescriptionList'
import { PageHeader } from '../Heading/Heading'
import { CopyField } from '../Inputs/CopyField'
import { SearchField } from '../Inputs/SearchField'
import { SegmentedControl } from '../Inputs/SegmentedControl'
import { Select } from '../Inputs/Select'
import { Switch } from '../Inputs/Switch'
import { TextField } from '../Inputs/TextField'
import { SectionRail } from '../SectionRail/SectionRail'
import { SettingsGroup, SettingsRow } from '../Settings/Settings'
import { Page } from './Page'

const meta = {
  title: 'Components/Layout/Page',
  component: Page,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The content area of a page, so every page has the same padding and width. `PageHeader` goes in `header`; ' +
          'its `filters` row holds search and filters. `aside` adds a side column, e.g. a `SectionRail` for a long page.',
      },
      story: { inline: false, height: '640px' },
    },
  },
} satisfies Meta<typeof Page>

export default meta
type Story = StoryObj<typeof meta>

const items = ['Lorem', 'Ipsum', 'Dolor', 'Sit amet', 'Consectetur', 'Adipiscing']

/** A list page: title, count and a create button, with search and filters on the row below. */
export const ListPage: Story = {
  render: () => (
    <Page
      width="wide"
      header={
        <PageHeader
          title="Projects"
          count={items.length}
          actions={<Button variant="primary" icon={<Plus />}>New project</Button>}
          filters={
            <>
              <SearchField aria-label="Search projects" className="w-full sm:w-64" />
              <Select aria-label="Owner" variant="quiet" options={[{ id: 'all', label: 'Any owner' }, { id: 'me', label: 'Mine' }]} defaultValue="all" />
              <SegmentedControl
                aria-label="Status"
                defaultValue="active"
                options={[
                  { id: 'active', label: 'Active' },
                  { id: 'archived', label: 'Archived' },
                ]}
              />
            </>
          }
        />
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((name, i) => (
          <Card key={name} className="flex flex-col gap-1 p-4">
            <span className="font-medium">{name}</span>
            <span className="text-ui-sm text-muted">Updated {i + 2} days ago</span>
          </Card>
        ))}
      </div>
    </Page>
  ),
}

const sections = [
  { id: 'general', label: 'General' },
  { id: 'access', label: 'Access keys' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'details', label: 'Details' },
  { id: 'danger', label: 'Danger zone' },
]

/** A long settings page: the rail on the left marks the section you are reading; on a phone it is a row of chips. */
export const WithSectionRail: Story = {
  name: 'With section rail',
  render: () => (
    <Page
      width="default"
      header={<PageHeader title="Lorem ipsum" description="Settings for this project." />}
      aside={<SectionRail aria-label="On this page" sections={sections} />}
    >
      <SettingsGroup id="general" className="scroll-mt-6" headingLevel={2} title="General">
        <SettingsRow label="Name">
          <TextField aria-label="Name" defaultValue="Lorem ipsum" className="w-full sm:w-56" />
        </SettingsRow>
        <SettingsRow label="Visibility" description="Who can find this project.">
          <Select aria-label="Visibility" variant="quiet" options={[{ id: 'team', label: 'Team' }, { id: 'private', label: 'Only me' }]} defaultValue="team" />
        </SettingsRow>
      </SettingsGroup>
      <SettingsGroup id="access" className="scroll-mt-6" headingLevel={2} title="Access keys">
        <div className="flex flex-col gap-4 py-2">
          <CopyField label="Project ID" value="prj_7f3a9c21e4b04d1f" />
          <CopyField label="Secret key" value="key_demo_9QeLoremIpsumDolor3f9c" secret />
        </div>
      </SettingsGroup>
      <SettingsGroup id="notifications" className="scroll-mt-6" headingLevel={2} title="Notifications">
        {['Weekly summary', 'When someone joins', 'When a run fails', 'Product updates'].map((label, i) => (
          <Switch key={label} toggleSide="end" defaultSelected={i < 2} description="Sent by email.">
            {label}
          </Switch>
        ))}
      </SettingsGroup>
      <SettingsGroup id="details" className="scroll-mt-6" headingLevel={2} title="Details">
        <DescriptionList divided>
          <DescriptionItem label="Status"><Badge tone="success" dot>Active</Badge></DescriptionItem>
          <DescriptionItem label="Created">12 March 2026</DescriptionItem>
          <DescriptionItem label="Owner">Alex Rivera</DescriptionItem>
          <DescriptionItem label="Members" numeric>14</DescriptionItem>
          <DescriptionItem label="Storage" numeric>2.4 GB of 10 GB</DescriptionItem>
        </DescriptionList>
      </SettingsGroup>
      <SettingsGroup id="danger" className="scroll-mt-6 pb-[40vh]" headingLevel={2} title="Danger zone">
        <SettingsRow label="Delete project" description="Removes the project and everything in it.">
          <Button variant="danger">Delete</Button>
        </SettingsRow>
      </SettingsGroup>
    </Page>
  ),
}

/** Test for the section rail: hidden from the sidebar and docs. */
export const WithSectionRailTest: Story = {
  ...WithSectionRail,
  name: 'With section rail (test)',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas }) => {
    const nav = canvas.getByRole('navigation', { name: 'On this page' })
    await expect(canvas.getByRole('link', { name: 'General' })).toHaveAttribute('aria-current', 'location')
    document.getElementById('access')!.scrollIntoView({ block: 'start' })
    await waitFor(() => expect(canvas.getByRole('link', { name: 'Access keys' })).toHaveAttribute('aria-current', 'location'))
    await expect(nav.querySelectorAll('[aria-current]')).toHaveLength(1)
    window.scrollTo(0, 0)
  },
}
