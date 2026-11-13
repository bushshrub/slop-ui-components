import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, waitFor } from 'storybook/test'
import { Card } from '../Card/Card'
import { Carousel, CarouselSlide } from './Carousel'

/** Token-colored placeholder panel with lorem ipsum, in place of images. */
function SlideContent({ n }: { n: number }) {
  return (
    <div className="flex h-40 flex-col justify-end rounded-lg bg-track p-4">
      <span className="text-ui-sm text-muted">Slide {n}</span>
      <p className="text-ui text-fg">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
  )
}

const slides = [1, 2, 3, 4, 5].map((n) => (
  <CarouselSlide key={n}>
    <SlideContent n={n} />
  </CarouselSlide>
))

const meta = {
  title: 'Components/Layout/Carousel',
  component: Carousel,
  args: { 'aria-label': 'Onboarding tips' },
  argTypes: {
    gap: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    slidesPerView: { control: { type: 'number', min: 1, max: 4, step: 0.1 } },
  },
  render: (args) => <Carousel {...args}>{slides}</Carousel>,
  decorators: [(Story) => <div className="w-full max-w-xl"><Story /></div>],
  parameters: {
    docs: {
      description: {
        component:
          'Horizontal slides with CSS scroll-snap, so swiping and trackpad scrolling work natively. Arrows and dots appear on desktop; ' +
          'on touch screens the arrows hide and swipe plus dots remain. Use `slidesPerView` for several slides at once, and a fraction such as 1.2 to peek the next one.',
      },
    },
  },
} satisfies Meta<typeof Carousel>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const MultipleSlidesPerView: Story = {
  args: { slidesPerView: 3, gap: 'lg' },
}

export const Loop: Story = {
  args: { loop: true },
}

export const InsideCard: Story = {
  render: (args) => (
    <Card>
      <Carousel {...args}>{slides}</Carousel>
    </Card>
  ),
  args: { 'aria-label': 'Tips in a card' },
}

export const Carousel_test: Story = {
  name: 'Carousel (test)',
  tags: ['!dev', '!autodocs'],
  args: { onIndexChange: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole('button', { name: 'Previous slide' })).toBeDisabled()
    await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }))
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Go to slide 2' })).toHaveAttribute('aria-current', 'true'))
    await expect(args.onIndexChange).toHaveBeenCalledWith(1)
  },
}
