import { test, expect } from '@playwright/test'

const stories = [
  'pages-mainpage--all-sections',
  'pages-mainpage--empty-state',
  'pages-mainpage--only-pending',
  'pages-mainpage--many-tasks',
  'todos-taskinput--default',
  'todos-taskinput--with-value',
  'todos-tasklist--all-sections',
  'todos-tasklist--many-tasks',
]

for (const storyId of stories) {
  test(`visual: ${storyId}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`)
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot(`${storyId}.png`)
  })
}
