/** Made-up sample data for stories (lorem ipsum, example.com). Includes deliberate edge cases (very long titles, big numbers). */

export interface User {
  id: string
  name: string
  email: string
  plan: string
}

export interface Conversation {
  id: string
  title: string
  updatedAt: string
  pinned?: boolean
}

export const user: User = {
  id: 'usr_01JC8Q4M2T',
  name: 'Alex Rivera',
  email: 'alex@example.com',
  plan: 'Pro',
}

export const conversations: Conversation[] = [
  { id: 'cnv_7f3a', title: 'Lorem ipsum dolor sit amet', updatedAt: '2026-11-08T21:40:00Z', pinned: true },
  { id: 'cnv_2b91', title: 'Consectetur adipiscing elit', updatedAt: '2026-11-08T18:02:00Z', pinned: true },
  { id: 'cnv_c044', title: 'Sed do eiusmod tempor', updatedAt: '2026-11-07T23:11:00Z' },
  { id: 'cnv_9d12', title: 'Magna aliqua ut enim', updatedAt: '2026-11-07T10:30:00Z' },
  { id: 'cnv_51e0', title: 'Quis nostrud exercitation?', updatedAt: '2026-11-06T16:45:00Z' },
  { id: 'cnv_0aa7', title: 'Incididunt ut labore et dolore', updatedAt: '2026-11-05T09:12:00Z' },
  { id: 'cnv_e3f8', title: 'Ullamco laboris nisi', updatedAt: '2026-11-03T20:01:00Z' },
]

/** A title long enough to force truncation everywhere it appears. */
export const longTitleConversation: Conversation = {
  id: 'cnv_ffff',
  title:
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur, excepteur sint occaecat cupidatat non proident?',
  updatedAt: '2026-11-08T22:00:00Z',
}

export const models = [
  { id: 'claude-opus-5-5', label: 'Opus 5.5', description: 'Most capable' },
  { id: 'claude-sonnet-5-5', label: 'Sonnet 5.5', description: 'Fast and capable' },
  { id: 'claude-haiku-5-5', label: 'Haiku 5.5', description: 'Fastest' },
]
