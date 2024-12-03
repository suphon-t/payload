import type { Page } from '@playwright/test'

import { expect, test } from '@playwright/test'
import * as path from 'path'
import { fileURLToPath } from 'url'

import { ensureCompilationIsDone, initPageConsoleErrorCatch, saveDocAndAssert } from '../helpers.js'
import { AdminUrlUtil } from '../helpers/adminUrlUtil.js'
import { initPayloadE2ENoConfig } from '../helpers/initPayloadE2ENoConfig.js'
import { TEST_TIMEOUT_LONG } from '../playwright.config.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

test.describe('Admin Panel', () => {
  let page: Page
  let url: AdminUrlUtil

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(TEST_TIMEOUT_LONG)

    const { payload, serverURL } = await initPayloadE2ENoConfig({ dirname })
    url = new AdminUrlUtil(serverURL, 'posts')

    const context = await browser.newContext()
    page = await context.newPage()
    initPageConsoleErrorCatch(page)
    await ensureCompilationIsDone({ page, serverURL })
  })

  test('create page -> save draft', async () => {
    await page.goto(url.create)

    await page.getByLabel('Title').fill('new post')
    await saveDocAndAssert(page, '#action-save-draft')

    const slugField = page.getByLabel('Slug')
    await expect(slugField).toHaveValue('new-post')
  })

  test('create page -> publish', async () => {
    await page.goto(url.create)

    await page.getByLabel('Title').fill('new post')
    await saveDocAndAssert(page, '#action-save')

    const slugField = page.getByLabel('Slug')
    await expect(slugField).toHaveValue('new-post')
  })

  test('edit page -> save draft', async () => {
    await page.goto(url.create)
    // create an empty document
    await page.getByLabel('Title').fill('old title')
    await saveDocAndAssert(page, '#action-save-draft')

    const slugField = page.getByLabel('Slug')
    await expect(slugField).toHaveValue('old-title')

    // fill the title field and save
    const titleField = page.getByLabel('Title')
    await titleField.fill('new title')
    await saveDocAndAssert(page, '#action-save-draft')

    // slug should be populated by the beforeChange hook
    await expect(slugField).toHaveValue('new-title')
  })

  test('edit page -> publish', async () => {
    await page.goto(url.create)
    // create an empty document
    await page.getByLabel('Title').fill('old title')
    await saveDocAndAssert(page, '#action-save')

    const slugField = page.getByLabel('Slug')
    await expect(slugField).toHaveValue('old-title')

    // fill the title field and save
    const titleField = page.getByLabel('Title')
    await titleField.fill('new title')
    await saveDocAndAssert(page, '#action-save')

    // slug should be populated by the beforeChange hook
    await expect(slugField).toHaveValue('new-title')
  })
})
