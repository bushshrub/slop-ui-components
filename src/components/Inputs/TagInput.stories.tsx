import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { TagGroup, TagInput } from './TagInput'

const meta = {
  title: 'Components/Inputs/TagInput',
  component: TagInput,
  args: { label: 'Topics', placeholder: 'Add a topic', defaultValue: ['design'], onChange: fn() },
  argTypes: {
    separators: { control: 'object' },
    maxTags: { control: 'number' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Tags typed into one box. Enter or a separator (comma by default) adds the text; pasted lists split into tags; ' +
          'Backspace on an empty input removes the last tag. Duplicates are rejected unless `allowDuplicates`. ' +
          '`TagGroup` is the read-only or removable list the input is built from.',
      },
    },
  },
} satisfies Meta<typeof TagInput>

export default meta
type Story = StoryObj<typeof meta>

const sampleTags = ['design', 'billing', 'onboarding', 'alex@example.com', 'q3-review', 'pricing', 'support', 'roadmap']

export const Playground: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole('textbox', { name: 'Topics' }), 'billing{Enter}')
    await expect(args.onChange).toHaveBeenLastCalledWith(['design', 'billing'])
  },
}

/** `validate` returns a message to reject a tag. The rejected text stays in the input so it can be fixed. */
export const WithValidation: Story = {
  args: {
    label: 'Recipients',
    placeholder: 'name@example.com',
    defaultValue: ['alex@example.com'],
    description: 'Separate addresses with commas or Enter.',
    validate: (tag) => /^\S+@\S+\.\S+$/.test(tag) || 'Enter an email address like name@example.com',
  },
  decorators: [(Story) => <div className="w-96 max-w-full"><Story /></div>],
}

export const MaxTags: Story = {
  args: { label: 'Labels', maxTags: 3, defaultValue: ['design', 'billing'], description: 'Up to 3 labels.' },
}

export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: ['design', 'billing'] },
}

export const Invalid: Story = {
  args: { isInvalid: true, defaultValue: [], errorMessage: 'Add at least one topic.' },
}

/** Tags shown without an input. Pass `onRemove` to add remove buttons. */
export const ReadOnlyTagGroup: Story = {
  render: () => (
    <TagGroup
      label="Filters"
      items={['design', 'billing', 'Q3'].map((textValue) => ({ id: textValue, textValue }))}
    />
  ),
}

/** Every state together, for visual review. */
export const Gallery: Story = {
  render: () => (
    <div className="flex w-96 max-w-full flex-col gap-5">
      <TagInput label="Empty" placeholder="Add a topic" />
      <TagInput label="Wrapping" defaultValue={sampleTags} />
      <TagInput label="Disabled" isDisabled defaultValue={['design', 'billing']} />
      <TagInput label="Invalid" isInvalid errorMessage="Add at least one topic." defaultValue={['design']} />
      <TagGroup
        label="Read-only"
        items={sampleTags.slice(0, 4).map((textValue) => ({ id: textValue, textValue }))}
      />
      <TagGroup
        label="Removable"
        items={sampleTags.slice(0, 4).map((textValue) => ({ id: textValue, textValue }))}
        onRemove={fn()}
      />
    </div>
  ),
}

export const Behaviour_test: Story = {
  name: 'Behaviour (test)',
  tags: ['!dev', '!autodocs'],
  args: { label: 'Keywords', placeholder: undefined, defaultValue: [] },
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Keywords' })

    await userEvent.type(input, 'alpha{Enter}')
    await expect(args.onChange).toHaveBeenLastCalledWith(['alpha'])

    await userEvent.type(input, 'beta,gamma{Enter}')
    await expect(args.onChange).toHaveBeenLastCalledWith(['alpha', 'beta', 'gamma'])

    await userEvent.keyboard('{Backspace}')
    await expect(args.onChange).toHaveBeenLastCalledWith(['alpha', 'beta'])

    await userEvent.type(input, 'BETA{Enter}')
    await expect(args.onChange).toHaveBeenLastCalledWith(['alpha', 'beta'])
    await expect(input).toHaveValue('BETA')
    await userEvent.clear(input)

    await userEvent.click(canvas.getByRole('button', { name: /^Remove alpha/ }))
    await expect(args.onChange).toHaveBeenLastCalledWith(['beta'])
  },
}
