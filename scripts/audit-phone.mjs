// Opens every story at phone widths in a touch browser and reports: horizontal overflow, tap targets
// under 24px (WCAG 2.5.8), and axe WCAG A/AA violations. Needs Storybook running: `pnpm storybook`.
// Usage: pnpm audit:phone [story-id-substring]
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'

const BASE = process.env.STORYBOOK_URL ?? 'http://127.0.0.1:6206'
const WIDTHS = [320, 390]
const TABS = 6
const only = process.argv[2]

// Findings that were checked by hand and are not problems. Key: story id prefix. Value: axe rule ids.
const KNOWN = {
  // Grid cells are focus stops for arrow keys, not tap targets; the row's buttons are what gets tapped
  'components-data-display-table--': ['target-size'],
}

const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')
const index = await (await fetch(`${BASE}/index.json`)).json()
const stories = Object.values(index.entries).filter((e) => e.type === 'story' && (!only || e.id.includes(only)))

/** Runs in the page. Returns elements wider than the viewport and tap targets under 24px. */
function measure() {
  const vw = window.innerWidth
  const insideScroller = (el) => {
    for (let a = el.parentElement; a; a = a.parentElement) if (getComputedStyle(a).overflowX !== 'visible') return true
    return false
  }
  const name = (el) => `${el.tagName.toLowerCase()}[${el.getAttribute('aria-label') || el.textContent.trim().slice(0, 24) || el.getAttribute('type')}]`
  const wide = [...document.querySelectorAll('body *')]
    .filter((el) => {
      const r = el.getBoundingClientRect()
      return r.width > 0 && (r.right > vw + 1 || r.left < -1) && !insideScroller(el) && getComputedStyle(el).position !== 'fixed'
    })
    .slice(0, 3)
    .map(name)
  const targets = 'button, a[href], input:not([type=hidden]), [role=button], [role=tab], [role=switch], [role=checkbox], [role=radio], [role=option], [role=menuitem]'
  const small = [...document.querySelectorAll(targets)]
    .filter((el) => {
      const r = el.getBoundingClientRect()
      // Screen-reader-only controls (react-aria's hidden dismiss buttons and the inputs behind custom thumbs) are not tapped
      if (r.width < 2 || el.matches('input[type=range]') || el.closest('[aria-hidden=true]')) return false
      if (getComputedStyle(el).visibility === 'hidden') return false
      // The hit area can be larger than the box: a wrapping label, or an ::after that extends it
      const label = el.closest('label')?.getBoundingClientRect() ?? r
      const after = getComputedStyle(el, '::after')
      const extra = after.content !== 'none' && after.position === 'absolute' ? 2 * Math.abs(parseFloat(after.top) || 0) : 0
      return Math.max(r.height, label.height) + extra < 24 || Math.max(r.width, label.width) + extra < 24
    })
    .slice(0, 3)
    .map((el) => {
      const r = el.getBoundingClientRect()
      return `${name(el)} ${Math.round(r.width)}x${Math.round(r.height)}`
    })
  return { scrolls: document.documentElement.scrollWidth > vw + 1, wide, small }
}

const browser = await chromium.launch()
let findings = 0
for (const width of WIDTHS) {
  const context = await browser.newContext({ viewport: { width, height: 800 }, hasTouch: true, isMobile: true })
  // Several tabs share the list; one at a time takes minutes
  const queue = [...stories]
  const worker = async () => {
    const page = await context.newPage()
    for (let story = queue.shift(); story; story = queue.shift()) await check(page, story, width)
  }
  await Promise.all(Array.from({ length: TABS }, worker))
  await context.close()
}

async function check(page, story, width) {
  {
    await page.goto(`${BASE}/iframe.html?viewMode=story&id=${story.id}`, { waitUntil: 'load' })
    await page.waitForSelector('#storybook-root > *', { timeout: 4000 }).catch(() => {})
    // Let enter animations finish; a half-faded popover reads as low contrast
    await page.waitForTimeout(600)
    const { scrolls, wide, small } = await page.evaluate(measure)
    const problems = []
    if (scrolls) problems.push('page scrolls sideways')
    if (wide.length) problems.push(`wider than the screen: ${wide.join(', ')}`)
    if (small.length) problems.push(`small tap targets: ${small.join(', ')}`)
    // axe once per story is enough; its rules do not depend on which phone width
    if (width === WIDTHS.at(-1)) {
      await page.evaluate(axeSource)
      const runAxe = () =>
        page.evaluate(async () => {
          const result = await window.axe.run(document.body, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] })
          return result.violations.map((v) => ({ id: v.id, count: v.nodes.length, html: v.nodes[0].html.slice(0, 100) }))
        })
      let violations = await runAxe()
      if (violations.length) {
        // A story whose play function was still opening an overlay: look again once it has settled
        await page.waitForTimeout(2000)
        violations = await runAxe()
      }
      const known = Object.entries(KNOWN).flatMap(([prefix, rules]) => (story.id.startsWith(prefix) ? rules : []))
      for (const v of violations) if (!known.includes(v.id)) problems.push(`axe ${v.id} x${v.count}: ${v.html}`)
    }
    if (problems.length) {
      findings++
      console.log(`${width}px ${story.id}`)
      for (const problem of problems) console.log(`  ${problem}`)
    }
  }
}
await browser.close()
console.log(`${stories.length} stories at ${WIDTHS.join(' and ')}px: ${findings ? `${findings} with problems` : 'no problems'}`)
process.exit(findings ? 1 : 0)
