// Opens every story, then doubles the root font size (as a user raising the browser's default text size to 200%,
// WCAG 1.4.4) and reports: text that did not grow (a px font size), controls that did not grow (a px height), and
// text cut off by a box that does not scroll. Needs Storybook running: `pnpm storybook`.
// Usage: pnpm audit:text-size [story-id-substring]
import { chromium } from 'playwright'

const BASE = process.env.STORYBOOK_URL ?? 'http://127.0.0.1:6206'
const TABS = 6
const only = process.argv[2]

// Findings that were checked by hand and are not problems. Key: story id prefix. Value: finding kinds.
const KNOWN = {}

const index = await (await fetch(`${BASE}/index.json`)).json()
const stories = Object.values(index.entries).filter((e) => e.type === 'story' && (!only || e.id.includes(only)))

/** Runs in the page. Font size and height of every visible element, in document order. */
function snapshot() {
  return [...document.querySelectorAll('#storybook-root *')].map((el) => {
    const r = el.getBoundingClientRect()
    return { font: parseFloat(getComputedStyle(el).fontSize), height: r.height, overflow: el.scrollHeight - el.clientHeight, visible: r.width > 0 && r.height > 0 }
  })
}

/** Runs in the page after scaling. Compares with the 100% snapshot. */
function compare(before) {
  const els = [...document.querySelectorAll('#storybook-root *')]
  const name = (el) => `${el.tagName.toLowerCase()}[${el.getAttribute('aria-label') || el.textContent.trim().slice(0, 24) || el.className.toString().slice(0, 24)}]`
  const hasText = (el) => [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim())
  const controls = 'button, input:not([type=hidden]):not([type=range]):not([type=checkbox]):not([type=radio]), [role=tab], [role=menuitem], [role=option], select, textarea'
  const fixedText = []
  const fixedControls = []
  const clipped = []
  els.forEach((el, i) => {
    const was = before[i]
    if (!was?.visible || el.closest('[aria-hidden=true]')) return
    if (hasText(el) && getComputedStyle(el).fontSize && parseFloat(getComputedStyle(el).fontSize) < was.font * 1.9) fixedText.push(name(el))
    const r = el.getBoundingClientRect()
    if (el.matches(controls) && r.height < was.height * 1.5) fixedControls.push(`${name(el)} ${Math.round(was.height)}→${Math.round(r.height)}px`)
    // Cut-off text: content taller than a box that hides overflow instead of scrolling. Single-line truncation
    // (an ellipsis) is by design, so only vertical clipping counts. Glyphs that poke a pixel or two past a tight line
    // box do so at 100% too and just scale up; what counts is overflow beyond twice what it was (a box that didn't grow).
    const style = getComputedStyle(el)
    // Screen-reader-only text is a clipped 1px box on purpose
    const srOnly = r.width <= 1 || r.height <= 1
    if (!srOnly && hasText(el) && (style.overflowY === 'hidden' || style.overflowY === 'clip') && el.scrollHeight - el.clientHeight > Math.max(0, was.overflow) * 2 + 2) clipped.push(name(el))
  })
  return { fixedText: fixedText.slice(0, 3), fixedControls: fixedControls.slice(0, 3), clipped: clipped.slice(0, 3) }
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
let findings = 0
const queue = [...stories]
const worker = async () => {
  const page = await context.newPage()
  for (let story = queue.shift(); story; story = queue.shift()) await check(page, story)
}
await Promise.all(Array.from({ length: TABS }, worker))
await browser.close()
console.log(`${stories.length} stories at 200% text: ${findings ? `${findings} with problems` : 'no problems'}`)
process.exit(findings ? 1 : 0)

async function check(page, story) {
  await page.goto(`${BASE}/iframe.html?viewMode=story&id=${story.id}`, { waitUntil: 'load' })
  await page.waitForSelector('#storybook-root > *', { timeout: 4000 }).catch(() => {})
  // Let play functions open their overlays before the first snapshot
  await page.waitForTimeout(800)
  const before = await page.evaluate(snapshot)
  await page.evaluate(() => (document.documentElement.style.fontSize = '200%'))
  await page.waitForTimeout(300)
  const { fixedText, fixedControls, clipped } = await page.evaluate(compare, before)
  const known = Object.entries(KNOWN).flatMap(([prefix, kinds]) => (story.id.startsWith(prefix) ? kinds : []))
  const problems = []
  if (fixedText.length && !known.includes('text')) problems.push(`text did not grow: ${fixedText.join(', ')}`)
  if (fixedControls.length && !known.includes('controls')) problems.push(`controls did not grow: ${fixedControls.join(', ')}`)
  if (clipped.length && !known.includes('clipped')) problems.push(`text cut off: ${clipped.join(', ')}`)
  if (problems.length) {
    findings++
    console.log(story.id)
    for (const problem of problems) console.log(`  ${problem}`)
  }
}
