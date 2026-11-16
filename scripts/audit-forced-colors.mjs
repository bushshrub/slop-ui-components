// Opens every story in forced-colors mode (Windows High Contrast), tabs through the first few focus stops and reports
// any focused element with no visible outline: box-shadow rings are not painted there. Needs Storybook running, or
// built (`pnpm build-storybook`) and served; set STORYBOOK_URL for a non-default address.
// Usage: pnpm audit:forced-colors [story-id-substring]
import { chromium } from 'playwright'

const BASE = process.env.STORYBOOK_URL ?? 'http://127.0.0.1:6206'
const STOPS = 6
const TABS = 6
const only = process.argv[2]

// Findings that were checked by hand and are not problems. Key: story id prefix. Value: focused element names.
const KNOWN = {}

const index = await (await fetch(`${BASE}/index.json`)).json()
const stories = Object.values(index.entries).filter((e) => e.type === 'story' && (!only || e.id.includes(only)))

/** Runs in the page. Describes the focused element, and whether it or its nearest [data-focus-visible] ancestor has an outline. */
function inspectFocus() {
  const el = document.activeElement
  if (!el || el === document.body || el === document.documentElement) return null
  const outlined = (node) => {
    const s = getComputedStyle(node)
    return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0
  }
  const holder = el.closest('[data-focus-visible]')
  const r = el.getBoundingClientRect()
  return {
    name: `${el.tagName.toLowerCase()}[${el.getAttribute('aria-label') || el.textContent.trim().slice(0, 24) || el.getAttribute('type') || el.getAttribute('role') || ''}]`,
    ok: outlined(el) || (holder != null && outlined(holder)),
    // Not painted at all (screen-reader-only stops): a different problem from a missing outline
    hidden: r.width === 0 || r.height === 0 || el.closest('[aria-hidden=true]') != null,
  }
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1000, height: 800 }, forcedColors: 'active' })
let findings = 0

async function check(page, story) {
  await page.goto(`${BASE}/iframe.html?viewMode=story&id=${story.id}`, { waitUntil: 'load' })
  await page.waitForSelector('#storybook-root > *', { timeout: 4000 }).catch(() => {})
  await page.waitForTimeout(600)
  const known = Object.entries(KNOWN).flatMap(([prefix, names]) => (story.id.startsWith(prefix) ? names : []))
  const problems = new Set()
  for (let i = 0; i < STOPS; i++) {
    await page.keyboard.press('Tab')
    const focus = await page.evaluate(inspectFocus)
    if (focus && !focus.ok && !focus.hidden && !known.includes(focus.name)) problems.add(focus.name)
  }
  if (problems.size) {
    findings++
    console.log(story.id)
    for (const name of problems) console.log(`  no visible focus outline: ${name}`)
  }
}

// Several tabs share the list; one at a time takes minutes
const queue = [...stories]
const worker = async () => {
  const page = await context.newPage()
  for (let story = queue.shift(); story; story = queue.shift()) await check(page, story)
}
await Promise.all(Array.from({ length: TABS }, worker))
await browser.close()
console.log(`${stories.length} stories in forced colors: ${findings ? `${findings} with problems` : 'no problems'}`)
process.exit(findings ? 1 : 0)
