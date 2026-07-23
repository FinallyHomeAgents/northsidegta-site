import { expect, test } from '@playwright/test'

const slugs = ['georgina','east-gwillimbury','newmarket','aurora','stouffville','uxbridge','scugog']

test.describe('community pages render safely', () => {
  for (const slug of slugs) {
    test(`${slug} has stable rendered shell with no console or overflow`, async ({ page }) => {
      const problems: string[] = []
      page.on('console', (msg) => {
        if (['error', 'warning'].includes(msg.type()) && /hydration|did not match|error/i.test(msg.text())) {
          problems.push(msg.text())
        }
      })
      page.on('pageerror', (err) => problems.push(err.message))

      await page.goto(`/communities/${slug}`, { waitUntil: 'networkidle' })
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.locator('.page-grid')).toHaveCount(1)
      await expect(page.locator('header')).toHaveCount(1)
      await expect(page.locator('footer')).toHaveCount(1)
      const breadcrumbCount = await page.evaluate(() => {
        const collectNodes = (value: unknown): unknown[] => {
          if (!value || typeof value !== 'object') return []
          const node = value as Record<string, unknown>
          const graph = Array.isArray(node['@graph']) ? node['@graph'] : []
          return [node, ...graph]
        }

        return Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
          .flatMap((script) => {
            try {
              return collectNodes(JSON.parse(script.textContent || '{}'))
            } catch {
              return []
            }
          })
          .filter((node) => {
            if (!node || typeof node !== 'object') return false
            const type = (node as Record<string, unknown>)['@type']
            return type === 'BreadcrumbList' || (Array.isArray(type) && type.includes('BreadcrumbList'))
          }).length
      })
      expect(breadcrumbCount).toBe(1)
      expect(problems).toEqual([])

      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 900 })
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
        expect(overflow).toBe(false)
      }
    })
  }
})
